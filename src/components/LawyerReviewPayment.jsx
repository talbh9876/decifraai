import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { CreditCard, Loader2, Shield, CheckCircle } from "lucide-react";

const PLAN_PRICES = {
  free: { price: 200, discount: 0 },
  beginner: { price: 180, discount: 10 },
  pro: { price: 160, discount: 20 },
  business: { price: 140, discount: 30 }
};

export default function LawyerReviewPayment({ documentId, userPlan = "free", onSuccess }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const planInfo = PLAN_PRICES[userPlan] || PLAN_PRICES.free;

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data } = await base44.functions.invoke('createLawyerReviewPayment', {
        documentId
      });

      if (data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('לא התקבל קישור תשלום');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('שגיאה ביצירת תשלום. אנא נסה שוב.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white border-2 border-[#E3E6EB] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-[#EBF2FE] rounded-xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-[#2E6BDE]" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#1A1F36]">בדיקת עורך דין מקצועית</h3>
          <p className="text-sm text-[#4A5568]">ניתוח משפטי מעמיק על ידי עורך דין מוסמך</p>
        </div>
      </div>

      {/* Price Display */}
      <div className="bg-[#F8F9FB] rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[#4A5568]">מחיר בסיס</span>
          <span className={`text-[#9CA3AF] ${planInfo.discount > 0 ? 'line-through' : 'font-bold text-[#1A1F36]'}`}>
            ₪200
          </span>
        </div>
        
        {planInfo.discount > 0 && (
          <>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#10B981] font-medium flex items-center gap-1">
                <CheckCircle className="w-4 h-4" />
                הנחת חבילת {userPlan === 'beginner' ? 'Beginner' : userPlan === 'pro' ? 'Pro' : 'Business'}
              </span>
              <span className="text-[#10B981] font-medium">-{planInfo.discount}%</span>
            </div>
            <div className="border-t border-[#E3E6EB] pt-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A1F36]">סה"כ לתשלום</span>
                <span className="text-2xl font-bold text-[#2E6BDE]">₪{planInfo.price}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* What's Included */}
      <div className="mb-6">
        <h4 className="font-semibold text-[#1A1F36] mb-3">מה כלול בבדיקה:</h4>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#4A5568]">בדיקה משפטית מקצועית ומעמיקה</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#4A5568]">המלצות משפטיות מפורטות</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#4A5568]">זיהוי סיכונים משפטיים מתקדם</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
            <span className="text-sm text-[#4A5568]">תשובה תוך 2-3 ימי עסקים</span>
          </li>
        </ul>
      </div>

      {error && (
        <div className="bg-[#FEE2E2] border border-[#EF4444] text-[#DC2626] rounded-lg p-3 mb-4 text-sm">
          {error}
        </div>
      )}

      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-[#2E6BDE] hover:bg-[#1D4ED8] text-white py-6 text-lg font-bold"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
            מעבד תשלום...
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5 ml-2" />
            שלם ₪{planInfo.price} ושלח לעורך דין
          </>
        )}
      </Button>

      <p className="text-xs text-[#9CA3AF] text-center mt-3">
        תשלום מאובטח באמצעות Stripe
      </p>
    </div>
  );
}