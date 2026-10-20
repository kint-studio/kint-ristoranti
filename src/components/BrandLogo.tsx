import Link from "next/link";

/** Il marchio della landing: "RISTO" in oro e "kint" in inchiostro, in carattere (non un'immagine), con il punto d'oro.
 *  Geist semibold, colori #a48d58 e #292c25. Porta all'inizio della landing nella lingua corrente (`href`). */
export function BrandLogo({ href, onDark = false, homeLabel = "home" }: { href: string; onDark?: boolean; homeLabel?: string }) {
  return (
    <Link
      href={href}
      aria-label={`RISTOkint, ${homeLabel}`}
      className="inline-flex shrink-0 items-baseline whitespace-nowrap text-[25px] font-semibold leading-none tracking-[-0.04em] sm:text-[38px] md:text-[48px]"
      style={{ fontFamily: "var(--font-geist), Arial, sans-serif" }}
    >
      <span className="text-[#a48d58]">RISTO</span>
      <span className={onDark ? "text-[#efebe2]" : "text-[#292c25]"}>kint</span>
      <span className="text-[#a48d58]">.</span>
    </Link>
  );
}
