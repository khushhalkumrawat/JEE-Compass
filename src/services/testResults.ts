import type { TestResult } from "../types/test";

const API_URL = "http://localhost:5000/api/test-results";

export async function saveTestResult(result: TestResult) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(result),
  });

  if (!response.ok) {
    throw new Error("Failed to save test result");
  }

  return response.json();
}

export async function getTestResult(testId: string) {
  const response = await fetch(
    `${API_URL}/${encodeURIComponent(testId)}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch test result");
  }

  return response.json();
}

export async function getTestHistory() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch test history");
  }

  return response.json();
}