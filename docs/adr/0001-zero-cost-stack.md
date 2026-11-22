# ADR 0001 — Zero-cost stack (no credit card anywhere)

Status: Accepted. Owner: [ARCH] + [OPS].

## Context
Requirement: the whole project must cost 0 EGP and must not require adding a payment card.
- Firebase Cloud Functions (incl. scheduled functions) and Cloud Storage for Firebase need the Blaze plan → card required. **Not allowed.**
- Firebase Spark plan (no card) still gives: Auth (Google sign-in), Cloud Firestore (free daily quota), Hosting, App Check, Cloud Messaging.

## Decision
| Need | Service (free, no card) |
|---|---|
| Hosting PWA | Firebase Hosting (Spark) — or Cloudflare Pages |
| Auth | Firebase Auth, Google provider (Spark) |
| Database | Cloud Firestore (Spark) with offline persistence |
| Backend API (Gemini proxy, OAuth code exchange, Calendar sync) | **Cloudflare Workers Free** (100k requests/day) |
| Scheduler (reminders every minute, morning briefing, recurring, cleanup) | **Cloudflare Cron Trigger** — ONE trigger `* * * * *` that dispatches all jobs (free plan allows 5 per account) |
| Small server cache (Google access tokens, rate-limit counters) | Cloudflare Workers KV (free) |
| Push notifications | Web Push with VAPID keys sent from the Worker (free), no Firebase Functions needed |
| Voice + receipt AI | Gemini API **free tier** (Google AI Studio key, no card) |
| Calendar | Google Calendar API (free) |
| Files (voice audio, receipts) | **Not stored.** Sent to the Worker in the request body, forwarded to Gemini, then discarded. Only text results are saved in Firestore. |
| Coding | Antigravity Free plan with Gemini 3.8 Flash |

## How the Worker talks to Firestore
- User requests: the Worker verifies the Firebase **ID token** (JWKS) + **App Check token** (JWKS), then calls the Firestore REST API.
- Cron jobs: the Worker signs a JWT with a Firebase **service account** (secret stored with `wrangler secret put`), exchanges it for an access token (cached in KV ~55 min), and uses the Firestore REST API.

## Constraints to respect
- Workers Free: 10 ms **CPU** per invocation (waiting on fetch doesn't count) → cache tokens in KV, keep jobs light, batch Firestore reads with `runQuery`.
- Cron runs in **UTC** → convert Africa/Cairo times in code.
- Firestore Spark quota: ~50K reads/day, 20K writes/day, 1 GiB → comfortable for 10 light users under normal use; the minute cron must query only `nextReminderAt <= now` (indexed collection-group), never scan.
  Estimate ~5K reads + ~1K writes/day across all 10 users combined — well within quota. Monitor via Firebase console; add a `[OPS]` quota alert if daily reads exceed 40K.
- KV Free: 1,000 writes/day → cache `allowedUsers` lookups (60 s TTL, write on miss/expiry) and rate-limit counters only on actual AI calls; don't write KV on every request.
- Gemini free tier: content may be used by Google to improve products → send the minimum (never the full finance history; "Ask my data" sends aggregates only).
- No PITR/scheduled exports (need billing) → weekly in-app **JSON/CSV export** to the phone + Google Drive manual upload.

## Consequences
+ Zero cost, zero risk of a surprise bill (there is no billing account at all).
− Two platforms (Firebase + Cloudflare) to configure; no stored audio/receipt images.
