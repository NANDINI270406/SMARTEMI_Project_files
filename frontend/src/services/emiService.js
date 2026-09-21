const API_BASE_URL = 'http://localhost:5000/api'


export async function calculateEMI(loanData) {
  const response = await fetch(
    `${API_BASE_URL}/emi/calculate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(loanData),
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message || 'Unable to calculate EMI',
    )
  }

  return data
}


export async function generateAmortizationSchedule(
  loanData,
) {
  const response = await fetch(
    `${API_BASE_URL}/emi/schedule`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(loanData),
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Unable to generate amortization schedule',
    )
  }

  return data
}