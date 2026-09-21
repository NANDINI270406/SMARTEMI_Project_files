import { useMemo, useState } from 'react'

import {
  calculateEMI,
  generateAmortizationSchedule,
} from '../services/emiService'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatDate(dateString) {
  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    return '—'
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function SummaryCard({
  title,
  value,
  subtitle,
  dark = false,
}) {
  return (
    <div
      className={`rounded-2xl p-5 shadow-sm ${
        dark
          ? 'bg-slate-900 text-white'
          : 'border border-slate-200 bg-white'
      }`}
    >
      <p
        className={`text-xs font-semibold uppercase tracking-wide ${
          dark
            ? 'text-slate-400'
            : 'text-slate-500'
        }`}
      >
        {title}
      </p>

      <p
        className={`mt-2 text-2xl font-bold tracking-tight ${
          dark
            ? 'text-white'
            : 'text-slate-900'
        }`}
      >
        {value}
      </p>

      {subtitle && (
        <p
          className={`mt-1 text-xs ${
            dark
              ? 'text-slate-400'
              : 'text-slate-500'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

function EMICalculator() {
  const [formData, setFormData] = useState({
    principal: '',
    annual_interest_rate: '',
    tenure_months: '',
  })

  const [result, setResult] =
    useState(null)

  const [schedule, setSchedule] =
    useState([])

  const [loading, setLoading] =
    useState(false)

  const [error, setError] =
    useState('')

  const [showAllSchedule, setShowAllSchedule] =
    useState(false)

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError('')
  }

  const handleCalculate = async (event) => {
    event.preventDefault()

    setError('')
    setResult(null)
    setSchedule([])
    setShowAllSchedule(false)

    try {
      setLoading(true)

      const principal =
        Number(formData.principal)

      const annualInterestRate =
        Number(
          formData.annual_interest_rate,
        )

      const tenureMonths =
        Number(formData.tenure_months)

      if (principal <= 0) {
        throw new Error(
          'Loan amount must be greater than zero.',
        )
      }

      if (annualInterestRate < 0) {
        throw new Error(
          'Interest rate cannot be negative.',
        )
      }

      if (tenureMonths <= 0) {
        throw new Error(
          'Tenure must be greater than zero.',
        )
      }

      const loanData = {
        principal,
        annual_interest_rate:
          annualInterestRate,
        tenure_months: tenureMonths,
      }

      const emiResponse =
        await calculateEMI(loanData)

      const scheduleResponse =
        await generateAmortizationSchedule({
          ...loanData,
          start_date:
            new Date()
              .toISOString()
              .split('T')[0],
        })

      setResult(
        emiResponse.data,
      )

      setSchedule(
        scheduleResponse.data.schedule,
      )
    } catch (err) {
      setError(
        err.message ||
          'Unable to calculate EMI.',
      )
    } finally {
      setLoading(false)
    }
  }

  const displayedSchedule = useMemo(() => {
    if (showAllSchedule) {
      return schedule
    }

    return schedule.slice(0, 12)
  }, [
    schedule,
    showAllSchedule,
  ])

  const preview = useMemo(() => {
    const principal =
      Number(formData.principal)

    const rate =
      Number(
        formData.annual_interest_rate,
      )

    const tenure =
      Number(formData.tenure_months)

    if (
      principal <= 0 ||
      rate < 0 ||
      tenure <= 0
    ) {
      return null
    }

    const monthlyRate =
      rate / 12 / 100

    let emi

    if (monthlyRate === 0) {
      emi =
        principal / tenure
    } else {
      emi =
        principal *
        monthlyRate *
        Math.pow(
          1 + monthlyRate,
          tenure,
        ) /
        (Math.pow(
          1 + monthlyRate,
          tenure,
        ) - 1)
    }

    const totalPayment =
      emi * tenure

    const totalInterest =
      totalPayment - principal

    return {
      emi,
      totalPayment,
      totalInterest,
    }
  }, [
    formData.principal,
    formData.annual_interest_rate,
    formData.tenure_months,
  ])

  const resetCalculator = () => {
    setFormData({
      principal: '',
      annual_interest_rate: '',
      tenure_months: '',
    })

    setResult(null)
    setSchedule([])
    setError('')
    setShowAllSchedule(false)
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-7">
          <p className="text-sm font-semibold text-slate-500">
            Financial Planning
          </p>

          <div className="mt-1 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                EMI Calculator
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Calculate your monthly EMI,
                understand the interest cost, and
                view the complete repayment schedule.
              </p>
            </div>

            {result && (
              <button
                type="button"
                onClick={resetCalculator}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Start New Calculation
              </button>
            )}
          </div>
        </div>

        {/* Main Calculator */}
        <div className="grid gap-6 lg:grid-cols-3">

          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                    ₹
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Loan Details
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Enter your loan information.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleCalculate}
                className="p-5"
              >

                <div className="space-y-5">

                  {/* Principal */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Loan Amount
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="principal"
                        value={
                          formData.principal
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="500000"
                        min="1"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-9 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                      />
                    </div>
                  </div>

                  {/* Interest */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Annual Interest Rate
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        name="annual_interest_rate"
                        value={
                          formData.annual_interest_rate
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="10"
                        min="0"
                        step="0.01"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        %
                      </span>
                    </div>
                  </div>

                  {/* Tenure */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Tenure
                      <span className="ml-1 text-red-500">
                        *
                      </span>
                    </label>

                    <div className="relative">
                      <input
                        type="number"
                        name="tenure_months"
                        value={
                          formData.tenure_months
                        }
                        onChange={
                          handleChange
                        }
                        placeholder="60"
                        min="1"
                        required
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-20 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                      />

                      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                        Months
                      </span>
                    </div>
                  </div>

                </div>

                {/* Error */}
                {error && (
                  <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <div className="flex items-start gap-3">
                      <span className="font-bold">
                        !
                      </span>

                      <div>
                        <p className="font-semibold">
                          Calculation failed
                        </p>

                        <p className="mt-1">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Calculating...
                    </>
                  ) : (
                    'Calculate EMI'
                  )}
                </button>

                {/* Live Preview */}
                {preview && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Live Estimate
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {formatCurrency(
                        preview.emi,
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Estimated monthly EMI
                    </p>
                  </div>
                )}

              </form>
            </div>

            {/* Info Card */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-600">
                  i
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    How EMI is calculated
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    EMI depends on the principal
                    amount, annual interest rate and
                    repayment tenure. SmartEMI also
                    generates a month-by-month
                    amortization schedule.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-2">

            {!result ? (
              <div className="flex min-h-[430px] items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <div className="max-w-sm">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-bold text-slate-700">
                    ₹
                  </div>

                  <h2 className="mt-5 text-xl font-bold text-slate-900">
                    Your EMI Results
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter your loan details and
                    calculate your EMI to see a
                    complete financial breakdown.
                  </p>

                  <div className="mt-6 grid grid-cols-3 gap-3 text-left">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">
                        EMI
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        Monthly
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Interest
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        Total
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold text-slate-400">
                        Schedule
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        Monthly
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            ) : (
              <div className="space-y-5">

                {/* Result Header */}
                <div className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg">
                  <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Calculation Result
                      </p>

                      <p className="mt-2 text-sm text-slate-300">
                        Estimated monthly EMI
                      </p>

                      <p className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
                        {formatCurrency(
                          result.monthly_emi,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white/10 px-4 py-3">
                      <p className="text-xs text-slate-400">
                        Tenure
                      </p>

                      <p className="mt-1 text-lg font-bold">
                        {result.tenure_months}{' '}
                        months
                      </p>
                    </div>

                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <SummaryCard
                    title="Loan Amount"
                    value={formatCurrency(
                      result.principal,
                    )}
                    subtitle="Principal borrowed"
                  />

                  <SummaryCard
                    title="Total Interest"
                    value={formatCurrency(
                      result.total_interest,
                    )}
                    subtitle="Interest payable"
                  />

                  <SummaryCard
                    title="Total Payment"
                    value={formatCurrency(
                      result.total_payment,
                    )}
                    subtitle="Principal + interest"
                  />

                  <SummaryCard
                    title="Interest Rate"
                    value={`${result.annual_interest_rate}%`}
                    subtitle="Annual rate"
                  />
                </div>

                {/* Loan Summary */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-slate-900">
                        Loan Summary
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Key details of this calculation.
                      </p>
                    </div>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {schedule.length}{' '}
                      Installments
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-3">

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Monthly EMI
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {formatCurrency(
                          result.monthly_emi,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Interest Cost
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {formatCurrency(
                          result.total_interest,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-500">
                        Repayment Period
                      </p>

                      <p className="mt-1 font-bold text-slate-900">
                        {result.tenure_months}{' '}
                        months
                      </p>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* Amortization Schedule */}
        {schedule.length > 0 && (
          <div className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Repayment Plan
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-900">
                    Amortization Schedule
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Month-by-month principal,
                    interest and remaining balance.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600">
                    {schedule.length}{' '}
                    Installments
                  </span>
                </div>

              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">

                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">
                      #
                    </th>

                    <th className="px-5 py-4">
                      Due Date
                    </th>

                    <th className="px-5 py-4">
                      EMI
                    </th>

                    <th className="px-5 py-4">
                      Principal
                    </th>

                    <th className="px-5 py-4">
                      Interest
                    </th>

                    <th className="px-5 py-4">
                      Remaining
                    </th>

                    <th className="px-5 py-4">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {displayedSchedule.map(
                    (installment) => (
                      <tr
                        key={
                          installment.installment_number
                        }
                        className="transition hover:bg-slate-50"
                      >
                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                          {
                            installment.installment_number
                          }
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatDate(
                            installment.due_date,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                          {formatCurrency(
                            installment.emi_amount,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatCurrency(
                            installment.principal_amount,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                          {formatCurrency(
                            installment.interest_amount,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                          {formatCurrency(
                            installment.remaining_balance,
                          )}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              String(
                                installment.status,
                              ).toLowerCase() ===
                              'paid'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {
                              installment.status
                            }
                          </span>
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* Schedule Controls */}
            {schedule.length > 12 && (
              <div className="border-t border-slate-100 p-5 text-center">
                <button
                  type="button"
                  onClick={() =>
                    setShowAllSchedule(
                      (previous) =>
                        !previous,
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  {showAllSchedule
                    ? 'Show First 12 Installments'
                    : `View All ${schedule.length} Installments`}
                </button>
              </div>
            )}

          </div>
        )}

        {/* Footer Note */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 shadow-sm">
          <span className="font-semibold text-slate-700">
            SmartEMI note:
          </span>{' '}
          EMI calculations are based on the
          principal amount, annual interest rate
          and tenure entered above. Actual lender
          charges, taxes, fees, insurance or other
          applicable costs may differ.
        </div>

      </div>
    </div>
  )
}

export default EMICalculator