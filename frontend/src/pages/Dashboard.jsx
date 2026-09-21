import { useEffect, useState } from 'react'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'


const API_BASE_URL = '/api'


// =========================
// CURRENCY FORMATTER
// =========================

function formatCurrency(value) {
  const number = Number(value || 0)

  return `₹${number.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`
}


// =========================
// NUMBER FORMATTER
// =========================

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-IN')
}


// =========================
// DATE FORMATTER
// =========================

function formatDate(value) {
  if (!value) {
    return '-'
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


// =========================
// KPI CARD
// =========================

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
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

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${iconClass}`}
        >
          {icon}
        </div>

      </div>

    </div>
  )
}


// =========================
// SECTION HEADER
// =========================

function SectionHeader({
  title,
  subtitle,
}) {
  return (
    <div className="mb-5">

      <h2 className="text-base font-bold text-slate-900">
        {title}
      </h2>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      )}

    </div>
  )
}


// =========================
// DASHBOARD
// =========================

function Dashboard() {

  const [dashboard, setDashboard] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState('')


  // =========================
  // FETCH DASHBOARD
  // =========================

  async function loadDashboard(
    showLoader = true,
  ) {

    try {

      if (showLoader) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      setError('')

      const response = await fetch(
        `${API_BASE_URL}/api/dashboard/summary`,
        {
          method: 'GET',
          credentials: 'include',
        },
      )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result.message ||
          'Unable to load dashboard.',
        )
      }

      /*
       * Backend response:
       *
       * {
       *   success: true,
       *   data: {
       *     overview: {...},
       *     emi_statistics: {...},
       *     payment_progress: {...},
       *     chart_data: {...},
       *     upcoming_emi: {...},
       *     recent_payments: [...],
       *     loan_overview: [...],
       *     insights: [...]
       *   }
       * }
       */

      setDashboard(
        result.data || {},
      )

    } catch (err) {

      setError(
        err.message ||
        'Unable to load dashboard right now.',
      )

    } finally {

      setLoading(false)
      setRefreshing(false)

    }
  }


  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {

    loadDashboard()

  }, [])


  // =========================
  // REFRESH WHEN TAB GETS FOCUS
  // =========================

  useEffect(() => {

    function handleFocus() {
      loadDashboard(false)
    }

    window.addEventListener(
      'focus',
      handleFocus,
    )

    return () => {
      window.removeEventListener(
        'focus',
        handleFocus,
      )
    }

  }, [])


  // =========================
  // LOADING STATE
  // =========================

  if (loading) {

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-8">

            <div className="h-8 w-64 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-3 h-4 w-96 animate-pulse rounded bg-slate-200" />

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4].map((item) => (

              <div
                key={item}
                className="h-32 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
              />

            ))}

          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">

            <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />

            <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />

          </div>

        </div>

      </div>
    )
  }


  // =========================
  // ERROR STATE
  // =========================

  if (error && !dashboard) {

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">

            <div className="flex items-start gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-lg">
                ⚠️
              </div>

              <div className="flex-1">

                <h2 className="font-bold text-red-800">
                  Unable to load dashboard
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    loadDashboard()
                  }
                  className="mt-4 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    )
  }


  // =========================
  // BACKEND DATA
  // =========================

  const data =
    dashboard || {}


  // =========================
  // OVERVIEW
  // =========================

  const overview =
    data.overview || {}


  const totalLoans =
    Number(
      overview.total_loans || 0,
    )


  const activeLoans =
    Number(
      overview.active_loans || 0,
    )


  const totalPrincipal =
    Number(
      overview.total_principal || 0,
    )


  const outstandingPrincipal =
    Number(
      overview.outstanding_principal || 0,
    )


  const monthlyEMI =
    Number(
      overview.monthly_emi || 0,
    )


  const totalPaid =
    Number(
      overview.total_paid || 0,
    )


  const totalPending =
    Number(
      overview.total_pending || 0,
    )


  const totalOverdue =
    Number(
      overview.total_overdue || 0,
    )


  // =========================
  // EMI STATISTICS
  // =========================

  const emiStatistics =
    data.emi_statistics || {}


  const totalEMIs =
    Number(
      emiStatistics.total_emis || 0,
    )


  const paidEMIs =
    Number(
      emiStatistics.paid_emis || 0,
    )


  const pendingEMIs =
    Number(
      emiStatistics.pending_emis || 0,
    )


  const overdueEMIs =
    Number(
      emiStatistics.overdue_emis || 0,
    )


  // =========================
  // PAYMENT PROGRESS
  // =========================

  const paymentProgressData =
    data.payment_progress || {}


  const paymentProgress =
    Math.min(
      100,
      Math.max(
        0,
        Number(
          paymentProgressData.percentage || 0,
        ),
      ),
    )


  // =========================
  // CHART DATA
  // =========================

  /*
   * Backend currently returns chart_data
   * as one summary object, not an array.
   *
   * We convert it into chart-friendly data
   * here.
   */

  const chartSummary =
    data.chart_data || {}


  const chartData = [
    {
      name: 'Financial Summary',
      paid: Number(
        chartSummary.paid || 0,
      ),
      pending: Number(
        chartSummary.pending || 0,
      ),
      overdue: Number(
        chartSummary.overdue || 0,
      ),
    },
  ]


  // =========================
  // UPCOMING EMI
  // =========================

  const upcomingEMI =
    data.upcoming_emi
      ? [data.upcoming_emi]
      : []


  // =========================
  // RECENT PAYMENTS
  // =========================

  const recentPayments =
    Array.isArray(
      data.recent_payments,
    )
      ? data.recent_payments
      : []


  // =========================
  // LOAN OVERVIEW
  // =========================

  const loanOverview =
    Array.isArray(
      data.loan_overview,
    )
      ? data.loan_overview
      : []


  // =========================
  // INSIGHTS
  // =========================

  const insights =
    Array.isArray(
      data.insights,
    )
      ? data.insights
      : []


  // =========================
  // DASHBOARD UI
  // =========================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =========================
            HEADER
        ========================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Financial Dashboard
              </h1>

              <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-bold text-green-700 ring-1 ring-green-200">
                LIVE
              </span>

            </div>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track your loans, EMI burden, payments,
              outstanding balance, and upcoming
              financial commitments in one place.
            </p>

          </div>


          <button
            type="button"
            onClick={() =>
              loadDashboard(false)
            }
            disabled={refreshing}
            className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {refreshing
              ? 'Refreshing...'
              : '↻ Refresh Dashboard'}
          </button>

        </div>


        {/* =========================
            ERROR BANNER
        ========================== */}

        {error && (

          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">

            <p className="text-sm font-medium text-red-700">
              ⚠️ {error}
            </p>

            <button
              type="button"
              onClick={() => setError('')}
              className="text-lg text-red-400 hover:text-red-700"
            >
              ×
            </button>

          </div>

        )}


        {/* =========================
            KPI CARDS
        ========================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Total Loans"
            value={formatNumber(totalLoans)}
            subtitle={`${activeLoans} active loan${activeLoans === 1 ? '' : 's'}`}
            icon="🏦"
            iconClass="bg-blue-100 text-blue-700"
          />


          <StatCard
            title="Monthly EMI"
            value={formatCurrency(monthlyEMI)}
            subtitle="Current monthly commitment"
            icon="📅"
            iconClass="bg-purple-100 text-purple-700"
          />


          <StatCard
            title="Outstanding"
            value={formatCurrency(
              outstandingPrincipal,
            )}
            subtitle="Principal still remaining"
            icon="💰"
            iconClass="bg-orange-100 text-orange-700"
          />


          <StatCard
            title="Total Paid"
            value={formatCurrency(totalPaid)}
            subtitle="Payments recorded"
            icon="✓"
            iconClass="bg-green-100 text-green-700"
          />

        </div>


        {/* =========================
            FINANCIAL HEALTH
        ========================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* PAYMENT PROGRESS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <SectionHeader
              title="Repayment Progress"
              subtitle="Overall progress across your tracked loan payments."
            />


            <div className="flex flex-col gap-6 md:flex-row md:items-center">

              <div className="relative flex h-40 w-40 shrink-0 items-center justify-center self-center">

                <svg
                  className="h-40 w-40 -rotate-90"
                  viewBox="0 0 120 120"
                >

                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    className="text-slate-100"
                  />

                  <circle
                    cx="60"
                    cy="60"
                    r="48"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray="301.6"
                    strokeDashoffset={
                      301.6 -
                      (
                        301.6 *
                        paymentProgress
                      ) /
                      100
                    }
                    className="text-green-500"
                  />

                </svg>


                <div className="absolute text-center">

                  <p className="text-2xl font-bold text-slate-900">
                    {paymentProgress.toFixed(0)}%
                  </p>

                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Paid
                  </p>

                </div>

              </div>


              <div className="grid flex-1 gap-4 sm:grid-cols-2">

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-medium text-slate-400">
                    Total Principal
                  </p>

                  <p className="mt-1 text-lg font-bold text-slate-900">
                    {formatCurrency(
                      totalPrincipal,
                    )}
                  </p>

                </div>


                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs font-medium text-slate-400">
                    Outstanding
                  </p>

                  <p className="mt-1 text-lg font-bold text-orange-600">
                    {formatCurrency(
                      outstandingPrincipal,
                    )}
                  </p>

                </div>


                <div className="rounded-xl bg-green-50 p-4">

                  <p className="text-xs font-medium text-green-600">
                    Amount Paid
                  </p>

                  <p className="mt-1 text-lg font-bold text-green-700">
                    {formatCurrency(totalPaid)}
                  </p>

                </div>


                <div className="rounded-xl bg-red-50 p-4">

                  <p className="text-xs font-medium text-red-600">
                    Overdue
                  </p>

                  <p className="mt-1 text-lg font-bold text-red-700">
                    {formatCurrency(
                      totalOverdue,
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* EMI STATUS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <SectionHeader
              title="EMI Status"
              subtitle="Current payment position."
            />


            <div className="space-y-4">

              <div className="rounded-xl bg-blue-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
                    📅
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Pending
                    </p>

                    <p className="font-bold text-slate-900">
                      {formatCurrency(
                        totalPending,
                      )}
                    </p>

                    <p className="text-[11px] text-slate-400">
                      {pendingEMIs} EMI{pendingEMIs === 1 ? '' : 's'}
                    </p>

                  </div>

                </div>

              </div>


              <div className="rounded-xl bg-red-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
                    ⚠️
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Overdue
                    </p>

                    <p className="font-bold text-red-700">
                      {formatCurrency(
                        totalOverdue,
                      )}
                    </p>

                    <p className="text-[11px] text-red-400">
                      {overdueEMIs} EMI{overdueEMIs === 1 ? '' : 's'}
                    </p>

                  </div>

                </div>

              </div>


              <div className="rounded-xl bg-green-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
                    ✓
                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Paid
                    </p>

                    <p className="font-bold text-green-700">
                      {formatCurrency(totalPaid)}
                    </p>

                    <p className="text-[11px] text-green-500">
                      {paidEMIs} EMI{paidEMIs === 1 ? '' : 's'}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>


        {/* =========================
            CHARTS
        ========================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">

          {/* PAYMENT SUMMARY */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <SectionHeader
              title="Payment Summary"
              subtitle="Current payment position across your loans."
            />


            <div className="h-64 w-full">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <AreaChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: -20,
                    bottom: 0,
                  }}
                >

                  <defs>

                    <linearGradient
                      id="paymentGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >

                      <stop
                        offset="5%"
                        stopOpacity={0.25}
                      />

                      <stop
                        offset="95%"
                        stopOpacity={0}
                      />

                    </linearGradient>

                  </defs>


                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <YAxis
                    tick={{
                      fontSize: 11,
                    }}
                  />

                  <Tooltip />


                  <Area
                    type="monotone"
                    dataKey="paid"
                    strokeWidth={2}
                    fill="url(#paymentGradient)"
                    stroke="currentColor"
                    className="text-blue-600"
                  />

                </AreaChart>

              </ResponsiveContainer>

            </div>

          </div>


          {/* LOAN OVERVIEW */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <SectionHeader
              title="Loan Overview"
              subtitle="Loan-wise outstanding balance."
            />


            {loanOverview.length === 0 ? (

              <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50">

                <p className="text-sm text-slate-400">
                  No loan overview available yet.
                </p>

              </div>

            ) : (

              <div className="h-64 w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={loanOverview}
                    margin={{
                      top: 10,
                      right: 10,
                      left: -20,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="loan_name"
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <YAxis
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <Tooltip />


                    <Bar
                      dataKey="outstanding_principal"
                      fill="currentColor"
                      className="text-orange-500"
                      radius={[
                        6,
                        6,
                        0,
                        0,
                      ]}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            )}

          </div>

        </div>


        {/* =========================
            UPCOMING EMI + INSIGHTS
        ========================== */}

        <div className="mt-6 grid gap-6 lg:grid-cols-3">

          {/* UPCOMING EMI */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

            <SectionHeader
              title="Upcoming EMI"
              subtitle="Your next scheduled EMI payment."
            />


            {upcomingEMI.length === 0 ? (

              <div className="rounded-xl bg-slate-50 px-5 py-10 text-center">

                <div className="text-3xl">
                  📅
                </div>

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No upcoming EMIs
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Your upcoming EMI schedule will
                  appear here.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {upcomingEMI.map(
                  (item, index) => (

                    <div
                      key={
                        item.emi_id ||
                        item.id ||
                        index
                      }
                      className="flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                          ₹
                        </div>


                        <div>

                          <p className="text-sm font-bold text-slate-900">
                            {item.loan_name ||
                              'Loan'}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            EMI #{item.installment_number || '-'}
                            {' • '}
                            Due on{' '}
                            {formatDate(
                              item.due_date,
                            )}
                          </p>

                        </div>

                      </div>


                      <div className="text-left sm:text-right">

                        <p className="text-sm font-bold text-slate-900">
                          {formatCurrency(
                            item.amount || 0,
                          )}
                        </p>

                        <span className="mt-1 inline-block rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold text-blue-700">
                          {item.days_until_due === 0
                            ? 'Due Today'
                            : item.days_until_due === 1
                              ? 'Due Tomorrow'
                              : `${item.days_until_due} days`}
                        </span>

                      </div>

                    </div>

                  ),
                )}

              </div>

            )}

          </div>


          {/* INSIGHTS */}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

            <SectionHeader
              title="Smart Insights"
              subtitle="Financial observations."
            />


            {insights.length === 0 ? (

              <div className="rounded-xl bg-slate-50 px-4 py-8 text-center">

                <div className="text-2xl">
                  💡
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  Insights will appear as your
                  SmartEMI data grows.
                </p>

              </div>

            ) : (

              <div className="space-y-3">

                {insights
                  .slice(0, 5)
                  .map(
                    (insight, index) => {

                      const text =
                        typeof insight ===
                        'string'
                          ? insight
                          : insight.message ||
                            insight.text ||
                            insight.title ||
                            'Financial insight available.'

                      return (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                        >

                          <div className="flex items-start gap-3">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-yellow-100">
                              💡
                            </div>

                            <p className="text-xs leading-5 text-slate-600">
                              {text}
                            </p>

                          </div>

                        </div>
                      )
                    },
                  )}

              </div>

            )}

          </div>

        </div>


        {/* =========================
            RECENT PAYMENTS
        ========================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <SectionHeader
            title="Recent Payments"
            subtitle="Latest payment activity recorded in SmartEMI."
          />


          {recentPayments.length === 0 ? (

            <div className="rounded-xl bg-slate-50 px-5 py-10 text-center">

              <div className="text-3xl">
                💳
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No payments recorded yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Your recent payment history will appear
                here.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full min-w-[650px]">

                <thead>

                  <tr className="border-b border-slate-100 text-left">

                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Loan
                    </th>

                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Amount
                    </th>

                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Date
                    </th>

                    <th className="pb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recentPayments
                    .slice(0, 8)
                    .map(
                      (
                        payment,
                        index,
                      ) => (

                        <tr
                          key={
                            payment.id ||
                            index
                          }
                          className="border-b border-slate-50 last:border-0"
                        >

                          <td className="py-4">

                            <p className="text-sm font-semibold text-slate-800">
                              {payment.loan_name ||
                                'Loan'}
                            </p>

                          </td>


                          <td className="py-4 text-sm font-bold text-slate-900">
                            {formatCurrency(
                              payment.amount ||
                              0,
                            )}
                          </td>


                          <td className="py-4 text-xs text-slate-500">
                            {formatDate(
                              payment.payment_date,
                            )}
                          </td>


                          <td className="py-4">

                            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700 ring-1 ring-green-200">
                              Paid
                            </span>

                          </td>

                        </tr>

                      ),
                    )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =========================
            FOOTER NOTE
        ========================== */}

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-4">

          <div className="flex items-start gap-3">

            <span className="mt-0.5">
              🔒
            </span>

            <div>

              <p className="text-sm font-semibold text-slate-700">
                SmartEMI Financial Overview
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Dashboard figures are calculated from
                the loans, EMI schedules, and payment
                records stored in your SmartEMI account.
                Always verify important financial
                information with your lender.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}


export default Dashboard
