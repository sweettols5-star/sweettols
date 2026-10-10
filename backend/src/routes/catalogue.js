import { Router } from 'express';
import { store } from '../store/index.js';
import { publicView } from '../lib/product.js';
import { readSettings } from '../lib/settings.js';

export const catalogueRoutes = Router();

/**
 * The one public read: active products, categories and settings in a single
 * request. Called by the build script (static HTML) and by the browser on each
 * page load (to refresh prices and stock frozen into that HTML).
 */
catalogueRoutes.get('/catalogue', async (req, res) => {
  try {
    const [products, categories, settings] = await Promise.all([
      store.products.all(),
      store.categories.all(),
      readSettings(),
    ]);
    res.set('Cache-Control', 'public, max-age=20, stale-while-revalidate=300');
    res.json({
      products: products
        .filter((p) => p.active !== false)
        .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
        .map(publicView),
      categories: categories
        .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))
        .map(({ id, name, description, order, image, i18n }) => ({ id, name, description: description || '', order, image: image || '', i18n: i18n || {} })),
      settings,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[catalogue]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
