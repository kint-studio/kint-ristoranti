import {FooterWordmark} from '../footer-wordmark.js?v=33';
import {initMenu} from './menu.js?v=r4-2';
import {initAccordions} from './accordion.js?v=r4-2';
import {initContact} from './contact.js?v=r4-2';
// Anchors (#top, #servizi, #prenota) are native links; the page scrolls natively.
export function initLanding(doc=document){
 // iOS Safari applies :active only if the document has a touch listener.
 doc.addEventListener('touchstart',()=>{},{passive:true});
 initMenu(doc);initAccordions(doc);
 const form=doc.querySelector('form[data-contact]');if(form)initContact(form);
 for(const el of doc.querySelectorAll('[data-year]'))el.textContent=String(new Date().getFullYear());
 const mark=doc.querySelector('[data-footer-wordmark]');
 if(mark)doc.fonts.ready.then(()=>new FooterWordmark(mark));}
initLanding(document);
