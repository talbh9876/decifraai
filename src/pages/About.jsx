import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Scale, Shield, Zap, Users, ArrowLeft } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-[#F8F9FB] py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl lg:text-5xl font-bold text-[#1A1F36] mb-6">
            על DecifraAI – העתיד של הבנת מסמכים משפטיים
          </h1>
          <p className="text-xl text-[#4A5568] leading-relaxed">
            פלטפורמת LegalTech מתקדמת שמאפשרת לכל אדם להבין מסמכים משפטיים בצורה פשוטה, ברורה ומהירה — ללא צורך ברקע משפטי.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[#EBF2FE] rounded-2xl p-8 lg:p-12">
            <h2 className="text-3xl font-bold text-[#1A1F36] mb-6">מה אנחנו עושים?</h2>
            <p className="text-lg text-[#4A5568] leading-relaxed mb-6">
              DecifraAI היא פלטפורמת LegalTech מתקדמת שמאפשרת לכל אדם להבין מסמכים משפטיים בצורה פשוטה, ברורה ומהירה — ללא צורך ברקע משפטי.
            </p>
            <p className="text-lg text-[#4A5568] leading-relaxed mb-6">
              המערכת מנתחת מסמכים כגון חוזים, תלושי שכר, מכתבים רשמיים ועוד, ומציגה פירוק מיידי של התוכן, הדגשת נקודות חשובות, תובנות ומידע קריטי – כדי לאפשר למשתמש להבין מה באמת כתוב.
            </p>
            <p className="text-lg text-[#4A5568] leading-relaxed">
              אנו מאמינים ששקיפות משפטית צריכה להיות זמינה לכולם, לא רק לעורכי דין.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-[#F8F9FB]">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-[#1A1F36] text-center mb-12">הערכים שלנו</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Scale,
                title: "שקיפות משפטית",
                desc: "הבנה ברורה של כל מסמך משפטי"
              },
              {
                icon: Shield,
                title: "אבטחה מלאה",
                desc: "הצפנה והגנה על כל המידע"
              },
              {
                icon: Zap,
                title: "מהירות וביצועים",
                desc: "תוצאות מיידיות תוך שניות"
              },
              {
                icon: Users,
                title: "נגישות לכולם",
                desc: "ללא צורך בידע משפטי מקצועי"
              }
            ].map((value, index) => (
              <div key={index} className="bg-white border border-[#E3E6EB] rounded-xl p-6 text-center">
                <div className="w-14 h-14 bg-[#EBF2FE] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-7 h-7 text-[#2E6BDE]" />
                </div>
                <h3 className="text-lg font-bold text-[#1A1F36] mb-2">{value.title}</h3>
                <p className="text-[#4A5568] text-sm">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-[#FEF3E2] border-2 border-[#F59E0B] rounded-2xl p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-[#1A1F36] mb-4">חשוב לדעת</h2>
            <p className="text-lg text-[#4A5568] leading-relaxed">
              <strong>DecifraAI אינה מספקת ייעוץ משפטי ואינה מחליפה עורך דין.</strong> כל תוצאה היא פרשנות אוטומטית בלבד, והאחריות הבלעדית לשימוש במידע היא על המשתמש.
            </p>
            <p className="text-lg text-[#4A5568] leading-relaxed mt-4">
              אנו ממליצים תמיד להתייעץ עם עורך דין מוסמך לפני קבלת החלטות משפטיות חשובות.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-[#2E6BDE] to-[#1D4ED8]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            מוכנים להתחיל?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            הצטרפו אלינו והתחילו להבין את המסמכים שלכם היום
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to={createPageUrl("Signup")}>
              <Button className="bg-white hover:bg-gray-100 text-[#2E6BDE] px-8 py-6 text-lg font-semibold">
                צור חשבון בחינם
                <ArrowLeft className="w-5 h-5 mr-2" />
              </Button>
            </Link>
            <Link to={createPageUrl("Home")}>
              <Button variant="outline" className="border-2 border-blue text-blue hover:bg-blue/10 px-8 py-6 text-lg font-semibold">
                חזרה לדף הבית
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}