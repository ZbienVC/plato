import express from 'express';
import { randomUUID } from 'crypto';

export function recipesRouter(ctx: any) {
  const { db, authMiddleware, signToken } = ctx;
  const router = express.Router();

  // Parse recipe_json and merge the row id so callers always see the canonical id.
  function rowToRecipe(row: any) {
    let recipe: any = {};
    try {
      recipe = row?.recipe_json ? JSON.parse(row.recipe_json) : {};
    } catch {
      recipe = {};
    }
    if (recipe == null || typeof recipe !== 'object') recipe = {};
    return { ...recipe, id: row.id };
  }

  // GET /api/recipes -> { recipes: [...] } (non-deleted, newest first)
  router.get('/api/recipes', authMiddleware, (req: any, res) => {
    try {
      const rows = db
        .prepare(
          `SELECT * FROM saved_recipes
           WHERE user_id = ? AND is_deleted = 0
           ORDER BY created_at DESC`
        )
        .all(req.userId);
      const recipes = rows.map(rowToRecipe);
      return res.status(200).json({ recipes });
    } catch (err) {
      return res.status(500).json({ error: 'failed_to_list_recipes', detail: String(err) });
    }
  });

  // POST /api/recipes -> body { recipe } (may include an id). Upsert by owned id, else insert.
  router.post('/api/recipes', authMiddleware, (req: any, res) => {
    try {
      const recipe = req.body?.recipe;
      if (recipe == null || typeof recipe !== 'object') {
        return res.status(400).json({ error: 'missing_recipe' });
      }

      const now = new Date().toISOString();
      const providedId =
        typeof recipe.id === 'string' && recipe.id.trim() ? recipe.id : null;

      let existing: any = null;
      if (providedId) {
        existing = db
          .prepare(`SELECT * FROM saved_recipes WHERE id = ? AND user_id = ?`)
          .get(providedId, req.userId);
      }

      const id = existing ? existing.id : providedId || randomUUID();
      const toStore = { ...recipe, id };
      const recipeJson = JSON.stringify(toStore);

      if (existing) {
        db.prepare(
          `UPDATE saved_recipes
           SET recipe_json = ?, is_deleted = 0, updated_at = ?
           WHERE id = ? AND user_id = ?`
        ).run(recipeJson, now, id, req.userId);
      } else {
        db.prepare(
          `INSERT INTO saved_recipes (id, user_id, recipe_json, is_deleted, created_at, updated_at)
           VALUES (?, ?, ?, 0, ?, ?)`
        ).run(id, req.userId, recipeJson, now, now);
      }

      const row = db
        .prepare(`SELECT * FROM saved_recipes WHERE id = ? AND user_id = ?`)
        .get(id, req.userId);
      return res.status(200).json({ recipe: rowToRecipe(row) });
    } catch (err) {
      return res.status(500).json({ error: 'failed_to_save_recipe', detail: String(err) });
    }
  });

  // DELETE /api/recipes/:id -> tombstone (is_deleted=1) if owned; { ok:true } or 404.
  router.delete('/api/recipes/:id', authMiddleware, (req: any, res) => {
    try {
      const id = req.params.id;
      const now = new Date().toISOString();
      const existing = db
        .prepare(`SELECT id FROM saved_recipes WHERE id = ? AND user_id = ?`)
        .get(id, req.userId);
      if (!existing) {
        return res.status(404).json({ error: 'recipe_not_found' });
      }
      db.prepare(
        `UPDATE saved_recipes
         SET is_deleted = 1, updated_at = ?
         WHERE id = ? AND user_id = ?`
      ).run(now, id, req.userId);
      return res.status(200).json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: 'failed_to_delete_recipe', detail: String(err) });
    }
  });

  return router;
}
