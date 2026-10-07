import { Router } from 'express';
import { requireAdmin } from '../auth.js';
import { store } from '../store/index.js';
import { normaliseProduct } from '../lib/product.js';
import { clean } from '../lib/text.js';

export const productRoutes = Router();

productRoutes.get('/products', requireAdmin, async (req, res) => {
  try {
    const products = (await store.products.all())
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
    res.json({ products });
  } catch (e) {
    console.error('[products GET]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

productRoutes.get('/products/:slug', requireAdmin, async (req, res) => {
  const product = await store.products.get(clean(req.params.slug, 90));
  if (!product) {
    res.status(404).json({ error: 'Produit introuvable' });
    return;
  }
  res.json({ product });
});

productRoutes.post('/products', requireAdmin, async (req, res) => {
  try {
    const [all, categories] = await Promise.all([store.products.all(), store.categories.all()]);
    const taken = new Set(all.map((p) => p.slug));
    const { error, product } = normaliseProduct(req.body, null, categories, taken);
    if (error) {
      res.status(400).json({ error });
      return;
    }
    res.status(201).json({ ok: true, product: await store.products.create(product) });
  } catch (e) {
    console.error('[products POST]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

productRoutes.put('/products/:slug', requireAdmin, async (req, res) => {
  try {
    const current = clean(req.params.slug, 90);
    const [all, categories] = await Promise.all([store.products.all(), store.categories.all()]);
    const existing = all.find((p) => p.slug === current);
    if (!existing) {
      res.status(404).json({ error: 'Produit introuvable' });
      return;
    }
    const taken = new Set(all.filter((p) => p.slug !== current).map((p) => p.slug));
    const { error, product } = normaliseProduct(req.body, existing, categories, taken);
    if (error) {
      res.status(400).json({ error });
      return;
    }
    res.json({ ok: true, product: await store.products.update(current, product) });
  } catch (e) {
    console.error('[products PUT]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

productRoutes.delete('/products/:slug', requireAdmin, async (req, res) => {
  const removed = await store.products.remove(clean(req.params.slug, 90));
  if (!removed) {
    res.status(404).json({ error: 'Produit introuvable' });
    return;
  }
  res.json({ ok: true });
});
