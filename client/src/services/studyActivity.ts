import { API_BASE_URL } from "./config";
import { getToken } from "./auth";

interface StudyActivityResponse {
  success: boolean;
  streak: number;
  activeDates: string[];
}

export async function getStudyStreak(): Promise<number> {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in to view your study streak.");
  }

  const response = await fetch(`${API_BASE_URL}/study-activity`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as StudyActivityResponse;

  if (!response.ok || !data.success) {
    throw new Error("Unable to load study streak.");
  }

  return data.streak;
}