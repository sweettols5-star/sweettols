import { Router } from 'express';
import { requireAdmin } from '../auth.js';
import { store } from '../store/index.js';
import { clean, int, slugify, translations } from '../lib/text.js';

export const categoryRoutes = Router();

function normalise(body = {}, fallbackOrder = 99, existing = null) {
  const name = clean(body.name, 80);
  if (!name) return { error: 'Le nom de la catégorie est obligatoire.' };
  const image = clean(body.image, 500);
  return {
    category: {
      name,
      description: clean(body.description, 600),
      i18n: body.i18n === undefined ? existing?.i18n || {} : translations(body.i18n, { name: 80, description: 600 }),
      order: int(body.order, { min: 0, max: 999, fallback: fallbackOrder }),
      image: /^(https?:\/\/|\/)/i.test(image) && !/^\/\//.test(image) ? image : '',
    },
  };
}

categoryRoutes.get('/categories', requireAdmin, async (req, res) => {
  const [categories, products] = await Promise.all([store.categories.all(), store.products.all()]);
  res.json({
    categories: categories
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
      .map((c) => ({ ...c, productCount: products.filter((p) => p.categoryId === c.id).length })),
  });
});

categoryRoutes.post('/categories', requireAdmin, async (req, res) => {
  const all = await store.categories.all();
  const { error, category } = normalise(req.body, all.length + 1);
  if (error) {
    res.status(400).json({ error });
    return;
  }
  const id = slugify(req.body?.id || category.name);
  if (!id || all.some((c) => c.id === id)) {
    res.status(409).json({ error: `L'identifiant « ${id} » existe déjà.` });
    return;
  }
  res.status(201).json({ ok: true, category: await store.categories.create({ id, ...category }) });
});

categoryRoutes.put('/categories/:id', requireAdmin, async (req, res) => {
  const id = clean(req.params.id, 80);
  const existing = await store.categories.get(id);
  if (!existing) {
    res.status(404).json({ error: 'Catégorie introuvable' });
    return;
  }
  const { error, category } = normalise(req.body, existing.order, existing);
  if (error) {
    res.status(400).json({ error });
    return;
  }
  // The id is the URL (/categorie/<id>/): it never changes after creation, so
  // links shared on Instagram keep working when the name is edited.
  res.json({ ok: true, category: await store.categories.update(id, category) });
});

categoryRoutes.delete('/categories/:id', requireAdmin, async (req, res) => {
  const id = clean(req.params.id, 80);
  const used = (await store.products.all()).filter((p) => p.categoryId === id).length;
  if (used) {
    res.status(409).json({ error: `Impossible : ${used} produit(s) sont encore dans cette catégorie.` });
    return;
  }
  const removed = await store.categories.remove(id);
  res.status(removed ? 200 : 404).json(removed ? { ok: true } : { error: 'Catégorie introuvable' });
});
