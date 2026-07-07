import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowRight, Eye } from "lucide-react";

export default function AccessibilityPage() {
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
              <Eye className="w-8 h-8 text-[#2E6BDE]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-[#1A1F36]">הצהרת נגישות</h1>
              <p className="text-[#4A5568] mt-2">עודכן לאחרונה: {new Date().toLocaleDateString('he-IL')}</p>
            </div>
          </div>

          <div className="prose prose-lg max-w-none space-y-6 text-[#4A5568]">
            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">מחויבות לנגישות</h2>
              <p>
                DECIFRA.AI מחויבת לספק שירות נגיש לכל המשתמשים, ללא קשר ליכולותיהם. 
                אנו שואפים להבטיח שהאתר והשירות שלנו יהיו נגישים לאנשים עם מוגבלויות, 
                בהתאם לתקנות שוויון זכויות לאנשים עם מוגבלות, התשנ"ח-1998 ותקן הנגישות הישראלי (ת"י 5568).
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">תכונות נגישות באתר</h2>
              <p>יישמנו מגוון תכונות נגישות באתר שלנו:</p>
              
              <h3 className="text-xl font-semibold text-[#1A1F36] mt-6 mb-3">ניווט במקלדת</h3>
              <ul className="list-disc pr-6 space-y-2">
                <li>כל הפונקציות באתר נגישות באמצעות מקלדת בלבד</li>
                <li>סדר מעבר לוגי בין רכיבי הדף (Tab Order)</li>
                <li>אפשרות לדלג על תפריט ניווט ולעבור ישירות לתוכן</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1A1F36] mt-6 mb-3">תצוגה ועיצוב</h3>
              <ul className="list-disc pr-6 space-y-2">
                <li>ניגודיות גבוהה בין טקסט לרקע</li>
                <li>אפשרות להגדלת טקסט ללא פגיעה בפונקציונליות</li>
                <li>עיצוב רספונסיבי המותאם למסכים שונים</li>
                <li>שימוש בפונטים ברורים וקריאים</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1A1F36] mt-6 mb-3">תוכן וסמנטיקה</h3>
              <ul className="list-disc pr-6 space-y-2">
                <li>כותרות מסודרות היררכית (H1, H2, H3...)</li>
                <li>תיוג נכון של שדות טפסים (Labels)</li>
                <li>טקסט חלופי לתמונות (Alt Text)</li>
                <li>שפה פשוטה ומובנת</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#1A1F36] mt-6 mb-3">תמיכה בטכנולוגיות מסייעות</h3>
              <ul className="list-disc pr-6 space-y-2">
                <li>תאימות עם קוראי מסך מובילים (JAWS, NVDA, VoiceOver)</li>
                <li>תמיכה בתוכנות הגדלה</li>
                <li>תמיכה בדיבור קולי</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">תקני נגישות</h2>
              <p>
                האתר שלנו פותח בהתאם לתקנים הבינלאומיים והישראליים:
              </p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>תקן WCAG 2.1 ברמה AA</li>
                <li>תקן ישראלי ת"י 5568</li>
                <li>תקנות שוויון זכויות לאנשים עם מוגבלות</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">בדיקות נגישות</h2>
              <p>
                אנו מבצעים בדיקות נגישות קבועות כדי לוודא שהאתר עומד בתקנים:
              </p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>בדיקות אוטומטיות באמצעות כלים מתקדמים</li>
                <li>בדיקות ידניות על ידי מומחי נגישות</li>
                <li>בדיקות עם משתמשים עם מוגבלויות</li>
                <li>עדכונים שוטפים לפי משוב המשתמשים</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">חסמי נגישות ידועים</h2>
              <p>
                למרות מאמצינו, ייתכן שקיימים עדיין חסמי נגישות מסוימים באתר:
              </p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>חלק מהמסמכים המועלים על ידי משתמשים עשויים שלא להיות נגישים</li>
                <li>תכונות מסוימות בגרסת המובייל עדיין בשלבי שיפור</li>
              </ul>
              <p className="mt-4">
                אנו עובדים באופן מתמיד לשיפור הנגישות ולהסרת חסמים אלו.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">הגדרות נגישות מומלצות</h2>
              <p>
                להלן הגדרות דפדפן מומלצות לחוויה נגישה:
              </p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>השתמשו בדפדפן עדכני (Chrome, Firefox, Safari, Edge)</li>
                <li>אפשרו JavaScript לפונקציונליות מלאה</li>
                <li>התאימו את גודל הטקסט לנוחותכם</li>
                <li>הפעילו מצב ניגודיות גבוהה במידת הצורך</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">דרכי גישה חלופיות</h2>
              <p>
                אם אתם נתקלים בקשיים בגישה לשירות, זמינות עבורכם דרכים חלופיות:
              </p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>
                  שירות לקוחות טלפוני:{' '}
                  <a href="tel:03-1234567" className="text-[#2E6BDE] hover:underline">
                    03-1234567
                  </a>
                </li>
                <li>
                  תמיכה במייל:{' '}
                  <a href="mailto:accessibility@decifra.ai" className="text-[#2E6BDE] hover:underline">
                    accessibility@decifra.ai
                  </a>
                </li>
                <li>
                  פנייה דרך{' '}
                  <Link to={createPageUrl("Support")} className="text-[#2E6BDE] hover:underline">
                    עמוד התמיכה
                  </Link>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">משוב ותלונות</h2>
              <p>
                המשוב שלכם חשוב לנו ומסייע לנו לשפר את הנגישות באתר. אם נתקלתם 
                בבעיית נגישות או יש לכם הצעות לשיפור, אנא פנו אלינו:
              </p>
              <ul className="list-none mt-4 space-y-2">
                <li>
                  <strong>רכז נגישות:</strong> ישראל ישראלי
                </li>
                <li>
                  <strong>אימייל:</strong>{' '}
                  <a href="mailto:accessibility@decifra.ai" className="text-[#2E6BDE] hover:underline">
                    accessibility@decifra.ai
                  </a>
                </li>
                <li>
                  <strong>טלפון:</strong>{' '}
                  <a href="tel:03-1234567" className="text-[#2E6BDE] hover:underline">
                    03-1234567
                  </a>
                </li>
              </ul>
              <p className="mt-4">
                אנו מתחייבים להגיב לפניות תוך 5 ימי עסקים ולפעול לפתרון הבעיה במהירות האפשרית.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">שיפורים עתידיים</h2>
              <p>
                אנו ממשיכים לעבוד על שיפור הנגישות באופן מתמיד. בין השיפורים המתוכננים:
              </p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>שיפור נגישות המסמכים המיוצאים מהמערכת</li>
                <li>הוספת תמיכה בשפות נוספות</li>
                <li>שיפור חוויית המשתמש עם קוראי מסך</li>
                <li>הרחבת אפשרויות ההתאמה האישית</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">מידע נוסף</h2>
              <p>
                למידע נוסף על נגישות דיגיטלית בישראל:
              </p>
              <ul className="list-disc pr-6 mt-4 space-y-2">
                <li>
                  <a 
                    href="https://www.gov.il/he/departments/topics/digital_accessibility" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#2E6BDE] hover:underline"
                  >
                    אתר נגישות ממשלת ישראל
                  </a>
                </li>
                <li>
                  <a 
                    href="https://www.w3.org/WAI/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#2E6BDE] hover:underline"
                  >
                    W3C Web Accessibility Initiative
                  </a>
                </li>
              </ul>
            </section>

            <section className="bg-[#EBF2FE] rounded-xl p-6 mt-8">
              <p className="text-center font-medium text-[#1A1F36]">
                הצהרת נגישות זו עודכנה לאחרונה ב-{new Date().toLocaleDateString('he-IL')} 
                ונבדקת ומתעדכנת באופן קבוע.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}