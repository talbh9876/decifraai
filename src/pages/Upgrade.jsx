import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap, Crown, ArrowLeft, ArrowRight } from "lucide-react";

export default function UpgradePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { getCurrentUser } = await import("@/components/userSync");
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      
      // If already business, redirect
      if (currentUser && currentUser.plan === "business") {
        navigate(createPageUrl("DashboardHome"));
      }
    } catch (error) {
      console.error("Error loading user:", error);
      // Allow viewing without login
      setUser(null);
    }
    setIsLoading(false);
  };

  const handleUpgrade = async (targetPlan) => {
    // If not logged in, redirect to login first
    if (!user) {
      base44.auth.redirectToLogin(createPageUrl("Upgrade"));
      return;
    }
    
    setProcessingPlan(targetPlan);
    
    try {
      // Create payment session
      const response = await base44.functions.invoke('createUpgradePayment', {
        plan: targetPlan,
        billingPeriod: billingPeriod
      });
      
      if (response.data.url) {
        // Redirect to Stripe checkout
        window.location.href = response.data.url;
      } else {
        throw new Error("Failed to create payment session");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      alert(`שגיאה ביצירת תשלום: ${error.message}`);
      setProcessingPlan(null);
    }
  };

  const currentPlan = user?.plan || "free";

  const [billingPeriod, setBillingPeriod] = useState("monthly");

  const allPlans = [
    {
      id: "beginner",
      name: "Beginner",
      monthlyPrice: "39",
      yearlyPrice: "400",
      description: "למתחילים",
      features: [
        "10 סריקות בחודש",
        "תקציר מפורט",
        "זיהוי נקודות מפתח",
        "זיהוי סיכונים בסיסי",
        "ייצוא PDF",
        "אחסון ללא הגבלה",
        "בדיקת עורך דין: 180₪ (10% הנחה)"
      ],
      highlighted: false,
      disabled: user && (currentPlan === "beginner" || currentPlan === "pro" || currentPlan === "business")
    },
    {
      id: "pro",
      name: "Pro",
      monthlyPrice: "59",
      yearlyPrice: "650",
      description: "למשתמשים מקצועיים",
      features: [
        "30 סריקות בחודש",
        "פירוק משפטי מלא",
        "זיהוי סיכונים מתקדם וחובות",
        "ייצוא PDF ו-Word",
        "אחסון ללא הגבלה",
        "עדיפות בעיבוד",
        "צ'אט AI על המסמך",
        "ניתוח אי-התאמות",
        "בדיקת עורך דין: 160₪ (20% הנחה)"
      ],
      highlighted: true,
      disabled: user && (currentPlan === "pro" || currentPlan === "business")
    },
    {
      id: "business",
      name: "Business",
      monthlyPrice: "159",
      yearlyPrice: "1500",
      description: "לעסקים ומשרדי עו\"ד",
      features: [
        "100 סריקות בחודש",
        "חשבונות צוות",
        "סביבת עבודה משותפת",
        "היסטוריית גרסאות",
        "גישה ל-API",
        "מוד עורכי דין",
        "אבטחה מתקדמת",
        "תמיכה ייעודית",
        "ניתוח השוואתי מתקדם",
        "בדיקת עורך דין: 140₪ (30% הנחה)"
      ],
      highlighted: false,
      disabled: user && currentPlan === "business"
    }
  ];

  // Show only upgrade plans (filter out disabled plans)
  const plans = allPlans.filter(plan => !plan.disabled);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2E6BDE] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#4A5568]">טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        {user && (
          <button
            onClick={() => navigate(createPageUrl("DashboardHome"))}
            className="flex items-center gap-2 text-[#4A5568] hover:text-[#2E6BDE] mb-8"
          >
            <ArrowRight className="w-4 h-4" />
            <span className="text-sm">חזרה לדשבורד</span>
          </button>
        )}


        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#EBF2FE] text-[#2E6BDE] px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Zap className="w-4 h-4" />
            <span>שדרוג חבילה</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#1A1F36] mb-4">
            החבילות שלנו
          </h1>
          <p className="text-lg text-[#4A5568]">
            שדרג עכשיו וקבל גישה מלאה לכל היכולות של Decifra.ai
          </p>
          
          {currentPlan !== "free" && (
            <div className="mt-4 inline-flex items-center gap-2 bg-[#E7F7ED] text-[#10B981] px-4 py-2 rounded-lg text-sm font-medium">
              <Crown className="w-4 h-4" />
              <span>החבילה הנוכחית שלך: {currentPlan === "beginner" ? "Beginner" : currentPlan === "pro" ? "Pro" : "Business"}</span>
            </div>
          )}

          {/* Billing Period Toggle */}
          <div className="mt-6 inline-flex items-center bg-white border-2 border-[#E3E6EB] rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingPeriod === "monthly"
                  ? "bg-[#2E6BDE] text-white"
                  : "text-[#4A5568] hover:text-[#2E6BDE]"
              }`}
            >
              חודשי
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-2 rounded-md font-medium transition-all ${
                billingPeriod === "yearly"
                  ? "bg-[#2E6BDE] text-white"
                  : "text-[#4A5568] hover:text-[#2E6BDE]"
              }`}
            >
              שנתי
              <span className="mr-2 text-xs bg-[#10B981] text-white px-2 py-0.5 rounded-full">
                חסכו עד 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {plans.map((plan) => {
            const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const period = billingPeriod === "monthly" ? "לחודש" : "לשנה";
            
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-6 md:p-8 border-2 transition-all relative ${
                  plan.highlighted
                    ? 'border-[#2E6BDE] shadow-xl md:scale-105 ring-2 ring-[#2E6BDE] ring-opacity-20'
                    : 'border-[#E3E6EB] shadow-lg hover:border-[#2E6BDE]/50'
                } ${plan.disabled ? 'opacity-60' : ''}`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 right-6 inline-flex items-center gap-1 bg-[#2E6BDE] text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md">
                    <Zap className="w-3 h-3" />
                    <span>מומלץ</span>
                  </div>
                )}
                
                <h3 className="text-xl md:text-2xl font-bold text-[#1A1F36] mb-2">{plan.name}</h3>
                <p className="text-sm md:text-base text-[#4A5568] mb-4 md:mb-6">{plan.description}</p>
                
                <div className="mb-4 md:mb-6">
                  <span className="text-3xl md:text-5xl font-bold text-[#1A1F36]">₪{price}</span>
                  <span className="text-sm md:text-base text-[#4A5568] mr-2">{period}</span>
                  {billingPeriod === "yearly" && (
                    <div className="mt-2 text-xs md:text-sm text-[#10B981] font-medium">
                      חיסכון של ₪{(parseFloat(plan.monthlyPrice) * 12 - parseFloat(plan.yearlyPrice)).toFixed(0)} בשנה
                    </div>
                  )}
                </div>

              <Button
                onClick={() => handleUpgrade(plan.id)}
                disabled={plan.disabled || processingPlan === plan.id}
                className={`w-full py-4 md:py-6 mb-4 md:mb-6 font-semibold text-sm md:text-base rounded-xl ${
                  plan.highlighted
                    ? 'bg-gradient-to-r from-[#1E63F0] to-[#0099A8] hover:from-[#0A2A43] hover:to-[#1E63F0] text-white shadow-lg'
                    : 'bg-white border-2 border-[#E5E8EB] text-[#0A2A43] hover:border-[#1E63F0] hover:bg-[#F7F9FB]'
                } ${plan.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {processingPlan === plan.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    מעבד...
                  </span>
                ) : plan.disabled ? (
                  currentPlan === plan.id ? "החבילה הנוכחית" : "לא זמין"
                ) : !user ? (
                  `התחל עם ${plan.name}`
                ) : (
                  `שדרג ל-${plan.name}`
                )}
              </Button>

              <ul className="space-y-2 md:space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 md:gap-3">
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-[#4A5568] text-xs md:text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
              </div>
            );
          })}
        </div>

        {/* Stripe Integration Note */}
        <div className="mt-12 bg-[#FEF3E2] border-2 border-[#F59E0B] rounded-xl p-6 text-center">
          <p className="text-[#4A5568] text-sm">
            <strong>הערה למפתחים:</strong> יש להגדיר Stripe API keys ב-Environment Variables:
            <br />
            <code className="bg-white px-2 py-1 rounded text-xs mt-2 inline-block">
              STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY
            </code>
            <br />
            <span className="text-xs">ולהגדיר Price IDs עבור Beginner (39₪/400₪), Pro (59₪/650₪) ו-Business (159₪/1500₪)</span>
          </p>
        </div>
      </div>
    </div>
  );
}