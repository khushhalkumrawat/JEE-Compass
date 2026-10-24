import { API_BASE_URL } from "./config";
import { getToken } from "./auth";

export interface DPPProgressData {
answered: Record<number, string>;
correct: number[];
}

interface DPPResponse {
success: boolean;
progress?: DPPProgressData;
message?: string;
}

const EMPTY_PROGRESS: DPPProgressData = {
answered: {},
correct: [],
};

const FRIENDLY_ERROR = "Something went wrong. Please try again.";

async function readResponse(response: Response): Promise<DPPResponse> {
const contentType = response.headers.get("content-type") || "";

if (!contentType.includes("application/json")) {
console.error("DPP API returned a non-JSON response.");
throw new Error(FRIENDLY_ERROR);
}

let data: DPPResponse;

try {
data = (await response.json()) as DPPResponse;
} catch (error) {
console.error("Failed to parse DPP API response:", error);
throw new Error(FRIENDLY_ERROR);
}

if (!response.ok || !data.success) {
console.error("DPP API request failed with status:", response.status);
throw new Error(FRIENDLY_ERROR);
}

return data;
}

function getAuthHeaders(): HeadersInit {
const token = getToken();

if (!token) {
throw new Error("Please log in again to access your progress.");
}

return {
Authorization: `Bearer ${token}`,
};
}

export async function fetchDPPProgress(): Promise<DPPProgressData> {
try {
const response = await fetch(`${API_BASE_URL}/dpp-progress`, {
headers: getAuthHeaders(),
});

const data = await readResponse(response);
return data.progress ?? EMPTY_PROGRESS;

} catch (error) {
console.error("Unable to fetch DPP progress:", error);

if (error instanceof Error && error.message.startsWith("Please log in")) {
  throw error;
}

throw new Error(FRIENDLY_ERROR);

}
}

export async function saveDPPProgress(
progress: DPPProgressData,
): Promise<void> {
try {
const response = await fetch(`${API_BASE_URL}/dpp-progress`, {
method: "PUT",
headers: {
...getAuthHeaders(),
"Content-Type": "application/json",
},
body: JSON.stringify(progress),
});

await readResponse(response);

} catch (error) {
console.error("Unable to save DPP progress:", error);

if (error instanceof Error && error.message.startsWith("Please log in")) {
  throw error;
}

throw new Error(FRIENDLY_ERROR);

}
}
