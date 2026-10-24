import type { TestResult } from "../types/test";
import { getToken } from "./auth";

const API_URL = "http://localhost:5000/api/test-results";

async function authenticatedRequest(
  url: string,
  options: RequestInit = {},
) {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in to continue.");
  }

  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to the server. Make sure the backend is running.",
    );
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Your session has expired. Please log in again.");
    }

    throw new Error(
      data?.message || `Request failed with status ${response.status}.`,
    );
  }

  return data;
}

export async function saveTestResult(result: TestResult) {
  return authenticatedRequest(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  });
}

export async function getTestResult(testId: string) {
  return authenticatedRequest(
    `${API_URL}/${encodeURIComponent(testId)}`,
  );
}

export async function getTestHistory() {
  return authenticatedRequest(API_URL);
}

export async function updateMistakeTypes(
  testId: string,
  mistakeTypes: Record<string, string>,
) {
  return authenticatedRequest(
    `${API_URL}/${encodeURIComponent(testId)}/mistakes`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ mistakeTypes }),
    },
  );
}
