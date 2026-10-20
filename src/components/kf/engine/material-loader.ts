import { buildMaterial } from "./material";

/** Il materiale dell'oggetto, senza bloccare la pagina: in un worker quando il browser lo permette (scarica, decodifica
 *  e calcola fuori dal thread principale e restituisce un ImageBitmap); altrimenti lo stesso calcolo a pezzi nei tempi
 *  morti, partendo dall'immagine gia' caricata. Portato dal sito principale (loadMaterial). */
export function loadMaterial(url: string, loadGold: () => Promise<HTMLImageElement>, satin: boolean): Promise<CanvasImageSource> {
  const local = () => loadGold().then((gold) => buildMaterial(gold, () => document.createElement("canvas"), satin));
  if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined" || typeof createImageBitmap === "undefined") return local();
  return new Promise<CanvasImageSource>((resolve, reject) => {
    const worker = new Worker(new URL("./material-worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = ({ data }: MessageEvent<{ bitmap?: ImageBitmap; error?: string }>) => {
      worker.terminate();
      if (data.bitmap) resolve(data.bitmap);
      else reject(new Error(data.error));
    };
    worker.onerror = (event) => { worker.terminate(); reject(event.error ?? new Error("material worker failed")); };
    worker.postMessage({ url: new URL(url, location.href).href, satin });
  }).catch(() => local());
}
