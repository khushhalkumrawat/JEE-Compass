export interface Student {
  id: string;
  name: string;
  email: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  student?: Student;
  message?: string;
}

const API_URL = "http://localhost:5000/api/auth";
const TOKEN_KEY = "jee_compass_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStudent(): Student | null {
  const savedStudent = localStorage.getItem("jee_compass_student");

  if (!savedStudent) return null;

  try {
    return JSON.parse(savedStudent) as Student;
  } catch {
    localStorage.removeItem("jee_compass_student");
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("jee_compass_student");
}

async function authRequest(
  endpoint: string,
  payload: Record<string, string>
): Promise<{ token: string; student: Student }> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Cannot connect to the server. Make sure the backend is running."
    );
  }

  let data: AuthResponse;

  try {
    data = (await response.json()) as AuthResponse;
  } catch {
    throw new Error("The server returned an invalid response.");
  }

  if (!response.ok || !data.success || !data.token || !data.student) {
    throw new Error(data.message || "Authentication failed.");
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem("jee_compass_student", JSON.stringify(data.student));

  return {
    token: data.token,
    student: data.student,
  };
}

export function registerStudent(
  name: string,
  email: string,
  password: string
) {
  return authRequest("register", { name, email, password });
}

export function loginStudent(email: string, password: string) {
  return authRequest("login", { email, password });
}

export async function fetchCurrentStudent(): Promise<Student> {
  const token = getToken();

  if (!token) {
    throw new Error("Please log in to continue.");
  }

  const response = await fetch(`${API_URL}/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = (await response.json()) as {
    success: boolean;
    student?: Student;
    message?: string;
  };

  if (!response.ok || !data.success || !data.student) {
    logout();
    throw new Error(data.message || "Unable to verify your session.");
  }

  localStorage.setItem("jee_compass_student", JSON.stringify(data.student));

  return data.student;
}
