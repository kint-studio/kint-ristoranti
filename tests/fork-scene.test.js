import {test} from 'node:test';
import assert from 'node:assert/strict';
import {layout,goldImageUrl,maxDprFor,BOUNDS,DEPTH_STYLE} from '../assets/ristoranti/fork-scene.js';
import {FORK_IMAGES} from '../assets/ristoranti/fork-images.js';
// Valori calcolati a mano dalla funzione layout di KfScene.tsx (commit 30508ec), con BOUNDS {top:.042,bottom:.958,left:.417,right:.625}:
// wf=.208, hf=.916, cx=.521. Desktop: ih=min(900*.68/.916, 1440*.36/(.208*2/3))=668.12227, iw=ih*2/3=445.41485,
// x=720-iw*.521=487.93886, y=810-ih*.958=169.93886. Telefono: ih=min(812*.44,370)/.916=390.04367, iw=260.02911,
// x=187.5-iw*.521=52.02483, y=812-266-ih*.958=172.33817.
const near=(actual,expected)=>{for(const k of ['x','y','w','h'])assert.ok(Math.abs(actual[k]-expected[k])<1e-4,`${k}: ${actual[k]} invece di ${expected[k]}`);};
test('layout: 1440x900 come KfScene.tsx',()=>near(layout(1440,900),{x:487.93886,y:169.93886,w:445.41485,h:668.12227}));
test('layout: 375x812 come KfScene.tsx',()=>near(layout(375,812),{x:52.02483,y:172.33817,w:260.02911,h:390.04367}));
test('parametri della forchetta come KfScene.tsx',()=>{
 assert.deepEqual(BOUNDS,{top:.042,bottom:.958,left:.417,right:.625});
 assert.deepEqual(DEPTH_STYLE,{kind:'lineare',gain:.5,cap:.025});
 assert.equal(maxDprFor(true),2);assert.equal(maxDprFor(false),1.5);});
test('goldImageUrl: con il tocco mai l\'immagine da 2048 px',()=>{
 for(const width of [100,300,560,800,1024,1600,3000])for(const dpr of [1,2,3]){
  const url=goldImageUrl(width,{touch:true,dpr});
  assert.match(url,/forchetta3-kintsugi-(640|1024)\.webp$/,`${width}px a ${dpr}x: ${url}`);}});
test('goldImageUrl: sul computer la più piccola che basta',()=>{
 assert.match(goldImageUrl(300,{touch:false,dpr:1}),/kintsugi-640\.webp$/);
 assert.match(goldImageUrl(445,{touch:false,dpr:2}),/kintsugi-1024\.webp$/);
 assert.match(goldImageUrl(800,{touch:false,dpr:2}),/kintsugi\.webp$/);});
test('le immagini della forchetta stanno in assets/ristoranti/',()=>{
 for(const url of [...Object.values(FORK_IMAGES),goldImageUrl(100,{touch:false,dpr:1})])assert.match(url,/^\/assets\/ristoranti\/forchetta3-[\w-]+\.webp$/);});
