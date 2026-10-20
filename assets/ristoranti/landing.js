import {FooterWordmark} from '../footer-wordmark.js?v=33';
import {initMenu} from './menu.js?v=r4-2';
import {initAccordions} from './accordion.js?v=r4-2';
import {initContact} from './contact.js?v=r4-2';
import {startHero} from './hero.js?v=r5-2';
import {ServiceTrail} from '../service-trail.js?v=rt-7';
// Anchors (#top, #servizi, #prenota) are native links; the page scrolls natively.
export function initLanding(doc=document){
 // iOS Safari applies :active only if the document has a touch listener.
 doc.addEventListener('touchstart',()=>{},{passive:true});
 initMenu(doc);initAccordions(doc);
 const form=doc.querySelector('form[data-contact]');if(form)initContact(form);
 for(const el of doc.querySelectorAll('[data-year]'))el.textContent=String(new Date().getFullYear());
 const scene=doc.querySelector('[data-scene]');if(scene)startHero(scene,{document:doc});
 // The binary trail behind the services: mouse only, never with reduced motion; nothing drawn with the menu open or the page hidden.
 const trail=doc.querySelector('[data-service-trail]'),services=trail?.closest('section');
 if(trail&&services)try{new ServiceTrail({section:services,canvas:trail,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,touch:matchMedia('(hover: none)').matches,blocked:()=>doc.hidden||doc.body.classList.contains('kf-menu-open')});}catch{trail.hidden=true;}
 const mark=doc.querySelector('[data-footer-wordmark]');
 if(mark)doc.fonts.ready.then(()=>new FooterWordmark(mark));}
initLanding(document);
