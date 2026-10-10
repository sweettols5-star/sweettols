'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminShell, { useRefreshBadge } from '@/admin/AdminShell';
import { api, errorText } from '@/admin/client';
import type { Message } from '@/admin/types';
import { BusyButton, Flash, Loading, useFlash, when } from '@/admin/ui';
import { IconMail, IconPhone, IconWhatsapp } from '@/components/Icons';
import { whatsappUrl } from '@/lib/whatsapp';

export default function MessagesPage() {
  return (
    <AdminShell title="Messages">
      <MessagesView />
    </AdminShell>
  );
}

/** Messages sent from the shop's contact page. Opening one marks it read. */
function MessagesView() {
  const refreshBadge = useRefreshBadge();
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [filter, setFilter] = useState<'unread' | 'all'>('all');
  const [open, setOpen] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const flash = useFlash();

  const load = useCallback(async () => {
    try {
      setMessages((await api<{ messages: Message[] }>('/api/admin/messages')).messages);
      return true;
    } catch (e) {
      flash.err(errorText(e));
      return false;
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unread = useMemo(() => (messages || []).filter((m) => !m.read).length, [messages]);
  const shown = (messages || []).filter((m) => filter === 'all' || !m.read);

  function replace(m: Message) {
    setMessages((list) => (list || []).map((x) => (x.id === m.id ? m : x)));
    refreshBadge();
  }

  async function toggle(m: Message) {
    const opening = open !== m.id;
    setOpen(opening ? m.id : '');
    if (opening && !m.read) {
      try {
        replace((await api<{ message: Message }>(`/api/admin/messages/${m.id}`, { method: 'PATCH', body: { read: true } })).message);
      } catch (e) {
        flash.err(errorText(e));
      }
    }
  }

  async function refresh() {
    setRefreshing(true);
    if (await load()) flash.ok('Messages à jour.');
    setRefreshing(false);
  }

  if (!messages) return flash.flash ? <Flash flash={flash.flash} /> : <Loading text="Chargement des messages…" />;

  return (
    <>
      <Flash flash={flash.flash} />
      <div className="adm-msgs__bar">
        <div className="adm-tabs">
          <button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>
            Tous <span>{messages.length}</span>
          </button>
          <button type="button" className={filter === 'unread' ? 'is-active' : ''} onClick={() => setFilter('unread')}>
            Non lus <span>{unread}</span>
          </button>
        </div>
        <BusyButton type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={refresh} busy={refreshing} busyText="Actualisation…">
          Actualiser
        </BusyButton>
      </div>

      {shown.length ? (
        <div className="adm-msgs">
          {shown.map((m) => (
            <MessageCard
              key={m.id}
              message={m}
              open={open === m.id}
              onToggle={() => toggle(m)}
              onChanged={(updated, msg) => {
                replace(updated);
                flash.ok(msg);
              }}
              onDeleted={(msg) => {
                setMessages((list) => (list || []).filter((x) => x.id !== m.id));
                refreshBadge();
                flash.ok(msg);
              }}
              onError={(t) => flash.err(t)}
            />
          ))}
        </div>
      ) : (
        <p className="adm-empty">
          {messages.length ? 'Aucun message non lu.' : 'Aucun message pour le moment. Ceux envoyés depuis la page Contact arriveront ici.'}
        </p>
      )}
    </>
  );
}

function MessageCard({
  message: m,
  open,
  onToggle,
  onChanged,
  onDeleted,
  onError,
}: {
  message: Message;
  open: boolean;
  onToggle: () => void;
  onChanged: (m: Message, msg: string) => void;
  onDeleted: (msg: string) => void;
  onError: (msg: string) => void;
}) {
  const [busy, setBusy] = useState<'' | 'read' | 'delete'>('');
  const phone = m.phone.replace(/\D/g, '');
  const first = m.name.split(' ')[0];

  async function markUnread() {
    setBusy('read');
    try {
      const { message } = await api<{ message: Message }>(`/api/admin/messages/${m.id}`, { method: 'PATCH', body: { read: false } });
      onChanged(message, 'Message marqué non lu.');
    } catch (e) {
      onError(errorText(e));
    } finally {
      setBusy('');
    }
  }

  async function remove() {
    if (!window.confirm(`Supprimer le message de ${m.name} ?`)) return;
    setBusy('delete');
    try {
      await api(`/api/admin/messages/${m.id}`, { method: 'DELETE' });
      onDeleted(`Message de ${m.name} supprimé.`);
    } catch (e) {
      onError(errorText(e));
      setBusy('');
    }
  }

  return (
    <article className={`adm-msg${m.read ? '' : ' is-unread'}${open ? ' is-open' : ''}`}>
      <button type="button" className="adm-msg__head" onClick={onToggle} aria-expanded={open}>
        <span className="adm-msg__dot" aria-label={m.read ? undefined : 'Non lu'} />
        <span className="adm-msg__who">
          <strong>{m.name}</strong>
          <small>{m.subject}</small>
        </span>
        <span className="adm-msg__preview">{m.text}</span>
        <span className="adm-muted adm-msg__date">{when(m.createdAt)}</span>
      </button>

      {open && (
        <div className="adm-msg__body">
          <p className="adm-msg__text">{m.text}</p>
          <p className="adm-muted adm-msg__contact">
            {[m.phone, m.email].filter(Boolean).join(' · ')}
          </p>
          <div className="adm-row">
            {phone && (
              <>
                <a
                  className="adm-btn adm-btn--primary adm-btn--sm"
                  href={whatsappUrl(phone, `Bonjour ${first}, SweetTools vous répond au sujet de votre message :`)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <IconWhatsapp width={16} height={16} /> Répondre sur WhatsApp
                </a>
                <a className="adm-btn adm-btn--ghost adm-btn--sm" href={`tel:${phone}`}>
                  <IconPhone width={16} height={16} /> Appeler
                </a>
              </>
            )}
            {m.email && (
              <a
                className={`adm-btn adm-btn--${phone ? 'ghost' : 'primary'} adm-btn--sm`}
                href={`mailto:${m.email}?subject=${encodeURIComponent(`SweetTools — ${m.subject}`)}&body=${encodeURIComponent(`Bonjour ${first},\n\n`)}`}
              >
                <IconMail width={16} height={16} /> Répondre par e-mail
              </a>
            )}
            <span className="adm-msg__spacer" />
            <BusyButton type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={markUnread} busy={busy === 'read'} busyText="…" disabled={!!busy}>
              Marquer non lu
            </BusyButton>
            <BusyButton type="button" className="adm-btn adm-btn--danger adm-btn--sm" onClick={remove} busy={busy === 'delete'} busyText="Suppression…" disabled={!!busy}>
              Supprimer
            </BusyButton>
          </div>
        </div>
      )}
    </article>
  );
}
