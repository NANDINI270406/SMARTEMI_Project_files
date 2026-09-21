const API_BASE_URL = 'http://localhost:5000/api'


export async function getDashboardSummary() {
  const response = await fetch(
    `${API_BASE_URL}/dashboard/summary`,
    {
      method: 'GET',
      credentials: 'include',
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Unable to fetch dashboard summary',
    )
  }

  return data
}