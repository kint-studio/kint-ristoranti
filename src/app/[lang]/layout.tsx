import "../globals.css";
import { notFound } from "next/navigation";
import { RootDocument } from "@/components/RootDocument";
import { EXTRA_LANGS, isExtraLang } from "@/lib/i18n";

// Layout radice delle lingue straniere: /en, /fr, /de (e le loro versioni testuali). Solo queste tre esistono,
// qualsiasi altro primo segmento e' un 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return EXTRA_LANGS.map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isExtraLang(lang)) notFound();
  return <RootDocument lang={lang}>{children}</RootDocument>;
}
