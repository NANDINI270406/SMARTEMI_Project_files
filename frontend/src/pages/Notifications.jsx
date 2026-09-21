import { useEffect, useState } from 'react'

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  generateUpcomingNotifications,
  generateOverdueNotifications,
} from '../services/notificationService'


function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}


function getTypeDetails(type) {
  if (type === 'emi_reminder') {
    return {
      label: 'EMI Reminder',
      icon: '📅',
      iconBg: 'bg-blue-100',
      iconText: 'text-blue-700',
      badge:
        'bg-blue-50 text-blue-700 ring-blue-200',
    }
  }

  if (type === 'overdue_emi') {
    return {
      label: 'Overdue EMI',
      icon: '⚠️',
      iconBg: 'bg-red-100',
      iconText: 'text-red-700',
      badge:
        'bg-red-50 text-red-700 ring-red-200',
    }
  }

  if (type === 'payment') {
    return {
      label: 'Payment',
      icon: '💳',
      iconBg: 'bg-green-100',
      iconText: 'text-green-700',
      badge:
        'bg-green-50 text-green-700 ring-green-200',
    }
  }

  return {
    label: 'General',
    icon: '🔔',
    iconBg: 'bg-slate-100',
    iconText: 'text-slate-700',
    badge:
      'bg-slate-100 text-slate-700 ring-slate-200',
  }
}


function NotificationCard({
  notification,
  onMarkRead,
  onDelete,
  markingId,
  deletingId,
}) {
  const typeDetails = getTypeDetails(
    notification.notification_type,
  )

  const unread = !notification.is_read

  return (
    <div
      className={`rounded-2xl border p-5 transition ${
        unread
          ? 'border-blue-200 bg-blue-50/40 shadow-sm'
          : 'border-slate-200 bg-white hover:shadow-sm'
      }`}
    >
      <div className="flex gap-4">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-lg ${typeDetails.iconBg} ${typeDetails.iconText}`}
        >
          {typeDetails.icon}
        </div>


        <div className="min-w-0 flex-1">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <h3 className="text-sm font-bold text-slate-900">
                  {notification.title}
                </h3>

                {unread && (
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                )}

              </div>

              <p className="mt-1 text-xs text-slate-400">
                {formatDateTime(
                  notification.created_at,
                )}
              </p>

            </div>


            <span
              className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${typeDetails.badge}`}
            >
              {typeDetails.label}
            </span>

          </div>


          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-600">
            {notification.message}
          </p>


          <div className="mt-4 flex flex-wrap gap-2">

            {unread && (
              <button
                type="button"
                onClick={() =>
                  onMarkRead(notification.id)
                }
                disabled={
                  markingId === notification.id
                }
                className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {markingId === notification.id
                  ? 'Marking...'
                  : '✓ Mark as read'}
              </button>
            )}


            <button
              type="button"
              onClick={() =>
                onDelete(notification.id)
              }
              disabled={
                deletingId === notification.id
              }
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deletingId === notification.id
                ? 'Deleting...'
                : 'Delete'}
            </button>

          </div>

        </div>

      </div>
    </div>
  )
}


function Notifications() {
  const [notifications, setNotifications] =
    useState([])

  const [unreadCount, setUnreadCount] =
    useState(0)

  const [loading, setLoading] =
    useState(true)

  const [refreshing, setRefreshing] =
    useState(false)

  const [error, setError] =
    useState('')

  const [successMessage, setSuccessMessage] =
    useState('')

  const [markingId, setMarkingId] =
    useState(null)

  const [deletingId, setDeletingId] =
    useState(null)

  const [generatingUpcoming, setGeneratingUpcoming] =
    useState(false)

  const [generatingOverdue, setGeneratingOverdue] =
    useState(false)


  async function loadNotifications(
    fullLoading = true,
  ) {
    try {
      if (fullLoading) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }

      setError('')

      const [
        notificationsResponse,
        unreadResponse,
      ] = await Promise.all([
        getNotifications(false),
        getUnreadNotificationCount(),
      ])

      setNotifications(
        notificationsResponse?.data || [],
      )

      setUnreadCount(
        unreadResponse?.data?.unread_count || 0,
      )
    } catch (err) {
      setError(
        err.message ||
          'Unable to load notifications.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }


  useEffect(() => {
    loadNotifications()
  }, [])


  function showSuccess(message) {
    setSuccessMessage(message)

    setTimeout(() => {
      setSuccessMessage('')
    }, 4000)
  }


  async function handleMarkRead(notificationId) {
    try {
      setMarkingId(notificationId)
      setError('')

      await markNotificationAsRead(
        notificationId,
      )

      setNotifications((current) =>
        current.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification,
        ),
      )

      setUnreadCount((current) =>
        Math.max(0, current - 1),
      )

      showSuccess(
        'Notification marked as read.',
      )
    } catch (err) {
      setError(
        err.message ||
          'Unable to mark notification as read.',
      )
    } finally {
      setMarkingId(null)
    }
  }


  async function handleMarkAllRead() {
    if (unreadCount === 0) {
      return
    }

    try {
      setError('')

      await markAllNotificationsAsRead()

      setNotifications((current) =>
        current.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      )

      setUnreadCount(0)

      showSuccess(
        'All notifications marked as read.',
      )
    } catch (err) {
      setError(
        err.message ||
          'Unable to mark all notifications as read.',
      )
    }
  }


  async function handleDelete(notificationId) {
    try {
      setDeletingId(notificationId)
      setError('')

      const notification =
        notifications.find(
          (item) => item.id === notificationId,
        )

      await deleteNotification(notificationId)

      setNotifications((current) =>
        current.filter(
          (item) => item.id !== notificationId,
        ),
      )

      if (
        notification &&
        !notification.is_read
      ) {
        setUnreadCount((current) =>
          Math.max(0, current - 1),
        )
      }

      showSuccess(
        'Notification deleted.',
      )
    } catch (err) {
      setError(
        err.message ||
          'Unable to delete notification.',
      )
    } finally {
      setDeletingId(null)
    }
  }


  async function handleGenerateUpcoming() {
    try {
      setGeneratingUpcoming(true)
      setError('')

      const response =
        await generateUpcomingNotifications(7)

      const count =
        response?.data?.length || 0

      await loadNotifications(false)

      if (count > 0) {
        showSuccess(
          `${count} upcoming EMI reminder${
            count === 1 ? '' : 's'
          } generated.`,
        )
      } else {
        showSuccess(
          'No new upcoming EMI reminders were required.',
        )
      }
    } catch (err) {
      setError(
        err.message ||
          'Unable to generate upcoming EMI reminders.',
      )
    } finally {
      setGeneratingUpcoming(false)
    }
  }


  async function handleGenerateOverdue() {
    try {
      setGeneratingOverdue(true)
      setError('')

      const response =
        await generateOverdueNotifications()

      const count =
        response?.data?.length || 0

      await loadNotifications(false)

      if (count > 0) {
        showSuccess(
          `${count} overdue EMI alert${
            count === 1 ? '' : 's'
          } generated.`,
        )
      } else {
        showSuccess(
          'No new overdue EMI alerts were required.',
        )
      }
    } catch (err) {
      setError(
        err.message ||
          'Unable to generate overdue EMI alerts.',
      )
    } finally {
      setGeneratingOverdue(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
        <div className="mx-auto max-w-5xl">

          <div className="mb-8">
            <div className="h-8 w-56 animate-pulse rounded-lg bg-slate-200" />
            <div className="mt-3 h-4 w-80 animate-pulse rounded bg-slate-200" />
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-36 animate-pulse rounded-2xl bg-white shadow-sm ring-1 ring-slate-200"
              />
            ))}
          </div>

        </div>
      </div>
    )
  }


  const readCount = Math.max(
    0,
    notifications.length - unreadCount,
  )


  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="flex flex-wrap items-center gap-3">

              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Notifications
              </h1>

              {unreadCount > 0 && (
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600 ring-1 ring-red-200">
                  {unreadCount} unread
                </span>
              )}

            </div>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Stay updated with upcoming EMIs,
              overdue payments, and SmartEMI activity.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={() =>
                loadNotifications(false)
              }
              disabled={refreshing}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            >
              {refreshing
                ? 'Refreshing...'
                : '↻ Refresh'}
            </button>


            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ✓ Mark all read
            </button>

          </div>

        </div>


        {/* SUCCESS */}

        {successMessage && (
          <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
            ✓ {successMessage}
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div className="mb-5 flex items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            <span>
              ⚠️ {error}
            </span>

            <button
              type="button"
              onClick={() => setError('')}
              className="text-lg text-red-400 hover:text-red-700"
            >
              ×
            </button>

          </div>
        )}


        {/* REMINDER TOOLS */}

        <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-5 md:px-6">

            <h2 className="font-bold text-slate-900">
              EMI Reminder Tools
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Generate reminders from your EMI schedules.
            </p>

          </div>


          <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">

            {/* UPCOMING */}

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">
                  📅
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Upcoming EMI
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Generate reminders for EMIs due
                    within the next 7 days.
                  </p>
                </div>

              </div>


              <button
                type="button"
                onClick={handleGenerateUpcoming}
                disabled={generatingUpcoming}
                className="mt-4 w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {generatingUpcoming
                  ? 'Generating...'
                  : 'Generate Upcoming Reminders'}
              </button>

            </div>


            {/* OVERDUE */}

            <div className="rounded-2xl border border-red-100 bg-red-50/60 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-lg">
                  ⚠️
                </div>

                <div>
                  <h3 className="font-bold text-slate-900">
                    Overdue EMI
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Generate alerts for pending EMIs
                    whose due dates have passed.
                  </p>
                </div>

              </div>


              <button
                type="button"
                onClick={handleGenerateOverdue}
                disabled={generatingOverdue}
                className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {generatingOverdue
                  ? 'Generating...'
                  : 'Generate Overdue Alerts'}
              </button>

            </div>

          </div>

        </div>


        {/* SUMMARY */}

        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Total
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {notifications.length}
            </p>

          </div>


          <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-sm">

            <p className="text-xs font-medium uppercase tracking-wide text-blue-500">
              Unread
            </p>

            <p className="mt-1 text-2xl font-bold text-blue-700">
              {unreadCount}
            </p>

          </div>


          <div className="col-span-2 rounded-2xl border border-green-200 bg-green-50/50 p-4 shadow-sm md:col-span-1">

            <p className="text-xs font-medium uppercase tracking-wide text-green-600">
              Read
            </p>

            <p className="mt-1 text-2xl font-bold text-green-700">
              {readCount}
            </p>

          </div>

        </div>


        {/* NOTIFICATION LIST */}

        {notifications.length === 0 ? (

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
              🔔
            </div>

            <h2 className="mt-5 text-lg font-bold text-slate-900">
              You're all caught up
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You don't have any notifications yet.
              Upcoming and overdue EMI alerts will
              appear here.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
                markingId={markingId}
                deletingId={deletingId}
              />
            ))}

          </div>

        )}


        {/* DISCLAIMER */}

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">

          <div className="flex items-start gap-3">

            <span>💡</span>

            <div>

              <p className="text-sm font-semibold text-amber-800">
                SmartEMI Reminder Note
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Notifications are generated from the
                EMI schedules stored in SmartEMI.
                Always verify payment status with your
                lender or bank before taking financial
                action.
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}


export default Notifications