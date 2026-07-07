import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { 
  Scale, 
  Search, 
  Loader2, 
  ExternalLink, 
  BookOpen,
  FileText,
  AlertCircle,
  Info
} from "lucide-react";

const InvokeLLM = base44.integrations.Core.InvokeLLM;

export default function LegalResearch({ document }) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const docType = document.document_type;
      const docTypeLabels = {
        employment_contract: "חוזה עבודה",
        rental_agreement: "חוזה שכירות",
        insurance_policy: "פוליסת ביטוח",
        loan_agreement: "הסכם הלוואה",
        purchase_agreement: "הסכם רכישה"
      };

      const contextPrompt = `
        אני בוחן מסמך משפטי מסוג: ${docTypeLabels[docType] || "מסמך משפטי"}.
        
        שאלת החיפוש: ${searchQuery}
        
        חפש ברשת האינטרנט:
        1. פסקי דין ישראליים רלוונטיים (מבתי משפט שונים)
        2. חוקים וחקיקה רלוונטית
        3. תקדימים משפטיים קשורים
        4. מאמרים משפטיים מקצועיים
        
        עבור כל תוצאה, ספק:
        - שם המקור / פסק הדין
        - תיאור קצר ורלוונטי
        - הקשר למסמך הנוכחי
        - קישור למקור (אם קיים)
        
        חשוב: התמקד במקורות ישראליים בעברית. אם אין מקורות רלוונטיים, ציין זאת.
      `;

      const response = await InvokeLLM({
        prompt: contextPrompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            summary: { 
              type: "string",
              description: "סיכום כללי של הממצאים"
            },
            precedents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  relevance: { type: "string" },
                  source: { type: "string" },
                  url: { type: "string" }
                }
              }
            },
            laws: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  relevance: { type: "string" },
                  url: { type: "string" }
                }
              }
            },
            articles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  source: { type: "string" },
                  url: { type: "string" }
                }
              }
            }
          }
        }
      });

      setResults(response);
    } catch (err) {
      console.error("Search error:", err);
      setError("אירעה שגיאה בחיפוש. אנא נסו שוב.");
    }

    setIsSearching(false);
  };

  const handleQuickSearch = (query) => {
    setSearchQuery(query);
    setTimeout(() => {
      handleSearch();
    }, 100);
  };

  const docType = document.document_type;
  const quickSearches = {
    employment_contract: [
      "תקופת התראה מוקדמת",
      "תניית אי תחרות",
      "פיצויי פיטורים"
    ],
    rental_agreement: [
      "פינוי שוכר",
      "העלאת דמי שכירות",
      "הפקדת ערבון"
    ],
    insurance_policy: [
      "סירוב לתביעת ביטוח",
      "כיסוי ביטוחי",
      "תקופת השהייה"
    ],
    loan_agreement: [
      "ריבית פיגורים",
      "פירעון מוקדם",
      "ערבות אישית"
    ]
  };

  return (
    <div className="bg-white border border-[#E3E6EB] rounded-xl overflow-hidden shadow-sm mb-4">
      <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <h3 className="font-bold text-white text-lg">חיפוש משפטי</h3>
        </div>
        <p className="text-white/90 text-sm mt-2">
          חפשו תקדימים, פסקי דין, וחקיקה רלוונטית למסמך שלכם
        </p>
      </div>

      <div className="p-6">
        {/* Search Input */}
        <div className="flex gap-2 mb-4">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            placeholder="לדוגמה: פסקי דין על תקופת התראה..."
            className="flex-1"
            disabled={isSearching}
          />
          <Button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="bg-[#6366F1] hover:bg-[#5558E3] text-white"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Quick Searches */}
        {quickSearches[docType] && (
          <div className="mb-6">
            <p className="text-sm text-[#4A5568] mb-2 font-medium">חיפושים מהירים:</p>
            <div className="flex flex-wrap gap-2">
              {quickSearches[docType].map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickSearch(query)}
                  disabled={isSearching}
                  className="px-3 py-1.5 bg-[#EEF2FF] text-[#6366F1] text-sm rounded-lg hover:bg-[#6366F1] hover:text-white transition-colors disabled:opacity-50"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-[#FEE2E2] border border-[#EF4444]/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-[#EF4444]" />
              <span className="text-[#EF4444] text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Loading */}
        {isSearching && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 text-[#6366F1] animate-spin mx-auto mb-3" />
            <p className="text-[#4A5568]">מחפש במאגרי מידע משפטיים...</p>
          </div>
        )}

        {/* Results */}
        {results && !isSearching && (
          <div className="space-y-6">
            {/* Summary */}
            {results.summary && (
              <div className="bg-[#EEF2FF] border border-[#6366F1]/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#6366F1] flex-shrink-0 mt-0.5" />
                  <p className="text-[#4A5568] leading-relaxed">{results.summary}</p>
                </div>
              </div>
            )}

            {/* Precedents */}
            {results.precedents && results.precedents.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-[#1A1F36] mb-3">
                  <Scale className="w-5 h-5 text-[#6366F1]" />
                  פסקי דין ותקדימים ({results.precedents.length})
                </h4>
                <div className="space-y-3">
                  {results.precedents.map((item, index) => (
                    <div key={index} className="bg-[#F8F9FB] border border-[#E3E6EB] rounded-lg p-4 hover:border-[#6366F1] transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h5 className="font-semibold text-[#1A1F36]">{item.title}</h5>
                        {item.url && (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#6366F1] hover:text-[#5558E3] flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-[#4A5568] mb-2">{item.description}</p>
                      {item.relevance && (
                        <div className="bg-white rounded px-3 py-1.5 text-xs">
                          <span className="font-medium text-[#6366F1]">רלוונטיות: </span>
                          <span className="text-[#4A5568]">{item.relevance}</span>
                        </div>
                      )}
                      {item.source && (
                        <p className="text-xs text-[#9CA3AF] mt-2">מקור: {item.source}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Laws */}
            {results.laws && results.laws.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-[#1A1F36] mb-3">
                  <BookOpen className="w-5 h-5 text-[#10B981]" />
                  חוקים וחקיקה ({results.laws.length})
                </h4>
                <div className="space-y-3">
                  {results.laws.map((law, index) => (
                    <div key={index} className="bg-[#F8F9FB] border border-[#E3E6EB] rounded-lg p-4 hover:border-[#10B981] transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h5 className="font-semibold text-[#1A1F36]">{law.name}</h5>
                        {law.url && (
                          <a
                            href={law.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#10B981] hover:text-[#059669] flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-[#4A5568] mb-2">{law.description}</p>
                      {law.relevance && (
                        <div className="bg-white rounded px-3 py-1.5 text-xs">
                          <span className="font-medium text-[#10B981]">רלוונטיות: </span>
                          <span className="text-[#4A5568]">{law.relevance}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Articles */}
            {results.articles && results.articles.length > 0 && (
              <div>
                <h4 className="flex items-center gap-2 text-lg font-bold text-[#1A1F36] mb-3">
                  <FileText className="w-5 h-5 text-[#F59E0B]" />
                  מאמרים מקצועיים ({results.articles.length})
                </h4>
                <div className="space-y-3">
                  {results.articles.map((article, index) => (
                    <div key={index} className="bg-[#F8F9FB] border border-[#E3E6EB] rounded-lg p-4 hover:border-[#F59E0B] transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h5 className="font-semibold text-[#1A1F36]">{article.title}</h5>
                        {article.url && (
                          <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#F59E0B] hover:text-[#D97706] flex-shrink-0"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-[#4A5568] mb-2">{article.description}</p>
                      {article.source && (
                        <p className="text-xs text-[#9CA3AF]">מקור: {article.source}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {(!results.precedents || results.precedents.length === 0) &&
             (!results.laws || results.laws.length === 0) &&
             (!results.articles || results.articles.length === 0) && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-[#9CA3AF] mx-auto mb-3" />
                <h4 className="text-lg font-semibold text-[#1A1F36] mb-2">לא נמצאו תוצאות</h4>
                <p className="text-[#4A5568]">נסו לנסח את החיפוש בצורה שונה או השתמשו בחיפושים המהירים</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}