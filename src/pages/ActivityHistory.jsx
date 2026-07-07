import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { 
  Upload,
  Eye,
  FileText,
  Clock,
  Calendar,
  Loader2,
  Filter,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

const Document = base44.entities.Document;

export default function ActivityHistoryPage() {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    try {
      const authUser = await base44.auth.me();
      if (!authUser) {
        base44.auth.redirectToLogin();
        return;
      }

      const userId = authUser.id || authUser.user_id;
      const userDocs = await Document.filter({ ownerAuthId: userId }, "-created_date", 100);

      // Convert documents to activities
      const docActivities = (userDocs || []).map(doc => ({
        id: doc.id,
        type: "upload",
        title: `הועלה מסמך: ${doc.title}`,
        description: `מסמך מסוג ${getDocTypeLabel(doc.document_type)}`,
        timestamp: doc.created_date,
        status: doc.status,
        documentId: doc.id
      }));

      setActivities(docActivities);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
    setIsLoading(false);
  };

  const getDocTypeLabel = (type) => {
    const labels = {
      employment_contract: "חוזה עבודה",
      rental_agreement: "הסכם שכירות",
      pay_slip: "תלוש שכר",
      insurance_policy: "פוליסת ביטוח",
      loan_agreement: "הסכם הלוואה",
      purchase_agreement: "הסכם רכישה",
      other: "אחר"
    };
    return labels[type] || type;
  };

  const getActivityIcon = (type) => {
    const icons = {
      upload: Upload,
      view: Eye,
      analyze: FileText
    };
    return icons[type] || FileText;
  };

  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === "all" || activity.type === filterType;
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          activity.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const groupActivitiesByDate = (activities) => {
    const groups = {};
    activities.forEach(activity => {
      const date = new Date(activity.timestamp).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(activity);
    });
    return groups;
  };

  const groupedActivities = groupActivitiesByDate(filteredActivities);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#2E6BDE] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1F36] mb-2">היסטוריית פעילות</h1>
          <p className="text-[#4A5568]">מעקב אחר כל הפעולות שבוצעו בחשבון שלך</p>
        </div>

        {/* Filters */}
        <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
              <Input
                placeholder="חפש פעילות..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="h-10 px-4 bg-white border border-[#E3E6EB] rounded-lg text-[#1A1F36] text-sm focus:outline-none focus:ring-2 focus:ring-[#2E6BDE]"
            >
              <option value="all">כל הפעולות</option>
              <option value="upload">העלאות</option>
              <option value="view">צפיות</option>
              <option value="analyze">ניתוחים</option>
            </select>
          </div>
        </div>

        {/* Activity Timeline */}
        {Object.keys(groupedActivities).length === 0 ? (
          <div className="bg-white border border-[#E3E6EB] rounded-xl p-12 text-center shadow-sm">
            <Clock className="w-16 h-16 text-[#9CA3AF] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1A1F36] mb-2">אין פעילות עדיין</h3>
            <p className="text-[#4A5568]">התחל להשתמש בפלטפורמה כדי לראות פעילות כאן</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date} className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm">
                <div className="bg-[#F8F9FB] px-6 py-3 border-b border-[#E3E6EB]">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#4A5568]">
                    <Calendar className="w-4 h-4" />
                    {date}
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  {dateActivities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div key={activity.id} className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-[#EBF2FE] rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-5 h-5 text-[#2E6BDE]" />
                        </div>
                        <div className="flex-1">
                          <Link
                            to={createPageUrl(`Analysis?id=${activity.documentId}`)}
                            className="font-semibold text-[#1A1F36] hover:text-[#2E6BDE] transition-colors"
                          >
                            {activity.title}
                          </Link>
                          <p className="text-sm text-[#4A5568] mt-1">{activity.description}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-[#9CA3AF]">
                            <Clock className="w-3 h-3" />
                            {new Date(activity.timestamp).toLocaleTimeString('he-IL', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                        {activity.status === "analyzed" && (
                          <Link to={createPageUrl(`Analysis?id=${activity.documentId}`)}>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#E7F7ED] text-[#10B981]">
                              הושלם
                            </span>
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}