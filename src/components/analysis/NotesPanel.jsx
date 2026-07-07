import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StickyNote, Plus, X, Save } from "lucide-react";

export default function NotesPanel({ document, onSaveNote, activeTab }) {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!newNote.trim()) return;
    
    setIsSaving(true);
    await onSaveNote({
      section: getSectionLabel(activeTab),
      note: newNote.trim(),
      timestamp: new Date().toISOString()
    });
    setNewNote("");
    setIsAddingNote(false);
    setIsSaving(false);
  };

  const getSectionLabel = (tabId) => {
    const labels = {
      executive: "סיכום מנהלים",
      summary: "תקציר משפטי",
      legal_terms: "מושגים משפטיים",
      rights: "זכויות",
      obligations: "חובות",
      risks: "סיכונים",
      financial: "כספים",
      dates: "תאריכים",
      compensation: "פיצויים",
      liability: "אחריות משפטית",
      noncompete: "אי-תחרות",
      limitation: "הגבלת אחריות",
      termination: "סיום חוזה"
    };
    return labels[tabId] || tabId;
  };

  const sectionNotes = document.user_notes?.filter(note => 
    note.section === getSectionLabel(activeTab)
  ) || [];

  return (
    <div className="bg-[#FEF3E2] border border-[#F59E0B]/30 rounded-xl p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StickyNote className="w-5 h-5 text-[#F59E0B]" />
          <h3 className="font-semibold text-[#1A1F36]">הערות על סעיף זה</h3>
        </div>
        {!isAddingNote && (
          <Button
            onClick={() => setIsAddingNote(true)}
            size="sm"
            variant="outline"
            className="border-[#F59E0B] text-[#F59E0B] hover:bg-[#F59E0B] hover:text-white"
          >
            <Plus className="w-4 h-4 ml-1" />
            הוסף הערה
          </Button>
        )}
      </div>

      {/* Existing Notes */}
      {sectionNotes.length > 0 && (
        <div className="space-y-2 mb-3">
          {sectionNotes.map((note, index) => (
            <div key={index} className="bg-white border border-[#E3E6EB] rounded-lg p-3">
              <p className="text-sm text-[#4A5568]">{note.note}</p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                {new Date(note.timestamp).toLocaleDateString('he-IL', { 
                  day: 'numeric', 
                  month: 'long', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add Note Form */}
      {isAddingNote && (
        <div className="bg-white border border-[#E3E6EB] rounded-lg p-3">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="כתבו את ההערה שלכם כאן..."
            className="min-h-[80px] mb-2"
          />
          <div className="flex gap-2 justify-end">
            <Button
              onClick={() => {
                setIsAddingNote(false);
                setNewNote("");
              }}
              size="sm"
              variant="outline"
              className="border-[#E3E6EB]"
            >
              <X className="w-4 h-4 ml-1" />
              ביטול
            </Button>
            <Button
              onClick={handleSave}
              disabled={!newNote.trim() || isSaving}
              size="sm"
              className="bg-[#F59E0B] hover:bg-[#D97706] text-white"
            >
              {isSaving ? (
                "שומר..."
              ) : (
                <>
                  <Save className="w-4 h-4 ml-1" />
                  שמור
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {sectionNotes.length === 0 && !isAddingNote && (
        <p className="text-sm text-[#9CA3AF] text-center py-2">
          אין הערות עדיין. לחצו על "הוסף הערה" להוספת הערות אישיות.
        </p>
      )}
    </div>
  );
}