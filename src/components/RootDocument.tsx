import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import { UI, type Lang } from "@/lib/i18n";

// Geist e Geist Mono: i caratteri della landing (.kf in globals.css). JetBrains Mono: la versione testuale e il
// selettore Human/Machine (classe `font-mono`).
const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", subsets: ["latin"], weight: ["400", "500"] });

/** Il documento HTML di una lingua: `<html lang>` e' scritto nell'HTML servito, non corretto dopo nel browser. */
export function RootDocument({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <html lang={UI[lang].htmlLang} className={`${geist.variable} ${geistMono.variable} ${jetbrains.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <SmoothScroll>
          <main className="flex-1">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
