import { base44 } from "@/api/base44Client";
let cachedUser = null;
const SAFE_PROFILE_FIELDS = ["name"];

/**
 * גרסה פשוטה: משתמשת רק ב-auth של Base44
 * כדי לוודא שהאפליקציה לפחות מזהה שיש משתמש מחובר.
 * אח"כ נוכל להעמיק ולהשתמש ב-Users table.
 */
export async function getCurrentUser(forceRefresh = false) {
  try {
    if (!forceRefresh && cachedUser) return cachedUser;
    const isAuth = await base44.auth.isAuthenticated();
    if (!isAuth) return null;

    const authUser = await base44.auth.me();
    if (!authUser) return null;

    const authId = authUser.id || authUser.user_id;

    const email =
      authUser.email ||
      authUser.user?.email ||
      authUser.profile?.email ||
      "";

    const resolvedRole = (authUser.role || (email === "decifratech@gmail.com" ? "admin" : "user")).toLowerCase();
    const baseUser = {
      id: authId,      // זמני, נדרוס אם נמצא DB user
      authId,
      email,
      name: authUser.full_name || (email ? email.split("@")[0] : "User"),
      role: resolvedRole,
      plan: resolvedRole === "admin" ? "business" : "free",
      scansUsed: 0,
      auth: authUser,
    };

    // ✅ הבטחת פרופיל (יוצר ברמת service role בעת הצורך) + התראה במייל
    try {
      const resp = await base44.functions.invoke('ensureUserProfile', { notify: true });
      const dbUser = resp?.data?.user;
      if (dbUser) {
        const mergedUser = {
          ...baseUser,
          ...dbUser,
          id: dbUser.id,
          role: baseUser.role === "admin" ? "admin" : (dbUser.role || baseUser.role),
          plan: baseUser.role === "admin" ? "business" : (dbUser.plan || baseUser.plan),
          auth: authUser,
        };
        cachedUser = mergedUser;
        return mergedUser;
      }
    } catch (e) {
      console.warn("ensureUserProfile failed, trying read-only fetch");
    }

    // Fallback: קריאה ידידותית ללא יצירה
    try {
      const found = await base44.entities.Users.filter({ authId });
      const dbUser = found?.[0];
      if (dbUser) {
        const mergedUser = {
          ...baseUser,
          ...dbUser,
          id: dbUser.id,
          role: baseUser.role === "admin" ? "admin" : (dbUser.role || baseUser.role),
          plan: baseUser.role === "admin" ? "business" : (dbUser.plan || baseUser.plan),
          auth: authUser,
        };
        cachedUser = mergedUser;
        return mergedUser;
      }
      cachedUser = baseUser;
      return baseUser;
    } catch (e) {
      console.warn("Users entity read failed, using auth-only user");
      cachedUser = baseUser; // ❗ לא מחזירים null כדי לא להיכנס ללופ
      return baseUser;
    }
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    try {
      const authUser = await base44.auth.me();
      if (!authUser) return null;
      const authId = authUser.id || authUser.user_id;
      const email =
        authUser.email ||
        authUser.user?.email ||
        authUser.profile?.email ||
        "";
      return {
        id: authId,
        authId: authId,
        email: email,
        name: authUser.full_name || (email ? email.split("@")[0] : "User"),
        role: email === "decifratech@gmail.com" ? "admin" : "user",
        plan: "free",
        scansUsed: 0,
        auth: authUser,
      };
    } catch (_) {
      return null;
    }
  }
}

export async function updateUser(_userId, data = {}) {
  const safeProfile = {};

  if (typeof data.name === "string") {
    const trimmedName = data.name.trim();
    if (trimmedName) {
      safeProfile.name = trimmedName;
    }
  }

  const response = await base44.functions.invoke('ensureUserProfile', { notify: false, profile: safeProfile });
  const dbUser = response?.data?.user;
  const authUser = await base44.auth.me();

  if (!authUser || !dbUser) return dbUser || null;

  const email = authUser.email || authUser.user?.email || authUser.profile?.email || "";
  const mergedUser = {
    ...dbUser,
    authId: dbUser.authId || authUser.id || authUser.user_id,
    email: dbUser.email || email,
    name: dbUser.name || authUser.full_name || (email ? email.split("@")[0] : "User"),
    role: dbUser.role || authUser.role || "user",
    plan: dbUser.plan || "free",
    scansUsed: dbUser.scansUsed || 0,
    auth: authUser,
    safeProfileFields: SAFE_PROFILE_FIELDS,
  };

  cachedUser = mergedUser;
  return mergedUser;
}