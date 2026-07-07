export function isDevMode() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get("dev") === "1") return true;
    return localStorage.getItem("DEV_MODE") === "1";
  } catch {
    return false;
  }
}

// Authorized developer identifiers — fill with your own values
const ALLOWED_EMAILS = [
  // "admin@yourdomain.com",
];
const ALLOWED_AUTH_IDS = [
  // "auth_123",
];

export function isAdminUser(currentUser) {
  if (!currentUser) return false;
  const role = (currentUser.role || currentUser.auth?.role || "").toLowerCase();
  if (role === "admin") return true;
  const email = (currentUser.email || currentUser.user?.email || "").toLowerCase();
  const authId = currentUser.authId || currentUser.id || currentUser.user?.id;
  return (
    (email && ALLOWED_EMAILS.includes(email)) ||
    (authId && ALLOWED_AUTH_IDS.includes(String(authId)))
  );
}

export function canBypassPlan(currentUser) {
  // Only real admins bypass plan restrictions; everyone else follows their current plan.
  return isAdminUser(currentUser);
}