import React from "react";
import { Button } from "@/components/ui/button";
import { Zap, ShieldCheck, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function HeroMinimal() {
  const handleFreeScanClick = async () => {
    const dashboardUrl = createPageUrl("DashboardHome");
    const nextUrl = `${window.location.origin}${dashboardUrl}`;
    const isAuthenticated = await base44.auth.isAuthenticated();

    if (isAuthenticated) {
      window.location.href = dashboardUrl;
      return;
    }

    base44.auth.redirectToLogin(nextUrl);
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE] py-16 sm:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A2A43] tracking-tight mb-4">
          מסמכים מורכבים. תובנות פשוטות.
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-[#4A5568] max-w-2xl mx-auto mb-8">
          מעלים מסמך ומקבלים תקציר ברור, נקודות קריטיות והתרעות — בדקות, בעברית פשוטה.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6">
          <Button
            onClick={handleFreeScanClick}
            className="bg-gradient-to-r from-[#1E63F0] via-[#2E6BDE] to-[#0099A8] hover:from-[#0A2A43] hover:via-[#1E63F0] hover:to-[#0099A8] text-white px-10 py-7 text-lg sm:text-xl font-extrabold rounded-2xl shadow-2xl hover:shadow-[0_24px_60px_rgba(30,99,240,0.35)] transition-all w-full sm:w-auto border border-white/30"
          >
            <Zap className="w-6 h-6 ml-2" /> התחילו סריקה חינמית
          </Button>
          <a href="#pricing" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="border-2 border-[#E5E8EB] text-[#0A2A43] px-8 py-6 text-base sm:text-lg font-bold rounded-xl hover:border-[#1E63F0] hover:bg-[#F7F9FB] transition-all w-full"
            >
              ראו את התוכניות
            </Button>
          </a>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-[#4A5568]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#E7F7ED] rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            </div>
            <span>סריקה ראשונה חינם</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#EBF2FE] rounded-full flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#1E63F0]" />
            </div>
            <span>אבטחה ופרטיות ברמה גבוהה</span>
          </div>
        </div>
      </div>
    </section>
  );
}