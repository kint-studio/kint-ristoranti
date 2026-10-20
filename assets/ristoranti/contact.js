import {t} from '../i18n.js?v=rt-7';
// Same mail as the Next landing: ready-made subject and body, opened in the visitor's email app.
export const CONTACT_EMAIL='info@kint.ch';
export function composeLandingMail({name,business,email,message,sector},labels){
 const subject=labels.subject.replace('{x}',business||name);
 const body=`${labels.mailName}: ${name}\n${labels.mailBusiness}: ${business}\n${labels.mailSector}: ${sector}\n${labels.mailEmail}: ${email}\n\n${message}`;
 return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;}
export function initContact(form,open=href=>{location.href=href;}){
 const done=form.querySelector('[data-contact-done]');
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const v=Object.fromEntries(new FormData(form));
  const labels={subject:t('Richiesta call: {x}'),mailName:t('Nome'),mailBusiness:t('Attività'),mailSector:t('Settore'),mailEmail:t('Email')};
  open(composeLandingMail({name:v.name||'',business:v.business||'',email:v.email||'',message:v.message||'',sector:form.dataset.sector||''},labels));
  if(done)done.hidden=false;});}
