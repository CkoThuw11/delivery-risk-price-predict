import { refreshAccessToken } from "./auth";

export async function apiFetch(url, options = {}) {
  let token = localStorage.getItem("authToken");

  // First attempt
  let res = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });

  // If token expired (401)
  if (res.status === 401) {
    const newToken = await refreshAccessToken();

    // If cannot refresh → force logout
    if (!newToken) {
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    // Retry original request
    res = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${newToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  return res;
}
