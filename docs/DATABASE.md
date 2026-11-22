# Rafeeq — Data Model (Firestore)

Owner: `[DB]`. This file is the single source of truth. Code, rules and indexes must match it.

## Principles
1. **Everything user-owned lives under `users/{uid}/...`** → one rule pattern secures it all. Users can never cross-read.
2. **Money is an integer in piasters** (`amountPiasters`, 1 EGP = 100). Never store money as float.
3. **Times are Firestore `Timestamp` in UTC**; display in `Africa/Cairo`. Store `tz` on recurring items.
4. Every doc has `createdAt`, `updatedAt` (`serverTimestamp`). Deletes are **soft** (`deletedAt`) for
   tasks and transactions, so a mistaken voice command can be undone.
5. **Server-only data** (OAuth tokens) lives in top-level collections the client can never read.
6. Aggregates (monthly totals) are computed by the Cloudflare Worker into `stats/`, not on the client.
   "Server" in this file always means the Worker using a service account (bypasses rules).
7. **Access control lives in `allowedUsers/{uid}`** (top-level). Firestore rules read this to allow/deny
   any `users/{uid}` access. Max 10 documents (seats). Only the Worker (service account) may write this collection.

## Collections

### `allowedUsers/{uid}` — **server-written only (admin Worker routes)**
| Field | Type | Notes |
|---|---|---|
| role | `"admin"` \| `"member"` | exactly one doc must have `role: "admin"` |
| status | `"active"` \| `"inactive"` | only `"active"` users may use the app; deactivated users keep their data |
| email | string | informational; actual check uses `uid` |
| displayName | string | copy from Google Auth |
| invitedAt | timestamp | when the admin added this seat |
| updatedAt | timestamp | |

**Seat limit:** the Worker counts active docs before creating a new one; if count ≥ 10 it rejects the invite.
Clients may **read** their own `allowedUsers/{uid}` to know their role; they may **not write** it.

### `users/{uid}`
| Field | Type | Notes |
|---|---|---|
| displayName, email, photoURL | string | from Google |
| settings.timezone | string | default `Africa/Cairo` |
| settings.currency | string | `EGP` |
| settings.briefingTime | string `HH:mm` | morning briefing |
| settings.defaultReminderMin | int | e.g. 15 |
| settings.quietHours | map `{start,end}` | no pushes in this window |
| calendar.connected | bool | set by server |
| calendar.calendarId | string | default `primary` |
| createdAt, updatedAt | timestamp | |

### `users/{uid}/tasks/{taskId}`
| Field | Type | Notes |
|---|---|---|
| title | string 1–200 | required |
| notes | string ≤ 5000 | markdown, sanitized on render |
| status | `todo` \| `doing` \| `done` \| `cancelled` | |
| priority | `low` \| `medium` \| `high` \| `urgent` | |
| tags | string[] ≤ 10 | |
| dueAt | timestamp \| null | |
| allDay | bool | |
| reminderOffsetsMin | int[] ≤ 3 | e.g. `[60, 10]` |
| nextReminderAt | timestamp \| null | **computed by server**; scheduler queries this |
| recurrence | map \| null | `{ rrule: "FREQ=WEEKLY;BYDAY=TH", tz }` |
| parentTaskId | string \| null | subtasks |
| calendarEventId | string \| null | set by server |
| source | `manual` \| `voice` \| `text` \| `calendar` | |
| voiceCaptureId | string \| null | link to capture |
| completedAt, deletedAt | timestamp \| null | |
| createdAt, updatedAt | timestamp | |

### `users/{uid}/categories/{categoryId}`
`name`, `icon`, `color`, `kind` (`expense`|`income`), `monthlyBudgetPiasters` (int|null), `archived` (bool), `order` (int).

### `users/{uid}/transactions/{txId}`
| Field | Type | Notes |
|---|---|---|
| kind | `expense` \| `income` \| `transfer_to_goal` | |
| amountPiasters | int > 0, ≤ 10^9 | |
| currency | string | `EGP` |
| categoryId | string | must exist |
| note | string ≤ 500 | |
| occurredAt | timestamp | when money moved |
| paymentMethod | `cash` \| `card` \| `wallet` \| `instapay` \| `other` | |
| goalId | string \| null | for savings contributions |
| recurringId | string \| null | generated from a recurring rule |
| receiptText | string \| null ≤ 2000 | text Gemini extracted from the receipt (image itself is not stored) |
| source | `manual` \| `voice` \| `text` \| `receipt` \| `recurring` | |
| deletedAt, createdAt, updatedAt | timestamp | |

### `users/{uid}/goals/{goalId}` (savings goals)
`title`, `targetPiasters`, `savedPiasters` (**server-maintained** from contributions), `startDate`,
`deadline`, `period` (`weekly`|`monthly`), `requiredPerPeriodPiasters` (server-computed),
`feasibility` (`ok`|`tight`|`unrealistic`, server-computed), `status` (`active`|`achieved`|`paused`).

### `users/{uid}/recurring/{ruleId}`
Bills, subscriptions, salary. `kind`, `title`, `amountPiasters`, `categoryId`, `rrule`, `tz`,
`nextRunAt`, `autoCreate` (bool — create transaction automatically or just remind), `active`.

### `users/{uid}/debts/{debtId}`
`person`, `direction` (`owed_to_me`|`i_owe`), `amountPiasters`, `paidPiasters`, `dueAt`, `note`, `settledAt`.

### `users/{uid}/gameyas/{gameyaId}` (جمعية)
`title`, `membersCount`, `monthlyPiasters`, `startMonth` (`YYYY-MM`), `myTurn` (int), `payments` (map `YYYY-MM → bool`).

### `users/{uid}/voiceCaptures/{captureId}` — **server-written only**
`durationSec`, `transcript`, `parsed` (map, the Gemini JSON), `status`
(`needs_confirmation`|`confirmed`|`rejected`|`failed`), `resultRef` (path of created doc),
`createdAt`, `expireAt`. Audio is never stored. The daily cron job deletes captures past `expireAt` (30 days).

### `users/{uid}/devices/{deviceId}`
`pushSubscription` (map: `endpoint`, `keys.p256dh`, `keys.auth` — standard Web Push subscription),
`platform` (`android`|`ios`|`desktop`), `userAgent`, `createdAt`, `lastSeenAt`.
The Worker deletes a device when the push service answers 404/410.

### `users/{uid}/stats/{YYYY-MM}` — **server-written only**
`expensePiasters`, `incomePiasters`, `byCategory` (map id → piasters), `tasksDone`, `updatedAt`.

### `integrations/{uid}` — **server-only, client has NO access**
`google.refreshTokenEnc` (AES-256-GCM ciphertext, key in Secret Manager), `google.scope`,
`google.connectedAt`, `google.syncToken` (Calendar incremental sync).

### Rate limits & token cache — **Cloudflare Workers KV, not Firestore**
`rl:{uid}:{yyyy-mm-dd}` → AI call count (cap e.g. 200/day). `gtoken:sa` → service-account access token (TTL 55 min).
`gtoken:{uid}` → Google Calendar access token (TTL 55 min). Refresh token stays encrypted in Firestore `integrations/`.

## Free-quota budget (Spark: ~50K reads / 20K writes per day)
- Minute cron: 1 indexed collection-group query/min → ~1,440 reads/day worst case. OK.
- 10 users combined: estimate ~5,000 reads and ~1,000 writes/day under normal use — well within Spark limits.
  Stay safe: snapshot listeners on narrow queries only (Today tasks, current-month transactions); never "read all".
- Monthly `stats` doc is updated by the Worker per user when a transaction is confirmed, so dashboards read 1 doc per user.
- `allowedUsers` read: 1 read per Worker request (cached in KV for 60 s to avoid per-request reads).

## Indexes (`firestore.indexes.json`)
- `tasks`: collection group `(status ASC, nextReminderAt ASC)` → scheduler query.
- `tasks`: `(status ASC, dueAt ASC)` → Today/Upcoming views.
- `transactions`: `(deletedAt ASC, occurredAt DESC)`; `(categoryId ASC, occurredAt DESC)`.
- `recurring`: collection group `(active ASC, nextRunAt ASC)`.

## Files
No file storage (Cloud Storage needs Blaze). Audio (≤ 60 s) and receipt images (compressed to ≤ 1 MB on the
client) are sent in the request body to the Worker, forwarded inline to Gemini, then dropped.

## Backups (free)
- Settings → "Export backup" downloads a full JSON + CSV per collection; weekly reminder push to do it.
- "Import backup" restores from that JSON (validated with the shared zod schemas).
