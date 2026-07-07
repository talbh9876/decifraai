import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Bell, Check, AlertTriangle, FileText, Scale } from "lucide-react";

const Users = base44.entities.Users;

export default function CustomAlerts({ user }) {
  const [settings, setSettings] = useState({
    highRiskAlert: true,
    analysisCompleteAlert: true,
    lawyerResponseAlert: true,
    weeklyDigest: false
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.alertSettings) {
      setSettings({ ...settings, ...user.alertSettings });
    }
  }, [user]);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Users.update(user.id, {
        alertSettings: settings
      });
      
      // Show success feedback
      setTimeout(() => setIsSaving(false), 500);
    } catch (error) {
      console.error("Error saving alert settings:", error);
      setIsSaving(false);
    }
  };

  const alertOptions = [
    {
      key: "highRiskAlert",
      icon: AlertTriangle,
      title: "סיכון גבוה זוהה",
      description: "קבל התראה כאשר מסמך עם סיכון גבוה מזוהה",
      color: "text-[#EF4444]",
      bg: "bg-[#FEE2E2]"
    },
    {
      key: "analysisCompleteAlert",
      icon: FileText,
      title: "ניתוח הושלם",
      description: "קבל התראה כאשר ניתוח מסמך מסתיים",
      color: "text-[#10B981]",
      bg: "bg-[#E7F7ED]"
    },
    {
      key: "lawyerResponseAlert",
      icon: Scale,
      title: "תגובת עורך דין",
      description: "קבל התראה כאשר עורך דין משיב למסמך שלך",
      color: "text-[#2E6BDE]",
      bg: "bg-[#EBF2FE]"
    },
    {
      key: "weeklyDigest",
      icon: Bell,
      title: "סיכום שבועי",
      description: "קבל סיכום שבועי של כל המסמכים והפעילות",
      color: "text-[#F59E0B]",
      bg: "bg-[#FEF3E2]"
    }
  ];

  return (
    <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#2E6BDE]" />
          <h3 className="font-bold text-[#1A1F36]">התראות מותאמות אישית</h3>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
          className="bg-[#2E6BDE] hover:bg-[#1D4ED8] text-white"
        >
          {isSaving ? (
            <>
              <Check className="w-4 h-4 ml-1" />
              נשמר
            </>
          ) : (
            "שמור הגדרות"
          )}
        </Button>
      </div>

      <div className="space-y-3">
        {alertOptions.map((option) => {
          const Icon = option.icon;
          const isEnabled = settings[option.key];
          
          return (
            <div
              key={option.key}
              className={`flex items-start gap-4 p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isEnabled 
                  ? 'border-[#2E6BDE] bg-[#EBF2FE]' 
                  : 'border-[#E3E6EB] bg-white hover:bg-[#F8F9FB]'
              }`}
              onClick={() => handleToggle(option.key)}
            >
              <div className={`w-10 h-10 ${option.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${option.color}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[#1A1F36] mb-1">{option.title}</h4>
                <p className="text-sm text-[#4A5568]">{option.description}</p>
              </div>
              <div className="flex-shrink-0">
                <div className={`w-12 h-6 rounded-full transition-colors ${
                  isEnabled ? 'bg-[#2E6BDE]' : 'bg-[#E3E6EB]'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full mt-0.5 transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-[#F8F9FB] rounded-lg">
        <p className="text-xs text-[#4A5568]">
          💡 <strong>טיפ:</strong> התראות נשלחות באימייל ומופיעות גם בפעמון ההתראות בתפריט העליון
        </p>
      </div>
    </div>
  );
}