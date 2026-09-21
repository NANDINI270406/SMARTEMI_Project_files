const API_BASE_URL = 'http://localhost:5000/api'

export async function markEMIPaid(
  paymentData,
) {
  const response = await fetch(
    `${API_BASE_URL}/payments/mark-paid`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(paymentData),
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Unable to mark EMI as paid',
    )
  }

  return data
}


export async function getLoanPayments(
  loanId,
) {
  const response = await fetch(
    `${API_BASE_URL}/payments/loan/${loanId}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Unable to fetch payment history',
    )
  }

  return data
}


export async function getPaymentSummary(
  loanId,
) {
  const response = await fetch(
    `${API_BASE_URL}/payments/loan/${loanId}/summary`,
    {
      method: 'GET',
      credentials: 'include',
    },
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
        'Unable to fetch payment summary',
    )
  }

  return data
}