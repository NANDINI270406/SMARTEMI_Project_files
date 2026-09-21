const API_BASE_URL = '/api'


export async function getLoans() {
  const response = await fetch(
    `${API_BASE_URL}/loans`,
    {
      method: 'GET',
      credentials: 'include',
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Unable to fetch loans',
    )
  }

  return data
}


export async function getLoanSchedule(
  loanId,
) {
  const response = await fetch(
    `${API_BASE_URL}/loans/${loanId}/schedule`,
    {
      method: 'GET',
      credentials: 'include',
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Unable to fetch EMI schedule',
    )
  }

  return data
}
