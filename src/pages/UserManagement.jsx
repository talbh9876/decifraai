import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Search, 
  Crown,
  Shield,
  CheckCircle,
  Loader2,
  Settings,
  Download,
  RotateCcw,
  History,
  Edit
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [selectedUserActivity, setSelectedUserActivity] = useState(null);
  const [activityDocuments, setActivityDocuments] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [editingQuota, setEditingQuota] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const { getCurrentUser } = await import("@/components/userSync");
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        console.log("No user found, redirecting...");
        window.location.href = createPageUrl("Home");
        return;
      }

      setCurrentUser(currentUser);

      // Check if user is admin
      if (currentUser.role !== "admin") {
        console.log("User is not admin, redirecting...");
        window.location.href = createPageUrl("DashboardHome");
        return;
      }

      // Use asServiceRole to access all users as admin
      const allUsers = await base44.asServiceRole.entities.Users.list("-created_date", 500);
      console.log("Loaded users:", allUsers.length);
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      alert("שגיאה בטעינת נתונים: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (userId, field, value) => {
    setUpdatingUserId(userId);
    try {
      // Update user using service role
      await base44.asServiceRole.entities.Users.update(userId, { [field]: value });
      
      // Refresh users list
      const allUsers = await base44.asServiceRole.entities.Users.list("-created_date", 500);
      setUsers(allUsers);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("שגיאה בעדכון המשתמש");
    }
    setUpdatingUserId(null);
  };

  const handleResetScans = async (userId) => {
    if (!confirm("האם אתה בטוח שברצונך לאפס את מונה הסריקות למשתמש זה?")) {
      return;
    }
    
    setUpdatingUserId(userId);
    try {
      await base44.asServiceRole.entities.Users.update(userId, { scansUsed: 0 });
      const allUsers = await base44.asServiceRole.entities.Users.list("-created_date", 500);
      setUsers(allUsers);
      alert("מונה הסריקות אופס בהצלחה");
    } catch (error) {
      console.error("Error resetting scans:", error);
      alert("שגיאה באיפוס הסריקות");
    }
    setUpdatingUserId(null);
  };

  const handleExportCSV = () => {
    const headers = ["אימייל", "שם", "תפקיד", "חבילה", "סריקות שבוצעו", "תאריך הצטרפות"];
    const rows = filteredUsers.map(user => [
      user.email,
      user.name || "",
      user.role || "user",
      user.plan || "free",
      user.scansUsed || 0,
      new Date(user.created_date).toLocaleDateString('he-IL')
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `users_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleViewActivity = async (user) => {
    setShowActivityDialog(true);
    setSelectedUserActivity(user);
    setLoadingActivity(true);
    setActivityDocuments([]);

    try {
      // Load user's documents using service role
      const docs = await base44.asServiceRole.entities.Document.filter(
        { ownerAuthId: user.authId },
        "-created_date",
        100
      );
      setActivityDocuments(docs || []);
    } catch (error) {
      console.error("Error loading activity:", error);
      setActivityDocuments([]);
    }
    setLoadingActivity(false);
  };

  const getRoleBadge = (role) => {
    const configs = {
      admin: { label: "מנהל", color: "bg-purple-100 text-purple-800", icon: Crown },
      lawyer: { label: "עורך דין", color: "bg-blue-100 text-blue-800", icon: Shield },
      user: { label: "משתמש", color: "bg-gray-100 text-gray-800", icon: CheckCircle }
    };
    const config = configs[role] || configs.user;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getPlanBadge = (plan) => {
    const configs = {
      business: { label: "Business", color: "bg-yellow-100 text-yellow-800" },
      pro: { label: "Pro", color: "bg-indigo-100 text-indigo-800" },
      free: { label: "חינמי", color: "bg-gray-100 text-gray-800" }
    };
    const config = configs[plan] || configs.free;
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-[#2E6BDE] animate-spin" />
          <p className="text-[#4A5568]">טוען משתמשים...</p>
        </div>
      </div>
    );
  }

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-4">
        <div className="text-center bg-white p-8 rounded-2xl border border-[#E3E6EB] max-w-md">
          <h2 className="text-2xl font-bold text-[#1A1F36] mb-2">אין הרשאה</h2>
          <p className="text-[#4A5568] mb-6">עמוד זה זמין רק למנהלי מערכת</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#2E6BDE] rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A1F36]">ניהול משתמשים</h1>
          </div>
          <p className="text-[#4A5568]">ניהול כל המשתמשים במערכת</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#E3E6EB] rounded-xl p-4">
            <div className="text-sm text-[#4A5568] mb-1">סה"כ משתמשים</div>
            <div className="text-2xl font-bold text-[#1A1F36]">{users.length}</div>
          </div>
          <div className="bg-white border border-[#E3E6EB] rounded-xl p-4">
            <div className="text-sm text-[#4A5568] mb-1">עורכי דין</div>
            <div className="text-2xl font-bold text-[#2E6BDE]">
              {users.filter(u => u.role === "lawyer").length}
            </div>
          </div>
          <div className="bg-white border border-[#E3E6EB] rounded-xl p-4">
            <div className="text-sm text-[#4A5568] mb-1">משתמשי Pro</div>
            <div className="text-2xl font-bold text-[#10B981]">
              {users.filter(u => u.plan === "pro").length}
            </div>
          </div>
          <div className="bg-white border border-[#E3E6EB] rounded-xl p-4">
            <div className="text-sm text-[#4A5568] mb-1">משתמשי Business</div>
            <div className="text-2xl font-bold text-[#F59E0B]">
              {users.filter(u => u.plan === "business").length}
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="bg-white border border-[#E3E6EB] rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1 w-full">
              <Search className="w-5 h-5 text-[#9CA3AF]" />
              <Input
                placeholder="חיפוש לפי אימייל או שם..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-0 focus-visible:ring-0 text-sm"
              />
            </div>
            <Button
              onClick={handleExportCSV}
              variant="outline"
              className="border-[#E3E6EB] text-[#4A5568] hover:bg-[#F8F9FB] w-full sm:w-auto"
            >
              <Download className="w-4 h-4 ml-2" />
              ייצא CSV
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F8F9FB] border-b border-[#E3E6EB]">
                <tr>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-[#4A5568]">משתמש</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-[#4A5568]">תפקיד</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-[#4A5568]">חבילה</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-[#4A5568]">סריקות</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-[#4A5568]">תאריך הצטרפות</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-[#4A5568]">פעולות</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3E6EB]">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F8F9FB] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-[#1A1F36]">
                          {user.name || user.email}
                        </div>
                        <div className="text-sm text-[#9CA3AF]">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getRoleBadge(user.role)}
                        <Select
                          value={user.role || "user"}
                          onValueChange={(value) => handleUpdateUser(user.id, "role", value)}
                          disabled={updatingUserId === user.id}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">משתמש</SelectItem>
                            <SelectItem value="lawyer">עורך דין</SelectItem>
                            <SelectItem value="admin">מנהל</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getPlanBadge(user.plan)}
                        <Select
                          value={user.plan || "free"}
                          onValueChange={(value) => handleUpdateUser(user.id, "plan", value)}
                          disabled={updatingUserId === user.id}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="free">חינמי</SelectItem>
                            <SelectItem value="beginner">Beginner</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#4A5568]">
                        {user.scansUsed || 0}
                        {user.scanQuota && ` / ${user.scanQuota}`}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#4A5568]">
                        {new Date(user.created_date).toLocaleDateString('he-IL')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewActivity(user)}
                          className="h-8 px-3 text-xs border-[#E3E6EB] hover:bg-[#F8F9FB]"
                        >
                          <History className="w-3 h-3 ml-1" />
                          פעילות
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResetScans(user.id)}
                          disabled={updatingUserId === user.id}
                          className="h-8 px-3 text-xs border-[#E3E6EB] hover:bg-[#F8F9FB] text-[#F59E0B] hover:text-[#F59E0B]"
                        >
                          {updatingUserId === user.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3 h-3 ml-1" />
                          )}
                          אפס
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingQuota(user)}
                          className="h-8 px-3 text-xs border-[#E3E6EB] hover:bg-[#F8F9FB]"
                        >
                          <Edit className="w-3 h-3 ml-1" />
                          מכסה
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-3 text-[#9CA3AF]" />
              <p className="text-[#4A5568]">לא נמצאו משתמשים</p>
            </div>
          )}
        </div>

        {/* Activity Dialog */}
        <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>היסטוריית פעילות - {selectedUserActivity?.email}</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {loadingActivity ? (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 mx-auto mb-3 text-[#2E6BDE] animate-spin" />
                  <p className="text-[#4A5568]">טוען נתונים...</p>
                </div>
              ) : activityDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-12 h-12 mx-auto mb-3 text-[#9CA3AF]" />
                  <p className="text-[#4A5568]">אין היסטוריית פעילות</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {activityDocuments.map((doc) => (
                    <div key={doc.id} className="border border-[#E3E6EB] rounded-lg p-4 hover:bg-[#F8F9FB] transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-[#1A1F36] mb-1">{doc.title}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-sm text-[#9CA3AF]">
                            <span>סוג: {doc.document_type}</span>
                            <span>•</span>
                            <span>סטטוס: {doc.status}</span>
                            <span>•</span>
                            <span>{new Date(doc.created_date).toLocaleDateString('he-IL')} {new Date(doc.created_date).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          doc.status === 'analyzed' ? 'bg-green-100 text-green-800' :
                          doc.status === 'analyzing' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {doc.status === 'analyzed' ? 'הסתיים' : 
                           doc.status === 'analyzing' ? 'מעבד' : 'ממתין'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Quota Dialog */}
        <Dialog open={!!editingQuota} onOpenChange={(open) => !open && setEditingQuota(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>עריכת מכסת סריקות - {editingQuota?.email}</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-[#1A1F36] mb-2 block">
                  מכסה חודשית (השאר ריק ללא הגבלה)
                </label>
                <Input
                  type="number"
                  placeholder="לדוגמה: 30"
                  defaultValue={editingQuota?.scanQuota || ""}
                  onChange={(e) => {
                    if (editingQuota) {
                      editingQuota.scanQuota = e.target.value ? parseInt(e.target.value) : null;
                    }
                  }}
                  className="text-sm"
                />
                <p className="text-xs text-[#9CA3AF] mt-2">
                  מכסה נוכחית: {editingQuota?.scanQuota || "ללא הגבלה"}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={async () => {
                    if (editingQuota) {
                      await handleUpdateUser(editingQuota.id, "scanQuota", editingQuota.scanQuota);
                      setEditingQuota(null);
                    }
                  }}
                  className="flex-1 bg-[#2E6BDE] hover:bg-[#1D4ED8]"
                >
                  שמור
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingQuota(null)}
                  className="flex-1"
                >
                  ביטול
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}