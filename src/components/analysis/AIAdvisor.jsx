import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { AlertTriangle, CheckCircle2, FileText, Loader2, PlusCircle, Wand2, Link as LinkIcon } from "lucide-react";

export default function AIAdvisor({ document, onJumpToTab }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const context = useMemo(() => {
    const a = document?.analysisResult || document?.ai_analysis || {};
    const sum = a.summary || a.executive_summary || "";
    const key = Array.isArray(a.key_points) ? a.key_points.slice(0, 8).join("\n• ") : "";
    const obligations = Array.isArray(a.obligations) ? a.obligations.slice(0, 8).join("\n• ") : "";
    return [
      `כותרת: ${document?.title || ""}`,
      `סוג מסמך: ${document?.document_type || document?.documentType || "other"}`,
      sum ? `תקציר: ${sum}` : "",
      key ? `נקודות מפתח:\n• ${key}` : "",
      obligations ? `חובות/התחייבויות:\n• ${obligations}` : "",
    ].filter(Boolean).join("\n\n");
  }, [document]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!document?.file_url) { setLoading(false); return; }
      setLoading(true);
      setError("");
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: [
            "אתה מסייע משפטי שיוצר הצעות ממוקדות בעברית בלבד.",
            "המשימה: (1) לזהות סעיפים חשובים שחסרים במסמך ולהציע נוסח מוצע קצר,",
            "(2) להציע שיפורי ניסוח לסעיפים קיימים כדי להבהיר/להפחית סיכון,",
            "(3) להציג רשימת סיכונים עם חומרה ומיקום/קישור לסעיף (אם ידוע).",
            "השב בעברית בלבד ללא טקסט באנגלית וללא הצהרות שאינך עו" + "" + "ד.",
            "התאם את ההצעות לפי סוג המסמך (למשל בחוזה עבודה שקול סעיף אי-תחרות, סודיות, הודעה מוקדמת וכד').",
            "החזר JSON לפי הסכמה המצורפת בלבד.",
            "הקשר המסמך (חלקי):\n" + context,
          ].join("\n\n"),
          file_urls: [document.file_url],
          add_context_from_internet: true,
          response_json_schema: {
            type: "object",
            properties: {
              missing_clauses: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    why: { type: "string" },
                    suggested_text: { type: "string" },
                  }
                }
              },
              wording_improvements: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    clause: { type: "string" },
                    current_text: { type: "string" },
                    improved_text: { type: "string" },
                    reason: { type: "string" },
                  }
                }
              },
              risks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    severity: { type: "string" },
                    location: { type: "string" },
                    clause_ref: { type: "string" }
                  }
                }
              }
            }
          }
        });
        if (!mounted) return;
        setData(res || {});
      } catch (e) {
        if (!mounted) return;
        setError("שגיאה בטעינת הצעות ה-AI");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [document?.id, document?.file_url, context]);

  const severityCfg = (s) => {
    const k = String(s || "").toLowerCase();
    if (k.includes("high") || k.includes("גבוה")) return { badge: "bg-[#FEE2E2] text-[#EF4444]", label: "גבוהה" };
    if (k.includes("low") || k.includes("נמוך")) return { badge: "bg-[#E7F7ED] text-[#10B981]", label: "נמוכה" };
    return { badge: "bg-[#FEF3E2] text-[#F59E0B]", label: "בינונית" };
  };

  if (loading) {
    return (
      <div className="bg-white border border-[#E5E8EB] rounded-xl p-5 shadow-sm mb-6 flex items-center gap-3 text-[#4A5568] text-sm">
        <Loader2 className="w-4 h-4 animate-spin" />
        טוען הצעות חכמות למסמך…
      </div>
    );
  }

  if (error || !data) return null;

  const { missing_clauses = [], wording_improvements = [], risks = [] } = data;

  return (
    <div className="space-y-6">
      {/* Missing Clauses */}
      {missing_clauses.length > 0 && (
        <div className="bg-white border border-[#E5E8EB] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#EBF2FE] rounded-lg flex items-center justify-center">
              <PlusCircle className="w-5 h-5 text-[#1E63F0]" />
            </div>
            <h3 className="text-lg font-bold text-[#0F1E2E]">סעיפים מומלצים להוספה</h3>
          </div>
          <div className="space-y-4">
            {missing_clauses.map((c, i) => (
              <div key={i} className="p-4 bg-[#F8F9FB] border border-[#E3E6EB] rounded-lg">
                <div className="font-semibold text-[#0F1E2E] mb-1">{c.title}</div>
                {c.why && <p className="text-sm text-[#4A5568] mb-2">{c.why}</p>}
                {c.suggested_text && (
                  <div className="text-xs text-[#0F1E2E] bg-white border border-[#E5E8EB] rounded-lg p-3 whitespace-pre-wrap">
                    {c.suggested_text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wording Improvements */}
      {wording_improvements.length > 0 && (
        <div className="bg-white border border-[#E5E8EB] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#E7F7ED] rounded-lg flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-[#10B981]" />
            </div>
            <h3 className="text-lg font-bold text-[#0F1E2E]">שיפורי ניסוח לסעיפים קיימים</h3>
          </div>
          <div className="space-y-4">
            {wording_improvements.map((w, i) => (
              <div key={i} className="p-4 bg-[#F8F9FB] border border-[#E3E6EB] rounded-lg">
                <div className="font-semibold text-[#0F1E2E] mb-1">{w.clause}</div>
                {w.current_text && (
                  <div className="text-xs text-[#6B7280] bg-white border border-[#E5E8EB] rounded-md p-2 mb-2 whitespace-pre-wrap">
                    {w.current_text}
                  </div>
                )}
                {w.improved_text && (
                  <div className="text-xs text-[#0F1E2E] bg-white border-2 border-[#10B981] rounded-md p-2 whitespace-pre-wrap">
                    {w.improved_text}
                  </div>
                )}
                {w.reason && <p className="text-xs text-[#4A5568] mt-2">סיבה: {w.reason}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk List */}
      {risks.length > 0 && (
        <div className="bg-white border border-[#E5E8EB] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-[#FEE2E2] rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
            </div>
            <h3 className="text-lg font-bold text-[#0F1E2E]">תצוגת סיכונים</h3>
          </div>
          <div className="space-y-3">
            {risks.map((r, i) => {
              const cfg = severityCfg(r.severity);
              return (
                <div key={i} className="border border-[#E5E8EB] rounded-lg p-4">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div className="font-semibold text-[#0F1E2E]">{r.title}</div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.badge}`}>חומרה: {cfg.label}</span>
                  </div>
                  {r.description && <p className="text-sm text-[#4A5568] mb-2">{r.description}</p>}
                  <div className="flex items-center gap-3 text-xs text-[#6B7280]">
                    {r.location && (
                      <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" /> מיקום: {r.location}</span>
                    )}
                    {(r.clause_ref || r.location) && (
                      <button
                        type="button"
                        onClick={() => onJumpToTab && onJumpToTab("legal_terms")}
                        className="inline-flex items-center gap-1 text-[#1E63F0] hover:underline"
                      >
                        <LinkIcon className="w-3 h-3" /> לצפייה בסעיף
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}