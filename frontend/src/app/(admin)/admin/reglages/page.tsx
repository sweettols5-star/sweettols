'use client';

import { useEffect, useState, type FormEvent } from 'react';
import AdminShell from '@/admin/AdminShell';
import { api, errorText } from '@/admin/client';
import { Field, Flash, Loading, useFlash } from '@/admin/ui';
import type { Settings, Zone } from '@/types';

export default function SettingsPage() {
  return (
    <AdminShell title="Réglages">
      <SettingsView />
      <PasswordForm />
    </AdminShell>
  );
}

function SettingsView() {
  const [saved, setSaved] = useState<Settings | null>(null);
  const [s, setS] = useState<Settings | null>(null);
  const [busy, setBusy] = useState(false);
  const flash = useFlash();

  useEffect(() => {
    api<{ settings: Settings }>('/api/admin/settings')
      .then(({ settings }) => {
        setSaved(settings);
        setS(settings);
      })
      .catch((e) => flash.err(errorText(e)));
  }, []);

  if (!s) return flash.flash ? <Flash flash={flash.flash} /> : <Loading />;

  const set = <K extends keyof Settings>(k: K, v: Settings[K]) => setS((x) => (x ? { ...x, [k]: v } : x));
  const setZone = (i: number, patch: Partial<Zone>) =>
    set('zones', s.zones.map((z, n) => (n === i ? { ...z, ...patch } : z)));
  const dirty = JSON.stringify(s) !== JSON.stringify(saved);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!s) return;
    if (!s.zones.some((z) => z.label.trim())) return flash.err('Gardez au moins une zone de livraison.');
    setBusy(true);
    try {
      const { settings } = await api<{ settings: Settings }>('/api/admin/settings', { method: 'PUT', body: s });
      setSaved(settings);
      setS(settings);
      flash.ok('Réglages enregistrés — visibles tout de suite sur la boutique.');
    } catch (err) {
      flash.err(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="adm-settings">
      <section className="adm-card">
        <h2 className="adm-h2">Coordonnées</h2>
        <p className="adm-muted adm-intro">
          Chaque coordonnée remplie apparaît sur la boutique (pied de page, page contact). Le numéro WhatsApp ajoute aussi
          le bouton flottant et « Demander le prix » sur les produits sans prix.
        </p>
        <div className="adm-fields">
          <Field label="WhatsApp" hint="Ex. 0612345678 ou 212612345678">
            <input className="adm-input" inputMode="tel" value={s.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
          </Field>
          <Field label="Téléphone">
            <input className="adm-input" inputMode="tel" value={s.phone} onChange={(e) => set('phone', e.target.value)} />
          </Field>
          <Field label="E-mail">
            <input className="adm-input" type="email" value={s.email} onChange={(e) => set('email', e.target.value)} />
          </Field>
          <Field label="Ville">
            <input className="adm-input" value={s.city} onChange={(e) => set('city', e.target.value)} />
          </Field>
          <Field label="Horaires" wide hint="Ex. Lun–Sam, 9 h – 19 h">
            <input className="adm-input" value={s.hours} onChange={(e) => set('hours', e.target.value)} />
          </Field>
          <Field label="Instagram" hint="Lien complet https://instagram.com/…">
            <input className="adm-input" type="url" value={s.instagram} onChange={(e) => set('instagram', e.target.value)} />
          </Field>
          <Field label="Facebook" hint="Lien complet">
            <input className="adm-input" type="url" value={s.facebook} onChange={(e) => set('facebook', e.target.value)} />
          </Field>
          <Field label="TikTok" hint="Lien complet">
            <input className="adm-input" type="url" value={s.tiktok} onChange={(e) => set('tiktok', e.target.value)} />
          </Field>
        </div>
      </section>

      <section className="adm-card">
        <h2 className="adm-h2">Boutique</h2>
        <div className="adm-fields">
          <Field label="Bandeau en haut du site" wide hint="Vide = pas de bandeau.">
            <input className="adm-input" value={s.announcement} onChange={(e) => set('announcement', e.target.value)} maxLength={160} />
          </Field>
          <Field label="Slogan" wide>
            <input className="adm-input" value={s.baseline} onChange={(e) => set('baseline', e.target.value)} maxLength={160} />
          </Field>
        </div>
      </section>

      <section className="adm-card">
        <h2 className="adm-h2">Livraison</h2>
        <p className="adm-muted adm-intro">Le client choisit sa zone à la commande ; les frais s’ajoutent au total.</p>
        <div className="adm-zones">
          {s.zones.map((z, i) => (
            <div key={i} className="adm-zone">
              <Field label="Zone">
                <input className="adm-input" value={z.label} onChange={(e) => setZone(i, { label: e.target.value })} placeholder="Ex. Rabat – Salé" />
              </Field>
              <Field label="Frais (DH)">
                <input
                  className="adm-input"
                  inputMode="numeric"
                  value={String(z.fee)}
                  onChange={(e) => setZone(i, { fee: Number(e.target.value.replace(/[^\d]/g, '')) || 0 })}
                />
              </Field>
              <Field label="Délai">
                <input className="adm-input" value={z.delay} onChange={(e) => setZone(i, { delay: e.target.value })} placeholder="Ex. 24 à 48 h" />
              </Field>
              <button
                type="button"
                className="adm-btn adm-btn--ghost adm-btn--sm"
                onClick={() => set('zones', s.zones.filter((_, n) => n !== i))}
                disabled={s.zones.length <= 1}
                aria-label={`Retirer la zone ${z.label}`}
              >
                Retirer
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="adm-btn adm-btn--ghost adm-btn--sm"
          onClick={() => set('zones', [...s.zones, { id: '', label: '', fee: 0, delay: '' }])}
        >
          + Ajouter une zone
        </button>
        <div className="adm-fields adm-mt">
          <Field label="Minimum de commande (DH)" hint="Montant des articles hors livraison. 0 = pas de minimum.">
            <input
              className="adm-input"
              inputMode="numeric"
              value={String(s.minOrder ?? 0)}
              onChange={(e) => set('minOrder', Number(e.target.value.replace(/[^d]/g, '')) || 0)}
            />
          </Field>
          <Field label="Livraison offerte dès (DH)" hint="0 = jamais offerte.">
            <input
              className="adm-input"
              inputMode="numeric"
              value={String(s.freeShippingThreshold)}
              onChange={(e) => set('freeShippingThreshold', Number(e.target.value.replace(/[^\d]/g, '')) || 0)}
            />
          </Field>
        </div>
      </section>

      <div className="adm-sticky-save">
        <Flash flash={flash.flash} />
        <button type="submit" className="adm-btn adm-btn--primary" disabled={busy || !dirty}>
          {busy ? 'Enregistrement…' : 'Enregistrer les réglages'}
        </button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const flash = useFlash();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (next.length < 10) return flash.err('Le nouveau mot de passe doit faire 10 caractères au minimum.');
    if (next !== confirm) return flash.err('Les deux nouveaux mots de passe ne correspondent pas.');
    setBusy(true);
    try {
      await api('/api/admin/password', { method: 'POST', body: { current, next } });
      setCurrent('');
      setNext('');
      setConfirm('');
      flash.ok('Mot de passe changé.');
    } catch (err) {
      flash.err(errorText(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="adm-card adm-mt" onSubmit={submit}>
      <h2 className="adm-h2">Mot de passe</h2>
      <Flash flash={flash.flash} />
      <div className="adm-fields">
        <Field label="Mot de passe actuel" wide>
          <input className="adm-input" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} required />
        </Field>
        <Field label="Nouveau mot de passe" hint="10 caractères minimum.">
          <input className="adm-input" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} required />
        </Field>
        <Field label="Confirmer">
          <input className="adm-input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        </Field>
      </div>
      <button type="submit" className="adm-btn adm-btn--primary" disabled={busy}>
        Changer le mot de passe
      </button>
    </form>
  );
}
