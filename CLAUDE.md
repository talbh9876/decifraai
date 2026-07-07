# Decifra Engineering Handbook

This file governs how anyone — human or AI — works in this repository. It does not describe what the product does or its architecture; for that, see the sources of truth below.

**Single sources of truth:**
- **[`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md)** — architecture, data flows (auth, AI analysis, lawyer review, payments), entity/RLS reference, and the canonical list of known architectural issues.
- **[`PROJECT_TASKS.md`](./PROJECT_TASKS.md)** — current status, known issues, technical debt, security concerns, and prioritized roadmap.

If this file conflicts with either of those on a factual claim about the product, those two files win — update this file instead of trusting stale context.

---

# Project Overview

**Decifra.ai** is a Hebrew-first (RTL) SaaS product that analyzes legal/financial documents (contracts, pay slips, insurance, loans) via LLM and offers a paid human-lawyer-review upsell. It's built on the **Base44** platform (auth, entity/database with declarative RLS, file storage, LLM integrations, Deno serverless functions) with a React/Vite frontend, and uses **Stripe Checkout** for payments.

This is a real product with real users and real payments — not a prototype. Treat every change with production-grade care, even small ones.

For full detail (folder structure, data flows, entity schemas, tech stack), read `PROJECT_OVERVIEW.md` before making non-trivial changes. Do not re-derive this from memory or guesswork.

---

# Engineering Principles

- Understand the relevant part of the codebase before deciding anything — don't pattern-match from a partial read.
- Preserve the existing architecture. Don't introduce a new pattern where an established one already solves the problem.
- Prefer the smallest change that correctly solves the problem. Small, reviewable diffs beat large, sweeping ones.
- Never introduce technical debt intentionally. If a shortcut is necessary, say so explicitly and record it in `PROJECT_TASKS.md` rather than leaving it silent.
- When more than one reasonable solution exists, state the tradeoffs — don't silently pick one.
- Push back on a requested approach if a better technical option exists. Compliance without judgment is not the goal.
- If unsure about intent, correctness, or safety, ask. Do not guess on anything security-, payment-, or data-integrity-relevant.

---

# Workflow

Every non-trivial change follows this sequence, in order:

1. **Read** the relevant code — not just the file being changed, but its callers/consumers where it matters.
2. **Explain** your understanding of the current behavior before proposing anything.
3. **Propose** the smallest implementation plan that solves the problem.
4. **Wait** for explicit approval before writing any code.
5. **Implement** exactly what was approved — no scope creep.
6. **Verify** the result by actually running it (dev server, manual exercise of the change, or the relevant test/lint/typecheck commands). Static review is not verification.
7. **Summarize** exactly what changed — files touched, behavior before/after, anything explicitly deferred.

Trivial, unambiguous requests (e.g., a typo fix the user explicitly names) can skip straight to implementation, but the verify-and-summarize steps still apply.

---

# Coding Standards

- **Stack**: React 18, Vite, Tailwind CSS + shadcn/ui, JavaScript/JSX (the repo is not TypeScript, despite `jsconfig.json`). Match existing file organization: `src/pages/` (one file per route, registered in `src/pages.config.js`), `src/components/`, `src/lib/`, `src/api/` (Base44 SDK wrappers), `base44/entities/*.jsonc` (config-as-code schema + RLS).
- Match the surrounding code's style and idioms rather than imposing new ones. Consistency beats personal preference.
- No speculative abstractions, no unused flags/params, no half-finished implementations. Three similar lines beat a premature helper.
- Don't duplicate fields or state that already exists elsewhere in the codebase (see the legacy/duplicate `Document` fields called out in `PROJECT_OVERVIEW.md` §11 as a cautionary example — do not add to that pattern).
- Maintain i18n coverage (`he`/`en`) via `src/components/translations.jsx` for any user-facing string.
- Run `npm run lint` and `npm run typecheck` before considering a change complete; fix, don't suppress, violations in code you touched.

---

# Git Workflow

- Keep commits small and scoped to one logical change.
- Feature branches for non-trivial work; `main` should stay in a working, deployable state.
- Never force-push, `reset --hard`, amend published commits, or delete branches without explicit user approval.
- Never skip git hooks (`--no-verify` or similar) without explicit approval — if a hook fails, fix the underlying issue.
- Investigate unfamiliar repo state (uncommitted changes, unexpected branches) before overwriting or discarding it — it may be someone's in-progress work.

---

# Security Rules

- **Never modify authentication, payments, security-sensitive logic, database schema/RLS rules, or environment variables without explicit user approval** — regardless of how small the change looks or how directly it seems required by the task at hand. Surface the need and ask first.
- Never trust client-supplied values (URL query params, request bodies, `localStorage`) for pricing, plan, or authorization decisions on the server. Server-side logic must validate against its own state (e.g., Stripe session `metadata`, not a `?plan=` query string — see `PROJECT_TASKS.md` §5 for a live example of this exact bug).
- Client-side gating (feature locks, role checks, disabled buttons) is UX only, never a security boundary. The real boundary is server-side RLS and function-level authorization.
- No secrets, credentials, or `.env` contents ever committed to the repository.
- Any new privileged/service-role code path must be justified in the plan presented before implementation — these are highest-blast-radius by default.

---

# Approval Rules

Explicit, per-instance user approval is required before:

- Touching authentication, payments, security logic, database schema/RLS, or environment variables.
- Any large-scale refactor or rewrite.
- Adding, removing, or upgrading dependencies.
- Any destructive or history-rewriting git operation (force-push, `reset --hard`, branch deletion, amending shared commits).
- Pushing to a remote, or opening/merging a pull request.
- Committing changes (never commit unless explicitly asked).

A prior approval covers only the scope it was given for. Do not extend it to adjacent changes without asking again. When in doubt about whether something needs approval, treat it as if it does.

---

# Testing Requirements

- **No automated test suite currently exists in this repo** (tracked as technical debt in `PROJECT_TASKS.md`). Until one exists, every change must be manually verified before being reported as done.
- For UI/frontend changes: start the dev server, exercise the golden path and relevant edge cases in a real browser, check the console for errors/warnings.
- For Base44 function / backend changes: verify actual behavior (e.g., via a real or simulated call), not just a static read of the code.
- Type-checking (`npm run typecheck`) and linting (`npm run lint`) verify code correctness, not feature correctness — never substitute them for manual verification of a UI or flow change.
- Introducing an automated test framework is a standing future priority (see `PROJECT_TASKS.md` §9). Once one exists, new code on payment-, auth-, or security-sensitive paths should come with tests.

---

# Commit Rules

- Only commit when the user explicitly asks.
- A commit contains exactly what was requested — never bundle unrelated or opportunistic changes into it.
- Never stage files broadly (`git add -A`/`.`); add the specific files that belong to the change.
- Commit messages explain *why*, in 1–2 sentences, not a restatement of the diff.
- Never commit files that may contain secrets (`.env`, credentials, keys).

---

# Pull Request Rules

- One logical change per PR — no grab-bag PRs mixing features, fixes, and cleanup.
- PR description states what changed, why, and includes a test/verification plan.
- Never merge without human review, regardless of who or what authored the change.
- PRs touching authentication, payments, security, database schema, or environment variables require explicit human sign-off beyond any agent-level approval already given.
- Never push directly to `main` for non-trivial changes; go through a PR.

---

# Documentation Rules

- `PROJECT_OVERVIEW.md` and `PROJECT_TASKS.md` are the canonical, living sources of truth for architecture and status/roadmap respectively. Keep them accurate:
  - When a tracked issue in `PROJECT_TASKS.md` is fixed, update its status there as part of the same change.
  - When architecture changes materially, reflect it in `PROJECT_OVERVIEW.md` rather than letting it drift out of date.
- This file (`CLAUDE.md`) governs *process*, not product behavior — don't add architecture description here; link to `PROJECT_OVERVIEW.md` instead.
- Don't create new standalone markdown docs for things that belong in one of the three files above. Avoid documentation sprawl.
- No comments-as-documentation in code beyond explaining non-obvious *why* (hidden constraints, workarounds, subtle invariants). Well-named code and these three docs are the documentation.

---

# Project Memory

Durable facts about this repo's current state that should inform every session, not just the one that discovered them:

- This is a production-grade SaaS product with real payment flows — there is no "throwaway" or "just prototyping" mode here.
- As of the last audit (`PROJECT_OVERVIEW.md`), there are **unresolved, real security issues** in the payment and plan-gating flows (client-trusted `plan` values, `?plan=` gating override, no payment-completion idempotency). Do not assume these are fixed unless `PROJECT_TASKS.md` says so, and do not introduce new instances of the same pattern (trusting client-supplied values for pricing/authorization) anywhere else in the codebase.
- Two structurally separate "user" entities exist (`User` and `Users`); `Users` is the one almost all real logic actually uses. Prefer it for any new work, and treat `User.jsonc` as legacy pending the resolution tracked in `PROJECT_TASKS.md`.
- Several `Document` fields are duplicated between legacy and current names (`ai_analysis`/`analysisResult`, `document_type`/`documentType`, `userId`/`ownerAuthId`). Prefer the current names in new code; don't add a third variant.
- There is no automated test suite and no CI — manual verification (per the Workflow and Testing sections above) is the only correctness signal available today.
