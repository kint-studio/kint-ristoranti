/** Le immagini della forchetta in `public/forma/`. La sagoma da 640 px serve a disegnare le cifre; le due piccole
 *  texture `a` e `b` sono il modello 3D; quelle con l'oro (`kintsugi`) servono solo se il browser non ha WebGL2.
 *  Modulo semplice (non "use client"): lo usano sia la scena sia i preload resi sul server da `KfLanding`. */
export const FORK_IMAGES = {
  ceramic640: "/forma/forchetta3-ceramic-640.webp",
  ceramic1024: "/forma/forchetta3-ceramic-1024.webp",
  a: "/forma/forchetta3-3d-a.webp",
  b: "/forma/forchetta3-3d-b.webp",
};
