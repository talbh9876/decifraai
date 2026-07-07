import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Folder as FolderIcon,
  Plus,
  Edit2,
  Trash2,
  ChevronRight,
  FileText,
  Loader2
} from "lucide-react";

const Folder = base44.entities.Folder;
const Document = base44.entities.Document;

export default function FoldersPage() {
  const navigate = useNavigate();
  const [folders, setFolders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [editingFolder, setEditingFolder] = useState(null);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const authUser = await base44.auth.me();
      if (!authUser) {
        base44.auth.redirectToLogin();
        return;
      }

      const userId = authUser.id || authUser.user_id;
      const [userFolders, userDocs] = await Promise.all([
        Folder.list("name", 100),
        Document.list("-created_date", 100)
      ]);

      setFolders(userFolders || []);
      setDocuments(userDocs || []);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const authUser = await base44.auth.me();
      const userId = authUser.id || authUser.user_id;

      const newFolder = await Folder.create({
        name: newFolderName.trim(),
        ownerAuthId: userId,
        color: "blue"
      });

      setFolders([...folders, newFolder]);
      setNewFolderName("");
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      alert("שגיאה ביצירת תיקייה");
    }
  };

  const handleUpdateFolder = async (folderId) => {
    if (!editName.trim()) return;

    try {
      await Folder.update(folderId, { name: editName.trim() });
      setFolders(folders.map(f => f.id === folderId ? { ...f, name: editName.trim() } : f));
      setEditingFolder(null);
      setEditName("");
    } catch (error) {
      console.error("Error updating folder:", error);
      alert("שגיאה בעדכון תיקייה");
    }
  };

  const handleDeleteFolder = async (folderId) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק תיקייה זו? המסמכים בה יועברו לתיקייה הראשית.")) {
      return;
    }

    try {
      // Move documents to main folder
      const folderDocs = documents.filter(doc => doc.folderId === folderId);
      await Promise.all(
        folderDocs.map(doc => Document.update(doc.id, { folderId: null }))
      );

      await Folder.delete(folderId);
      setFolders(folders.filter(f => f.id !== folderId));
      setDocuments(documents.map(doc => doc.folderId === folderId ? { ...doc, folderId: null } : doc));
    } catch (error) {
      console.error("Error deleting folder:", error);
      alert("שגיאה במחיקת תיקייה");
    }
  };

  const getFolderDocCount = (folderId) => {
    return documents.filter(doc => doc.folderId === folderId).length;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#2E6BDE] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1F36] mb-2">התיקיות שלי</h1>
          <p className="text-[#4A5568]">נהל את התיקיות והמסמכים שלך</p>
        </div>

        {/* Create Folder Section */}
        <div className="bg-white border border-[#E3E6EB] rounded-xl p-6 mb-6 shadow-sm">
          {isCreating ? (
            <div className="flex gap-3">
              <Input
                placeholder="שם התיקייה"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
                className="flex-1"
                autoFocus
              />
              <Button onClick={handleCreateFolder} className="bg-[#2E6BDE] hover:bg-[#1D4ED8] text-white">
                צור
              </Button>
              <Button onClick={() => { setIsCreating(false); setNewFolderName(""); }} variant="outline">
                ביטול
              </Button>
            </div>
          ) : (
            <Button onClick={() => setIsCreating(true)} className="bg-[#2E6BDE] hover:bg-[#1D4ED8] text-white">
              <Plus className="w-5 h-5 ml-2" />
              תיקייה חדשה
            </Button>
          )}
        </div>

        {/* Folders Grid */}
        {folders.length === 0 ? (
          <div className="bg-white border border-[#E3E6EB] rounded-xl p-12 text-center shadow-sm">
            <FolderIcon className="w-16 h-16 text-[#9CA3AF] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[#1A1F36] mb-2">אין תיקיות עדיין</h3>
            <p className="text-[#4A5568] mb-6">צור את התיקייה הראשונה שלך כדי לארגן את המסמכים</p>
            <Button onClick={() => setIsCreating(true)} className="bg-[#2E6BDE] hover:bg-[#1D4ED8] text-white">
              <Plus className="w-5 h-5 ml-2" />
              צור תיקייה
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="bg-white border border-[#E3E6EB] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {editingFolder === folder.id ? (
                  <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleUpdateFolder(folder.id)}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdateFolder(folder.id)} size="sm" className="flex-1">
                        שמור
                      </Button>
                      <Button onClick={() => { setEditingFolder(null); setEditName(""); }} variant="outline" size="sm" className="flex-1">
                        ביטול
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-[#EBF2FE] rounded-xl flex items-center justify-center">
                        <FolderIcon className="w-6 h-6 text-[#2E6BDE]" />
                      </div>
                      <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => { setEditingFolder(folder.id); setEditName(folder.name); }}
                          className="p-2 hover:bg-[#F8F9FB] rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-[#4A5568]" />
                        </button>
                        <button
                          onClick={() => handleDeleteFolder(folder.id)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-[#D9534F]" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-[#1A1F36] mb-2">{folder.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-[#4A5568] mb-4">
                      <FileText className="w-4 h-4" />
                      <span>{getFolderDocCount(folder.id)} מסמכים</span>
                    </div>
                    
                    {/* Documents in folder */}
                    {getFolderDocCount(folder.id) > 0 && (
                      <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                        {documents
                          .filter(doc => doc.folderId === folder.id)
                          .slice(0, 3)
                          .map(doc => (
                            <div
                              key={doc.id}
                              className="flex items-center gap-2 p-2 bg-[#F8F9FB] rounded-lg text-xs"
                            >
                              <FileText className="w-3 h-3 text-[#2E6BDE] flex-shrink-0" />
                              <span className="truncate text-[#4A5568]">{doc.title}</span>
                            </div>
                          ))}
                        {getFolderDocCount(folder.id) > 3 && (
                          <div className="text-xs text-[#9CA3AF] text-center">
                            +{getFolderDocCount(folder.id) - 3} מסמכים נוספים
                          </div>
                        )}
                      </div>
                    )}
                    
                    <Button
                      onClick={() => navigate(createPageUrl(`DashboardHome?folder=${folder.id}`))}
                      variant="outline"
                      size="sm"
                      className="w-full border-[#E3E6EB] hover:bg-[#EBF2FE] hover:border-[#2E6BDE] text-[#2E6BDE]"
                    >
                      <span>פתח תיקייה</span>
                      <ChevronRight className="w-4 h-4 mr-2" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}