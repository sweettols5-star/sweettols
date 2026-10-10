import { Router } from 'express';
import { requireAdmin, throttle } from '../auth.js';
import { store } from '../store/index.js';
import { buildOrder, STATUSES, stockDelta } from '../lib/order.js';
import { clean } from '../lib/text.js';
import { readSettings } from '../lib/settings.js';

export const orderRoutes = Router();
export const adminOrderRoutes = Router();

/** Adds `sign × qty` back to each tracked product of an order. */
async function moveStock(items, sign) {
  for (const line of items) {
    const product = await store.products.get(line.slug);
    if (product && typeof product.stock === 'number') {
      await store.products.update(line.slug, { stock: Math.max(0, product.stock + sign * line.qty) });
    }
  }
}

orderRoutes.post('/orders', throttle({ tries: 6, windowMs: 60_000 }), async (req, res) => {
  try {
    const [catalogue, settings] = await Promise.all([store.products.all(), readSettings()]);
    const { error, problems, order } = buildOrder(req.body, catalogue, settings);
    if (error) {
      res.status(400).json({ error, problems });
      return;
    }
    const saved = await store.orders.create(order);
    await moveStock(saved.items, -1);
    console.log('[commande] %s — %s — %d DH', saved.reference, saved.customer.name, saved.total);
    res.status(201).json({
      ok: true,
      reference: saved.reference,
      items: saved.items,
      subtotal: saved.subtotal,
      shipping: saved.shipping,
      invoiceFee: saved.invoiceFee,
      total: saved.total,
      zone: saved.zone,
    });
  } catch (e) {
    console.error('[orders POST]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminOrderRoutes.get('/orders', requireAdmin, async (req, res) => {
  try {
    const status = clean(req.query.status, 20);
    const search = clean(req.query.q, 80).toLowerCase();
    let orders = (await store.orders.all())
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    if (STATUSES.includes(status)) orders = orders.filter((o) => o.status === status);
    if (search) {
      orders = orders.filter((o) => [o.reference, o.customer?.name, o.customer?.phone, o.customer?.city]
        .some((v) => String(v ?? '').toLowerCase().includes(search)));
    }
    res.json({ orders, statuses: STATUSES });
  } catch (e) {
    console.error('[orders GET]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminOrderRoutes.patch('/orders/:reference', requireAdmin, async (req, res) => {
  try {
    const order = await store.orders.get(clean(req.params.reference, 20));
    if (!order) {
      res.status(404).json({ error: 'Commande introuvable' });
      return;
    }
    const patch = { updatedAt: new Date().toISOString() };
    if (req.body?.adminNote !== undefined) patch.adminNote = clean(req.body.adminNote, 1000);

    const status = req.body?.status === undefined ? order.status : clean(req.body.status, 20);
    if (!STATUSES.includes(status)) {
      res.status(400).json({ error: `Statut inconnu. Attendu : ${STATUSES.join(', ')}.` });
      return;
    }
    if (status !== order.status) {
      patch.status = status;
      patch.history = [...(order.history || []), { status, at: patch.updatedAt }];
      // Cancelling gives the units back; un-cancelling takes them again.
      const delta = stockDelta(order.status, status);
      if (delta) await moveStock(order.items, delta);
    }
    res.json({ ok: true, order: await store.orders.update(order.reference, patch) });
  } catch (e) {
    console.error('[order PATCH]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/**
 * Removes an order for good (test order, duplicate, spam). Units still held
 * by it go back to stock — not for a cancelled order (already given back) nor
 * a delivered one (they really left the shop).
 */
adminOrderRoutes.delete('/orders/:reference', requireAdmin, async (req, res) => {
  try {
    const order = await store.orders.get(clean(req.params.reference, 20));
    if (!order) {
      res.status(404).json({ error: 'Commande introuvable.' });
      return;
    }
    const restock = order.status !== 'annulee' && order.status !== 'livree';
    if (restock) await moveStock(order.items, +1);
    await store.orders.remove(order.reference);
    console.log('[commande] %s supprimée%s', order.reference, restock ? ' (stock remis)' : '');
    res.json({ ok: true, restocked: restock });
  } catch (e) {
    console.error('[order DELETE]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
