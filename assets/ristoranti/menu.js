// Full-screen menu: Esc and link clicks close it; while open the rest of the page is inert, so focus stays inside.
export function initMenu(doc=document){
 const menu=doc.getElementById('menu'),opener=doc.querySelector('[data-menu-open]'),closer=doc.querySelector('[data-menu-close]');
 if(!menu||!opener||!closer)return;
 const behind=[...doc.querySelectorAll('main,footer,.kf-view-switch')],openLabel=opener.getAttribute('aria-label'),closeLabel=closer.getAttribute('aria-label');
 const set=open=>{
  if((menu.dataset.open==='true')===open)return;
  menu.dataset.open=String(open);menu.inert=!open;doc.body.classList.toggle('kf-menu-open',open);
  for(const el of behind)el.inert=open;
  opener.dataset.open=String(open);opener.setAttribute('aria-expanded',String(open));opener.setAttribute('aria-label',open?closeLabel:openLabel);
  // The panel turns visible one frame after the state change; focus() on a hidden element does nothing.
  setTimeout(()=>(open?closer:opener).focus({preventScroll:true}),open?60:0);};
 opener.addEventListener('click',()=>set(menu.dataset.open!=='true'));
 closer.addEventListener('click',()=>set(false));
 menu.addEventListener('click',event=>{if(event.target.closest('a'))set(false);});
 doc.addEventListener('keydown',event=>{if(event.key==='Escape')set(false);});}
