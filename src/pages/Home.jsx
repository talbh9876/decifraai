import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import HeroMinimal from "../components/home/HeroMinimal";
import ComparisonStrip from "../components/home/ComparisonStrip";
import BeforeAfter from "../components/home/BeforeAfter";
import { 
  FileSearch, 
  Shield, 
  MessageSquare,
  Users,
  CheckCircle,
  ArrowLeft,
  Sparkles,
  FileText,
  Clock,
  TrendingUp,
  Lock,
  Zap,
  AlertCircle,
  Upload
} from "lucide-react";

export default function HomePage() {
  const { language, isRTL } = useTheme();
  const [isUpgrading, setIsUpgrading] = React.useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  // Redirect to dashboard if user is logged in
  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const authUser = await base44.auth.me();
        if (authUser) {
          window.location.href = createPageUrl("DashboardHome");
        } else {
          setIsCheckingAuth(false);
        }
      } catch (error) {
        // User not logged in, stay on home page
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE] flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688fa464cba361329b75d0bf/81b406b2d_ChatGPTImageDec11202509_31_30PM.png" 
              alt="DecifraAI Logo"
              className="w-16 h-16 mx-auto object-contain animate-pulse"
            />
          </div>
          <p className="text-[#4A5568] text-lg font-medium">טוען...</p>
        </div>
      </div>
    );
  }

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

  const handlePlanClick = () => {
    handleFreeScanClick();
  };

  const features = [
    {
      icon: FileSearch,
      title: "מותאם למסמכים משפטיים",
      desc: "ניתוח מובנה של סעיפים, הבנת כוונה משפטית, פירוק תלושי שכר וסריקת סיכונים."
    },
    {
      icon: MessageSquare,
      title: "הסברים פשוטים בעברית",
      desc: "פירוק זכויות, חובות, סכומים, תאריכים, נקודות אדומות ותקצירי עומק בשפה פשוטה."
    },
    {
      icon: Shield,
      title: "מאובטח ומותאם ללקוחות משפטיים",
      desc: "הצפנת קבצים, שמירה מאובטחת ועמידה בסטנדרטים של פרטיות משפטית."
    },
    {
      icon: Users,
      title: "חיבור מובנה לעורכי דין",
      desc: "בלחיצה אחת ניתן להעביר את הניתוח לעורך דין לבדיקת עומק."
    }
  ];

  const plans = [
    {
      name: "Beginner",
      price: "39",
      period: "לחודש",
      description: "למתחילים",
      features: [
        "10 סריקות בחודש",
        "תקציר מפורט",
        "זיהוי נקודות מפתח",
        "זיהוי סיכונים בסיסי",
        "ייצוא PDF",
        "אחסון ללא הגבלה",
        "בדיקת עורך דין: 180₪"
      ],
      cta: "רכישה",
      popular: false,
      color: "border-[#E3E6EB]"
    },
    {
      name: "Pro",
      price: "59",
      period: "לחודש",
      description: "למשתמשים פרטיים",
      features: [
        "30 סריקות בחודש",
        "פירוק משפטי מלא",
        "זיהוי סיכונים וחובות",
        "ייצוא PDF ו-Word",
        "אחסון ללא הגבלה",
        "עדיפות בעיבוד",
        "צ'אט AI על המסמך",
        "בדיקת עורך דין: 160₪"
      ],
      cta: "רכישה",
      popular: true,
      color: "border-[#2E6BDE]"
    },
    {
      name: "Business",
      price: "159",
      period: "לחודש",
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
        "בדיקת עורך דין: 140₪"
      ],
      cta: "רכישה",
      popular: false,
      color: "border-[#E3E6EB]"
    }
  ];

  const allFeatures = [
    { category: "פיצ'רי Beginner", items: [
      "10 סריקות בחודש",
      "תקציר מפורט ומעמיק",
      "זיהוי נקודות מפתח מתקדם",
      "זיהוי סיכונים בסיסי",
      "ייצוא PDF",
      "אחסון ללא הגבלה"
    ]},
    { category: "פיצ'רי Pro", items: [
      "פירוק משפטי מתקדם",
      "ציון סיכון",
      "יצוא PDF ו-DOCX",
      "אחסון ללא הגבלה",
      "סיכום אוטומטי מתקדם",
      "תמיכה במספר שפות"
    ]},
    { category: "פיצ'רי Business", items: [
      "הרשאות משתמשים",
      "לוח צוות",
      "שיתוף עם עורכי דין",
      "תגובות והערות",
      "API למערכות חיצוניות",
      "תמיכה ייעודית"
    ]}
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Minimal + Value Proof */}
      <HeroMinimal />
      <ComparisonStrip />
      <BeforeAfter />

      {/* App Screenshots Gallery Section */}
      <section className="py-20 bg-gradient-to-b from-white to-[#F8F9FB] dark:from-[#0A0613] dark:to-[#141021]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#EBF2FE] text-[#2E6BDE] px-4 py-2 rounded-full text-sm font-semibold mb-4 backdrop-blur-sm border border-[#2E6BDE]/10">
              <Zap className="w-4 h-4" />
              <span>הפלטפורמה שלנו בפעולה</span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-[#1A1F36] mb-4">
              ממשק פשוט, ניתוח מקצועי
            </h2>
            <p className="text-lg text-[#4A5568] max-w-2xl mx-auto">
              צילומי מסך אמיתיים מהמערכת שלנו - ממשק נקי ואינטואיטיבי המספק תובנות עמוקות
            </p>
          </div>

          {/* Main Featured Screenshot - Desktop + Mobile Mockup */}
          <div className="relative mb-20 group">
            {/* Product Hunt Style Badge */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="bg-white border-2 border-[#2E6BDE] rounded-2xl px-6 py-3 shadow-xl">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="text-2xl">🏆</div>
                    <span className="text-sm font-bold text-[#2E6BDE]">מערכת מובילה</span>
                  </div>
                  <p className="text-xs text-[#4A5568]">ניתוח משפטי חכם</p>
                </div>
              </div>
            </div>

            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2E6BDE]/5 to-[#10B981]/5/10/10 rounded-3xl blur-3xl group-hover:blur-2xl transition-all"></div>

            <div className="relative bg-gradient-to-br from-[#F8F9FB] to-white dark:from-[#0A0613] dark:to-[#141021] rounded-3xl shadow-2xl p-6 lg:p-10 border border-[#E3E6EB]">
              {/* Browser Window Mockup - Dashboard Screenshot */}
              <div className="relative bg-white rounded-2xl overflow-hidden border-2 border-[#E3E6EB] shadow-xl group-hover:shadow-2xl transition-all">
                {/* Browser Header */}
                <div className="bg-[#F8F9FB] px-4 py-3 border-b border-[#E3E6EB] flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-[#FF605C] shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-[#FFBD44] shadow-sm"></div>
                    <div className="w-3 h-3 rounded-full bg-[#00CA4E] shadow-sm"></div>
                  </div>
                  <div className="flex-1 bg-white rounded-lg px-3 py-1.5 mx-4 border border-[#E3E6EB]">
                    <div className="flex items-center gap-2 text-xs text-[#9CA3AF]">
                      <Lock className="w-3 h-3" />
                      <span>decifraai.app/dashboard</span>
                    </div>
                  </div>
                </div>

                {/* Real Dashboard Screenshot - Embedded */}
                <div className="relative bg-gradient-to-br from-[#F5F8FB] to-[#EBF2FE] dark:from-[#0A0613] dark:to-[#141021] overflow-hidden">
                  {/* Simulated Dashboard UI - Based on Real Components */}
                  <div className="p-8">
                    {/* Top Bar - Real Design */}
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <img 
                          src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688fa464cba361329b75d0bf/81b406b2d_ChatGPTImageDec11202509_31_30PM.png" 
                          alt="DecifraAI"
                          className="w-12 h-12 object-contain"
                        />
                        <div>
                          <h3 className="text-xl font-bold text-[#0A2A43]">לוח הבקרה</h3>
                          <p className="text-sm text-[#4A5568]">ברוכים הבאים חזרה</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1E63F0] to-[#0099A8] rounded-xl flex items-center justify-center shadow-lg">
                          <Upload className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>

                    {/* Stats Cards - Real Design */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                      <div className="bg-white border border-[#E3E6EB] rounded-2xl p-5 shadow-md">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#EBF2FE] to-[#D6E9FE]/20/10 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-[#1E63F0]" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-[#0A2A43] mb-1">24</div>
                        <div className="text-sm text-[#4A5568]">מסמכים נותחו</div>
                      </div>

                      <div className="bg-gradient-to-br from-[#1E63F0] to-[#0099A8] rounded-2xl p-5 shadow-xl">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-white mb-1">8/10</div>
                        <div className="text-sm text-white/90">סריקות שנותרו</div>
                      </div>

                      <div className="bg-white border border-[#E3E6EB] rounded-2xl p-5 shadow-md">
                        <div className="flex items-center justify-between mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#E7F7ED] to-[#D1F2E0]/20/10 rounded-xl flex items-center justify-center">
                            <Shield className="w-6 h-6 text-[#0099A8]" />
                          </div>
                        </div>
                        <div className="text-3xl font-bold text-[#0A2A43] mb-1">∞</div>
                        <div className="text-sm text-[#4A5568]">אחסון</div>
                      </div>
                    </div>

                    {/* Document List - Real Design */}
                    <div className="bg-white border border-[#E3E6EB] rounded-2xl overflow-hidden shadow-md">
                      <div className="px-6 py-4 border-b border-[#E3E6EB] bg-gradient-to-r from-[#F8F9FB] to-white dark:from-[#0A0613] dark:to-[#141021]">
                        <h3 className="font-bold text-[#0A2A43]">מסמכים אחרונים</h3>
                      </div>
                      <div className="p-6 space-y-3">
                        {/* Document Row 1 */}
                        <div className="flex items-center gap-4 p-4 bg-[#F5F8FB] rounded-xl hover:bg-[#EBF2FE] transition-colors">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#EBF2FE] to-[#D6E9FE]/20/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#1E63F0]" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-[#0A2A43]">חוזה_עבודה.pdf</h4>
                            <p className="text-xs text-[#9CA3AF]">נותח לפני 5 דקות</p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#E7F7ED] rounded-lg">
                            <CheckCircle className="w-4 h-4 text-[#10B981]" />
                            <span className="text-xs font-medium text-[#10B981]">הושלם</span>
                          </div>
                        </div>

                        {/* Document Row 2 */}
                        <div className="flex items-center gap-4 p-4 bg-[#F5F8FB] rounded-xl hover:bg-[#EBF2FE] transition-colors">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#FEF3E2] to-[#FEE8C8]/20/10 rounded-lg flex items-center justify-center">
                            <FileText className="w-5 h-5 text-[#F59E0B]" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-[#0A2A43]">הסכם_שכירות.pdf</h4>
                            <p className="text-xs text-[#9CA3AF]">מנתח כעת...</p>
                          </div>
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FEF3E2] rounded-lg">
                            <Clock className="w-4 h-4 text-[#F59E0B] animate-spin" />
                            <span className="text-xs font-medium text-[#F59E0B]">מעבד</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

              {/* Floating Mobile Mockup */}
              <div className="absolute -bottom-8 -left-8 w-64 hidden lg:block">
                <div className="relative">
                  {/* Phone Frame */}
                  <div className="bg-[#1A1F36] rounded-[2.5rem] p-3 shadow-2xl border-8 border-[#1A1F36] dark:border-[#0A0613]">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#1A1F36] rounded-b-3xl"></div>

                    {/* Screen Content */}
                    <div className="bg-white rounded-[2rem] overflow-hidden h-[450px]">
                      {/* Mobile Header */}
                      <div className="bg-gradient-to-r from-[#2E6BDE] to-[#1D4ED8] p-4 text-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs opacity-75">9:41</div>
                          <div className="flex gap-1">
                            <div className="w-4 h-3 border border-white rounded-sm opacity-75"></div>
                          </div>
                        </div>
                        <h4 className="font-bold text-sm mb-1">ניתוח מסמך</h4>
                        <p className="text-xs opacity-90">חוזה עבודה.pdf</p>
                      </div>

                      {/* Mobile Content */}
                      <div className="p-4 space-y-3">
                        <div className="bg-[#EBF2FE] rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle className="w-4 h-4 text-[#10B981]" />
                            <div className="h-2 bg-[#2E6BDE]/20 rounded-full flex-1"></div>
                          </div>
                          <div className="h-1.5 bg-[#2E6BDE]/10 rounded-full mb-1"></div>
                          <div className="h-1.5 bg-[#2E6BDE]/10 rounded-full w-3/4"></div>
                        </div>

                        <div className="bg-[#FEF3E2] rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
                            <div className="h-2 bg-[#F59E0B]/20 rounded-full flex-1"></div>
                          </div>
                          <div className="h-1.5 bg-[#F59E0B]/10 rounded-full mb-1"></div>
                          <div className="h-1.5 bg-[#F59E0B]/10 rounded-full w-2/3"></div>
                        </div>

                        <div className="bg-[#E7F7ED] rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-[#10B981]" />
                            <div className="h-2 bg-[#10B981]/20 rounded-full flex-1"></div>
                          </div>
                          <div className="h-1.5 bg-[#10B981]/10 rounded-full mb-1"></div>
                          <div className="h-1.5 bg-[#10B981]/10 rounded-full w-4/5"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Highlights Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[#2E6BDE]/20 to-[#10B981]/20/20/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white rounded-2xl p-6 border border-[#E3E6EB] shadow-lg group-hover:scale-105 transition-transform">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#2E6BDE] to-[#1D4ED8] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="text-center mb-3">
                      <div className="text-3xl font-bold text-[#2E6BDE] mb-1">30s</div>
                      <div className="text-xs text-[#4A5568]">זמן ניתוח ממוצע</div>
                    </div>
                    <div className="w-full bg-[#E3E6EB] rounded-full h-2 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#2E6BDE] to-[#10B981] rounded-full animate-pulse" style={{width: '75%'}}></div>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-[#1A1F36] mb-2">ניתוח מהיר</h4>
              <p className="text-sm text-[#4A5568]">קבלו תוצאות מקיפות תוך שניות</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[#10B981]/20 to-[#2E6BDE]/20/20/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white rounded-2xl p-6 border border-[#E3E6EB] shadow-lg dark:shadow-[#9D73FF]/20 group-hover:scale-105 transition-transform">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#4A5568]">סיכונים זוהו</span>
                      <span className="font-bold text-[#10B981]">12</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#4A5568]">זכויות מזוהות</span>
                      <span className="font-bold text-[#10B981]">24</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#4A5568]">חובות נמצאו</span>
                      <span className="font-bold text-[#F59E0B]">8</span>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-[#1A1F36] mb-2">זיהוי סיכונים</h4>
              <p className="text-sm text-[#4A5568]">מערכת AI מזהה סיכונים אוטומטית</p>
            </div>

            <div className="text-center group">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-[#F59E0B]/20 to-[#2E6BDE]/20/20/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative bg-white rounded-2xl p-6 border border-[#E3E6EB] shadow-lg group-hover:scale-105 transition-transform">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 bg-[#F8F9FB] rounded-lg p-2">
                      <div className="w-2 h-2 rounded-full bg-[#10B981] dark:bg-[#9D73FF] animate-pulse"></div>
                      <span className="text-xs text-[#4A5568]">ניווט פשוט</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F8F9FB] rounded-lg p-2">
                      <div className="w-2 h-2 rounded-full bg-[#10B981] dark:bg-[#9D73FF] animate-pulse"></div>
                      <span className="text-xs text-[#4A5568]">חיפוש מתקדם</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#F8F9FB] rounded-lg p-2">
                      <div className="w-2 h-2 rounded-full bg-[#10B981] dark:bg-[#9D73FF] animate-pulse"></div>
                      <span className="text-xs text-[#4A5568]">ייצוא נתונים</span>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="font-bold text-[#1A1F36] mb-2">ממשק אינטואיטיבי</h4>
              <p className="text-sm text-[#4A5568]">נווטו בקלות בין מסמכים וניתוחים</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1F36] mb-4">למה DecifraAI?</h2>
            <p className="text-base sm:text-lg text-[#4A5568] max-w-2xl mx-auto px-4">
              פלטפורמה מקצועית שמבינה את השפה המשפטית ומתרגמת אותה לעברית פשוטה
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white border-2 border-[#E3E6EB] rounded-xl p-6 hover:border-[#2E6BDE] hover:shadow-lg transition-all group">
                <div className="w-12 h-12 bg-[#EBF2FE] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md">
                  <feature.icon className="w-6 h-6 text-[#2E6BDE]" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1F36] mb-3">{feature.title}</h3>
                <p className="text-[#4A5568] text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
            </div>
            </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20 bg-[#F8F9FB]">
            <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1F36] mb-4">החבילות שלנו</h2>
              <p className="text-base sm:text-lg text-[#4A5568]">בחרו את התוכנית המתאימה לכם</p>
            </div>

            <div className="flex gap-8 max-w-6xl mx-auto overflow-x-auto pb-4 snap-x snap-mandatory lg:grid lg:grid-cols-3 lg:overflow-visible">
              {plans.map((plan, index) => (
                <div key={index} className={`bg-white border-2 ${plan.color} rounded-2xl p-8 ${plan.popular ? 'shadow-2xl lg:scale-105 relative' : 'shadow-lg'} hover:scale-105 transition-all min-w-[280px] sm:min-w-[320px] snap-center flex-shrink-0 lg:min-w-0`}>
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <span className="bg-[#2E6BDE] text-white px-4 py-1 rounded-full text-sm font-bold">
                        הכי פופולרי
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-[#1A1F36] mb-2">{plan.name}</h3>
                  <p className="text-[#4A5568] text-sm mb-6">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-5xl font-bold text-[#1A1F36]">₪{plan.price}</span>
                    {plan.period && <span className="text-[#4A5568] mr-2">{plan.period}</span>}
                  </div>

                  <Button
                    onClick={() => handlePlanClick(plan.name)}
                    disabled={isUpgrading}
                    className={`
                      w-full py-6 mb-6 rounded-lg font-semibold border-2 transition-all
                      ${plan.popular
                        // החבילה הפופולרית – כפתור כחול מלא
                        ? "bg-[#2E6BDE] border-[#2E6BDE] text-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8]"
                        // שאר החבילות – כפתור לבן עם מסגרת כחולה על hover (בלי שחור)
                        : "bg-white border-[#E3E6EB] text-[#1A1F36] hover:bg-[#F7F9FB] hover:border-[#2E6BDE] hover:text-[#2E6BDE]"
                      }
                   `}
>
  {plan.cta}
</Button>


                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                        <span className="text-[#4A5568] text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
        </div>
      </section>

      {/* Features Detail */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#1A1F36] mb-4">פירוט פיצ'רים</h2>
            <p className="text-base sm:text-lg text-[#4A5568]">כל מה שצריך לניהול מסמכים משפטיים</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {allFeatures.map((section, index) => (
              <div key={index} className="bg-[#F8F9FB] rounded-xl p-6">
                <h3 className="text-xl font-bold text-[#1A1F36] mb-4">{section.category}</h3>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#2E6BDE] flex-shrink-0 mt-1" />
                      <span className="text-[#4A5568] text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#2E6BDE] to-[#1D4ED8]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6">
            מוכנים להתחיל?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-8 px-4">
            הצטרפו לאלפי משתמשים שכבר משתמשים ב-DecifraAI להבנת מסמכים משפטיים
          </p>
          <Button 
            onClick={handleFreeScanClick}
            className="bg-white hover:bg-[#F8FBFF] text-[#2E6BDE] px-10 sm:px-12 py-6 sm:py-7 text-lg sm:text-xl font-extrabold rounded-2xl shadow-2xl hover:shadow-[0_24px_60px_rgba(255,255,255,0.22)] w-full sm:w-auto border-2 border-white/70"
          >
            התחילו סריקה חינמית
            <ArrowLeft className="w-6 h-6 mr-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A1F36] text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688fa464cba361329b75d0bf/81b406b2d_ChatGPTImageDec11202509_31_30PM.png" 
                  alt="DecifraAI Logo"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-xl font-bold">DecifraAI</span>
              </div>
              <p className="text-white/70 text-sm">
                ניתוח מסמכים משפטיים חכם ומהיר באמצעות AI מתקדם
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">קישורים מהירים</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to={createPageUrl("About")} className="text-white/70 hover:text-white transition-colors">
                    אודות
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("FAQ")} className="text-white/70 hover:text-white transition-colors">
                    שאלות נפוצות
                  </Link>
                </li>
                <li>
                  <a href="#pricing" className="text-white/70 hover:text-white transition-colors">
                    התוכניות שלנו
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4">משפטי</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to={createPageUrl("Terms")} className="text-white/70 hover:text-white transition-colors">
                    תנאי שימוש
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Privacy")} className="text-white/70 hover:text-white transition-colors">
                    מדיניות פרטיות
                  </Link>
                </li>
                <li>
                  <Link to={createPageUrl("Accessibility")} className="text-white/70 hover:text-white transition-colors">
                    הצהרת נגישות
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4">צור קשר</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to={createPageUrl("Support")} className="text-white/70 hover:text-white transition-colors">
                    תמיכה
                  </Link>
                </li>
                <li>
                  <a href="mailto:support@decifraai.app" className="text-white/70 hover:text-white transition-colors">
                    support@decifraai.app
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-white/50 text-sm">
              © {new Date().getFullYear()}  כל הזכויות שמורות - Decifra.AI 
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}