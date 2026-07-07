import React from "react";
import { FileText, CheckCircle2, AlertCircle } from "lucide-react";

export default function BeforeAfter() {
  return (
    <section className="py-12 bg-gradient-to-b from-white to-[#F8F9FB]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0A2A43]">לפני / אחרי</h2>
          <p className="text-sm sm:text-base text-[#4A5568] mt-2">כך נראה ההבדל בין טקסט משפטי גולמי לתובנות ברורות</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Before */}
          <div className="bg-white border-2 border-[#E5E8EB] rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#EBF2FE] rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-[#1E63F0]" />
              </div>
              <h3 className="text-lg font-bold text-[#0A2A43]">לפני</h3>
            </div>
            <p className="text-sm text-[#4A5568] leading-7">
              "סעיף 14(ג): על אף האמור בכל דין, העובד מתחייב כי לא יעבוד בתחום המתחרה במשך 24 חודשים ממועד סיום העסקתו..."
            </p>
          </div>
          {/* After */}
          <div className="bg-white border-2 border-[#2E6BDE] rounded-2xl p-6 shadow-[0_6px_20px_rgba(30,99,240,0.08)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#E7F7ED] rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              </div>
              <h3 className="text-lg font-bold text-[#0A2A43]">אחרי</h3>
            </div>
            <ul className="space-y-2 text-sm text-[#0A2A43]">
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] mt-1" /> תקופת אי־תחרות: 24 חודשים</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-[#10B981] mt-1" /> קנס יציאה: עד 2 משכורות</li>
              <li className="flex items-start gap-2"><AlertCircle className="w-4 h-4 text-[#F59E0B] mt-1" /> סיכון: ניסוח רחב — ממליץ בדיקת עו"ד</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}