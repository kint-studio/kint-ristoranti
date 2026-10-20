// Calcola il materiale dell'oggetto fuori dal thread principale (vedi material-loader.ts): scarica la foto con l'oro,
// la decodifica, fa il lavoro e restituisce un ImageBitmap pronto da disegnare.
import { materialJob } from "./material";

type Request = { url: string; satin: boolean };
const scope = self as unknown as { onmessage: ((event: MessageEvent<Request>) => void) | null; postMessage: (message: unknown, transfer?: Transferable[]) => void };

scope.onmessage = async ({ data }) => {
  try {
    const gold = await createImageBitmap(await (await fetch(data.url)).blob());
    const job = materialJob(gold, () => new OffscreenCanvas(1, 1), data.satin);
    job.step(Infinity);
    const bitmap = (job.canvas as OffscreenCanvas).transferToImageBitmap();
    scope.postMessage({ bitmap }, [bitmap]);
  } catch (error) {
    scope.postMessage({ error: String((error as Error)?.message || error) });
  }
};
