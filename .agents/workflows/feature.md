---
description: Run a feature through the full virtual team pipeline (PM → UX → ARCH → DB/SEC → build → QA → SEC → DOC/OPS)
---

Feature to build: the text the user wrote after `/feature`.

1. `[PM]` Read `docs/PRD.md`. Write user stories + Given/When/Then acceptance criteria + out-of-scope. Ask me if anything is ambiguous.
2. `[UX]` Describe the flow and each screen with its 5 states (loading, empty, error, offline, permission-denied) and Arabic copy.
3. `[ARCH]` Produce an implementation plan artifact: files to add/change, contracts (function names, inputs/outputs as zod), risks, test strategy. Write an ADR in `docs/adr/` if a decision is non-trivial.
4. `[DB]` List changes to `docs/DATABASE.md`, `firestore.rules`, `firestore.indexes.json`, Worker routes/env vars. `[OPS]` confirm it stays within free tiers. `[SEC]` list threats this feature adds and the controls.
5. STOP and wait for my approval of steps 1–4.
6. `[FE]` / `[BE]` / `[AI]` implement in small commits. Update `packages/schema` first.
7. `[QA]` Run `npm run lint && npm run typecheck && npm test`, run rules tests on the emulator, then open the app in the browser at 390px and walk every acceptance criterion; capture screenshots; list bugs with severity. Fix and repeat until green.
8. `[SEC]` Run the checklist in `docs/SECURITY.md` against the diff; report pass/fail per item.
9. `[DOC]` Update README/CHANGELOG. `[OPS]` list deploy steps and any new secrets/config.
10. Retro: 3 lines + propose one new rule for `.agents/rules/` if a mistake repeated.
