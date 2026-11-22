---
description: QA engineer full test pass (automated + manual browser walkthrough)
---

Act as `[QA]`.
1. Run `npm run lint`, `npm run typecheck`, `npm test`, emulator rules tests, Playwright e2e. Report results.
2. Start the dev server, open it in the browser at 390×844, dark mode, RTL. Walk: sign in → add task manually → add task by text "فكرني بكرة الساعة 5 اكلم أحمد" → add expense "صرفت 150 جنيه أكل" → create savings goal → check Today view and Finance dashboard.
3. Test offline: disable network, add a task, re-enable, confirm sync.
4. Check every screen for the 5 states and RTL layout bugs. Capture screenshots.
5. Produce a bug list (severity, steps, expected, actual) and a manual test script for my real phone (Android + iOS Home Screen install + push permission).
