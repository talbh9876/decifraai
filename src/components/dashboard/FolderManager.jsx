import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { 
  Folder, 
  FolderPlus, 
  Edit2, 
  Trash2, 
  Check, 
  X,
  MoreVertical,
  FolderOpen
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const FolderEntity = base44.entities.Folder;

export default function FolderManager({ folders, selectedFolder, onFolderSelect, onFoldersChange }) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [selectedColor, setSelectedColor] = useState("blue");

  const colors = {
    blue: { bg: "bg-[#EBF2FE]", text: "text-[#2E6BDE]", border: "border-[#2E6BDE]" },
    green: { bg: "bg-[#E7F7ED]", text: "text-[#10B981]", border: "border-[#10B981]" },
    red: { bg: "bg-[#FEE2E2]", text: "text-[#EF4444]", border: "border-[#EF4444]" },
    yellow: { bg: "bg-[#FEF3E2]", text: "text-[#F59E0B]", border: "border-[#F59E0B]" },
    purple: { bg: "bg-[#EEF2FF]", text: "text-[#8B5CF6]", border: "border-[#8B5CF6]" },
    pink: { bg: "bg-[#FCE7F3]", text: "text-[#EC4899]", border: "border-[#EC4899]" },
    gray: { bg: "bg-[#F3F4F6]", text: "text-[#6B7280]", border: "border-[#6B7280]" }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      const authUser = await base44.auth.me();
      const userId = authUser?.id || authUser?.user_id;
      
      if (!userId) {
        alert("לא ניתן לזהות משתמש. אנא נסה להתחבר מחדש.");
        return;
      }
      
      const newFolder = await FolderEntity.create({
        name: newFolderName.trim(),
        ownerAuthId: userId,
        color: selectedColor,
        icon: "folder"
      });
      
      // Reload folders from database to ensure we have the latest
      const allFolders = await FolderEntity.list("name", 100);
      onFoldersChange(allFolders);
      
      setNewFolderName("");
      setSelectedColor("blue");
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert(`שגיאה ביצירת תיקייה: ${error.message || 'שגיאה לא ידועה'}`);
    }
  };

  const handleRenameFolder = async (folderId) => {
    if (!editingName.trim()) return;
    
    try {
      await FolderEntity.update(folderId, { name: editingName.trim() });
      const updatedFolders = folders.map(f => 
        f.id === folderId ? { ...f, name: editingName.trim() } : f
      );
      onFoldersChange(updatedFolders);
      setEditingFolderId(null);
      setEditingName("");
    } catch (error) {
      console.error("Error renaming folder:", error);
      alert("שגיאה בשינוי שם תיקייה");
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק תיקייה זו? המסמכים יועברו לתיקייה הראשית.")) return;
    
    try {
      // Move documents out of folder first
      const Document = base44.entities.Document;
      const docsInFolder = await Document.filter({ folderId });
      
      for (const doc of docsInFolder) {
        await Document.update(doc.id, { folderId: null });
      }
      
      await FolderEntity.delete(folderId);
      const updatedFolders = folders.filter(f => f.id !== folderId);
      onFoldersChange(updatedFolders);
      
      if (selectedFolder === folderId) {
        onFolderSelect(null);
      }
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("שגיאה במחיקת תיקייה");
    }
  };

  return (
    <div className="bg-white border border-[#E3E6EB] rounded-xl p-4 shadow-sm mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-[#2E6BDE]" />
          <h3 className="font-bold text-[#1A1F36]">תיקיות</h3>
        </div>
        <Button
          onClick={() => setIsCreating(true)}
          size="sm"
          variant="outline"
          className="border-[#2E6BDE] text-[#2E6BDE] hover:bg-[#EBF2FE]"
        >
          <FolderPlus className="w-4 h-4 ml-1" />
          תיקייה חדשה
        </Button>
      </div>

      {/* All Documents (no folder) */}
      <button
        onClick={() => onFolderSelect(null)}
        className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-2 ${
          selectedFolder === null
            ? 'bg-[#EBF2FE] border-2 border-[#2E6BDE]'
            : 'hover:bg-[#F8F9FB] border-2 border-transparent'
        }`}
      >
        <div className="w-8 h-8 bg-[#EBF2FE] rounded-lg flex items-center justify-center">
          <Folder className="w-4 h-4 text-[#2E6BDE]" />
        </div>
        <span className="font-medium text-[#1A1F36]">כל המסמכים</span>
      </button>

      {/* Folder List */}
      {folders.length === 0 ? (
        <div className="text-xs text-[#6B7280] px-1 pb-2">אין תיקיות עדיין. ניתן ליצור תיקיה חדשה באמצעות הכפתור למעלה.</div>
      ) : (
        <div className="space-y-2">
          {folders.map((folder) => {
            const colorConfig = colors[folder.color] || colors.blue;
            
            return (
              <div
                key={folder.id}
                className={`flex items-center gap-3 p-3 rounded-lg transition-all border-2 ${
                  selectedFolder === folder.id
                    ? `${colorConfig.bg} ${colorConfig.border}`
                    : 'hover:bg-[#F8F9FB] border-transparent'
                }`}
              >
                {editingFolderId === folder.id ? (
                  <>
                    <Input
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameFolder(folder.id);
                        if (e.key === 'Escape') { setEditingFolderId(null); setEditingName(""); }
                      }}
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      onClick={() => handleRenameFolder(folder.id)}
                      size="sm"
                      variant="ghost"
                      className="text-[#10B981] hover:bg-[#E7F7ED]"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => { setEditingFolderId(null); setEditingName(""); }}
                      size="sm"
                      variant="ghost"
                      className="text-[#EF4444] hover:bg-[#FEE2E2]"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => onFolderSelect(folder.id)}
                      className="flex items-center gap-3 flex-1"
                    >
                      <div className={`w-8 h-8 ${colorConfig.bg} rounded-lg flex items-center justify-center`}>
                        <Folder className={`w-4 h-4 ${colorConfig.text}`} />
                      </div>
                      <span className="font-medium text-[#1A1F36]">{folder.name}</span>
                    </button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingFolderId(folder.id);
                            setEditingName(folder.name);
                          }}
                        >
                          <Edit2 className="w-4 h-4 ml-2" />
                          שנה שם
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="text-[#EF4444]"
                        >
                          <Trash2 className="w-4 h-4 ml-2" />
                          מחק
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create New Folder */}
      {isCreating && (
        <div className="mt-4 p-3 bg-[#F8F9FB] rounded-lg">
          <Input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateFolder();
              if (e.key === 'Escape') { setIsCreating(false); setNewFolderName(""); }
            }}
            placeholder="שם התיקייה..."
            className="mb-3"
            autoFocus
          />
          
          {/* Color Picker */}
          <div className="flex gap-2 mb-3">
            {Object.entries(colors).map(([colorName, colorConfig]) => (
              <button
                key={colorName}
                onClick={() => setSelectedColor(colorName)}
                className={`w-8 h-8 ${colorConfig.bg} rounded-lg flex items-center justify-center transition-all ${
                  selectedColor === colorName ? `ring-2 ${colorConfig.border}` : ''
                }`}
              >
                <Folder className={`w-4 h-4 ${colorConfig.text}`} />
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleCreateFolder}
              size="sm"
              className="flex-1 bg-[#2E6BDE] hover:bg-[#1D4ED8] text-white"
            >
              <Check className="w-4 h-4 ml-1" />
              צור תיקייה
            </Button>
            <Button
              onClick={() => { setIsCreating(false); setNewFolderName(""); setSelectedColor("blue"); }}
              size="sm"
              variant="outline"
            >
              <X className="w-4 h-4 ml-1" />
              ביטול
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}