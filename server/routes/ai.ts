import express from 'express';
import { randomUUID } from 'crypto';

export function aiRouter(ctx: any) {
  const { authMiddleware } = ctx as { db: any; authMiddleware: any; signToken?: any };
  const router = express.Router();

  // ---- helpers -------------------------------------------------------------

  // round to one decimal place, treating null/undefined/NaN as 0
  const round1 = (x: any) => {
    const n = Number(x);
    return Math.round((Number.isFinite(n) ? n : 0) * 10) / 10;
  };

  // Extract the first JSON object from an arbitrary LLM text response.
  // Handles fenced ```json blocks and leading/trailing prose.
  const extractJson = (text: string): any => {
    if (typeof text !== 'string') throw new Error('no text to parse');
    // Try a direct parse first.
    try {
      return JSON.parse(text);
    } catch {
      /* fall through to extraction */
    }
    // Strip code fences if present.
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenced && fenced[1]) {
      try {
        return JSON.parse(fenced[1].trim());
      } catch {
        /* fall through */
      }
    }
    // Grab the first {...} span.
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(text.slice(start, end + 1));
    }
    throw new Error('no JSON object found in response');
  };

  // Normalize an LLM-produced meal object into a stable shape.
  const normalizeMeal = (raw: any) => ({
    name: typeof raw?.name === 'string' ? raw.name : String(raw?.name ?? ''),
    calories: Math.round(Number(raw?.calories) || 0),
    protein: round1(raw?.protein),
    carbs: round1(raw?.carbs),
    fat: round1(raw?.fat),
  });

  const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
  const ANTHROPIC_MODEL = 'claude-haiku-4-5-20251001';

  const MEAL_SYSTEM_PROMPT =
    'You are a nutrition estimation assistant. Given a description of a food or meal, ' +
    'estimate its nutrition and respond with STRICT JSON only — no prose, no markdown, no code fences. ' +
    'The JSON must have exactly these keys: "name" (string), "calories" (number), ' +
    '"protein" (number, grams), "carbs" (number, grams), "fat" (number, grams). ' +
    'Estimate reasonable values for a typical single serving of the described food.';

  // Call the Anthropic Messages API with an already-built content array and
  // return a normalized meal object. Throws on network / parse failure.
  const estimateMeal = async (key: string, userContent: any[]) => {
    const resp = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 400,
        system: MEAL_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      }),
    });

    const data: any = await resp.json().catch(() => null);

    if (!resp.ok) {
      const detail = data?.error?.message || `anthropic http ${resp.status}`;
      throw new Error(detail);
    }

    // Concatenate all text blocks from the response.
    const blocks = Array.isArray(data?.content) ? data.content : [];
    const text = blocks
      .filter((b: any) => b && b.type === 'text' && typeof b.text === 'string')
      .map((b: any) => b.text)
      .join('\n')
      .trim();

    const parsed = extractJson(text);
    return normalizeMeal(parsed);
  };

  // ---- routes --------------------------------------------------------------

  // GET /api/food/barcode/:code -> look up a product on OpenFoodFacts (no key)
  router.get('/api/food/barcode/:code', authMiddleware, async (req: any, res) => {
    try {
      const code = String(req.params.code || '').trim();
      if (!code) {
        return res.status(400).json({ error: 'barcode required' });
      }

      const url =
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json` +
        `?fields=product_name,brands,nutriments,serving_size`;

      const resp = await fetch(url, {
        headers: {
          // OpenFoodFacts requests a descriptive UA.
          'User-Agent': 'Plato/1.0 (meal-planner)',
          accept: 'application/json',
        },
      });

      const data: any = await resp.json().catch(() => null);

      // status 0 (or missing product) => not found
      if (!data || data.status === 0 || !data.product) {
        return res.status(404).json({ error: 'product not found' });
      }

      const p = data.product || {};
      const n = p.nutriments || {};

      const food = {
        fdcId: null as null,
        code,
        name: p.product_name || '',
        brand: p.brands || null,
        serving: p.serving_size || '100g',
        calories: Math.round(Number(n['energy-kcal_100g']) || Number(n['energy-kcal']) || 0),
        protein: round1(n.proteins_100g),
        carbs: round1(n.carbohydrates_100g),
        fat: round1(n.fat_100g),
        source: 'openfoodfacts',
      };

      return res.status(200).json({ food });
    } catch (err) {
      return res.status(500).json({ error: 'barcode_lookup_failed', detail: String(err) });
    }
  });

  // POST /api/ai/voice -> extract a meal estimate from a spoken transcript.
  // NOTE: gate this behind requirePremium at mount time (LLM-backed, metered).
  router.post('/api/ai/voice', authMiddleware, async (req: any, res) => {
    try {
      const body = req.body || {};
      const text = typeof body.text === 'string' ? body.text.trim() : '';
      if (!text) {
        return res.status(400).json({ error: 'text required' });
      }

      const KEY = process.env.ANTHROPIC_API_KEY;
      if (!KEY) {
        return res.status(501).json({ error: 'ai voice not configured', hint: 'set ANTHROPIC_API_KEY' });
      }

      try {
        const meal = await estimateMeal(KEY, [
          {
            type: 'text',
            text:
              `A user described a meal by voice. Transcript:\n"""${text}"""\n` +
              `Estimate the macros for the described food and respond with STRICT JSON only.`,
          },
        ]);
        return res.status(200).json({ meal });
      } catch (parseErr) {
        return res.status(502).json({ error: 'could not parse meal', detail: String(parseErr) });
      }
    } catch (err) {
      return res.status(500).json({ error: 'ai_voice_failed', detail: String(err) });
    }
  });

  // POST /api/ai/photo -> extract a meal estimate from an image (vision).
  // NOTE: gate this behind requirePremium at mount time (LLM-backed, metered).
  router.post('/api/ai/photo', authMiddleware, async (req: any, res) => {
    try {
      const body = req.body || {};
      const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : '';
      const mediaType = typeof body.mediaType === 'string' ? body.mediaType : 'image/jpeg';
      if (!imageBase64) {
        return res.status(400).json({ error: 'imageBase64 required' });
      }

      const KEY = process.env.ANTHROPIC_API_KEY;
      if (!KEY) {
        return res.status(501).json({ error: 'ai photo not configured', hint: 'set ANTHROPIC_API_KEY' });
      }

      // Strip a data: URI prefix if the client sent one.
      const rawB64 = imageBase64.includes(',') ? imageBase64.slice(imageBase64.indexOf(',') + 1) : imageBase64;

      try {
        const meal = await estimateMeal(KEY, [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: rawB64 },
          },
          {
            type: 'text',
            text:
              'Identify the food in this image and estimate its macros. ' +
              'Respond with STRICT JSON only.',
          },
        ]);
        return res.status(200).json({ meal });
      } catch (parseErr) {
        return res.status(502).json({ error: 'could not parse meal', detail: String(parseErr) });
      }
    } catch (err) {
      return res.status(500).json({ error: 'ai_photo_failed', detail: String(err) });
    }
  });

  return router;
}
