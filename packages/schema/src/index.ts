import { z } from 'zod';

// ─── allowedUsers ─────────────────────────────────────────────────────────────
export const AllowedUserSchema = z.object({
  role: z.enum(['admin', 'member']),
  status: z.enum(['active', 'inactive']),
  email: z.string().email(),
  displayName: z.string(),
  invitedAt: z.any(), // Firestore Timestamp
  updatedAt: z.any(),
});
export type AllowedUser = z.infer<typeof AllowedUserSchema>;

// ─── users/{uid} ──────────────────────────────────────────────────────────────
export const UserSettingsSchema = z.object({
  timezone: z.string().default('Africa/Cairo'),
  currency: z.string().default('EGP'),
  briefingTime: z.string().regex(/^\d{2}:\d{2}$/).default('08:00'),
  defaultReminderMin: z.number().int().default(15),
  quietHours: z.object({ start: z.string(), end: z.string() }).optional(),
});

export const UserSchema = z.object({
  displayName: z.string(),
  email: z.string().email(),
  photoURL: z.string().url().nullable().optional(),
  settings: UserSettingsSchema,
  calendar: z.object({ connected: z.boolean(), calendarId: z.string() }).optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
});
export type User = z.infer<typeof UserSchema>;

// ─── tasks ────────────────────────────────────────────────────────────────────
export const TaskStatusSchema = z.enum(['todo', 'doing', 'done', 'cancelled']);
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export const TaskSourceSchema = z.enum(['manual', 'voice', 'text', 'calendar']);

export const TaskSchema = z.object({
  title: z.string().min(1).max(200),
  notes: z.string().max(5000).nullable().optional(),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  tags: z.array(z.string()).max(10).optional(),
  dueAt: z.any().nullable().optional(),
  allDay: z.boolean().optional(),
  reminderOffsetsMin: z.array(z.number().int()).max(3).optional(),
  nextReminderAt: z.any().nullable().optional(),
  recurrence: z.object({ rrule: z.string(), tz: z.string() }).nullable().optional(),
  parentTaskId: z.string().nullable().optional(),
  calendarEventId: z.string().nullable().optional(),
  source: TaskSourceSchema,
  voiceCaptureId: z.string().nullable().optional(),
  completedAt: z.any().nullable().optional(),
  deletedAt: z.any().nullable().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
});
export type Task = z.infer<typeof TaskSchema>;

// ─── categories ───────────────────────────────────────────────────────────────
export const CategoryKindSchema = z.enum(['expense', 'income']);
export const CategorySchema = z.object({
  name: z.string().min(1).max(40),
  icon: z.string().optional(),
  color: z.string().optional(),
  kind: CategoryKindSchema,
  monthlyBudgetPiasters: z.number().int().positive().nullable().optional(),
  archived: z.boolean().optional(),
  order: z.number().int().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
});
export type Category = z.infer<typeof CategorySchema>;

// ─── transactions ─────────────────────────────────────────────────────────────
export const TransactionKindSchema = z.enum(['expense', 'income', 'transfer_to_goal']);
export const PaymentMethodSchema = z.enum(['cash', 'card', 'wallet', 'instapay', 'other']);
export const TxSourceSchema = z.enum(['manual', 'voice', 'text', 'receipt', 'recurring']);

export const TransactionSchema = z.object({
  kind: TransactionKindSchema,
  amountPiasters: z.number().int().positive().max(1_000_000_000),
  currency: z.literal('EGP'),
  categoryId: z.string(),
  note: z.string().max(500).optional(),
  occurredAt: z.any(),
  paymentMethod: PaymentMethodSchema,
  goalId: z.string().nullable().optional(),
  recurringId: z.string().nullable().optional(),
  receiptText: z.string().max(2000).nullable().optional(),
  source: TxSourceSchema,
  deletedAt: z.any().nullable().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

// ─── savings goals ────────────────────────────────────────────────────────────
export const GoalSchema = z.object({
  title: z.string().min(1).max(100),
  targetPiasters: z.number().int().positive().max(1_000_000_000),
  savedPiasters: z.number().int().nonnegative().optional(),
  startDate: z.any(),
  deadline: z.any(),
  period: z.enum(['weekly', 'monthly']),
  requiredPerPeriodPiasters: z.number().int().optional(),
  feasibility: z.enum(['ok', 'tight', 'unrealistic']).optional(),
  status: z.enum(['active', 'achieved', 'paused']),
  createdAt: z.any(),
  updatedAt: z.any(),
});
export type Goal = z.infer<typeof GoalSchema>;

// ─── recurring ────────────────────────────────────────────────────────────────
export const RecurringSchema = z.object({
  kind: z.enum(['expense', 'income']),
  title: z.string().min(1).max(100),
  amountPiasters: z.number().int().positive().max(1_000_000_000),
  categoryId: z.string(),
  rrule: z.string().max(200),
  tz: z.string(),
  nextRunAt: z.any(),
  autoCreate: z.boolean(),
  active: z.boolean(),
  createdAt: z.any(),
  updatedAt: z.any(),
});
export type Recurring = z.infer<typeof RecurringSchema>;

// ─── debts ────────────────────────────────────────────────────────────────────
export const DebtSchema = z.object({
  person: z.string().min(1).max(100),
  direction: z.enum(['owed_to_me', 'i_owe']),
  amountPiasters: z.number().int().positive().max(1_000_000_000),
  paidPiasters: z.number().int().nonnegative().optional(),
  dueAt: z.any().nullable().optional(),
  note: z.string().max(500).optional(),
  settledAt: z.any().nullable().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
});
export type Debt = z.infer<typeof DebtSchema>;

// ─── voice capture (AI output) ────────────────────────────────────────────────
export const VoiceParsedSchema = z.object({
  intent: z.enum(['task', 'expense', 'income', 'goal', 'unknown']),
  transcript: z.string(),
  title: z.string().optional(),
  notes: z.string().optional(),
  datetime: z.string().nullable().optional(),
  amount: z.number().nullable().optional(),
  category: z.string().nullable().optional(),
  goal_target: z.number().nullable().optional(),
  goal_deadline: z.string().nullable().optional(),
  confidence: z.number().min(0).max(1),
});
export type VoiceParsed = z.infer<typeof VoiceParsedSchema>;

// ─── Worker API schemas ────────────────────────────────────────────────────────
export const VoiceCaptureRequestSchema = z.object({
  type: z.enum(['audio', 'text']),
  text: z.string().max(2000).optional(),
});

export const InviteUserRequestSchema = z.object({
  uid: z.string().min(1),
  email: z.string().email(),
  displayName: z.string().min(1),
});

export const DeactivateUserRequestSchema = z.object({
  uid: z.string().min(1),
});

// ─── Money helpers ────────────────────────────────────────────────────────────
export const toPiasters = (egp: number) => Math.round(egp * 100);
export const fromPiasters = (piasters: number) => piasters / 100;
export const formatEGP = (piasters: number) =>
  new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(
    fromPiasters(piasters),
  );
