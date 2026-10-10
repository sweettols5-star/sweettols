'use client';

import { useState, type FormEvent } from 'react';
import { apiUrl } from '@/config/api';
import { whatsappUrl } from '@/lib/whatsapp';
import Field from './FormField';
import { IconCheck, IconWhatsapp } from './Icons';
import { useSettings } from './LiveCatalogue';

/** Same list as the API (backend/src/lib/message.js). */
const SUBJECTS = ['Question sur un produit', 'Suivi de commande', 'Commande en gros / professionnel', 'Autre'];

const PHONE = /^(0[5-7]\d{8}|212[5-7]\d{8})$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const EMPTY = { name: '', phone: '', email: '', subject: SUBJECTS[0], message: '', website: '' };

/**
 * Contact form. Messages land in /admin → Messages; the owner answers by
 * WhatsApp, phone or e-mail, so one of the two is required.
 */
export default function ContactForm() {
  const settings = useSettings();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[k];
      if (k === 'email') delete next.phone; // « phone or e-mail » is satisfied by either
      return next;
    });
  };

  function validate() {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = 'Indiquez votre nom.';
    const phone = form.phone.replace(/\D/g, '');
    if (!phone && !form.email.trim()) e.phone = 'Laissez un téléphone ou un e-mail pour la réponse.';
    else if (phone && !PHONE.test(phone)) e.phone = 'Numéro invalide (ex. 06 12 34 56 78).';
    if (form.email.trim() && !EMAIL.test(form.email.trim())) e.email = 'Adresse e-mail invalide.';
    if (form.message.trim().length < 10) e.message = 'Votre message est trop court (10 caractères minimum).';
    return e;
  }

  async function submit(ev: FormEvent) {
    ev.preventDefault();
    setServerError('');
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.querySelector<HTMLElement>(`.contact-form [name="${Object.keys(e)[0]}"]`)?.focus();
      return;
    }
    setSending(true);
    try {
      const res = await fetch(apiUrl('/api/messages'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 429) {
        setServerError('Trop de messages envoyés. Réessayez dans quelques minutes ou écrivez-nous sur WhatsApp.');
        return;
      }
      if (!res.ok) {
        setServerError(data.error || 'Le message n’a pas pu être envoyé. Réessayez.');
        return;
      }
      setSent(true);
      setForm(EMPTY);
    } catch {
      setServerError('Connexion impossible. Vérifiez votre réseau puis réessayez (le serveur peut mettre une minute à se réveiller).');
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="panel contact-sent" role="status">
        <span className="confirm__icon">
          <IconCheck width={32} height={32} />
        </span>
        <h2>Message envoyé, merci !</h2>
        <p>Nous vous répondons rapidement, par téléphone, WhatsApp ou e-mail.</p>
        <div className="confirm__actions">
          {settings.whatsapp && (
            <a href={whatsappUrl(settings.whatsapp, 'Bonjour SweetTools, ')} target="_blank" rel="noopener noreferrer" className="btn btn--ghost">
              <IconWhatsapp width={18} height={18} /> Urgent ? WhatsApp
            </a>
          )}
          <button type="button" className="btn btn--ghost" onClick={() => setSent(false)}>
            Écrire un autre message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="panel contact-form" onSubmit={submit} noValidate aria-busy={sending || undefined}>
      <h2 className="contact-form__title">Écrivez-nous</h2>
      <p className="contact-form__lead">Réponse rapide par téléphone, WhatsApp ou e-mail — laissez au moins l’un des deux.</p>
      <fieldset className="fields contact-form__fields" disabled={sending}>
        <Field label="Nom" error={errors.name}>
          <input name="name" autoComplete="name" value={form.name} onChange={set('name')} required />
        </Field>
        <Field label="Sujet">
          <select name="subject" value={form.subject} onChange={set('subject')}>
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Téléphone / WhatsApp" error={errors.phone}>
          <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="06 12 34 56 78" value={form.phone} onChange={set('phone')} />
        </Field>
        <Field label="E-mail" error={errors.email} hint="Facultatif si vous laissez un téléphone.">
          <input name="email" type="email" autoComplete="email" placeholder="vous@exemple.com" value={form.email} onChange={set('email')} />
        </Field>
        <Field label="Message" error={errors.message} wide>
          <textarea
            name="message"
            rows={5}
            maxLength={3000}
            placeholder="Votre question : produit, dimensions, commande (référence ST-…)…"
            value={form.message}
            onChange={set('message')}
            required
          />
        </Field>
        {/* Honeypot: hidden from people, filled by bots; the API drops those messages. */}
        <input name="website" className="contact-form__hp" tabIndex={-1} autoComplete="off" aria-hidden value={form.website} onChange={set('website')} />
      </fieldset>
      {serverError && (
        <p className="notice notice--error" role="alert">
          {serverError}
        </p>
      )}
      <button type="submit" className="btn btn--primary btn--lg contact-form__send" disabled={sending}>
        {sending ? (
          <>
            <span className="btn-spin" aria-hidden /> Envoi en cours…
          </>
        ) : (
          'Envoyer le message'
        )}
      </button>
    </form>
  );
}
