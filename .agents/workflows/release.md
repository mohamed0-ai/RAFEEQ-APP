---
description: DevOps release to production Firebase project
---

Act as `[OPS]`.
1. Confirm `/qa` and `/security-review` passed on this commit.
2. Bump version, update CHANGELOG.
3. `npm run build`; verify no secrets in `dist/`; run Lighthouse (PWA installable, performance ≥ 90).
4. Deploy Worker with `wrangler deploy` (staging env first) and smoke-test with `wrangler tail`.
5. `firebase deploy --only hosting,firestore` (Spark plan); confirm App Check enforcement is on for Firestore.
6. Verify: no billing account linked anywhere, usage well under free quotas (Firestore, Workers, Gemini), backup export works. Write release notes (Arabic, 5 lines max).
