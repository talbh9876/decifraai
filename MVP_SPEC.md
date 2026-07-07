# Decifra — MVP Specification

> Product specification for the initial production launch. This defines what ships, not how it's built. For architecture, see `PROJECT_OVERVIEW.md`. For engineering backlog (technical debt, cleanup, testing, refactors), see `PROJECT_TASKS.md` — that work is real, but it is not part of this launch's product scope. For everything valuable that comes after this launch, see `POST_MVP_ROADMAP.md`.

## Vision

Decifra helps everyday people understand the legal and financial documents they're asked to sign or accept — employment contracts, rental agreements, pay slips, insurance policies, loan and purchase agreements — without needing a lawyer to read every page. A user uploads a document, gets an instant plain-language AI analysis, and can optionally pay for a real lawyer's written opinion when the stakes are high enough to want a human sign-off. Hebrew-first, built for the Israeli market.

## Target Users

- **Primary: Individual consumers** facing a document they don't fully understand and don't want to (or can't afford to) pay a lawyer to read in full — renters, employees, insurance/loan holders, and purchasers.
- **Secondary: Lawyers** who provide the paid review service on the platform and earn from it.
- **Internal: Decifra support/admin staff** who need to look up users, documents, and lawyer cases to resolve issues.

## Core User Journey

1. User signs up / logs in.
2. User uploads a document (PDF/image), selecting its category and type.
3. Decifra's AI analyzes it and returns a structured, plain-language breakdown (summary, key terms, risks, obligations, financial terms).
4. User browses the analysis; some depth is gated by their subscription plan.
5. User optionally upgrades their plan (via Stripe) to unlock more scans or deeper access.
6. User optionally pays for a human lawyer review; the request routes to a lawyer, who submits a written opinion the user then sees attached to their document.
7. User organizes documents into folders and gets notified when analysis or lawyer review is ready.

## MVP Features

**1. Account & Authentication**
Sign up, log in, and stay securely signed in. Role support for regular users, lawyers, and admins.

**2. Document Upload & Quota**
Upload a document, choose its category/type, and have it count against the plan's scan limit (free/beginner/pro/business).

**3. AI Document Analysis**
Core structured analysis: executive summary, key terms, risks, obligations, financial terms, inconsistencies/cross-references. Specialized compliance check for pay slips (minimum wage, deduction sanity checks).

**4. Analysis Viewing Experience**
Tabbed results UI, Hebrew-first with English support.

**5. Subscription Plans & Billing**
Four tiers (free/beginner/pro/business), secure Stripe Checkout for upgrades. The plan a user ends up on must always match what they actually paid for.

**6. Human Lawyer Review**
Request and securely pay for a review; it's routed to a lawyer's dashboard; the lawyer submits a written opinion; the client reliably sees it against the correct document.

**7. Document Organization**
Folders to organize uploaded documents.

**8. Notifications**
Email and in-app notifications for key events (analysis complete, lawyer review complete).

**9. Account & Profile Management**
View/edit profile, see current plan and usage.

**10. Legal & Trust Pages**
Terms of Service, Privacy Policy, Accessibility statement, FAQ, About, Support/contact.

**11. Minimal Admin Tools**
Support staff can look up users, documents, and lawyer cases, and assign the lawyer role — enough to run support without touching the database directly.

### Security, Payment & Legal Requirements (non-negotiable for launch)

These aren't separate features — they're correctness requirements on features 5 and 6 above, required before any real customer can pay real money:

- A user's plan after upgrading must reflect **only** what they actually paid for — never a value the browser can influence.
- Paid-feature access must be decided by the server, not overridable by anything in the page URL.
- A paid lawyer review must reliably attach to the correct document every time — today it does not.
- Replaying or reusing a payment confirmation must never grant a second upgrade or a second lawyer case for one payment.
- AI analysis usage must be capped server-side against the user's plan, so costs can't exceed what a plan actually pays for.
- Terms of Service and Privacy Policy must be accurate and reachable before signup.

## Features Explicitly Excluded from MVP

These are real, valuable, and planned — see `POST_MVP_ROADMAP.md` — but not required to launch:

- AI Advisor, Document Comparison, Legal Research Assistant, Document Chatbot, contract simulation ("what happens if...") tooling.
- Document export (PDF) and sharing analysis with others.
- Activity history / audit log for a user's own actions.
- Advanced admin tooling (usage dashboards, quota editing beyond lookups).
- Dark mode.
- Multi-seat / enterprise accounts, SSO.
- Native mobile apps.
- Marketing features (referrals, campaigns, affiliate program).

Also explicitly out of scope for this document: architecture rework, entity/schema unification, automated testing, dead-code removal, and any other pure engineering-quality work. That's tracked in `PROJECT_TASKS.md` and doesn't gate launch unless it produces a customer-visible or security/payment problem (in which case it's already listed above).

## Success Criteria

- A new user can go from signup to a completed AI analysis without errors, in a small number of minutes.
- Zero known instances of the plan/pricing security bypass in production.
- Every paid lawyer review reaches a lawyer and its opinion reliably reaches the client — no broken document links.
- No duplicate-grant or double-charge incidents from replayed payment confirmations.
- Support can resolve a user/plan/lawyer-case issue using admin tools alone, without direct database access.
- Baseline uptime target met during the initial launch window (target: 99.5%).

## Launch Checklist

- [ ] Plan-trust payment bug fixed and verified end-to-end across all four plans.
- [ ] `?plan=` client-side gating override removed; feature access confirmed to be server-enforced.
- [ ] `LawyerCase` document-linking bug fixed; verified with a real end-to-end test case.
- [ ] Payment completion idempotency verified (replaying a success URL has no additional effect).
- [ ] AI quota enforcement verified server-side for core analysis.
- [ ] Terms of Service and Privacy Policy reviewed, accurate, and published.
- [ ] Production secrets/environment configured and verified (no dev/test keys live).
- [ ] Stripe account in live mode; a real test transaction completed successfully.
- [ ] Error monitoring/alerting active in production.
- [ ] Support/contact channel live and monitored.
- [ ] Full manual QA pass of the golden path: signup → upload → analysis → upgrade → lawyer review → opinion delivered.
- [ ] Admin can view/manage users and lawyer cases through the admin tools.
- [ ] Legal/trust pages (Terms, Privacy, Accessibility, FAQ) reviewed for accuracy.
