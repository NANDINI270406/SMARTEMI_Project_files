import { useState } from 'react'

const API_BASE_URL = '/api'

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function Prepayment() {
  const [formData, setFormData] = useState({
    principal: '',
    annual_interest_rate: '',
    remaining_months: '',
    prepayment_amount: '',
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))

    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setResult(null)

    if (
      !formData.principal ||
      !formData.annual_interest_rate ||
      !formData.remaining_months ||
      !formData.prepayment_amount
    ) {
      setError(
        'Please enter all required loan details.'
      )
      return
    }

    const principal = Number(formData.principal)
    const interestRate = Number(
      formData.annual_interest_rate
    )
    const remainingMonths = Number(
      formData.remaining_months
    )
    const prepaymentAmount = Number(
      formData.prepayment_amount
    )

    if (principal <= 0) {
      setError(
        'Outstanding principal must be greater than zero.'
      )
      return
    }

    if (interestRate < 0) {
      setError(
        'Interest rate cannot be negative.'
      )
      return
    }

    if (remainingMonths <= 0) {
      setError(
        'Remaining tenure must be greater than zero.'
      )
      return
    }

    if (prepaymentAmount <= 0) {
      setError(
        'Prepayment amount must be greater than zero.'
      )
      return
    }

    if (prepaymentAmount >= principal) {
      setError(
        'Prepayment amount must be less than the outstanding principal.'
      )
      return
    }

    try {
      setLoading(true)

      const response = await fetch(
        `${API_BASE_URL}/prepayment/calculate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            principal,
            annual_interest_rate: interestRate,
            remaining_months: remainingMonths,
            prepayment_amount: prepaymentAmount,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ||
            'Unable to calculate prepayment impact.'
        )
      }

      setResult(data.data)
    } catch (err) {
      setError(
        err.message ||
          'Something went wrong while calculating.'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      principal: '',
      annual_interest_rate: '',
      remaining_months: '',
      prepayment_amount: '',
    })

    setResult(null)
    setError('')
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <p className="text-sm font-semibold text-slate-500">
                SmartEMI Intelligence
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Prepayment Calculator
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Estimate how a lump-sum prepayment can
                reduce your remaining loan tenure and
                interest burden.
              </p>
            </div>

            <div className="flex w-fit items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                â‚¹
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  SmartEMI Tool
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-700">
                  Prepayment Analysis
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Form */}
          <div className="lg:col-span-2">

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              <div className="border-b border-slate-100 p-5 sm:p-6">
                <h2 className="text-lg font-bold text-slate-900">
                  Loan Details
                </h2>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Enter your current loan information
                  to calculate the estimated impact.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-5 sm:p-6"
              >

                {/* Principal */}
                <div>
                  <label
                    htmlFor="principal"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Outstanding Principal
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      â‚¹
                    </span>

                    <input
                      id="principal"
                      name="principal"
                      type="number"
                      min="1"
                      step="0.01"
                      value={formData.principal}
                      onChange={handleChange}
                      placeholder="500000"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-8 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <label
                    htmlFor="annual_interest_rate"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Annual Interest Rate
                  </label>

                  <div className="relative">
                    <input
                      id="annual_interest_rate"
                      name="annual_interest_rate"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        formData.annual_interest_rate
                      }
                      onChange={handleChange}
                      placeholder="8.5"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-10 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      %
                    </span>
                  </div>
                </div>

                {/* Remaining Months */}
                <div>
                  <label
                    htmlFor="remaining_months"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Remaining Tenure
                  </label>

                  <div className="relative">
                    <input
                      id="remaining_months"
                      name="remaining_months"
                      type="number"
                      min="1"
                      step="1"
                      value={
                        formData.remaining_months
                      }
                      onChange={handleChange}
                      placeholder="48"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-4 pr-20 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                    />

                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      months
                    </span>
                  </div>
                </div>

                {/* Prepayment */}
                <div>
                  <label
                    htmlFor="prepayment_amount"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Prepayment Amount
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      â‚¹
                    </span>

                    <input
                      id="prepayment_amount"
                      name="prepayment_amount"
                      type="number"
                      min="1"
                      step="0.01"
                      value={
                        formData.prepayment_amount
                      }
                      onChange={handleChange}
                      placeholder="100000"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-8 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-100 disabled:bg-slate-50"
                    />
                  </div>

                  <p className="mt-1.5 text-[11px] leading-5 text-slate-400">
                    Enter an amount smaller than your
                    outstanding principal.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-100 text-xs font-bold text-red-700">
                        !
                      </div>

                      <p className="text-sm leading-5 text-red-700">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-1">

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Calculating...
                      </span>
                    ) : (
                      'Calculate Impact'
                    )}
                  </button>

                  {(result || Object.values(formData).some(Boolean)) && (
                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={loading}
                      className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reset
                    </button>
                  )}

                </div>

              </form>
            </div>

            {/* How It Works */}
            <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                  i
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    How it works
                  </h3>

                  <p className="text-[11px] text-slate-400">
                    What this calculation estimates
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                {[
                  'Your current EMI is kept approximately the same.',
                  'The prepayment reduces your outstanding principal.',
                  'The remaining tenure is recalculated.',
                  'Estimated interest savings are displayed.',
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-start gap-3"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500">
                      {index + 1}
                    </span>

                    <p className="text-xs leading-5 text-slate-600">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

            </div>

          </div>

          {/* Results */}
          <div className="lg:col-span-3">

            {!result ? (
              <div className="flex min-h-[500px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">

                <div className="max-w-md">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                    â‚¹
                  </div>

                  <h2 className="mt-5 text-lg font-bold text-slate-900">
                    Analyze your prepayment
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter your outstanding loan details
                    and prepayment amount to estimate
                    potential interest savings and
                    tenure reduction.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-500">
                      Interest savings
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-500">
                      EMI analysis
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-medium text-slate-500">
                      Tenure reduction
                    </span>
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-5">

                {/* Savings Highlight */}
                <div className="overflow-hidden rounded-2xl bg-slate-900 p-6 text-white shadow-sm">

                  <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />

                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Estimated Savings
                        </p>
                      </div>

                      <p className="mt-2 text-4xl font-bold tracking-tight">
                        {formatCurrency(
                          result.interest_saved
                        )}
                      </p>

                      <p className="mt-2 text-sm text-slate-400">
                        Estimated interest saved through
                        prepayment.
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Prepayment
                      </p>

                      <p className="mt-1 text-sm font-semibold text-white">
                        {formatCurrency(
                          result.prepayment_amount
                        )}
                      </p>
                    </div>

                  </div>

                </div>

                {/* Key Metrics */}
                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Current EMI
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {formatCurrency(
                        result.monthly_emi
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Prepayment
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {formatCurrency(
                        result.prepayment_amount
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Tenure Reduced
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {result.tenure_reduction_months}
                      <span className="ml-1 text-sm font-medium text-slate-500">
                        months
                      </span>
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      New Tenure
                    </p>

                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {result.new_remaining_months}
                      <span className="ml-1 text-sm font-medium text-slate-500">
                        months
                      </span>
                    </p>
                  </div>

                </div>

                {/* Before vs After */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                  <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Before vs After
                      </h2>

                      <p className="mt-1 text-xs text-slate-500">
                        Estimated impact on your remaining loan.
                      </p>
                    </div>

                    <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
                      Estimated
                    </span>
                  </div>

                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[500px] text-left">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="pb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Metric
                          </th>

                          <th className="pb-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Before
                          </th>

                          <th className="pb-3 text-right text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            After
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-4 text-sm text-slate-600">
                            Principal
                          </td>

                          <td className="py-4 text-right text-sm font-medium text-slate-800">
                            {formatCurrency(
                              result.current_principal
                            )}
                          </td>

                          <td className="py-4 text-right text-sm font-bold text-slate-900">
                            {formatCurrency(
                              result.remaining_principal
                            )}
                          </td>
                        </tr>

                        <tr className="border-b border-slate-100">
                          <td className="py-4 text-sm text-slate-600">
                            Remaining Interest
                          </td>

                          <td className="py-4 text-right text-sm font-medium text-slate-800">
                            {formatCurrency(
                              result.current_remaining_interest
                            )}
                          </td>

                          <td className="py-4 text-right text-sm font-bold text-slate-900">
                            {formatCurrency(
                              result.new_remaining_interest
                            )}
                          </td>
                        </tr>

                        <tr>
                          <td className="py-4 text-sm text-slate-600">
                            Remaining Tenure
                          </td>

                          <td className="py-4 text-right text-sm font-medium text-slate-800">
                            {result.original_remaining_months}{' '}
                            months
                          </td>

                          <td className="py-4 text-right text-sm font-bold text-slate-900">
                            {result.new_remaining_months}{' '}
                            months
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Explanation */}
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

                  <h3 className="text-sm font-bold text-slate-900">
                    What this means
                  </h3>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Principal After Prepayment
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatCurrency(
                          result.remaining_principal
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                        Interest After Prepayment
                      </p>

                      <p className="mt-1 text-lg font-bold text-slate-900">
                        {formatCurrency(
                          result.new_remaining_interest
                        )}
                      </p>
                    </div>

                  </div>

                </div>

                {/* Disclaimer */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

                  <div className="flex items-start gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-sm">
                      !
                    </div>

                    <div>
                      <p className="text-sm font-bold text-amber-900">
                        Important
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-800">
                        This is an estimated calculation.
                        Actual savings may vary depending
                        on lender policies, prepayment charges,
                        EMI structure, interest calculation
                        method, and the exact date of prepayment.
                      </p>
                    </div>

                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  )
}

export default Prepayment

