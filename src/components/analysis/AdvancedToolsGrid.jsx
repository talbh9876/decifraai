import React from "react";
import { Lock, GitCompare, Scale, Download, MessageCircle } from "lucide-react";
import { createPageUrl } from "@/utils";

const Tile = ({ title, desc, locked, onClick, onUpgrade }) => (
  <button
    onClick={locked ? onUpgrade : onClick}
    className={[
      "relative text-start bg-white border border-[#E5E8EB] rounded-xl p-4 shadow-sm transition-colors",
      "hover:bg-[#F8F9FB]"
    ].join(" ")}
  >
    {locked && (
      <span className="absolute top-3 left-3 text-[#9CA3AF]"><Lock className="w-3.5 h-3.5" /></span>
    )}
    <div className="text-sm font-semibold text-[#0F1E2E] mb-1">{title}</div>
    <div className="text-xs text-[#6B7280]">{desc}</div>
    {locked && (
      <div className="mt-2 text-[11px] text-[#1E63F0]">פתח ב‑Pro</div>
    )}
  </button>
);

export default function AdvancedToolsGrid({ currentPlan = "free", onOpenFeature, onUpgrade }) {
  const isPro = currentPlan === "pro" || currentPlan === "business";

  const handleUpgrade = () => {
    if (typeof onUpgrade === "function") return onUpgrade();
    window.location.href = createPageUrl("Upgrade?plan=pro");
  };

  return (
    <div className="bg-white border border-[#E5E8EB] rounded-xl p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
          <Download className="w-4 h-4 text-[#1E63F0]" />
        </div>
        <h3 className="text-sm font-semibold text-[#0F1E2E]">כלים מתקדמים</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Tile
          title="השוואת מסמכים"
          desc="זיהוי שינויים והבדלים מהותיים"
          locked={!isPro}
          onClick={() => onOpenFeature && onOpenFeature("compare")}
          onUpgrade={handleUpgrade}
        />
        <Tile
          title="חיפוש משפטי"
          desc="איתור תקדימים והפניות רלוונטיות"
          locked={!isPro}
          onClick={() => onOpenFeature && onOpenFeature("legal_research")}
          onUpgrade={handleUpgrade}
        />
        <Tile
          title="ייצוא PDF/Word"
          desc="שיתוף ותיעוד נוח של ממצאים"
          locked={!isPro}
          onClick={() => onOpenFeature && onOpenFeature("export")}
          onUpgrade={handleUpgrade}
        />
        <Tile
          title="צ׳אט על המסמך"
          desc="שאלות נקודתיות על הטקסט"
          locked={!isPro}
          onClick={() => onOpenFeature && onOpenFeature("chat")}
          onUpgrade={handleUpgrade}
        />
      </div>
    </div>
  );
}