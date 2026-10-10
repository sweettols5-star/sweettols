/**
 * SweetTools API.
 *
 * The shop is a static export served from another domain; this API serves the
 * catalogue, takes cash-on-delivery orders and backs the /admin screens.
 */
import './env.js';

import express from 'express';
import cors from 'cors';

import { env, envInt } from './env.js';
import { connectStore } from './store/index.js';
import { authRoutes } from './routes/auth.js';
import { catalogueRoutes } from './routes/catalogue.js';
import { productRoutes } from './routes/products.js';
import { categoryRoutes } from './routes/categories.js';
import { adminOrderRoutes, orderRoutes } from './routes/orders.js';
import { settingsRoutes } from './routes/settings.js';
import { dashboardRoutes } from './routes/dashboard.js';
import { adminMessageRoutes, messageRoutes } from './routes/messages.js';
import { uploadRoutes, UPLOAD_DIR } from './routes/uploads.js';

export const app = express();

// Behind Render's proxy req.ip would be the proxy for everyone, turning the
// per-IP throttles into one global limit.
app.set('trust proxy', 1);
app.disable('x-powered-by');

/**
 * ALLOWED_ORIGINS (comma-separated) must contain the shop's domain, or the
 * browser blocks every call — the first thing to check when the live site
 * shows stale products or the checkout fails. GET /health reports it.
 */
const allowed = env('ALLOWED_ORIGINS')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(cors({
  origin(origin, done) {
    if (!origin) return done(null, true); // curl, build script: no browser credentials at stake
    if (allowed.includes(origin.replace(/\/$/, ''))) return done(null, true);
    return done(new Error(`Origine non autorisée : ${origin}`));
  },
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));

app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true }));

app.get('/health', (req, res) => {
  const origin = (req.get('origin') || '').replace(/\/$/, '');
  res.json({
    ok: true,
    service: 'sweettools-api',
    time: new Date().toISOString(),
    origins: allowed.length,
    originAllowed: origin ? allowed.includes(origin) : null,
  });
});

app.use('/api/admin', authRoutes);
app.use('/api/admin', productRoutes);
app.use('/api/admin', categoryRoutes);
app.use('/api/admin', settingsRoutes);
app.use('/api/admin', dashboardRoutes);
app.use('/api/admin', adminOrderRoutes);
app.use('/api/admin', uploadRoutes);
app.use('/api/admin', adminMessageRoutes);
app.use('/api', catalogueRoutes);
app.use('/api', orderRoutes);
app.use('/api', messageRoutes);

app.use((req, res) => res.status(404).json({ error: 'Route inconnue' }));

// An uncaught throw must leave as JSON, never as Express' HTML error page.
app.use((err, req, res, next) => {
  const corsRefusal = /Origine non autoris/.test(err?.message || '');
  if (!corsRefusal) console.error('[error]', err);
  const malformed = err?.type === 'entity.parse.failed';
  res.status(corsRefusal ? 403 : malformed ? 400 : 500)
    .json({ error: corsRefusal ? err.message : malformed ? 'JSON invalide' : 'Erreur serveur' });
});

const PORT = envInt('PORT', 4500);

if (process.env.NODE_ENV !== 'test') {
  connectStore()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`API SWEETTOOLS — http://localhost:${PORT}`);
        console.log(allowed.length
          ? `Origines autorisées : ${allowed.join(', ')}`
          : 'Aucune origine déclarée : seuls les appels sans en-tête Origin passeront.');
      });
    })
    .catch((e) => {
      console.error('[boot] impossible de joindre la base :', e.message);
      process.exit(1);
    });
}
