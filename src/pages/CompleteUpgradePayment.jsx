import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompleteUpgradePaymentPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [error, setError] = useState("");
  const [plan, setPlan] = useState("");

  useEffect(() => {
    processPayment();
  }, []);

  const processPayment = async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const sessionId = params.get('session_id');
      const planParam = params.get('plan');
      const billingParam = params.get('billing');

      if (!sessionId || !planParam || !billingParam) {
        setStatus("error");
        setError("חסרים פרמטרים בקישור");
        return;
      }

      setPlan(planParam);

      const response = await base44.functions.invoke('completeUpgradePayment', {
        session_id: sessionId,
        plan: planParam,
        billing: billingParam
      });

      if (response.data.success) {
        setStatus("success");
        setTimeout(() => {
          window.location.href = createPageUrl("DashboardHome");
        }, 2000);
      } else {
        setStatus("error");
        setError(response.data.error || "שגיאה בעיבוד התשלום");
      }
    } catch (err) {
      console.error("Payment processing error:", err);
      setStatus("error");
      setError("שגיאה בעיבוד התשלום");
    }
  };

  const getPlanName = (planKey) => {
    const names = {
      beginner: "Beginner",
      pro: "Pro",
      business: "Business"
    };
    return names[planKey] || planKey;
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-[#E3E6EB] rounded-2xl p-8 text-center shadow-lg">
        {status === "processing" && (
          <>
            <Loader2 className="w-16 h-16 text-[#2E6BDE] mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-[#1A1F36] mb-2">מעבד תשלום...</h2>
            <p className="text-[#4A5568]">אנא המתן, אנחנו מעדכנים את החבילה שלך</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-[#E7F7ED] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-[#10B981]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1F36] mb-2">שדרוג בוצע בהצלחה!</h2>
            <p className="text-[#4A5568] mb-6">
              החבילה שלך שודרגה ל-{getPlanName(plan)}
            </p>
            <p className="text-sm text-[#9CA3AF]">מעביר אותך לדשבורד...</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="w-16 h-16 bg-[#FEF3E2] rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-[#F59E0B]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1A1F36] mb-2">שגיאה בתשלום</h2>
            <p className="text-[#4A5568] mb-6">{error}</p>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate(createPageUrl("Upgrade"))}
                className="flex-1 bg-[#2E6BDE] hover:bg-[#1D4ED8]"
              >
                נסה שוב
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("DashboardHome"))}
                variant="outline"
                className="flex-1"
              >
                חזור לדשבורד
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}