import type { Metadata } from "next";
import { MachineView } from "@/components/machine/MachineView";
import { LANDING } from "@/lib/content";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata("it", true);

export default function MachinePage() {
  return <MachineView landing={LANDING} lang="it" />;
}
