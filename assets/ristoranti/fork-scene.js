import {SceneEngine,FORMATION_DONE_MS} from './scene-engine.js?v=r5-1';
import {goldImagePath} from './fork-images.js?v=r5-2';
export {FORMATION_DONE_MS};
// Where the drawing sits inside the image (fractions 0-1), measured once: the page knows how big the fork will be before the image arrives.
export const BOUNDS={top:.042,bottom:.958,left:.417,right:.625};
// Relief used to turn the fork without WebGL2: a thickness close to the real one (a dome bent the thin object and tore the tines).
export const DEPTH_STYLE={kind:'lineare',gain:.5,cap:.025};
// The fork stands large in the middle of the screen, like the vase in the main site's hero (68% of the height); the text sits bottom right, and on phones below the object.
export function layout(w,h){const b=BOUNDS,wf=Math.max(.2,b.right-b.left),hf=Math.max(.45,b.bottom-b.top),cx=(b.left+b.right)/2;
 if(w>=760){const ih=Math.min(h*.68/hf,w*.36/(wf*(2/3))),iw=ih*2/3;return {x:w*.5-iw*cx,y:h*.9-ih*b.bottom,w:iw,h:ih};}
 // phone: between the header and the text block at the bottom
 const ih=Math.min(Math.min(h*.44,370)/hf,w*.95/(wf*(2/3))),iw=ih*2/3;return {x:w*.5-iw*cx,y:h-266-ih*b.bottom,w:iw,h:ih};}
// Maximum drawing resolution per CSS pixel: 2 on phones (they are 3x, and 1.5 looks grainy), 1.5 on computers.
export const maxDprFor=touch=>touch?2:1.5;
// The smallest gold photo that is enough for the size the fork is drawn at: 2048 px, 1024 or 640. Touch devices never download the 2048 px one.
export function goldImageUrl(rectWidth,{touch,dpr}){const need=rectWidth*Math.min(dpr,maxDprFor(touch)),size=need<=560?'-640':need<=1024||touch?'-1024':'';return goldImagePath(size);}
// The main site's scene, configured for the fork: its layout, maximum resolution and relief, and no floor under an object that fades out at the bottom.
export class ForkScene extends SceneEngine {
 constructor({touch=false,...options}){super({layout,maxDpr:maxDprFor(touch),grounded:false,depthStyle:DEPTH_STYLE,...options});}
}
