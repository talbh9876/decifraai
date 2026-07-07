import React, { useMemo, useState } from "react";
import { createPageUrl } from "@/utils";

export default function SimulationEngine({ currentPlan = "free", onUpgrade }) {
  const isPro = currentPlan === "pro" || currentPlan === "business";

  const scenarios = useMemo(() => ([
    {
      key: "delay",
      title: "⏱ איחור / כשל בביצוע",
      desc: "כאשר קיימת אי־עמידה במועד, המסמך עלול שלא להבהיר אם יתר ההתחייבויות ממשיכות, מוקפאות או מתבטלות. ייתכן שאין מנגנון מפורש לניהול העיכוב ולסדרי העדיפויות בין הסעיפים." 
    },
    {
      key: "dispute",
      title: "⚖️ מחלוקת בין הצדדים",
      desc: "במצב של מחלוקת, נוסח שאינו חד עשוי לאפשר יותר מקריאה אחת של הוראה מרכזית. ייתכן שהמסמך אינו מגדיר מסלול מוסכם לפתרון המחלוקת או לוח זמנים ברור." 
    },
    {
      key: "exit",
      title: "🔁 יציאה חד־צדדית",
      desc: "בעת יציאה חד־צדדית, ייתכן שאין פירוט מלא של מנגנון ההודעה ותוצאותיה. המסמך עלול שלא להבהיר אילו התחייבויות נמשכות ואילו מסתיימות." 
    },
    {
      key: "change",
      title: "🔄 שינוי נסיבות",
      desc: "כאשר משתנות נסיבות מהותיות, ייתכן שהמסמך אינו מגדיר התאמות מתבקשות או סדר עדיפויות בין חיובים. הדבר עשוי ליצור פער בין הכוונה המקורית ליישום בפועל." 
    },
    {
      key: "third_party",
      title: "🧩 תלות בצד שלישי",
      desc: "כאשר ביצוע תלוי בצד שלישי, המסמך עשוי שלא להבהיר מי נושא בסיכון במקרה של כשל חיצוני. ייתכן שאין מנגנון חלופי או לוחות זמנים מתואמים." 
    },
    {
      key: "extreme",
      title: "🚨 מצב קיצון לא מוגדר",
      desc: "במקרה של אירוע קיצון, ייתכן שהמסמך אינו מגדיר במפורש כיצד מתנהלים הסעדים ומה ההשלכות על יתר ההתחייבויות. ניסוח כללי עלול להשאיר אי־בהירות מעשית." 
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
    <div className="bg-white border border-[#E5E8EB] rounded-xl p-6 shadow-sm mb-6">
      {/* Selector header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#0F1E2E]">המסמך פוגש מציאות</h3>
          <p className="text-xs text-[#6B7280] mt-1">בחר מצב מציאות לבחינה</p>
        </div>
        <div className="text-[11px] text-[#6B7280]">
          פתוח: {isPro ? total : 1} מתוך {total} מצבים
        </div>
      </div>

      {/* Scenarios buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
        {scenarios.map((s, i) => {
          const locked = !canSelect(i);
          const active = selected === i;
          return (
            <button
              key={s.key}
              onClick={() => (locked ? handleUpgrade() : setSelected(i))}
              className={[
                "w-full text-right px-3 py-2 rounded-lg border transition-colors",
                active ? "bg-[#F3F4F6] border-[#E5E8EB] text-[#0F1E2E]" : "bg-white border-[#E5E8EB] text-[#4A5568] hover:bg-[#F8F9FB]",
              ].join(" ")}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm">{s.title}</span>
                {locked && <span className="text-[11px] text-[#9CA3AF]">🔒</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Result area */}
      <div className="rounded-xl border border-[#E5E8EB] bg-[#F8F9FB] p-5">
        <div className="text-sm font-semibold text-[#0F1E2E] mb-2">
          תוצאת סימולציה: {scenarios[selected].title.replace(/^(.{2})\s/, "")}
        </div>
        <div className="text-sm text-[#4A5568] leading-relaxed space-y-2">
          <p>{scenarios[selected].desc}</p>
          <p>נקודה זו לרוב מתבררת רק לאחר שמתעוררת מחלוקת.</p>
        </div>

        {!isPro && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[12px] text-[#6B7280]">🔒 סימולציות נוספות זמינות ב‑Pro</span>
            <button
              onClick={handleUpgrade}
              className="text-xs text-[#1E63F0] hover:underline"
            >
              פתח את מנוע הסימולציה המלא
            </button>
          </div>
        )}
      </div>
    </div>
  );
}