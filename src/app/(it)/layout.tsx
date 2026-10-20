import "../globals.css";
import { RootDocument } from "@/components/RootDocument";

// Layout radice delle pagine in italiano (`/` e `/machine`). Le altre lingue hanno il loro in `[lang]/layout.tsx`.
export default function ItalianLayout({ children }: { children: React.ReactNode }) {
  return <RootDocument lang="it">{children}</RootDocument>;
}
