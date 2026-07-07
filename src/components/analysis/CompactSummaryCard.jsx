import React from "react";
import { FileText } from "lucide-react";

export default function CompactSummaryCard({ summary }) {
  return (
    <div className="bg-white border border-[#E5E8EB] rounded-xl p-5 shadow-sm mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
          <FileText className="w-4 h-4 text-[#1E63F0]" />
        </div>
        <h3 className="text-sm font-semibold text-[#0F1E2E]">תקציר משפטי</h3>
      </div>
      <div className="text-[#4A5568] leading-relaxed text-sm max-w-3xl">
        {summary ? (
          <p className="whitespace-pre-wrap">{summary}</p>
        ) : (
          <p>
            המסמך נותח באופן אוטומטי. זוהו נקודות מרכזיות, חוסרי בהירות אפשריים והיבטים מהותיים
            להבנה. הסקירה ממקדת את תשומת הלב לפרטים החשובים לקריאה מושכלת.
          </p>
        )}
      </div>
    </div>
  );
}