/**
 * Plato Backend Server
 * Express + Supabase auth + USDA FoodData Central API
 * 
 * Routes:
 *   GET  /api/health          - health check
 *   POST /api/auth/signup     - create account
 *   POST /api/auth/login      - sign in
 *   POST /api/auth/logout     - sign out
 *   GET  /api/food/search     - search USDA food database
 *   GET  /api/food/:fdcId     - get food nutrient detail
 *   POST /api/log             - log a meal entry
 *   GET  /api/log             - get today's log (or ?date=YYYY-MM-DD)
 *   GET  /api/log/history     - get last 30 days of logs
 *   DELETE /api/log/:id       - delete a log entry
 *   GET  /api/profile         - get user profile / targets
 *   PUT  /api/profile         - update profile / macro targets
 *   GET  /api/streak          - get current streak
 *
 * Environment variables:
 *   SUPABASE_URL          - your Supabase project URL
 *   SUPABASE_SERVICE_KEY  - service role key (server-side only)
 *   USDA_API_KEY          - optional, increases rate limits (https://fdc.nal.usda.gov/api-guide.html)
 *   PORT                  - server port (default 3000)
 *   JWT_SECRET            - for session tokens
 */

import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Database from 'better-sqlite3';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000');
const JWT_SECRET = process.env.JWT_SECRET || 'plato-dev-secret-change-in-prod';
const USDA_API_KEY = process.env.USDA_API_KEY || 'DEMO_KEY'; // DEMO_KEY works, just rate-limited

// â”€â”€â”€ SQLite Database â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const dbPath = process.env.NODE_ENV === 'production'
  ? '/app/data/plato.db'
  : path.join(process.cwd(), 'plato.db');

if (process.env.NODE_ENV === 'production') {
  const { mkdirSync } = await import('fs');
  mkdirSync('/app/data', { recursive: true });
}

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    username TEXT,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS profiles (
    user_id TEXT PRIMARY KEY,
    name TEXT,
    age INTEGER,
    gender TEXT,
    height_cm REAL,
    weight_kg REAL,
    goal TEXT DEFAULT 'maintain',
    activity_level TEXT DEFAULT 'moderate',
    calorie_target INTEGER DEFAULT 2000,
    protein_target INTEGER DEFAULT 150,
    carb_target INTEGER DEFAULT 200,
    fat_target INTEGER DEFAULT 65,
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS meal_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    calories REAL NOT NULL DEFAULT 0,
    protein REAL NOT NULL DEFAULT 0,
    carbs REAL NOT NULL DEFAULT 0,
    fat REAL NOT NULL DEFAULT 0,
    slot TEXT DEFAULT 'snack',
    source TEXT DEFAULT 'manual',
    notes TEXT,
    logged_at TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS meal_logs_user_date ON meal_logs(user_id, date);
  CREATE INDEX IF NOT EXISTS meal_logs_user_logged ON meal_logs(user_id, logged_at);

  CREATE TABLE IF NOT EXISTS water_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount_ml INTEGER NOT NULL,
    date TEXT NOT NULL,
    logged_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS water_log_user_date ON water_log(user_id, date);

  CREATE TABLE IF NOT EXISTS weight_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    weight_kg REAL NOT NULL,
    date TEXT NOT NULL,
    note TEXT,
    logged_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
  CREATE INDEX IF NOT EXISTS weight_log_user_date ON weight_log(user_id, date);
`);

// â”€â”€â”€ Auth helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function signToken(userId: string) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

function authMiddleware(req: any, res: any, next: any) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// â”€â”€â”€ USDA Food Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function searchUSDA(query: string, pageSize = 20) {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(query)}&pageSize=${pageSize}&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS)&api_key=${USDA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA API error: ${res.status}`);
  const data: any = await res.json();

  return (data.foods || []).map((food: any) => {
    const nutrients = food.foodNutrients || [];
    const get = (id: number) => nutrients.find((n: any) => n.nutrientId === id)?.value ?? 0;

    return {
      fdcId: food.fdcId,
      name: food.description,
      brand: food.brandOwner || food.brandName || null,
      category: food.foodCategory,
      serving: food.servingSizeUnit
        ? `${food.servingSize || 100}${food.servingSizeUnit}`
        : '100g',
      calories: Math.round(get(1008)),   // Energy (kcal)
      protein: Math.round(get(1003) * 10) / 10,  // Protein
      carbs: Math.round(get(1005) * 10) / 10,    // Carbohydrate
      fat: Math.round(get(1004) * 10) / 10,      // Total fat
      fiber: Math.round(get(1079) * 10) / 10,    // Fiber
      sugar: Math.round(get(2000) * 10) / 10,    // Sugar
    };
  }).filter((f: any) => f.calories > 0);
}

async function getUSDAFood(fdcId: string) {
  const url = `https://api.nal.usda.gov/fdc/v1/food/${fdcId}?api_key=${USDA_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`USDA API error: ${res.status}`);
  return res.json();
}

// â”€â”€â”€ Server â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

async function startServer() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  // â”€â”€ Health â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'plato-backend',
      version: '1.0.0',
      uptime: Math.floor(process.uptime()),
    });
  });

  // â”€â”€ Auth â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, username, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'email and password required' });

      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
      if (existing) return res.status(409).json({ error: 'Email already in use' });

      const id = randomUUID();
      const hash = await bcrypt.hash(password, 10);
      db.prepare('INSERT INTO users (id, email, username, password_hash) VALUES (?, ?, ?, ?)').run(
        id, email.toLowerCase(), username || email.split('@')[0], hash
      );
      db.prepare('INSERT INTO profiles (user_id) VALUES (?)').run(id);

      const token = signToken(id);
      res.json({ token, userId: id });
    } catch (err) {
      res.status(500).json({ error: 'Signup failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email?.toLowerCase());
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.password_hash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const token = signToken(user.id);
      res.json({ token, userId: user.id });
    } catch {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // â”€â”€ Food Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  app.get('/api/food/search', authMiddleware, async (req: any, res) => {
    const query = String(req.query.q || '').trim();
    if (!query || query.length < 2) return res.status(400).json({ error: 'Query too short' });

    try {
      const results = await searchUSDA(query, 25);
      res.json({ results, query });
    } catch (err) {
      res.status(500).json({ error: 'Food search failed', detail: String(err) });
    }
  });

  app.get('/api/food/:fdcId', authMiddleware, async (req: any, res) => {
    try {
      const food = await getUSDAFood(req.params.fdcId);
      res.json(food);
    } catch (err) {
      res.status(500).json({ error: 'Food lookup failed' });
    }
  });

  // â”€â”€ Meal Log â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  app.post('/api/log', authMiddleware, (req: any, res) => {
    try {
      const { name, calories, protein, carbs, fat, slot, source, notes, loggedAt } = req.body;
      if (!name) return res.status(400).json({ error: 'name required' });

      const ts = loggedAt || new Date().toISOString();
      const date = ts.split('T')[0];
      const id = randomUUID();

      db.prepare(`
        INSERT INTO meal_logs (id, user_id, name, calories, protein, carbs, fat, slot, source, notes, logged_at, date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, req.userId, name, calories || 0, protein || 0, carbs || 0, fat || 0,
        slot || 'snack', source || 'manual', notes || null, ts, date);

      res.json({ ok: true, id, date });
    } catch (err) {
      res.status(500).json({ error: 'Log failed', detail: String(err) });
    }
  });

  app.get('/api/log', authMiddleware, (req: any, res) => {
    const date = String(req.query.date || new Date().toISOString().split('T')[0]);
    const entries = db.prepare(
      'SELECT * FROM meal_logs WHERE user_id = ? AND date = ? ORDER BY logged_at ASC'
    ).all(req.userId, date);

    const totals = entries.reduce((acc: any, e: any) => ({
      calories: acc.calories + (e.calories || 0),
      protein: acc.protein + (e.protein || 0),
      carbs: acc.carbs + (e.carbs || 0),
      fat: acc.fat + (e.fat || 0),
    }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

    res.json({ date, entries, totals });
  });

  app.get('/api/log/history', authMiddleware, (req: any, res) => {
    const days = Math.min(parseInt(String(req.query.days || '30')), 90);
    const entries = db.prepare(`
      SELECT date,
        SUM(calories) as calories,
        SUM(protein) as protein,
        SUM(carbs) as carbs,
        SUM(fat) as fat,
        COUNT(*) as meal_count
      FROM meal_logs
      WHERE user_id = ?
        AND date >= date('now', ?)
      GROUP BY date
      ORDER BY date DESC
    `).all(req.userId, `-${days} days`);

    res.json({ history: entries, days });
  });

  app.delete('/api/log/:id', authMiddleware, (req: any, res) => {
    const result = db.prepare(
      'DELETE FROM meal_logs WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.userId);

    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  });

  // â”€â”€ Profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  app.get('/api/profile', authMiddleware, (req: any, res) => {
    const user: any = db.prepare('SELECT id, email, username, created_at FROM users WHERE id = ?').get(req.userId);
    const profile: any = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId);
    res.json({ user, profile });
  });

  app.put('/api/profile', authMiddleware, (req: any, res) => {
    const { name, age, gender, height_cm, weight_kg, goal, activity_level,
            calorie_target, protein_target, carb_target, fat_target } = req.body;

    db.prepare(`
      INSERT INTO profiles (user_id, name, age, gender, height_cm, weight_kg, goal, activity_level,
        calorie_target, protein_target, carb_target, fat_target, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        name = excluded.name,
        age = excluded.age,
        gender = excluded.gender,
        height_cm = excluded.height_cm,
        weight_kg = excluded.weight_kg,
        goal = excluded.goal,
        activity_level = excluded.activity_level,
        calorie_target = excluded.calorie_target,
        protein_target = excluded.protein_target,
        carb_target = excluded.carb_target,
        fat_target = excluded.fat_target,
        updated_at = datetime('now')
    `).run(req.userId, name, age, gender, height_cm, weight_kg, goal, activity_level,
      calorie_target, protein_target, carb_target, fat_target);

    const profile = db.prepare('SELECT * FROM profiles WHERE user_id = ?').get(req.userId);
    res.json({ profile });
  });

  // â”€â”€ Streak â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  app.get('/api/streak', authMiddleware, (req: any, res) => {
    // Get all dates with logs, sorted descending
    const dates: any[] = db.prepare(`
      SELECT DISTINCT date FROM meal_logs
      WHERE user_id = ?
      ORDER BY date DESC
    `).all(req.userId);

    if (dates.length === 0) return res.json({ streak: 0, longestStreak: 0 });

    const today = new Date().toISOString().split('T')[0];
    let streak = 0;
    let longestStreak = 0;
    let current = 0;
    let prev: string | null = null;

    for (const { date } of dates) {
      if (!prev) {
        // Check if latest log is today or yesterday
        const diff = Math.floor((new Date(today).getTime() - new Date(date).getTime()) / 86400000);
        if (diff > 1) { current = 0; }
        else { current = 1; }
      } else {
        const diff = Math.floor((new Date(prev).getTime() - new Date(date).getTime()) / 86400000);
        if (diff === 1) current++;
        else { longestStreak = Math.max(longestStreak, current); current = 1; }
      }
      prev = date;
    }

    streak = current;
    longestStreak = Math.max(longestStreak, streak);

    res.json({ streak, longestStreak, lastLogDate: dates[0]?.date });
  });


  // Water Log
  app.post('/api/water', authMiddleware, (req: any, res) => {
    const { amount_ml, date } = req.body
    if (!amount_ml || amount_ml <= 0) return res.status(400).json({ error: 'amount_ml required' })
    const d = date || new Date().toISOString().split('T')[0]
    db.prepare('INSERT INTO water_log (id, user_id, amount_ml, date) VALUES (?, ?, ?, ?)').run(randomUUID(), req.userId, amount_ml, d)
    const row = db.prepare('SELECT SUM(amount_ml) as t FROM water_log WHERE user_id = ? AND date = ?').get(req.userId, d) as any
    res.json({ ok: true, total_ml: row.t || 0 })
  })

  app.get('/api/water', authMiddleware, (req: any, res) => {
    const date = String(req.query.date || new Date().toISOString().split('T')[0])
    const entries = db.prepare('SELECT * FROM water_log WHERE user_id = ? AND date = ? ORDER BY logged_at ASC').all(req.userId, date)
    const total = entries.reduce((s: number, e: any) => s + (e.amount_ml || 0), 0)
    res.json({ date, entries, total_ml: total, glasses: Math.round(total / 250) })
  })

  app.delete('/api/water/:id', authMiddleware, (req: any, res) => {
    db.prepare('DELETE FROM water_log WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)
    res.json({ ok: true })
  })

  // Weight Log
  app.post('/api/weight', authMiddleware, (req: any, res) => {
    const { weight_kg, date, note } = req.body
    if (!weight_kg) return res.status(400).json({ error: 'weight_kg required' })
    const d = date || new Date().toISOString().split('T')[0]
    const id = randomUUID()
    db.prepare('INSERT INTO weight_log (id, user_id, weight_kg, date, note) VALUES (?, ?, ?, ?, ?)').run(id, req.userId, weight_kg, d, note || null)
    res.json({ ok: true, id })
  })

  app.get('/api/weight', authMiddleware, (req: any, res) => {
    const days = Math.min(parseInt(String(req.query.days || '90')), 365)
    const entries = db.prepare("SELECT * FROM weight_log WHERE user_id = ? AND date >= date('now', ?) ORDER BY date DESC").all(req.userId, '-' + days + ' days')
    res.json({ entries })
  })

  // â”€â”€ Vite SPA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Plato] Server on http://localhost:${PORT}`);
    console.log(`[Plato] USDA API: ${USDA_API_KEY === 'DEMO_KEY' ? 'DEMO (rate-limited)' : 'custom key'}`);
  });
}

startServer().catch(console.error);
