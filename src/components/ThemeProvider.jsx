import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // תמיד מצב בהיר, בלי קריאה ל-localStorage
  const [isDark, setIsDark] = useState(false);

  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem("decifra-language");
    return saved || "he";
  });

  const [menuOpen, setMenuOpen] = useState(false);

  // שמירת שפה + כיוון דף
  useEffect(() => {
    localStorage.setItem("decifra-language", language);
    document.documentElement.dir = language === "he" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  // מנקה לגמרי Dark Mode (לא נשמר בכלל)
  useEffect(() => {
    localStorage.removeItem("decifra-theme");
    document.documentElement.classList.remove("dark");
  }, []); // רץ פעם אחת בלבד

  const toggleLanguage = () =>
    setLanguage(language === "he" ? "en" : "he");

  // לא עושים כלום כשמנסים להחליף theme – מצב לילה בוטל
  const toggleTheme = () => {};

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const isRTL = language === "he";

  // Decifra.ai Brand Theme Colors – כמו שהיה אצלך
  const theme = {
    // Primary
    primaryDark: "#052A53",
    primaryBlue: "#064C93",

    // Secondary
    lightBlue: "#B7D9F6",
    softGray: "#F5F8FB",

    // Accent
    accentBlue1: "#74C8FF",
    accentBlue2: "#95E0FF",

    // Text
    textPrimary: "#0A1A2F",
    textSecondary: "#475569",

    // System
    success: "#22C55E",
    warning: "#FACC15",
    danger: "#EF4444",

    // Background
    white: "#FFFFFF",

    // Legacy aliases for backwards compatibility
    deepBlue: "#052A53",
    navy: "#0A1A2F",
    decifraBlue: "#064C93",
    coolGray: "#B7D9F6",
    lineGray: "#B7D9F6",
    error: "#EF4444",
    textMuted: "#475569",
  };

  return (
    <ThemeContext.Provider
      value={{
        isDark,
        setIsDark,
        toggleTheme,
        language,
        setLanguage,
        toggleLanguage,
        isRTL,
        theme,
        menuOpen,
        setMenuOpen,
        toggleMenu,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;