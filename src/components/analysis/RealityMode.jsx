import React, { useState, useMemo } from "react";
import { Lock } from "lucide-react";
import { createPageUrl } from "@/utils";

export default function RealityMode({ currentPlan = "free", onUpgrade }) {
  const isPro = currentPlan === "pro" || currentPlan === "business";

  const scenarios = useMemo(() => ([
    {
      key: "delay",
      title: "איחור/כשל",
      desc: "כאשר קיימת אי־עמידה במועד, ייתכן שהמסמך אינו מבהיר אם יתר ההתחייבויות ממשיכות, מוקפאות או מתבטלות." 
    },
    {
      key: "cancel",
      title: "ביטול/יציאה",
      desc: "במצב של יציאה מוקדמת, ייתכן שאין פירוט מלא של מנגנון הודעה ותוצאות אפשריות." 
    },
    {
      key: "interpret",
      title: "מחלוקת על פרשנות",
      desc: "נוסח שאינו חד עשוי לאפשר יותר מקריאה אחת ולהאריך את ההליך." 
    },
    {
      key: "change",
      title: "שינוי נסיבות",
      desc: "בעת שינוי מהותי, ייתכן שאין הוראה המגדירה התאמות מתבקשות או סדרי עדיפויות." 
    },
    {
      key: "unclear",
      title: "סעיף לא חד",
      desc: "ניסוח כללי עלול ליצור ציפיות סותרות ולהגדיל חשיפה." 
    },
    {
      key: "chain",
      title: "תלות בין סעיפים",
      desc: "בהיעדר הפניה מפורשת, סעיף תלוי עשוי להתפרש בניתוק מהוראות משלימות." 
    },
    {
      key: "enforce",
      title: "אכיפה וסעדים",
      desc: "ייתכן שאין פירוט של אמצעי אכיפה או סדרי עדיפות בעת מחלוקת." 
    },
  ]), []);

  const [selected, setSelected] = useState(0);
  const total = scenarios.length;
  const canSelect = (index) => isPro || index === 0;

  const handleUpgrade = () => {
    if (typeof onUpgrade === "function") return onUpgrade();
    window.location.href = createPageUrl("Upgrade?plan=pro");
  };

  return (
    <div className="bg-white border border-[#E5E8EB] rounded-xl p-5 shadow-sm mb-6">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#0F1E2E]">המסמך פוגש מציאות</h3>
          <p className="text-xs text-[#6B7280] mt-1">בחר מצב מציאות לבחינה</p>
        </div>
        <div className="text-[11px] text-[#6B7280]">{(selected + 1)} מתוך {total}</div>
      </div>

      <div className="flex gap-2 overflow-x-auto whitespace-nowrap no-scrollbar pb-1 -mx-1 px-1">
        {scenarios.map((s, i) => {
          const locked = !canSelect(i);
          const active = selected === i;
          return (
            <button
              key={s.key}
              onClick={() => (locked ? handleUpgrade() : setSelected(i))}
              className={[
                "px-3 py-1.5 rounded-full text-xs border transition-colors",
                active ? "bg-[#F3F4F6] border-[#E5E8EB] text-[#0F1E2E]" : "bg-white border-[#E5E8EB] text-[#4A5568] hover:bg-[#F8F9FB]",
                locked ? "opacity-70" : ""
              ].join(" ")}
            >
              <span className="inline-flex items-center gap-1">
                {s.title}
                {locked && <Lock className="w-3 h-3 text-[#9CA3AF]" />}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-[#F8F9FB] border border-[#E5E8EB] rounded-lg text-sm text-[#4A5568] leading-relaxed">
        {scenarios[selected].desc}
      </div>

      {!isPro && (
        <div className="mt-3 flex items-center justify-between">
          <div className="text-[11px] text-[#6B7280]">מצב אחד זמין בחינם</div>
          <button
            onClick={handleUpgrade}
            className="text-xs text-[#1E63F0] hover:underline inline-flex items-center gap-1"
          >
            פתח את כל מצבי המציאות (Pro)
          </button>
        </div>
      )}
    </div>
  );
}