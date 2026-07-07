import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import DocumentFilters from "@/components/dashboard/DocumentFilters";
import DashboardCharts from "@/components/dashboard/DashboardCharts";
import CustomAlerts from "@/components/dashboard/CustomAlerts";
import FolderManager from "@/components/dashboard/FolderManager";
import DocumentCard from "@/components/dashboard/DocumentCard";
import { 
  Upload, 
  FileText, 
  User as UserIcon,
  Send,
  Crown,
  CheckCircle,
  TrendingUp,
  Users,
  Zap,
  ArrowLeft,
  Eye,
  Clock,
  AlertCircle,
  Download,
  Plus,
  Sparkles,
  Shield,
  BarChart3
} from "lucide-react";

const Document = base44.entities.Document;
const Folder = base44.entities.Folder;

export default function DashboardHomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [planData, setPlanData] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    status: "",
    sort: "-created_date",
    favorites: false,
    tag: "",
    contentSearch: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const folderId = params.get('folder');
    if (folderId) {
      setSelectedFolder(folderId);
    } else {
      setSelectedFolder(null);
    }
  }, [window.location.search]);

  // Scroll to recently viewed section when requested
  useEffect(() => {
    if (isLoading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('show') === 'recent') {
      setTimeout(() => {
        document.querySelector('[data-section="recent-viewed"]')?.scrollIntoView({ behavior: 'smooth' });
      }, 0);
    }
  }, [isLoading, documents.length]);

  const loadData = async () => {
    try {
      const authUser = await base44.auth.me();
      
      if (!authUser) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }

      const { getCurrentUser } = await import("@/components/userSync");
      const currentUser = await getCurrentUser(true); // Force refresh
      
      if (!currentUser) {
        base44.auth.redirectToLogin(window.location.pathname);
        return;
      }

      console.log("Dashboard loaded user:", currentUser.plan, "scans:", currentUser.scansUsed);
      
      setUser(currentUser);

      const plan = currentUser.plan || "free";
      const scansUsed = currentUser.scansUsed || 0;

      let planInfo = {};
      if (plan === "free") {
        planInfo = { name: "חינמי", scansLimit: 1, displayScans: `${Math.max(0, 1 - scansUsed)}/1`, storageLimit: 3 };
      } else if (plan === "beginner") {
        planInfo = { name: "Beginner", scansLimit: 10, displayScans: `${Math.max(0, 10 - scansUsed)}/10`, storageLimit: Infinity };
      } else if (plan === "pro") {
        planInfo = { name: "Pro", scansLimit: 30, displayScans: `${Math.max(0, 30 - scansUsed)}/30`, storageLimit: Infinity };
      } else if (plan === "business") {
        planInfo = { name: "Business", scansLimit: 100, displayScans: `${Math.max(0, 100 - scansUsed)}/100`, storageLimit: Infinity };
      }

      const userId = authUser.id || authUser.user_id;
      const userDocs = await Document.list("-created_date", 100);
      setDocuments(userDocs || []);

      const userFolders = await Folder.list("name", 100);
      setFolders(userFolders || []);

      setPlanData({ ...planInfo, scansUsed, storageUsed: userDocs?.length || 0 });

    } catch (error) {
      console.error("Error loading data:", error);
      base44.auth.redirectToLogin(window.location.pathname);
    }
    setIsLoading(false);
  };

  const filteredDocuments = useMemo(() => {
    let filtered = [...documents];
    
    if (selectedFolder !== null) {
      filtered = filtered.filter(doc => doc.folderId === selectedFolder);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.contentSearch) {
      const contentLower = filters.contentSearch.toLowerCase();
      filtered = filtered.filter(doc => {
        const analysis = doc.analysisResult || doc.ai_analysis || {};
        const fields = [
          analysis.executive_summary,
          analysis.summary,
          ...(analysis.key_points || []),
          ...(analysis.risk_factors || []),
          ...(analysis.recommendations || []),
          ...(analysis.obligations || []),
          ...(analysis.financial_terms || []),
          ...(analysis.special_conditions || []),
          ...(analysis.inconsistencies?.map(i => `${i.type} ${i.description}`) || []),
          ...(analysis.legal_terms?.map(t => `${t.term} ${t.explanation}`) || [])
        ];
        const extra = [
          doc.extractedText || '',
          doc.title || '',
          (doc.tags || []).join(' ')
        ];
        const searchableContent = [...fields, ...extra]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchableContent.includes(contentLower);
      });
    }
    
    if (filters.favorites) {
      filtered = filtered.filter(doc => doc.isFavorite === true);
    }
    
    if (filters.tag) {
      const tagLower = filters.tag.toLowerCase();
      filtered = filtered.filter(doc => 
        (doc.tags || []).some(tag => tag.toLowerCase().includes(tagLower))
      );
    }
    
    if (filters.type) {
      filtered = filtered.filter(doc => doc.document_type === filters.type);
    }
    
    if (filters.status) {
      filtered = filtered.filter(doc => doc.status === filters.status);
    }
    
    filtered.sort((a, b) => {
      const sortField = filters.sort.replace('-', '');
      const isDesc = filters.sort.startsWith('-');
      
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (sortField === 'created_date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      if (isDesc) {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
    
    return filtered;
  }, [documents, filters, selectedFolder]);

  const handleClearFilters = () => {
    setFilters({
      search: "",
      type: "",
      status: "",
      sort: "-created_date",
      favorites: false,
      tag: "",
      contentSearch: ""
    });
  };

  const handleDocumentChange = async (updatedDoc) => {
    setDocuments(prev => prev.map(doc => doc.id === updatedDoc.id ? updatedDoc : doc));
    try {
      // Reload user data to refresh scans count
      const { getCurrentUser } = await import("@/components/userSync");
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        const plan = currentUser.plan || "free";
        const scansUsed = currentUser.scansUsed || 0;
        
        let planInfo = {};
        if (plan === "free") {
          planInfo = { name: "חינמי", scansLimit: 1, displayScans: `${Math.max(0, 1 - scansUsed)}/1`, storageLimit: 3 };
        } else if (plan === "beginner") {
          planInfo = { name: "Beginner", scansLimit: 10, displayScans: `${Math.max(0, 10 - scansUsed)}/10`, storageLimit: Infinity };
        } else if (plan === "pro") {
          planInfo = { name: "Pro", scansLimit: 30, displayScans: `${Math.max(0, 30 - scansUsed)}/30`, storageLimit: Infinity };
        } else if (plan === "business") {
          planInfo = { name: "Business", scansLimit: 100, displayScans: `${Math.max(0, 100 - scansUsed)}/100`, storageLimit: Infinity };
        }
        setPlanData({ ...planInfo, scansUsed, storageUsed: documents.length });
      }
      
      const userDocs = await Document.list("-created_date", 100);
      setDocuments(userDocs || []);
    } catch (error) {
      console.error("Error reloading documents:", error);
    }
  };

  const handleDocumentDelete = (docId) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
  };

  const handleFoldersChange = async (newFolders) => {
    setFolders(newFolders);
    const userFolders = await Folder.list("name", 100);
    setFolders(userFolders || []);
  };

  const getStatusConfig = (status) => {
    const configs = {
      uploaded: { label: "הועלה", color: "text-[#9CA3AF]", bg: "bg-[#F3F4F6]", icon: Clock },
      analyzing: { label: "מנתח", color: "text-[#F59E0B]", bg: "bg-[#FEF3E2]", icon: Clock },
      analyzed: { label: "הסתיים", color: "text-[#10B981]", bg: "bg-[#E7F7ED]", icon: CheckCircle },
      lawyer_requested: { label: "נשלח לעו\"ד", color: "text-[#2E6BDE]", bg: "bg-[#EBF2FE]", icon: AlertCircle },
      completed: { label: "הושלם", color: "text-[#10B981]", bg: "bg-[#E7F7ED]", icon: CheckCircle }
    };
    return configs[status] || configs.uploaded;
  };

  const recentDocuments = useMemo(() => {
    return [...documents].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 3);
  }, [documents]);
  const favoriteDocuments = useMemo(() => documents.filter(d => d.isFavorite === true), [documents]);
  const recentViewedDocs = useMemo(() => {
    try {
      const arr = JSON.parse(localStorage.getItem('recently_viewed_docs') || '[]');
      const byId = Object.fromEntries(documents.map(d => [d.id, d]));
      return arr.map(e => byId[e.id]).filter(Boolean);
    } catch {
      return [];
    }
  }, [documents]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#1E63F0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const plan = user?.plan || "free";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Hero Section - 2 columns layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
          
          {/* Welcome Card */}
          <div className="lg:col-span-2">
            {plan === "free" && (
              <div className="relative bg-gradient-to-br from-white via-white to-[#F8F9FB] border-2 border-[#E3E6EB] rounded-3xl p-8 h-full shadow-xl hover:shadow-2xl transition-all overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#1E63F0]/10 to-[#0099A8]/10 rounded-full -mr-16 -mt-16"></div>
                <div className="relative flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#1E63F0] to-[#0099A8] rounded-2xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-[#0A2A43]">שלום, {user?.name || 'משתמש'}!</h1>
                      <p className="text-[#4A5568] text-sm">ברוכים הבאים ל-Decifra.ai</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#FEF3E2] to-[#FEE8C8] rounded-2xl p-5 border border-[#F59E0B]/20 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-[#92400E] text-xs font-medium mb-1">חבילה חינמית</p>
                        <p className="text-xs text-[#92400E]/70">סריקות שנותרו</p>
                      </div>
                      <div className="text-4xl font-bold text-[#F59E0B]">{planData?.displayScans}</div>
                    </div>
                  </div>

                  <Link to={createPageUrl("Upgrade")} className="w-full">
                    <Button className="w-full bg-gradient-to-r from-[#1E63F0] to-[#0099A8] hover:from-[#0A2A43] hover:to-[#1E63F0] text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all">
                      <Crown className="w-5 h-5 ml-2" />
                      שדרגו לחבילה מתקדמת
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {plan === "pro" && (
              <div className="relative bg-gradient-to-br from-[#1E63F0] via-[#2E6BDE] to-[#1D4ED8] rounded-3xl p-8 h-full shadow-2xl text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                <div className="relative flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">שלום, {user?.name || 'משתמש'}!</h1>
                      <p className="text-white/90 text-sm flex items-center gap-1.5">
                        <Zap className="w-4 h-4" />
                        חבילת Pro מופעלת
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-white font-medium mb-1">סריקות החודש</p>
                        <p className="text-xs text-white/70">נותרו לשימוש</p>
                      </div>
                      <div className="text-4xl font-bold text-white">{planData?.displayScans?.split('/')[0]}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle className="w-4 h-4" />
                    <span>גישה מלאה לכל התכונות המתקדמות</span>
                  </div>
                </div>
              </div>
            )}

            {plan === "business" && (
              <div className="relative bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] rounded-3xl p-8 h-full shadow-2xl text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
                <div className="relative flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold">שלום, {user?.name || 'משתמש'}!</h1>
                      <p className="text-white/90 text-sm">חבילת Business מופעלת</p>
                    </div>
                  </div>
                  
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-5 border border-white/30 shadow-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-white font-medium mb-1">סריקות ללא הגבלה</p>
                        <p className="text-xs text-white/70">שימוש חופשי</p>
                      </div>
                      <div className="text-4xl font-bold text-white">∞</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-white/90">
                    <CheckCircle className="w-4 h-4" />
                    <span>כל התכונות + שיתוף צוות מתקדם</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Upload Action Card */}
          <div className="lg:col-span-3">
            <Link to={createPageUrl("Upload")}>
              <div className="relative bg-gradient-to-br from-[#1E63F0] via-[#0099A8] to-[#00C9C9] rounded-3xl p-8 sm:p-10 h-full min-h-[300px] shadow-2xl hover:shadow-3xl transition-all group cursor-pointer overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20 group-hover:scale-150 transition-transform duration-500"></div>
                
                <div className="relative h-full flex flex-col items-center justify-center text-center gap-6">
                  <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Upload className="w-12 h-12 text-white" />
                  </div>
                  
                  <div className="space-y-3">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white">העלאת מסמך חדש</h2>
                    <p className="text-white/90 text-lg max-w-xl mx-auto leading-relaxed">
                      גררו קובץ או לחצו כדי להתחיל ניתוח AI חכם של המסמך שלכם
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-white/90 text-sm">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Clock className="w-4 h-4" />
                      <span>ניתוח מהיר</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Shield className="w-4 h-4" />
                      <span>מאובטח לחלוטין</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                      <Sparkles className="w-4 h-4" />
                      <span>AI מתקדם</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        {planData && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
            <div className="bg-white border border-[#E3E6EB] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#4A5568] text-sm mb-2 font-medium">מסמכים נותחו</p>
                  <p className="text-4xl font-bold text-[#0A2A43]">{documents.length}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">סה"כ במערכת</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#EBF2FE] to-[#D6E9FE] rounded-2xl flex items-center justify-center shadow-md">
                  <FileText className="w-8 h-8 text-[#1E63F0]" />
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-[#E3E6EB] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#4A5568] text-sm mb-2 font-medium">סריקות שנותרו</p>
                  <p className="text-4xl font-bold text-[#0A2A43]">{planData.displayScans}</p>
                  <p className="text-xs text-[#9CA3AF] mt-1">החודש</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#FEF3E2] to-[#FEE8C8] rounded-2xl flex items-center justify-center shadow-md">
                  <BarChart3 className="w-8 h-8 text-[#F59E0B]" />
                </div>
              </div>
            </div>
            
            <div className="bg-white border border-[#E3E6EB] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#4A5568] text-sm mb-2 font-medium">אחסון</p>
                  <p className="text-4xl font-bold text-[#0A2A43]">
                    {planData.storageLimit === Infinity ? '∞' : `${documents.length}/${planData.storageLimit}`}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-1">מסמכים</p>
                </div>
                <div className="w-16 h-16 bg-gradient-to-br from-[#E7F7ED] to-[#D1F2E0] rounded-2xl flex items-center justify-center shadow-md">
                  <Shield className="w-8 h-8 text-[#0099A8]" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Folders - Pro & Business only */}
        {(plan === "pro" || plan === "business") && (
          <FolderManager 
            folders={folders}
            selectedFolder={selectedFolder}
            onFolderSelect={setSelectedFolder}
            onFoldersChange={handleFoldersChange}
          />
        )}

        {/* Recent Documents Section */}
        {recentDocuments.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-2xl p-6 sm:p-8 shadow-lg mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0A2A43]">מסמכים אחרונים</h2>
              <button onClick={() => window.scrollTo({ top: document.querySelector('[data-section="documents"]')?.offsetTop || 0, behavior: 'smooth' })}>
                <Button variant="outline" size="sm" className="border-[#E3E6EB] hover:border-[#1E63F0] hover:bg-[#EBF2FE]">
                  <Eye className="w-4 h-4 ml-2" />
                  צפה בכל המסמכים
                </Button>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentDocuments.map((doc) => {
                const statusConfig = getStatusConfig(doc.status);
                const StatusIcon = statusConfig.icon;
                return (
                  <Link key={doc.id} to={createPageUrl("Analysis") + `?id=${doc.id}`}>
                    <div className="border-2 border-[#E3E6EB] rounded-xl p-5 hover:border-[#1E63F0] hover:shadow-lg transition-all cursor-pointer bg-gradient-to-br from-white to-[#F8F9FB]">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#EBF2FE] rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-[#1E63F0]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-[#0A2A43] text-sm mb-1 truncate">{doc.title}</h3>
                          <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusConfig.label}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-[#9CA3AF]">{new Date(doc.created_date).toLocaleDateString('he-IL')}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Recently Viewed Section */}
        {recentViewedDocs.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-2xl p-6 sm:p-8 shadow-lg mb-10" data-section="recent-viewed">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-[#0A2A43]">נצפו לאחרונה</h2>
            </div>
            <div>
              {recentViewedDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  folders={folders}
                  onDocumentChange={handleDocumentChange}
                  onDocumentDelete={handleDocumentDelete}
                  getStatusConfig={getStatusConfig}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div onClick={() => window.scrollTo({ top: document.querySelector('[data-section="documents"]')?.offsetTop || 0, behavior: 'smooth' })}>
            <div className="bg-white border-2 border-[#E3E6EB] rounded-2xl p-6 hover:border-[#1E63F0] hover:shadow-lg transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#EBF2FE] to-[#D6E9FE] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6 text-[#1E63F0]" />
              </div>
              <h3 className="font-bold text-[#0A2A43] mb-1">המסמכים שלי</h3>
              <p className="text-sm text-[#4A5568]">ניהול כל המסמכים</p>
            </div>
          </div>
          
          <Link to={createPageUrl("Profile")}>
            <div className="bg-white border-2 border-[#E3E6EB] rounded-2xl p-6 hover:border-[#1E63F0] hover:shadow-lg transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#FEF3E2] to-[#FEE8C8] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <UserIcon className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <h3 className="font-bold text-[#0A2A43] mb-1">הפרופיל שלי</h3>
              <p className="text-sm text-[#4A5568]">הגדרות משתמש</p>
            </div>
          </Link>

          <Link to={createPageUrl("Upload")}>
            <div className="bg-white border-2 border-[#E3E6EB] rounded-2xl p-6 hover:border-[#1E63F0] hover:shadow-lg transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-[#E7F7ED] to-[#D1F2E0] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Send className="w-6 h-6 text-[#0099A8]" />
              </div>
              <h3 className="font-bold text-[#0A2A43] mb-1">העלאת מסמך</h3>
              <p className="text-sm text-[#4A5568]">מסמך חדש</p>
            </div>
          </Link>

          <Link to={createPageUrl("Upgrade")}>
            <div className="bg-gradient-to-br from-[#1E63F0] to-[#0099A8] rounded-2xl p-6 hover:shadow-xl transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-white mb-1">שדרוג חבילה</h3>
              <p className="text-sm text-white/90">קבלו יותר תכונות</p>
            </div>
          </Link>
        </div>

        {/* All Documents Table */}
        {documents.length > 0 && (
          <>


            {/* Document Filters - Available for all plans */}
            <DocumentFilters 
              filters={filters}
              onFilterChange={setFilters}
              onClearFilters={handleClearFilters}
              userPlan={plan}
            />

            <div data-section="documents" className="bg-white border border-[#E3E6EB] rounded-2xl overflow-hidden shadow-lg mb-10">
              <div className="px-6 py-5 border-b border-[#E3E6EB] bg-gradient-to-r from-[#F8F9FB] to-white">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <h2 className="text-xl font-bold text-[#0A2A43]">
                    {selectedFolder === null ? "כל המסמכים" : folders.find(f => f.id === selectedFolder)?.name || "תיקייה"}
                    {selectedFolder !== null && (
                      <span className="text-sm text-[#9CA3AF] font-normal mr-2">
                        ({filteredDocuments.length})
                      </span>
                    )}
                  </h2>
                  <Link to={createPageUrl("Upload")} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-gradient-to-r from-[#1E63F0] to-[#0099A8] hover:from-[#0A2A43] hover:to-[#1E63F0] text-white font-semibold shadow-md">
                      <Plus className="w-4 h-4 ml-2" />
                      העלה מסמך
                    </Button>
                  </Link>
                </div>
              </div>

              {filteredDocuments.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#EBF2FE] to-[#D6E9FE] rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-[#1E63F0]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0A2A43] mb-3">לא נמצאו מסמכים</h3>
                  <p className="text-[#4A5568] mb-6">נסו לשנות את הסינונים או להעלות מסמך חדש</p>
                  <div className="flex gap-3 justify-center">
                    {documents.length > 0 && (
                      <Button onClick={handleClearFilters} variant="outline">
                        נקה סינונים
                      </Button>
                    )}
                    <Link to={createPageUrl("Upload")}>
                      <Button className="bg-gradient-to-r from-[#1E63F0] to-[#0099A8] text-white">
                        <Upload className="w-4 h-4 ml-2" />
                        העלה מסמך
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  {filteredDocuments.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      folders={folders}
                      onDocumentChange={handleDocumentChange}
                      onDocumentDelete={handleDocumentDelete}
                      getStatusConfig={getStatusConfig}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {documents.length === 0 && (
          <div className="bg-white border-2 border-dashed border-[#E3E6EB] rounded-3xl p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#EBF2FE] to-[#D6E9FE] rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="w-12 h-12 text-[#1E63F0]" />
            </div>
            <h3 className="text-2xl font-bold text-[#0A2A43] mb-3">התחל את המסע שלך</h3>
            <p className="text-[#4A5568] text-lg mb-8 max-w-md mx-auto">
              העלה את המסמך הראשון שלך וקבל ניתוח AI מקיף ומפורט בתוך שניות
            </p>
            <Link to={createPageUrl("Upload")}>
              <Button size="lg" className="bg-gradient-to-r from-[#1E63F0] to-[#0099A8] hover:from-[#0A2A43] hover:to-[#1E63F0] text-white font-bold px-8 py-6 text-lg shadow-xl">
                <Upload className="w-6 h-6 ml-2" />
                העלה מסמך ראשון
              </Button>
            </Link>
          </div>
        )}

        {/* Advanced Statistics Section */}
        {documents.length > 0 && (
          <div className="bg-white border border-[#E3E6EB] rounded-2xl p-8 shadow-lg mb-10">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-[#0A2A43] mb-2">סטטיסטיקות מתקדמות</h2>
                <p className="text-[#4A5568]">תובנות ומדדים מפורטים על השימוש במערכת</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-[#EBF2FE] to-[#D6E9FE] rounded-2xl flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-[#1E63F0]" />
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Documents */}
              <div className="relative bg-gradient-to-br from-[#EBF2FE] to-white rounded-2xl p-6 border border-[#D6E9FE] overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#1E63F0]/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <FileText className="w-8 h-8 text-[#1E63F0]" />
                    <span className="text-xs font-medium text-[#1E63F0] bg-white/80 px-2 py-1 rounded-full">סה"כ</span>
                  </div>
                  <p className="text-sm text-[#4A5568] mb-1">מסמכים במערכת</p>
                  <p className="text-3xl font-bold text-[#0A2A43]">{documents.length}</p>
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    {documents.filter(d => new Date(d.created_date) > new Date(Date.now() - 30*24*60*60*1000)).length} מסמכים בחודש האחרון
                  </p>
                </div>
              </div>

              {/* Analyzed Docs */}
              <div className="relative bg-gradient-to-br from-[#E7F7ED] to-white rounded-2xl p-6 border border-[#D1F2E0] overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#0099A8]/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle className="w-8 h-8 text-[#0099A8]" />
                    <span className="text-xs font-medium text-[#0099A8] bg-white/80 px-2 py-1 rounded-full">מנותחים</span>
                  </div>
                  <p className="text-sm text-[#4A5568] mb-1">ניתוחים הושלמו</p>
                  <p className="text-3xl font-bold text-[#0A2A43]">
                    {documents.filter(d => d.status === 'analyzed' || d.status === 'completed').length}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    {Math.round((documents.filter(d => d.status === 'analyzed' || d.status === 'completed').length / documents.length) * 100)}% אחוז השלמה
                  </p>
                </div>
              </div>

              {/* Time Saved */}
              <div className="relative bg-gradient-to-br from-[#FEF3E2] to-white rounded-2xl p-6 border border-[#FEE8C8] overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#F59E0B]/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Clock className="w-8 h-8 text-[#F59E0B]" />
                    <span className="text-xs font-medium text-[#F59E0B] bg-white/80 px-2 py-1 rounded-full">זמן</span>
                  </div>
                  <p className="text-sm text-[#4A5568] mb-1">זמן שחסכת</p>
                  <p className="text-3xl font-bold text-[#0A2A43]">
                    {Math.round(documents.length * 2.5)}
                    <span className="text-lg font-normal text-[#4A5568] mr-1">שעות</span>
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    ממוצע 2.5 שעות לניתוח מסמך
                  </p>
                </div>
              </div>

              {/* Risk Alerts */}
              <div className="relative bg-gradient-to-br from-[#FEE2E2] to-white rounded-2xl p-6 border border-[#FECACA] overflow-hidden group hover:shadow-xl transition-all">
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#EF4444]/5 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <AlertCircle className="w-8 h-8 text-[#EF4444]" />
                    <span className="text-xs font-medium text-[#EF4444] bg-white/80 px-2 py-1 rounded-full">סיכונים</span>
                  </div>
                  <p className="text-sm text-[#4A5568] mb-1">התראות סיכון</p>
                  <p className="text-3xl font-bold text-[#0A2A43]">
                    {documents.filter(d => d.ai_analysis?.risk_factors && d.ai_analysis.risk_factors.length > 0).length}
                  </p>
                  <p className="text-xs text-[#9CA3AF] mt-2">
                    דורשים תשומת לב
                  </p>
                </div>
              </div>
            </div>

            {/* Document Type Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-[#F8F9FB] to-white rounded-2xl p-6 border border-[#E3E6EB]">
                <h3 className="text-lg font-bold text-[#0A2A43] mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#1E63F0]" />
                  התפלגות לפי סוג מסמך
                </h3>
                <div className="space-y-3">
                  {Object.entries(
                    documents.reduce((acc, doc) => {
                      acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
                      return acc;
                    }, {})
                  ).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                    const percentage = Math.round((count / documents.length) * 100);
                    const typeLabels = {
                      employment_contract: 'חוזה עבודה',
                      rental_agreement: 'חוזה שכירות',
                      pay_slip: 'תלוש שכר',
                      insurance_policy: 'פוליסת ביטוח',
                      loan_agreement: 'הסכם הלוואה',
                      purchase_agreement: 'הסכם רכישה',
                      other: 'אחר'
                    };
                    return (
                      <div key={type}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#0A2A43]">{typeLabels[type] || type}</span>
                          <span className="text-sm text-[#4A5568]">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-[#E3E6EB] rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-[#1E63F0] to-[#0099A8] h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gradient-to-br from-[#F8F9FB] to-white rounded-2xl p-6 border border-[#E3E6EB]">
                <h3 className="text-lg font-bold text-[#0A2A43] mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#0099A8]" />
                  סטטוס מסמכים
                </h3>
                <div className="space-y-3">
                  {[
                    { status: 'analyzed', label: 'מנותח', color: 'from-[#10B981] to-[#059669]' },
                    { status: 'analyzing', label: 'בניתוח', color: 'from-[#F59E0B] to-[#D97706]' },
                    { status: 'uploaded', label: 'הועלה', color: 'from-[#9CA3AF] to-[#6B7280]' },
                    { status: 'lawyer_requested', label: 'נשלח לעו"ד', color: 'from-[#2E6BDE] to-[#1D4ED8]' }
                  ].map(({ status, label, color }) => {
                    const count = documents.filter(d => d.status === status).length;
                    const percentage = Math.round((count / documents.length) * 100);
                    return (
                      <div key={status}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-[#0A2A43]">{label}</span>
                          <span className="text-sm text-[#4A5568]">{count} ({percentage}%)</span>
                        </div>
                        <div className="w-full bg-[#E3E6EB] rounded-full h-2 overflow-hidden">
                          <div 
                            className={`bg-gradient-to-r ${color} h-full rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="bg-gradient-to-br from-[#F8F9FB] to-white rounded-2xl p-6 border border-[#E3E6EB]">
              <h3 className="text-lg font-bold text-[#0A2A43] mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#1E63F0]" />
                פעילות לאורך זמן
              </h3>
              <div className="flex items-end justify-between gap-2 h-32">
                {Array.from({ length: 7 }, (_, i) => {
                  const date = new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000);
                  const count = documents.filter(d => {
                    const docDate = new Date(d.created_date);
                    return docDate.toDateString() === date.toDateString();
                  }).length;
                  const maxCount = Math.max(...Array.from({ length: 7 }, (_, j) => {
                    const d = new Date(Date.now() - (6 - j) * 24 * 60 * 60 * 1000);
                    return documents.filter(doc => new Date(doc.created_date).toDateString() === d.toDateString()).length;
                  }), 1);
                  const height = Math.max((count / maxCount) * 100, count > 0 ? 10 : 0);

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="text-xs text-[#9CA3AF] font-medium">{count}</div>
                      <div 
                        className="w-full bg-gradient-to-t from-[#1E63F0] to-[#0099A8] rounded-t-lg transition-all duration-500 hover:opacity-80"
                        style={{ height: `${height}%` }}
                      />
                      <div className="text-xs text-[#4A5568]">
                        {date.toLocaleDateString('he-IL', { weekday: 'short' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Charts and Analytics */}
        {documents.length > 0 && (
          <DashboardCharts documents={documents} />
        )}

        {/* Upgrade Prompt for Free Users */}
        {documents.length > 0 && plan === "free" && (
          <div className="bg-gradient-to-br from-[#1E63F0] via-[#2E6BDE] to-[#0099A8] rounded-3xl p-8 text-center shadow-2xl">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">רוצים גרפים וסטטיסטיקות מתקדמות?</h2>
            <p className="text-white/90 text-lg mb-6 max-w-2xl mx-auto">
              שדרגו לחבילת Beginner או גבוהה יותר לקבל גישה לניתוחים גרפיים מתקדמים
            </p>
            <Link to={createPageUrl("Upgrade")}>
              <Button size="lg" className="bg-white text-[#1E63F0] hover:bg-white/90 font-bold px-8 py-6 text-lg shadow-xl">
                <Sparkles className="w-6 h-6 ml-2" />
                שדרגו עכשיו
              </Button>
            </Link>
          </div>
        )}


      </div>
    </div>
  );
}