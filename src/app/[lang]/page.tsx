import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KfLanding } from "@/components/kf/KfLanding";
import { LANDING } from "@/lib/content";
import { isExtraLang } from "@/lib/i18n";
import { translateLanding } from "@/lib/landing-i18n";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  return isExtraLang(lang) ? pageMetadata(lang, false) : {};
}

export default async function LangPage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isExtraLang(lang)) notFound();
  return <KfLanding landing={translateLanding(LANDING, lang)} lang={lang} />;
}
