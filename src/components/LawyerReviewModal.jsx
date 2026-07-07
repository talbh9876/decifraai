import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { X, CreditCard, Loader2, Shield, CheckCircle, Info, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PLAN_PRICES = {
  free: { price: 200, discount: 0 },
  beginner: { price: 180, discount: 10 },
  pro: { price: 160, discount: 20 },
  business: { price: 140, discount: 30 }
};

export default function LawyerReviewModal({ document, userPlan = "free", isOpen, onClose }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showPayment, setShowPayment] = useState(false);

  const planInfo = PLAN_PRICES[userPlan] || PLAN_PRICES.free;

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data } = await base44.functions.invoke('createLawyerReviewPayment', {
        documentId: document.id
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#0A2A43] to-[#1E63F0] px-6 py-6 flex items-center justify-between rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">בדיקת עורך דין מקצועית</h2>
                <p className="text-white/90 text-sm mt-1">אבטחה ברמה משפטית • מסמכים מוצפנים</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6">
            {!showPayment ? (
              <>
                {/* Info Section */}
                <div className="bg-[#F7F9FB] border-2 border-[#0099A8]/20 rounded-2xl p-6 mb-8">
                  <div className="flex items-start gap-3">
                    <Info className="w-6 h-6 text-[#1E63F0] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-[#0A2A43] mb-3">איך זה עובד?</h3>
                      <ol className="space-y-2 text-sm text-[#4A5568]">
                        <li className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-[#2E6BDE] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                          <span>תשלמו עבור הבדיקה המשפטית (תשלום חד פעמי)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-[#2E6BDE] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                          <span>המסמך שלכם יועבר לעורך דין מוסמך</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-[#2E6BDE] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                          <span>תקבלו חוות דעת משפטית מפורטת תוך 2-3 ימי עסקים</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-6 h-6 bg-[#2E6BDE] text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">4</span>
                          <span>החוות דעת תופיע בדשבורד שלכם ותישלח גם למייל</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* What's Included */}
                <div className="mb-6">
                  <h3 className="font-bold text-[#1A1F36] mb-4 text-lg">מה כלול בבדיקה:</h3>
                  <div className="grid gap-3">
                    <div className="flex items-start gap-3 p-4 bg-[#F8F9FB] rounded-lg border border-[#E3E6EB]">
                      <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-[#1A1F36] mb-1">בדיקה משפטית מקצועית ומעמיקה</div>
                        <p className="text-sm text-[#4A5568]">עורך דין יבדוק את המסמך בקפידה ויזהה סיכונים וסעיפים בעייתיים</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-[#F8F9FB] rounded-lg border border-[#E3E6EB]">
                      <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-[#1A1F36] mb-1">המלצות משפטיות מפורטות</div>
                        <p className="text-sm text-[#4A5568]">קבלת המלצות ברורות לפעולה ולשיפור המסמך</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-[#F8F9FB] rounded-lg border border-[#E3E6EB]">
                      <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-[#1A1F36] mb-1">זיהוי סיכונים משפטיים מתקדם</div>
                        <p className="text-sm text-[#4A5568]">זיהוי נקודות חלשות וסיכונים משפטיים בחוזה</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-4 bg-[#F8F9FB] rounded-lg border border-[#E3E6EB]">
                      <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-semibold text-[#1A1F36] mb-1">תשובה תוך 2-3 ימי עסקים</div>
                        <p className="text-sm text-[#4A5568]">קבלת חוות דעת מהירה ומקצועית</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price Display */}
                <div className="bg-gradient-to-br from-[#F8F9FB] to-[#EBF2FE] rounded-xl p-6 mb-6 border-2 border-[#E3E6EB]">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[#4A5568] font-medium">מחיר בסיס</span>
                    <span className={`text-lg ${planInfo.discount > 0 ? 'line-through text-[#9CA3AF]' : 'font-bold text-[#1A1F36]'}`}>
                      ₪200
                    </span>
                  </div>
                  
                  {planInfo.discount > 0 && (
                    <>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#10B981] rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-white" />
                          </div>
                          <span className="text-[#10B981] font-semibold">
                            הנחת חבילת {userPlan === 'beginner' ? 'Beginner' : userPlan === 'pro' ? 'Pro' : 'Business'}
                          </span>
                        </div>
                        <span className="text-lg text-[#10B981] font-semibold">-{planInfo.discount}%</span>
                      </div>
                      <div className="border-t-2 border-[#E3E6EB] pt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-[#1A1F36]">סה"כ לתשלום</span>
                          <span className="text-3xl font-bold text-[#2E6BDE]">₪{planInfo.price}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {error && (
                  <div className="bg-[#FEE2E2] border-2 border-[#EF4444] text-[#DC2626] rounded-lg p-4 mb-4 text-sm">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={onClose}
                    variant="outline"
                    className="flex-1 border-2 border-[#E3E6EB] text-[#4A5568] hover:bg-[#F8F9FB] py-6"
                  >
                    ביטול
                  </Button>
                  <Button
                    onClick={() => setShowPayment(true)}
                    className="flex-1 bg-gradient-to-r from-[#1E63F0] to-[#0099A8] hover:from-[#0A2A43] hover:to-[#1E63F0] text-white py-6 text-lg font-bold shadow-lg rounded-xl"
                  >
                    המשך לתשלום
                    <ArrowLeft className="w-5 h-5 mr-2" />
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Payment Confirmation */}
                <div className="text-center mb-6">
                  <div className="w-20 h-20 bg-[#EBF2FE] rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-10 h-10 text-[#2E6BDE]" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#1A1F36] mb-2">אישור תשלום</h3>
                  <p className="text-[#4A5568]">
                    את/ה עומד/ת לשלם <span className="font-bold text-[#2E6BDE]">₪{planInfo.price}</span> עבור בדיקת עורך דין
                  </p>
                </div>

                <div className="bg-[#F8F9FB] rounded-xl p-5 mb-6 border border-[#E3E6EB]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#4A5568]">מסמך:</span>
                    <span className="font-semibold text-[#1A1F36]">{document.title}</span>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[#4A5568]">שירות:</span>
                    <span className="font-semibold text-[#1A1F36]">בדיקת עורך דין</span>
                  </div>
                  <div className="border-t border-[#E3E6EB] pt-3 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-[#1A1F36]">סכום לתשלום:</span>
                      <span className="text-2xl font-bold text-[#2E6BDE]">₪{planInfo.price}</span>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-[#FEE2E2] border-2 border-[#EF4444] text-[#DC2626] rounded-lg p-4 mb-4 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowPayment(false)}
                    variant="outline"
                    disabled={isProcessing}
                    className="flex-1 border-2 border-[#E3E6EB] text-[#4A5568] hover:bg-[#F8F9FB] py-6"
                  >
                    חזרה
                  </Button>
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="flex-1 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white py-6 text-lg font-bold shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        מעבד תשלום...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 ml-2" />
                        שלם ₪{planInfo.price}
                      </>
                    )}
                  </Button>
                </div>

                <p className="text-xs text-center text-[#9CA3AF] mt-4">
                  תשלום מאובטח באמצעות Stripe • אתר מוגן בהצפנת SSL
                </p>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}