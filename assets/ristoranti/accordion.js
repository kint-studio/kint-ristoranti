// Buttons that open one panel at a time per group; the first item starts open in the markup. Closed panels are inert.
function setItem(item,open){
 const button=item.querySelector('button[aria-expanded]'),panel=document.getElementById(button.getAttribute('aria-controls'));
 button.setAttribute('aria-expanded',String(open));panel.dataset.open=String(open);panel.inert=!open;}
export function initAccordions(root=document){
 for(const group of root.querySelectorAll('[data-accordion]')){
  const items=[...group.querySelectorAll('[data-accordion-item]')];
  for(const item of items)item.querySelector('button[aria-expanded]').addEventListener('click',()=>{
   const open=item.querySelector('button[aria-expanded]').getAttribute('aria-expanded')!=='true';
   for(const other of items)setItem(other,other===item&&open);});}}
