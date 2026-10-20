export function fitInk({width,left,right,size=100,guard=2}){
 const scale=Math.max(1,width-2*guard)/Math.max(1,right-left);
 return {size:size*scale,shift:guard-left*scale};
}
// Measure the visible ink of each DOM glyph, including the separately colored dot.
export class FooterWordmark {
 constructor(el){
  this.el=el;this.type=el.querySelector('.footer-wordmark-type');this.ctx=document.createElement('canvas').getContext('2d');this.queued=false;this.lastWidth=0;
  this.schedule=()=>{if(this.queued)return;this.queued=true;requestAnimationFrame(()=>{this.queued=false;this.fit();});};
  this.observer=new ResizeObserver(this.schedule);this.observer.observe(el);window.addEventListener('resize',this.schedule,{passive:true});document.fonts.addEventListener('loadingdone',()=>{this.lastWidth=0;this.schedule();});this.fit();
 }
 fit(){
  const width=this.el.clientWidth;if(!width||Math.abs(width-this.lastWidth)<.1)return;this.lastWidth=width;
  this.el.style.fontSize='100px';let size=100;
  // A second pass measures at the final scale to account for glyph raster rounding.
  for(let pass=0;pass<2;pass++){
   this.type.style.transform='none';const origin=this.el.getBoundingClientRect().left;
   const walker=document.createTreeWalker(this.type,NodeFilter.SHOW_TEXT),range=document.createRange();let node,left=Infinity,right=-Infinity;
   while(node=walker.nextNode()){
    const style=getComputedStyle(node.parentElement);this.ctx.font=`${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    for(let i=0;i<node.length;i++){range.setStart(node,i);range.setEnd(node,i+1);const box=range.getBoundingClientRect(),ink=this.ctx.measureText(node.data[i]);left=Math.min(left,box.left-origin-ink.actualBoundingBoxLeft);right=Math.max(right,box.left-origin+ink.actualBoundingBoxRight);}
   }
   if(!Number.isFinite(left)||!Number.isFinite(right)){this.el.style.removeProperty('font-size');return;}
   const fitted=fitInk({width,left,right,size});size=fitted.size;this.el.style.fontSize=size+'px';this.type.style.transform=`translateX(${fitted.shift}px)`;
  }
 }
}
