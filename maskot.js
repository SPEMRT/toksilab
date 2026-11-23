/* MY ToksiLab · maskotlar (Toksi, Vivi, Pipo, Molli)
   Her sayfa adresine göre kendi maskotunu alır (SAYFA listesi). Sayfaya <head> içinde eklenir:
     <script src="maskot.js" charset="utf-8"></script>
   Kendiliğinden: eski rehber fotoğrafı (img#av, .mentor img, .hero img[src*=avatar]) ve "UZM. MY" etiketleri
   maskotla değişir; rehber balonunun (#say, #sayT) yazısına göre maskot sevinir ya da düşünür.
   Derslerden: MASKOT.kart(durum, metin) → rehber kartı HTML'i; durum: bekle | dogru | yanlis | bak.
   Uzm. MY videoları, personel kartı ve eğitim belgesindeki imza bilinçli olarak değişmez. */
(function(){
'use strict';
if(window.MASKOT)return;
var GOZ=function(x1,x2,y,rx,ry,r,koyu){return '<g class="acik"><ellipse cx="'+x1+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#fff"/><ellipse cx="'+x2+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'" fill="#fff"/><g class="pup"><circle cx="'+(x1+1)+'" cy="'+(y+1)+'" r="'+r+'" fill="'+koyu+'"/><circle cx="'+(x2+1)+'" cy="'+(y+1)+'" r="'+r+'" fill="'+koyu+'"/><circle cx="'+(x1+2.3)+'" cy="'+(y-.7)+'" r="1.3" fill="#fff"/><circle cx="'+(x2+2.3)+'" cy="'+(y-.7)+'" r="1.3" fill="#fff"/></g></g>'+
 '<g class="mutlu" fill="none" stroke="'+koyu+'" stroke-width="3" stroke-linecap="round"><path d="M'+(x1-6)+' '+(y+1)+'q6-7 12 0"/><path d="M'+(x2-6)+' '+(y+1)+'q6-7 12 0"/></g>'};
var AGIZ=function(x,y,koyu){return '<path class="gul" d="M'+(x-5)+' '+y+'q5 5 10 0" fill="none" stroke="'+koyu+'" stroke-width="2.5" stroke-linecap="round"/><ellipse class="hmm" cx="'+(x+1)+'" cy="'+(y+1)+'" rx="2.7" ry="2.2" fill="'+koyu+'"/>'};
var YAN=function(x1,x2,y){return '<ellipse cx="'+x1+'" cy="'+y+'" rx="5" ry="3" fill="#FF8FA3" opacity=".55"/><ellipse cx="'+x2+'" cy="'+y+'" rx="5" ry="3" fill="#FF8FA3" opacity=".55"/>'};
var SUS=function(x,y,renk){return '<text class="soru" x="'+x+'" y="'+y+'" font-size="22" font-weight="700" fill="#F2B632" font-family="Barlow Condensed,sans-serif">?</text><g class="yildiz" fill="'+renk+'"><path d="M10 34l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/><path d="M88 40l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6z"/></g>'};
var K={
 toksi:{ad:'Toksi',rol:'Rehber · laboratuvar ve temel beceriler',ciz:function(u){return '<defs><linearGradient id="d'+u+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5CF0DA"/><stop offset="1" stop-color="#18A897"/></linearGradient></defs>'+
  '<g class="beden"><path d="M50 5C50 5 17 45 17 67a33 33 0 0 0 66 0C83 45 50 5 50 5Z" fill="url(#d'+u+')" stroke="#0E7C72" stroke-width="2"/><ellipse cx="35" cy="50" rx="5" ry="9" fill="#fff" opacity=".55" transform="rotate(20 35 50)"/>'+
  YAN(33,67,76)+GOZ(40,60,66,7,8.5,4,'#12262B')+AGIZ(50,80,'#12262B')+'</g>'+SUS(80,22,'#F2B632')}},
 vivi:{ad:'Vivi',rol:'HS-GC-MS ve kanda etanol',ciz:function(u){return '<defs><linearGradient id="v'+u+'" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C7D2D6"/><stop offset=".5" stop-color="#F2F6F7"/><stop offset="1" stop-color="#9FAEB3"/></linearGradient></defs>'+
  '<g class="beden"><rect x="27" y="28" width="46" height="66" rx="10" fill="#DFF3F5" fill-opacity=".35" stroke="#BFE3E8" stroke-width="2.5"/><path d="M29.5 58h41v26a8 8 0 0 1-8 8h-25a8 8 0 0 1-8-8z" fill="#F2B632" opacity=".9"/><path d="M29.5 58h41" stroke="#FFD87A" stroke-width="2"/>'+
  '<rect x="24" y="14" width="52" height="16" rx="4" fill="url(#v'+u+')" stroke="#7E8F95" stroke-width="1.5"/><rect x="38" y="9" width="24" height="7" rx="2" fill="#E5484D"/><rect x="33" y="34" width="4" height="18" rx="2" fill="#fff" opacity=".6"/>'+
  YAN(38,62,73)+GOZ(42,58,64,6,7,3.4,'#12262B')+AGIZ(50,77,'#12262B')+'</g>'+SUS(80,20,'#2BD9C0')}},
 pipo:{ad:'Pipo',rol:'Pipetleme',ciz:function(u){return '<defs><linearGradient id="p'+u+'" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7FB8F5"/><stop offset=".45" stop-color="#C9E2FF"/><stop offset="1" stop-color="#4F8FDA"/></linearGradient></defs>'+
  '<g class="beden"><path d="M24 14h52l-4 10H28z" fill="#2F7DE1"/><path d="M28 24h44L55 92a5 5 0 0 1-10 0z" fill="url(#p'+u+')" stroke="#2F6FC0" stroke-width="2" stroke-linejoin="round"/><path d="M45.5 78h9L55 92a5 5 0 0 1-10 0z" fill="#2BD9C0"/><path d="M34 30l3 22" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>'+
  YAN(38,62,54)+GOZ(42,58,43,6,7.5,3.4,'#12262B')+AGIZ(50,57,'#12262B')+'</g>'+SUS(78,20,'#F2B632')}},
 molli:{ad:'Molli',rol:'Kalibrasyon, tartım ve hesaplar',ciz:function(u){return '<defs><radialGradient id="m'+u+'" cx=".35" cy=".3"><stop offset="0" stop-color="#C69BFF"/><stop offset="1" stop-color="#7A45D6"/></radialGradient><radialGradient id="n'+u+'" cx=".35" cy=".3"><stop offset="0" stop-color="#FFE29A"/><stop offset="1" stop-color="#E0A21C"/></radialGradient></defs>'+
  '<g class="beden"><g stroke="#BFD0D6" stroke-width="5" stroke-linecap="round"><path d="M50 52L18 30"/><path d="M50 52L82 30"/><path d="M50 52L50 90"/></g><circle cx="18" cy="30" r="10" fill="url(#n'+u+')"/><circle cx="82" cy="30" r="10" fill="url(#n'+u+')"/><circle cx="50" cy="91" r="8" fill="#E5484D"/>'+
  '<circle cx="50" cy="52" r="27" fill="url(#m'+u+')" stroke="#5B2FA8" stroke-width="2"/>'+YAN(36,64,62)+GOZ(41,59,50,6.5,8,3.8,'#1B1030')+AGIZ(50,64,'#1B1030')+'</g>'+SUS(82,14,'#2BD9C0')}}};
/* sayfa → maskot (listede olmayan sayfalar Toksi) */
var SAYFA={hsgcms_pilot:'vivi',egitim:'vivi',pipet_pilot:'pipo',kalibrasyon_pilot:'molli',terazi_pilot:'molli',ornek_hazirlama:'molli'};
var sayfa=(location.pathname.split('/').pop()||'index.html').replace(/\.html?$/,'');
var BU=SAYFA[sayfa]||'toksi',n=0;

var CSS='.msk{display:inline-block;width:52px;height:52px;flex:none;line-height:0}.msk svg{width:100%;height:100%;overflow:visible}.msk-yer{display:block;width:100%;height:auto;aspect-ratio:1}'+
'.msk .beden{transform-box:fill-box;transform-origin:50% 100%;animation:mskNefes 3.2s ease-in-out infinite}@keyframes mskNefes{50%{transform:scale(1.025,.975)}}'+
'.msk .acik{transform-box:fill-box;transform-origin:50% 50%;animation:mskKirp 4.6s infinite}@keyframes mskKirp{0%,93%,100%{transform:scaleY(1)}95.5%{transform:scaleY(.1)}}'+
'.msk .pup{transition:transform .35s}.msk .mutlu,.msk .hmm,.msk .soru,.msk .yildiz{display:none}'+
'.msk-dogru .beden{animation:mskZipla .9s ease-in-out 3}@keyframes mskZipla{0%,100%{transform:translateY(0) scale(1.04,.96)}35%{transform:translateY(-16%) scale(.97,1.04)}60%{transform:translateY(0) scale(1.06,.94)}}'+
'.msk-dogru .acik{display:none}.msk-dogru .mutlu{display:inline}.msk-dogru .yildiz{display:inline;animation:mskParla .9s ease-in-out infinite}.msk .yildiz path{transform-box:fill-box;transform-origin:center}@keyframes mskParla{0%,100%{opacity:.2;transform:scale(.6)}40%{opacity:1;transform:scale(1)}}'+
'.msk-yanlis .beden{animation:none;transform:rotate(-9deg);transition:transform .4s}.msk-yanlis .pup{transform:translate(-1.5px,-3px)}.msk-yanlis .gul{display:none}.msk-yanlis .hmm{display:inline}.msk-yanlis .soru{display:inline}'+
'.msk-bak .pup{transform:translateX(-3.5px)}.msk-bak .beden{animation:mskEgil 1.6s ease-in-out infinite}@keyframes mskEgil{50%{transform:rotate(-5deg)}}'+
'.mskKart{display:grid;grid-template-columns:52px 1fr;gap:10px;align-items:center;background:#F1F6F7;color:#16242A;border-radius:12px;padding:8px 12px;border-left:5px solid #2BD9C0}'+
'.mskKart .msk{width:52px;height:52px}.mskKart b.mskAd{display:block;font:600 10.5px "IBM Plex Mono",ui-monospace,monospace;color:#1F9A97;letter-spacing:.08em}.mskKart p{font-size:14px;line-height:1.4;margin:0}'+
'.msk-ik{width:30px;height:30px;vertical-align:middle;margin-right:6px}'+
'@media (prefers-reduced-motion:reduce){.msk *{animation:none!important}}';
function stil(){if(document.getElementById('mskCss'))return;var s=document.createElement('style');s.id='mskCss';s.textContent=CSS;(document.head||document.documentElement).appendChild(s)}
stil();
function svg(k){var c=K[k]||K[BU];n++;return '<svg viewBox="0 0 100 100" aria-hidden="true">'+c.ciz('mk'+n)+'</svg>'}
function span(durum,ek,k){return '<span class="msk msk-'+(durum||'bekle')+(ek?' '+ek:'')+'" role="img" aria-label="'+(K[k]||K[BU]).ad+'">'+svg(k)+'</span>'}
var M={
 kod:BU,ad:K[BU].ad,AD:K[BU].ad.toLocaleUpperCase('tr-TR'),hepsi:K,
 svg:svg,span:span,
 kart:function(durum,metin,k){var c=K[k]||K[BU];return '<div class="mskKart">'+span(durum,'',k)+'<div><b class="mskAd">'+c.ad.toLocaleUpperCase('tr-TR')+'</b><p>'+metin+'</p></div></div>'},
 /* yazıya göre durum: olumlu → dogru, olumsuz → yanlis */
 sez:function(t){t=String(t||'').replace(/<[^>]*>/g,' ');
  if(/✗|⚠|Olmadı|Yanlış|yanlış|Hata|hata|Dikkat|Bir daha|tekrar dene|olmaz|Yapma|değil!/.test(t))return 'yanlis';
  if(/✓|Doğru|Harika|Tebrik|Aferin|Bravo|Süper|Mükemmel|başardın|tamamlandı|Tamamdır/.test(t))return 'dogru';return 'bekle'},
 durum:function(el,d,ms){if(!el)return;el.className=el.className.replace(/\bmsk-(bekle|dogru|yanlis|bak)\b/g,'').trim()+' msk-'+d;clearTimeout(el._mt);if(ms&&d!=='bekle')el._mt=setTimeout(function(){M.durum(el,'bekle')},ms)}};
window.MASKOT=M;

/* eski rehber fotoğrafı ve "UZM. MY" etiketleri → maskot */
function degistir(){
 var imgs=[].slice.call(document.querySelectorAll('img#av,.mentor img,.hero img[src*="avatar"]'));
 imgs.forEach(function(im){if(im.dataset.msk)return;im.dataset.msk=1;var d=document.createElement('span');d.innerHTML=span('bekle','msk-yer');var e=d.firstChild;im.style.display='none';im.parentNode.insertBefore(e,im)});
 [].slice.call(document.querySelectorAll('.mentor .nm,.hero .nm,.say b.n')).forEach(function(b){if(/UZM\.?\s*MY/i.test(b.textContent))b.textContent=M.AD});
 var sy=document.querySelector('.say b.n');if(sy&&!sy.parentNode.parentNode.querySelector('.msk')){var t=document.createElement('span');t.innerHTML=span('bekle','msk-ik');sy.parentNode.parentNode.insertBefore(t.firstChild,sy.parentNode)}
 /* rehber balonu değişince maskot tepki verir */
 ['say','sayT'].forEach(function(id){var y=document.getElementById(id);if(!y||y.dataset.msk||!window.MutationObserver)return;y.dataset.msk=1;
  var kut=y.closest('.mentor,.say,.hero')||y.parentNode.parentNode;
  new MutationObserver(function(){var m=kut&&kut.querySelector('.msk');if(m)M.durum(m,M.sez(y.innerHTML),2600)}).observe(y,{childList:true,characterData:true,subtree:true})})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',degistir);else degistir();
})();
