const API_BASE_URL = '/api'


async function handleResponse(response) {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
      'Notification request failed.'
    )
  }

  return data
}


/**
 * Get all notifications.
 */
export async function getNotifications(
  unreadOnly = false
) {
  const response = await fetch(
    `${API_BASE_URL}/api/notifications?unread_only=${unreadOnly}`,
    {
      method: 'GET',
      credentials: 'include',
    }
  )

  return handleResponse(response)
}


/**
 * Get unread notification count.
 */
export async function getUnreadNotificationCount() {
  const response = await fetch(
    `${API_BASE_URL}/api/notifications/unread-count`,
    {
      method: 'GET',
      credentials: 'include',
    }
  )

  return handleResponse(response)
}


/**
 * Mark one notification as read.
 */
export async function markNotificationAsRead(
  notificationId
) {
  const response = await fetch(
    `${API_BASE_URL}/api/notifications/${notificationId}/read`,
    {
      method: 'PATCH',
      credentials: 'include',
    }
  )

  return handleResponse(response)
}


/**
 * Mark all notifications as read.
 */
export async function markAllNotificationsAsRead() {
  const response = await fetch(
    `${API_BASE_URL}/api/notifications/read-all`,
    {
      method: 'PATCH',
      credentials: 'include',
    }
  )

  return handleResponse(response)
}


/**
 * Delete one notification.
 */
export async function deleteNotification(
  notificationId
) {
  const response = await fetch(
    `${API_BASE_URL}/api/notifications/${notificationId}`,
    {
      method: 'DELETE',
      credentials: 'include',
    }
  )

  return handleResponse(response)
}


/**
 * Generate upcoming EMI notifications.
 */
export async function generateUpcomingNotifications(
  daysAhead = 7
) {
  const response = await fetch(
    `${API_BASE_URL}/api/notifications/generate-upcoming`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        days_ahead: daysAhead,
      }),
    }
  )

  return handleResponse(response)
}


/**
 * Generate overdue EMI notifications.
 */
export async function generateOverdueNotifications() {
  const response = await fetch(
    `${API_BASE_URL}/api/notifications/generate-overdue`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  )

  return handleResponse(response)
}
