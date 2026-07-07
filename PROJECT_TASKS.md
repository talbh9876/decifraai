# Decifra.ai — Project Tasks

> Source of truth for project status, issues, and priorities. Derived from `PROJECT_OVERVIEW.md` (full-repo audit) plus a structural check of the current tree (`git log`, `git status`, `src/pages.config.js`, directory listings) on 2026-07-08. No source files were read in full beyond the overview; no source files were modified in producing this document.

## 1. Current Project Status

- Single-commit repo (`212a297 Initial Decifra local project`), working tree clean — this is effectively an initial/MVP snapshot, not an iteratively-shipped product yet.
- Core product loop is implemented end-to-end: upload → AI analysis (via Base44 `InvokeLLM`) → plan-gated results UI → optional paid lawyer review → Stripe-based subscription/payment flows.
- No test suite, no CI configuration found in the repo.
- Several flows are functionally wired up but contain correctness/security defects (below) that should be resolved before this is treated as production-grade.

## 2. Completed Milestones

- Base44 auth integration (`AuthContext`, token handling via `app-params.js`, `getCurrentUser()` bridging auth + `Users` entity).
- Document upload + AI analysis pipeline, including a specialized pay-slip compliance-check prompt.
- Analysis UI with dynamic tabs and plan-gated feature widgets (AI Advisor, Compare Documents, Legal Research, Export, simulations).
- Human lawyer review flow: request → Stripe payment → `LawyerCase` creation → lawyer dashboard → written opinion → client notification.
- Two Stripe Checkout flows (plan upgrade, lawyer review) with server-side session creation and client-redirect completion endpoints.
- Declarative entity/RLS layer for `Document`, `Folder`, `LawyerCase`, `Notification`, `User`, `Users`.

## 3. Known Issues

1. **`LawyerCase.documentId` vs `document_id` mismatch** — `LawyerDashboard.jsx` reads `caseItem.document_id` (snake_case) almost everywhere, but the entity/writer uses `documentId`. This likely breaks document lookups on the lawyer dashboard (the "document + client info" and "full AI analysis" panels), silently returning `undefined`.
2. **`sendNotification()` writes fields that don't match the `Notification` schema.** Uses `user_email`/`document_id`/`is_read`/`sent_email` instead of the schema's `userId`/`documentId`/`isRead`/`createdAt`. Would likely fail RLS or create unreadable orphan rows. Currently imported but never actually called anywhere.
3. **`NotificationSettings.jsx` writes to a field that doesn't exist.** It persists `user.notificationSettings`, but `Users.jsonc` defines `alertSettings` with a different shape — user notification preferences are effectively not persisted anywhere the rest of the app reads.
4. **Dual "user" entities (`User` vs `Users`)** with no visible sync mechanism; unclear which is authoritative for `plan`/`scansUsed`. Nearly all real logic uses `Users`; `User.jsonc` looks vestigial.
5. **Legacy/duplicate `Document` fields** (`document_type` vs `documentType`, `ai_analysis` vs `analysisResult`, `userId` vs `ownerAuthId`) synced manually at write time. `ExportMenu.jsx` reportedly only reads the legacy field, so PDF exports can be blank for documents that only populated the new field.

## 4. Technical Debt

- Dead, unrouted pages: `src/pages/Dashboard.jsx`, `Documents.jsx`, `CRM.jsx` (confirmed absent from `src/pages.config.js`).
- Duplicate simulation implementations: `RealityMode.jsx` and `SimulationEngine.jsx` appear to implement the same feature twice.
- `UserManagement.jsx`'s "Edit Quota" dialog reads/writes a `scanQuota` field that doesn't exist on the `Users` schema (only `scansUsed` does).
- `ThemeProvider.jsx` has dark mode fully disabled (no-op) while `Settings.jsx` still renders a working-looking dark/light toggle.
- `jsconfig.json` / `eslint.config.js` exclude parts of `src` (e.g. `src/lib`, `src/components/ui`) from linting/type-checking coverage.
- No automated tests anywhere in the repo.

## 5. Security Concerns

Ordered by severity:

1. **Client-controlled plan on subscription completion.** `completeUpgradePayment` (`base44/functions/completeUpgradePayment/entry.ts:17-42`) sets the user's plan from the **URL query string** (`?plan=...`) rather than the Stripe session's own `metadata.plan`. Since only `payment_status === 'paid'` is checked (not which plan/amount was actually paid), a user could pay for the cheapest plan and complete with `?plan=business` to upgrade for free. **This is a real pricing/privilege bypass.**
2. **Plan gating overridable via URL parameter.** In `Analysis.jsx`, `currentPlan = paramPlan || userPlanLocal`, where `paramPlan` comes directly from `?plan=` in the URL. Every feature gate on that page is driven by this value — appending `?plan=business` to any Analysis URL unlocks every paid feature client-side. Looks like leftover dev/QA scaffolding that shipped into production gating logic.
3. **No idempotency/replay protection on payment completion endpoints.** Neither `completeUpgradePayment` nor `completeLawyerReviewPayment` records that a Stripe `session_id` was already consumed. The lawyer-review completion endpoint also doesn't cross-check the client-supplied `documentId` against `session.metadata.documentId` — a captured success URL could be replayed, or a paid session attached to the wrong document.
4. **Privileged actions rely on client-side gating + directly-invoked `asServiceRole` calls from browser code.** Role/plan checks (`isAdminUser`/`canBypassPlan`, dashboard redirect guards, feature-gate components) are plain UI conditionals; the real backstop is server-side RLS, but some privileged actions (role/plan editing in `UserManagement.jsx`, `ensureUserProfile`'s user creation) invoke `base44.asServiceRole` directly from the browser. Whether Base44's platform restricts who can successfully make these calls is **not visible in this repo** — open question, needs investigation with Base44 platform docs/support before this can be ruled safe.
5. **Hardcoded admin email** (`decifratech@gmail.com`) baked into `userSync.jsx`'s client-side role-resolution fallback.
6. **Unmetered/ungated AI cost surfaces.** `Support.jsx`'s public chatbot and several Analysis widgets call `InvokeLLM` with little-to-no plan/quota enforcement *inside* the component — gating only controls what's displayed, not whether the (costly) LLM call fires. This is a cost/abuse risk, not a data-security one.

## 6. High Priority Tasks

1. Fix `completeUpgradePayment` to derive `plan` from `session.metadata.plan` (set at checkout-creation time), not the URL query string — closes the pricing bypass (§5.1).
2. Remove or properly gate the `?plan=` client-side override in `Analysis.jsx` so it can't unlock paid features for free (§5.2).
3. Fix the `LawyerCase.documentId`/`document_id` field mismatch in `LawyerDashboard.jsx` — currently likely breaks document lookups for lawyers on a feature customers pay for (§3.1).
4. Add idempotency (session-consumed tracking) and `documentId`/session cross-checks to both payment completion endpoints (§5.3).
5. Investigate and document how `base44.asServiceRole` authorization actually works server-side for client-invoked calls (§5.4) — needed to know how serious the privileged-action exposure really is.

## 7. Medium Priority Tasks

1. Decide which of `User` vs `Users` is authoritative for `plan`/`scansUsed`; deprecate/migrate the other (§3.4).
2. Fix or remove `sendNotification()` (field mismatch with `Notification` schema/RLS) — currently dead code (§3.2).
3. Fix `NotificationSettings.jsx` to read/write the schema's `alertSettings` field, or update the schema to match intended behavior (§3.3).
4. Consolidate legacy/duplicate `Document` fields so all consumers (notably `ExportMenu.jsx`) read a single consistent source, fixing blank-export cases (§3.5).
5. Add a server-side (or at least defense-in-depth) quota/plan check on AI invocation surfaces beyond UI-level display gating (§5.6).

## 8. Low Priority Tasks

1. Remove unrouted dead files: `src/pages/Dashboard.jsx`, `Documents.jsx`, `CRM.jsx`.
2. Deduplicate `RealityMode.jsx` / `SimulationEngine.jsx` into a single implementation.
3. Remove or properly implement `UserManagement.jsx`'s "Edit Quota" dialog (`scanQuota` field doesn't exist in schema).
4. Either implement dark mode in `ThemeProvider.jsx` or remove the non-functional toggle in `Settings.jsx`.
5. Expand `jsconfig.json`/`eslint.config.js` coverage to include currently-excluded `src` directories.

## 9. Future Ideas

*(Speculative — not committed work; carried over from open questions in the audit, not new scope.)*

- Add a Stripe webhook handler as the source of truth for payment confirmation, with the current client-redirect "complete" endpoints as a secondary/defense-in-depth path rather than the only mechanism.
- Add an admin-facing reconciliation report comparing Stripe payment records against `LawyerCase`/`Document`/`Users` entities.
- Add an automated test suite (none currently exists) and CI pipeline.
- Add structured audit logging for `asServiceRole`-backed admin actions.
- Fully unify `User`/`Users` into one entity with a migration path, once the authoritative-source question (§7.1) is resolved.

## 10. Recommended Implementation Order

1. Fix `completeUpgradePayment` plan-trust bug (§6.1) — direct revenue/pricing exposure, smallest fix, highest impact.
2. Remove the `?plan=` gating override in `Analysis.jsx` (§6.2) — direct paid-feature bypass, small fix.
3. Fix `LawyerCase` `documentId`/`document_id` mismatch (§6.3) — restores a broken paid feature.
4. Add payment-completion idempotency + `documentId`/session cross-checks (§6.4).
5. Investigate `asServiceRole` exposure (§6.5) — informs whether further security work is needed and how urgent it is.
6. Resolve `User` vs `Users` duplication (§7.1) — unblocks safely fixing plan/quota logic elsewhere.
7. Fix `Notification` field mismatches: `sendNotification()` and `NotificationSettings.jsx` (§7.2, §7.3).
8. Add defense-in-depth quota/plan enforcement on AI call surfaces (§7.5).
9. Consolidate legacy `Document` fields and fix dependent consumers like `ExportMenu.jsx` (§7.4).
10. Clean up technical debt: dead pages, duplicate simulation components, `scanQuota` dialog, dark mode toggle, lint/typecheck coverage (§8).
11. Revisit Future Ideas (§9) once the above is stable: tests/CI, Stripe webhook, payment reconciliation, audit logging.
