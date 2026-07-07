import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle,
  Mail,
  HelpCircle,
  Send,
  CheckCircle,
  Book,
  FileText,
  Video,
  Loader2,
  ArrowLeft,
  Zap,
  Clock,
  Users,
  Shield
} from "lucide-react";

const SendEmail = base44.integrations.Core.SendEmail;

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [showBot, setShowBot] = useState(false);
  const [botMessages, setBotMessages] = useState([]);
  const [userQuestion, setUserQuestion] = useState("");
  const [isBotThinking, setIsBotThinking] = useState(false);

  const handleBotQuestion = async (e) => {
    e.preventDefault();
    
    if (!userQuestion.trim()) return;

    const question = userQuestion;
    setUserQuestion("");
    
    // Add user message
    setBotMessages(prev => [...prev, { role: "user", content: question }]);
    setIsBotThinking(true);

    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `אתה בוט תמיכה של DecifraAI - פלטפורמה לניתוח מסמכים משפטיים באמצעות AI.
        
התכונות העיקריות של הפלטפורמה:
- ניתוח מסמכים משפטיים באמצעות AI
- זיהוי סיכונים וסעיפים בעייתיים
- המלצות משפטיות חכמות
- שליחה לעורכי דין לייעוץ נוסף
- 3 חבילות: חינמי (1 סריקה), Pro (30 סריקות/חודש ב-₪29), Business (ללא הגבלה ב-₪99)

ענה בעברית, בצורה ידידותית ומקצועית על השאלה הבאה:

${question}

אם השאלה לא קשורה לפלטפורמה או שאתה לא יודע את התשובה, הפנה את המשתמש ליצירת קשר עם התמיכה.`,
      });

      setBotMessages(prev => [...prev, { role: "assistant", content: response }]);
    } catch (error) {
      console.error("Error with bot:", error);
      setBotMessages(prev => [...prev, { 
        role: "assistant", 
        content: "מצטער, אירעה שגיאה. אנא נסה שוב או צור קשר עם התמיכה." 
      }]);
    }
    
    setIsBotThinking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      alert("אנא מלא את כל השדות");
      return;
    }

    setIsSending(true);

    try {
      // Send email to support
      await SendEmail({
        to: "support@decifraai.app",
        subject: `פנייה חדשה: ${formData.subject}`,
        body: `
שם: ${formData.name}
אימייל: ${formData.email}
נושא: ${formData.subject}

הודעה:
${formData.message}
        `
      });

      // Send confirmation to user
      await SendEmail({
        to: formData.email,
        subject: "קיבלנו את פניתך - DecifraAI",
        body: `
שלום ${formData.name},

קיבלנו את פניתך בנושא "${formData.subject}".
נציג שלנו יחזור אליך בהקדם האפשרי.

תודה שפנית אלינו,
צוות DecifraAI
        `
      });

      setIsSent(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      setTimeout(() => {
        setIsSent(false);
      }, 5000);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("שגיאה בשליחת ההודעה. אנא נסה שוב.");
    }
    
    setIsSending(false);
  };

  const supportCards = [
    {
      icon: Book,
      title: "מדריך למשתמש",
      description: "למד כיצד להשתמש בכל התכונות של הפלטפורמה",
      link: createPageUrl("FAQ"),
      color: "bg-[#EBF2FE]",
      iconColor: "text-[#2E6BDE]"
    },
    {
      icon: FileText,
      title: "שאלות נפוצות",
      description: "תשובות לשאלות הנפוצות ביותר",
      link: createPageUrl("FAQ"),
      color: "bg-[#FEF3E2]",
      iconColor: "text-[#F59E0B]"
    },
    {
      icon: Video,
      title: "סרטוני הדרכה",
      description: "צפה בהדרכות וידאו קצרות",
      link: "#",
      color: "bg-[#E7F7ED]",
      iconColor: "text-[#10B981]"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F8FB] via-white to-[#EBF2FE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Hero Header */}
        <div className="relative bg-gradient-to-br from-[#1E63F0] via-[#2E6BDE] to-[#0099A8] rounded-3xl p-8 sm:p-12 mb-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mb-20"></div>
          <Link to={createPageUrl("DashboardHome")}>
            <Button variant="ghost" size="sm" className="relative mb-6 text-white/90 hover:text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 ml-2" />
              חזרה לדשבורד
            </Button>
          </Link>
          <div className="relative text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center shadow-2xl mx-auto mb-6">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">מרכז תמיכה ועזרה</h1>
            <p className="text-white/90 text-lg max-w-2xl mx-auto">אנחנו כאן כדי לעזור לך - צור קשר או מצא תשובות</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-[#E3E6EB] rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EBF2FE] rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-[#1E63F0]" />
              </div>
              <div>
                <p className="text-xs text-[#4A5568]">זמן תגובה</p>
                <p className="text-lg font-bold text-[#0A2A43]">24 שעות</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E3E6EB] rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#E7F7ED] rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-[#0099A8]" />
              </div>
              <div>
                <p className="text-xs text-[#4A5568]">תמיכה</p>
                <p className="text-lg font-bold text-[#0A2A43]">24/7</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E3E6EB] rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FEF3E2] rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <p className="text-xs text-[#4A5568]">שביעות רצון</p>
                <p className="text-lg font-bold text-[#0A2A43]">98%</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E3E6EB] rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#EEF2FF] rounded-xl flex items-center justify-center">
                <Shield className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                <p className="text-xs text-[#4A5568]">אבטחה</p>
                <p className="text-lg font-bold text-[#0A2A43]">מלאה</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {supportCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Link
                key={index}
                to={card.link}
                className="relative bg-white border-2 border-[#E3E6EB] rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:border-[#1E63F0] transition-all group overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#1E63F0]/5 to-[#0099A8]/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform"></div>
                <div className="relative">
                  <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md`}>
                    <Icon className={`w-7 h-7 ${card.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-[#1A1F36] mb-2 group-hover:text-[#1E63F0] transition-colors">{card.title}</h3>
                  <p className="text-[#4A5568] leading-relaxed">{card.description}</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Support Bot */}
        <div className="bg-gradient-to-br from-white to-[#F8F9FB] border-2 border-[#E3E6EB] rounded-3xl overflow-hidden shadow-2xl mb-8">
          <div className="bg-gradient-to-r from-[#10B981] to-[#059669] px-6 sm:px-8 py-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">בוט תמיכה חכם</h2>
                  <p className="text-white/90">קבל תשובות מיידיות לשאלות נפוצות</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!showBot && (
                  <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-white">זמין כעת</span>
                  </div>
                )}
                {showBot && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowBot(false);
                      setBotMessages([]);
                    }}
                    className="text-white hover:bg-white/20"
                  >
                    סגור
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            {!showBot ? (
              <div className="text-center py-8">
                <p className="text-[#4A5568] mb-6">
                  לפני שאתה פונה לתמיכה האנושית, נסה לשאול את הבוט החכם שלנו - הוא זמין 24/7 ויכול לעזור בשאלות נפוצות
                </p>
                <Button
                  onClick={() => setShowBot(true)}
                  className="bg-[#10B981] hover:bg-[#059669] text-white"
                >
                  <MessageCircle className="w-5 h-5 ml-2" />
                  התחל שיחה עם הבוט
                </Button>
              </div>
            ) : (
              <div>
                {/* Chat Messages */}
                <div className="max-h-96 overflow-y-auto mb-4 space-y-4">
                  {botMessages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-[#E7F7ED] rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-[#10B981]" />
                      </div>
                      <h3 className="font-semibold text-[#1A1F36] mb-2">שלום! איך אוכל לעזור?</h3>
                      <p className="text-sm text-[#4A5568]">שאל אותי כל שאלה על הפלטפורמה</p>
                    </div>
                  )}
                  {botMessages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.role === "user"
                            ? "bg-[#2E6BDE] text-white"
                            : "bg-[#F8F9FB] text-[#1A1F36]"
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isBotThinking && (
                    <div className="flex justify-start">
                      <div className="bg-[#F8F9FB] rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 text-[#4A5568] animate-spin" />
                          <span className="text-sm text-[#4A5568]">הבוט חושב...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleBotQuestion} className="flex gap-2">
                  <Input
                    placeholder="הקלד את שאלתך כאן..."
                    value={userQuestion}
                    onChange={(e) => setUserQuestion(e.target.value)}
                    disabled={isBotThinking}
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isBotThinking || !userQuestion.trim()}
                    className="bg-[#10B981] hover:bg-[#059669] text-white"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>

                <p className="text-xs text-[#9CA3AF] text-center mt-4">
                  לא מצאת תשובה? גלול למטה לטופס יצירת הקשר עם התמיכה האנושית
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-[#2E6BDE] to-[#1D4ED8] px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">שלח לנו הודעה</h2>
                <p className="text-white/90 text-sm">נשיב לך תוך 24 שעות</p>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {isSent ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-[#E7F7ED] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-[#10B981]" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1F36] mb-2">ההודעה נשלחה בהצלחה!</h3>
                <p className="text-[#4A5568]">נציג שלנו יחזור אליך בהקדם</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#1A1F36] mb-2">
                      שם מלא
                    </label>
                    <Input
                      placeholder="הכנס את שמך"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1A1F36] mb-2">
                      אימייל
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1F36] mb-2">
                    נושא הפנייה
                  </label>
                  <Input
                    placeholder="על מה תרצה לדבר?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1A1F36] mb-2">
                    הודעה
                  </label>
                  <Textarea
                    placeholder="פרט את בקשתך או שאלתך..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSending}
                  className="w-full bg-[#2E6BDE] hover:bg-[#1D4ED8] text-white h-12 text-base font-semibold"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      שולח...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 ml-2" />
                      שלח הודעה
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Additional Contact Info */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-2 text-[#4A5568]">
            <Mail className="w-5 h-5" />
            <span>או שלח אימייל ישירות ל:</span>
            <a href="mailto:support@decifraai.app" className="text-[#2E6BDE] font-medium hover:underline">
              support@decifraai.app
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}