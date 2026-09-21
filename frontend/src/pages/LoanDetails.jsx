import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import {
  getLoanPayments,
  markEMIPaid,
} from '../services/paymentService'

import { getLoanSchedule } from '../services/loanService'


// =========================
// FORMAT CURRENCY
// =========================

function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}


// =========================
// FORMAT DATE
// =========================

function formatDate(date) {
  if (!date) return '-'

  const parsedDate = new Date(`${date}T00:00:00`)

  if (Number.isNaN(parsedDate.getTime())) {
    return date
  }

  return parsedDate.toLocaleDateString(
    'en-IN',
    {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    },
  )
}


// =========================
// SUMMARY CARD
// =========================

function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">

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
// STATUS BADGE
// =========================

function StatusBadge({ status }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 ring-1 ring-green-200">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Paid
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 ring-1 ring-orange-200">
      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
      Pending
    </span>
  )
}


// =========================
// LOAN DETAILS
// =========================

function LoanDetails() {

  const { loanId } = useParams()

  const [schedule, setSchedule] = useState([])
  const [payments, setPayments] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [payingId, setPayingId] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')


  // =========================
  // LOAD DATA
  // =========================

  const loadLoanData = async () => {

    try {

      setLoading(true)
      setError('')

      const [
        scheduleResponse,
        paymentsResponse,
      ] = await Promise.all([
        getLoanSchedule(loanId),
        getLoanPayments(loanId),
      ])

      setSchedule(
        scheduleResponse?.data?.schedule || [],
      )

      setPayments(
        paymentsResponse?.data?.payments || [],
      )

    } catch (err) {

      setError(
        err.message ||
          'Unable to load loan details.',
      )

    } finally {

      setLoading(false)

    }
  }


  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadLoanData()
  }, [loanId])


  // =========================
  // MARK EMI PAID
  // =========================

  const handleMarkAsPaid = async (emi) => {

    try {

      setPayingId(emi.id)
      setError('')
      setSuccessMessage('')

      await markEMIPaid({
        emi_schedule_id: emi.id,
        payment_method: 'Manual',
      })

      setSuccessMessage(
        `EMI ${emi.installment_number} marked as paid successfully.`,
      )

      await loadLoanData()

    } catch (err) {

      setError(
        err.message ||
          'Unable to mark EMI as paid.',
      )

    } finally {

      setPayingId(null)

    }
  }


  // =========================
  // CALCULATIONS
  // =========================

  const paidEMIs = useMemo(
    () =>
      schedule.filter(
        (emi) =>
          emi.status === 'paid',
      ),
    [schedule],
  )


  const pendingEMIs = useMemo(
    () =>
      schedule.filter(
        (emi) =>
          emi.status !== 'paid',
      ),
    [schedule],
  )


  const totalPaid = useMemo(
    () =>
      payments.reduce(
        (total, payment) =>
          total +
          Number(payment.amount || 0),
        0,
      ),
    [payments],
  )


  const totalScheduled = useMemo(
    () =>
      schedule.reduce(
        (total, emi) =>
          total +
          Number(emi.emi_amount || 0),
        0,
      ),
    [schedule],
  )


  const totalPrincipal = useMemo(
    () =>
      schedule.reduce(
        (total, emi) =>
          total +
          Number(
            emi.principal_amount || 0,
          ),
        0,
      ),
    [schedule],
  )


  const totalInterest = useMemo(
    () =>
      schedule.reduce(
        (total, emi) =>
          total +
          Number(
            emi.interest_amount || 0,
          ),
        0,
      ),
    [schedule],
  )


  const paymentProgress =
    schedule.length > 0
      ? Math.round(
          (paidEMIs.length /
            schedule.length) *
            100,
        )
      : 0


  const nextPendingEMI =
    pendingEMIs.length > 0
      ? pendingEMIs[0]
      : null


  // =========================
  // LOADING
  // =========================

  if (loading) {

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="mb-8">

            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />

            <div className="mt-4 h-9 w-64 animate-pulse rounded-lg bg-slate-200" />

            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />

          </div>


          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {[1, 2, 3, 4].map(
              (item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
                />
              ),
            )}

          </div>


          <div className="mt-6 h-40 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />

          <div className="mt-6 h-96 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200" />

        </div>

      </div>
    )
  }


  // =========================
  // PAGE
  // =========================

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-7xl">

        {/* =========================
            HEADER
        ========================== */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <Link
              to="/my-loans"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              ← Back to My Loans
            </Link>


            <div className="mt-4 flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Loan Details
              </h1>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-200">
                Loan #{loanId}
              </span>

            </div>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Track your EMI schedule, payment progress,
              outstanding installments, and complete
              payment history.
            </p>

          </div>


          {nextPendingEMI && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                Next EMI
              </p>

              <p className="mt-1 text-lg font-bold text-orange-800">
                {formatCurrency(
                  nextPendingEMI.emi_amount,
                )}
              </p>

              <p className="mt-1 text-xs text-orange-700">
                Due on{' '}
                {formatDate(
                  nextPendingEMI.due_date,
                )}
              </p>

            </div>
          )}

        </div>


        {/* =========================
            ERROR
        ========================== */}

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
              ⚠️
            </div>

            <div className="flex-1">

              <p className="text-sm font-semibold text-red-800">
                Something went wrong
              </p>

              <p className="mt-1 text-sm text-red-700">
                {error}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setError('')
              }
              className="text-lg text-red-400 hover:text-red-700"
            >
              ×
            </button>

          </div>
        )}


        {/* =========================
            SUCCESS
        ========================== */}

        {successMessage && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-5 py-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100">
              ✓
            </div>

            <div className="flex-1">

              <p className="text-sm font-semibold text-green-800">
                Payment Updated
              </p>

              <p className="mt-1 text-sm text-green-700">
                {successMessage}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage('')
              }
              className="text-lg text-green-400 hover:text-green-700"
            >
              ×
            </button>

          </div>
        )}


        {/* =========================
            SUMMARY CARDS
        ========================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <SummaryCard
            title="Total EMIs"
            value={schedule.length}
            subtitle="Scheduled installments"
            icon="📅"
            iconClass="bg-blue-100 text-blue-700"
          />


          <SummaryCard
            title="Paid EMIs"
            value={paidEMIs.length}
            subtitle={`${paymentProgress}% completed`}
            icon="✓"
            iconClass="bg-green-100 text-green-700"
          />


          <SummaryCard
            title="Pending EMIs"
            value={pendingEMIs.length}
            subtitle="Installments remaining"
            icon="⏳"
            iconClass="bg-orange-100 text-orange-700"
          />


          <SummaryCard
            title="Total Paid"
            value={formatCurrency(totalPaid)}
            subtitle="Recorded payments"
            icon="₹"
            iconClass="bg-indigo-100 text-indigo-700"
          />

        </div>


        {/* =========================
            PAYMENT PROGRESS
        ========================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            <div>

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Repayment Progress
              </p>

              <h2 className="mt-2 text-xl font-bold text-slate-900">
                {paymentProgress}% of scheduled EMIs completed
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {paidEMIs.length} paid out of{' '}
                {schedule.length} scheduled installments.
              </p>

            </div>


            <div className="w-full max-w-xl">

              <div className="mb-2 flex items-center justify-between">

                <span className="text-xs font-semibold text-slate-500">
                  Payment completion
                </span>

                <span className="text-xs font-bold text-slate-700">
                  {paymentProgress}%
                </span>

              </div>


              <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-green-500 transition-all duration-500"
                  style={{
                    width: `${paymentProgress}%`,
                  }}
                />

              </div>

            </div>

          </div>


          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            <div className="rounded-xl bg-slate-50 p-4">

              <p className="text-xs font-medium text-slate-400">
                Scheduled Amount
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                {formatCurrency(
                  totalScheduled,
                )}
              </p>

            </div>


            <div className="rounded-xl bg-green-50 p-4">

              <p className="text-xs font-medium text-green-600">
                Principal
              </p>

              <p className="mt-1 text-lg font-bold text-green-700">
                {formatCurrency(
                  totalPrincipal,
                )}
              </p>

            </div>


            <div className="rounded-xl bg-orange-50 p-4">

              <p className="text-xs font-medium text-orange-600">
                Interest
              </p>

              <p className="mt-1 text-lg font-bold text-orange-700">
                {formatCurrency(
                  totalInterest,
                )}
              </p>

            </div>

          </div>

        </div>


        {/* =========================
            EMI SCHEDULE
        ========================== */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center md:justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                EMI Schedule
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                View every installment and update its
                payment status.
              </p>

            </div>


            <div className="flex items-center gap-2">

              <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                {paidEMIs.length} Paid
              </span>

              <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
                {pendingEMIs.length} Pending
              </span>

            </div>

          </div>


          {schedule.length === 0 ? (

            <div className="px-6 py-14 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                📅
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                No EMI schedule available
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                EMI installments will appear here once
                the loan schedule is available.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-[1050px] w-full text-left text-sm">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      EMI
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Due Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      EMI Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Principal
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Interest
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Balance
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {schedule.map((emi) => (

                    <tr
                      key={emi.id}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-6 py-4">

                        <span className="font-bold text-slate-800">
                          #{emi.installment_number}
                        </span>

                      </td>


                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatDate(
                          emi.due_date,
                        )}
                      </td>


                      <td className="whitespace-nowrap px-6 py-4 font-bold text-slate-900">
                        {formatCurrency(
                          emi.emi_amount,
                        )}
                      </td>


                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatCurrency(
                          emi.principal_amount,
                        )}
                      </td>


                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatCurrency(
                          emi.interest_amount,
                        )}
                      </td>


                      <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                        {formatCurrency(
                          emi.remaining_balance,
                        )}
                      </td>


                      <td className="px-6 py-4">

                        <StatusBadge
                          status={emi.status}
                        />

                        {emi.status ===
                          'paid' &&
                          emi.paid_date && (
                            <p className="mt-1 text-[10px] text-slate-400">
                              {formatDate(
                                emi.paid_date,
                              )}
                            </p>
                          )}

                      </td>


                      <td className="px-6 py-4">

                        {emi.status === 'paid' ? (

                          <span className="text-xs font-semibold text-green-600">
                            ✓ Completed
                          </span>

                        ) : (

                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsPaid(
                                emi,
                              )
                            }
                            disabled={
                              payingId ===
                              emi.id
                            }
                            className="whitespace-nowrap rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {payingId ===
                            emi.id
                              ? 'Processing...'
                              : 'Mark as Paid'}
                          </button>

                        )}

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =========================
            PAYMENT HISTORY
        ========================== */}

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Payment History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  All completed payments recorded for
                  this loan.
                </p>

              </div>


              <div className="rounded-xl bg-green-50 px-4 py-2">

                <p className="text-[10px] font-semibold uppercase tracking-wide text-green-600">
                  Total Paid
                </p>

                <p className="text-sm font-bold text-green-700">
                  {formatCurrency(totalPaid)}
                </p>

              </div>

            </div>

          </div>


          {payments.length === 0 ? (

            <div className="px-6 py-14 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                💳
              </div>

              <h3 className="mt-4 text-sm font-bold text-slate-800">
                No payments recorded yet
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Completed EMI payments will appear here.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="min-w-[850px] w-full text-left text-sm">

                <thead className="bg-slate-50">

                  <tr>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Payment Date
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      EMI
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Method
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Transaction Reference
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Notes
                    </th>

                  </tr>

                </thead>


                <tbody className="divide-y divide-slate-100">

                  {payments.map(
                    (payment) => {

                      const relatedEMI =
                        schedule.find(
                          (emi) =>
                            emi.id ===
                            payment.emi_schedule_id,
                        )

                      return (
                        <tr
                          key={payment.id}
                          className="transition hover:bg-slate-50"
                        >

                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {formatDate(
                              payment.payment_date,
                            )}
                          </td>


                          <td className="px-6 py-4 font-semibold text-slate-800">
                            {relatedEMI
                              ? `EMI #${relatedEMI.installment_number}`
                              : '-'}
                          </td>


                          <td className="whitespace-nowrap px-6 py-4 font-bold text-green-600">
                            {formatCurrency(
                              payment.amount,
                            )}
                          </td>


                          <td className="px-6 py-4">

                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {payment.payment_method ||
                                '-'}
                            </span>

                          </td>


                          <td className="px-6 py-4 text-slate-600">
                            {payment.transaction_reference ||
                              '-'}
                          </td>


                          <td className="max-w-xs px-6 py-4 text-slate-500">
                            {payment.notes ||
                              '-'}
                          </td>

                        </tr>
                      )
                    },
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =========================
            FOOTER NOTE
        ========================== */}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-4">

          <div className="flex items-start gap-3">

            <span className="mt-0.5">
              🔒
            </span>

            <div>

              <p className="text-sm font-semibold text-slate-700">
                Payment Information
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                Payment information shown here is based
                on the records stored in your SmartEMI
                account. Always verify important payment
                information with your lender or bank.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}


export default LoanDetails