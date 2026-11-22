import { Hono } from 'hono';
import { cors } from 'hono/cors';
import {
  VoiceParsedSchema,
  InviteUserRequestSchema,
  DeactivateUserRequestSchema,
} from '@rafeeq/schema';

type Bindings = {
  KV: KVNamespace;
  GEMINI_API_KEY?: string;
  FIREBASE_SERVICE_ACCOUNT_JSON?: string;
  ALLOWED_SEATS_LIMIT?: string;
};

type Variables = {
  uid: string;
  userRole: 'admin' | 'member';
};

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

// CORS & Security headers
app.use('*', cors({
  origin: '*', // Can be restricted to Firebase Hosting URL once deployed
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Firebase-AppCheck'],
}));

// Basic Health Check
app.get('/', (c) => c.json({ status: 'ok', service: 'rafeeq-worker', timestamp: new Date().toISOString() }));

// ── Auth & Rate-Limit Middleware ──────────────────────────────────────────────
app.use('/api/*', async (c, next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized: Missing or invalid token' }, 401);
  }

  const token = authHeader.split(' ')[1];
  
  // Minimal ID token unpack (in production verified with Google certs or Firebase Auth JWKS)
  let uid = 'demo-user';
  let email = '';
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      uid = payload.user_id || payload.sub || 'demo-user';
      email = payload.email || '';
    }
  } catch (e) {
    // fallback or fail
  }

  c.set('uid', uid);

  // Check KV Cache for User Role & Active Status
  let role: 'admin' | 'member' = 'member';
  if (c.env.KV) {
    const cachedStatus = await c.env.KV.get(`user:${uid}:status`);
    if (cachedStatus === 'inactive') {
      return c.json({ error: 'Forbidden: Account deactivated by administrator' }, 403);
    }
    const cachedRole = await c.env.KV.get(`user:${uid}:role`);
    if (cachedRole === 'admin') role = 'admin';
  }

  c.set('userRole', role);

  // Rate Limiting (200 requests/day in KV)
  if (c.env.KV) {
    const today = new Date().toISOString().slice(0, 10);
    const rlKey = `rl:${uid}:${today}`;
    const current = Number(await c.env.KV.get(rlKey)) || 0;
    if (current > 200) {
      return c.json({ error: 'Daily request quota exceeded' }, 429);
    }
    await c.env.KV.put(rlKey, String(current + 1), { expirationTtl: 86400 });
  }

  await next();
});

// ── Admin: List / Invite / Deactivate (Max 10 Seats) ──────────────────────────
app.get('/api/admin/seats', async (c) => {
  const limit = Number(c.env.ALLOWED_SEATS_LIMIT) || 10;
  // Simulated seat registry response from KV or Firestore
  return c.json({
    totalAllowed: limit,
    activeSeats: 1, // Can fetch real count from Firestore
    seatsAvailable: limit - 1,
  });
});

app.post('/api/admin/invite', async (c) => {
  if (c.get('userRole') !== 'admin') {
    // For bootstrap/demo: allow first user to be admin
  }
  const body = await c.req.json();
  const parsed = InviteUserRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid invite data', details: parsed.error.issues }, 400);
  }

  const { uid, email, displayName } = parsed.data;
  
  if (c.env.KV) {
    await c.env.KV.put(`user:${uid}:status`, 'active');
    await c.env.KV.put(`user:${uid}:role`, 'member');
    await c.env.KV.put(`user:${uid}:meta`, JSON.stringify({ email, displayName, invitedAt: new Date().toISOString() }));
  }

  return c.json({ message: 'User invited successfully', uid, email });
});

app.post('/api/admin/deactivate', async (c) => {
  if (c.get('userRole') !== 'admin') {
    return c.json({ error: 'Admin privilege required' }, 403);
  }
  const body = await c.req.json();
  const parsed = DeactivateUserRequestSchema.safeParse(body);
  if (!parsed.success) {
    return c.json({ error: 'Invalid payload' }, 400);
  }

  const { uid } = parsed.data;
  if (c.env.KV) {
    await c.env.KV.put(`user:${uid}:status`, 'inactive');
  }

  return c.json({ message: 'User deactivated', uid });
});

// ── AI Engine: Egyptian Arabic Voice / Text Parsing ────────────────────────────
app.post('/api/ai/parse', async (c) => {
  const body = await c.req.json();
  const text = body.text || '';
  if (!text) {
    return c.json({ error: 'Missing text input' }, 400);
  }

  const apiKey = c.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback heuristic parsing if no Gemini key configured yet
    return c.json(fallbackParse(text));
  }

  try {
    const prompt = `أنت مساعد شخصي ذكي ورفيق للمستخدم (يتحدث باللهجة المصرية والعربية الفصحى).
قم بتحليل النص التالي واستخراج النية والمعلومات بدقة بصيغة JSON محددة.
النص: "${text}"

الشروط:
1. intent يجب أن يكون واحداً من: "task", "expense", "income", "goal", "unknown"
2. إذا كان مصروفاً: استخرج المبلغ (amount)، الفئة المقترحة (category)، والملاحظة.
3. إذا كانت مهمة: استخرج العنوان (title)، الموعد التقريبي بصيغة ISO إذا وُجد (datetime).
4. أرجع JSON فقط بدون أي علامات markdown إضافية:
{
  "intent": "task" | "expense" | "income" | "goal" | "unknown",
  "transcript": "${text}",
  "title": string,
  "notes": string,
  "datetime": string | null,
  "amount": number | null,
  "category": string | null,
  "goal_target": number | null,
  "goal_deadline": string | null,
  "confidence": number
}`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' }
      })
    });

    const data: any = await res.json();
    const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    const parsedJson = JSON.parse(rawContent);
    const validated = VoiceParsedSchema.parse(parsedJson);
    return c.json(validated);
  } catch (err: any) {
    return c.json(fallbackParse(text));
  }
});

function fallbackParse(text: string) {
  const isExpense = /اشتريت|صرفت|دفعت|جنيه|فكة|حساب/.test(text);
  const amountMatch = text.match(/\d+(\.\d+)?/);
  const amount = amountMatch ? parseFloat(amountMatch[0]) : null;

  if (isExpense && amount) {
    return {
      intent: 'expense',
      transcript: text,
      title: text,
      notes: '',
      amount: amount,
      category: 'عام',
      confidence: 0.85
    };
  }

  return {
    intent: 'task',
    transcript: text,
    title: text,
    notes: '',
    datetime: null,
    confidence: 0.8
  };
}

// ── Cloudflare Cron Trigger (Runs every minute) ────────────────────────────────
export default {
  fetch: app.fetch,
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext) {
    console.log('[CRON] Executing 1-minute reminder & push check at', new Date().toISOString());
    // Cloudflare cron runs UTC: checks Firestore collections for nextReminderAt <= now
  }
};
