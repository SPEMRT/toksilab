/* MY ToksiLab · Geri al
   Derslerde ve serbest kullanımda yapılan her işlemi (tüpü koymak, düğmeye basmak, sıvı eklemek…) tek tek geri alır.
   Yöntem: öğrenci sahneye ya da bir düğmeye dokunduğu anda cihazın durumunun kopyası alınır ("önce");
   dokunuş gerçekten bir işlem yaptıysa (sayfa __izin ile onay verdi ya da bir düğmeye basıldı) ve durum değiştiyse
   kopya yığına konur. Geri al, yığındaki son kopyayı cihaza geri yükler. Sahneler durumdan çizildiği için
   tüp, sıvı ve düğmeler de kendiliğinden eski hâline döner.
   Kullanan dosyalar: cihaz_ders.js (8 cihaz), hs_ders.js (HS-GC-MS). SPE kendi bağlayıcısını verir (window.__geriAdaptor). */
(function(){
'use strict';
if(window.GERIAL)return;
var MAX=300;
function duz(v){return v&&typeof v==='object'}
/* derin kopya (yalnız veri: sayı, yazı, dizi, nesne, Set, Map, Float32Array) */
function klon(v){
 if(typeof structuredClone==='function')try{return structuredClone(v)}catch(e){}
 if(!duz(v))return v;
 if(ArrayBuffer.isView(v))return v.slice();
 if(v instanceof Set)return new Set([].slice.call(v).map(klon));
 if(v instanceof Map){var m=new Map();v.forEach(function(x,k){m.set(k,klon(x))});return m}
 var o=Array.isArray(v)?[]:{};for(var k in v)if(Object.prototype.hasOwnProperty.call(v,k))o[k]=klon(v[k]);return o}
/* hedefi kaynağa eşitler; hedefteki nesnelerin kimliği korunur (sayfa bir alt nesneyi değişkende tutuyor olabilir) */
function yerinde(h,k){
 if(Array.isArray(h)&&Array.isArray(k)){
  for(var i=0;i<k.length;i++){if(i<h.length&&duz(h[i])&&duz(k[i])&&tur(h[i])===tur(k[i]))yerinde(h[i],k[i]);else h[i]=klon(k[i])}
  h.length=k.length;return h}
 if(ArrayBuffer.isView(h)&&ArrayBuffer.isView(k)&&h.length===k.length){h.set(k);return h}
 if(h instanceof Set&&k instanceof Set){h.clear();k.forEach(function(x){h.add(klon(x))});return h}
 if(h instanceof Map&&k instanceof Map){h.clear();k.forEach(function(x,a){h.set(a,klon(x))});return h}
 Object.keys(h).forEach(function(a){if(!(a in k)&&!veriDegil(h[a]))delete h[a]});
 Object.keys(k).forEach(function(a){var x=h[a],y=k[a];if(duz(x)&&duz(y)&&tur(x)===tur(y))yerinde(x,y);else h[a]=klon(y)});
 return h}
/* veri olmayan değerler (işlev, sayfa öğesi, 3B nesne): kopyalanmaz, geri yüklenirken de silinmez */
function veriDegil(v){return typeof v==='function'||(typeof Node!=='undefined'&&v instanceof Node)||!!(v&&(v.isObject3D||v.isMaterial||v.isTexture))}
/* yalnız veri kısmının kopyası */
function veri(v){
 if(veriDegil(v))return undefined;
 if(!duz(v)||ArrayBuffer.isView(v)||v instanceof Date)return klon(v);
 if(v instanceof Set||v instanceof Map)return klon(v);
 var o=Array.isArray(v)?[]:{};for(var k in v)if(Object.prototype.hasOwnProperty.call(v,k)&&!veriDegil(v[k]))o[k]=veri(v[k]);return o}
function tur(v){return Array.isArray(v)?'a':ArrayBuffer.isView(v)?'t':v instanceof Set?'s':v instanceof Map?'m':'o'}
/* derin eşitlik; yok: her derinlikte göz ardı edilecek anahtarlar (saat, gösterge gibi kendi kendine değişenler) */
function esit(a,b,yok){
 if(a===b)return true;
 if(typeof a==='number'&&typeof b==='number')return Math.abs(a-b)<1e-9||(a!==a&&b!==b);
 if(!duz(a)||!duz(b)||tur(a)!==tur(b))return false;
 if(ArrayBuffer.isView(a)){if(a.length!==b.length)return false;for(var i=0;i<a.length;i++)if(Math.abs(a[i]-b[i])>1e-9)return false;return true}
 if(a instanceof Set||a instanceof Map){if(a.size!==b.size)return false;var A=[].slice.call(a.entries()),B=[].slice.call(b.entries());return esit(A,B,yok)}
 var ka=Object.keys(a).filter(function(k){return !(yok&&yok[k])}),kb=Object.keys(b).filter(function(k){return !(yok&&yok[k])});
 if(ka.length!==kb.length)return false;
 for(var j=0;j<ka.length;j++){var k=ka[j];if(!Object.prototype.hasOwnProperty.call(b,k)||!esit(a[k],b[k],yok))return false}
 return true}

/* Yığın. o = {al(): kopya, koy(kopya), ayni(kopya): şimdiki durum kopyayla aynı mı, mesgul(): hareket sürüyor mu,
   onemli(kopya): dokunuş işlem sayılmasa da yığına konsun mu} */
function Yigin(o){
 var y=[],bek=null;
 /* dokunuş sayılır mı: işlem yaptı ve durum değişti; ya da (o.onemli) dersin yeri değişti (ör. doğru parçaya dokunuldu) */
 var deg=function(b){if(b.k&&b.k.gecersiz)return false;return (b.e&&!o.ayni(b.k))||!!(o.onemli&&o.onemli(b.k))};
 var Y={
  /* dokunuştan hemen önce: durumun kopyası */
  once:function(){Y.isle();bek={k:o.al(),e:false}},
  /* dokunuş bir işlem yaptı (sayfa izin verdi / düğmeye basıldı) */
  eylem:function(){if(bek)bek.e=true},
  /* bekleyen dokunuşu sonuçlandır: işlem olduysa ve durum değiştiyse yığına koy */
  isle:function(){var b=bek;bek=null;if(b&&deg(b))Y.ekle(b.k)},
  /* bekleyen bir işlem var mı (henüz yığına konmamış ama durum değişmiş) */
  bekliyor:function(){return !!(bek&&deg(bek))},
  /* şimdiki durumun kopyası (ör. Devam'a basılınca saklamak için) */
  kopya:function(){return o.al()},
  ekle:function(k){y.push(k);if(y.length>MAX)y.shift()},
  ust:function(){if(Y.bekliyor())return bek.k;return y[y.length-1]||null},
  say:function(){return y.length+(Y.bekliyor()?1:0)},
  mesgul:function(){try{return !!(o.mesgul&&o.mesgul())}catch(e){return false}},
  /* son işlemi geri al: true dönerse geri alındı */
  geri:function(){if(Y.mesgul())return false;Y.isle();var k=y.pop();if(!k)return false;o.koy(k);return true},
  temizle:function(){y.length=0;bek=null}
 };
 return Y}

/* Sayfadaki dokunuşları dinler. s = {disla(hedef): bu dokunuş sayılmaz (ders düğmeleri),
   eylemMi(hedef): dokunulan şey kendi başına bir işlem (HTML düğmesi, kaydırıcı…)} */
var KONTROL='button,input,select,textarea,label,[role=button],[data-k],.bt,.seg button';
function dinle(Y,s){
 var bas=function(e){var t=e.target;if(!t||!t.closest)return;
  if(s.disla&&s.disla(t)){Y.isle();return}
  Y.once();if(t.closest(KONTROL)||(s.eylemMi&&s.eylemMi(t)))Y.eylem()};
 document.addEventListener('pointerdown',bas,true);
 document.addEventListener('keydown',function(e){var t=e.target;if(e.repeat||!t||!t.closest)return;
  if(t.closest('input,select,textarea'))return; /* yazı kutusu: değişiklik bir sonraki dokunuşta sayılır */
  if(s.disla&&s.disla(t))return;
  if(e.ctrlKey||e.metaKey||e.altKey)return;
  if(/^(Shift|Control|Alt|Meta|Tab|Escape)$/.test(e.key))return;Y.once();Y.eylem()},true);
 /* Ctrl+Z (Mac: ⌘+Z): geri al (yazı kutusundayken kutunun kendi geri alması çalışır) */
 if(s.kisayol)document.addEventListener('keydown',function(e){if((e.ctrlKey||e.metaKey)&&!e.shiftKey&&(e.key==='z'||e.key==='Z')){var t=e.target;if(t&&t.closest&&t.closest('input,textarea,select,[contenteditable]'))return;e.preventDefault();s.kisayol()}})}

/* HS-GC-MS sayfası (hsgcms_pilot.html, A = window.__hs): durum S, PLAN (vialler), IC (sekans), METH (yöntemler) ve açık ekran,
   program sekmesi, açık menüler. Programda bir pencere açıkken alınan kopya geçersizdir (yığına konmaz): pencerede yapılanlar
   pencereyle birlikte tek işlem sayılır. Kullanan: hs_ders.js (ders), hs_serbest.js (serbest kullanım). */
function hsBag(A){
 var S=A.S,YOK={seen:1,ovenA:1,inletA:1,auxA:1,za:1,rt:1,runLen:1};
 var pen=function(){return [].slice.call(document.querySelectorAll('#desk .dlg'))};
 var app=function(){var d=document.getElementById('appDA');return d&&d.classList.contains('on')?'da':'ic'};
 var al=function(){var s={};Object.keys(S).forEach(function(k){s[k]=S[k]});
  return {gecersiz:pen().length>0,v:veri({S:s,plan:A.PLAN,ic:A.IC,meth:A.METH}),view:S.view,app:app(),
   menu:[].slice.call(document.querySelectorAll('[data-m].open')).map(function(x){return x.dataset.m})}};
 return {al:al,
  ayni:function(k){var n=al();return esit(k.v,n.v,YOK)&&k.view===n.view&&k.app===n.app&&k.menu.join()===n.menu.join()&&n.gecersiz===k.gecersiz},
  koy:function(k){var v=klon(k.v);
   pen().forEach(function(d){d.remove()});var o=document.getElementById('ovl');if(o)o.style.display='none';
   document.querySelectorAll('[data-m].open').forEach(function(x){if(k.menu.indexOf(x.dataset.m)<0)x.classList.remove('open')});
   yerinde(S,v.S);yerinde(A.PLAN,v.plan);yerinde(A.IC,v.ic);yerinde(A.METH,v.meth);
   S.view='';A.show(k.view);if(k.view==='pc'&&A.pcApp)A.pcApp(k.app);
   var tp=document.getElementById('tip');if(tp)tp.style.display='none'},
  mesgul:function(){return !!(S.hs.run||S.gc.run||A.IC.acq)}}}
window.GERIAL={veri:veri,hsBag:hsBag,klon:klon,yerinde:yerinde,esit:esit,Yigin:Yigin,dinle:dinle,KONTROL:KONTROL};
})();
