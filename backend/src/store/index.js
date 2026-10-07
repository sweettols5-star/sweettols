/**
 * Picks the store from the environment. MONGODB_URI set → MongoDB (production);
 * blank → a local JSON file, for development only: a host that wipes its disk
 * on deploy (Render) would lose the catalogue and every order.
 */
import path from 'node:path';
import { env, ROOT } from '../env.js';
import { createJsonStore } from './json.js';
import { createMongoStore } from './mongo.js';

const uri = env('MONGODB_URI');

export const store = uri
  ? createMongoStore(uri, env('MONGODB_DB', 'sweettools'))
  : createJsonStore(env('DATA_FILE') || path.join(ROOT, '.data', 'db.json'));

export async function connectStore() {
  await store.connect();
  if (store.kind === 'json') {
    console.warn('[store] fichier JSON (%s) — développement uniquement. Renseigner MONGODB_URI en production.', store.label);
  } else {
    console.log('[store] MongoDB connecté (%s)', store.label);
  }
  return store;
}
