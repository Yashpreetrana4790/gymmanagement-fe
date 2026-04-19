const API_URL = process.env.API_URL ?? "http://localhost:5000";

type ApiResponse<T = unknown> = { success: boolean; message?: string } & T;

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<ApiResponse<T>> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err) {
    console.error(`[API] Network error on ${options.method ?? "GET"} ${path}:`, err);
    return { success: false, message: "Cannot reach the server. Please check your connection." } as ApiResponse<T>;
  }

  const text = await res.text();
  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    console.error(`[API] Non-JSON response from ${options.method ?? "GET"} ${path} (HTTP ${res.status}):`, text.slice(0, 500));
    return {
      success: false,
      message: res.status >= 500
        ? "Server error. Please try again later."
        : `Unexpected response from server (HTTP ${res.status}).`,
    } as ApiResponse<T>;
  }
}

export const api = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: "GET" }, token),

  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }, token),

  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }, token),

  patch: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }, token),

  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: "DELETE" }, token),
};
