import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { 
  Bell,
  FileText,
  CheckCircle,
  Clock,
  Loader2,
  ArrowRight,
  Trash2
} from "lucide-react";

const Notification = base44.entities.Notification;
const Document = base44.entities.Document;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      const [notifs, docs] = await Promise.all([
        Notification.filter({ userId: currentUser.email }, "-createdAt"),
        Document.list()
      ]);

      setNotifications(notifs);
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
    setIsLoading(false);
  };

  const getDocumentById = (docId) => {
    return documents.find(d => d.id === docId);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.isRead) {
      await Notification.update(notification.id, { isRead: true });
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n)
      );
    }

    // Navigate to document analysis
    if (notification.documentId) {
      navigate(createPageUrl(`Analysis?id=${notification.documentId}`));
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      await Promise.all(
        unreadNotifications.map(n => Notification.update(n.id, { isRead: true }))
      );
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await Notification.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "document_reviewed":
        return <CheckCircle className="w-5 h-5 text-[#10B981]" />;
      case "status_change":
        return <Clock className="w-5 h-5 text-[#F59E0B]" />;
      default:
        return <Bell className="w-5 h-5 text-[#2E6BDE]" />;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "עכשיו";
    if (diffMins < 60) return `לפני ${diffMins} דקות`;
    if (diffHours < 24) return `לפני ${diffHours} שעות`;
    if (diffDays < 7) return `לפני ${diffDays} ימים`;
    return date.toLocaleDateString('he-IL');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#2E6BDE] animate-spin" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1F36]">התראות</h1>
            {unreadCount > 0 && (
              <Button
                onClick={markAllAsRead}
                variant="outline"
                size="sm"
                className="border-[#E3E6EB] text-[#4A5568] hover:bg-[#F8F9FB]"
              >
                סמן הכל כנקרא
              </Button>
            )}
          </div>
          <p className="text-[#4A5568]">
            {unreadCount > 0 ? `${unreadCount} התראות חדשות` : "אין התראות חדשות"}
          </p>
        </div>

        {/* Notifications List */}
        {notifications.length === 0 ? (
          <div className="bg-white border border-[#E3E6EB] rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-[#F8F9FB] rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-[#9CA3AF]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1A1F36] mb-2">אין התראות</h3>
            <p className="text-[#4A5568]">התראות על עדכונים במסמכים שלך יופיעו כאן</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const doc = getDocumentById(notification.documentId);
              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`bg-white border rounded-xl p-4 sm:p-5 cursor-pointer transition-all hover:shadow-md ${
                    notification.isRead 
                      ? 'border-[#E3E6EB]' 
                      : 'border-[#2E6BDE] bg-[#EBF2FE]/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      notification.isRead ? 'bg-[#F8F9FB]' : 'bg-[#2E6BDE]/10'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3 className={`font-semibold ${
                          notification.isRead ? 'text-[#1A1F36]' : 'text-[#2E6BDE]'
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-[#2E6BDE] rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>

                      <p className="text-sm text-[#4A5568] mb-2 leading-relaxed">
                        {notification.message}
                      </p>

                      {doc && (
                        <div className="flex items-center gap-2 text-xs text-[#9CA3AF] mb-2">
                          <FileText className="w-3 h-3" />
                          <span>{doc.title}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-4">
                        <span className="text-xs text-[#9CA3AF]">
                          {formatTimestamp(notification.createdAt)}
                        </span>
                        
                        <button
                          onClick={(e) => deleteNotification(notification.id, e)}
                          className="text-[#9CA3AF] hover:text-[#D9534F] transition-colors p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}