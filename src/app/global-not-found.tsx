import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { RootDocument } from "@/components/RootDocument";

// Con due layout radice ((it) e [lang]) non c'e' un layout comune per il 404: questa pagina ha il suo documento.
export const metadata: Metadata = { title: "404 — kint", robots: { index: false, follow: false } };

export default function GlobalNotFound() {
  return (
    <RootDocument lang="it">
      <div className="kf flex min-h-screen flex-col items-center justify-center gap-6 px-[var(--kf-gutter)] text-center">
        <p className="kf-mono text-[var(--kf-muted)]">404</p>
        <h1 className="kf-display text-[clamp(40px,6vw,88px)]">Pagina non trovata<span className="text-[var(--kf-gold)]">.</span></h1>
        <Link href="/" className="kf-btn">Torna alla pagina</Link>
      </div>
    </RootDocument>
  );
}
