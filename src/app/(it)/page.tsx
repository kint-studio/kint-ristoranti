import type { Metadata } from "next";
import { KfLanding } from "@/components/kf/KfLanding";
import { LANDING } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata("it", false);

export default function HomePage() {
  return <KfLanding landing={LANDING} lang="it" />;
}
