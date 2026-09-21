import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:5000'

function formatCurrency(value) {
  const amount = Number(value || 0)

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(value) {
  if (!value) {
    return '—'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getLoanStatus(loan) {
  const status = String(
    loan?.status ||
    loan?.loan_status ||
    ''
  ).toLowerCase()

  if (
    status.includes('completed') ||
    status.includes('closed') ||
    status.includes('paid')
  ) {
    return 'Completed'
  }

  return 'Active'
}

function getLoanProgress(loan) {
  const directProgress =
    loan?.progress ??
    loan?.repayment_progress ??
    loan?.payment_progress

  if (
    directProgress !== undefined &&
    directProgress !== null
  ) {
    const numericProgress =
      Number(directProgress)

    if (!Number.isNaN(numericProgress)) {
      return Math.min(
        100,
        Math.max(
          0,
          numericProgress
        )
      )
    }
  }

  const principal =
    Number(
      loan?.principal_amount ??
      loan?.principal ??
      loan?.loan_amount ??
      0
    )

  const outstanding =
    Number(
      loan?.outstanding_principal ??
      loan?.outstanding_amount ??
      loan?.remaining_principal ??
      0
    )

  if (principal > 0) {
    return Math.min(
      100,
      Math.max(
        0,
        ((principal - outstanding) /
          principal) *
          100
      )
    )
  }

  return 0
}

function getLoanName(loan) {
  return (
    loan?.loan_name ||
    loan?.name ||
    loan?.loan_type ||
    'Untitled Loan'
  )
}

function getPrincipal(loan) {
  return Number(
    loan?.principal_amount ??
    loan?.principal ??
    loan?.loan_amount ??
    0
  )
}

function getOutstanding(loan) {
  return Number(
    loan?.outstanding_principal ??
    loan?.outstanding_amount ??
    loan?.remaining_principal ??
    0
  )
}

function getMonthlyEMI(loan) {
  return Number(
    loan?.monthly_emi ??
    loan?.emi_amount ??
    loan?.emi ??
    0
  )
}

function getInterestRate(loan) {
  return Number(
    loan?.annual_interest_rate ??
    loan?.interest_rate ??
    loan?.rate ??
    0
  )
}

function getTenure(loan) {
  return Number(
    loan?.tenure_months ??
    loan?.tenure ??
    0
  )
}

function getStartDate(loan) {
  return (
    loan?.start_date ||
    loan?.loan_start_date ||
    loan?.created_at
  )
}

function getEndDate(loan) {
  return (
    loan?.end_date ||
    loan?.loan_end_date
  )
}

function StatusBadge({ status }) {
  const completed =
    status === 'Completed'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        completed
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          completed
            ? 'bg-emerald-500'
            : 'bg-blue-500'
        }`}
      />
      {status}
    </span>
  )
}

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

          {subtitle && (
            <p className="mt-1 text-xs text-slate-500">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-lg">
          {icon}
        </div>
      </div>
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-5 w-40 rounded bg-slate-200" />
      <div className="mt-4 h-8 w-28 rounded bg-slate-200" />
      <div className="mt-3 h-3 w-48 rounded bg-slate-100" />
    </div>
  )
}

function LoanCard({ loan }) {
  const status = getLoanStatus(loan)
  const progress = getLoanProgress(loan)

  const name = getLoanName(loan)
  const principal = getPrincipal(loan)
  const outstanding = getOutstanding(loan)
  const monthlyEMI = getMonthlyEMI(loan)
  const interestRate = getInterestRate(loan)
  const tenure = getTenure(loan)

  return (
    <div className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      {/* Card Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-lg font-bold text-white">
                ₹
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-slate-900">
                  {name}
                </h3>

                <p className="mt-0.5 text-xs text-slate-500">
                  Loan ID: #{loan?.id ?? '—'}
                </p>
              </div>
            </div>
          </div>

          <StatusBadge status={status} />
        </div>
      </div>

      {/* Main Information */}
      <div className="p-5">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Loan Amount
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatCurrency(principal)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500">
              Outstanding
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatCurrency(outstanding)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500">
              Monthly EMI
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {formatCurrency(monthlyEMI)}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500">
              Interest Rate
            </p>

            <p className="mt-1 text-sm font-bold text-slate-900">
              {interestRate
                ? `${interestRate}%`
                : '—'}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600">
              Repayment Progress
            </span>

            <span className="text-xs font-bold text-slate-900">
              {progress.toFixed(0)}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-slate-900 transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        {/* Additional Details */}
        <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Tenure
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {tenure
                ? `${tenure} months`
                : '—'}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Start Date
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatDate(
                getStartDate(loan)
              )}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              End Date
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-800">
              {formatDate(
                getEndDate(loan)
              )}
            </p>
          </div>
        </div>

        {/* Action */}
        <div className="mt-5">
          <Link
            to={`/loan/${loan?.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            View Loan Details
            <span>→</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function MyLoans() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState('All')
  const [sortBy, setSortBy] =
    useState('recent')

  async function fetchLoans() {
    try {
      setLoading(true)
      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/loans`,
        {
          method: 'GET',
          credentials: 'include',
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data?.message ||
          'Unable to load loans.'
        )
      }

      const loanData =
        data?.data?.loans ||
        data?.data ||
        data?.loans ||
        []

      setLoans(
        Array.isArray(loanData)
          ? loanData
          : []
      )
    } catch (err) {
      console.error(
        'Unable to fetch loans:',
        err
      )

      setError(
        err.message ||
        'Unable to load your loans.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLoans()
  }, [])

  const filteredLoans = useMemo(() => {
    let result = [...loans]

    const searchText =
      search.trim().toLowerCase()

    if (searchText) {
      result = result.filter((loan) => {
        const name =
          getLoanName(loan).toLowerCase()

        const id =
          String(loan?.id || '')

        const type =
          String(
            loan?.loan_type || ''
          ).toLowerCase()

        return (
          name.includes(searchText) ||
          id.includes(searchText) ||
          type.includes(searchText)
        )
      })
    }

    if (statusFilter !== 'All') {
      result = result.filter(
        (loan) =>
          getLoanStatus(loan) ===
          statusFilter
      )
    }

    if (sortBy === 'amount-high') {
      result.sort(
        (a, b) =>
          getPrincipal(b) -
          getPrincipal(a)
      )
    }

    if (sortBy === 'emi-high') {
      result.sort(
        (a, b) =>
          getMonthlyEMI(b) -
          getMonthlyEMI(a)
      )
    }

    if (sortBy === 'outstanding-high') {
      result.sort(
        (a, b) =>
          getOutstanding(b) -
          getOutstanding(a)
      )
    }

    if (sortBy === 'recent') {
      result.sort((a, b) => {
        const first =
          new Date(
            getStartDate(a) || 0
          ).getTime()

        const second =
          new Date(
            getStartDate(b) || 0
          ).getTime()

        return second - first
      })
    }

    return result
  }, [
    loans,
    search,
    statusFilter,
    sortBy,
  ])

  const summary = useMemo(() => {
    const totalLoans = loans.length

    const activeLoans =
      loans.filter(
        (loan) =>
          getLoanStatus(loan) ===
          'Active'
      ).length

    const completedLoans =
      loans.filter(
        (loan) =>
          getLoanStatus(loan) ===
          'Completed'
      ).length

    const totalPrincipal =
      loans.reduce(
        (total, loan) =>
          total + getPrincipal(loan),
        0
      )

    const totalOutstanding =
      loans.reduce(
        (total, loan) =>
          total + getOutstanding(loan),
        0
      )

    const totalMonthlyEMI =
      loans
        .filter(
          (loan) =>
            getLoanStatus(loan) ===
            'Active'
        )
        .reduce(
          (total, loan) =>
            total +
            getMonthlyEMI(loan),
          0
        )

    return {
      totalLoans,
      activeLoans,
      completedLoans,
      totalPrincipal,
      totalOutstanding,
      totalMonthlyEMI,
    }
  }, [loans])

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-500">
              Loan Management
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              My Loans
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Manage your loans, track repayment
              progress, and monitor your monthly
              EMI obligations from one place.
            </p>
          </div>

          <Link
            to="/add-loan"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <span className="text-lg">
              +
            </span>
            Add New Loan
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">
                Unable to load loans
              </p>

              <p className="mt-1">
                {error}
              </p>
            </div>

            <button
              onClick={fetchLoans}
              className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-red-700 shadow-sm ring-1 ring-red-200 hover:bg-red-50"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Summary Cards */}
        {loading ? (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </div>
        ) : (
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Total Loans"
              value={
                summary.totalLoans
              }
              subtitle={`${summary.activeLoans} active`}
              icon="▣"
            />

            <SummaryCard
              title="Monthly EMI"
              value={formatCurrency(
                summary.totalMonthlyEMI
              )}
              subtitle="Across active loans"
              icon="₹"
            />

            <SummaryCard
              title="Total Outstanding"
              value={formatCurrency(
                summary.totalOutstanding
              )}
              subtitle="Remaining principal"
              icon="◷"
            />

            <SummaryCard
              title="Completed Loans"
              value={
                summary.completedLoans
              }
              subtitle={formatCurrency(
                summary.totalPrincipal
              ) + ' total principal'}
              icon="✓"
            />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                ⌕
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search by loan name, type or ID..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="All">
                All Status
              </option>

              <option value="Active">
                Active
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(event) =>
                setSortBy(
                  event.target.value
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              <option value="recent">
                Most Recent
              </option>

              <option value="amount-high">
                Highest Loan Amount
              </option>

              <option value="emi-high">
                Highest EMI
              </option>

              <option value="outstanding-high">
                Highest Outstanding
              </option>
            </select>
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-600">
              Showing{' '}
              <span className="font-bold text-slate-900">
                {filteredLoans.length}
              </span>{' '}
              of{' '}
              <span className="font-bold text-slate-900">
                {loans.length}
              </span>{' '}
              loans
            </p>

            {(search ||
              statusFilter !== 'All') && (
              <button
                onClick={() => {
                  setSearch('')
                  setStatusFilter(
                    'All'
                  )
                }}
                className="text-xs font-semibold text-slate-600 underline underline-offset-4 hover:text-slate-900"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        )}

        {/* Empty State */}
        {!loading &&
          loans.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                ₹
              </div>

              <h2 className="mt-5 text-xl font-bold text-slate-900">
                No loans added yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add your first loan to start
                tracking EMI payments, repayment
                progress, outstanding balance and
                payment history.
              </p>

              <Link
                to="/add-loan"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                + Add Your First Loan
              </Link>
            </div>
          )}

        {/* No Filter Results */}
        {!loading &&
          loans.length > 0 &&
          filteredLoans.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-xl">
                ⌕
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                No matching loans
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Try changing your search or
                status filter.
              </p>

              <button
                onClick={() => {
                  setSearch('')
                  setStatusFilter(
                    'All'
                  )
                }}
                className="mt-5 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Clear Filters
              </button>
            </div>
          )}

        {/* Loan Cards */}
        {!loading &&
          filteredLoans.length > 0 && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {filteredLoans.map(
                (loan) => (
                  <LoanCard
                    key={loan?.id}
                    loan={loan}
                  />
                )
              )}
            </div>
          )}

        {/* Footer Note */}
        {!loading &&
          loans.length > 0 && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 shadow-sm">
              <span className="font-semibold text-slate-700">
                SmartEMI note:
              </span>{' '}
              Loan figures are based on the
              information recorded in SmartEMI.
              Payment status and outstanding
              amounts should be verified against
              your lender's official records.
            </div>
          )}
      </div>
    </div>
  )
}