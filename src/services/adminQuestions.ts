import { API_BASE_URL } from "./config";
import { getToken } from "./auth";

const API_URL = `${API_BASE_URL}/questions`;

export interface AdminQuestion {
  id: string;
  subject: "Physics" | "Chemistry" | "Mathematics";
  topic: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  type: "SINGLE_CORRECT" | "NUMERICAL";
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  imageUrl: string;
  explanationImageUrl: string;
  marks: number;
  negativeMarks: number;
  status: "DRAFT" | "PUBLISHED";
}

export type QuestionInput = Omit<AdminQuestion, "id">;

async function request<T>(
  endpoint = "",
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in again.");
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Question request failed.");
  }

  return data as T;
}

export function fetchAdminQuestions(filters?: {
  subject?: string;
  status?: string;
  difficulty?: string;
}) {
  const params = new URLSearchParams();

  if (filters?.subject) params.set("subject", filters.subject);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.difficulty) params.set("difficulty", filters.difficulty);

  const query = params.toString();

  return request<{ success: boolean; total: number; questions: AdminQuestion[] }>(
    query ? `?${query}` : ""
  );
}

export function createQuestion(input: QuestionInput) {
  return request<{ success: boolean; message: string; question: AdminQuestion }>(
    "",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  );
}

export function updateQuestion(id: string, input: QuestionInput) {
  return request<{ success: boolean; message: string; question: AdminQuestion }>(
    `/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    }
  );
}

export function deleteQuestion(id: string) {
  return request<{ success: boolean; message: string }>(
    `/${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
}
