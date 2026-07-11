export function getAuthHeaders(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const token = localStorage.getItem("sparkle_token");
  if (token) return { Authorization: `Bearer ${token}` };
  return {};
}
