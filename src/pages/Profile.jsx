import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  User as UserIcon, 
  Settings, 
  Crown,
  CheckCircle,
  BarChart3,
  Loader2,
  FileText,
  Clock,
  TrendingUp,
  Award,
  Zap,
  Calendar,
  Activity
} from "lucide-react";

export default function ProfilePage() {
  const { language, isRTL } = useTheme();
  
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState(null);

  const labels = {
    he: {
      title: "הפרופיל שלי",
      subtitle: "נהלו את החשבון ומנוי הפרימיום",
      personalDetails: "פרטים אישיים",
      fullName: "שם מלא",
      email: "אימייל",
      notSpecified: "לא צוין",
      edit: "עריכה",
      cancel: "ביטול",
      saveChanges: "שמור שינויים",
      saving: "שומר...",
      accountSettings: "הגדרות חשבון",
      emailNotifications: "התראות אימייל",
      emailNotificationsDesc: "קבלו עדכונים על ניתוח מסמכים",
      enabled: "מופעל",
      premiumSubscription: "מנוי פרימיום",
      freeUser: "משתמש בסיסי",
      upgradePremiumDesc: "שדרגו לפרימיום לגישה לעורכי דין מקצועיים",
      unlimitedAI: "ניתוח AI בלתי מוגבל",
      lawyerOpinions: "חוות דעת עורכי דין",
      prioritySupport: "תמיכה עדיפה",
      upgradeToPremium: "שדרגו לפרימיום",
      statistics: "סטטיסטיקות",
      documentsAnalyzed: "מסמכים נותחו:",
      opinionsReceived: "חוות דעת התקבלו:",
      timeSaved: "זמן חיסכון:",
      hours: "שעות",
      loading: "טוען פרופיל..."
    },
    en: {
      title: "My Profile",
      subtitle: "Manage your account and premium subscription",
      personalDetails: "Personal Details",
      fullName: "Full Name",
      email: "Email",
      notSpecified: "Not specified",
      edit: "Edit",
      cancel: "Cancel",
      saveChanges: "Save Changes",
      saving: "Saving...",
      accountSettings: "Account Settings",
      emailNotifications: "Email Notifications",
      emailNotificationsDesc: "Receive updates about document analysis",
      enabled: "Enabled",
      premiumSubscription: "Premium Subscription",
      freeUser: "Basic User",
      upgradePremiumDesc: "Upgrade to Premium for access to professional lawyers",
      unlimitedAI: "Unlimited AI Analysis",
      lawyerOpinions: "Lawyer Opinions",
      prioritySupport: "Priority Support",
      upgradeToPremium: "Upgrade to Premium",
      statistics: "Statistics",
      documentsAnalyzed: "Documents Analyzed:",
      opinionsReceived: "Opinions Received:",
      timeSaved: "Time Saved:",
      hours: "hours",
      loading: "Loading profile..."
    }
  };

  const l = labels[language] || labels.he;

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { getCurrentUser } = await import("@/components/userSync");
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setEditedUser(currentUser);

      // Load documents for statistics
      const userDocs = await base44.entities.Document.list("-created_date", 100);
      setDocuments(userDocs || []);

      // Calculate statistics
      const analyzedDocs = userDocs?.filter(d => d.status === 'analyzed' || d.status === 'completed').length || 0;
      const lawyerReviews = userDocs?.filter(d => d.status === 'completed' && d.lawyer_review).length || 0;
      const timeSaved = Math.round((userDocs?.length || 0) * 2.5);
      const avgAnalysisTime = "3-5";
      const riskAlerts = userDocs?.filter(d => d.ai_analysis?.risk_factors && d.ai_analysis.risk_factors.length > 0).length || 0;
      
      // Activity over last 30 days
      const last30Days = userDocs?.filter(d => 
        new Date(d.created_date) > new Date(Date.now() - 30*24*60*60*1000)
      ).length || 0;

      setStats({
        totalDocs: userDocs?.length || 0,
        analyzedDocs,
        lawyerReviews,
        timeSaved,
        avgAnalysisTime,
        riskAlerts,
        last30Days
      });
    } catch (error) {
      console.error("Error loading user:", error);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { updateUser } = await import("@/components/userSync");
      await updateUser(user.id, { name: editedUser.name });
      setUser({ ...user, name: editedUser.name });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
    setIsSaving(false);
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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-[#1E63F0] via-[#2E6BDE] to-[#0099A8] rounded-3xl p-8 mb-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{user?.name || 'משתמש'}</h1>
                <p className="text-white/90 text-sm">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user?.plan && user.plan !== 'free' && (
                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Crown className="w-5 h-5 text-white" />
                  <span className="text-white font-semibold capitalize">{user.plan}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border border-[#E3E6EB] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#EBF2FE] to-[#D6E9FE] rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-[#1E63F0]" />
                </div>
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
              </div>
              <p className="text-sm text-[#4A5568] mb-1">מסמכים כוללים</p>
              <p className="text-3xl font-bold text-[#0A2A43]">{stats.totalDocs}</p>
              <p className="text-xs text-[#9CA3AF] mt-2">{stats.last30Days} בחודש האחרון</p>
            </div>

            <div className="bg-white border border-[#E3E6EB] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#E7F7ED] to-[#D1F2E0] rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#0099A8]" />
                </div>
                <Activity className="w-5 h-5 text-[#0099A8]" />
              </div>
              <p className="text-sm text-[#4A5568] mb-1">ניתוחים הושלמו</p>
              <p className="text-3xl font-bold text-[#0A2A43]">{stats.analyzedDocs}</p>
              <p className="text-xs text-[#9CA3AF] mt-2">
                {stats.totalDocs > 0 ? Math.round((stats.analyzedDocs / stats.totalDocs) * 100) : 0}% אחוז השלמה
              </p>
            </div>

            <div className="bg-white border border-[#E3E6EB] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FEF3E2] to-[#FEE8C8] rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#F59E0B]" />
                </div>
                <Zap className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <p className="text-sm text-[#4A5568] mb-1">זמן שחסכת</p>
              <p className="text-3xl font-bold text-[#0A2A43]">
                {stats.timeSaved}
                <span className="text-lg font-normal text-[#4A5568] mr-1">ש'</span>
              </p>
              <p className="text-xs text-[#9CA3AF] mt-2">ממוצע {stats.avgAnalysisTime} דקות לניתוח</p>
            </div>

            <div className="bg-white border border-[#E3E6EB] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#EEF2FF] to-[#E0E7FF] rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-[#8B5CF6]" />
                </div>
                <Calendar className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <p className="text-sm text-[#4A5568] mb-1">חוות דעת עו"ד</p>
              <p className="text-3xl font-bold text-[#0A2A43]">{stats.lawyerReviews}</p>
              <p className="text-xs text-[#9CA3AF] mt-2">סקירות מקצועיות</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Details */}
            <div className="bg-white border border-[#E5E8EB] rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#1C3D5A]/10 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-[#1C3D5A]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#0F1E2E]">{l.personalDetails}</h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-[#E5E8EB] text-[#5A6B7D] hover:bg-[#F5F6F7]"
                >
                  {isEditing ? l.cancel : l.edit}
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#5A6B7D] mb-2">{l.fullName}</label>
                  {isEditing ? (
                    <Input
                      value={editedUser.name || ""}
                      onChange={(e) => setEditedUser({...editedUser, name: e.target.value})}
                      className="bg-white border-[#E5E8EB] text-[#0F1E2E]"
                    />
                  ) : (
                    <p className="text-[#0F1E2E] font-medium">{user?.name || l.notSpecified}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5A6B7D] mb-2">{l.email}</label>
                  <p className="text-[#0F1E2E] font-medium">{user?.email}</p>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-[#E5E8EB]">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setEditedUser(user);
                    }}
                    className="border-[#E5E8EB] text-[#5A6B7D] hover:bg-[#F5F6F7]"
                  >
                    {l.cancel}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-[#1C3D5A] hover:bg-[#0F1E2E] text-white"
                  >
                    {isSaving ? l.saving : l.saveChanges}
                  </Button>
                </div>
              )}
            </div>

            {/* Account Settings */}
            <div className="bg-white border border-[#E5E8EB] rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#23A57A]/10 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-[#23A57A]" />
                </div>
                <h2 className="text-lg font-semibold text-[#0F1E2E]">{l.accountSettings}</h2>
              </div>

              <div className="flex items-center justify-between py-4 border-b border-[#E5E8EB]">
                <div>
                  <h4 className="font-medium text-[#0F1E2E]">{l.emailNotifications}</h4>
                  <p className="text-sm text-[#5A6B7D]">{l.emailNotificationsDesc}</p>
                </div>
                <Button variant="outline" size="sm" className="border-[#E5E8EB] text-[#5A6B7D] hover:bg-[#F5F6F7]">
                  {l.enabled}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Activity Chart */}
            {stats && (
              <div className="bg-white border border-[#E5E8EB] rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#1E63F0]/10 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-[#1E63F0]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#0F1E2E]">פעילות שבועית</h2>
                </div>

                <div className="flex items-end justify-between gap-2 h-32 mb-4">
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
                          className="w-full bg-gradient-to-t from-[#1E63F0] to-[#0099A8] rounded-t-lg transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                        <div className="text-xs text-[#4A5568]">
                          {date.toLocaleDateString('he-IL', { weekday: 'short' })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-[#E5E8EB]">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#4A5568]">פעילות כוללת</span>
                    <span className="font-semibold text-[#0A2A43]">{stats.last30Days} פעולות</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Stats */}
            {stats && (
              <div className="bg-gradient-to-br from-[#F8F9FB] to-white border border-[#E5E8EB] rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#0099A8]/10 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-[#0099A8]" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#0F1E2E]">סטטיסטיקות מהירות</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E5E8EB]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#EBF2FE] rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#1E63F0]" />
                      </div>
                      <span className="text-[#4A5568] text-sm">מסמכים נותחו</span>
                    </div>
                    <span className="text-[#0A2A43] font-bold text-lg">{stats.analyzedDocs}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E5E8EB]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#FEF3E2] rounded-lg flex items-center justify-center">
                        <Award className="w-4 h-4 text-[#F59E0B]" />
                      </div>
                      <span className="text-[#4A5568] text-sm">חוות דעת</span>
                    </div>
                    <span className="text-[#0A2A43] font-bold text-lg">{stats.lawyerReviews}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-[#E5E8EB]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#E7F7ED] rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-[#0099A8]" />
                      </div>
                      <span className="text-[#4A5568] text-sm">זמן נחסך</span>
                    </div>
                    <span className="text-[#0A2A43] font-bold text-lg">{stats.timeSaved}ש'</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}