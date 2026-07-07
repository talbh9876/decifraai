import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Shield } from "lucide-react";

export default function PrivacyPage() {
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
            <div className="w-16 h-16 bg-[#E7F7ED] rounded-xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-[#10B981]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1A1F36]">מדיניות פרטיות</h1>
              <p className="text-[#4A5568] mt-2">עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-6 text-[#4A5568]">
            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">1. מבוא</h2>
              <p>
                ב-DecifraAI אנו מתחייבים להגן על פרטיותכם ולשמור על אבטחת המידע שלכם. 
                מדיניות פרטיות זו מסבירה איזה מידע אנו אוספים, כיצד אנו משתמשים בו ואיך אנו מגינים עליו.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">2. מידע שאנו אוספים</h2>
              
              <h3 className="text-xl font-semibold text-[#1A1F36] mt-6 mb-3">2.1 מידע אישי</h3>
              <ul className="list-disc pr-6 space-y-2">
                <li>שם מלא</li>
                <li>כתובת דואר אלקטרוני</li>
                <li>מספר טלפון (אופציונלי)</li>
                <li>פרטי תשלום (מוצפנים ומאוחסנים אצל ספקי תשלום חיצוניים)</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1A1F36] mt-6 mb-3">2.2 מידע טכני</h3>
              <ul className="list-disc pr-6 space-y-2">
                <li>כתובת IP</li>
                <li>סוג דפדפן ומערכת הפעלה</li>
                <li>נתוני שימוש ופעילות באתר</li>
                <li>Cookies ונתוני מעקב דומים</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1A1F36] mt-6 mb-3">2.3 מסמכים</h3>
              <p>
                המסמכים שאתם מעלים לניתוח נשמרים בצורה מוצפנת ונגישים רק לכם ולמערכות 
                הניתוח האוטומטיות שלנו.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">3. שימוש במידע</h2>
              <p>אנו משתמשים במידע שאנו אוספים למטרות הבאות:</p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>מתן וניהול השירות שלנו</li>
                <li>ניתוח והבנה של המסמכים שהעליתם</li>
                <li>שיפור ופיתוח של השירות והאלגוריתמים</li>
                <li>תקשורת איתכם לגבי החשבון והשירות</li>
                <li>מניעת הונאות ושמירה על אבטחת המערכת</li>
                <li>עמידה בדרישות חוקיות</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">4. שיתוף מידע עם צדדים שלישיים</h2>
              <p>אנו <strong>לא</strong> מוכרים את המידע האישי שלכם. אנו עשויים לשתף מידע עם:</p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>ספקי שירות (כגון אחסון בענן, עיבוד תשלומים) שפועלים מטעמנו</li>
                <li>רשויות אכיפת חוק, במידת הצורך על פי דין</li>
                <li>עורכי דין שאתם מבקשים לשתף איתם מסמכים דרך השירות</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">5. אבטחת מידע</h2>
              <p>אנו נוקטים אמצעים חשובים להגנה על המידע שלכם:</p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>הצפנה של כל המידע בעת העברה (SSL/TLS)</li>
                <li>הצפנה של מסמכים באחסון</li>
                <li>גישה מוגבלת למידע רק לעובדים שצריכים אותו לצורך עבודתם</li>
                <li>בדיקות אבטחה תקופתיות</li>
                <li>גיבויים קבועים</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">6. זכויותיכם</h2>
              <p>יש לכם מספר זכויות ביחס למידע האישי שלכם:</p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li><strong>זכות עיון:</strong> לצפות במידע שיש לנו עליכם</li>
                <li><strong>זכות לתיקון:</strong> לבקש תיקון מידע שגוי</li>
                <li><strong>זכות למחיקה:</strong> לבקש מחיקת המידע שלכם</li>
                <li><strong>זכות להגבלת עיבוד:</strong> להגביל את השימוש במידע שלכם</li>
                <li><strong>זכות להעברת מידע:</strong> לקבל העתק של המידע שלכם</li>
              </ul>
              <p className="mt-4">
                ליישום זכויות אלו, ניתן לפנות אלינו דרך{' '}
                <Link to={createPageUrl("Support")} className="text-[#2E6BDE] hover:underline">
                  עמוד התמיכה
                </Link>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">7. Cookies ומעקב</h2>
              <p>
                אנו משתמשים ב-Cookies ובטכנולוגיות דומות כדי לשפר את חוויית המשתמש, 
                לנתח את השימוש באתר ולספק תוכן מותאם אישית.
              </p>
              <p className="mt-4">
                באפשרותכם לשלוט בהגדרות ה-Cookies דרך הדפדפן שלכם, אך חלק מתכונות 
                השירות עשויות שלא לפעול כראוי ללא Cookies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">8. שמירת מידע</h2>
              <p>
                אנו שומרים את המידע האישי שלכם כל עוד יש לכם חשבון פעיל או כפי שנדרש 
                למתן השירות. לאחר מחיקת החשבון, נמחק את המידע בהתאם לדרישות החוק.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">9. קטינים</h2>
              <p>
                השירות שלנו מיועד למבוגרים בני 18 ומעלה. איננו אוספים במכוון מידע מקטינים 
                מתחת לגיל 18. אם התברר לנו שאספנו מידע מקטין, נמחק אותו מיד.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">10. שינויים במדיניות</h2>
              <p>
                אנו עשויים לעדכן מדיניות פרטיות זו מעת לעת. שינויים משמעותיים יובאו 
                לידיעתכם באמצעות אימייל או הודעה במערכת.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">11. יצירת קשר</h2>
              <p>
                לשאלות או חששות בנוגע למדיניות הפרטיות שלנו, אנא צרו קשר:
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li>
                  דרך{' '}
                  <Link to={createPageUrl("Support")} className="text-[#2E6BDE] hover:underline">
                    עמוד התמיכה
                  </Link>
                </li>
                <li>
                  במייל:{' '}
                  <a href="mailto:privacy@decifraai.app" className="text-[#2E6BDE] hover:underline">
                    privacy@decifraai.app
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}