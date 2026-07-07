import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/components/ThemeProvider";
import { useTranslation } from "@/components/translations";
import { canBypassPlan, isAdminUser } from "@/components/utils/devAccess";
const Document = base44.entities.Document;
const UploadFile = base44.integrations.Core.UploadFile;
const InvokeLLM = base44.integrations.Core.InvokeLLM;

import { Button } from "@/components/ui/button";
import { 
  Upload as UploadIcon,
  Upload,
  FileText, 
  AlertCircle,
  CheckCircle,
  X,
  RefreshCw,
  FileSearch,
  Shield,
  Lightbulb,
  Send,
  Sparkles,
  Briefcase,
  Home,
  Wallet
} from "lucide-react";

export default function UploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { language, isRTL, theme } = useTheme();
  const t = useTranslation(language);
  
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [detectedType, setDetectedType] = useState(null);
  const [analysisType, setAnalysisType] = useState("comprehensive");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication on page load
  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        console.log("isAuthenticated:", isAuth);
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
      } else {
        base44.auth.redirectToLogin(window.location.pathname + window.location.search);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      base44.auth.redirectToLogin(window.location.pathname + window.location.search);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE] dark:from-[#0A0613] dark:via-[#0A0613] dark:to-[#141021] flex items-center justify-center">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#2E6BDE]/5 dark:bg-[#6F3DFF]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#10B981]/5 dark:bg-[#9D73FF]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative text-center">
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#2E6BDE] to-[#10B981] dark:from-[#6F3DFF] dark:to-[#9D73FF] rounded-2xl animate-pulse shadow-xl dark:shadow-[#6F3DFF]/40 flex items-center justify-center">
              <Upload className="w-8 h-8 text-white" />
            </div>
          </div>
          <p className="text-[#4A5568] dark:text-[#D1CDEE] text-lg font-medium">מאמת הרשאות...</p>
        </div>
      </div>
    );
  }

  const labels = {
    he: {
      title: "העלאת מסמך",
      subtitle: "העלו את המסמך המשפטי לניתוח מקיף",
      dragDrop: "גררו את המסמך לכאן",
      orClick: "או לחצו לבחירת קובץ",
      fileTypes: "PDF, JPG, PNG (עד 10MB)",
      uploadBtn: "העלה מסמך",
      documentType: "סוג המסמך",
      selectType: "בחרו סוג מסמך",
      analyze: "נתח מסמך",
      replace: "החלף קובץ",
      detected: "זוהה:",
      uploading: "מעלה...",
      analyzing: "מנתח מסמך...",
      steps: ["קורא מסמך...", "מנתח תוכן...", "מזהה סיכונים...", "יוצר דוח..."],
      features: [
        { title: "ניתוח מעמיק", desc: "ניתוח מקיף של כל סעיף" },
        { title: "זיהוי סיכונים", desc: "זיהוי אוטומטי של סעיפים בעייתיים" },
        { title: "המלצות חכמות", desc: "המלצות מותאמות אישית" },
        { title: "שיתוף עורך דין", desc: "שליחה ישירה לעורך דין" }
      ],
      errorFileType: "אנא העלו קובץ PDF או תמונה בלבד",
      errorFileSize: "גודל הקובץ חייב להיות עד 10MB",
      errorRequired: "אנא בחרו קובץ וסוג מסמך",
      errorGeneral: "אירעה שגיאה. אנא נסו שוב."
    },
    en: {
      title: "Upload Document",
      subtitle: "Upload your legal document for comprehensive analysis",
      dragDrop: "Drag your document here",
      orClick: "or click to browse",
      fileTypes: "PDF, JPG, PNG (up to 10MB)",
      uploadBtn: "Upload Document",
      documentType: "Document Type",
      selectType: "Select document type",
      analyze: "Analyze Document",
      replace: "Replace File",
      detected: "Detected:",
      uploading: "Uploading...",
      analyzing: "Analyzing document...",
      steps: ["Reading document...", "Analyzing content...", "Identifying risks...", "Creating report..."],
      features: [
        { title: "Deep Analysis", desc: "Comprehensive clause analysis" },
        { title: "Risk Detection", desc: "Automatic identification of issues" },
        { title: "Smart Recommendations", desc: "Personalized recommendations" },
        { title: "Lawyer Sharing", desc: "Direct sharing with lawyers" }
      ],
      errorFileType: "Please upload PDF or image files only",
      errorFileSize: "File size must be under 10MB",
      errorRequired: "Please select a file and document type",
      errorGeneral: "An error occurred. Please try again."
    }
  };

  const l = labels[language] || labels.he;

  const DOCUMENT_TYPES = [
    { value: "employment_contract", label: t.docTypes.employment_contract },
    { value: "rental_agreement", label: t.docTypes.rental_agreement },
    { value: "pay_slip", label: t.docTypes.pay_slip },
    { value: "insurance_policy", label: t.docTypes.insurance_policy },
    { value: "loan_agreement", label: t.docTypes.loan_agreement },
    { value: "purchase_agreement", label: t.docTypes.purchase_agreement },
    { value: "other", label: t.docTypes.other }
  ];

  const featureIcons = [FileSearch, Shield, Lightbulb, Send];

  const CATEGORIES = [
    { value: "legal", label: language === 'he' ? "מסמך משפטי" : "Legal", Icon: Shield },
    { value: "financial", label: language === 'he' ? "מסמך פיננסי" : "Financial", Icon: Wallet },
    { value: "employment", label: language === 'he' ? "מסמך תעסוקתי" : "Employment", Icon: Briefcase },
    { value: "real_estate", label: language === 'he' ? "נדל" + '״' + "ן" : "Real Estate", Icon: Home }
  ];

  const getTemplateForType = (type) => {
    if (type === 'pay_slip') return 'payslip';
    if (type === 'employment_contract') return 'employment_contract';
    if (type === 'rental_agreement') return 'rental_agreement';
    return 'generic';
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelection(e.target.files[0]);
    }
  };

  const detectDocumentType = async (file) => {
    const fileName = file.name.toLowerCase();
    
    // Basic detection from filename
    if (fileName.includes("חוזה") || fileName.includes("עבודה") || fileName.includes("employment") || fileName.includes("contract")) {
      return "employment_contract";
    } else if (fileName.includes("שכירות") || fileName.includes("rental") || fileName.includes("lease")) {
      return "rental_agreement";
    } else if (fileName.includes("תלוש") || fileName.includes("שכר") || fileName.includes("payslip") || fileName.includes("pay")) {
      return "pay_slip";
    } else if (fileName.includes("ביטוח") || fileName.includes("insurance") || fileName.includes("פוליסה")) {
      return "insurance_policy";
    } else if (fileName.includes("הלוואה") || fileName.includes("loan")) {
      return "loan_agreement";
    } else if (fileName.includes("רכישה") || fileName.includes("purchase") || fileName.includes("sale")) {
      return "purchase_agreement";
    }
    
    // Advanced AI detection
    try {
      const { file_url } = await UploadFile({ file });
      const detectionResult = await InvokeLLM({
        prompt: `נתח את סוג המסמך המשפטי הזה והחזר רק אחד מהערכים הבאים:
        employment_contract, rental_agreement, pay_slip, insurance_policy, loan_agreement, purchase_agreement, other`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            document_type: { type: "string" }
          }
        }
      });
      return detectionResult.document_type || "other";
    } catch (err) {
      console.error("AI detection failed:", err);
      return null;
    }
  };

  const handleFileSelection = async (file) => {
    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      setError(l.errorFileType);
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      setError(l.errorFileSize);
      return;
    }

    setSelectedFile(file);
    setError(null);
    
    // Simple filename-based detection only (no AI, no upload)
    const fileName = file.name.toLowerCase();
    let detected = null;
    
    if (fileName.includes("חוזה") || fileName.includes("עבודה") || fileName.includes("employment") || fileName.includes("contract")) {
      detected = "employment_contract";
    } else if (fileName.includes("שכירות") || fileName.includes("rental") || fileName.includes("lease")) {
      detected = "rental_agreement";
    } else if (fileName.includes("תלוש") || fileName.includes("שכר") || fileName.includes("payslip") || fileName.includes("pay")) {
      detected = "pay_slip";
    } else if (fileName.includes("ביטוח") || fileName.includes("insurance") || fileName.includes("פוליסה")) {
      detected = "insurance_policy";
    } else if (fileName.includes("הלוואה") || fileName.includes("loan")) {
      detected = "loan_agreement";
    } else if (fileName.includes("רכישה") || fileName.includes("purchase") || fileName.includes("sale")) {
      detected = "purchase_agreement";
    }
    
    if (detected) {
      setDetectedType(detected);
      setDocumentType(detected);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setDocumentType("");
    setDetectedType(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const simulateProgress = () => {
    let progress = 0;
    let step = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 12 + 5; // Faster progress
      if (progress > 100) progress = 100;
      setAnalysisProgress(Math.floor(progress));

      if (progress > 25 && step < 1) { step = 1; setAnalysisStep(1); }
      if (progress > 50 && step < 2) { step = 2; setAnalysisStep(2); }
      if (progress > 75 && step < 3) { step = 3; setAnalysisStep(3); }

      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 250); // Faster interval

    return () => clearInterval(interval);
  };

  const handleAnalyze = async () => {
    if (!selectedFile || !documentType) {
      setError(l.errorRequired);
      return;
    }

    // Get user FIRST before any processing - FORCE REFRESH from DB
    let currentUser = null;
    try {
      const { getCurrentUser, updateUser } = await import("@/components/userSync");
      currentUser = await getCurrentUser(true); // Force refresh from database
      console.log("currentUser:", currentUser?.id, currentUser?.authId);
      
      if (!currentUser) {
        setError("שגיאה בטעינת פרטי המשתמש. נסו שוב בעוד רגע.");
        return;
      }

      console.log("Current user plan:", currentUser.plan);
      console.log("Scans used:", currentUser.scansUsed);
      

      // Enforce free limit unless admin/owner can bypass
      const authUser = currentUser.auth;
      const authId = authUser.id || authUser.user_id;
      const bypass = canBypassPlan(currentUser) || isAdminUser(currentUser) || String(currentUser?.role).toLowerCase() === "admin";
      if (!bypass) {
        const plan = String(currentUser.plan || "free").toLowerCase();
        const planLimits = { free: 1, beginner: 10, pro: 30, business: 100 };
        const limit = planLimits[plan] ?? 1;
        console.log("authId:", authId, "plan:", plan, "limit:", limit);
        const existingDocs = await Document.filter({ ownerAuthId: authId });
        if (Array.isArray(existingDocs) && existingDocs.length >= limit) {
          setError(`הגעת למגבלת הסריקות (${limit}). שדרג כדי להמשיך`);
          setTimeout(() => {
            navigate(createPageUrl("Upgrade"));
          }, 2500);
          return;
        }
      } else {
        console.log("Bypassing limits for admin/owner");
      }

      // Skipping Users-based plan checks; enforcing free limit via documents count above.

      // Now start uploading
      setIsUploading(true);
      setError(null);

      // reuse existing authUser
      const { file_url } = await UploadFile({ file: selectedFile });

      setIsUploading(false);
      setIsAnalyzing(true);
      setAnalysisStep(0);
      setAnalysisProgress(0);

      simulateProgress();

      // Build smart analysis prompt based on document type
      let analysisPrompt = '';

      if (documentType === 'pay_slip') {
        // Special prompt for pay slips
        analysisPrompt = `
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

          - בדוק אם שכר הבסיס עומד בשכר המינימום (נכון ל-2025 שכר מינימום הוא כ-5,880 ₪ ברוטו לחודש מלא)
          - בדוק אם אחוזי הניכויים תקינים:
            * מס הכנסה: בדרך כלל 10%-50% תלוי ברמת הכנסה (ממוצע 20-30%)
            * ביטוח לאומי: כ-7% עד תקרה מסוימת, ו-12% מעל התקרה
            * ביטוח בריאות: כ-5%
            * פנסיה: מעסיק 6.5%, עובד 6%
          - בדוק אם שעות נוספות חושבו נכון (125%-150% תלוי בסוג)
          - בדוק אם יש התאמה בין הברוטו, הניכויים והנטו
          - זהה כל חריגה או דבר חשוד

          דווח על הממצאים:
          - רשום את כל החריגות שמצאת (אם יש)
          - הסבר מה המשמעות של כל חריגה
          - תן המלצות מה לעשות (לבדוק עם המעסיק, לפנות לרואה חשבון, וכו')
          - אם הכל תקין - ציין זאת במפורש
        `;
      } else {
        // Original prompt for legal documents
        analysisPrompt = `
        נתח את המסמך המשפטי הבא בעברית בצורה מעמיקה ומקצועית.

        חשוב מאוד: כל התוכן חייב להיות בעברית בלבד! אסור לכתוב באנגלית!

        הצג רק סעיפים שבאמת קיימים במסמך!
        אל תמציא או תוסיף סעיפים ריקים.

        עבור כל סעיף שמצאת במסמך, החזר אותו בעברית בפורמט המתאים:

        0. סיכום_מנהלים: סיכום ברמה גבוהה של 2-3 משפטים המסכם את העיקר של המסמך - מה זה, למה זה משמש, והאם יש נקודות קריטיות שצריך לדעת (חובה - בעברית)

        1. תקציר_משפטי: סיכום מפורט יותר של המסמך בעברית (חובה)

        2. מושגים_משפטיים: זהה והסבר מושגים משפטיים מורכבים שמופיעים במסמך (למשל: "שיפוי", "כוח עליון", "תניית בוררות"). לכל מושג ציין: שם המושג, הסבר פשוט בעברית, והיכן הוא מופיע במסמך (בעברית)

        3. זכויות: רק אם המסמך מזכיר זכויות או הטבות ספציפיות - בעברית

        4. חובות_והתחייבויות: רק אם המסמך מזכיר חובות או התחייבויות ספציפיות - בעברית

        5. סיכונים: רק אם יש סעיפים בעייתיים, סיכונים משפטיים, או "אותיות קטנות" - בעברית

        6. תאריכים_חשובים: רק אם המסמך מכיל תאריכים קריטיים (תוקף, התחלה, סיום, מועדי תשלום) - בעברית

        7. כספים_ושכר: רק אם המסמך מזכיר סכומים, משכורת, תשלומים, קנסות, או התחייבויות כספיות - בעברית

        8. תנאים_מיוחדים: רק אם יש תנאים מיוחדים כמו סודיות, בוררות, תקופת התראה, סיום חוזה - בעברית

        9. סעיפי_פיצויים: רק אם המסמך מכיל סעיפי פיצויים, פיצויי פיטורים, או פיצויים אחרים - בעברית

        10. אחריות_משפטית: רק אם המסמך מגדיר אחריות משפטית של הצדדים, שיפוי, או חבות - בעברית

        11. אי_תחרות: רק אם המסמך כולל תניות אי-תחרות, איסור עבודה במקביל, או הגבלות דומות - בעברית

        12. הגבלת_אחריות: רק אם המסמך מכיל סעיפי הגבלת אחריות או הגבלת נזקים - בעברית

        13. סיום_חוזה: רק אם המסמך מגדיר תנאי סיום חוזה, ביטול, או פקיעה - בעברית

        14. המלצות: המלצות מעשיות להמשך פעולה בעברית (חובה)

        15. חוסר_עקביות: זהה חוסרי עקביות פנימיים במסמך (למשל: סתירות בין סעיפים, תאריכים לא עקביים, סכומים שלא מתאימים). לכל חוסר עקביות ציין: סוג, תיאור, חומרה (נמוכה/בינונית/גבוהה), ומיקום בעברית

        16. הפניות_צולבות: זהה סעיפים שתלויים אחד בשני או מפנים אחד לשני. ציין איזה סעיף תלוי במי והסבר את הקשר בעברית

        זכור: 
        - אם סעיף לא רלוונטי או לא נמצא במסמך - אל תכלול אותו בתשובה!
        - כל התשובות חייבות להיות בעברית בלבד!
        - היה מדויק מאוד בזיהוי חוסרי עקביות - רק אם באמת יש כאלה!
        `;
        }

        // Build JSON schema based on document type
        let jsonSchema = {};

        if (documentType === 'pay_slip') {
        jsonSchema = {
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
        };
        } else {
        jsonSchema = {
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
              }

              const rawResult = await InvokeLLM({
              prompt: analysisPrompt,
              file_urls: [file_url],
              response_json_schema: jsonSchema,
              add_context_from_internet: false
              });
              const analysisResult = typeof rawResult === 'string' 
                ? { executive_summary: rawResult, summary: rawResult }
                : rawResult;

              // Create document with user ID
      const userId = authUser.id || authUser.user_id || authUser.email;
      const now = new Date().toISOString();
      const documentData = {
        ownerAuthId: userId,
        userId: userId,
        title: selectedFile.name,
        category: selectedCategory || 'other',
        documentType: documentType || 'other',
        analysisTemplate: getTemplateForType(documentType),
        document_type: documentType,
        file_url: file_url,
        ai_analysis: analysisResult,
        analysisResult: analysisResult,
        analysisStatus: 'done',
        analyzedAt: now,
        status: "analyzed"
      };

      console.log("Creating document...");
      const document = await Document.create(documentData);

      setIsAnalyzing(false);
      navigate(createPageUrl("Analysis") + `?id=${document.id}`);

    } catch (err) {
      console.error("Error analyzing document:", err);
      setError(err.message || l.errorGeneral);
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  // Analysis Loading Screen
  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE] dark:from-[#0A0613] dark:via-[#0A0613] dark:to-[#141021] flex flex-col items-center justify-center p-6">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-96 h-96 bg-[#2E6BDE]/5 dark:bg-[#6F3DFF]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#10B981]/5 dark:bg-[#9D73FF]/20 rounded-full blur-3xl animate-pulse"></div>
        </div>

        <div className="relative z-10">
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
          
          <h1 className="text-2xl font-bold text-[#0A2A43] dark:text-[#F5F3FF] mb-2 text-center">{l.title}</h1>
          <p className="text-[#4A5568] dark:text-[#D1CDEE] mb-8 text-center">{l.subtitle}</p>
          
          {/* Analysis Card */}
          <div className="bg-white dark:bg-[#141021] border border-[#E3E6EB] dark:border-[#1F1A2D] rounded-2xl p-8 w-full max-w-lg shadow-2xl dark:shadow-[#6F3DFF]/30">
            {/* Animated Icon */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2E6BDE] to-[#10B981] dark:from-[#6F3DFF] dark:to-[#9D73FF] rounded-2xl animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-white animate-spin" style={{animationDuration: '3s'}} />
              </div>
            </div>

            <h2 className="text-xl font-bold text-[#0A2A43] dark:text-[#F5F3FF] mb-2 text-center">{l.analyzing}</h2>
            <p className="text-sm text-[#4A5568] dark:text-[#D1CDEE] mb-6 text-center">המערכת מנתחת את המסמך בעזרת AI מתקדם</p>

            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[#4A5568] dark:text-[#D1CDEE]">התקדמות</span>
                <span className="text-sm font-bold text-[#2E6BDE] dark:text-[#9D73FF]">{analysisProgress}%</span>
              </div>
              <div className="h-3 bg-[#E3E6EB] dark:bg-[#1F1A2D] rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-[#2E6BDE] to-[#10B981] dark:from-[#6F3DFF] dark:to-[#9D73FF] rounded-full transition-all duration-500 shadow-lg"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
            
            {/* Steps */}
            <div className="space-y-4">
              {l.steps.map((step, index) => (
                <div key={index} className="flex items-center gap-4 group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    index < analysisStep 
                      ? 'bg-gradient-to-br from-[#10B981] to-[#059669] dark:from-[#9D73FF] dark:to-[#6F3DFF] text-white shadow-lg'
                      : index === analysisStep
                      ? 'bg-gradient-to-br from-[#2E6BDE] to-[#1D4ED8] dark:from-[#6F3DFF] dark:to-[#9D73FF] text-white shadow-lg animate-pulse'
                      : 'bg-[#F8F9FB] dark:bg-[#1F1A2D] text-[#9CA3AF] dark:text-[#D1CDEE]'
                  }`}>
                    {index < analysisStep ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : index === analysisStep ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="text-sm font-bold">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${
                    index <= analysisStep 
                      ? 'text-[#0A2A43] dark:text-[#F5F3FF]' 
                      : 'text-[#9CA3AF] dark:text-[#D1CDEE]/50'
                  }`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>

            {/* Tip */}
            <div className="mt-8 p-4 bg-[#EBF2FE] dark:bg-[#6F3DFF]/10 rounded-xl border border-[#2E6BDE]/20 dark:border-[#6F3DFF]/30">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-[#2E6BDE] dark:text-[#9D73FF] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[#4A5568] dark:text-[#D1CDEE] font-medium">טיפ מקצועי</p>
                  <p className="text-xs text-[#4A5568] dark:text-[#D1CDEE] mt-1">הניתוח כולל זיהוי סיכונים, זכויות וחובות באופן אוטומטי</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Category step (Step 1)
  if (!selectedCategory) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE] dark:from-[#0A0613] dark:via-[#0A0613] dark:to-[#141021] p-6">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-[#0A2A43] dark:text-[#F5F3FF] mb-2">{language === 'he' ? 'בחרו קטגוריה' : 'Choose Category'}</h1>
            <p className="text-[#4A5568] dark:text-[#D1CDEE]">{language === 'he' ? 'שלב 1 מתוך 3' : 'Step 1 of 3'}</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CATEGORIES.map(({ value, label, Icon }) => (
              <button key={value} onClick={() => setSelectedCategory(value)} className="bg-white dark:bg-[#141021] border border-[#E5E8EB] dark:border-[#1F1A2D] rounded-2xl p-6 text-center shadow hover:shadow-md transition">
                <div className="w-10 h-10 mx-auto mb-3 bg-gradient-to-br from-[#2E6BDE] to-[#1D4ED8] dark:from-[#6F3DFF] dark:to-[#9D73FF] rounded-xl flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-sm font-semibold text-[#0A2A43] dark:text-[#F5F3FF]">{label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE] dark:from-[#0A0613] dark:via-[#0A0613] dark:to-[#141021] p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2E6BDE]/5 dark:bg-[#6F3DFF]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#10B981]/5 dark:bg-[#9D73FF]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#0A2A43] dark:text-[#F5F3FF] mb-2">{l.title}</h1>
          <p className="text-[#4A5568] dark:text-[#D1CDEE]">{l.subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#D9534F]/10 dark:bg-[#9D73FF]/20 border border-[#D9534F]/30 dark:border-[#9D73FF]/30 rounded-xl flex items-center gap-3 max-w-2xl mx-auto shadow-lg dark:shadow-[#9D73FF]/20">
            <AlertCircle className="h-5 w-5 text-[#D9534F] dark:text-[#9D73FF] flex-shrink-0" />
            <span className="text-[#D9534F] dark:text-[#F5F3FF] text-sm font-medium">{error}</span>
          </div>
        )}

        <div className="bg-white dark:bg-[#141021] border border-[#E5E8EB] dark:border-[#1F1A2D] rounded-2xl p-8 max-w-2xl mx-auto mb-8 shadow-xl dark:shadow-[#6F3DFF]/20">
          {isUploading ? (
            <div className="text-center py-12">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2E6BDE] to-[#10B981] dark:from-[#6F3DFF] dark:to-[#9D73FF] rounded-2xl animate-pulse"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="w-10 h-10 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-[#0A2A43] dark:text-[#F5F3FF] mb-2">{l.uploading}</h3>
              <p className="text-sm text-[#4A5568] dark:text-[#D1CDEE]">מעלה את המסמך למערכת...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upload Area */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer ${
                  dragActive 
                    ? 'border-[#2E6BDE] dark:border-[#6F3DFF] bg-[#2E6BDE]/5 dark:bg-[#6F3DFF]/10' 
                    : selectedFile
                    ? 'border-[#10B981] dark:border-[#9D73FF] bg-[#10B981]/5 dark:bg-[#9D73FF]/10'
                    : 'border-[#E3E6EB] dark:border-[#1F1A2D] hover:border-[#2E6BDE] dark:hover:border-[#6F3DFF] hover:bg-[#F8F9FB] dark:hover:bg-[#1F1A2D]'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !selectedFile && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={handleFileInput}
                  className="hidden"
                />
                
                {selectedFile ? (
                  <div>
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#10B981] to-[#059669] dark:from-[#9D73FF] dark:to-[#6F3DFF] rounded-xl flex items-center justify-center shadow-lg dark:shadow-[#9D73FF]/40">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-[#0A2A43] dark:text-[#F5F3FF] mb-1">{selectedFile.name}</p>
                    <p className="text-sm text-[#4A5568] dark:text-[#D1CDEE] mb-4">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {detectedType && (
                      <span className="inline-block bg-[#2E6BDE]/10 dark:bg-[#6F3DFF]/20 text-[#2E6BDE] dark:text-[#9D73FF] text-xs font-medium px-3 py-1 rounded-full border border-[#2E6BDE]/20 dark:border-[#6F3DFF]/30">
                        {l.detected} {DOCUMENT_TYPES.find(type => type.value === detectedType)?.label}
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#2E6BDE] to-[#1D4ED8] dark:from-[#6F3DFF] dark:to-[#9D73FF] rounded-xl flex items-center justify-center shadow-lg dark:shadow-[#6F3DFF]/30">
                      <UploadIcon className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-[#0A2A43] dark:text-[#F5F3FF] mb-2">{l.dragDrop}</p>
                    <p className="text-sm text-[#4A5568] dark:text-[#D1CDEE] mb-4">{l.orClick}</p>
                    <Button 
                      variant="outline" 
                      className="border-2 border-[#2E6BDE] dark:border-[#6F3DFF] text-[#2E6BDE] dark:text-[#9D73FF] hover:bg-[#2E6BDE] dark:hover:bg-[#6F3DFF] hover:text-white dark:hover:text-white transition-all"
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      {l.uploadBtn}
                    </Button>
                    <p className="text-xs text-[#9CA3AF] dark:text-[#D1CDEE] mt-4">{l.fileTypes}</p>
                  </div>
                )}
              </div>

              {/* Step 2: Document Type Selection */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-[#0A2A43] dark:text-[#F5F3FF]">
                    {l.documentType}
                  </label>
                  <span className="text-xs text-[#6B7280]">{language === 'he' ? 'שלב 2 מתוך 3' : 'Step 2 of 3'}</span>
                </div>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                  className="w-full h-12 px-4 bg-white dark:bg-[#0A0613] border border-[#E5E8EB] dark:border-[#1F1A2D] rounded-xl text-[#0A2A43] dark:text-[#F5F3FF] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6BDE] dark:focus:ring-[#6F3DFF] focus:border-transparent shadow-sm"
                >
                  <option value="">{l.selectType}</option>
                  {DOCUMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>

                {/* Quick choices for advanced analysis */}
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { value: 'pay_slip', label: language === 'he' ? 'תלוש שכר' : 'Payslip' },
                    { value: 'employment_contract', label: language === 'he' ? 'חוזה עבודה' : 'Employment Contract' },
                    { value: 'rental_agreement', label: language === 'he' ? 'חוזה שכירות' : 'Rental Agreement' },
                  ].map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setDocumentType(t.value)}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg border text-sm ${documentType === t.value ? 'border-[#2E6BDE] text-[#2E6BDE] bg-[#EBF2FE]' : 'border-[#E5E8EB] text-[#4A5568] hover:bg-[#F8F9FB]'}`}
                    >
                      <span>{t.label}</span>
                      <span className="text-[10px] bg-[#2E6BDE] text-white rounded-full px-2 py-0.5">{language === 'he' ? 'ניתוח מתקדם' : 'Advanced'}</span>
                    </button>
                  ))}
                </div>
              </div>



                  <div className="flex gap-3">
                    <Button
                      onClick={handleAnalyze}
                      disabled={!selectedFile || !documentType}
                      className="flex-1 h-12 bg-gradient-to-r from-[#2E6BDE] to-[#10B981] dark:from-[#6F3DFF] dark:to-[#9D73FF] hover:from-[#1D4ED8] hover:to-[#059669] dark:hover:from-[#6F3DFF] dark:hover:to-[#6F3DFF] text-white font-semibold disabled:opacity-50 shadow-lg dark:shadow-[#6F3DFF]/30 transition-all"
                    >
                      {l.analyze}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-[#E5E8EB] dark:border-[#1F1A2D] text-[#4A5568] dark:text-[#D1CDEE] hover:bg-[#F8F9FB] dark:hover:bg-[#1F1A2D]"
                    >
                      <RefreshCw className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {l.replace}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={clearFile}
                      className="border-[#E5E8EB] dark:border-[#1F1A2D] text-[#4A5568] dark:text-[#D1CDEE] hover:bg-[#F8F9FB] dark:hover:bg-[#1F1A2D]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
            </div>
          )}
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {l.features.map((feature, index) => {
            const Icon = featureIcons[index];
            const gradients = [
              'from-[#2E6BDE] to-[#1D4ED8]',
              'from-[#10B981] to-[#059669]',
              'from-[#F59E0B] to-[#D97706]',
              'from-[#6366F1] to-[#4F46E5]'
            ];
            const darkGradients = [
              'dark:from-[#6F3DFF] dark:to-[#9D73FF]',
              'dark:from-[#9D73FF] dark:to-[#6F3DFF]',
              'dark:from-[#6F3DFF] dark:to-[#9D73FF]',
              'dark:from-[#9D73FF] dark:to-[#6F3DFF]'
            ];
            return (
              <div key={index} className="bg-white dark:bg-[#141021] border border-[#E5E8EB] dark:border-[#1F1A2D] rounded-2xl p-5 text-center shadow-lg dark:shadow-[#6F3DFF]/20 hover:scale-105 transition-transform">
                <div className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${gradients[index]} ${darkGradients[index]} rounded-xl flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-[#0A2A43] dark:text-[#F5F3FF] mb-1 text-sm">{feature.title}</h3>
                <p className="text-xs text-[#4A5568] dark:text-[#D1CDEE]">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}