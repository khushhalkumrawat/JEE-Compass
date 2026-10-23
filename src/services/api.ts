export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface AskDoubtPayload {
  question: string
  subject: string
  topic: string
  history: ChatMessage[]
}

interface AskDoubtResponse {
  success?: boolean
  answer?: string
  message?: string
}

export async function askDoubt(payload: AskDoubtPayload): Promise<string> {
  let response: Response
  try {
    response = await fetch('/api/doubts/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(90000),
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'TimeoutError') {
      throw new Error('The request timed out. Please try again.')
    }
    throw new Error('Cannot reach server. Ensure backend is running on port 5000.')
  }

  const rawText = await response.text()
  let data: AskDoubtResponse

  try {
    data = JSON.parse(rawText) as AskDoubtResponse
  } catch {
    throw new Error('Server returned an unreadable response. Please check server console.')
  }

  if (!response.ok || !data.success || !data.answer) {
    throw new Error(data.message || `Server error (${response.status})`)
  }

  return data.answer
}