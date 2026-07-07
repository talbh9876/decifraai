import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Settings, X, Bell, BellOff } from "lucide-react";

export default function NotificationSettings({ user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    documentAnalyzed: { enabled: true, frequency: "immediate" },
    lawyerReview: { enabled: true, frequency: "immediate" },
    statusChange: { enabled: true, frequency: "immediate" },
    systemUpdates: { enabled: false, frequency: "weekly" }
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user?.notificationSettings) {
      setSettings(user.notificationSettings);
    }
  }, [user]);

  const handleToggle = (type) => {
    setSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], enabled: !prev[type].enabled }
    }));
  };

  const handleFrequencyChange = (type, frequency) => {
    setSettings(prev => ({
      ...prev,
      [type]: { ...prev[type], frequency }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await base44.auth.updateMe({ notificationSettings: settings });
    } catch (error) {
      console.error("Error saving notification settings:", error);
    }
    setIsSaving(false);
    setIsOpen(false);
  };

  if (!user) return null;

  const notificationTypes = [
    { key: "documentAnalyzed", label: "מסמך נותח", description: "התראה כאשר ניתוח מסמך הושלם" },
    { key: "lawyerReview", label: "תגובת עורך דין", description: "התראה כאשר עורך דין סיים ביקורת" },
    { key: "statusChange", label: "שינוי סטטוס", description: "התראה על שינויים במסמכים" },
    { key: "systemUpdates", label: "עדכוני מערכת", description: "חדשות ועדכונים מהמערכת" }
  ];

  const frequencies = [
    { value: "immediate", label: "מיידי" },
    { value: "daily", label: "יומי" },
    { value: "weekly", label: "שבועי" }
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-lg hover:bg-[#F8F9FB] transition-colors"
        title="הגדרות התראות"
      >
        <Settings className="w-5 h-5 text-[#4A5568]" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="fixed inset-0 bg-white/30 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#E3E6EB] px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-[#1A1F36]">הגדרות התראות</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-[#F8F9FB] transition-colors"
              >
                <X className="w-5 h-5 text-[#4A5568]" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {notificationTypes.map((type) => (
                <div key={type.key} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {settings[type.key].enabled ? (
                          <Bell className="w-4 h-4 text-[#10B981]" />
                        ) : (
                          <BellOff className="w-4 h-4 text-[#9CA3AF]" />
                        )}
                        <h4 className="font-semibold text-[#1A1F36]">{type.label}</h4>
                      </div>
                      <p className="text-sm text-[#4A5568]">{type.description}</p>
                    </div>
                    <button
                      onClick={() => handleToggle(type.key)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings[type.key].enabled ? "bg-[#10B981]" : "bg-[#E3E6EB]"
                      }`}
                    >
                      <div
                        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          settings[type.key].enabled ? "translate-x-6" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>

                  {settings[type.key].enabled && (
                    <div className="mr-6">
                      <label className="block text-xs font-medium text-[#4A5568] mb-2">תדירות</label>
                      <div className="flex gap-2">
                        {frequencies.map((freq) => (
                          <button
                            key={freq.value}
                            onClick={() => handleFrequencyChange(type.key, freq.value)}
                            className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              settings[type.key].frequency === freq.value
                                ? "bg-[#2E6BDE] text-white"
                                : "bg-[#F8F9FB] text-[#4A5568] hover:bg-[#E3E6EB]"
                            }`}
                          >
                            {freq.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="h-px bg-[#E3E6EB]" />
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-white border-t border-[#E3E6EB] px-6 py-4 flex gap-3">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="flex-1 border-[#E3E6EB] text-[#4A5568]"
              >
                ביטול
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-[#2E6BDE] hover:bg-[#1D4ED8] text-white"
              >
                {isSaving ? "שומר..." : "שמור"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}