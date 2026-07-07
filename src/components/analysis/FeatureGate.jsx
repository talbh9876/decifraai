import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { canAccess, normalizePlan } from "./planUtils";
import { canBypassPlan } from "@/components/utils/devAccess";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

function InlineLocked({ title, requiredPlan, description, onOpen }) {
  const planLabelMap = { beginner: "Beginner", pro: "Pro", business: "Business" };
  const label = planLabelMap[requiredPlan] || requiredPlan;
  return (
    <div className="border border-[#E5E8EB] bg-white rounded-xl p-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-[#0A2A43]">{title}</h3>
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563]">
          <span className="opacity-70">🔒</span>
          <span>{label}</span>
        </span>
      </div>
      {description && (
        <p className="text-xs text-[#4A5568] mb-1">{description}</p>
      )}
      <button type="button" onClick={onOpen} className="text-xs text-[#1E63F0] hover:underline">
        שדרג →
      </button>
    </div>
  );
}

export default function FeatureGate({
        currentPlan = "free",
        requiredPlan = "pro",
        title = "",
        description = "",
        children,
        onUpgrade,
        compact = true,
      }) {
        const navigate = useNavigate();
        const [open, setOpen] = React.useState(false);
        const [devUser, setDevUser] = React.useState(null);
        React.useEffect(() => {
          (async () => {
            try {
              const { getCurrentUser } = await import("@/components/userSync");
              const u = await getCurrentUser();
              setDevUser(u);
            } catch {
              setDevUser(null);
            }
          })();
        }, []);
        if (canBypassPlan(devUser)) {
          return <>{children}</>;
        }
        const plan = normalizePlan(currentPlan);
        const allowed = canAccess(plan, requiredPlan);

  const handleUpgrade = () => {
    const to = createPageUrl(`Upgrade?plan=${requiredPlan}`);
    if (typeof onUpgrade === "function") onUpgrade(requiredPlan);
    navigate(to);
  };

  if (allowed) return <>{children}</>;

  return (
    <>
      <InlineLocked
        title={title}
        requiredPlan={requiredPlan}
        description={description}
        onOpen={() => setOpen(true)}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{`${title} זמין ב-${requiredPlan}`}</DialogTitle>
            <DialogDescription>שדרוג יאפשר שימוש מלא בפיצ'ר זה.</DialogDescription>
          </DialogHeader>
          <ul className="list-disc pr-5 text-sm text-[#4A5568] space-y-1">
            <li>{description || "גישה לכל היכולות של הפיצ'ר"}</li>
            <li>כלים מתקדמים לשיפור העבודה</li>
            <li>חוויית שימוש מלאה ללא הגבלות</li>
          </ul>
          <DialogFooter className="mt-4 flex gap-2 justify-end">
            <Button onClick={handleUpgrade} className="bg-[#1E63F0] hover:bg-[#0A2A43] text-white">
              {`שדרג ל-${requiredPlan}`}
            </Button>
            <Button variant="outline" onClick={handleUpgrade}>צפה בתוכניות</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}