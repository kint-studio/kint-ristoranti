const power1InOut=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
export function idlePosition(seconds){
 const t=((seconds%9.5)+9.5)%9.5;
 let x,y;
 if(t<2.5){y=t/2.5;x=power1InOut(y);}
 else if(t<4){x=1;y=1;}
 else if(t<6.5){const p=(t-4)/2.5;y=1-p;x=1-power1InOut(p);}
 else{x=0;y=0;}
 return {x:-Math.cos(x*Math.PI*4)*.75,y:Math.cos(y*Math.PI)*.5};
}
export class IdleCursor {
 constructor(){this.wait=2.5;this.elapsed=0;this.running=false;}
 activity(){const wasRunning=this.running;this.wait=2;this.elapsed=0;this.running=false;return wasRunning;}
 suspend(){this.elapsed=0;this.running=false;this.wait=2.5;}
 step(dt,enabled){
  if(!enabled){this.suspend();return null;}
  if(!this.running){this.wait-=dt;if(this.wait>0)return null;this.running=true;this.elapsed=0;}
  else this.elapsed+=dt;
  return idlePosition(this.elapsed);
 }
}
