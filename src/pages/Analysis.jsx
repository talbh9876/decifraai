import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/components/ThemeProvider";
import { canBypassPlan, isAdminUser, isDevMode } from "@/components/utils/devAccess";
import { sendNotification, getNotificationMessages } from "@/components/notificationService";
const Document = base44.entities.Document;
const LawyerCase = base44.entities.LawyerCase;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DocumentChatbot from "@/components/DocumentChatbot";
import ExportMenu from "@/components/analysis/ExportMenu";
import NotesPanel from "@/components/analysis/NotesPanel";
import LegalResearch from "@/components/analysis/LegalResearch";
import CompareDocuments from "@/components/analysis/CompareDocuments";
import CompactSummaryCard from "@/components/analysis/CompactSummaryCard";
import ImpactCards from "@/components/analysis/ImpactCards";
import AIAdvisor from "@/components/analysis/AIAdvisor";
import AdvancedToolsGrid from "@/components/analysis/AdvancedToolsGrid";
import FeatureGate from "@/components/analysis/FeatureGate";
import { canAccess, normalizePlan } from "@/components/analysis/planUtils";
import LawyerReviewModal from "@/components/LawyerReviewModal";
import { 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb,
  Download,
  Send,
  ChevronLeft,
  Info,
  Loader2,
  FileText,
  Shield,
  Calendar,
  DollarSign,
  Scale,
  ArrowRight,
  MessageCircle,
  Ban,
  XCircle,
  FileX,
  ShieldAlert,
  Handshake,
  TrendingUp,
  BookOpen,
  GitCompare,
  Lock,
  RefreshCw,
  Link as LinkIcon,
  User as UserIcon
} from "lucide-react";

export default function AnalysisPage() {
  const navigate = useNavigate();
  const { language, isRTL } = useTheme();
  const docId = new URLSearchParams(window.location.search).get("id");
  
  const [document, setDocument] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLawyerModalOpen, setIsLawyerModalOpen] = useState(false);
  const [userPlan, setUserPlan] = useState("free");
  const [activeTab, setActiveTab] = useState("summary");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [devOn, setDevOn] = useState(isDevMode());
  const hasStartedRef = useRef(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isReAnalyzing, setIsReAnalyzing] = useState(false);

  // Track recently viewed document (hook must be above any early returns)
  useEffect(() => {
    if (!document?.id) return;
    const entry = {
      id: document.id,
      title: document.title,
      created_date: document.created_date,
      viewedAt: new Date().toISOString(),
    };
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem('recently_viewed_docs') || '[]'); } catch {}
    arr = arr.filter((d) => d.id !== entry.id);
    arr.unshift(entry);
    if (arr.length > 10) arr = arr.slice(0, 10);
    localStorage.setItem('recently_viewed_docs', JSON.stringify(arr));
  }, [document?.id]);

  // Plan resolver with admin/dev bypass
          const planParam = new URLSearchParams(window.location.search).get("plan");
          const currentPlan = (() => {
            const paramPlan = planParam ? normalizePlan(planParam) : null;
            const userPlanLocal = normalizePlan(user?.plan || "free");
            return canBypassPlan(user) ? "business" : (paramPlan || userPlanLocal);
          })();

  useEffect(() => {
    loadData();
  }, [docId]);

  const loadData = async () => {

    if (!docId) {
      setIsLoading(false);
      return;
    }

    try {
      const authUser = await base44.auth.me();
      if (!authUser) {
        base44.auth.redirectToLogin(window.location.pathname + window.location.search);
        return;
      }

      const { getCurrentUser } = await import("@/components/userSync");
      const currentUser = await getCurrentUser();
      
      setUser(currentUser || authUser);
      setUserPlan(currentUser?.plan || "free");
      
      // Try to load document by ID - RLS will filter automatically
      try {
        const docs = await Document.filter({ id: docId });
        if (!(docs && docs.length > 0)) {
          console.warn("No access to document:", docId);
        } else {
          let d = docs[0];

          // 1) If already has final result -> show immediately
          if (d.analysisStatus === 'done' && d.analysisResult) {
            setDocument(d);
          } else if (!d.analysisResult && d.ai_analysis) {
            // 2) Migrate legacy ai_analysis into analysisResult
            const now = new Date().toISOString();
            await Document.update(d.id, {
              analysisStatus: 'done',
              analysisResult: d.ai_analysis,
              analyzedAt: now,
              analysisVersion: d.analysisVersion || 'v1'
            });
            setDocument({ ...d, analysisStatus: 'done', analysisResult: d.ai_analysis, analyzedAt: now, analysisVersion: d.analysisVersion || 'v1' });
          } else {
            // 3) No result present -> run once (guarded) and save
            setDocument(d);
            if (!hasStartedRef.current) {
              hasStartedRef.current = true;
              if (d.analysisStatus !== 'pending') {
                await Document.update(d.id, { analysisStatus: 'pending' });
                d = { ...d, analysisStatus: 'pending' };
                setDocument(d);
              }
              // Run analysis
              await analyzeDocument(d);
            }
          }
        }
      } catch (docError) {
        console.error("Error loading document:", docError);
      }
    } catch (error) {
      console.error("Error:", error);
      base44.auth.redirectToLogin(window.location.pathname + window.location.search);
    }
    
    setIsLoading(false);
  };

  // Analysis runner (idempotent helper)
  const analyzeDocument = async (doc) => {
    if (!doc?.file_url) return;
    try {
      setIsAnalyzing(true);
      const isPaySlip = doc.document_type === 'pay_slip';

      const prompt = isPaySlip ? `
                נתח את תלוש השכר הזה בצורה מקצועית ומדויקת. חשוב מאוד: כל התוכן חייב להיות בעברית בלבד!

                חלץ את כל הנתונים הבאים מהתלוש:

                1. פרטי עובד: שם, תעודת זהות, תפקיד, מספר עובד
                2. פרטי מעסיק: שם החברה, ח.ס מעסיק
                3. תקופת התשלום: חודש ושנה
                4. נתוני שכר:
                   - שכר יומי/שעתי (אם קיים)
                   - שכר בסיס
                   - תוספות (נסיעות, אוכל, ביגוד, ותק וכו')
                   - שעות נוספות (אם יש)
                   - בונוסים (אם יש)
                   - שכר ברוטו (סה"כ לפני ניכויים)

                5. ניכויים:
                   - מס הכנסה
                   - ביטוח לאומי
                   - ביטוח בריאות
                   - פנסיה והשתלמות (מעסיק ועובד)
                   - קרן השתלמות
                   - ניכויים נוספים
                   - סה"כ ניכויים

                6. שכר נטו (לתשלום)

                7. ימי עבודה: כמה ימים בפועל, חופשה, מחלה

                לאחר חילוץ הנתונים, בצע בדיקת תקינות:
                - בדוק אם שכר הבסיס עומד בשכר המינימום
                - בדוק אם אחוזי הניכויים תקינים
                - בדוק אם שעות נוספות חושבו נכון
                - זהה כל חריגה או דבר חשוד

                דווח על הממצאים והמלצות מעשיות.
              ` : `
              נתח את המסמך המשפטי הבא בעברית בצורה מעמיקה ומקצועית. כל התוכן בעברית בלבד. הצג רק סעיפים שקיימים במסמך.

              החזר אובייקט עם השדות: executive_summary, summary, legal_terms[{term, explanation, location}],
              obligations[], risk_factors[], important_dates[], financial_terms[], special_conditions[],
              compensation_clauses[], legal_liability[], non_compete[], liability_limitation[], termination_terms[],
              recommendations[], inconsistencies[{type, description, severity, locations}], cross_references[{clause, depends_on, explanation}].
              `;

      const schema = isPaySlip ? {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          employee_details: {
            type: "object",
            properties: {
              name: { type: "string" },
              id_number: { type: "string" },
              position: { type: "string" },
              employee_number: { type: "string" }
            }
          },
          employer_details: {
            type: "object",
            properties: {
              company_name: { type: "string" },
              employer_id: { type: "string" }
            }
          },
          payment_period: { type: "string" },
          salary_data: {
            type: "object",
            properties: {
              base_salary: { type: "string" },
              additions: { type: "array", items: { type: "string" } },
              overtime: { type: "string" },
              bonuses: { type: "string" },
              gross_salary: { type: "string" }
            }
          },
          deductions: {
            type: "object",
            properties: {
              income_tax: { type: "string" },
              social_security: { type: "string" },
              health_insurance: { type: "string" },
              pension: { type: "string" },
              other_deductions: { type: "array", items: { type: "string" } },
              total_deductions: { type: "string" }
            }
          },
          net_salary: { type: "string" },
          work_days: { type: "string" },
          compliance_check: {
            type: "object",
            properties: {
              is_compliant: { type: "boolean" },
              issues_found: { type: "array", items: { type: "string" } },
              warnings: { type: "array", items: { type: "string" } },
              recommendations: { type: "array", items: { type: "string" } }
            }
          },
          summary: { type: "string" },
          recommendations: { type: "array", items: { type: "string" } }
        }
      } : {
        type: "object",
        properties: {
          executive_summary: { type: "string" },
          legal_terms: { 
            type: "array", 
            items: { 
              type: "object",
              properties: {
                term: { type: "string" },
                explanation: { type: "string" },
                location: { type: "string" }
              }
            }
          },
          summary: { type: "string" },
          key_points: { type: "array", items: { type: "string" } },
          obligations: { type: "array", items: { type: "string" } },
          risk_factors: { type: "array", items: { type: "string" } },
          important_dates: { type: "array", items: { type: "string" } },
          financial_terms: { type: "array", items: { type: "string" } },
          special_conditions: { type: "array", items: { type: "string" } },
          compensation_clauses: { type: "array", items: { type: "string" } },
          legal_liability: { type: "array", items: { type: "string" } },
          non_compete: { type: "array", items: { type: "string" } },
          liability_limitation: { type: "array", items: { type: "string" } },
          termination_terms: { type: "array", items: { type: "string" } },
          recommendations: { type: "array", items: { type: "string" } },
          inconsistencies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                description: { type: "string" },
                severity: { type: "string" },
                locations: { type: "string" }
              }
            }
          },
          cross_references: {
            type: "array",
            items: {
              type: "object",
              properties: {
                clause: { type: "string" },
                depends_on: { type: "string" },
                explanation: { type: "string" }
              }
            }
          }
        }
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [doc.file_url],
        response_json_schema: schema,
        add_context_from_internet: false
      });

      const now = new Date().toISOString();
      await Document.update(doc.id, {
        analysisStatus: 'done',
        analysisResult: result,
        analyzedAt: now,
        ai_analysis: result
      });
      setDocument((prev) => ({ ...(prev || doc), analysisStatus: 'done', analysisResult: result, ai_analysis: result, analyzedAt: now }));
    } catch (e) {
      console.error('Analyze error:', e);
      try { await Document.update(doc.id, { analysisStatus: 'error' }); } catch {}
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLawyerReviewClick = () => {
    // Check if already requested
    if (document.status === 'lawyer_requested' || document.status === 'completed') {
      alert('בדיקת עורך דין כבר הוזמנה עבור מסמך זה');
      return;
    }
    setIsLawyerModalOpen(true);
  };

  const handleDownloadDocument = () => {
    if (document?.file_url) {
      const link = window.document.createElement('a');
      link.href = document.file_url;
      link.download = document.title || 'document';
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const handleReanalyze = async () => {
    if (!document?.id) return;
    try {
      setIsReAnalyzing(true);
      hasStartedRef.current = true; // prevent load effect from re-triggering immediately
      await Document.update(document.id, { analysisStatus: 'pending' });
      setDocument((prev) => ({ ...(prev || {}), analysisStatus: 'pending' }));
      await analyzeDocument(document);
    } finally {
      setIsReAnalyzing(false);
    }
  };

   const handleSaveNote = async (note) => {
    try {
      const existingNotes = document.user_notes || [];
      const updatedNotes = [...existingNotes, note];
      
      await Document.update(document.id, {
        user_notes: updatedNotes
      });
      
      setDocument({
        ...document,
        user_notes: updatedNotes
      });
    } catch (error) {
      console.error("Error saving note:", error);
      alert("שגיאה בשמירת ההערה. אנא נסו שוב.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE] dark:from-[#0A0613] dark:via-[#0A0613] dark:to-[#141021] flex items-center justify-center p-4">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#2E6BDE]/5 dark:bg-[#6F3DFF]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#10B981]/5 dark:bg-[#9D73FF]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative text-center max-w-md">
          {/* Logo */}
          <div className="mb-8 flex items-center justify-center gap-3">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688fa464cba361329b75d0bf/81b406b2d_ChatGPTImageDec11202509_31_30PM.png" 
              alt="Decifra.ai" 
              className="w-14 h-14 object-contain"
            />
            <span className="text-3xl font-bold">
              <span className="text-[#0A2A43] dark:text-[#F5F3FF]">DECIFRA</span>
              <span className="text-[#1E63F0] dark:text-[#9D73FF]">.AI</span>
            </span>
          </div>

          {/* Loading Card */}
          <div className="bg-white dark:bg-[#141021] border border-[#E3E6EB] dark:border-[#1F1A2D] rounded-2xl p-8 shadow-2xl dark:shadow-[#6F3DFF]/30">
            {/* Animated Icon */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2E6BDE] to-[#10B981] dark:from-[#6F3DFF] dark:to-[#9D73FF] rounded-2xl animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FileText className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#0A2A43] dark:text-[#F5F3FF] mb-3">טוען ניתוח מסמך</h2>
            <p className="text-[#4A5568] dark:text-[#D1CDEE] mb-6">המערכת מנתחת את המסמך שלך...</p>

            {/* Progress Steps */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-[#EBF2FE] dark:bg-[#6F3DFF]/10 rounded-lg">
                <div className="w-6 h-6 bg-gradient-to-br from-[#2E6BDE] to-[#1D4ED8] dark:from-[#6F3DFF] dark:to-[#9D73FF] rounded-full flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-[#4A5568] dark:text-[#D1CDEE]">קריאת מסמך</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-[#F8F9FB] dark:bg-[#1F1A2D]/50 rounded-lg">
                <div className="w-6 h-6 border-2 border-[#2E6BDE] dark:border-[#6F3DFF] rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-[#2E6BDE] dark:bg-[#6F3DFF] rounded-full animate-pulse"></div>
                </div>
                <span className="text-sm text-[#4A5568] dark:text-[#D1CDEE]">ניתוח תוכן</span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-[#F8F9FB] dark:bg-[#1F1A2D]/50 rounded-lg opacity-50">
                <div className="w-6 h-6 border-2 border-[#E3E6EB] dark:border-[#1F1A2D] rounded-full"></div>
                <span className="text-sm text-[#9CA3AF] dark:text-[#D1CDEE]/50">זיהוי סיכונים</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE] dark:from-[#0A0613] dark:via-[#0A0613] dark:to-[#141021] flex items-center justify-center p-4">
        <div className="text-center bg-white dark:bg-[#141021] p-8 rounded-2xl border border-[#E3E6EB] dark:border-[#1F1A2D] shadow-xl dark:shadow-[#6F3DFF]/20 max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-[#D9534F] to-[#EF4444] dark:from-[#9D73FF] dark:to-[#6F3DFF] rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg dark:shadow-[#9D73FF]/40">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1F36] dark:text-[#F5F3FF] mb-2">מסמך לא נמצא</h2>
          <p className="text-[#4A5568] dark:text-[#D1CDEE] mb-6">המסמך שביקשת לא נמצא במערכת</p>
          <Button onClick={() => navigate(createPageUrl("Upload"))} className="bg-gradient-to-r from-[#2E6BDE] to-[#1D4ED8] dark:from-[#6F3DFF] dark:to-[#9D73FF] hover:from-[#1D4ED8] hover:to-[#2E6BDE] text-white shadow-lg">
            העלה מסמך חדש
          </Button>
        </div>
      </div>
    );
  }

  // Build dynamic tabs based on available analysis data
  const analysis = document?.analysisResult || document?.ai_analysis || {};
  const availableTabs = [];
  
  // Executive Summary
  if (analysis.executive_summary) {
    availableTabs.push({ id: "executive", label: language === 'he' ? "סיכום מנהלים" : "Executive Summary", icon: TrendingUp });
  }
  
  // Summary is always shown
  availableTabs.push({ id: "summary", label: language === 'he' ? "תקציר" : "Summary", icon: FileText });

  // Pay slip specific tabs
  if (document.document_type === 'pay_slip') {
    if (analysis.salary_data) {
      availableTabs.push({ id: "salary_breakdown", label: language === 'he' ? "פירוט שכר" : "Salary Breakdown", icon: DollarSign });
    }
    if (analysis.compliance_check) {
      availableTabs.push({ id: "compliance", label: language === 'he' ? "בדיקת תקינות" : "Compliance Check", icon: Shield });
    }
  }
  
  // Legal Terms
  if (analysis.legal_terms?.length > 0) {
    availableTabs.push({ id: "legal_terms", label: language === 'he' ? "מושגים משפטיים" : "Legal Terms", icon: BookOpen });
  }
  
  // Legal Research tab - always available
  availableTabs.push({ id: "legal_research", label: language === 'he' ? "חיפוש משפטי" : "Legal Research", icon: Scale });
  
  // Inconsistencies
  if (analysis.inconsistencies?.length > 0) {
    availableTabs.push({ id: "inconsistencies", label: language === 'he' ? "חוסרי עקביות" : "Inconsistencies", icon: AlertTriangle });
  }
  
  // Cross References
  if (analysis.cross_references?.length > 0) {
    availableTabs.push({ id: "cross_references", label: language === 'he' ? "הפניות צולבות" : "Cross References", icon: LinkIcon });
  }
  
  // Compare Documents - always available
  availableTabs.push({ id: "compare", label: language === 'he' ? "השוואת מסמכים" : "Compare Documents", icon: GitCompare });
  
  // Recommendations - only if exists
  if (analysis.recommendations?.length > 0) {
    availableTabs.push({ id: "recommendations", label: language === 'he' ? "המלצות" : "Recommendations", icon: Lightbulb });
  }
  
  // Only add tabs if data exists
  if (analysis.key_points?.length > 0) {
    availableTabs.push({ id: "rights", label: language === 'he' ? "זכויות" : "Rights", icon: CheckCircle });
  }
  if (analysis.obligations?.length > 0) {
    availableTabs.push({ id: "obligations", label: language === 'he' ? "חובות" : "Obligations", icon: Shield });
  }
  // Removed 'risks' tab in favor of "המסמך פוגש מציאות" mode
  // if (analysis.risk_factors?.length > 0) {
  //   availableTabs.push({ id: "risks", label: language === 'he' ? "סיכונים" : "Risks", icon: AlertTriangle });
  // }
  if (analysis.financial_terms?.length > 0) {
    availableTabs.push({ id: "financial", label: language === 'he' ? "כספים" : "Financial", icon: DollarSign });
  }
  if (analysis.important_dates?.length > 0) {
    availableTabs.push({ id: "dates", label: language === 'he' ? "תאריכים" : "Dates", icon: Calendar });
  }
  if (analysis.compensation_clauses?.length > 0) {
    availableTabs.push({ id: "compensation", label: language === 'he' ? "פיצויים" : "Compensation", icon: Handshake });
  }
  if (analysis.legal_liability?.length > 0) {
    availableTabs.push({ id: "liability", label: language === 'he' ? "אחריות" : "Liability", icon: Scale });
  }
  if (analysis.non_compete?.length > 0) {
    availableTabs.push({ id: "noncompete", label: language === 'he' ? "אי-תחרות" : "Non-Compete", icon: Ban });
  }
  if (analysis.liability_limitation?.length > 0) {
    availableTabs.push({ id: "limitation", label: language === 'he' ? "הגבלת אחריות" : "Limitation", icon: ShieldAlert });
  }
  if (analysis.termination_terms?.length > 0) {
    availableTabs.push({ id: "termination", label: language === 'he' ? "סיום חוזה" : "Termination", icon: FileX });
  }
  
  const tabs = availableTabs;

  // Free WOW helpers (one-line, generic, no quotes or specifics)
  const generateFreeInsight = (a = {}) => {
    try {
      if (Array.isArray(a.liability_limitation) && a.liability_limitation.length) {
        return "הוסכם על הגבלת אחריות שעשויה להשפיע על חלוקת הסיכונים בפועל.";
      }
      if (Array.isArray(a.obligations) && a.obligations.length) {
        return "נראה כי קיימות התחייבויות מהותיות עם השפעה על חופש הפעולה של אחד הצדדים.";
      }
      if (Array.isArray(a.termination_terms) && a.termination_terms.length) {
        return "תנאי סיום עלולים ליצור חוסר בהירות ביחס להודעה מוקדמת או מצבי ביטול.";
      }
      if (Array.isArray(a.risk_factors) && a.risk_factors.length) {
        return "זוהו נקודות שעשויות להעלות סיכון פרקטי בהתקשרות.";
      }
      return "זוהה סעיף שעשוי ליצור חוסר איזון משמעותי בין הצדדים במקרה של הפרה.";
    } catch {
      return "זוהה סעיף שעשוי ליצור חוסר איזון משמעותי בין הצדדים במקרה של הפרה.";
    }
  };

  const generateFreeQuestion = (a = {}) => {
    try {
      if (Array.isArray(a.non_compete) && a.non_compete.length) {
        return "האם קיימת הגבלת עיסוק/אי-תחרות המגבילה את הפעילות לאחר סיום ההתקשרות?";
      }
      if (Array.isArray(a.termination_terms) && a.termination_terms.length) {
        return "מהו מנגנון ההודעה המוקדמת והאם קיימות התחייבויות או קנסות יציאה?";
      }
      if (Array.isArray(a.legal_liability) && a.legal_liability.length) {
        return "האם קיימת חלוקת אחריות ברורה ומוסכמת בין הצדדים?";
      }
      return "האם קיימת הגבלת אחריות ברורה לצד השני במקרה של נזק?";
    } catch {
      return "האם קיימת הגבלת אחריות ברורה לצד השני במקרה של נזק?";
    }
  };

  const ArrowIcon = isRTL ? ArrowRight : ChevronLeft;

  return (
    <div className="min-h-screen bg-[#F7F9FB]">
      {/* Mobile Header */}
      <div className="sticky top-14 sm:top-16 z-20 bg-white border-b border-[#E5E8EB] px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-7xl mx-auto">

          
          <button
            onClick={() => navigate(createPageUrl("DashboardHome"))}
            className="flex items-center gap-2 text-[#4A4A4A] hover:text-[#1E63F0] mb-3 sm:mb-4"
          >
            <ArrowIcon className="w-4 h-4" />
            <span className="text-sm font-medium">חזרה לדשבורד</span>
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-[#0A2A43] mb-1">{document.title}</h1>
            <p className="text-sm text-[#4A4A4A]">
              {new Date(document.created_date).toLocaleDateString('he-IL')}
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleDownloadDocument}
              size="sm"
              variant="outline"
              className="border-[#E5E8EB] text-[#4A4A4A] hover:bg-[#F7F9FB] rounded-xl"
              disabled={!document?.file_url}
            >
              <Download className="w-4 h-4 ml-1" />
              הורד
            </Button>

            {(canAccess(currentPlan, "pro") || isAdminUser(user)) && (
              <Button 
                onClick={handleReanalyze}
                size="sm"
                variant="outline"
                className="border-[#E5E8EB] text-[#4A4A4A] hover:bg-[#F7F9FB] rounded-xl"
                disabled={isAnalyzing || isReAnalyzing}
              >
                <RefreshCw className={`w-4 h-4 ml-1 ${isAnalyzing || isReAnalyzing ? 'animate-spin' : ''}`} />
                הרץ שוב
              </Button>
            )}

            {(canAccess(currentPlan, "pro") || canBypassPlan(user)) ? (
              <ExportMenu document={document} />
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate(createPageUrl("Upgrade?plan=pro"))}
                className="rounded-xl text-[#4A4A4A] border-[#E5E8EB]"
              >
                <Lock className="w-4 h-4 ml-1 text-[#9CA3AF]" />
                ייצוא (ב‑Pro)
              </Button>
            )}

            <Button 
              onClick={handleLawyerReviewClick}
              disabled={currentPlan === 'free' || document.status === 'lawyer_requested' || document.status === 'completed'}
              size="sm"
              variant="default"
              className="rounded-xl bg-[#1E63F0] hover:bg-[#0A2A43] text-white disabled:opacity-50"
            >
              <Send className="w-4 h-4 ml-1" />
              {document.status === 'lawyer_requested' || document.status === 'completed' ? 'נשלח לעו"ד' : 'שלח לעו"ד'}
            </Button>
          </div>
          </div>
        </div>
      </div>

      {/* Mobile Tabs - Only show if there are multiple sections */}
      {tabs.length > 1 && (
        <div className="sticky top-[136px] sm:top-[144px] z-10 bg-white border-b border-[#E5E8EB] overflow-x-auto">
          <div className="flex gap-1 px-4 sm:px-6 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap rounded-t-xl ${
                    activeTab === tab.id
                      ? 'text-[#1E63F0] border-b-2 border-[#1E63F0]'
                      : 'text-[#4A4A4A] hover:text-[#1E63F0]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>

                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-20">
        {/* Notes Panel - appears on all tabs */}
        <FeatureGate
          currentPlan={currentPlan}
          requiredPlan="beginner"
          title="הערות וסיכומים"
          description="שמירת הערות אישיות ותובנות על המסמך"
          compact
        >
          <NotesPanel 
            document={document} 
            onSaveNote={handleSaveNote}
            activeTab={activeTab}
          />
        </FeatureGate>

        {/* Executive Summary */}
        {activeTab === "executive" && analysis?.executive_summary && (
          <div className="bg-gradient-to-br from-[#0A2A43] to-[#1E63F0] rounded-2xl p-8 shadow-lg text-white mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-3">סיכום מנהלים</h2>
                <p className="text-white/95 leading-relaxed text-lg">
                  {analysis.executive_summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Legal Terms */}
        {activeTab === "legal_terms" && analysis?.legal_terms && analysis.legal_terms.length > 0 && (
          <div className="space-y-4">
            <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#EBF2FE] rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#2E6BDE]" />
                </div>
                <h2 className="text-xl font-bold text-[#0F1E2E]">מושגים משפטיים</h2>
              </div>
              <div className="space-y-4">
                {analysis.legal_terms.map((term, index) => (
                  <div key={index} className="p-5 bg-[#F8F9FB] border border-[#E3E6EB] rounded-lg hover:shadow-sm transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 bg-[#FEF3E2] rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-[#F59E0B]">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[#1A1F36] mb-2">{term.term}</h3>
                        <p className="text-[#4A5568] mb-3 leading-relaxed">{term.explanation}</p>
                        {term.location && (
                          <div className="flex items-center gap-2 text-sm text-[#8A9AAD]">
                            <FileText className="w-4 h-4" />
                            <span>מיקום במסמך: {term.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lawyer Review Card - Show if status is completed */}
        {activeTab === "summary" && (document.status === 'completed' || document.lawyer_review) && (
          <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl p-6 text-white mb-4 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">חוות דעת עורך דין</h3>
                <div className="bg-white/20 rounded-lg p-4 mb-3">
                  <p className="text-sm text-white/80 mb-1">
                    עורך דין: {document.lawyer_review?.lawyer_name || "עורך דין מוסמך"}
                  </p>
                  <p className="text-sm text-white/80">
                    תאריך: {document.lawyer_review?.signed_date ? new Date(document.lawyer_review.signed_date).toLocaleDateString('he-IL') : ''}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 text-[#0F1E2E]">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {document.lawyer_review?.review_summary || document.lawyer_review?.legal_recommendation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero: Impact-first experience */}
        {activeTab === "summary" && (
          <>
            <div className="bg-white border border-[#E5E8EB] rounded-xl p-6 shadow-sm mb-6">
              <h2 className="text-xl font-bold text-[#0F1E2E]">ההשפעה של המסמך הזה עליך בפועל</h2>
              <p className="text-sm text-[#4A5568] mt-1">כסף, זכויות, סיכונים והשלכות – בשפה פשוטה, בלי משפטית.</p>
            </div>

            {/* Impact Cards (WOW) */}
            <ImpactCards
              document={document}
              currentPlan={currentPlan}
              onUpgrade={() => navigate(createPageUrl("Upgrade?plan=pro"))}
            />

            {/* Compact legal summary (secondary) */}
            <CompactSummaryCard summary={document.ai_analysis?.summary} />

            {/* AI Advisor Panels: Missing clauses, wording improvements, risk list */}
            <AIAdvisor document={document} onJumpToTab={(tab) => setActiveTab(tab)} />

            {/* Advanced tools grid at bottom (minimal locks) */}
            <AdvancedToolsGrid
              currentPlan={currentPlan}
              onOpenFeature={(id) => setActiveTab(id)}
              onUpgrade={() => navigate(createPageUrl("Upgrade?plan=pro"))}
            />
          </>
        )}

        {/* 🧠 המסמך פוגש מציאות */}
        {activeTab === "summary" && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm mb-6">
            <div className="mb-3">
              <h3 className="text-lg font-bold text-[#0F1E2E]">המסמך פוגש מציאות</h3>
              <p className="text-sm text-[#4A5568] mt-1">כאן נבדק כיצד המסמך מתנהג כאשר המציאות אינה מתנהלת לפי התרחיש האידיאלי.</p>
            </div>

            {currentPlan === 'free' ? (
              <>
                <div className="mb-3">
                  <div className="text-sm font-medium text-[#0F1E2E] mb-1">מצב מציאות #1 – כשל או איחור בביצוע</div>
                  <p className="text-[#4A5568] text-sm">
                    במצב שבו אחד הצדדים אינו עומד בהתחייבות במועד, המסמך אינו מגדיר באופן חד האם יתר ההתחייבויות ממשיכות, מוקפאות או ניתנות לביטול. נקודה זו לרוב אינה מורגשת בקריאה רגילה.
                  </p>
                </div>
                <div className="text-xs text-[#6B7280]">
                  זהו אחד מ־7 מצבים שבהם המסמך עשוי להתנהג באופן לא צפוי.
                </div>
                <div className="text-xs text-[#6B7280] mt-1">
                  <span>🔒 הצג מצבי מציאות נוספים – זמין ב-Pro</span>
                  <button
                    type="button"
                    onClick={() => navigate(createPageUrl("Upgrade?plan=pro"))}
                    className="ml-2 text-[#1E63F0] hover:underline"
                  >
                    שדרג →
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                {[
                  { title: 'כשל או איחור בביצוע', desc: 'במצב זה ייתכן שהמסמך אינו מבהיר אם יתר ההתחייבויות ממשיכות, מוקפאות או מתבטלות, דבר שעשוי ליצור אי־ודאות.' },
                  { title: 'מחלוקת על פרשנות', desc: 'ניסוח שאינו חד עלול לאפשר יותר מקריאה אחת, מה שעשוי להוביל להליך ממושך.' },
                  { title: 'ביטול או יציאה מוקדמת', desc: 'ייתכן שהמסמך אינו מגדיר באופן מפורש מנגנון הודעה ותוצאות אפשריות.' },
                  { title: 'שינוי נסיבות', desc: 'במקרה של שינוי מהותי, ייתכן שאין הוראה המבהירה התאמות מתבקשות.' },
                  { title: 'אי־בהירות בסעיף מרכזי', desc: 'נוסח כללי עשוי ליצור ציפיות שונות ולהגדיל חשיפה.' },
                  { title: 'שרשרת תלות בין סעיפים', desc: 'בהיעדר הפניה מפורשת, ייתכן שסעיף תלוי יפורש בניתוק מהוראות משלימות.' },
                  { title: 'אכיפה וסעדים', desc: 'ייתכן שאין פירוט של אמצעי אכיפה או סדרי עדיפות, דבר שעלול להשפיע על ההתנהלות בעת מחלוקת.' },
                ].map((item, i) => (
                  <div key={i} className="p-4 bg-[#F8F9FB] border border-[#E3E6EB] rounded-lg">
                    <div className="font-medium text-[#0F1E2E] mb-1">{item.title}</div>
                    <p className="text-sm text-[#4A5568]">{item.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Removed free upgrade teasers to keep premium minimal look */}
{false && (
          <>
            {/* Free Section: Insight */}
            <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm mb-6">
              <h3 className="text-base font-semibold text-[#1A1F36] mb-2">תובנה משפטית מרכזית – סקירה ראשונית</h3>
              <p className="text-[#4A5568] text-sm mb-3">זוהתה נקודה שעשויה להשפיע באופן מהותי על האחריות או החשיפה שלך.<br/>הניסוח הקיים יוצר אי־בהירות שעלולה להוביל להשלכות לא צפויות במצבים מסוימים.</p>
              <div className="text-xs text-[#6B7280]">
                <span>🔒 ניתוח מלא של כל הסיכונים והמשמעויות – זמין ב־Pro</span>
                <button
                  type="button"
                  onClick={() => navigate(createPageUrl("Upgrade?plan=pro"))}
                  className="ml-2 text-[#1E63F0] hover:underline"
                >
                  שדרג →
                </button>
              </div>
            </div>

            {/* Free Section: Pre-sign Question */}
            <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm mb-6">
              <h3 className="text-base font-semibold text-[#1A1F36] mb-2">שאלה שכדאי לשאול לפני חתימה</h3>
              <p className="text-[#4A5568] text-sm mb-3">{generateFreeQuestion(analysis)}</p>
              <div className="text-xs text-[#6B7280]">
                <span>🔒 שאלות מותאמות אישית לפי המסמך – ב־Pro</span>
                <button
                  type="button"
                  onClick={() => navigate(createPageUrl("Upgrade?plan=pro"))}
                  className="ml-2 text-[#1E63F0] hover:underline"
                >
                  שדרג →
                </button>
              </div>
            </div>

            {/* Free Section: Chat Preview */}
            <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm mb-8">
              <h3 className="text-base font-semibold text-[#1A1F36] mb-3">שאל את ה־AI על המסמך</h3>
              <Input
                disabled
                placeholder="שאל שאלה על החוזה שלך…"
                className="disabled:opacity-100 bg-[#F8F9FB] border-[#E5E8EB] text-[#9CA3AF]"
              />
              <div className="mt-2 text-xs text-[#6B7280]">
                <span>🔒 צ’אט AI אינטראקטיבי – זמין ב־Pro</span>
                <button
                  type="button"
                  onClick={() => navigate(createPageUrl("Upgrade?plan=pro"))}
                  className="ml-2 text-[#1E63F0] hover:underline"
                >
                  שדרג →
                </button>
              </div>
            </div>
          </>
        )}

        {/* Rights Card */}
        {activeTab === "rights" && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#10B981] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">זכויות שלך</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {document.ai_analysis.key_points.map((point, index) => (
                  <li key={index} className="flex items-start gap-4 p-4 bg-[#E7F7ED] rounded-lg">
                    <span className="w-8 h-8 bg-[#10B981] rounded-lg text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                      {index + 1}
                    </span>
                    <span className="text-[#4A5568] leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Obligations Card */}
        {activeTab === "obligations" && analysis.obligations?.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#F59E0B] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">חובות והתחייבויות</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {analysis.obligations.map((obligation, i) => (
                  <li key={i} className="flex items-start gap-4 p-4 bg-[#FEF3E2] rounded-lg border-r-4 border-[#F59E0B]">
                    <AlertTriangle className="w-6 h-6 text-[#F59E0B] flex-shrink-0" />
                    <span className="text-[#4A5568]">{obligation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 'סיכונים' הוחלף במנגנון "המסמך פוגש מציאות" */}

        {/* Financial Card */}
        {activeTab === "financial" && analysis.financial_terms?.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#10B981] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">כספים ותשלומים</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {analysis.financial_terms.map((term, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-[#EBF2FE] rounded-lg">
                    <DollarSign className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-[#4A5568]">{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Dates Card */}
        {activeTab === "dates" && analysis.important_dates?.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#2E6BDE] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">תאריכים חשובים</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {analysis.important_dates.map((date, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-[#EBF2FE] rounded-lg">
                    <Calendar className="w-5 h-5 text-[#2E6BDE] flex-shrink-0 mt-0.5" />
                    <span className="text-[#4A5568]">{date}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Compensation Clauses */}
        {activeTab === "compensation" && analysis.compensation_clauses?.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#10B981] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Handshake className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">סעיפי פיצויים</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {analysis.compensation_clauses.map((clause, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-[#E7F7ED] rounded-lg">
                    <Handshake className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="text-[#4A5568]">{clause}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Legal Liability */}
        {activeTab === "liability" && analysis.legal_liability?.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#F59E0B] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Scale className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">אחריות משפטית</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {analysis.legal_liability.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-[#FEF3E2] rounded-lg border-r-4 border-[#F59E0B]">
                    <Scale className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                    <span className="text-[#4A5568]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Non-Compete */}
        {activeTab === "noncompete" && analysis.non_compete?.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#D9534F] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Ban className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">תניות אי-תחרות</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {analysis.non_compete.map((clause, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-[#FFE5E5] rounded-lg border-r-4 border-[#D9534F]">
                    <Ban className="w-5 h-5 text-[#D9534F] flex-shrink-0 mt-0.5" />
                    <span className="text-[#4A5568]">{clause}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Liability Limitation */}
        {activeTab === "limitation" && analysis.liability_limitation?.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#6366F1] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">הגבלת אחריות</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {analysis.liability_limitation.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-[#EEF2FF] rounded-lg border-r-4 border-[#6366F1]">
                    <ShieldAlert className="w-5 h-5 text-[#6366F1] flex-shrink-0 mt-0.5" />
                    <span className="text-[#4A5568]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Termination Terms */}
        {activeTab === "termination" && analysis.termination_terms?.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#EF4444] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <FileX className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">תנאי סיום חוזה</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {analysis.termination_terms.map((term, i) => (
                  <li key={i} className="flex items-start gap-3 p-4 bg-[#FEE2E2] rounded-lg border-r-4 border-[#EF4444]">
                    <FileX className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                    <span className="text-[#4A5568]">{term}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Legal Research */}
        {activeTab === "legal_research" && (
          (canAccess(currentPlan, "pro") || canBypassPlan(user)) ? (
            <LegalResearch document={document} />
          ) : (
            <div className="bg-white border border-[#E5E8EB] rounded-xl p-5 shadow-sm text-sm text-[#4A5568]">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-[#9CA3AF]" />
                <span>התכונה זמינה ב‑Pro</span>
              </div>
              <button
                onClick={() => navigate(createPageUrl("Upgrade?plan=pro"))}
                className="text-xs text-[#1E63F0] hover:underline"
              >
                פתח ב‑Pro
              </button>
            </div>
          )
        )}

        {/* Inconsistencies */}
        {activeTab === "inconsistencies" && analysis?.inconsistencies && analysis.inconsistencies.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#EF4444] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">חוסרי עקביות במסמך</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {analysis.inconsistencies.map((item, index) => {
                const severityConfig = {
                  high: { bg: "bg-[#FEE2E2]", border: "border-[#EF4444]", text: "text-[#EF4444]", label: "גבוהה" },
                  medium: { bg: "bg-[#FEF3E2]", border: "border-[#F59E0B]", text: "text-[#F59E0B]", label: "בינונית" },
                  low: { bg: "bg-[#FEF3E2]", border: "border-[#FACC15]", text: "text-[#FACC15]", label: "נמוכה" }
                };
                const config = severityConfig[item.severity] || severityConfig.medium;
                
                return (
                  <div key={index} className={`${config.bg} border-2 ${config.border} rounded-lg p-5`}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h4 className="font-bold text-[#1A1F36] text-lg">{item.type}</h4>
                      <span className={`${config.text} text-xs font-bold px-3 py-1 bg-white rounded-full`}>
                        חומרה: {config.label}
                      </span>
                    </div>
                    <p className="text-[#4A5568] mb-3 leading-relaxed">{item.description}</p>
                    {item.locations && (
                      <div className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                        <FileText className="w-4 h-4" />
                        <span>מיקום: {item.locations}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Cross References */}
        {activeTab === "cross_references" && analysis?.cross_references && analysis.cross_references.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
            <div className="bg-[#6366F1] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">הפניות צולבות וסעיפים תלויים</h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {analysis.cross_references.map((ref, index) => (
                <div key={index} className="bg-[#EEF2FF] border border-[#6366F1]/30 rounded-lg p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#6366F1] text-white rounded-lg flex items-center justify-center font-bold flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-bold text-[#1A1F36]">{ref.clause}</span>
                        <ArrowRight className="w-4 h-4 text-[#6366F1]" />
                        <span className="font-bold text-[#6366F1]">{ref.depends_on}</span>
                      </div>
                      <p className="text-[#4A5568] leading-relaxed">{ref.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Compare Documents */}
        {activeTab === "compare" && (
          (canAccess(currentPlan, "pro") || canBypassPlan(user)) ? (
            <CompareDocuments currentDocument={document} />
          ) : (
            <div className="bg-white border border-[#E5E8EB] rounded-xl p-5 shadow-sm text-sm text-[#4A5568]">
              <div className="flex items-center gap-2 mb-1">
                <Lock className="w-4 h-4 text-[#9CA3AF]" />
                <span>התכונה זמינה ב‑Pro</span>
              </div>
              <button
                onClick={() => navigate(createPageUrl("Upgrade?plan=pro"))}
                className="text-xs text-[#1E63F0] hover:underline"
              >
                פתח ב‑Pro
              </button>
            </div>
          )
        )}

        {/* Pay Slip - Salary Breakdown */}
        {activeTab === "salary_breakdown" && analysis?.salary_data && (
          <div className="space-y-4">
            {/* Employee & Employer Details */}
            {(analysis.employee_details || analysis.employer_details) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.employee_details && (
                  <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[#1A1F36] mb-4 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-[#2E6BDE]" />
                      פרטי עובד
                    </h3>
                    <div className="space-y-2 text-sm">
                      {analysis.employee_details.name && (
                        <div><span className="text-[#9CA3AF]">שם:</span> <span className="font-medium text-[#1A1F36]">{analysis.employee_details.name}</span></div>
                      )}
                      {analysis.employee_details.id_number && (
                        <div><span className="text-[#9CA3AF]">ת.ז:</span> <span className="font-medium text-[#1A1F36]">{analysis.employee_details.id_number}</span></div>
                      )}
                      {analysis.employee_details.position && (
                        <div><span className="text-[#9CA3AF]">תפקיד:</span> <span className="font-medium text-[#1A1F36]">{analysis.employee_details.position}</span></div>
                      )}
                    </div>
                  </div>
                )}
                {analysis.employer_details && (
                  <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-[#1A1F36] mb-4 flex items-center gap-2">
                      <UserIcon className="w-5 h-5 text-[#2E6BDE]" />
                      פרטי מעסיק
                    </h3>
                    <div className="space-y-2 text-sm">
                      {analysis.employer_details.company_name && (
                        <div><span className="text-[#9CA3AF]">שם חברה:</span> <span className="font-medium text-[#1A1F36]">{analysis.employer_details.company_name}</span></div>
                      )}
                      {analysis.employer_details.employer_id && (
                        <div><span className="text-[#9CA3AF]">ח.פ:</span> <span className="font-medium text-[#1A1F36]">{analysis.employer_details.employer_id}</span></div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Salary Data */}
            <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#10B981] px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-white text-lg">פירוט שכר</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {analysis.salary_data.base_salary && (
                  <div className="flex justify-between items-center p-4 bg-[#F8F9FB] rounded-lg">
                    <span className="text-[#4A5568] font-medium">שכר בסיס</span>
                    <span className="text-lg font-bold text-[#1A1F36]">{analysis.salary_data.base_salary}</span>
                  </div>
                )}
                {analysis.salary_data.additions?.length > 0 && (
                  <div className="p-4 bg-[#F8F9FB] rounded-lg">
                    <div className="font-medium text-[#4A5568] mb-2">תוספות</div>
                    <ul className="space-y-1">
                      {analysis.salary_data.additions.map((addition, i) => (
                        <li key={i} className="text-sm text-[#1A1F36] mr-4">• {addition}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.salary_data.overtime && (
                  <div className="flex justify-between items-center p-4 bg-[#FEF3E2] rounded-lg">
                    <span className="text-[#4A5568] font-medium">שעות נוספות</span>
                    <span className="text-lg font-bold text-[#F59E0B]">{analysis.salary_data.overtime}</span>
                  </div>
                )}
                {analysis.salary_data.bonuses && (
                  <div className="flex justify-between items-center p-4 bg-[#E7F7ED] rounded-lg">
                    <span className="text-[#4A5568] font-medium">בונוסים</span>
                    <span className="text-lg font-bold text-[#10B981]">{analysis.salary_data.bonuses}</span>
                  </div>
                )}
                {analysis.salary_data.gross_salary && (
                  <div className="flex justify-between items-center p-4 bg-[#EBF2FE] rounded-lg border-2 border-[#2E6BDE]">
                    <span className="text-[#2E6BDE] font-bold">שכר ברוטו</span>
                    <span className="text-xl font-bold text-[#2E6BDE]">{analysis.salary_data.gross_salary}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Deductions */}
            {analysis.deductions && (
              <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#F59E0B] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-lg">ניכויים</h3>
                  </div>
                </div>
                <div className="p-6 space-y-3">
                  {analysis.deductions.income_tax && (
                    <div className="flex justify-between items-center p-3 bg-[#FEF3E2] rounded-lg">
                      <span className="text-[#4A5568]">מס הכנסה</span>
                      <span className="font-bold text-[#F59E0B]">{analysis.deductions.income_tax}</span>
                    </div>
                  )}
                  {analysis.deductions.social_security && (
                    <div className="flex justify-between items-center p-3 bg-[#FEF3E2] rounded-lg">
                      <span className="text-[#4A5568]">ביטוח לאומי</span>
                      <span className="font-bold text-[#F59E0B]">{analysis.deductions.social_security}</span>
                    </div>
                  )}
                  {analysis.deductions.health_insurance && (
                    <div className="flex justify-between items-center p-3 bg-[#FEF3E2] rounded-lg">
                      <span className="text-[#4A5568]">ביטוח בריאות</span>
                      <span className="font-bold text-[#F59E0B]">{analysis.deductions.health_insurance}</span>
                    </div>
                  )}
                  {analysis.deductions.pension && (
                    <div className="flex justify-between items-center p-3 bg-[#FEF3E2] rounded-lg">
                      <span className="text-[#4A5568]">פנסיה והשתלמות</span>
                      <span className="font-bold text-[#F59E0B]">{analysis.deductions.pension}</span>
                    </div>
                  )}
                  {analysis.deductions.total_deductions && (
                    <div className="flex justify-between items-center p-4 bg-[#F59E0B]/10 rounded-lg border-2 border-[#F59E0B] mt-4">
                      <span className="text-[#F59E0B] font-bold">סה"כ ניכויים</span>
                      <span className="text-xl font-bold text-[#F59E0B]">{analysis.deductions.total_deductions}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Net Salary */}
            {analysis.net_salary && (
              <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-white/80 mb-1">שכר נטו לתשלום</div>
                    <div className="text-3xl font-bold">{analysis.net_salary}</div>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pay Slip - Compliance Check */}
        {activeTab === "compliance" && analysis?.compliance_check && (
          <div className="space-y-4">
            {/* Compliance Status */}
            <div className={`rounded-xl p-6 shadow-lg ${
              analysis.compliance_check.is_compliant 
                ? 'bg-gradient-to-r from-[#10B981] to-[#059669] text-white'
                : 'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white'
            }`}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  {analysis.compliance_check.is_compliant ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : (
                    <AlertTriangle className="w-8 h-8" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {analysis.compliance_check.is_compliant ? 'תלוש תקין' : 'נמצאו חריגות'}
                  </h2>
                  <p className="text-white/90">
                    {analysis.compliance_check.is_compliant 
                      ? 'התלוש נבדק ועומד בדרישות החוק'
                      : 'זוהו כמה נקודות הדורשות תשומת לב'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Issues Found */}
            {analysis.compliance_check.issues_found?.length > 0 && (
              <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#EF4444] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-lg">בעיות שזוהו</h3>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {analysis.compliance_check.issues_found.map((issue, i) => (
                      <li key={i} className="flex items-start gap-3 p-4 bg-[#FEE2E2] rounded-lg border-r-4 border-[#EF4444]">
                        <XCircle className="w-5 h-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
                        <span className="text-[#4A5568]">{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Warnings */}
            {analysis.compliance_check.warnings?.length > 0 && (
              <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#F59E0B] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-lg">אזהרות</h3>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {analysis.compliance_check.warnings.map((warning, i) => (
                      <li key={i} className="flex items-start gap-3 p-4 bg-[#FEF3E2] rounded-lg border-r-4 border-[#F59E0B]">
                        <AlertTriangle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                        <span className="text-[#4A5568]">{warning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {analysis.compliance_check.recommendations?.length > 0 && (
              <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#2E6BDE] px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="font-bold text-white text-lg">המלצות</h3>
                  </div>
                </div>
                <div className="p-6">
                  <ul className="space-y-3">
                    {analysis.compliance_check.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 p-4 bg-[#EBF2FE] rounded-lg">
                        <Lightbulb className="w-5 h-5 text-[#2E6BDE] flex-shrink-0 mt-0.5" />
                        <span className="text-[#4A5568]">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recommendations */}
        {activeTab === "recommendations" && document.ai_analysis?.recommendations?.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm">
            <div className="bg-[#10B981] px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-white text-lg">המלצות</h3>
              </div>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {document.ai_analysis.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-[#10B981] mt-0.5 flex-shrink-0" />
                    <span className="text-[#4A5568] leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Dev badge (admin only) */}
      {isAdminUser(user) && (
        <div className="fixed bottom-4 left-4 z-50 text-[11px] bg-white border border-[#E5E8EB] rounded-full px-3 py-1 shadow-sm">
          <span className="ml-2">{isDevMode() ? "DEV MODE ON" : "DEV MODE OFF"}</span>
          <button
            onClick={() => {
              const next = isDevMode() ? "0" : "1";
              localStorage.setItem("DEV_MODE", next);
              setDevOn(next === "1");
            }}
            className="text-[#1E63F0] hover:underline"
          >
            Toggle
          </button>
        </div>
      )}

      {/* Footer legal + subtle CTA */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-6 text-[11px] text-[#6B7280] flex items-center justify-between gap-3">
        <span>המידע מבוסס על ניתוח אוטומטי ואינו מהווה ייעוץ משפטי. להחלטה משפטית מומלץ להיוועץ בעו״ד.</span>
        {!canAccess(currentPlan, "pro") && (
          <button
            onClick={() => navigate(createPageUrl("Upgrade?plan=pro"))}
            className="text-[11px] text-[#1E63F0] hover:underline"
          >
            שדרג כדי לפתוח תכונות מתקדמות
          </button>
        )}
      </div>

      {/* Floating Chat + Chatbot (Pro and up) */}
      {currentPlan !== 'free' && (
        <>
          <button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-r from-[#1E63F0] to-[#0099A8] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-6 h-6 sm:w-7 sm:h-7" />
          </button>

          <DocumentChatbot
            document={document}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
          />
        </>
      )}

      {/* Lawyer Review Modal */}
      <LawyerReviewModal
        document={document}
        userPlan={userPlan}
        isOpen={isLawyerModalOpen}
        onClose={() => setIsLawyerModalOpen(false)}
      />
    </div>
  );
}