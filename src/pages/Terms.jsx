import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link 
          to={createPageUrl("Home")} 
          className="inline-flex items-center gap-2 text-[#4A5568] hover:text-[#2E6BDE] mb-8 transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזרה לדף הבית</span>
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-[#EBF2FE] rounded-xl flex items-center justify-center">
              <FileText className="w-8 h-8 text-[#2E6BDE]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1A1F36]">תנאי שימוש</h1>
              <p className="text-[#4A5568] mt-2">עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-6 text-[#4A5568]">
            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">1. קבלת התנאים</h2>
              <p>
                ברוכים הבאים ל-DecifraAI. על ידי גישה לפלטפורמה שלנו ושימוש בה, אתם מסכימים 
                לתנאי השימוש המפורטים להלן. אם אינכם מסכימים לתנאים אלו, אנא אל תשתמשו בשירות.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">2. תיאור השירות</h2>
              <p>
                DecifraAI מספקת פלטפורמה מבוססת בינה מלאכותית לניתוח מסמכים משפטיים. 
                השירות כולל ניתוח אוטומטי, זיהוי סיכונים, תרגום למושגים פשוטים ועוד.
              </p>
              <p className="mt-4">
                <strong>חשוב לציין:</strong> השירות מספק ניתוח אוטומטי בלבד ואינו מהווה ייעוץ משפטי. 
                תמיד מומלץ להתייעץ עם עורך דין מוסמך בנוגע למסמכים משפטיים.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">3. חשבון משתמש</h2>
              <p>
                כדי להשתמש בשירות, עליכם ליצור חשבון משתמש. אתם אחראים לשמירה על סודיות 
                פרטי ההתחברות שלכם ולכל הפעילות המתבצעת תחת החשבון.
              </p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>עליכם לספק מידע מדויק ועדכני בעת ההרשמה</li>
                <li>אסור לשתף את פרטי ההתחברוש שלכם עם אחרים</li>
                <li>יש לעדכן אותנו מיד במקרה של שימוש לא מורשה בחשבון</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">4. מדיניות תשלום</h2>
              <p>
                השירות מוצע במספר תוכניות מנוי. התשלום מתבצע באמצעות כרטיס אשראי דרך 
                מערכת תשלומים מאובטחת.
              </p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>החיוב מתבצע מדי חודש או שנה, בהתאם לתוכנית שנבחרה</li>
                <li>ניתן לבטל את המנוי בכל עת דרך הגדרות החשבון</li>
                <li>לא מוענק החזר כספי על תקופות ששולמו מראש</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">5. שימוש מותר</h2>
              <p>אתם מתחייבים להשתמש בשירות אך ורק למטרות חוקיות. אסור:</p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>להעלות תוכן בלתי חוקי, מעליב או מזיק</li>
                <li>לנסות לפרוץ למערכת או להפריע לפעילותה</li>
                <li>להעתיק או להפיץ את התוכן או הטכנולוגיה של השירות</li>
                <li>להשתמש בשירות במטרה להטעות או לרמות</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">6. קניין רוחני</h2>
              <p>
                כל התוכן, הקוד, העיצוב והטכנולוגיה של DecifraAI הם קניינה הבלעדי של החברה 
                ומוגנים בזכויות יוצרים ופטנטים.
              </p>
              <p className="mt-4">
                המסמכים שאתם מעלים נשארים בבעלותכם, אך אתם מעניקים לנו רשות להשתמש בהם 
                לצורך מתן השירות ושיפורו.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">7. אחריות ושיפוי</h2>
              <p>
                DecifraAI מסופקת "כמות שהיא" (AS IS). איננו מתחייבים לדיוק מוחלט של הניתוח 
                ואיננו אחראים לנזקים הנובעים משימוש בשירות.
              </p>
              <p className="mt-4">
                השימוש בשירות הוא באחריותכם הבלעדית. מומלץ להתייעץ עם איש מקצוע לפני 
                קבלת החלטות על בסיס הניתוח.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">8. שינויים בתנאים</h2>
              <p>
                אנו שומרים את הזכות לעדכן את תנאי השימוש מעת לעת. שינויים משמעותיים 
                יובאו לידיעתכם באמצעות אימייל או הודעה במערכת.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">9. סיום השירות</h2>
              <p>
                אנו שומרים את הזכות להפסיק את גישתכם לשירות בכל עת, במיוחד במקרה של 
                הפרת תנאי השימוש.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">10. יצירת קשר</h2>
              <p>
                לשאלות או הבהרות בנוגע לתנאי השימוש, ניתן ליצור קשר דרך{' '}
                <Link to={createPageUrl("Support")} className="text-[#2E6BDE] hover:underline">
                  עמוד התמיכה
                </Link>
                {' '}או במייל{' '}
                <a href="mailto:support@decifraai.app" className="text-[#2E6BDE] hover:underline">
                  support@decifraai.app
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}