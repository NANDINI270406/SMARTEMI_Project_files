import { useState } from 'react'

const API_BASE_URL = '/api'

const createEmptyLoan = (number) => ({
  name: `Loan ${number}`,
  principal: '',
  annual_interest_rate: '',
  tenure_months: '',
})

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function LoanComparison() {
  const [loans, setLoans] = useState([
    createEmptyLoan(1),
    createEmptyLoan(2),
  ])

  const [comparison, setComparison] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateLoan = (index, field, value) => {
    setLoans((currentLoans) =>
      currentLoans.map((loan, loanIndex) =>
        loanIndex === index
          ? {
              ...loan,
              [field]: value,
            }
          : loan
      )
    )
  }

  const addLoan = () => {
    if (loans.length >= 5) {
      setError(
        'You can compare a maximum of 5 loans.'
      )
      return
    }

    setError('')
    setComparison(null)

    setLoans((currentLoans) => [
      ...currentLoans,
      createEmptyLoan(currentLoans.length + 1),
    ])
  }

  const removeLoan = (index) => {
    if (loans.length <= 2) {
      setError(
        'At least 2 loans are required for comparison.'
      )
      return
    }

    setError('')
    setComparison(null)

    setLoans((currentLoans) =>
      currentLoans
        .filter(
          (_, loanIndex) => loanIndex !== index
        )
        .map((loan, loanIndex) => ({
          ...loan,
          name:
            loan.name.startsWith('Loan ')
              ? `Loan ${loanIndex + 1}`
              : loan.name,
        }))
    )
  }

  const handleCompare = async (event) => {
    event.preventDefault()

    setError('')
    setComparison(null)

    const hasEmptyField = loans.some(
      (loan) =>
        !loan.name.trim() ||
        loan.principal === '' ||
        loan.annual_interest_rate === '' ||
        loan.tenure_months === ''
    )

    if (hasEmptyField) {
      setError(
        'Please complete all loan details before comparing.'
      )
      return
    }

    const hasInvalidValues = loans.some(
      (loan) =>
        Number(loan.principal) <= 0 ||
        Number(loan.annual_interest_rate) < 0 ||
        Number(loan.tenure_months) <= 0
    )

    if (hasInvalidValues) {
      setError(
        'Please enter valid positive values for loan amount and tenure.'
      )
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/loan-comparison/compare`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            loans,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
          'Unable to compare loans.'
        )
      }

      setComparison(data.data)
    } catch (err) {
      setError(
        err.message ||
        'Unable to compare loans right now.'
      )
    } finally {
      setLoading(false)
    }
  }

  const resetComparison = () => {
    setLoans([
      createEmptyLoan(1),
      createEmptyLoan(2),
    ])
    setComparison(null)
    setError('')
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =========================
            HEADER
        ========================== */}

        <div className="mb-8">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-lg bg-indigo-100 px-3 py-1 font-semibold text-indigo-700">
              SmartEMI
            </span>

            <span className="text-slate-400">
              /
            </span>

            <span className="text-slate-500">
              Loan Comparison
            </span>
          </div>

          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Compare Loan Options
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Compare EMI, interest cost, total repayment,
                and tenure across multiple loan options.
              </p>
            </div>

            {comparison && (
              <button
                type="button"
                onClick={resetComparison}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:w-auto"
              >
                New Comparison
              </button>
            )}
          </div>
        </div>

        {/* =========================
            QUICK EXPLANATION
        ========================== */}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">

          <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Step 01
            </p>

            <p className="mt-1 font-semibold text-indigo-950">
              Enter loan details
            </p>

            <p className="mt-1 text-xs leading-5 text-indigo-800">
              Add amount, interest rate, and tenure.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Step 02
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              Calculate comparison
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              SmartEMI calculates each loan consistently.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Step 03
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              Review the numbers
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Compare EMI, interest, and total payment.
            </p>
          </div>

        </div>

        {/* =========================
            LOAN INPUT FORM
        ========================== */}

        <form onSubmit={handleCompare}>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Loan Options
                    </h2>

                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      {loans.length}/5
                    </span>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    Add 2 to 5 loan options for side-by-side analysis.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addLoan}
                  disabled={loans.length >= 5}
                  className="w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                >
                  + Add Loan
                </button>

              </div>
            </div>

            <div className="space-y-4 p-5 sm:p-6">

              {loans.map((loan, index) => (

                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-indigo-200 sm:p-5"
                >

                  {/* Loan Header */}

                  <div className="mb-5 flex items-center justify-between gap-3">

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                        {index + 1}
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          {loan.name || `Loan ${index + 1}`}
                        </h3>

                        <p className="text-xs text-slate-500">
                          Loan option {index + 1}
                        </p>
                      </div>

                    </div>

                    {loans.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeLoan(index)}
                        className="shrink-0 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        Remove
                      </button>
                    )}

                  </div>

                  {/* Fields */}

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Loan Name
                      </label>

                      <input
                        type="text"
                        value={loan.name}
                        onChange={(event) =>
                          updateLoan(
                            index,
                            'name',
                            event.target.value
                          )
                        }
                        placeholder="e.g. Home Loan"
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Loan Amount
                      </label>

                      <div className="relative">
                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                          ₹
                        </span>

                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          value={loan.principal}
                          onChange={(event) =>
                            updateLoan(
                              index,
                              'principal',
                              event.target.value
                            )
                          }
                          placeholder="500000"
                          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-8 pr-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />
                      </div>

                      <p className="mt-1.5 text-xs text-slate-400">
                        Principal amount
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Interest Rate
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={loan.annual_interest_rate}
                          onChange={(event) =>
                            updateLoan(
                              index,
                              'annual_interest_rate',
                              event.target.value
                            )
                          }
                          placeholder="9.5"
                          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-3.5 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />

                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                          %
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs text-slate-400">
                        Annual interest rate
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Tenure
                      </label>

                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={loan.tenure_months}
                          onChange={(event) =>
                            updateLoan(
                              index,
                              'tenure_months',
                              event.target.value
                            )
                          }
                          placeholder="60"
                          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-3.5 pr-16 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                        />

                        <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                          months
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs text-slate-400">
                        Repayment period
                      </p>
                    </div>

                  </div>

                </div>

              ))}

            </div>

            {/* Error */}

            {error && (
              <div className="mx-5 mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 sm:mx-6">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                    !
                  </div>

                  <p className="text-sm leading-5 text-red-700">
                    {error}
                  </p>
                </div>
              </div>
            )}

            {/* Form Footer */}

            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">

                <p className="text-xs leading-5 text-slate-500">
                  Compare up to 5 loan options at a time.
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {loading && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  )}

                  {loading
                    ? 'Comparing Loans...'
                    : 'Compare Loans'}
                </button>

              </div>
            </div>

          </div>

        </form>

        {/* =========================
            RESULTS
        ========================== */}

        {comparison && (
          <div className="mt-8 space-y-6">

            {/* Results Header */}

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <div className="mb-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Comparison Complete
                </div>

                <h2 className="text-2xl font-bold text-slate-900">
                  Comparison Summary
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Review the calculated cost of each loan option.
                </p>
              </div>
            </div>

            {/* Summary Cards */}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

              <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Lowest Monthly EMI
                  </p>

                  <span className="rounded-lg bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600">
                    EMI
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    comparison.summary.lowest_emi
                  )}
                </p>

                <p className="mt-2 text-sm font-medium text-indigo-600">
                  {comparison.summary.lowest_emi_loan}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Lower monthly repayment
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Lowest Total Interest
                  </p>

                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600">
                    Interest
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    comparison.summary.lowest_interest
                  )}
                </p>

                <p className="mt-2 text-sm font-medium text-emerald-600">
                  {comparison.summary.lowest_interest_loan}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Lower calculated interest cost
                </p>
              </div>

              <div className="rounded-2xl border border-violet-100 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    Lowest Total Payment
                  </p>

                  <span className="rounded-lg bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-600">
                    Total
                  </span>
                </div>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    comparison.summary.lowest_total_payment
                  )}
                </p>

                <p className="mt-2 text-sm font-medium text-violet-600">
                  {comparison.summary.lowest_total_payment_loan}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Principal plus calculated interest
                </p>
              </div>

            </div>

            {/* Detailed Comparison */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
                <h2 className="font-semibold text-slate-900">
                  Detailed Comparison
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Side-by-side calculation for every loan option.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[900px] w-full text-left text-sm">

                  <thead className="bg-slate-50">
                    <tr className="border-b border-slate-200">

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Loan
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Amount
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Rate
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Tenure
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Monthly EMI
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Interest
                      </th>

                      <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Total Payment
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {comparison.loans.map(
                      (loan, index) => (
                        <tr
                          key={index}
                          className="transition hover:bg-slate-50"
                        >

                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">

                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-indigo-700">
                                {index + 1}
                              </div>

                              <div>
                                <p className="font-semibold text-slate-900">
                                  {loan.name}
                                </p>

                                <p className="text-xs text-slate-400">
                                  Loan option {index + 1}
                                </p>
                              </div>

                            </div>
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-medium text-slate-700">
                            {formatCurrency(
                              loan.principal
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                            {loan.annual_interest_rate}%
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                            {loan.tenure_months} months
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                            {formatCurrency(
                              loan.monthly_emi
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                            {formatCurrency(
                              loan.total_interest
                            )}
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                            {formatCurrency(
                              loan.total_payment
                            )}
                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>
              </div>

              <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 sm:px-6">
                <p className="text-xs text-slate-500">
                  Scroll horizontally on smaller screens to view all comparison columns.
                </p>
              </div>

            </div>

            {/* Interpretation */}

            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-5 sm:p-6">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-sm font-bold text-indigo-700">
                  i
                </div>

                <div>
                  <h3 className="font-semibold text-indigo-950">
                    How to read this comparison
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-indigo-800">
                    A lower monthly EMI can result from a longer
                    repayment period. Compare the EMI together
                    with total interest and total payment to
                    understand the overall calculated cost of
                    each loan.
                  </p>
                </div>

              </div>

            </div>

            {/* Disclaimer */}

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">
              This comparison is based on mathematical calculations
              using the information entered by the user. Actual loan
              terms may differ because of processing fees, taxes,
              insurance, lender-specific charges, rate changes,
              and other applicable conditions.
            </div>

          </div>
        )}

      </div>
    </div>
  )
}

export default LoanComparison
