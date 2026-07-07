import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { 
  GitCompare, 
  Loader2, 
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight
} from "lucide-react";

const Document = base44.entities.Document;
const InvokeLLM = base44.integrations.Core.InvokeLLM;

export default function CompareDocuments({ currentDocument }) {
  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const docs = await Document.list("-created_date", 50);
      const filtered = docs.filter(d => d.id !== currentDocument.id && d.status === "analyzed");
      setDocuments(filtered);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const handleCompare = async () => {
    if (!selectedDoc) return;

    setIsComparing(true);
    setComparisonResult(null);

    try {
      const prompt = `
        השווה בין שני מסמכים משפטיים באופן מעמיק:
        
        מסמך 1: ${currentDocument.title}
        סוג: ${currentDocument.document_type}
        ניתוח: ${JSON.stringify(currentDocument.ai_analysis)}
        
        מסמך 2: ${selectedDoc.title}
        סוג: ${selectedDoc.document_type}
        ניתוח: ${JSON.stringify(selectedDoc.ai_analysis)}
        
        בצע השוואה מקיפה וחזור בעברית:
        1. הבדלים עיקריים בתוכן ובתנאים
        2. הבדלים בסיכונים משפטיים
        3. הבדלים בזכויות וחובות
        4. איזה מסמך מועדף ומדוע
        5. המלצות מבוססות על ההשוואה
        
        כל התשובות בעברית בלבד!
      `;

      const result = await InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            key_differences: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  category: { type: "string" },
                  doc1: { type: "string" },
                  doc2: { type: "string" },
                  impact: { type: "string" }
                }
              }
            },
            risk_comparison: { type: "string" },
            rights_comparison: { type: "string" },
            preferred_document: {
              type: "object",
              properties: {
                document: { type: "string" },
                reasons: { type: "array", items: { type: "string" } }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });

      setComparisonResult(result);
    } catch (error) {
      console.error("Comparison error:", error);
      alert("שגיאה בהשוואת מסמכים. אנא נסו שוב.");
    }

    setIsComparing(false);
  };

  return (
    <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
      <div className="bg-gradient-to-r from-[#10B981] to-[#059669] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <GitCompare className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-white text-lg">השוואת מסמכים</h3>
        </div>
        <p className="text-white/90 text-sm mt-2">
          השוו את המסמך הנוכחי למסמך אחר במערכת
        </p>
      </div>

      <div className="p-6">
        {/* Document Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-[#4A5568] mb-2">
            בחר מסמך להשוואה:
          </label>
          <select
            value={selectedDoc?.id || ""}
            onChange={(e) => {
              const doc = documents.find(d => d.id === e.target.value);
              setSelectedDoc(doc);
            }}
            className="w-full h-12 px-4 bg-white border border-[#E3E6EB] rounded-lg text-[#0F1E2E] text-sm focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            disabled={isComparing}
          >
            <option value="">-- בחר מסמך --</option>
            {documents.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.title} ({new Date(doc.created_date).toLocaleDateString('he-IL')})
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleCompare}
          disabled={!selectedDoc || isComparing}
          className="w-full bg-[#10B981] hover:bg-[#059669] text-white mb-4"
        >
          {isComparing ? (
            <>
              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              משווה מסמכים...
            </>
          ) : (
            <>
              <GitCompare className="w-4 h-4 ml-2" />
              השווה מסמכים
            </>
          )}
        </Button>

        {/* Comparison Results */}
        {comparisonResult && (
          <div className="space-y-4">
            {/* Summary */}
            <div className="bg-[#E7F7ED] border border-[#10B981]/30 rounded-lg p-4">
              <h4 className="font-bold text-[#1A1F36] mb-2">סיכום ההשוואה</h4>
              <p className="text-[#4A5568] leading-relaxed">{comparisonResult.summary}</p>
            </div>

            {/* Key Differences */}
            {comparisonResult.key_differences?.length > 0 && (
              <div>
                <h4 className="font-bold text-[#1A1F36] mb-3">הבדלים עיקריים</h4>
                <div className="space-y-3">
                  {comparisonResult.key_differences.map((diff, index) => (
                    <div key={index} className="bg-[#F8F9FB] border border-[#E3E6EB] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="bg-[#10B981] text-white text-xs font-bold px-2 py-1 rounded">
                          {diff.category}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-[#6366F1]" />
                            <span className="text-sm font-medium text-[#1A1F36]">
                              {currentDocument.title}
                            </span>
                          </div>
                          <p className="text-sm text-[#4A5568] bg-white p-3 rounded border border-[#E3E6EB]">
                            {diff.doc1}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-[#F59E0B]" />
                            <span className="text-sm font-medium text-[#1A1F36]">
                              {selectedDoc.title}
                            </span>
                          </div>
                          <p className="text-sm text-[#4A5568] bg-white p-3 rounded border border-[#E3E6EB]">
                            {diff.doc2}
                          </p>
                        </div>
                      </div>
                      <div className="bg-[#FEF3E2] p-3 rounded">
                        <span className="text-xs font-medium text-[#F59E0B]">השפעה: </span>
                        <span className="text-sm text-[#4A5568]">{diff.impact}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Risk & Rights Comparison */}
            {comparisonResult.risk_comparison && (
              <div className="bg-[#FFE5E5] border border-[#EF4444]/30 rounded-lg p-4">
                <h4 className="font-bold text-[#1A1F36] mb-2">השוואת סיכונים</h4>
                <p className="text-[#4A5568] text-sm">{comparisonResult.risk_comparison}</p>
              </div>
            )}

            {comparisonResult.rights_comparison && (
              <div className="bg-[#EBF2FE] border border-[#2E6BDE]/30 rounded-lg p-4">
                <h4 className="font-bold text-[#1A1F36] mb-2">השוואת זכויות</h4>
                <p className="text-[#4A5568] text-sm">{comparisonResult.rights_comparison}</p>
              </div>
            )}

            {/* Preferred Document */}
            {comparisonResult.preferred_document && (
              <div className="bg-[#E7F7ED] border-2 border-[#10B981] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-6 h-6 text-[#10B981]" />
                  <h4 className="font-bold text-[#1A1F36] text-lg">המלצה</h4>
                </div>
                <p className="text-[#4A5568] mb-3">
                  <strong>מסמך מומלץ:</strong> {comparisonResult.preferred_document.document}
                </p>
                <ul className="space-y-2">
                  {comparisonResult.preferred_document.reasons?.map((reason, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-[#4A5568]">
                      <ArrowRight className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            {comparisonResult.recommendations?.length > 0 && (
              <div className="bg-white border border-[#E3E6EB] rounded-lg p-4">
                <h4 className="font-bold text-[#1A1F36] mb-3">המלצות לפעולה</h4>
                <ul className="space-y-2">
                  {comparisonResult.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-[#4A5568]">
                      <CheckCircle className="w-4 h-4 text-[#10B981] mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {documents.length === 0 && (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
            <p className="text-[#4A5568]">אין מסמכים אחרים להשוואה</p>
          </div>
        )}
      </div>
    </div>
  );
}