export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface AskDoubtPayload {
  question: string;
  subject: string;
  topic: string;
  history: ChatMessage[];
}

interface AskDoubtResponse {
  success?: boolean;
  answer?: string;
  message?: string;
}

export async function askDoubt(payload: AskDoubtPayload): Promise<string> {
  let response: Response;

  try {
    response = await fetch("/api/doubts/ask", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(60000),
    });
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error("The tutor took too long to respond. Please try again.");
    }

    throw new Error(
      "Cannot connect to the AI server. Check that your backend is running.",
    );
  }

  let data: AskDoubtResponse;

  try {
    data = (await response.json()) as AskDoubtResponse;
  } catch {
    throw new Error(
      "The AI server returned an invalid response. Please try again.",
    );
  }

  if (!response.ok || !data.success || !data.answer) {
    throw new Error(
      data.message || `The AI server returned an error (${response.status}).`,
    );
  }

  return data.answer;
}
