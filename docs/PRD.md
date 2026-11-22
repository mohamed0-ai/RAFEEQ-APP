# Rafeeq — Product Requirements

Owner: `[PM]`. Closed PWA for **up to 10 invited users** (no self-registration). One user is the admin.
Arabic RTL (English technical terms OK), dark mode default, mobile-first. Each user's data is fully isolated.

## Stack — ZERO COST, NO CREDIT CARD (see docs/adr/0001-zero-cost-stack.md)
React + Vite + TypeScript, Tailwind, vite-plugin-pwa (Workbox), TanStack Query, zod, date-fns-tz.
Firebase **Spark plan only**: Auth (Google), Firestore w/ offline persistence, App Check, Hosting.
**Forbidden:** Cloud Functions, Cloud Storage for Firebase, anything requiring Blaze or a billing account.
Backend: **Cloudflare Workers Free** (TypeScript, Hono router) + one Cron Trigger + Workers KV.
Push: Web Push (VAPID) sent from the Worker. AI: Gemini API free tier, called only from the Worker.
Google Calendar API v3. Tests: Vitest, Testing Library, Playwright, Firebase emulator (Auth + Firestore), `wrangler dev`.

## Phases
**Phase 0 — Foundation:** repo (`web/`, `worker/`, `packages/schema`), lint/format/typecheck, GitHub Actions CI (free), Firebase project on Spark, Cloudflare Worker skeleton with ID-token + App Check verification, emulators, **allowedUsers-based access control** (Worker and Firestore rules both check `allowedUsers/{uid}` exists and `status == "active"`; max 10 seats enforced by Worker before creating a new entry), `allowedUsers` collection seeded with the admin's UID + `role: "admin"`, rules + rules tests, PWA shell (manifest, icons, offline page, shortcuts: "تسجيل صوتي", "إضافة مصروف").

**Phase 1 — Tasks & Schedule:** CRUD, subtasks, priority, tags, recurrence, reminders; views Today / Upcoming / Calendar (month/week) / Overdue; bottom nav Home · Tasks · Finance · Settings.

**Phase 2 — Voice & text capture:** mic button, MediaRecorder (iOS m4a / Android webm, max 60 s), POST audio directly to the Worker (no storage) → Gemini inline audio with strict response schema `{intent, transcript, title, notes, datetime, amount, category, goal_target, goal_deadline, confidence}`; resolve Egyptian-Arabic relative dates ("بكرة الساعة 5", "الخميس الجاي") in Africa/Cairo; editable confirmation card; same pipeline for typed text. `[AI]` keeps an eval set of ≥ 30 phrases with expected JSON.

**Phase 3 — Calendar & notifications:** OAuth code flow + PKCE handled by the Worker, two-way sync (incremental `syncToken`), event popup reminders (free, reliable second channel); Web Push (VAPID) from the Worker, Cron Trigger every minute on `nextReminderAt`, actions Done / Snooze 10 min, quiet hours, morning briefing; iOS install guide screen (push needs Home Screen install, iOS 16.4+).

**Phase 4 — Finance:** transactions, categories with monthly budgets (alerts 80% / 100%), dashboard charts, savings goals with plan `(target − saved) / remaining periods` + feasibility vs average monthly surplus, recurring bills/subscriptions, debts, جمعية tracker, receipt photo (compressed client-side, sent to Worker, not stored) → Gemini → prefilled expense.

**Phase 5 — Smart extras:** "Ask my data" (function-calling over aggregated queries), overdue rescheduling suggestions, weekly review, CSV export, app lock (WebAuthn/PIN), Lighthouse ≥ 90.

## Non-functional
- Offline reads + queued writes; first load < 2.5 s on 4G.
- Accessibility: tap targets ≥ 44px, contrast AA, screen-reader labels in Arabic.
- Cost: **0** — no billing account exists on Firebase, Google Cloud or Cloudflare. Any design that needs one is rejected.
- Multi-user isolation: a user may never read or write another user's `users/{uid}` subtree. Firestore rules and Worker routes both enforce this independently.
- Admin panel (Settings → Admin, visible only to `role: "admin"`): list users, invite (add UID to `allowedUsers`), deactivate, re-activate. Max 10 active seats total; Worker rejects the invite if the count is already 10.
- Backup: weekly reminder to export JSON/CSV per user from Settings (no paid backups).
- Quota note (Spark ~50 K reads / 20 K writes per day): 10 users each doing normal daily use ≈ 10× single-user load; keep client queries narrow (snapshot listeners on Today + this month only), and design Worker cron to query collection-group indexes, not scan all users.

