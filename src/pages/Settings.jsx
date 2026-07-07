import React, { useState, useEffect } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Bell, Moon, Sun, Globe, Palette } from "lucide-react";
import NotificationSettings from "@/components/NotificationSettings";
import { base44 } from "@/api/base44Client";

export default function SettingsPage() {
  const { language, setLanguage, isRTL, theme, setTheme, isDark } = useTheme();
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { getCurrentUser } = await import("@/components/userSync");
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const labels = {
    he: {
      title: "הגדרות",
      subtitle: "התאמה אישית של הממשק והחוויה",
      appearance: "מראה",
      appearanceDesc: "בחרו את עיצוב הממשק המועדף",
      theme: "ערכת נושא",
      themeDesc: "בחרו בין מצב יום למצב לילה",
      lightMode: "מצב יום",
      darkMode: "מצב לילה",
      language: "שפה",
      languageDesc: "בחרו את שפת הממשק המועדפת",
      hebrew: "עברית",
      english: "English",
      notifications: "התראות",
      notificationsDesc: "נהלו את ההתראות שלכם",
      current: "נוכחי"
    },
    en: {
      title: "Settings",
      subtitle: "Customize your interface and experience",
      appearance: "Appearance",
      appearanceDesc: "Choose your preferred interface design",
      theme: "Theme",
      themeDesc: "Choose between light and dark mode",
      lightMode: "Light Mode",
      darkMode: "Dark Mode",
      language: "Language",
      languageDesc: "Choose your preferred interface language",
      hebrew: "עברית",
      english: "English",
      notifications: "Notifications",
      notificationsDesc: "Manage your notification preferences",
      current: "Current"
    }
  };

  const l = labels[language] || labels.he;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE] dark:from-[#0A0613] dark:via-[#0A0613] dark:to-[#141021] p-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2E6BDE]/5 dark:bg-[#6F3DFF]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#10B981]/5 dark:bg-[#9D73FF]/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0A2A43] dark:text-[#F5F3FF] mb-2">{l.title}</h1>
          <p className="text-[#4A5568] dark:text-[#D1CDEE]">{l.subtitle}</p>
        </div>

        <div className="space-y-6">
          {/* Appearance Section */}
          <div className="bg-white dark:bg-[#141021] border border-[#E3E6EB] dark:border-[#1F1A2D] rounded-2xl p-6 shadow-lg dark:shadow-[#6F3DFF]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2E6BDE] to-[#1D4ED8] dark:from-[#6F3DFF] dark:to-[#9D73FF] rounded-xl flex items-center justify-center shadow-md">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0A2A43] dark:text-[#F5F3FF]">{l.appearance}</h2>
                <p className="text-sm text-[#4A5568] dark:text-[#D1CDEE]">{l.appearanceDesc}</p>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-[#0A2A43] dark:text-[#F5F3FF] mb-3">{l.theme}</h3>
              <p className="text-xs text-[#4A5568] dark:text-[#D1CDEE] mb-4">{l.themeDesc}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setTheme('light')}
                  className={`group p-5 rounded-xl border-2 transition-all ${
                    !isDark
                      ? 'border-[#2E6BDE] dark:border-[#6F3DFF] bg-[#2E6BDE]/5 dark:bg-[#6F3DFF]/10 shadow-lg dark:shadow-[#6F3DFF]/30'
                      : 'border-[#E3E6EB] dark:border-[#1F1A2D] hover:border-[#2E6BDE] dark:hover:border-[#6F3DFF]'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                    !isDark
                      ? 'bg-gradient-to-br from-[#FDB813] to-[#F59E0B] shadow-lg'
                      : 'bg-[#F8F9FB] dark:bg-[#1F1A2D] group-hover:bg-[#FDB813]/10'
                  }`}>
                    <Sun className={`w-6 h-6 ${!isDark ? 'text-white' : 'text-[#F59E0B] dark:text-[#9D73FF]'}`} />
                  </div>
                  <h3 className="font-semibold text-[#0A2A43] dark:text-[#F5F3FF] mb-1">{l.lightMode}</h3>
                  {!isDark && (
                    <span className="inline-block text-xs text-[#2E6BDE] dark:text-[#9D73FF] font-medium">{l.current}</span>
                  )}
                </button>
                
                <button
                  onClick={() => setTheme('dark')}
                  className={`group p-5 rounded-xl border-2 transition-all ${
                    isDark
                      ? 'border-[#6F3DFF] bg-[#6F3DFF]/10 shadow-lg shadow-[#6F3DFF]/30'
                      : 'border-[#E3E6EB] dark:border-[#1F1A2D] hover:border-[#6F3DFF]'
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                    isDark
                      ? 'bg-gradient-to-br from-[#6F3DFF] to-[#9D73FF] shadow-lg'
                      : 'bg-[#F8F9FB] dark:bg-[#1F1A2D] group-hover:bg-[#6F3DFF]/10'
                  }`}>
                    <Moon className={`w-6 h-6 ${isDark ? 'text-white' : 'text-[#6366F1] dark:text-[#9D73FF]'}`} />
                  </div>
                  <h3 className="font-semibold text-[#0A2A43] dark:text-[#F5F3FF] mb-1">{l.darkMode}</h3>
                  {isDark && (
                    <span className="inline-block text-xs text-[#9D73FF] font-medium">{l.current}</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="bg-white dark:bg-[#141021] border border-[#E3E6EB] dark:border-[#1F1A2D] rounded-2xl p-6 shadow-lg dark:shadow-[#6F3DFF]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#10B981] to-[#059669] dark:from-[#9D73FF] dark:to-[#6F3DFF] rounded-xl flex items-center justify-center shadow-md">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0A2A43] dark:text-[#F5F3FF]">{l.language}</h2>
                <p className="text-sm text-[#4A5568] dark:text-[#D1CDEE]">{l.languageDesc}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button
                onClick={() => setLanguage('he')}
                className={`group p-5 rounded-xl border-2 transition-all ${
                  language === 'he' 
                    ? 'border-[#2E6BDE] dark:border-[#6F3DFF] bg-[#2E6BDE]/5 dark:bg-[#6F3DFF]/10 shadow-lg dark:shadow-[#6F3DFF]/30' 
                    : 'border-[#E3E6EB] dark:border-[#1F1A2D] hover:border-[#2E6BDE] dark:hover:border-[#6F3DFF]'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                  language === 'he'
                    ? 'bg-gradient-to-br from-[#2E6BDE] to-[#1D4ED8] dark:from-[#6F3DFF] dark:to-[#9D73FF] shadow-lg'
                    : 'bg-[#F8F9FB] dark:bg-[#1F1A2D]'
                }`}>
                  <span className="text-2xl">🇮🇱</span>
                </div>
                <h3 className="font-semibold text-[#0A2A43] dark:text-[#F5F3FF] mb-1">{l.hebrew}</h3>
                {language === 'he' && (
                  <span className="inline-block text-xs text-[#2E6BDE] dark:text-[#9D73FF] font-medium">{l.current}</span>
                )}
              </button>
              
              <button
                onClick={() => setLanguage('en')}
                className={`group p-5 rounded-xl border-2 transition-all ${
                  language === 'en' 
                    ? 'border-[#2E6BDE] dark:border-[#6F3DFF] bg-[#2E6BDE]/5 dark:bg-[#6F3DFF]/10 shadow-lg dark:shadow-[#6F3DFF]/30' 
                    : 'border-[#E3E6EB] dark:border-[#1F1A2D] hover:border-[#2E6BDE] dark:hover:border-[#6F3DFF]'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center transition-all ${
                  language === 'en'
                    ? 'bg-gradient-to-br from-[#2E6BDE] to-[#1D4ED8] dark:from-[#6F3DFF] dark:to-[#9D73FF] shadow-lg'
                    : 'bg-[#F8F9FB] dark:bg-[#1F1A2D]'
                }`}>
                  <span className="text-2xl">🇺🇸</span>
                </div>
                <h3 className="font-semibold text-[#0A2A43] dark:text-[#F5F3FF] mb-1">{l.english}</h3>
                {language === 'en' && (
                  <span className="inline-block text-xs text-[#2E6BDE] dark:text-[#9D73FF] font-medium">{l.current}</span>
                )}
              </button>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white dark:bg-[#141021] border border-[#E3E6EB] dark:border-[#1F1A2D] rounded-2xl p-6 shadow-lg dark:shadow-[#6F3DFF]/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#F59E0B] to-[#D97706] dark:from-[#6F3DFF] dark:to-[#9D73FF] rounded-xl flex items-center justify-center shadow-md">
                <Bell className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#0A2A43] dark:text-[#F5F3FF]">{l.notifications}</h2>
                <p className="text-sm text-[#4A5568] dark:text-[#D1CDEE]">{l.notificationsDesc}</p>
              </div>
            </div>
            <NotificationSettings user={user} />
          </div>
        </div>
      </div>
    </div>
  );
}