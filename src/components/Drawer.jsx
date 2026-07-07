import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  LayoutDashboard,
  CreditCard,
  Info,
  HelpCircle,
  LogIn,
  UserPlus,
  LogOut,
  Scale,
  X,
  Zap,
  Users,
  User as UserIcon,
  Upload,
  FileText,
  Settings,
  FileSearch,
  Folder,
  Bell,
  Clock,
  MessageCircle
} from "lucide-react";

export default function Drawer({ isOpen, onClose, user }) {
  const isAdmin = user?.role === "admin";
  const isLawyer = user?.role === "lawyer";
  
  const guestItems = [
    { title: "בית", url: createPageUrl("Home"), icon: Home },
    { title: "אודות", url: createPageUrl("About"), icon: Info },
    { title: "שאלות נפוצות", url: createPageUrl("FAQ"), icon: HelpCircle },
  ];

  const adminMenuItems = [
    { title: "ניהול משתמשים", url: createPageUrl("UserManagement"), icon: Users },
    { title: "דשבורד עורך דין", url: createPageUrl("LawyerDashboard"), icon: Scale },
  ];

  const mainUserItems = [
    { title: "דשבורד", url: createPageUrl("DashboardHome"), icon: Home },
    { title: "העלאת מסמך", url: createPageUrl("Upload"), icon: Upload },
    { title: "נצפו לאחרונה", url: createPageUrl("DashboardHome") + "?show=recent", icon: Clock },
    { title: "התיקיות שלי", url: createPageUrl("Folders"), icon: Folder },
    { title: "פרופיל", url: createPageUrl("Profile"), icon: UserIcon },
  ];

  const activityItems = [
    { title: "הודעות", url: createPageUrl("Notifications"), icon: Bell },
    { title: "היסטוריית פעילות", url: createPageUrl("ActivityHistory"), icon: Clock },
  ];

  const secondaryUserItems = [
    { title: "תמיכה ועזרה", url: createPageUrl("Support"), icon: MessageCircle },
    { title: "הגדרות", url: createPageUrl("Settings"), icon: Settings },
    { title: "שאלות נפוצות", url: createPageUrl("FAQ"), icon: HelpCircle },
    { title: "אודות", url: createPageUrl("About"), icon: Info },
  ];

  const lawyerMenuItems = [
    { title: "דשבורד עורך דין", url: createPageUrl("LawyerDashboard"), icon: Scale },
  ];

  const handleLogout = async () => {
    try {
      const homeUrl = window.location.origin + createPageUrl("Home");
      await base44.auth.logout(homeUrl);
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = createPageUrl("Home");
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 w-full sm:w-80 bg-gradient-to-br from-white via-white to-[#F8F9FB] dark:from-[#0A0613] dark:via-[#0F0A1A] dark:to-[#141021] z-50 shadow-2xl"
      >
        {/* Header */}
        <div className="relative h-16 px-6 flex items-center justify-between border-b border-[#E3E6EB] dark:border-[#1F1A2D] bg-white/80 dark:bg-[#0A0613]/80 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#2E6BDE]/5 to-[#10B981]/5 dark:from-[#6F3DFF]/10 dark:to-[#9D73FF]/10"></div>
          <div className="flex items-center gap-3 relative z-10">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688fa464cba361329b75d0bf/81b406b2d_ChatGPTImageDec11202509_31_30PM.png" 
              alt="Decifra Logo"
              className="w-8 h-8 object-contain"
            />
            <span className="text-lg font-bold tracking-tight text-[#0A2A43] dark:text-[#F5F3FF]">
              DECIFRA.AI
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F8F9FB] dark:hover:bg-[#1F1A2D] transition-all relative z-10 group"
          >
            <X className="w-5 h-5 text-[#4A5568] dark:text-[#D1CDEE] group-hover:text-[#1E63F0] dark:group-hover:text-[#9D73FF] transition-colors" />
          </button>
        </div>

        {/* Navigation */}
        <div className="h-[calc(100vh-64px)] flex flex-col px-4 py-4">
          <nav className="flex-1 flex flex-col justify-between"
            style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
          >
          {user ? (
            // Logged in user
            <>
              {isAdmin ? (
                // Admin menu - only admin items
                <>
                  <div className="flex-shrink-0">
                    <ul className="space-y-2">
                      {adminMenuItems.map((item) => (
                        <li key={item.title}>
                          <Link
                            to={item.url}
                            onClick={onClose}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#0A2A43] dark:text-[#D1CDEE] hover:bg-gradient-to-r hover:from-[#EBF2FE] hover:to-[#D6E9FE] dark:hover:from-[#6F3DFF]/10 dark:hover:to-[#9D73FF]/10 hover:text-[#1E63F0] dark:hover:text-[#9D73FF] transition-all group"
                          >
                            <div className="w-9 h-9 bg-[#F8F9FB] dark:bg-[#1F1A2D] rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#1E63F0] group-hover:to-[#0099A8] dark:group-hover:from-[#6F3DFF] dark:group-hover:to-[#9D73FF] transition-all">
                              <item.icon className="w-5 h-5 text-[#4A4A4A] dark:text-[#D1CDEE] group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-base font-semibold">{item.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-2 flex-shrink-0">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-[#DC3545] to-[#C82333] hover:from-[#C82333] hover:to-[#DC3545] transition-all w-full shadow-md hover:shadow-lg"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-base font-bold">יציאה</span>
                    </button>
                  </div>
                </>
              ) : isLawyer ? (
                // Lawyer menu
                <>
                  <div className="flex-shrink-0">
                    <ul className="space-y-2">
                      {lawyerMenuItems.map((item) => (
                        <li key={item.title}>
                          <Link
                            to={item.url}
                            onClick={onClose}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#0A2A43] dark:text-[#D1CDEE] hover:bg-gradient-to-r hover:from-[#EBF2FE] hover:to-[#D6E9FE] dark:hover:from-[#6F3DFF]/10 dark:hover:to-[#9D73FF]/10 hover:text-[#1E63F0] dark:hover:text-[#9D73FF] transition-all group"
                          >
                            <div className="w-9 h-9 bg-[#F8F9FB] dark:bg-[#1F1A2D] rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#1E63F0] group-hover:to-[#0099A8] dark:group-hover:from-[#6F3DFF] dark:group-hover:to-[#9D73FF] transition-all">
                              <item.icon className="w-5 h-5 text-[#4A4A4A] dark:text-[#D1CDEE] group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-base font-semibold">{item.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-2 flex-shrink-0">
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl text-white bg-gradient-to-r from-[#DC3545] to-[#C82333] hover:from-[#C82333] hover:to-[#DC3545] transition-all w-full shadow-md hover:shadow-lg"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="text-base font-bold">יציאה</span>
                    </button>
                  </div>
                </>
              ) : (
                // Regular user menu
                <>
                  <div>
                    <ul className="space-y-1.5">
                      {mainUserItems.map((item) => (
                        <li key={item.title}>
                          <Link
                            to={item.url}
                            onClick={onClose}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0A2A43] dark:text-[#D1CDEE] hover:bg-gradient-to-r hover:from-[#EBF2FE] hover:to-[#D6E9FE] dark:hover:from-[#6F3DFF]/10 dark:hover:to-[#9D73FF]/10 hover:text-[#1E63F0] dark:hover:text-[#9D73FF] transition-all group"
                          >
                            <div className="w-8 h-8 bg-[#F8F9FB] dark:bg-[#1F1A2D] rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#1E63F0] group-hover:to-[#0099A8] dark:group-hover:from-[#6F3DFF] dark:group-hover:to-[#9D73FF] transition-all">
                              <item.icon className="w-4 h-4 text-[#4A4A4A] dark:text-[#D1CDEE] group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-sm font-semibold">{item.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="my-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#E5E8EB] dark:via-[#1F1A2D] to-transparent mb-3"></div>
                    <ul className="space-y-1.5">
                      {activityItems.map((item) => (
                        <li key={item.title}>
                          <Link
                            to={item.url}
                            onClick={onClose}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#0A2A43] dark:text-[#D1CDEE] hover:bg-gradient-to-r hover:from-[#EBF2FE] hover:to-[#D6E9FE] dark:hover:from-[#6F3DFF]/10 dark:hover:to-[#9D73FF]/10 hover:text-[#1E63F0] dark:hover:text-[#9D73FF] transition-all group"
                          >
                            <div className="w-8 h-8 bg-[#F8F9FB] dark:bg-[#1F1A2D] rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#1E63F0] group-hover:to-[#0099A8] dark:group-hover:from-[#6F3DFF] dark:group-hover:to-[#9D73FF] transition-all">
                              <item.icon className="w-4 h-4 text-[#4A4A4A] dark:text-[#D1CDEE] group-hover:text-white transition-colors" />
                            </div>
                            <span className="text-sm font-semibold">{item.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="my-3">
                    <div className="h-px bg-gradient-to-r from-transparent via-[#E5E8EB] dark:via-[#1F1A2D] to-transparent mb-3"></div>
                    <ul className="space-y-1">
                      {secondaryUserItems.map((item) => (
                        <li key={item.title}>
                          <Link
                            to={item.url}
                            onClick={onClose}
                            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[#4A4A4A] dark:text-[#9CA3AF] hover:bg-[#F8F9FB] dark:hover:bg-[#1F1A2D] hover:text-[#1E63F0] dark:hover:text-[#9D73FF] transition-all group"
                          >
                            <item.icon className="w-4 h-4 text-[#4A4A4A] dark:text-[#9CA3AF] group-hover:text-[#1E63F0] dark:group-hover:text-[#9D73FF] transition-colors" />
                            <span className="text-xs font-medium">{item.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    {user?.plan !== "business" && (
                      <Link
                        to={createPageUrl("Upgrade")}
                        onClick={onClose}
                        className="block mb-2"
                      >
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1E63F0] via-[#2E6BDE] to-[#0099A8] p-3 shadow-lg hover:shadow-xl transition-all group">
                          <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -mr-8 -mt-8"></div>
                          <div className="relative flex items-center gap-2">
                            <div className="w-7 h-7 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                              <Zap className="w-3.5 h-3.5 text-white" />
                            </div>
                            <div>
                              <span className="text-white font-bold text-xs block">תוכניות</span>
                              <span className="text-white/80 text-[10px]">שדרגו עכשיו</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    )}

                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white bg-gradient-to-r from-[#DC3545] to-[#C82333] hover:from-[#C82333] hover:to-[#DC3545] transition-all w-full shadow-md hover:shadow-lg"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-bold">יציאה</span>
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            // Guest user
            <>
              <ul className="space-y-2 flex-shrink-0">
                {guestItems.map((item) => (
                  <li key={item.title}>
                    <Link
                      to={item.url}
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#0A2A43] dark:text-[#D1CDEE] hover:bg-gradient-to-r hover:from-[#EBF2FE] hover:to-[#D6E9FE] dark:hover:from-[#6F3DFF]/10 dark:hover:to-[#9D73FF]/10 hover:text-[#1E63F0] dark:hover:text-[#9D73FF] transition-all group"
                    >
                      <div className="w-9 h-9 bg-[#F8F9FB] dark:bg-[#1F1A2D] rounded-lg flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#1E63F0] group-hover:to-[#0099A8] dark:group-hover:from-[#6F3DFF] dark:group-hover:to-[#9D73FF] transition-all">
                        <item.icon className="w-5 h-5 text-[#4A4A4A] dark:text-[#D1CDEE] group-hover:text-white transition-colors" />
                      </div>
                      <span className="text-base font-semibold">{item.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-2 flex-shrink-0">
                {/* Upgrade Plans CTA */}
                <Link
                  to={createPageUrl("Upgrade")}
                  onClick={onClose}
                  className="block mb-3"
                >
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1E63F0] via-[#2E6BDE] to-[#0099A8] p-4 shadow-xl">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full -ml-8 -mb-8"></div>
                    
                    <div className="relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                          <Zap className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-bold text-sm">תוכניות מנוי</span>
                      </div>
                      <p className="text-white/90 text-xs leading-relaxed">
                        גלו את התוכניות שלנו והתחילו לנתח מסמכים
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1.5 text-white text-xs font-semibold">
                        <span>צפייה בתוכניות</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>

                <button
                  onClick={() => {
                    onClose();
                    base44.auth.redirectToLogin();
                  }}
                  className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white dark:bg-[#141021] border-2 border-[#E3E6EB] dark:border-[#1F1A2D] hover:border-[#1E63F0] dark:hover:border-[#6F3DFF] hover:bg-gradient-to-r hover:from-[#EBF2FE] hover:to-[#D6E9FE] dark:hover:from-[#6F3DFF]/10 dark:hover:to-[#9D73FF]/10 text-[#0A2A43] dark:text-[#D1CDEE] transition-all w-full shadow-sm hover:shadow-md"
                >
                  <LogIn className="w-5 h-5" />
                  <span className="text-base font-bold">התחברות</span>
                </button>
              </div>
            </>
          )}
          </nav>
        </div>
      </motion.div>
    </>
  );
}