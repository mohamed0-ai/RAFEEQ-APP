---
description: Security engineer review of the current branch against docs/SECURITY.md
---

Act as `[SEC]`.
1. List changed files (`git diff --name-only main...HEAD`).
2. For every item in the "Mandatory controls checklist" of `docs/SECURITY.md`, report PASS / FAIL / N/A with evidence (file + line or command output).
3. Run: `npm audit --omit=dev`, rules tests on the emulator, and a secret scan (`npx gitleaks detect` or grep `dist/` for `AIza|ya29\.|1//|sk-`).
4. Try to break the rules: write emulator tests as another uid and as unauthenticated for every collection touched.
5. Output a table of findings with severity (critical/high/medium/low) and a fix for each. Fix critical/high before finishing.
