import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, ArrowLeft, ArrowRight } from "lucide-react";
import { ThemeProvider, useTheme } from "@/components/ThemeProvider";
import { base44 } from "@/api/base44Client";
import Drawer from "@/components/Drawer";
import NotificationBell from "@/components/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, isRTL } = useTheme();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
    // בכל מעבר עמוד גלול לראש הדף
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto", // אפשר לשנות ל "smooth" אם אתה רוצה גלילה חלקה
    });
  }, [location.pathname]);

  useEffect(() => {
    loadUser();

    // Reload user when window gets focus (e.g., after OAuth redirect)
    const handleFocus = () => {
      loadUser();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadUser = async () => {
    try {
      const { getCurrentUser } = await import("@/components/userSync");
      const currentUser = await getCurrentUser();
      
      if (!currentUser) {
        setUser(null);
        return;
      }
      
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
      setUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-white" dir={isRTL ? "rtl" : "ltr"}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Assistant:wght@400;500;600;700&display=swap');

        * {
          font-family: 'Inter', 'Assistant', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        body {
          background-color: #F5F8FB;
        }

        h1, h2, h3, h4, h5, h6 {
          font-weight: 600;
        }

        button {
          font-weight: 600;
        }

        /* Global color variables */
        :root {
          --primary-dark: #0A2A43;
          --primary-blue: #1E63F0;
          --turquoise: #0099A8;
          --soft-gray: #F7F9FB;
          --text-primary: #0A2A43;
          --text-secondary: #4A4A4A;
          --success: #0099A8;
          --warning: #F0AD4E;
          --danger: #DC3545;
        }
      `}</style>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#E5E8EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Left controls: Back + Menu */}
          <div className="flex items-center gap-2">

            <button 
              onClick={() => setDrawerOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F7F9FB] transition-colors active:scale-95 touch-manipulation"
              aria-label="Menu"
              title="Menu"
            >
              <Menu className="w-6 h-6 text-[#0A2A43]" />
            </button>
          </div>

          {/* Center: Logo + Brand Name */}
          <Link 
            to={user ? createPageUrl("DashboardHome") : createPageUrl("Home")}
            className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 hover:opacity-80 transition-opacity active:scale-95 touch-manipulation py-2 px-3 -mx-3"
          >
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/688fa464cba361329b75d0bf/81b406b2d_ChatGPTImageDec11202509_31_30PM.png" 
              alt="Decifra Logo"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain pointer-events-none"
            />
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#0A2A43] pointer-events-none">
              DECIFRA.AI
            </span>
          </Link>

          {/* Left: Notification Bell */}
          <div className="flex items-center gap-2">
            <NotificationBell user={user} />
          </div>
        </div>
      </header>

      {/* Drawer */}
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} user={user} />

      {/* Main Content */}
      <main className="pt-14 sm:pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <ThemeProvider>
      <LayoutContent currentPageName={currentPageName}>
        {children}
      </LayoutContent>
    </ThemeProvider>
  );
}