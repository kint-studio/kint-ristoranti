import {test} from 'node:test';
import assert from 'node:assert/strict';
import {initMenu} from '../assets/ristoranti/menu.js';
// Un finto documento con menu, apertura, chiusura e un link dentro il menu.
function setup(){
 const listeners={},docListeners={};const focus={opener:0,closer:0};
 const el=(extra={})=>({dataset:{},attrs:{},getAttribute(k){return this.attrs[k]??null;},setAttribute(k,v){this.attrs[k]=v;},listeners:{},addEventListener(t,f){this.listeners[t]=f;},...extra});
 const menu=el(),opener=el({attrs:{'aria-label':'Apri'},focus(){focus.opener++;}}),closer=el({attrs:{'aria-label':'Chiudi'},focus(){focus.closer++;}});
 const link={closest:s=>s==='a'?link:null};
 const doc={body:{classList:{toggle(){}}},getElementById:()=>menu,querySelector:s=>s==='[data-menu-open]'?opener:closer,querySelectorAll:()=>[],addEventListener:(t,f)=>{docListeners[t]=f;}};
 initMenu(doc);
 return {menu,opener,closer,link,focus,key:k=>docListeners.keydown({key:k})};}
const wait=()=>new Promise(r=>setTimeout(r,90));

test('Esc: chiude il menu e il focus torna al pulsante di apertura',async()=>{
 const s=setup();s.opener.listeners.click();await wait();assert.equal(s.menu.dataset.open,'true');assert.equal(s.focus.closer,1);
 s.key('Escape');await wait();assert.equal(s.menu.dataset.open,'false');assert.equal(s.focus.opener,1);});
test('pulsante di chiusura: il focus torna al pulsante di apertura',async()=>{
 const s=setup();s.opener.listeners.click();await wait();s.closer.listeners.click();await wait();
 assert.equal(s.menu.dataset.open,'false');assert.equal(s.focus.opener,1);});
test('clic su un link: il menu si chiude senza spostare il focus sull\'apertura',async()=>{
 const s=setup();s.opener.listeners.click();await wait();
 s.menu.listeners.click({target:s.link});await wait();
 assert.equal(s.menu.dataset.open,'false');assert.equal(s.focus.opener,0);});
