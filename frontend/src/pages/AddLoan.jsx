import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:5000/api'

const INITIAL_FORM = {
  loan_name: '',
  lender_name: '',
  loan_type: 'Personal Loan',
  principal_amount: '',
  interest_rate: '',
  tenure_months: '',
  start_date: '',
}

function formatCurrency(value) {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function calculateEMI(
  principal,
  annualRate,
  tenureMonths,
) {
  if (
    principal <= 0 ||
    annualRate < 0 ||
    tenureMonths <= 0
  ) {
    return 0
  }

  const monthlyRate =
    annualRate / 12 / 100

  if (monthlyRate === 0) {
    return principal / tenureMonths
  }

  const emi =
    principal *
    monthlyRate *
    Math.pow(
      1 + monthlyRate,
      tenureMonths,
    ) /
    (Math.pow(
      1 + monthlyRate,
      tenureMonths,
    ) - 1)

  return emi
}

function FieldLabel({
  children,
  required = false,
}) {
  return (
    <label className="mb-2 block text-sm font-semibold text-slate-700">
      {children}

      {required && (
        <span className="ml-1 text-red-500">
          *
        </span>
      )}
    </label>
  )
}

function AddLoan() {
  const [formData, setFormData] =
    useState(INITIAL_FORM)

  const [loading, setLoading] =
    useState(false)

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  const emiPreview = useMemo(() => {
    const principal = Number(
      formData.principal_amount,
    )

    const rate = Number(
      formData.interest_rate,
    )

    const tenure = Number(
      formData.tenure_months,
    )

    const emi = calculateEMI(
      principal,
      rate,
      tenure,
    )

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
    formData.principal_amount,
    formData.interest_rate,
    formData.tenure_months,
  ])

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }))

    setMessage('')
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    try {
      if (
        !formData.loan_name.trim()
      ) {
        throw new Error(
          'Please enter a loan name.',
        )
      }

      if (
        !formData.lender_name.trim()
      ) {
        throw new Error(
          'Please enter the lender or bank name.',
        )
      }

      if (
        Number(
          formData.principal_amount,
        ) <= 0
      ) {
        throw new Error(
          'Loan amount must be greater than zero.',
        )
      }

      if (
        Number(
          formData.interest_rate,
        ) < 0
      ) {
        throw new Error(
          'Interest rate cannot be negative.',
        )
      }

      if (
        Number(
          formData.tenure_months,
        ) <= 0
      ) {
        throw new Error(
          'Tenure must be greater than zero.',
        )
      }

      const response = await fetch(
        `${API_BASE_URL}/loans`,
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            loan_name:
              formData.loan_name.trim(),

            lender_name:
              formData.lender_name.trim(),

            loan_type:
              formData.loan_type,

            principal_amount:
              Number(
                formData.principal_amount,
              ),

            interest_rate:
              Number(
                formData.interest_rate,
              ),

            tenure_months:
              Number(
                formData.tenure_months,
              ),

            start_date:
              formData.start_date ||
              null,
          }),
        },
      )

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
            'Unable to create loan.',
        )
      }

      setMessage(
        'Loan added successfully. Your EMI schedule has been created.',
      )

      setFormData({
        ...INITIAL_FORM,
      })
    } catch (err) {
      setError(
        err.message ||
          'Unable to create loan.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-slate-50 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-7">
          <div className="mb-3">
            <Link
              to="/my-loans"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
            >
              <span>←</span>
              Back to My Loans
            </Link>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Loan Management
              </p>

              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                Add New Loan
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Add your loan details to let
                SmartEMI create and manage your
                complete repayment schedule.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs font-medium text-slate-400">
                SmartEMI
              </p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                Loan Management
              </p>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* Form Header */}
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                    ₹
                  </div>

                  <div>
                    <h2 className="font-bold text-slate-900">
                      Loan Information
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                      Enter the details provided by
                      your lender.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="p-5 sm:p-7"
              >

                {/* Basic Details */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Basic Details
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Identify the loan and lender.
                  </p>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-2">

                  <div>
                    <FieldLabel required>
                      Loan Name
                    </FieldLabel>

                    <input
                      type="text"
                      name="loan_name"
                      value={
                        formData.loan_name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Home Loan"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <FieldLabel required>
                      Lender / Bank Name
                    </FieldLabel>

                    <input
                      type="text"
                      name="lender_name"
                      value={
                        formData.lender_name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. HDFC Bank"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                  <div>
                    <FieldLabel required>
                      Loan Type
                    </FieldLabel>

                    <select
                      name="loan_type"
                      value={
                        formData.loan_type
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    >
                      <option>
                        Personal Loan
                      </option>

                      <option>
                        Home Loan
                      </option>

                      <option>
                        Car Loan
                      </option>

                      <option>
                        Education Loan
                      </option>

                      <option>
                        Business Loan
                      </option>

                      <option>
                        Gold Loan
                      </option>

                      <option>
                        Other
                      </option>
                    </select>
                  </div>

                  <div>
                    <FieldLabel>
                      Loan Start Date
                    </FieldLabel>

                    <input
                      type="date"
                      name="start_date"
                      value={
                        formData.start_date
                      }
                      onChange={
                        handleChange
                      }
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-slate-100"
                    />
                  </div>

                </div>

                {/* Financial Details */}
                <div className="mt-8 border-t border-slate-100 pt-7">
                  <h3 className="text-sm font-bold text-slate-900">
                    Financial Details
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Enter the principal, interest
                    rate and repayment tenure.
                  </p>
                </div>

                <div className="mt-5 grid gap-5 md:grid-cols-3">

                  <div>
                    <FieldLabel required>
                      Loan Amount
                    </FieldLabel>

                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                        ₹
                      </span>

                      <input
                        type="number"
                        name="principal_amount"
                        value={
                          formData.principal_amount
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

                  <div>
                    <FieldLabel required>
                      Interest Rate
                    </FieldLabel>

                    <div className="relative">
                      <input
                        type="number"
                        name="interest_rate"
                        value={
                          formData.interest_rate
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

                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Annual interest rate
                    </p>
                  </div>

                  <div>
                    <FieldLabel required>
                      Tenure
                    </FieldLabel>

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

                {/* Messages */}
                {error && (
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <span className="font-bold">
                      !
                    </span>

                    <div>
                      <p className="font-semibold">
                        Unable to add loan
                      </p>

                      <p className="mt-0.5">
                        {error}
                      </p>
                    </div>
                  </div>
                )}

                {message && (
                  <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    <span className="font-bold">
                      ✓
                    </span>

                    <div>
                      <p className="font-semibold">
                        Loan added successfully
                      </p>

                      <p className="mt-0.5">
                        {message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-xs text-slate-400">
                    Fields marked with{' '}
                    <span className="text-red-500">
                      *
                    </span>{' '}
                    are required.
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">

                    <Link
                      to="/my-loans"
                      className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      Cancel
                    </Link>

                    <button
                      type="submit"
                      disabled={loading}
                      className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Adding Loan...
                        </span>
                      ) : (
                        'Add Loan'
                      )}
                    </button>

                  </div>
                </div>

              </form>
            </div>
          </div>

          {/* EMI Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-5">

              <div className="overflow-hidden rounded-2xl bg-slate-900 text-white shadow-lg">
                <div className="border-b border-white/10 px-5 py-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Live Preview
                  </p>

                  <h2 className="mt-1 text-lg font-bold">
                    Estimated EMI
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Calculated from the loan details
                    you enter.
                  </p>
                </div>

                <div className="p-5">

                  <div className="rounded-xl bg-white/10 p-4">
                    <p className="text-xs text-slate-400">
                      Monthly EMI
                    </p>

                    <p className="mt-2 text-3xl font-bold">
                      {emiPreview.emi > 0
                        ? formatCurrency(
                            emiPreview.emi,
                          )
                        : '₹0'}
                    </p>
                  </div>

                  <div className="mt-4 space-y-3">

                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-xs text-slate-400">
                        Loan Amount
                      </span>

                      <span className="text-sm font-semibold">
                        {formatCurrency(
                          formData.principal_amount,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <span className="text-xs text-slate-400">
                        Total Interest
                      </span>

                      <span className="text-sm font-semibold">
                        {formatCurrency(
                          emiPreview.totalInterest,
                        )}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        Total Payment
                      </span>

                      <span className="text-sm font-semibold">
                        {formatCurrency(
                          emiPreview.totalPayment,
                        )}
                      </span>
                    </div>

                  </div>
                </div>
              </div>

              {/* Information Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm text-blue-600">
                    i
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Before you add
                    </h3>

                    <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-500">
                      <li>
                        • Use the principal amount
                        from your loan documents.
                      </li>

                      <li>
                        • Enter the annual interest
                        rate provided by your lender.
                      </li>

                      <li>
                        • Tenure should be entered
                        in months.
                      </li>

                      <li>
                        • SmartEMI will create the
                        EMI schedule automatically.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Security / Privacy */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    🔒
                  </span>

                  <p className="text-xs font-semibold text-slate-700">
                    Your loan data
                  </p>
                </div>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  Loan information is associated
                  with your SmartEMI account and is
                  used to calculate and manage your
                  repayment schedule.
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer Disclaimer */}
        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 shadow-sm">
          <span className="font-semibold text-slate-700">
            SmartEMI note:
          </span>{' '}
          The EMI shown in the preview is an
          estimate based on the entered principal,
          annual interest rate and tenure. Actual
          EMI, charges, taxes and lender-specific
          conditions may differ.
        </div>

      </div>
    </div>
  )
}

export default AddLoan