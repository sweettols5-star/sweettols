'use client';

/**
 * English / Arabic versions of a few text fields, folded under one
 * « Traductions » line so the French form stays as short as before. An empty
 * field is fine: the shop shows the French text in its place.
 */

export type TrLang = 'en' | 'ar';
/** Form state: every value is a string (a list is one item per line). */
export type TrDraft = Partial<Record<TrLang, Record<string, string>>>;

export type TrField = { key: string; label: string; rows?: number; max?: number; list?: boolean };

const LANGS: Array<{ lang: TrLang; label: string; dir: 'ltr' | 'rtl' }> = [
  { lang: 'en', label: 'Anglais', dir: 'ltr' },
  { lang: 'ar', label: 'Arabe — العربية', dir: 'rtl' },
];

/** API shape -> form state (lists joined by line). */
export function toTrDraft(i18n: unknown): TrDraft {
  const out: TrDraft = {};
  if (!i18n || typeof i18n !== 'object') return out;
  for (const { lang } of LANGS) {
    const src = (i18n as Record<string, Record<string, unknown>>)[lang];
    if (!src) continue;
    out[lang] = Object.fromEntries(
      Object.entries(src).map(([k, v]) => [k, Array.isArray(v) ? v.join('\n') : String(v ?? '')]),
    );
  }
  return out;
}

/** Form state -> API shape (list fields split by line; the API drops empties). */
export function fromTrDraft(draft: TrDraft, fields: TrField[]) {
  const out: Record<string, Record<string, string | string[]>> = {};
  for (const { lang } of LANGS) {
    const src = draft[lang] || {};
    out[lang] = Object.fromEntries(
      fields.map((f) => [f.key, f.list ? (src[f.key] || '').split('\n') : src[f.key] || '']),
    );
  }
  return out;
}

const filled = (draft: TrDraft, lang: TrLang, fields: TrField[]) =>
  fields.filter((f) => (draft[lang]?.[f.key] || '').trim()).length;

export default function Translations({
  fields,
  value,
  onChange,
  open = false,
}: {
  fields: TrField[];
  value: TrDraft;
  onChange: (next: TrDraft) => void;
  open?: boolean;
}) {
  const set = (lang: TrLang, key: string, v: string) => onChange({ ...value, [lang]: { ...value[lang], [key]: v } });
  const status = LANGS.map(({ lang }) => `${lang.toUpperCase()} ${filled(value, lang, fields)}/${fields.length}`).join(' · ');

  return (
    <details className="adm-tr" open={open}>
      <summary>
        Traductions <span className="adm-muted">anglais / arabe — {status}</span>
      </summary>
      <p className="adm-muted adm-tr__hint">Facultatif : un champ vide affiche le texte français à la place.</p>
      <div className="adm-tr__cols">
        {LANGS.map(({ lang, label, dir }) => (
          <div key={lang} className="adm-tr__col">
            <p className="adm-tr__lang">{label}</p>
            {fields.map((f) => (
              <label key={f.key} className="adm-field">
                <span>{f.label}</span>
                {f.rows ? (
                  <textarea
                    className="adm-input"
                    dir={dir}
                    lang={lang}
                    rows={f.rows}
                    maxLength={f.max}
                    value={value[lang]?.[f.key] || ''}
                    onChange={(e) => set(lang, f.key, e.target.value)}
                  />
                ) : (
                  <input
                    className="adm-input"
                    dir={dir}
                    lang={lang}
                    maxLength={f.max}
                    value={value[lang]?.[f.key] || ''}
                    onChange={(e) => set(lang, f.key, e.target.value)}
                  />
                )}
                {f.list && <small>Une par ligne.</small>}
              </label>
            ))}
          </div>
        ))}
      </div>
    </details>
  );
}
