import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, X, FileText, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from "framer-motion";

const Notification = base44.entities.Notification;

export default function NotificationBell({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef(null);

  useEffect(() => {
    if (user) {
      loadNotifications();
      // Poll every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    if (!user) return;
    
    try {
      const allNotifs = await Notification.filter({ userId: user.email }, "-createdAt", 10);
      setNotifications(allNotifs);
      const unread = allNotifs.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { isRead: true });
      loadNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.isRead);
      await Promise.all(unreadNotifs.map(n => Notification.update(n.id, { isRead: true })));
      loadNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-[#F8F9FB] rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5 text-[#4A5568]" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#D9534F] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 mt-2 w-80 sm:w-96 bg-white border border-[#E3E6EB] rounded-xl shadow-2xl z-50 max-h-[500px] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-[#E3E6EB] flex items-center justify-between">
              <h3 className="font-bold text-[#1A1F36]">התראות</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-[#2E6BDE] hover:underline"
                  >
                    סמן הכל כנקרא
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-[#F8F9FB] rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-[#4A5568]" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-[#F8F9FB] rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-8 h-8 text-[#9CA3AF]" />
                  </div>
                  <p className="text-[#4A5568] text-sm">אין התראות חדשות</p>
                </div>
              ) : (
                <div className="divide-y divide-[#E3E6EB]">
                  {notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      to={notif.documentId ? createPageUrl("Analysis") + `?id=${notif.documentId}` : createPageUrl("Notifications")}
                      onClick={() => {
                        if (!notif.isRead) markAsRead(notif.id);
                        setIsOpen(false);
                      }}
                      className={`block p-4 hover:bg-[#F8F9FB] transition-colors ${
                        !notif.isRead ? 'bg-[#EBF2FE]' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          notif.type === 'document_reviewed' ? 'bg-[#E7F7ED]' : 'bg-[#EBF2FE]'
                        }`}>
                          {notif.type === 'document_reviewed' ? (
                            <CheckCircle className="w-5 h-5 text-[#10B981]" />
                          ) : (
                            <FileText className="w-5 h-5 text-[#2E6BDE]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[#1A1F36] text-sm mb-1">
                            {notif.title}
                          </p>
                          <p className="text-xs text-[#4A5568] line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-xs text-[#9CA3AF] mt-1">
                            {new Date(notif.createdAt || notif.created_date).toLocaleDateString('he-IL')}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div className="w-2 h-2 bg-[#2E6BDE] rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[#E3E6EB]">
              <Link
                to={createPageUrl("Notifications")}
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-[#2E6BDE] hover:underline"
              >
                ראה את כל ההתראות
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}