/* MY ToksiLab · cihaz sayfalarına "Ana menü" düğmesi
   Sayfanın mevcut menüsüne (sol menü ya da başlıktaki "‹ Laboratuvar" bağlantısı) aynı görünümde bir düğme ekler.
   Ana menü tanıtımsız açılır: index.html#menu */
(function(){
'use strict';
var BASE=/github\.io$/.test(location.hostname)?'':'https://spemrt.github.io/toksilab/';
var URL_=BASE+'index.html#menu';
function ekle(){
 if(document.getElementById('mAnaMenu'))return;
 var home=document.getElementById('mHome');
 /* 1) sol dikey menü (terazi, pipet, vorteks, santrifüj, ultrasonik, su, gaz) */
 if(home&&home.tagName==='BUTTON'&&home.parentNode&&/snav/.test(home.parentNode.className)){
  var b=document.createElement('button');b.id='mAnaMenu';b.title='Ana menüye dön (Laboratuvarı tanı · Eğitimler · Cihazlar)';
  b.innerHTML='<span>☷</span>Ana menü';b.onclick=function(){location.href=URL_};
  home.parentNode.insertBefore(b,home);return}
 /* 2) başlıktaki "‹ Laboratuvar" bağlantısı (HS-GC-MS, SPE, kalibrasyon) */
 var lab=document.getElementById('hLab');
 if(lab){var a=document.createElement('a');a.id='mAnaMenu';a.href=URL_;a.className=lab.className;a.textContent='‹ Ana menü';a.title='Ana menüye dön';
  a.style.marginRight='14px';lab.parentNode.insertBefore(a,lab);return}
 /* 3) diğer sayfalar: küçük sabit düğme */
 var f=document.createElement('a');f.id='mAnaMenu';f.href=URL_;f.textContent='☷ Ana menü';
 f.style.cssText='position:fixed;z-index:50;left:12px;bottom:12px;padding:8px 14px;border-radius:999px;background:rgba(14,21,24,.9);color:#EAF2F3;border:1px solid rgba(43,217,192,.55);font:700 13px "Source Sans 3",system-ui,sans-serif;text-decoration:none;box-shadow:0 6px 16px rgba(0,0,0,.3)';
 document.body.appendChild(f)}
/* ---------- eğitim kataloğundan gelen alt başlık: ?gorev=<id> ----------
   Sayfanın kendi görev / sekme düğmesine basar; Görevler listesinde yalnızca o görevi bırakır (odak). */
var G=null;try{G=new URLSearchParams(location.search).get('gorev')}catch(e){}
function sec(){return document.querySelector('#tasks [data-t="'+G+'"],#nav button[data-v="'+G+'"],#tabs button[data-t="'+G+'"]')}
function odak(){
 if(!G||!/^[a-z0-9_]+$/i.test(G))return;var n=0;
 var iv=setInterval(function(){var b=sec();n++;
  if(b){clearInterval(iv);if(!(b.closest('#tasks')&&G==='parts'))b.click();
   if(document.getElementById('tasks')){
    var st=document.createElement('style');st.id='odakCss';
    st.textContent='body.odak #tasks [data-t]:not([data-t="'+G+'"]){display:none!important}#odakTum{margin-top:8px;border:0;border-radius:10px;padding:8px 12px;font:700 13px "Source Sans 3",system-ui,sans-serif;background:#25333A;color:#EAF2F3;cursor:pointer}body:not(.odak) #odakTum{display:none}';
    document.head.appendChild(st);document.body.classList.add('odak');
    var t=document.getElementById('tasks'),k=document.createElement('button');k.id='odakTum';k.type='button';k.textContent='Tüm görevleri göster';
    k.onclick=function(){document.body.classList.remove('odak')};t.parentNode.insertBefore(k,t.nextSibling)}}
  else if(n>40)clearInterval(iv)},200)}
function basla(){ekle();odak()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',basla);else basla();
})();
