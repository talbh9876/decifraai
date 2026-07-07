import React from "react";
import { Clock, Coins, CheckCircle2 } from "lucide-react";

export default function ComparisonStrip() {
  const items = [
    {
      title: "קריאה ידנית",
      metrics: [
        { icon: Clock, label: "זמן: שעות/ימים" },
        { icon: Coins, label: "עלות: נסתרת" },
        { icon: CheckCircle2, label: "דיוק: תלוי ניסיון" },
      ],
      border: "border-[#E5E8EB]",
    },
    {
      title: "יועץ/עו" + '"' + "ד",
      metrics: [
        { icon: Clock, label: "זמן: שעות" },
        { icon: Coins, label: "עלות: גבוהה" },
        { icon: CheckCircle2, label: "דיוק: גבוה" },
      ],
      border: "border-[#E5E8EB]",
    },
    {
      title: "Decifra.ai",
      metrics: [
        { icon: Clock, label: "זמן: דקות" },
        { icon: Coins, label: "עלות: ידידותית" },
        { icon: CheckCircle2, label: "דיוק: גבוה + אימות אנושי" },
      ],
      border: "border-[#2E6BDE]",
      highlight: true,
    },
  ];

  return (
    <section className="py-10 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-4">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`bg-white border-2 ${item.border} rounded-2xl p-6 shadow-sm ${
                item.highlight ? "ring-1 ring-[#2E6BDE]/20" : ""
              }`}
            >
              <h3 className="text-lg font-bold text-[#0A2A43] mb-4 text-center">{item.title}</h3>
              <div className="space-y-3">
                {item.metrics.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 bg-[#F8F9FB] rounded-lg p-3 border border-[#E5E8EB]"
                  >
                    <m.icon className={`w-4 h-4 ${i === 2 ? "text-[#10B981]" : "text-[#2E6BDE]"}`} />
                    <span className="text-sm text-[#4A5568]">{m.label}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}