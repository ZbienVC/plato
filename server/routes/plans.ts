import express from 'express';
import { randomUUID } from 'crypto';

export function plansRouter(ctx: any) {
  const { db } = ctx as { db: any; authMiddleware: any; signToken?: any };
  const { authMiddleware } = ctx as { authMiddleware: any };
  const router = express.Router();

  // ---- helpers -------------------------------------------------------------

  const nowIso = () => new Date().toISOString();

  const safeParse = (val: any, fallback: any) => {
    if (val === null || val === undefined) return fallback;
    if (typeof val !== 'string') return val;
    try {
      return JSON.parse(val);
    } catch {
      return fallback;
    }
  };

  const rowToPlan = (row: any) => {
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      meals: safeParse(row.meals_json, []),
      macros: safeParse(row.macros_json, {}),
      config: safeParse(row.config_json, {}),
      grocery: safeParse(row.grocery_json, null),
      isActive: !!row.is_active,
      rev: typeof row.rev === 'number' ? row.rev : Number(row.rev) || 1,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  };

  const getOwnedRow = (id: string, userId: string) =>
    db.prepare('SELECT * FROM meal_plans WHERE id = ? AND user_id = ?').get(id, userId);

  // ---- routes --------------------------------------------------------------

  // GET /api/plans -> all plans for the user, newest first
  router.get('/api/plans', authMiddleware, (req: any, res) => {
    try {
      const rows = db
        .prepare('SELECT * FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC')
        .all(req.userId);
      const plans = rows.map(rowToPlan);
      return res.status(200).json({ plans });
    } catch (err) {
      return res.status(500).json({ error: 'plans_list_failed', detail: String(err) });
    }
  });

  // GET /api/plans/active -> the active plan (or null)
  router.get('/api/plans/active', authMiddleware, (req: any, res) => {
    try {
      const row = db
        .prepare('SELECT * FROM meal_plans WHERE user_id = ? AND is_active = 1 ORDER BY updated_at DESC LIMIT 1')
        .get(req.userId);
      return res.status(200).json({ plan: rowToPlan(row) });
    } catch (err) {
      return res.status(500).json({ error: 'plans_active_failed', detail: String(err) });
    }
  });

  // POST /api/plans -> create a plan (rev = 1)
  router.post('/api/plans', authMiddleware, (req: any, res) => {
    try {
      const body = req.body || {};
      const { name, meals, macros, config, grocery, isActive } = body;

      const id = randomUUID();
      const now = nowIso();
      const active = isActive ? 1 : 0;

      if (active) {
        db.prepare('UPDATE meal_plans SET is_active = 0, updated_at = ? WHERE user_id = ?').run(now, req.userId);
      }

      db.prepare(
        `INSERT INTO meal_plans
          (id, user_id, name, meals_json, macros_json, config_json, grocery_json, is_active, rev, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        id,
        req.userId,
        name ?? '',
        JSON.stringify(meals ?? []),
        JSON.stringify(macros ?? {}),
        JSON.stringify(config ?? {}),
        grocery === undefined || grocery === null ? null : JSON.stringify(grocery),
        active,
        1,
        now,
        now
      );

      const row = getOwnedRow(id, req.userId);
      return res.status(200).json({ plan: rowToPlan(row) });
    } catch (err) {
      return res.status(500).json({ error: 'plans_create_failed', detail: String(err) });
    }
  });

  // PUT /api/plans/:id -> update with last-writer-wins on rev
  router.put('/api/plans/:id', authMiddleware, (req: any, res) => {
    try {
      const { id } = req.params;
      const body = req.body || {};
      const existing = getOwnedRow(id, req.userId);
      if (!existing) {
        return res.status(404).json({ error: 'plan_not_found' });
      }

      const existingRev = typeof existing.rev === 'number' ? existing.rev : Number(existing.rev) || 1;
      const incomingRev = Number(body.rev);

      // Last-writer-wins: stale writes are rejected with the current server copy.
      if (!Number.isNaN(incomingRev) && incomingRev < existingRev) {
        return res.status(409).json({ serverPlan: rowToPlan(existing) });
      }

      const sets: string[] = [];
      const params: any[] = [];

      if (body.name !== undefined) {
        sets.push('name = ?');
        params.push(body.name);
      }
      if (body.meals !== undefined) {
        sets.push('meals_json = ?');
        params.push(JSON.stringify(body.meals));
      }
      if (body.macros !== undefined) {
        sets.push('macros_json = ?');
        params.push(JSON.stringify(body.macros));
      }
      if (body.config !== undefined) {
        sets.push('config_json = ?');
        params.push(JSON.stringify(body.config));
      }

      const now = nowIso();
      const newRev = existingRev + 1;
      sets.push('rev = ?');
      params.push(newRev);
      sets.push('updated_at = ?');
      params.push(now);

      params.push(id, req.userId);

      db.prepare(`UPDATE meal_plans SET ${sets.join(', ')} WHERE id = ? AND user_id = ?`).run(...params);

      const row = getOwnedRow(id, req.userId);
      return res.status(200).json({ plan: rowToPlan(row) });
    } catch (err) {
      return res.status(500).json({ error: 'plans_update_failed', detail: String(err) });
    }
  });

  // PUT /api/plans/:id/activate -> set this plan active, others inactive
  router.put('/api/plans/:id/activate', authMiddleware, (req: any, res) => {
    try {
      const { id } = req.params;
      const existing = getOwnedRow(id, req.userId);
      if (!existing) {
        return res.status(404).json({ error: 'plan_not_found' });
      }

      const now = nowIso();
      db.prepare('UPDATE meal_plans SET is_active = 0, updated_at = ? WHERE user_id = ?').run(now, req.userId);
      db.prepare('UPDATE meal_plans SET is_active = 1, updated_at = ? WHERE id = ? AND user_id = ?').run(
        now,
        id,
        req.userId
      );

      const row = getOwnedRow(id, req.userId);
      return res.status(200).json({ plan: rowToPlan(row) });
    } catch (err) {
      return res.status(500).json({ error: 'plans_activate_failed', detail: String(err) });
    }
  });

  // PUT /api/plans/:id/grocery -> update grocery list
  router.put('/api/plans/:id/grocery', authMiddleware, (req: any, res) => {
    try {
      const { id } = req.params;
      const body = req.body || {};
      const existing = getOwnedRow(id, req.userId);
      if (!existing) {
        return res.status(404).json({ error: 'plan_not_found' });
      }

      const grocery = body.grocery;
      const now = nowIso();
      db.prepare('UPDATE meal_plans SET grocery_json = ?, updated_at = ? WHERE id = ? AND user_id = ?').run(
        grocery === undefined || grocery === null ? null : JSON.stringify(grocery),
        now,
        id,
        req.userId
      );

      const row = getOwnedRow(id, req.userId);
      return res.status(200).json({ plan: rowToPlan(row) });
    } catch (err) {
      return res.status(500).json({ error: 'plans_grocery_failed', detail: String(err) });
    }
  });

  // DELETE /api/plans/:id -> delete if owned
  router.delete('/api/plans/:id', authMiddleware, (req: any, res) => {
    try {
      const { id } = req.params;
      const result = db.prepare('DELETE FROM meal_plans WHERE id = ? AND user_id = ?').run(id, req.userId);
      if (!result || result.changes === 0) {
        return res.status(404).json({ error: 'plan_not_found' });
      }
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: 'plans_delete_failed', detail: String(err) });
    }
  });

  return router;
}
