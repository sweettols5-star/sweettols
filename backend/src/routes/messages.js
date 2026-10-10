import { Router } from 'express';
import { requireAdmin, throttle } from '../auth.js';
import { store } from '../store/index.js';
import { buildMessage, SUBJECTS } from '../lib/message.js';
import { bool } from '../lib/text.js';

export const messageRoutes = Router();
export const adminMessageRoutes = Router();

/** Contact form. Tight throttle: nobody writes more than a few messages in 10 minutes. */
messageRoutes.post('/messages', throttle({ tries: 5, windowMs: 10 * 60_000 }), async (req, res) => {
  try {
    const result = buildMessage(req.body);
    if (result.error) {
      res.status(400).json({ error: result.error });
      return;
    }
    if (!result.spam) {
      await store.messages.create(result.message);
      console.log('[message] %s — %s — %s', result.message.id, result.message.name, result.message.subject);
    }
    res.status(201).json({ ok: true });
  } catch (e) {
    console.error('[messages POST]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminMessageRoutes.get('/messages', requireAdmin, async (req, res) => {
  try {
    const messages = (await store.messages.all())
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
    res.json({ messages, subjects: SUBJECTS });
  } catch (e) {
    console.error('[messages GET]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

/** Read / unread. */
adminMessageRoutes.patch('/messages/:id', requireAdmin, async (req, res) => {
  try {
    const message = await store.messages.update(req.params.id, { read: bool(req.body?.read) });
    if (!message) {
      res.status(404).json({ error: 'Message introuvable.' });
      return;
    }
    res.json({ ok: true, message });
  } catch (e) {
    console.error('[messages PATCH]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

adminMessageRoutes.delete('/messages/:id', requireAdmin, async (req, res) => {
  try {
    if (!(await store.messages.remove(req.params.id))) {
      res.status(404).json({ error: 'Message introuvable.' });
      return;
    }
    res.json({ ok: true });
  } catch (e) {
    console.error('[messages DELETE]', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
