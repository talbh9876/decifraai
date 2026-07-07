import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Loader2, Minimize2 } from "lucide-react";

const InvokeLLM = base44.integrations.Core.InvokeLLM;

export default function DocumentChatbot({ document, isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "שלום! אני כאן כדי לעזור לך להבין את המסמך. שאל אותי כל שאלה על התוכן, הסיכונים, הזכויות או כל נושא אחר."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const context = `
מסמך: ${document.title}
סוג: ${document.document_type}
${document.ai_analysis?.summary ? `סיכום: ${document.ai_analysis.summary}` : ""}
`;

      const response = await InvokeLLM({
        prompt: `אתה עוזר משפטי מומחה. השתמש בהקשר הבא כדי לענות על שאלת המשתמש בעברית:

${context}

שאלת המשתמש: ${userMessage}

תן תשובה מדויקת, מקצועית וברורה. אם השאלה דורשת מידע שאין במסמך, ציין זאת בבירור.`,
        file_urls: document.file_url ? [document.file_url] : []
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: response || "מצטער, לא הצלחתי לענות על השאלה."
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "אירעה שגיאה. אנא נסה שוב."
      }]);
    }

    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-6 left-6 z-50 bg-white rounded-2xl shadow-2xl border border-[#E3E6EB] transition-all ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'
    } max-w-[calc(100vw-48px)] max-h-[calc(100vh-100px)]`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#E3E6EB] bg-gradient-to-r from-[#2E6BDE] to-[#1D4ED8] rounded-t-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">שאל על המסמך</h3>
            <p className="text-xs text-white/80">AI עוזר משפטי</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
          >
            <Minimize2 className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-140px)]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-[#2E6BDE] text-white'
                      : 'bg-[#F5F6F7] text-[#1A1F36]'
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#F5F6F7] text-[#1A1F36] p-3 rounded-2xl flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">מנתח...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-4 border-t border-[#E3E6EB]">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="שאל שאלה על המסמך..."
                className="flex-1 h-11 text-sm"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="h-11 px-4 bg-[#2E6BDE] hover:bg-[#1D4ED8] text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}