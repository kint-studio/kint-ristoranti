import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MachineView } from "@/components/machine/MachineView";
import { LANDING } from "@/lib/content";
import { isExtraLang } from "@/lib/i18n";
import { translateLanding } from "@/lib/landing-i18n";
import { pageMetadata } from "@/lib/site";

export async function generateMetadata({ params }: PageProps<"/[lang]/machine">): Promise<Metadata> {
  const { lang } = await params;
  return isExtraLang(lang) ? pageMetadata(lang, true) : {};
}

export default async function LangMachinePage({ params }: PageProps<"/[lang]/machine">) {
  const { lang } = await params;
  if (!isExtraLang(lang)) notFound();
  return <MachineView landing={translateLanding(LANDING, lang)} lang={lang} />;
}
