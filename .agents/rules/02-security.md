# Security rules (always on) — see docs/SECURITY.md

- Never put API keys, OAuth client secrets, or tokens in client code, `.env` committed files, logs or artifacts.
- Gemini and Google OAuth calls happen ONLY in the Cloudflare Worker, with secrets from `wrangler secret put` (`.dev.vars` locally, git-ignored).
- Firestore rules are deny-by-default and use `allowedUsers/{uid}` for access control; any new collection needs a rule + emulator test in the same change.
- **Multi-user isolation:** every Firestore rule and Worker route must scope data to the requesting `uid`. Never allow cross-uid reads or writes.
- Only the Worker service account may write `allowedUsers/`; admin Worker routes must verify `role == "admin"` before mutating this collection.
- Client never reads or writes `integrations/*`; never writes `voiceCaptures`, `stats`, `goals.savedPiasters`, `nextReminderAt`, `calendarEventId`, or `allowedUsers`.

- AI output is untrusted: validate with zod, show a confirmation card, never let voice/text commands delete or bulk-modify data.
- Sanitize any rendered markdown/HTML. No `eval`, no `innerHTML` with user data.
- Request the minimum OAuth scope (`calendar.events`). Use `state` + PKCE.
- Don't log amounts, transcripts, notes or tokens.
- Ask before adding any new third-party service or SDK.
