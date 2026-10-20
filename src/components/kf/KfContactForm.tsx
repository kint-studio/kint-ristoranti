"use client";
import { useState } from "react";
import type { Ui } from "@/lib/i18n";

const field = "w-full border-0 border-b border-[var(--kf-ink)]/30 bg-transparent py-3 text-lg text-[var(--kf-ink)] outline-none transition-colors placeholder:text-[var(--kf-muted)] focus:border-[var(--kf-ink)]";
const label = "kf-mono mb-1 block text-[var(--kf-muted)]";

/** Il modulo della landing: le stesse quattro domande del modulo del sito, con lo
 *  stile "forma". All'invio apre l'email pronta; il settore e' quello della pagina. */
export function KfContactForm({ sector, exampleBusiness, t, email }: { sector: string; exampleBusiness: string; t: Ui["form"]; email: string }) {
  const [f, setF] = useState({ name: "", business: "", email: "", message: "" });
  const [done, setDone] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(t.subject.replace("{x}", f.business || f.name));
    const body = encodeURIComponent(`${t.mailName}: ${f.name}\n${t.mailBusiness}: ${f.business}\n${t.mailSector}: ${sector}\n${t.mailEmail}: ${f.email}\n\n${f.message}`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setDone(true);
  };
  return (
    <form onSubmit={submit} className="grid gap-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <label><span className={label}>{t.name}</span><input required className={field} value={f.name} onChange={set("name")} placeholder={t.namePh} /></label>
        <label><span className={label}>{t.business}</span><input required className={field} value={f.business} onChange={set("business")} placeholder={exampleBusiness} /></label>
      </div>
      <label><span className={label}>{t.email}</span><input required type="email" className={field} value={f.email} onChange={set("email")} placeholder={t.emailPh} /></label>
      <label><span className={label}>{t.message}</span><textarea required rows={3} className={`${field} resize-none`} value={f.message} onChange={set("message")} placeholder={t.messagePh} /></label>
      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" className="kf-btn">{t.submit}</button>
        <p className="kf-mono max-w-xs text-[var(--kf-muted)]">{t.privacy}</p>
      </div>
      {done && <p className="text-sm text-[var(--kf-soft)]">{t.done.replace("{email}", email)}</p>}
    </form>
  );
}
