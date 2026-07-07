import React, { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { ChevronDown, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const { language, isRTL } = useTheme();
  const [openIndex, setOpenIndex] = useState(null);

  const faqData = {
    he: {
      title: "שאלות נפוצות",
      subtitle: "מצאו תשובות לשאלות הנפוצות ביותר",
      questions: [
        {
          q: "מהו DecifraAI?",
          a: "DecifraAI הוא כלי מבוסס בינה מלאכותית לניתוח מסמכים משפטיים. המערכת מאפשרת להבין חוזים, תלושי שכר, הסכמי שכירות ומסמכים משפטיים נוספים בשפה פשוטה וברורה."
        },
        {
          q: "אילו סוגי מסמכים אפשר לנתח?",
          a: "ניתן לנתח מגוון רחב של מסמכים משפטיים כולל: חוזי עבודה, הסכמי שכירות, תלושי שכר, פוליסות ביטוח, הסכמי הלוואה, חוזי רכישה ועוד."
        },
        {
          q: "האם המידע שלי מאובטח?",
          a: "בהחלט. כל המסמכים מוצפנים באמצעות הצפנה מתקדמת ואנחנו לא משתפים את המידע שלכם עם גורמים חיצוניים."
        },
        {
          q: "מה ההבדל בין המסלול הבסיסי לפרימיום?",
          a: "המסלול הבסיסי מאפשר ניתוח AI אוטומטי של מסמכים. מסלול הפרימיום מוסיף גישה לעורכי דין מקצועיים שיכולים לבדוק את המסמך ולתת חוות דעת משפטית מקצועית."
        },
        {
          q: "כמה זמן לוקח לנתח מסמך?",
          a: "ניתוח AI אוטומטי לוקח בדרך כלל פחות מדקה. חוות דעת של עורך דין עשויה לקחת בין יום עבודה לשלושה ימים."
        },
        {
          q: "אילו פורמטים נתמכים?",
          a: "המערכת תומכת בקבצי PDF, תמונות (JPG, PNG) ומסמכי Word. גודל הקובץ המקסימלי הוא 10MB."
        }
      ]
    },
    en: {
      title: "Frequently Asked Questions",
      subtitle: "Find answers to the most common questions",
      questions: [
        {
          q: "What is DecifraAI?",
          a: "DecifraAI is an AI-powered tool for analyzing legal documents. The system helps you understand contracts, payslips, rental agreements, and other legal documents in simple, clear language."
        },
        {
          q: "What types of documents can be analyzed?",
          a: "You can analyze a wide variety of legal documents including: employment contracts, rental agreements, payslips, insurance policies, loan agreements, purchase contracts, and more."
        },
        {
          q: "Is my information secure?",
          a: "Absolutely. All documents are encrypted using advanced encryption, and we never share your information with external parties."
        },
        {
          q: "What's the difference between basic and premium plans?",
          a: "The basic plan provides automatic AI analysis of documents. The premium plan adds access to professional lawyers who can review your document and provide professional legal opinions."
        },
        {
          q: "How long does it take to analyze a document?",
          a: "Automatic AI analysis typically takes less than a minute. A lawyer's opinion may take between one to three business days."
        },
        {
          q: "What file formats are supported?",
          a: "The system supports PDF files, images (JPG, PNG), and Word documents. Maximum file size is 10MB."
        }
      ]
    }
  };

  const content = faqData[language] || faqData.he;

  return (
    <div className="min-h-screen bg-[#F5F6F7] p-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-[#1C3D5A]/10 rounded-2xl flex items-center justify-center">
            <HelpCircle className="w-8 h-8 text-[#1C3D5A]" />
          </div>
          <h1 className="text-2xl font-bold text-[#0F1E2E] mb-2">{content.title}</h1>
          <p className="text-[#5A6B7D]">{content.subtitle}</p>
        </div>

        <div className="space-y-3">
          {content.questions.map((item, index) => (
            <div 
              key={index}
              className="bg-white border border-[#E5E8EB] rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className={`w-full p-5 flex items-center justify-between text-${isRTL ? 'right' : 'left'} hover:bg-[#F5F6F7] transition-colors`}
              >
                <span className="font-medium text-[#0F1E2E]">{item.q}</span>
                <ChevronDown 
                  className={`w-5 h-5 text-[#5A6B7D] transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 border-t border-[#E5E8EB]">
                  <p className="pt-4 text-sm text-[#5A6B7D] leading-relaxed">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}