export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return null;

  try {
    const res = await fetch("http://127.0.0.1:8000/user/api/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await res.json();

    if (res.ok && data.access) {
      localStorage.setItem("authToken", data.access);
      return data.access;
    }
  } catch (err) {
    console.error("Token refresh failed:", err);
  }

  return null;
}
