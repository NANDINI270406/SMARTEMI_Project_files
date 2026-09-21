import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { getReportSummary } from '../services/reportsService'


function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}


function formatDate(dateString) {
  if (!dateString) {
    return '-'
  }

  return new Date(
    `${dateString}T00:00:00`,
  ).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}


function Reports() {

  const currentDate = new Date()

  const [month, setMonth] = useState(
    currentDate.getMonth() + 1,
  )

  const [year, setYear] = useState(
    currentDate.getFullYear(),
  )

  const [report, setReport] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState('')


  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]


  useEffect(() => {
    loadReport()
  }, [month, year])


  const loadReport = async () => {

    try {

      setLoading(true)
      setError('')

      const response =
        await getReportSummary(
          month,
          year,
        )

      setReport(response.data)

    } catch (err) {

      setError(
        err.message ||
          'Unable to load report',
      )

    } finally {

      setLoading(false)

    }
  }


  const summary =
    report?.summary || {}

  const loanReports =
    report?.loan_reports || []

  const paymentHistory =
    report?.payment_history || []


  const chartData = useMemo(
    () =>
      loanReports.map(
        (loan) => ({
          name:
            loan.loan_name.length > 15
              ? `${loan.loan_name.slice(0, 15)}...`
              : loan.loan_name,
          principal:
            loan.principal_amount,
          interest:
            loan.interest_amount,
          paid:
            loan.paid_amount,
        }),
      ),
    [loanReports],
  )


  const downloadCSV = () => {

    const headers = [
      'Loan',
      'Lender',
      'EMI',
      'Scheduled Amount',
      'Paid Amount',
      'Principal',
      'Interest',
      'Paid EMIs',
      'Pending EMIs',
      'Overdue EMIs',
    ]

    const rows = loanReports.map(
      (loan) => [
        loan.loan_name,
        loan.lender_name,
        loan.emi_amount,
        loan.scheduled_amount,
        loan.paid_amount,
        loan.principal_amount,
        loan.interest_amount,
        loan.paid_count,
        loan.pending_count,
        loan.overdue_count,
      ],
    )

    const csvContent = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) => {
            const text =
              String(value ?? '')

            return `"${text.replace(
              /"/g,
              '""',
            )}"`
          })
          .join(','),
      )
      .join('\n')

    const blob = new Blob(
      [csvContent],
      {
        type: 'text/csv;charset=utf-8;',
      },
    )

    const url =
      URL.createObjectURL(blob)

    const link =
      document.createElement('a')

    link.href = url

    link.download =
      `SmartEMI_Report_${year}_${month}.csv`

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }


  if (loading) {

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="h-8 w-64 animate-pulse rounded bg-slate-200" />

          <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-100" />

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {Array.from({
              length: 4,
            }).map(
              (_, index) => (
                <div
                  key={index}
                  className="h-32 animate-pulse rounded-2xl bg-white"
                />
              ),
            )}

          </div>

        </div>

      </div>
    )
  }


  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* Header */}

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

          <div>

            <p className="text-sm font-semibold text-indigo-600">
              SmartEMI
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Financial Reports
            </h1>

            <p className="mt-2 text-slate-500">
              Analyse your EMI payments and loan performance.
            </p>

          </div>


          <button
            type="button"
            onClick={downloadCSV}
            disabled={
              loanReports.length === 0
            }
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↓ Download CSV
          </button>

        </div>


        {/* Filters */}

        <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">

          <div className="flex flex-col gap-4 md:flex-row md:items-end">

            <div>

              <label
                htmlFor="report-month"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Month
              </label>

              <select
                id="report-month"
                value={month}
                onChange={(event) =>
                  setMonth(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >

                {monthNames.map(
                  (
                    monthName,
                    index,
                  ) => (
                    <option
                      key={monthName}
                      value={index + 1}
                    >
                      {monthName}
                    </option>
                  ),
                )}

              </select>

            </div>


            <div>

              <label
                htmlFor="report-year"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Year
              </label>

              <select
                id="report-year"
                value={year}
                onChange={(event) =>
                  setYear(
                    Number(
                      event.target.value,
                    ),
                  )
                }
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              >

                {Array.from(
                  {
                    length: 7,
                  },
                  (_, index) =>
                    currentDate.getFullYear() -
                    3 +
                    index,
                ).map(
                  (yearOption) => (
                    <option
                      key={yearOption}
                      value={yearOption}
                    >
                      {yearOption}
                    </option>
                  ),
                )}

              </select>

            </div>


            <div className="rounded-xl bg-indigo-50 px-5 py-3">

              <p className="text-xs font-medium text-indigo-500">
                Selected Period
              </p>

              <p className="mt-1 font-bold text-indigo-700">
                {monthNames[month - 1]} {year}
              </p>

            </div>

          </div>

        </div>


        {/* Error */}

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">

            <p className="font-semibold">
              Unable to load report
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>

            <button
              type="button"
              onClick={loadReport}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Try Again
            </button>

          </div>
        )}


        {/* Summary Cards */}

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              EMI Scheduled
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              {formatCurrency(
                summary.total_emi_scheduled,
              )}
            </p>

          </div>


          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              EMI Paid
            </p>

            <p className="mt-2 text-2xl font-bold text-green-600">
              {formatCurrency(
                summary.total_paid_amount,
              )}
            </p>

          </div>


          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Principal
            </p>

            <p className="mt-2 text-2xl font-bold text-indigo-600">
              {formatCurrency(
                summary.total_principal,
              )}
            </p>

          </div>


          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

            <p className="text-sm text-slate-500">
              Interest
            </p>

            <p className="mt-2 text-2xl font-bold text-purple-600">
              {formatCurrency(
                summary.total_interest,
              )}
            </p>

          </div>

        </div>


        {/* Pending / Overdue */}

        <div className="mt-5 grid gap-5 md:grid-cols-2">

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-6">

            <p className="text-sm font-semibold text-amber-700">
              Pending Amount
            </p>

            <p className="mt-2 text-2xl font-bold text-amber-800">
              {formatCurrency(
                summary.total_pending_amount,
              )}
            </p>

          </div>


          <div className="rounded-2xl border border-red-100 bg-red-50 p-6">

            <p className="text-sm font-semibold text-red-700">
              Overdue Amount
            </p>

            <p className="mt-2 text-2xl font-bold text-red-800">
              {formatCurrency(
                summary.total_overdue_amount,
              )}
            </p>

          </div>

        </div>


        {/* Chart */}

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

          <div className="mb-6">

            <h2 className="text-lg font-bold text-slate-900">
              Loan-wise Financial Analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Principal, interest and recorded payments for the selected period.
            </p>

          </div>


          {chartData.length > 0 ? (

            <div className="h-80">

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 20,
                    left: 10,
                    bottom: 10,
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    formatter={(value) =>
                      formatCurrency(value)
                    }
                  />

                  <Legend />

                  <Bar
                    dataKey="principal"
                    name="Principal"
                    fill="#4f46e5"
                  />

                  <Bar
                    dataKey="interest"
                    name="Interest"
                    fill="#9333ea"
                  />

                  <Bar
                    dataKey="paid"
                    name="Paid"
                    fill="#16a34a"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>

          ) : (

            <div className="flex h-80 items-center justify-center rounded-xl bg-slate-50">

              <div className="text-center">

                <p className="font-semibold text-slate-800">
                  No report data
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  No EMI activity is available for this period.
                </p>

              </div>

            </div>

          )}

        </div>


        {/* Loan Reports */}

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

          <div className="border-b border-slate-100 px-6 py-5">

            <h2 className="text-lg font-bold text-slate-900">
              Loan-wise Report
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Detailed performance of each loan.
            </p>

          </div>


          {loanReports.length === 0 ? (

            <div className="p-10 text-center">

              <p className="font-semibold text-slate-800">
                No loan activity
              </p>

              <p className="mt-1 text-sm text-slate-500">
                There are no scheduled EMIs for the selected month.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full text-sm">

                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

                  <tr>

                    <th className="px-6 py-4">
                      Loan
                    </th>

                    <th className="px-6 py-4">
                      EMI
                    </th>

                    <th className="px-6 py-4">
                      Scheduled
                    </th>

                    <th className="px-6 py-4">
                      Paid
                    </th>

                    <th className="px-6 py-4">
                      Principal
                    </th>

                    <th className="px-6 py-4">
                      Interest
                    </th>

                    <th className="px-6 py-4">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {loanReports.map(
                    (loan) => (
                      <tr
                        key={loan.loan_id}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-6 py-4">

                          <p className="font-semibold text-slate-800">
                            {loan.loan_name}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {loan.lender_name}
                          </p>

                        </td>


                        <td className="px-6 py-4 font-semibold text-indigo-600">
                          {formatCurrency(
                            loan.emi_amount,
                          )}
                        </td>


                        <td className="px-6 py-4">
                          {formatCurrency(
                            loan.scheduled_amount,
                          )}
                        </td>


                        <td className="px-6 py-4 font-semibold text-green-600">
                          {formatCurrency(
                            loan.paid_amount,
                          )}
                        </td>


                        <td className="px-6 py-4">
                          {formatCurrency(
                            loan.principal_amount,
                          )}
                        </td>


                        <td className="px-6 py-4">
                          {formatCurrency(
                            loan.interest_amount,
                          )}
                        </td>


                        <td className="px-6 py-4">

                          <div className="flex flex-wrap gap-1">

                            {loan.paid_count >
                              0 && (
                              <span className="rounded-full bg-green-50 px-2 py-1 text-xs font-semibold text-green-700">
                                {loan.paid_count} Paid
                              </span>
                            )}

                            {loan.pending_count >
                              0 && (
                              <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">
                                {loan.pending_count} Pending
                              </span>
                            )}

                            {loan.overdue_count >
                              0 && (
                              <span className="rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                                {loan.overdue_count} Overdue
                              </span>
                            )}

                          </div>

                        </td>

                      </tr>
                    ),
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* Payment History */}

        <div className="mt-8 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">

          <div className="border-b border-slate-100 px-6 py-5">

            <h2 className="text-lg font-bold text-slate-900">
              Payment History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Payments recorded during {monthNames[month - 1]} {year}.
            </p>

          </div>


          {paymentHistory.length === 0 ? (

            <div className="p-10 text-center">

              <p className="font-semibold text-slate-800">
                No payments recorded
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Payment transactions for this period will appear here.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-full text-sm">

                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">

                  <tr>

                    <th className="px-6 py-4">
                      Date
                    </th>

                    <th className="px-6 py-4">
                      Loan
                    </th>

                    <th className="px-6 py-4">
                      Amount
                    </th>

                    <th className="px-6 py-4">
                      Method
                    </th>

                    <th className="px-6 py-4">
                      Transaction Reference
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {paymentHistory.map(
                    (payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-slate-50"
                      >

                        <td className="px-6 py-4 font-medium text-slate-700">
                          {formatDate(
                            payment.payment_date,
                          )}
                        </td>


                        <td className="px-6 py-4 font-semibold text-slate-800">
                          {payment.loan_name}
                        </td>


                        <td className="px-6 py-4 font-bold text-green-600">
                          {formatCurrency(
                            payment.amount,
                          )}
                        </td>


                        <td className="px-6 py-4 text-slate-600">
                          {payment.payment_method ||
                            '-'}
                        </td>


                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          {payment.transaction_reference ||
                            '-'}
                        </td>

                      </tr>
                    ),
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        <div className="pb-10" />

      </div>

    </div>
  )
}


export default Reports
