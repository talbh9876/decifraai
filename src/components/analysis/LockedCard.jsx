import React from "react";
import { Lock } from "lucide-react";

export default function LockedCard({ requiredPlan = "pro", title = "פיצ'ר נעול", description = "שדרג כדי לפתוח", onOpen }) {
  const planLabelMap = { beginner: "Beginner", pro: "Pro", business: "Business" };
  const label = planLabelMap[requiredPlan] || requiredPlan;

  return (
    <div className="border border-[#E5E8EB] bg-white rounded-xl p-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[#0A2A43]">{title}</h3>
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">
          <span className="opacity-70">🔒</span>
          <span>{label}</span>
        </span>
      </div>
      {description && <p className="text-xs text-[#4A5568] mb-1">{description}</p>}
      <button type="button" onClick={onOpen} className="text-xs text-[#1E63F0] hover:underline">שדרג →</button>
    </div>
  );
}