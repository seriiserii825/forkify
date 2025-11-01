import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { nanoid } from 'nanoid';
import { JsonDB } from './db.js';

const {
  PORT = 3333,
  DATA_FILE = './data/recipes.json',
  PAGE_SIZE = 10
} = process.env;

const app = express();
const db = new JsonDB(DATA_FILE);

// базовые middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '200kb' }));

// утилиты совместимости с Forkify
const ok = (data, results) => ({
  status: 'success',
  results: results ?? (Array.isArray(data) ? data.length : undefined),
  data
});
const err = (message, code = 400) => ({ status: 'fail', message, code });

// нормализуем ингредиент
function normalizeIngredient(i) {
  if (!i) return null;
  const { quantity = null, unit = '', description = '' } = i;
  const q = (quantity === '' || quantity === undefined) ? null : Number(quantity);
  return {
    quantity: Number.isFinite(q) ? q : null,
    unit: String(unit ?? '').trim(),
    description: String(description ?? '').trim()
  };
}

// валидация рецепта на входе
function validateRecipe(payload, { partial = false } = {}) {
  const fields = [
    'title','publisher','source_url','image_url',
    'servings','cooking_time','ingredients'
  ];
  if (!partial) {
    for (const f of fields) {
      if (!(f in payload)) return `Missing field: ${f}`;
    }
  }
  if ('ingredients' in payload) {
    if (!Array.isArray(payload.ingredients) || payload.ingredients.length === 0) {
      return 'ingredients must be non-empty array';
    }
    for (const ing of payload.ingredients) {
      if (!ing || !('description' in ing)) {
        return 'each ingredient must have description';
      }
    }
  }
  return null;
}

// поиск/фильтрация
function filterByQuery(recipes, q) {
  if (!q) return recipes;
  const s = String(q).toLowerCase();
  return recipes.filter(r =>
    r.title.toLowerCase().includes(s) ||
    r.publisher.toLowerCase().includes(s)
  );
}

// пагинация
function paginate(items, page = 1, pageSize = Number(PAGE_SIZE)) {
  const p = Math.max(1, Number(page) || 1);
  const start = (p - 1) * pageSize;
  return {
    page: p,
    pageSize,
    total: items.length,
    pages: Math.max(1, Math.ceil(items.length / pageSize)),
    slice: items.slice(start, start + pageSize),
  };
}

// HEALTH
app.get('/api/v2/health', (req, res) => {
  res.json({ ok: true, ts: Date.now(), uptime: process.uptime() });
});

// GET /api/v2/recipes?search=query&page=1
app.get('/api/v2/recipes', async (req, res) => {
  const { search, page } = req.query;
  try {
    const data = await db.read();
    const all = Array.isArray(data.recipes) ? data.recipes : [];
    const filtered = filterByQuery(all, search);
    const { slice, total, pages } = paginate(filtered, page);
    // Формат Forkify: { status, results, data: { recipes: [...] } }
    res.json(ok({ recipes: slice }, total));
  } catch (e) {
    res.status(500).json(err('internal error', 500));
  }
});

// GET /api/v2/recipes/:id
app.get('/api/v2/recipes/:id', async (req, res) => {
  try {
    const data = await db.read();
    const recipe = (data.recipes || []).find(r => r.id === req.params.id);
    if (!recipe) return res.status(404).json(err('recipe not found', 404));
    // Формат Forkify: data: { recipe: {...} }
    res.json(ok({ recipe }));
  } catch (e) {
    res.status(500).json(err('internal error', 500));
  }
});

// POST /api/v2/recipes  (создать свой рецепт)
app.post('/api/v2/recipes', async (req, res) => {
  const payload = req.body || {};
  const v = validateRecipe(payload);
  if (v) return res.status(400).json(err(v, 400));

  const recipe = {
    id: nanoid(24),
    title: String(payload.title).trim(),
    publisher: String(payload.publisher).trim(),
    source_url: String(payload.source_url).trim(),
    image_url: String(payload.image_url).trim(),
    servings: Number(payload.servings) || 1,
    cooking_time: Number(payload.cooking_time) || 0,
    ingredients: payload.ingredients.map(normalizeIngredient),
    // поле key в Forkify появляется у "пользовательских" рецептов — оставим заглушку
    key: 'user'
  };

  try {
    await db.write(dbState => {
      const next = { ...dbState, recipes: [...(dbState.recipes || []), recipe] };
      return next;
    });
    res.status(201).json(ok({ recipe }));
  } catch (e) {
    res.status(500).json(err('failed to save', 500));
  }
});

// PATCH /api/v2/recipes/:id  (частичное обновление)
app.patch('/api/v2/recipes/:id', async (req, res) => {
  const payload = req.body || {};
  const v = validateRecipe(payload, { partial: true });
  if (v) return res.status(400).json(err(v, 400));

  try {
    let updated = null;
    await db.write(dbState => {
      const list = [...(dbState.recipes || [])];
      const idx = list.findIndex(r => r.id === req.params.id);
      if (idx === -1) return dbState;
      const current = list[idx];

      const next = { ...current, ...payload };
      if (payload.ingredients) {
        next.ingredients = payload.ingredients.map(normalizeIngredient);
      }
      list[idx] = next;
      updated = next;
      return { ...dbState, recipes: list };
    });

    if (!updated) return res.status(404).json(err('recipe not found', 404));
    res.json(ok({ recipe: updated }));
  } catch (e) {
    res.status(500).json(err('failed to update', 500));
  }
});

// DELETE /api/v2/recipes/:id
app.delete('/api/v2/recipes/:id', async (req, res) => {
  try {
    let found = false;
    await db.write(dbState => {
      const before = dbState.recipes || [];
      const after = before.filter(r => r.id !== req.params.id);
      found = after.length !== before.length;
      return { ...dbState, recipes: after };
    });
    if (!found) return res.status(404).json(err('recipe not found', 404));
    res.json(ok({ removed: req.params.id }));
  } catch (e) {
    res.status(500).json(err('failed to delete', 500));
  }
});

// 404
app.use((req, res) => res.status(404).json(err('Not found', 404)));

app.listen(Number(PORT), () => {
  console.log(`✅ File-DB Forkify API on http://localhost:${PORT}`);
});
