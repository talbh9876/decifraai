import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { 
  FileText, 
  Eye, 
  Download, 
  MoreVertical,
  FolderInput,
  Trash2,
  Star,
  Tag,
  Plus,
  X,
  Send,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

const Document = base44.entities.Document;

export default function DocumentCard({ doc, folders, onDocumentChange, onDocumentDelete, getStatusConfig }) {
  const [isMoving, setIsMoving] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [showLawyerModal, setShowLawyerModal] = useState(false);
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const { getCurrentUser } = await import("@/components/userSync");
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleMoveToFolder = async (folderId) => {
    setIsMoving(true);
    try {
      await Document.update(doc.id, { folderId: folderId === "none" ? null : folderId });
      onDocumentChange({ ...doc, folderId: folderId === "none" ? null : folderId });
    } catch (error) {
      console.error("Error moving document:", error);
      alert("שגיאה בהעברת מסמך");
    }
    setIsMoving(false);
  };

  const handleDelete = async () => {
    if (!confirm("האם אתה בטוח שברצונך למחוק מסמך זה?")) return;
    
    try {
      await Document.delete(doc.id);
      onDocumentDelete(doc.id);
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("שגיאה במחיקת מסמך");
    }
  };

  const toggleFavorite = async () => {
    try {
      const updated = await Document.update(doc.id, { isFavorite: !doc.isFavorite });
      onDocumentChange(updated);
    } catch (error) {
      console.error("Error toggling favorite:", error);
    }
  };

  const addTag = async () => {
    if (!newTag.trim()) return;
    const currentTags = doc.tags || [];
    if (currentTags.includes(newTag.trim())) {
      setNewTag("");
      setIsAddingTag(false);
      return;
    }
    
    try {
      const updated = await Document.update(doc.id, { 
        tags: [...currentTags, newTag.trim()] 
      });
      onDocumentChange(updated);
      setNewTag("");
      setIsAddingTag(false);
    } catch (error) {
      console.error("Error adding tag:", error);
    }
  };

  const removeTag = async (tagToRemove) => {
    try {
      const updated = await Document.update(doc.id, { 
        tags: (doc.tags || []).filter(t => t !== tagToRemove) 
      });
      onDocumentChange(updated);
    } catch (error) {
      console.error("Error removing tag:", error);
    }
  };

  const statusConfig = getStatusConfig(doc.status);
  const StatusIcon = statusConfig.icon;
  const plan = user?.plan || "free";

  const handleExport = async (format) => {
    if (format === "word" && plan === "free") {
      alert("ייצוא Word זמין רק בחבילת Pro ומעלה");
      return;
    }

    try {
      if (format === "pdf") {
        // Download the original PDF file
        if (doc.file_url) {
          const link = document.createElement('a');
          link.href = doc.file_url;
          link.download = doc.title || 'document.pdf';
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else if (format === "word") {
        // Export as Word - you can implement this later
        alert("ייצוא Word יהיה זמין בקרוב");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      alert("שגיאה בייצוא המסמך");
    }
  };

  return (
    <div className="p-4 sm:p-6 hover:bg-[#F8F9FB] transition-colors border-b border-[#E3E6EB] last:border-b-0">
      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#EBF2FE] rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#2E6BDE]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 mb-1">
              <h4 className="font-semibold text-[#1A1F36] truncate text-sm sm:text-base flex-1">{doc.title}</h4>
              <button
                onClick={toggleFavorite}
                className="flex-shrink-0 p-1 hover:bg-[#FEF3E2] rounded transition-colors"
              >
                <Star 
                  className={`w-5 h-5 ${doc.isFavorite ? 'fill-[#F59E0B] text-[#F59E0B]' : 'text-[#9CA3AF]'}`}
                />
              </button>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm mb-2">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color} font-medium whitespace-nowrap`}>
                <StatusIcon className="w-3 h-3" />
                {statusConfig.label}
              </span>
              <span className="text-[#9CA3AF] whitespace-nowrap">
                {new Date(doc.created_date).toLocaleDateString('he-IL')}
              </span>
            </div>

            {/* Tags - Pro & Business Only */}
            {(plan === "pro" || plan === "business") ? (
              <div className="flex flex-wrap items-center gap-2">
                {(doc.tags || []).map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="inline-flex items-center gap-1 px-2 py-1 bg-[#EEF2FF] text-[#6366F1] rounded-full text-xs font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-[#6366F1]/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {isAddingTag ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addTag();
                        if (e.key === 'Escape') setIsAddingTag(false);
                      }}
                      placeholder="תגית חדשה..."
                      className="h-7 w-24 text-xs"
                      autoFocus
                    />
                    <Button size="sm" onClick={addTag} className="h-7 px-2">
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => setIsAddingTag(false)}
                      className="h-7 px-2"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingTag(true)}
                    className="inline-flex items-center gap-1 px-2 py-1 border border-dashed border-[#E3E6EB] text-[#9CA3AF] hover:border-[#6366F1] hover:text-[#6366F1] rounded-full text-xs font-medium transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    הוסף תגית
                  </button>
                )}
              </div>
            ) : (
              <div className="text-xs text-[#9CA3AF] italic">תגיות זמינות בחבילת Pro ומעלה</div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {doc.status === 'analyzed' && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-[#E3E6EB] text-[#4A5568] hover:bg-[#F8F9FB] text-xs sm:text-sm">
                    <Download className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                    ייצוא
                    <ChevronDown className="w-3 h-3 mr-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleExport("pdf")}>
                    <Download className="w-4 h-4 ml-2" />
                    ייצוא כ-PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleExport("word")}
                    disabled={plan === "free"}
                    className={plan === "free" ? "opacity-50" : ""}
                  >
                    <Download className="w-4 h-4 ml-2" />
                    ייצוא כ-Word {plan === "free" && "(Pro+)"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link to={createPageUrl(`Analysis?id=${doc.id}`)}>
                <Button size="sm" className="bg-[#2E6BDE] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm">
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  צפה
                </Button>
              </Link>

              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowLawyerModal(true)}
                className="border-[#10B981] text-[#10B981] hover:bg-[#E7F7ED] text-xs sm:text-sm"
              >
                <Send className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                שלח לעו"ד
              </Button>
            </>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {/* Folder Move - Pro & Business Only */}
              {(plan === "pro" || plan === "business") && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <FolderInput className="w-4 h-4 ml-2" />
                    העבר לתיקייה
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleMoveToFolder("none")}>
                      ללא תיקייה
                    </DropdownMenuItem>
                    {folders.map((folder) => (
                      <DropdownMenuItem 
                        key={folder.id}
                        onClick={() => handleMoveToFolder(folder.id)}
                      >
                        {folder.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              )}
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-[#EF4444]"
              >
                <Trash2 className="w-4 h-4 ml-2" />
                מחק מסמך
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Lawyer Review Modal */}
      {showLawyerModal && (
        <LawyerReviewModal 
          isOpen={showLawyerModal}
          onClose={() => setShowLawyerModal(false)}
          document={doc}
          userPlan={plan}
        />
      )}
    </div>
  );
}

// Import the LawyerReviewModal component
import LawyerReviewModal from "@/components/LawyerReviewModal";