import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { sendNotification, getNotificationMessages } from "@/components/notificationService";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  User,
  Loader2,
  Send,
  AlertCircle,
  Lightbulb,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  Star,
  MessageSquare,
  Download,
  BarChart3,
  Target,
  Zap,
  Bell,
  Upload,
  Paperclip,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const LawyerCase = base44.entities.LawyerCase;
const Document = base44.entities.Document;

export default function LawyerDashboardPage() {
  const navigate = useNavigate();
  const { language, isRTL } = useTheme();
  
  const [cases, setCases] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [legalReview, setLegalReview] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterUrgency, setFilterUrgency] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [internalNotes, setInternalNotes] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [lawyerNotifications, setLawyerNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const labels = {
    he: {
      title: "דשבורד עורך דין",
      subtitle: "ניהול תיקים וחוות דעת משפטיות",
      pending: "ממתינים",
      inProgress: "בטיפול",
      completed: "הושלמו",
      noCases: "אין תיקים להצגה",
      selectCase: "בחרו תיק לצפייה",
      clientInfo: "פרטי לקוח",
      name: "שם:",
      email: "אימייל:",
      aiSummary: "סיכום AI",
      documentAnalysis: "ניתוח מסמך",
      yourOpinion: "חוות הדעת שלך",
      opinionPlaceholder: "כתבו את חוות הדעת המשפטית שלכם כאן...",
      submitOpinion: "שלח חוות דעת",
      submitting: "שולח...",
      loading: "טוען..."
    },
    en: {
      title: "Lawyer Dashboard",
      subtitle: "Manage cases and legal opinions",
      pending: "Pending",
      inProgress: "In Progress",
      completed: "Completed",
      noCases: "No cases to display",
      selectCase: "Select a case to view",
      clientInfo: "Client Information",
      name: "Name:",
      email: "Email:",
      aiSummary: "AI Summary",
      documentAnalysis: "Document Analysis",
      yourOpinion: "Your Opinion",
      opinionPlaceholder: "Write your legal opinion here...",
      submitOpinion: "Submit Opinion",
      submitting: "Submitting...",
      loading: "Loading..."
    }
  };

  const l = labels[language] || labels.he;

  useEffect(() => {
    checkAccessAndLoadData();
    loadLawyerNotifications();
  }, []);

  const loadLawyerNotifications = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser.role !== "lawyer" && currentUser.role !== "admin") return;

      // Get all pending cases that don't have lawyerUserId assigned yet
      const allCases = await LawyerCase.list("-created_date", 50);
      const newCases = allCases.filter(c => c.status === "pending" && !c.lawyerUserId);
      
      setLawyerNotifications(newCases.slice(0, 5)); // Show latest 5 new cases
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const checkAccessAndLoadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      
      // Check if user is a lawyer or admin
      if (currentUser.role !== "lawyer" && currentUser.role !== "admin") {
        // Redirect non-lawyers to dashboard
        navigate(createPageUrl("Dashboard"));
        return;
      }
      
      const [casesData, docsData] = await Promise.all([
        LawyerCase.list("-created_date"),
        Document.list()
      ]);
      setCases(casesData);
      setDocuments(docsData);
    } catch (error) {
      console.error("Error loading data:", error);
      navigate(createPageUrl("Home"));
    }
    setIsLoading(false);
  };

  const getDocumentById = (docId) => {
    return documents.find(d => d.id === docId);
  };

  // Legal Opinion Templates
  const opinionTemplates = {
    employment_contract: `בהתבסס על ניתוח המסמך, חוזה העבודה כולל את הרכיבים הבסיסיים הנדרשים. 

ממצאים עיקריים:
1. תנאי השכר והתגמול מפורטים בבירור
2. תקופת ההודעה המוקדמת תואמת את דרישות החוק
3. יש לשים לב לסעיף [X] בנוגע ל[Y]

המלצות:
- כדאי לבחון את [...]
- מומלץ להבהיר [...]

לסיכום, המסמך תקין אך מומלץ להתייחס לנקודות שצוינו לעיל.`,
    rental_agreement: `בהתבסס על בדיקת חוזה השכירות, המסמך מכיל את המרכיבים המשפטיים הנדרשים.

ממצאים עיקריים:
1. תנאי השכירות והתשלום מוגדרים בבירור
2. זכויות וחובות הצדדים מפורטות
3. יש לשים לב לסעיפים הנוגעים ל[...]

המלצות:
- מומלץ להוסיף הסדר בנוגע ל[...]
- כדאי לבחון את תנאי הביטול

לסיכום, החוזה תקין משפטית עם ההמלצות שצוינו.`,
    pay_slip: `לאחר בדיקת תלוש השכר, להלן ממצאי:

בדיקת תקינות:
1. שכר הבסיס תואם/אינו תואם את שכר המינימום
2. ניכויים מבוצעים כדין
3. זכויות סוציאליות מופקדות כנדרש

ממצאים:
[פרט כאן את הממצאים הספציפיים]

המלצות:
- יש לבדוק [...]
- מומלץ לפנות למעסיק בנוגע ל[...]

לסיכום, [סיכום הממצאים].`,
    other: `בהתבסס על ניתוח המסמך, להלן חוות דעתי המשפטית:

ממצאים עיקריים:
1. [ממצא 1]
2. [ממצא 2]
3. [ממצא 3]

סיכונים משפטיים:
- [סיכון 1]
- [סיכון 2]

המלצות:
- [המלצה 1]
- [המלצה 2]

לסיכום, [סיכום כללי].`
  };

  const getCasesByStatus = (status) => {
    if (status === "pending") return cases.filter(c => c.status === "pending");
    if (status === "progress") return cases.filter(c => c.status === "in_progress");
    if (status === "completed") return cases.filter(c => c.status === "completed");
    return [];
  };

  const useTemplate = () => {
    const doc = getDocumentById(selectedCase?.document_id);
    const template = opinionTemplates[doc?.document_type] || opinionTemplates.other;
    setLegalReview(template);
    setShowTemplates(false);
  };

  // Filtered and sorted cases
  const filteredCases = useMemo(() => {
    let filtered = getCasesByStatus(activeTab);

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(c => {
        const doc = getDocumentById(c.document_id);
        return (
          c.client_name?.toLowerCase().includes(query) ||
          c.client_email?.toLowerCase().includes(query) ||
          doc?.title?.toLowerCase().includes(query)
        );
      });
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter(c => {
        const doc = getDocumentById(c.document_id);
        return doc?.document_type === filterType;
      });
    }

    // Urgency filter
    if (filterUrgency !== "all") {
      filtered = filtered.filter(c => c.urgency === filterUrgency);
    }

    // Sort
    filtered.sort((a, b) => {
      const docA = getDocumentById(a.document_id);
      const docB = getDocumentById(b.document_id);
      
      if (sortBy === "newest") {
        return new Date(b.created_date) - new Date(a.created_date);
      } else if (sortBy === "oldest") {
        return new Date(a.created_date) - new Date(b.created_date);
      } else if (sortBy === "urgency") {
        const urgencyOrder = { high: 0, medium: 1, low: 2 };
        return (urgencyOrder[a.urgency] || 2) - (urgencyOrder[b.urgency] || 2);
      } else if (sortBy === "status") {
        const statusOrder = { pending: 0, in_progress: 1, completed: 2 };
        return (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0);
      }
      return 0;
    });

    return filtered;
  }, [cases, documents, activeTab, searchQuery, filterType, filterUrgency, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const thisMonth = cases.filter(c => {
      const caseDate = new Date(c.created_date);
      return caseDate.getMonth() === now.getMonth() && caseDate.getFullYear() === now.getFullYear();
    });

    const completedThisMonth = thisMonth.filter(c => c.status === "completed").length;
    const avgResponseTime = cases.filter(c => c.status === "completed").length > 0
      ? Math.round(cases.filter(c => c.status === "completed").reduce((acc, c) => {
          const start = new Date(c.created_date);
          const end = new Date(c.updated_date);
          return acc + (end - start) / (1000 * 60 * 60 * 24);
        }, 0) / cases.filter(c => c.status === "completed").length)
      : 0;

    return {
      totalCases: cases.length,
      pending: getCasesByStatus("pending").length,
      inProgress: getCasesByStatus("progress").length,
      completed: getCasesByStatus("completed").length,
      completedThisMonth,
      avgResponseTime
    };
  }, [cases]);

  const getNotificationStatus = async (caseItem) => {
    try {
      const Notification = base44.entities.Notification;
      const notifs = await Notification.filter({
        userId: caseItem.client_email,
        documentId: caseItem.document_id,
        type: "document_reviewed"
      });
      
      if (notifs.length > 0) {
        const latestNotif = notifs[0];
        return latestNotif.isRead ? "opened" : "sent";
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const [notificationStatuses, setNotificationStatuses] = useState({});

  useEffect(() => {
    if (cases.length > 0) {
      const loadStatuses = async () => {
        const statuses = {};
        for (const caseItem of cases.filter(c => c.status === "completed")) {
          const status = await getNotificationStatus(caseItem);
          statuses[caseItem.id] = status;
        }
        setNotificationStatuses(statuses);
      };
      loadStatuses();
    }
  }, [cases]);

  const submitReview = async () => {
    if (!selectedCase || !legalReview.trim()) return;

    setIsSubmitting(true);
    try {
      await LawyerCase.update(selectedCase.id, {
        status: "completed"
      });

      const doc = getDocumentById(selectedCase.document_id);
      if (doc) {
        await Document.update(doc.id, {
          status: "completed",
          lawyer_review: {
            lawyer_id: user.email,
            lawyer_name: user.full_name || "עורך דין",
            review_summary: legalReview,
            legal_recommendation: legalReview,
            signed_date: new Date().toISOString()
          }
        });

        // Create notification for client
        const Notification = base44.entities.Notification;
        await Notification.create({
          userId: selectedCase.client_email,
          title: "עורך הדין השיב על המסמך שלך",
          message: `${user.full_name || "עורך דין"} שלח חוות דעת משפטית למסמך שלך: ${doc.title}`,
          type: "document_reviewed",
          documentId: doc.id,
          isRead: false,
          createdAt: new Date().toISOString()
        });

        // Send email notification
        try {
          await base44.integrations.Core.SendEmail({
            to: selectedCase.client_email,
            subject: "עורך דין השיב על המסמך שלך ב-Decifra.ai",
            body: `שלום ${selectedCase.client_name},\n\nעורך הדין ${user.full_name || "עורך דין"} סיים לבדוק את המסמך שלך: "${doc.title}".\n\nניתן לצפות בחוות הדעת המשפטית בדשבורד שלך:\n${window.location.origin}${createPageUrl('DashboardHome')}\n\nצוות Decifra.ai`
          });
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }

      await checkAccessAndLoadData();
      setSelectedCase(null);
      setLegalReview("");
      alert("חוות הדעת נשלחה בהצלחה ללקוח!");
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("שגיאה בשליחת חוות הדעת");
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5F6F7] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 mx-auto mb-4 text-[#1C3D5A] animate-spin" />
          <p className="text-[#5A6B7D]">{l.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F6F7] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#1C3D5A] to-[#2E6BDE] rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F1E2E]">{l.title}</h1>
                <p className="text-[#5A6B7D]">{l.subtitle}</p>
              </div>
            </div>
            
            {/* Notifications Button */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 bg-white border border-[#E5E8EB] rounded-xl hover:bg-[#F8F9FB] transition-colors"
            >
              <Bell className="w-5 h-5 text-[#5A6B7D]" />
              {lawyerNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#EF4444] text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {lawyerNotifications.length}
                </span>
              )}
            </button>
          </div>

          {/* Notifications Panel */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white border border-[#E5E8EB] rounded-xl p-4 mt-4 shadow-lg"
              >
                <h3 className="font-semibold text-[#0F1E2E] mb-3 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-[#2E6BDE]" />
                  תיקים חדשים שהוקצו
                </h3>
                {lawyerNotifications.length === 0 ? (
                  <p className="text-sm text-[#5A6B7D]">אין תיקים חדשים</p>
                ) : (
                  <div className="space-y-2">
                    {lawyerNotifications.map((caseItem) => {
                      const doc = getDocumentById(caseItem.documentId);
                      return (
                        <div
                          key={caseItem.id}
                          className="flex items-start justify-between gap-3 p-3 bg-[#EBF2FE] rounded-lg border border-[#2E6BDE]/20"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-[#0F1E2E] text-sm">{doc?.title || "מסמך חדש"}</p>
                            <p className="text-xs text-[#5A6B7D]">לקוח: {caseItem.client_name}</p>
                            <p className="text-xs text-[#9CA3AF]">{new Date(caseItem.created_date).toLocaleString('he-IL')}</p>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedCase(caseItem);
                              setActiveTab("pending");
                              setShowNotifications(false);
                            }}
                            className="bg-[#2E6BDE] hover:bg-[#1D4ED8] text-white"
                          >
                            פתח
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#F59E0B] to-[#D97706] rounded-xl p-4 sm:p-5 shadow-lg text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 opacity-80" />
              <span className="text-xs font-medium uppercase tracking-wide">ממתינים</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{stats.pending}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-[#2E6BDE] to-[#1D4ED8] rounded-xl p-4 sm:p-5 shadow-lg text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 opacity-80" />
              <span className="text-xs font-medium uppercase tracking-wide">בטיפול</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{stats.inProgress}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-[#10B981] to-[#059669] rounded-xl p-4 sm:p-5 shadow-lg text-white"
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 opacity-80" />
              <span className="text-xs font-medium uppercase tracking-wide">הושלמו</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">{stats.completed}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25 }}
            className="bg-white border border-[#E5E8EB] rounded-xl p-4 sm:p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-medium text-[#5A6B7D]">החודש</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#0F1E2E]">{stats.completedThisMonth}</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-[#E5E8EB] rounded-xl p-4 sm:p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#2E6BDE]" />
              <span className="text-xs font-medium text-[#5A6B7D]">זמן ממוצע</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#0F1E2E]">{stats.avgResponseTime}י</p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-white border border-[#E5E8EB] rounded-xl p-4 sm:p-5 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-[#F59E0B]" />
              <span className="text-xs font-medium text-[#5A6B7D]">סה"כ תיקים</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-[#0F1E2E]">{stats.totalCases}</p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cases List */}
          <div className="bg-white border border-[#E5E8EB] rounded-xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="border-b border-[#E5E8EB]">
              <div className="flex">
                {["pending", "progress", "completed"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSearchQuery("");
                      setFilterType("all");
                      setFilterUrgency("all");
                    }}
                    className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                      activeTab === tab 
                        ? 'text-[#1C3D5A]' 
                        : 'text-[#5A6B7D] hover:text-[#0F1E2E]'
                    }`}
                  >
                    {tab === "pending" ? l.pending : tab === "progress" ? l.inProgress : l.completed}
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1C3D5A]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="p-3 border-b border-[#E5E8EB] space-y-2 bg-[#F8F9FB]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <Input
                  placeholder="חיפוש לקוח או מסמך..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 h-9 text-sm border-[#E5E8EB]"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="סוג" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל הסוגים</SelectItem>
                    <SelectItem value="employment_contract">חוזה עבודה</SelectItem>
                    <SelectItem value="rental_agreement">חוזה שכירות</SelectItem>
                    <SelectItem value="pay_slip">תלוש שכר</SelectItem>
                    <SelectItem value="insurance_policy">ביטוח</SelectItem>
                    <SelectItem value="other">אחר</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterUrgency} onValueChange={setFilterUrgency}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="דחיפות" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">הכל</SelectItem>
                    <SelectItem value="high">גבוהה</SelectItem>
                    <SelectItem value="medium">בינונית</SelectItem>
                    <SelectItem value="low">נמוכה</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="מיון" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">תאריך - חדשים</SelectItem>
                    <SelectItem value="oldest">תאריך - ישנים</SelectItem>
                    <SelectItem value="urgency">חשיבות - גבוהה</SelectItem>
                    <SelectItem value="status">סטטוס</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cases List */}
            <div className="max-h-[500px] overflow-y-auto">
              <AnimatePresence mode="popLayout">
                {filteredCases.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-8 text-center"
                  >
                    <FileText className="w-10 h-10 mx-auto mb-3 text-[#D9DDE1]" />
                    <p className="text-[#5A6B7D] text-sm">{l.noCases}</p>
                  </motion.div>
                ) : (
                  filteredCases.map((caseItem, index) => {
                    const doc = getDocumentById(caseItem.document_id);
                    const urgencyColors = {
                      high: 'bg-red-100 text-red-800',
                      medium: 'bg-yellow-100 text-yellow-800',
                      low: 'bg-green-100 text-green-800'
                    };
                    return (
                      <motion.button
                        key={caseItem.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          setSelectedCase(caseItem);
                          setLegalReview("");
                          setInternalNotes("");
                        }}
                        className={`w-full p-4 text-right border-b border-[#E5E8EB] hover:bg-[#F5F6F7] transition-all ${
                          selectedCase?.id === caseItem.id ? 'bg-gradient-to-r from-[#1C3D5A]/10 to-transparent border-r-4 border-r-[#1C3D5A]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-[#0F1E2E] truncate">{doc?.title || "מסמך"}</h4>
                              {caseItem.urgency && (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${urgencyColors[caseItem.urgency]}`}>
                                  {caseItem.urgency === 'high' ? 'דחוף' : caseItem.urgency === 'medium' ? 'בינוני' : 'רגיל'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#5A6B7D] mb-1 flex items-center gap-2">
                              <User className="w-3 h-3" />
                              {caseItem.client_name}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-[#8A9AAD]">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(doc?.created_date || caseItem.created_date).toLocaleDateString('he-IL')}
                              </span>
                              {caseItem.estimated_hours && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {caseItem.estimated_hours}ש
                                </span>
                              )}
                            </div>
                          </div>
                          {caseItem.status === "completed" && notificationStatuses[caseItem.id] && (
                            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
                              notificationStatuses[caseItem.id] === "opened"
                                ? 'bg-[#10B981]/10 text-[#10B981]'
                                : 'bg-[#2E6BDE]/10 text-[#2E6BDE]'
                            }`}>
                              {notificationStatuses[caseItem.id] === "opened" ? "✓ נפתח" : "נשלחה"}
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Case Details */}
          <div className="lg:col-span-2">
            {selectedCase ? (
              <div className="space-y-6">
                {/* Document & Client Info */}
                <div className="bg-white border border-[#E5E8EB] rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#1C3D5A]/10 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-[#1C3D5A]" />
                    </div>
                    <h3 className="font-semibold text-[#0F1E2E]">פרטי מסמך ולקוח</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-[#5A6B7D]">שם מסמך:</span>
                      <p className="font-medium text-[#0F1E2E]">{getDocumentById(selectedCase.document_id)?.title || "לא זמין"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-[#5A6B7D]">תאריך העלאה:</span>
                      <p className="font-medium text-[#0F1E2E]">
                        {new Date(getDocumentById(selectedCase.document_id)?.created_date || selectedCase.created_date).toLocaleDateString('he-IL')}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-[#5A6B7D]">{l.name}</span>
                      <p className="font-medium text-[#0F1E2E]">{selectedCase.client_name}</p>
                    </div>
                    <div>
                      <span className="text-sm text-[#5A6B7D]">{l.email}</span>
                      <p className="font-medium text-[#0F1E2E]">{selectedCase.client_email}</p>
                    </div>
                  </div>
                  {getDocumentById(selectedCase.document_id)?.file_url && (
                    <div className="mt-4 pt-4 border-t border-[#E5E8EB]">
                      <a 
                        href={getDocumentById(selectedCase.document_id).file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[#2E6BDE] hover:text-[#1D4ED8] text-sm font-medium"
                      >
                        <FileText className="w-4 h-4" />
                        הורד מסמך מקורי
                      </a>
                    </div>
                  )}
                </div>

                {/* Full AI Analysis */}
                {(() => {
                  const doc = getDocumentById(selectedCase.document_id);
                  if (!doc?.ai_analysis) return null;
                  
                  const analysis = doc.ai_analysis;
                  
                  return (
                    <div className="space-y-4">
                      {/* Summary */}
                      {analysis.summary && (
                        <div className="bg-white border border-[#E5E8EB] rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-[#2E6BDE] px-6 py-4">
                            <h3 className="font-semibold text-white">תקציר משפטי</h3>
                          </div>
                          <div className="p-6">
                            <p className="text-[#4A5568] leading-relaxed">{analysis.summary}</p>
                          </div>
                        </div>
                      )}

                      {/* Rights */}
                      {analysis.key_points?.length > 0 && (
                        <div className="bg-white border border-[#E5E8EB] rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-[#10B981] px-6 py-4">
                            <h3 className="font-semibold text-white">זכויות והטבות</h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-3">
                              {analysis.key_points.map((point, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 bg-[#E7F7ED] rounded-lg">
                                  <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                                  <span className="text-[#4A5568]">{point}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Obligations */}
                      {analysis.obligations?.length > 0 && (
                        <div className="bg-white border border-[#E5E8EB] rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-[#F59E0B] px-6 py-4">
                            <h3 className="font-semibold text-white">חובות והתחייבויות</h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-3">
                              {analysis.obligations.map((obligation, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 bg-[#FEF3E2] rounded-lg border-r-4 border-[#F59E0B]">
                                  <AlertCircle className="w-5 h-5 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                                  <span className="text-[#4A5568]">{obligation}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Risks */}
                      {analysis.risk_factors?.length > 0 && (
                        <div className="bg-white border border-[#E5E8EB] rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-[#D9534F] px-6 py-4">
                            <h3 className="font-semibold text-white">סיכונים משפטיים</h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-3">
                              {analysis.risk_factors.map((risk, i) => (
                                <li key={i} className="p-4 bg-[#FFE5E5] border border-[#D9534F]/20 rounded-lg">
                                  <p className="text-[#D9534F] font-medium">{risk}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Financial Terms */}
                      {analysis.financial_terms?.length > 0 && (
                        <div className="bg-white border border-[#E5E8EB] rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-[#10B981] px-6 py-4">
                            <h3 className="font-semibold text-white">כספים ותשלומים</h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-2">
                              {analysis.financial_terms.map((term, i) => (
                                <li key={i} className="flex items-start gap-2 p-3 bg-[#EBF2FE] rounded-lg">
                                  <span className="text-[#4A5568]">{term}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Important Dates */}
                      {analysis.important_dates?.length > 0 && (
                        <div className="bg-white border border-[#E5E8EB] rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-[#2E6BDE] px-6 py-4">
                            <h3 className="font-semibold text-white">תאריכים חשובים</h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-2">
                              {analysis.important_dates.map((date, i) => (
                                <li key={i} className="flex items-start gap-3 p-3 bg-[#EBF2FE] rounded-lg">
                                  <Clock className="w-5 h-5 text-[#2E6BDE] flex-shrink-0 mt-0.5" />
                                  <span className="text-[#4A5568]">{date}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Special Conditions */}
                      {analysis.special_conditions?.length > 0 && (
                        <div className="bg-white border border-[#E5E8EB] rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-[#1C3D5A] px-6 py-4">
                            <h3 className="font-semibold text-white">תנאים מיוחדים</h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-2">
                              {analysis.special_conditions.map((condition, i) => (
                                <li key={i} className="flex items-start gap-2 p-3 bg-[#F8F9FB] rounded-lg">
                                  <span className="text-[#4A5568]">{condition}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {analysis.recommendations?.length > 0 && (
                        <div className="bg-white border border-[#E5E8EB] rounded-xl overflow-hidden shadow-sm">
                          <div className="bg-[#10B981] px-6 py-4">
                            <h3 className="font-semibold text-white">המלצות</h3>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-3">
                              {analysis.recommendations.map((rec, i) => (
                                <li key={i} className="flex items-start gap-3">
                                  <Lightbulb className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                                  <span className="text-[#4A5568]">{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Opinion Form */}
                {selectedCase.status !== "completed" && (
                  <div className="bg-white border border-[#E5E8EB] rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1C3D5A] to-[#2E6BDE] px-6 py-4 flex items-center justify-between">
                      <h3 className="font-semibold text-white">חוות דעת משפטית</h3>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                      >
                        <FileText className="w-4 h-4 ml-2" />
                        תבניות
                      </Button>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Templates Dropdown */}
                      <AnimatePresence>
                        {showTemplates && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-[#EBF2FE] border border-[#2E6BDE]/20 rounded-lg p-4"
                          >
                            <p className="text-sm font-medium text-[#1C3D5A] mb-3">בחר תבנית:</p>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.keys(opinionTemplates).map((key) => (
                                <Button
                                  key={key}
                                  size="sm"
                                  variant="outline"
                                  onClick={useTemplate}
                                  className="text-xs justify-start"
                                >
                                  {key === 'employment_contract' ? 'חוזה עבודה' :
                                   key === 'rental_agreement' ? 'חוזה שכירות' :
                                   key === 'pay_slip' ? 'תלוש שכר' :
                                   'כללי'}
                                </Button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Internal Notes */}
                      <div>
                        <label className="text-sm font-medium text-[#5A6B7D] mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          הערות פנימיות (לא יישלחו ללקוח)
                        </label>
                        <Textarea
                          value={internalNotes}
                          onChange={(e) => setInternalNotes(e.target.value)}
                          placeholder="הערות לשימוש פנימי..."
                          className="min-h-20 border-[#E5E8EB] text-sm"
                        />
                      </div>

                      {/* Legal Opinion */}
                      <div>
                        <label className="text-sm font-medium text-[#5A6B7D] mb-2 block">
                          חוות דעת (תישלח ללקוח)
                        </label>
                        <Textarea
                          value={legalReview}
                          onChange={(e) => setLegalReview(e.target.value)}
                          placeholder={l.opinionPlaceholder}
                          className="min-h-48 border-[#E5E8EB] focus:ring-[#1C3D5A]"
                        />
                        <p className="text-xs text-[#9CA3AF] mt-2">
                          {legalReview.length} תווים
                        </p>
                      </div>

                      {/* File Attachments */}
                      <div>
                        <label className="text-sm font-medium text-[#5A6B7D] mb-2 flex items-center gap-2">
                          <Paperclip className="w-4 h-4" />
                          קבצים נוספים (חוות דעת, מסמכים משלימים)
                        </label>
                        <div className="border-2 border-dashed border-[#E5E8EB] rounded-lg p-4">
                          <input
                            type="file"
                            id="fileUpload"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              setUploadingFile(true);
                              try {
                                const { file_url } = await base44.integrations.Core.UploadFile({ file });
                                
                                const existingAttachments = selectedCase.attachments || [];
                                await LawyerCase.update(selectedCase.id, {
                                  attachments: [
                                    ...existingAttachments,
                                    {
                                      file_url,
                                      file_name: file.name,
                                      uploaded_date: new Date().toISOString()
                                    }
                                  ]
                                });

                                // Reload data
                                await checkAccessAndLoadData();
                                const updatedCase = cases.find(c => c.id === selectedCase.id);
                                setSelectedCase(updatedCase);
                              } catch (error) {
                                console.error("Error uploading file:", error);
                                alert("שגיאה בהעלאת הקובץ");
                              }
                              setUploadingFile(false);
                            }}
                          />
                          <label
                            htmlFor="fileUpload"
                            className="flex flex-col items-center gap-2 cursor-pointer"
                          >
                            {uploadingFile ? (
                              <Loader2 className="w-8 h-8 text-[#2E6BDE] animate-spin" />
                            ) : (
                              <>
                                <Upload className="w-8 h-8 text-[#9CA3AF]" />
                                <span className="text-sm text-[#5A6B7D]">לחץ להעלאת קובץ</span>
                              </>
                            )}
                          </label>
                        </div>

                        {/* Display existing attachments */}
                        {selectedCase.attachments?.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {selectedCase.attachments.map((attachment, i) => (
                              <div key={i} className="flex items-center justify-between p-2 bg-[#F8F9FB] rounded-lg border border-[#E5E8EB]">
                                <div className="flex items-center gap-2">
                                  <Paperclip className="w-4 h-4 text-[#5A6B7D]" />
                                  <span className="text-sm text-[#0F1E2E]">{attachment.file_name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={attachment.file_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#2E6BDE] hover:underline"
                                  >
                                    הורד
                                  </a>
                                  <button
                                    onClick={async () => {
                                      if (confirm("למחוק קובץ זה?")) {
                                        const updatedAttachments = selectedCase.attachments.filter((_, idx) => idx !== i);
                                        await LawyerCase.update(selectedCase.id, { attachments: updatedAttachments });
                                        await checkAccessAndLoadData();
                                        const updatedCase = cases.find(c => c.id === selectedCase.id);
                                        setSelectedCase(updatedCase);
                                      }
                                    }}
                                    className="text-xs text-[#EF4444] hover:underline"
                                  >
                                    מחק
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Button
                          onClick={submitReview}
                          disabled={isSubmitting || !legalReview.trim()}
                          className="flex-1 bg-gradient-to-r from-[#1C3D5A] to-[#2E6BDE] hover:from-[#0F1E2E] hover:to-[#1D4ED8] text-white h-11"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                              שולח...
                            </>
                          ) : (
                            <>
                              <Send className="w-4 h-4 ml-2" />
                              שלח חוות דעת
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          className="border-[#E5E8EB]"
                          onClick={async () => {
                            if (internalNotes.trim()) {
                              await LawyerCase.update(selectedCase.id, {
                                lawyer_notes: internalNotes
                              });
                              alert("הערות נשמרו");
                            }
                          }}
                        >
                          <Download className="w-4 h-4 ml-2" />
                          שמור
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Completed Case Info */}
                {selectedCase.status === "completed" && (
                  <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-xl p-6 text-white shadow-lg">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle className="w-8 h-8" />
                      <div>
                        <h3 className="font-bold text-lg">תיק הושלם</h3>
                        <p className="text-white/80 text-sm">חוות הדעת נשלחה ללקוח</p>
                      </div>
                    </div>
                    {(() => {
                      const doc = getDocumentById(selectedCase.document_id);
                      return doc?.lawyer_review && (
                        <div className="bg-white/20 rounded-lg p-4 mt-4">
                          <p className="text-sm font-medium mb-2">חוות הדעת שנשלחה:</p>
                          <p className="text-sm whitespace-pre-wrap">{doc.lawyer_review.review_summary}</p>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white border border-[#E5E8EB] rounded-xl p-12 text-center shadow-sm">
                <FileText className="w-12 h-12 mx-auto mb-4 text-[#D9DDE1]" />
                <p className="text-[#5A6B7D]">{l.selectCase}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}