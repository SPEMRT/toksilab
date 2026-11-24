/* MY ToksiLab · HS-GC-MS serbest kullanım (sekmeli, sade)
   hsgcms_pilot.html?serbest=hs|gc|pc ya da parametresiz açılınca devreye girer.
   Rehberli ders (?ders=), metot geliştirme (?mod=metot), görev bağlantıları (?gorev=) ve etkin "Kanda etanol"
   analiz modülü (eğitim çubuğu) varken çalışmaz: o durumda sayfanın SOP ekranı olduğu gibi kalır.
   Üstte üç sekme (HS örnekleyici · GC-MS · Bilgisayar), solda sekmenin görünümleri, sağda "Burada neler yapabilirsin?"
   kartı ve maskot; maskot sayfanın kendi uyarılarını (#say) aktarır. */
(function(){
'use strict';
var Q;try{Q=new URLSearchParams(location.search)}catch(e){return}
if(Q.get('ders')||Q.get('mod')||Q.get('gorev')||Q.get('egitim')||Q.get('sop'))return;
/* "Kanda etanol" analiz modülü sürüyorsa SOP ekranı gösterilir */
if(!Q.get('serbest')){try{var eg=JSON.parse(localStorage.getItem('toksilab_egitim_v1')||'{}');if(eg&&eg.aktif)return}catch(e){}}

var SEK={
 hs:{ad:'♨️ HS örnekleyici',alt:'AGILENT 7694E',ders:'hsgc',
  v:[['main','Cihaz'],['hskey','Tuş takımı'],['hslid','Karusel · vial yükle'],['prep','Vial hazırlama']],
  m:['<b>Tuş takımında</b> fırın, loop ve transfer hattı sıcaklıklarını, süreleri gör; değiştir.','<b>Vialleri</b> hazırla ve karusele yerleştir; <b>FIRST / LAST VIAL</b>’ı yüklemeye göre ayarla.','<b>Start</b>’a bas, vialin cihaz içindeki yolculuğunu izle.'],
  ip:'HS sekmesindesin. Bir parametreyi değiştirip ne olduğuna bak; burada bir şey bozulmaz.'},
 gc:{ad:'🔥 GC-MS',alt:'AGILENT 6890N · 5975B',ders:'hsgc',
  v:[['main','Cihaz'],['oven','Fırın'],['gckey','Tuş takımı'],['an:col','▶ Kolon animasyonu'],['an:inlet','▶ Inlet animasyonu']],
  m:['<b>Fırın kapağını</b> aç; kolonu, inleti ve MSD transfer hattını incele.','<b>Tuş takımında</b> fırın programını, inleti ve kolon akışını gör; değiştir.','<b>Kolon animasyonunda</b> sıcaklığı değiştir, piklerin nasıl ayrıldığını gör.','<b>Inlet animasyonunda</b> split oranını ve splitless’ı dene.'],
  ip:'Kolon animasyonunda istediğin sıcaklığı dene: düşükte ayrılma, yüksekte üst üste binme.'},
 pc:{ad:'🖥 Bilgisayar',alt:'MASSHUNTER',ders:'hsgc',
  v:[['pc:ic','Veri toplama'],['pc:da','Veri analizi']],
  m:['<b>Yöntemi</b> yükle, parametrelerine bak; değişikliği yeni bir yöntem olarak kaydet.','<b>Sekans tablosunu</b> doldur, kontrol et; <b>Run Sequence</b> ile analizi başlat.','<b>Veri analizinde</b> kromatogramı ve spektrumu aç, pikleri incele.'],
  ip:'Önce sekansı kur, sonra HS’te Start’a bas: gerçek sıra budur.'}};
/* görünüm → sekme (fotoğraftaki bir bölgeye dokunarak başka görünüme geçilince sekme kendiliğinden değişir) */
var VSEK={hskey:'hs',hslid:'hs',prep:'hs',oven:'gc',gckey:'gc',pc:'pc'};
var sek=SEK[Q.get('serbest')]?Q.get('serbest'):'hs',A,S,P,sayT='',sayZ=0,MK;

var css=document.createElement('style');
css.textContent=
'body.serb .mentor,body.serb #nav,body.serb .side>*:not(#serbP){display:none!important}'+
'body.serb .hdr .pill{font-size:0}body.serb .hdr .pill::after{content:"HS-GC-MS · SERBEST KULLANIM";font-size:10.5px}'+
'body.serb .main{grid-template-columns:minmax(0,1fr) minmax(300px,360px)}'+
'#serbSek{display:flex;gap:6px;flex-wrap:wrap;margin:2px 0 10px}#serbSek button{border:0;border-radius:12px;padding:10px 16px;font:700 16px "Source Sans 3",sans-serif;background:#25333A;color:#EAF2F3;cursor:pointer}'+
'#serbSek button.on{background:#2BD9C0;color:#062126}'+
'#serbAlt{display:flex;gap:6px;flex-wrap:wrap}#serbAlt button{border:1px solid #34454D;border-radius:10px;padding:7px 12px;font:600 14px "Source Sans 3",sans-serif;background:transparent;color:#C7D6DA;cursor:pointer}'+
'#serbAlt button.on{background:#2F7DE1;border-color:#2F7DE1;color:#fff}#serbAlt button.an{border-style:dashed;color:#7FDCD0}'+
'#serbP{display:grid;gap:12px;align-content:start}#serbP h3{font:700 20px "Barlow Condensed",sans-serif;letter-spacing:.02em}#serbP h3 small{display:block;font:600 11px "IBM Plex Mono",monospace;color:#9BB0B6;letter-spacing:.08em}'+
'#serbP ul{margin-left:18px;display:grid;gap:6px;font-size:14.5px;line-height:1.4;color:#D7E4E7}#serbP .mskKart p{font-size:13.5px}'+
'#serbP .dn{border:0;border-radius:10px;padding:10px;font:700 14.5px "Source Sans 3",sans-serif;background:#33444C;color:#EAF2F3;cursor:pointer}'+
'#serbP .not{font-size:12.5px;color:#9BB0B6}'+
'@media (max-width:1000px){body.serb .main{grid-template-columns:1fr}}';
document.head.appendChild(css);

function $(q){return document.querySelector(q)}
function goster(v){
 if(v.indexOf('an:')===0){var f=v==='an:col'?A.colAnim:A.inletAnim;if(f)f();return}
 if(v.indexOf('pc:')===0){if(S.view!=='pc')A.show('pc');if(A.pcApp)setTimeout(function(){A.pcApp(v.slice(3))},50);ciz();return}
 if(v==='hslid'&&S.hs&&S.hs.run){say2('HS çalışırken fırın kapağı açılmaz: vialler sıcak ve basınçlı.');return}
 if(v==='oven'&&S.gc&&S.gc.run){say2('GC çalışırken fırın kapağı açılmaz.');return}
 A.show(v);ciz()}
function say2(t){sayT=t;sayZ=Date.now();yan()}
function aktifV(){var T=SEK[sek],v=S.view;if(v==='pc'){var da=document.getElementById('appDA');return da&&da.classList.contains('on')?'pc:da':'pc:ic'}return v}
function ciz(){
 var T=SEK[sek];
 document.querySelectorAll('#serbSek button').forEach(function(b){b.classList.toggle('on',b.dataset.s===sek)});
 var av=aktifV();
 document.getElementById('serbAlt').innerHTML=T.v.map(function(x){return '<button data-v="'+x[0]+'" class="'+(x[0].indexOf('an:')===0?'an ':'')+(x[0]===av?'on':'')+'">'+x[1]+'</button>'}).join('');
 document.querySelectorAll('#serbAlt button').forEach(function(b){b.onclick=function(){goster(b.dataset.v)}});
 yan()}
function yan(){
 var T=SEK[sek],taze=sayT&&Date.now()-sayZ<20000,t=taze?sayT:T.ip,d=taze?(MK?MK.sez(sayT):'bekle'):'bekle';
 P.innerHTML='<h3><small>'+T.alt+'</small>Burada neler yapabilirsin?</h3><ul>'+T.m.map(function(q){return '<li>'+q+'</li>'}).join('')+'</ul>'+
  (MK?MK.kart(d,t):'<p>'+t+'</p>')+
  '<button class="dn" id="serbDers">☰ Rehberli derse dön</button><p class="not">Fotoğraflar ve yöntem değerleri kendi cihazımızdan (ALKOL2.M). Zaman 120 kat hızlı akar.</p>';
 document.getElementById('serbDers').onclick=function(){location.href=location.pathname+'?ders='+T.ders}}
function sekme(s){if(!SEK[s])return;sek=s;var v=SEK[s].v[0][0];
 /* sekmeye geçince o sekmenin ilk görünümü açılır; bulunduğu görünüm zaten o sekmedeyse kalır */
 var av=aktifV(),icinde=SEK[s].v.some(function(x){return x[0]===av});if(!icinde)goster(v);else ciz();
 try{history.replaceState(null,'',location.pathname+'?serbest='+s)}catch(e){}}
function basla(){
 if(!window.__hs||!document.querySelector('.side')){setTimeout(basla,150);return}
 A=window.__hs;S=A.S;MK=window.MASKOT;document.body.classList.add('serb');
 var sk=document.createElement('div');sk.id='serbSek';sk.innerHTML=Object.keys(SEK).map(function(k){return '<button data-s="'+k+'">'+SEK[k].ad+'</button>'}).join('');
 var nav=document.getElementById('nav');nav.parentNode.insertBefore(sk,nav);
 var al=document.createElement('div');al.id='serbAlt';var sw=document.getElementById('stageW');sw.parentNode.insertBefore(al,sw);
 P=document.createElement('div');P.id='serbP';document.querySelector('.side').appendChild(P);
 sk.querySelectorAll('button').forEach(function(b){b.onclick=function(){sekme(b.dataset.s)}});
 /* sayfanın kendi uyarıları maskot kartına yansır */
 var y=document.getElementById('say');if(y&&window.MutationObserver)new MutationObserver(function(){sayT=y.innerHTML;sayZ=Date.now();yan()}).observe(y,{childList:true,characterData:true,subtree:true});
 /* görünüm değişince (fotoğraftaki bölgeye dokunma, geri düğmesi) sekme ve alt düğmeler eşlenir */
 var son='';setInterval(function(){var av=aktifV();if(av===son)return;son=av;var s=VSEK[S.view];if(s&&s!==sek){sek=s;try{history.replaceState(null,'',location.pathname+'?serbest='+s)}catch(e){}}ciz()},250);
 sekme(sek);window.__hsSerbest={sekme:sekme,durum:function(){return {sek:sek,v:aktifV()}}}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',basla);else basla();
})();
