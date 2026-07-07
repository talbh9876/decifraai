import React, { useEffect, useMemo, useState } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";

export default function ImpactCards({ document, currentPlan = "free", onUpgrade }) {
  const isPro = currentPlan === "pro" || currentPlan === "business";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const contextText = useMemo(() => {
    const a = document?.ai_analysis || {};
    const type = document?.document_type || "other";
    const title = document?.title || "";
    const summary = a.summary || a.executive_summary || "";
    const keyPoints = Array.isArray(a.key_points) ? a.key_points.slice(0, 10).join("\n• ") : "";
    return `Title: ${title}\nType: ${type}\nSummary: ${summary}\nKey points:\n${keyPoints}`;
  }, [document]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setError("");
      try {
        const res = await base44.integrations.Core.InvokeLLM({
          prompt: [
            "You are an assistant that analyzes any kind of user-provided document (contracts, pay slips, letters, fines, reports, etc.).",
            "Your goal is to explain practical impact on the person, not legal interpretation.",
            "Use simple Hebrew, concise, human-centered, cautious language only: עשוי, עלול, ייתכן, אינו מגדיר.",
            "Do NOT provide legal recommendations. No must/should/forbidden/allowed words.",
            "Return a JSON object matching the provided schema.",
            "Context (may be partial):\n" + contextText,
          ].join("\n\n"),
          add_context_from_internet: false,
          response_json_schema: {
            type: "object",
            properties: {
              financial_impact: {
                type: "object",
                properties: {
                  overview: { type: "string" },
                  details: { type: "array", items: { type: "string" } },
                },
              },
              rights_obligations: {
                type: "object",
                properties: {
                  overview: { type: "string" },
                  details: { type: "array", items: { type: "string" } },
                },
              },
              future_risk: {
                type: "object",
                properties: {
                  overview: { type: "string" },
                  scenarios: { type: "array", items: { type: "string" } },
                },
              },
              red_flags: {
                type: "object",
                properties: {
                  has_flags: { type: "boolean" },
                  overview: { type: "string" },
                  items: { type: "array", items: { type: "string" } },
                },
              },
            },
          },
        });
        if (!mounted) return;
        setData(res);
      } catch (e) {
        if (!mounted) return;
        setError("שגיאה בטעינת התובנות");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => {
      mounted = false;
    };
  }, [contextText]);

  const handleUpgrade = () => {
    if (typeof onUpgrade === "function") return onUpgrade();
    window.location.href = createPageUrl("Upgrade?plan=pro");
  };

  const Card = ({ title, subtitle, items, showFull }) => (
    <div className="bg-white border border-[#E5E8EB] rounded-xl p-5 shadow-sm">
      <div className="mb-2">
        <h4 className="text-sm font-semibold text-[#0F1E2E]">{title}</h4>
        {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
      </div>
      <div className="text-sm text-[#4A5568] space-y-2">
        {items && items.length > 0 ? (
          <ul className="list-disc mr-5 space-y-1">
            {(showFull ? items : items.slice(0, 1)).map((it, i) => (
              <li key={i}>{it}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {!showFull && (
        <div className="mt-2 text-[11px] text-[#6B7280]">פירוט מלא ב‑Pro</div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-[#E5E8EB] rounded-xl p-5 shadow-sm">
            <div className="h-4 w-32 bg-[#F3F4F6] rounded mb-3" />
            <div className="h-3 w-full bg-[#F3F4F6] rounded mb-2" />
            <div className="h-3 w-5/6 bg-[#F3F4F6] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-[#E5E8EB] rounded-xl p-5 shadow-sm mb-6 text-sm text-[#4A5568]">
        התובנות אינן זמינות כרגע.
      </div>
    );
  }

  const fin = data.financial_impact || { overview: "", details: [] };
  const rights = data.rights_obligations || { overview: "", details: [] };
  const risk = data.future_risk || { overview: "", scenarios: [] };
  const flags = data.red_flags || { has_flags: false, overview: "", items: [] };

  // Free: one impact full (financial), others hints only
  const freeFull = "financial";

  return (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          title="השפעה כספית"
          subtitle={fin.overview}
          items={fin.details?.length ? fin.details : fin.overview ? [fin.overview] : []}
          showFull={isPro || freeFull === "financial"}
        />
        <Card
          title="זכויות והתחייבויות"
          subtitle={rights.overview}
          items={rights.details?.length ? rights.details : rights.overview ? [rights.overview] : []}
          showFull={isPro}
        />
        <Card
          title="סיכון עתידי"
          subtitle={risk.overview}
          items={risk.scenarios?.length ? risk.scenarios : risk.overview ? [risk.overview] : []}
          showFull={isPro}
        />
        {(flags.has_flags || flags.overview || (flags.items && flags.items.length)) && (
          <Card
            title="דגלים אדומים"
            subtitle={flags.overview || "זוהו סימנים שדורשים תשומת לב"}
            items={flags.items?.length ? flags.items : (flags.overview ? [flags.overview] : [])}
            showFull={isPro}
          />
        )}
      </div>

      {!isPro && (
        <div className="flex items-center justify-between mt-3">
          <span className="text-[12px] text-[#6B7280]">כדי להבין את התמונה המלאה – שדרג ל‑Pro</span>
          <button
            onClick={() => (onUpgrade ? onUpgrade() : (window.location.href = createPageUrl("Upgrade?plan=pro")))}
            className="text-xs text-[#1E63F0] hover:underline"
          >
            פתח הכל
          </button>
        </div>
      )}
    </div>
  );
}