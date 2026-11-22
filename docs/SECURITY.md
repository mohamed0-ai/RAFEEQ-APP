# Rafeeq — Security Design & Checklist

Owner: `[SEC]`. The app holds personal schedule + financial data + a Google Calendar token for up to 10 users.
Main risks: unauthorized sign-in, cross-user data access, leaked tokens/keys, cost attacks on Gemini,
AI misreading a voice command into a destructive action, and an admin account compromise.

## Threat model (summary)
| # | Threat | Control |
|---|---|---|
| T1 | A Google account not in `allowedUsers` signs in and reads/writes data | Firestore rules check `exists(/allowedUsers/$(uid))` **and** `get(/allowedUsers/$(uid)).data.status == "active"` **and** `uid` match; Worker verifies same before every route |
| T2 | Authenticated user reads another user's data | Every `users/{uid}` rule checks `request.auth.uid == uid`; Worker routes always scope Firestore queries to the requesting uid |
| T3 | Scripts abuse the Worker / Gemini | App Check (reCAPTCHA v3, free) on Firestore + verified in Worker; ID-token check; KV rate limit per uid per day; strict CORS. No billing account → worst case is hitting free quotas, never a bill |
| T4 | Google refresh token leaked | Stored only server-side in `integrations/`, encrypted AES-256-GCM with key kept as a Worker secret; minimal scope `calendar.events`; revoke on disconnect |
| T5 | API keys in the repo | All secrets via `wrangler secret put`; `.env*` / `.dev.vars` git-ignored; `gitleaks` in CI |
| T6 | XSS via task notes (markdown) | Render with DOMPurify; strict CSP; no `dangerouslySetInnerHTML` without sanitizing |
| T7 | Prompt injection / wrong parse from voice | Transcript treated as data, never instructions; Gemini output validated with zod; **always a confirmation card**; voice can never delete or bulk-edit |
| T8 | OAuth CSRF / code interception | Authorization-code flow with `state` + PKCE, exact redirect URI allowlist, `prompt=consent`, `access_type=offline` |
| T9 | Malicious / huge uploads to the Worker | Max body 5 MB, MIME allowlist (audio/webm, audio/mp4, image/jpeg, image/webp), max 60 s audio; nothing is persisted |
| T10 | Admin account compromise giving attacker full user list + invite power | Admin role enforced server-side; admin routes require `allowedUsers/{uid}.role == "admin"` verified by the Worker; admin UI shows no other user's personal data |
| T11 | Deactivated user still reads data via cached token | Firestore rules re-check `allowedUsers/{uid}.status` on every request; Worker also re-checks (with 60 s KV cache); client forced to sign out on 403 |
| T12 | Sending all finance data to AI | "Ask my data" uses function-calling with aggregated query results only, never a full dump |
| T13 | Data sent to Gemini free tier may improve Google products | Send the minimum: one capture at a time, aggregates only; never account numbers; documented trade-off |
| T14 | Lost/stolen phone | Data cached in IndexedDB: sign-out clears persistence; optional app PIN / WebAuthn lock (phase 5) |
| T15 | Vulnerable dependencies | `npm audit` + Dependabot; pin versions; review new deps |
| T16 | Data loss | Soft deletes + weekly manual JSON/CSV export per user |

## Mandatory controls checklist (run on every release — `/security-review`)
- [ ] `firestore.rules` deny by default; `allowedUsers` lookup used in every `isAllowed(uid)` function; emulator rules tests pass (allowed-active uid OK, allowed-inactive uid denied, uid not in allowedUsers denied, unauthenticated denied, cross-uid denied, invalid fields denied).
- [ ] Server-only collections (`integrations`, `voiceCaptures` writes, `stats` writes, `allowedUsers` writes) unreachable from client.
- [ ] Every Worker route: verifies Firebase ID token (JWKS, `aud`/`iss`/`exp`), App Check token, `allowedUsers` active check (KV-cached 60 s), scoped to requesting uid, zod validation, KV rate limit, CORS locked to the app origin.
- [ ] Admin Worker routes additionally verify `allowedUsers/{uid}.role == "admin"` before mutating `allowedUsers`.
- [ ] Seat cap enforced server-side: Worker counts active `allowedUsers` docs before accepting a new invite; rejects if ≥ 10.
- [ ] Cron handler is not reachable over HTTP.
- [ ] No billing account linked to Firebase / Google Cloud; Cloudflare on Workers Free.
- [ ] No secret, key or token in client bundle (`grep dist/` for `AIza`, `sk-`, `ya29.`, `1//`).
- [ ] Gemini key never sent to client; model output schema-validated.
- [ ] OAuth scope is exactly `https://www.googleapis.com/auth/calendar.events` (+ openid/email).
- [ ] CSP (with Worker origin in `connect-src`), HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy: microphone=(self)` set in `firebase.json`.
- [ ] Logs contain no amounts, transcripts or tokens (log IDs only).
- [ ] Gemini key is a free-tier AI Studio key from a project with no billing.
- [ ] Dependencies audited, no high/critical.

## OAuth app note (up to 10 users)
Keep the Google OAuth consent screen in **Testing** mode and add all 10 Google accounts as test users.
If refresh tokens expire (Testing mode → 7-day expiry), move to **In production** (unverified is fine;
users will see the "unverified app" warning once per account).

