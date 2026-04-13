const API_URL = process.env.API_URL ?? "http://localhost:5000";
async function request(path, options = {}, token) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...token ? { Authorization: `Bearer ${token}` } : {},
        ...options.headers
      }
    });
  } catch (err) {
    console.error(`[API] Network error on ${options.method ?? "GET"} ${path}:`, err);
    return { success: false, message: "Cannot reach the server. Please check your connection." };
  }
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error(`[API] Non-JSON response from ${options.method ?? "GET"} ${path} (HTTP ${res.status}):`, text.slice(0, 500));
    return {
      success: false,
      message: res.status >= 500 ? "Server error. Please try again later." : `Unexpected response from server (HTTP ${res.status}).`
    };
  }
}
const api = {
  get: (path, token) => request(path, { method: "GET" }, token),
  post: (path, body, token) => request(path, { method: "POST", body: JSON.stringify(body) }, token),
  put: (path, body, token) => request(path, { method: "PUT", body: JSON.stringify(body) }, token),
  delete: (path, token) => request(path, { method: "DELETE" }, token)
};
export {
  api
};
