"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * L'anno corrente. Le pagine sono statiche: l'anno calcolato sul server e'
 * quello della build, e restava li' fino alla build successiva. Qui il server
 * scrive l'anno della build e il browser, finita l'idratazione, quello vero:
 * useSyncExternalStore rende prima lo snapshot del server, quindi i due
 * combaciano e non c'e' avviso di idratazione anche a cavallo di capodanno.
 */
export function CurrentYear({ buildYear }: { buildYear: number }) {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => buildYear,
  );
  return <>{year}</>;
}
