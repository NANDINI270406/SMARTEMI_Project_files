const API_BASE_URL =
  'http://localhost:5000/api'


export async function getReportSummary(
  month,
  year,
) {

  const response = await fetch(
    `${API_BASE_URL}/reports/summary?month=${month}&year=${year}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Unable to fetch report',
    )
  }

  return data
}