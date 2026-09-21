const API_BASE_URL = '/api'

export async function askAIAssistant(question) {
  const response = await fetch(
    `${API_BASE_URL}/ai-assistant`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        question,
      }),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(
      data.message ||
      'Unable to connect to AI Assistant.'
    )
  }

  return data
}

