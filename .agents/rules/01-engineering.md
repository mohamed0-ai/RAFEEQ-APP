# Engineering rules (always on)

- ZERO COST: never add Firebase Cloud Functions, Cloud Storage, Blaze-only features or any paid API. Check free-tier limits before using a service.
- TypeScript `strict: true` in web and worker. No `any` unless commented why.
- Folder structure:
  - `web/src/features/<feature>/{components,hooks,api,types}.ts(x)` — feature-sliced.
  - `web/src/lib/` shared utils (firebase init, dates, money).
  - `worker/src/{routes,cron,auth,calendar,ai,push,finance,firestore,admin,shared}/` — Cloudflare Worker (Hono), `wrangler.toml` with one cron `* * * * *`.
- One shared `packages/schema` (zod) used by both web and worker for every document type in `docs/DATABASE.md` (including `AllowedUser` schema).
- Worker Free has 10 ms CPU per invocation: cache Google tokens and `allowedUsers` lookups in KV (60 s TTL), use Web Crypto, avoid heavy libraries.
- Money: integer piasters only; format with `Intl.NumberFormat('ar-EG', {style:'currency', currency:'EGP'})`.
- Dates: store UTC Timestamps; convert with `date-fns-tz` using the user's `settings.timezone`.
- All Firestore access goes through typed repository functions, not inline in components.
- Every Worker route: CORS check → Firebase ID token → App Check → `allowedUsers` active check (KV-cached 60 s) → uid-scoped → zod validation → KV rate limit → logic → structured log (IDs only).
- Admin Worker routes additionally: check `allowedUsers/{uid}.role == "admin"` → seat count ≤ 10 (for invites) → then mutate `allowedUsers`.
- Conventional commits (`feat:`, `fix:`, `chore:`…). Small PRs, one concern.
- Tests: every util and function has unit tests; every rules change has emulator tests (including cross-uid and allowedUsers tests); critical flows have Playwright e2e.
- Never break the build: run `lint`, `typecheck`, `test` before declaring a task done.

