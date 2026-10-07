import { Router } from 'express';
import { requireAdmin } from '../auth.js';
import { store } from '../store/index.js';

export const dashboardRoutes = Router();

/** The numbers the owner checks first thing in the morning. */
dashboardRoutes.get('/dashboard', requireAdmin, async (req, res) => {
  try {
    const [orders, products] = await Promise.all([store.orders.all(), store.products.all()]);
    const since = Date.now() - 30 * 24 * 3600 * 1000;
    const recent = orders.filter((o) => Date.parse(o.createdAt) >= since && o.status !== 'annulee');
    const byStatus = {};
    for (const o of orders) byStatus[o.status] = (byStatus[o.status] || 0) + 1;

    res.json({
      toProcess: byStatus.nouvelle || 0,
      byStatus,
      last30: {
        orders: recent.length,
        revenue: recent.reduce((n, o) => n + o.subtotal, 0),
      },
      products: {
        total: products.length,
        active: products.filter((p) => p.active !== false).length,
        withoutPrice: products.filter((p) => p.active !== false && !p.price).length,
        outOfStock: products.filter((p) => p.stock === 0).length,
        withoutImage: products.filter((p) => !p.images?.length).length,
      },
      latest: orders
        .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
        .slice(0, 6),
    });
  } catch (e) {
    console.error('[dashboard]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
