export function normalizePlan(str) {
  const s = (str || "").toString().trim().toLowerCase();
  if (["free", "beginner", "pro", "business"].includes(s)) return s;
  return "free";
}

const RANK = { free: 0, beginner: 1, pro: 2, business: 3 };

export function planRank(plan) {
  return RANK[normalizePlan(plan)] ?? 0;
}

export function canAccess(currentPlan, requiredPlan) {
  if (!requiredPlan) return true; // no requirement
  return planRank(currentPlan) >= planRank(requiredPlan);
}