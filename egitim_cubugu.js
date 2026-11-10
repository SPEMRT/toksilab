/* MY ToksiLab · Eğitim çubuğu ve modül tanımları
   Mevcut sayfalara tek satırla eklenir:  <script src="egitim_cubugu.js" defer></script>
   Etkin bir eğitim yoksa ya da bu sayfa etkin eğitimin bir adımı değilse hiçbir şey göstermez. */
(function(){
'use strict';
var LS='toksilab_egitim_v1';

/* ---------- modüller ---------- */
var MOD={
 etanol:{id:'etanol',ad:'Kanda etanol (HS-GC-MS)',ic:'🩸',renk:'#2BD9C0',sure:'≈ 3–4 saat',seviye:'Başlangıç–orta',durum:'aktif',
  ozet:'Kan örneğinde etanolün iç standartlı headspace GC-MS ile tayini: KKD’den tartıma, kalibratör ve vial hazırlamadan ALKOL2.M analizine ve sonucun raporlanmasına kadar.',
  kazanim:['Kanda etanol analizinin ilkesini (headspace, iç standart, tuzla çıkarma) açıklar','Analitik terazi ve otomatik pipeti SOP’a uygun kullanır','Ana stok, ara stok, iç standart ve 12 HS vialini hesaplayıp hazırlar','Kalibrasyon eğrisini değerlendirir; QC ve numune sonucunu hesaplar','HS-GC-MS’te ALKOL2.M ile sekans çalıştırır ve sonucu raporlar'],
  adimlar:[
   {id:'on',ad:'Ön bilgi ve ön test',ic:'📘',sayfa:'egitim.html?m=etanol#on',tur:'ic',
    gorev:'Kısa ön bilgiyi oku ve 8 soruluk ön testi çöz. Ön test başarı şartı değildir; finalde ne kadar ilerlediğini gösterir.'},
   {id:'kkd',ad:'KKD ve laboratuvar',ic:'🥼',sayfa:'egitim.html?m=etanol#kkd',tur:'ic',ek:['lab_giris.html'],
    gorev:'Kan örneğiyle çalışırken gereken kişisel koruyucu donanımı seç, sonra laboratuvara gir: Oda 2 Örnek Hazırlama ve Oda 1 Kromatografi’yi gez.'},
   {id:'tartim',ad:'Tartım',ic:'⚖️',sayfa:'terazi_pilot.html?ret=r2-bal',tur:'dis',
    gorev:'Mikroterazinin parçalarını tanı; seviyeyi ayarla ve iç kalibrasyonu yap; 10,00 mg referans standardı tart. (5,00 mg plastik kayık ve serbest tartım isteğe bağlı.)',
    olcut:['Parçaları tanı','Seviye ve iç kalibrasyon','10,00 mg referans standart tart'],takip:{sayfa:'terazi_pilot.html',gorev:['parts','level','w10']}},
   {id:'pipet',ad:'Pipetleme',ic:'💧',sayfa:'pipet_pilot.html?ret=r2-pip',tur:'dis',
    gorev:'Pipetin parçalarını tanı; hacme uygun pipeti seçip 150 µL su, 200 µL kan (ters pipetleme) ve 5 µL ara stok aktar. (DCM aktarımı isteğe bağlı.)',
    olcut:['Parçaları tanı','150 µL su aktar','200 µL kan aktar','5 µL ara stok aktar'],takip:{sayfa:'pipet_pilot.html',gorev:['parts','su','kan','stok']}},
   {id:'hazirlama',ad:'Stok, kalibratör ve vial hazırlama',ic:'🧪',sayfa:'ornek_hazirlama.html',tur:'dis',oto:'prep',
    gorev:'Hesap planını doldur; MeOH/EtOH/n-PrOH ana stokları (10 g/L), ara stok (2 g/L) ve iç standardı (2 g/L) hazırla. Blank, 9 kalibratör, QC 0,25 ve numuneden oluşan 12 HS vialini SOP’a göre hazırla ve gönder.',
    olcut:['Hesap planı doğru','Her vialde 70 µL iç standart, toplam 2000 µL','Vialler kapatıldı ve crimp yapıldı']},
   {id:'vorteks',ad:'Vorteks',ic:'🌀',sayfa:'vorteks_pilot.html?ret=r2-vor',tur:'dis',
    gorev:'Vorteksin parçalarını tanı; kapatılmış HS vialini TOUCH modunda karıştır. (Sıvı-sıvı ekstraksiyon ve serbest kullanım isteğe bağlı.)',
    olcut:['Parçaları tanı','HS vialini karıştır (TOUCH modu)'],takip:{sayfa:'vorteks_pilot.html',gorev:['parts','hs']}},
   {id:'kalib',ad:'Kalibrasyon hesabı',ic:'📈',sayfa:'egitim.html?m=etanol#kalib',tur:'ic',
    gorev:'HS-GC-MS’e geçmeden önce hesap mantığını öğren: alıştırma veri setinde alan oranlarını hesapla, eğriyi değerlendir, QC ve numune sonuçlarını hesapla. Aynı değerlendirmeyi sonraki adımda kendi viallerinle yapacaksın.'},
   {id:'analiz',ad:'HS-GC-MS analizi',ic:'📊',sayfa:'hsgcms_pilot.html?ret=r1-hsgc',tur:'dis',
    gorev:'Cihazı tanı, hazırladığın vialleri al ve karusele yükle, ChemStation’da sekansı kur ve çalıştır. ALKOL2.M ile verileri değerlendir ve numune raporunu al.',
    olcut:['Sekans doğru sırada (blank → kalibratörler → QC → numune)','Kalibrasyon R² ≥ 0,995','QC nominal değerin ±%15’i içinde','Numune raporu alındı'],takip:{sayfa:'hsgcms_pilot.html',gorev:['report']}},
   {id:'final',ad:'Final testi ve eğitim raporu',ic:'🎓',sayfa:'egitim.html?m=etanol#final',tur:'ic',
    gorev:'12 soruluk final testini çöz (geçme notu %70) ve eğitim raporunu yazdır.'}
  ]},
 spe:{id:'spe',ad:'Atık suda SPE',ic:'🚰',renk:'#4EA3FF',sure:'≈ 2–3 saat',seviye:'Orta',durum:'yakinda',
  ozet:'Atık su örneğinde ilaç ve uyuşturucu kalıntıları için Oasis HLB katı faz ekstraksiyonu: CEREX 48 basınçlı manifold, kartuş şartlandırma, yükleme, yıkama, kurutma, elüsyon ve sapma kaydı.',
  adimlar:[{ad:'Ön bilgi ve ön test'},{ad:'KKD ve laboratuvar'},{ad:'Örnek ön işlem (süzme, pH)'},{ad:'İç standart ve pipetleme'},{ad:'SPE: şartlandırma → yükleme → yıkama → elüsyon',sayfa:'spe_pilot.html'},{ad:'Uçurma ve yeniden çözme'},{ad:'Geri kazanım hesabı'},{ad:'Final testi ve eğitim raporu'}]},
 icpms:{id:'icpms',ad:'Saçta toksik element (ICP-MS)',ic:'💇',renk:'#C58CFF',sure:'≈ 3 saat',seviye:'Orta–ileri',durum:'yakinda',
  ozet:'Saç örneğinde arsenik, kurşun, kadmiyum, cıva ve talyum tayini: yıkama ve kurutma, tartım, mikrodalga asit yakma, seyreltme ve ICP-MS ölçümü (Oda 3 İnorganik).',
  adimlar:[{ad:'Ön bilgi ve ön test'},{ad:'KKD ve laboratuvar (asitlerle çalışma)'},{ad:'Saç yıkama, kurutma ve kesme'},{ad:'Tartım'},{ad:'Mikrodalga asit yakma'},{ad:'Seyreltme ve iç standart'},{ad:'ICP-MS ölçümü ve kalibrasyon'},{ad:'Final testi ve eğitim raporu'}]}
};

/* ---------- durum ---------- */
function oku(){try{return JSON.parse(localStorage.getItem(LS)||'{}')||{}}catch(e){return {}}}
function yaz(s){try{localStorage.setItem(LS,JSON.stringify(s))}catch(e){}}
function md(s,m){s.mod=s.mod||{};if(!s.mod[m])s.mod[m]={bas:Date.now(),adim:{}};return s.mod[m]}
function basla(m){var s=oku();s.aktif=m;md(s,m);yaz(s)}
function cik(){var s=oku();s.aktif=null;yaz(s)}
function sifirla(m){var s=oku();if(s.mod)delete s.mod[m];if(s.aktif===m)s.aktif=null;yaz(s)}
function tamamla(m,id,veri){var s=oku(),d=md(s,m);var o=d.adim[id]||{};o.t=o.t||Date.now();o.son=Date.now();if(veri)for(var k in veri)o[k]=veri[k];d.adim[id]=o;yaz(s);otoKontrol();ciz();return o}
function geriAl(m,id){var s=oku(),d=md(s,m);delete d.adim[id];yaz(s);ciz()}
function bitti(m,id){var s=oku();return !!(s.mod&&s.mod[m]&&s.mod[m].adim[id])}
function ilerleme(m){var M=MOD[m],s=oku(),d=s.mod&&s.mod[m];if(!M||!d)return {n:0,top:M?M.adimlar.length:0,yuzde:0,siradaki:M&&M.adimlar[0]};
 var n=0,sir=null;M.adimlar.forEach(function(a){if(d.adim[a.id])n++;else if(!sir)sir=a});
 return {n:n,top:M.adimlar.length,yuzde:Math.round(100*n/M.adimlar.length),siradaki:sir}}
/* otomatik algılama: ornek_hazirlama.html viallerini kaydettiyse adım tamam */
function otoKontrol(){var s=oku();if(!s.mod)return;for(var m in s.mod){var M=MOD[m];if(!M)continue;var d=s.mod[m];
  M.adimlar.forEach(function(a){if(a.oto==='prep'&&!d.adim[a.id]){try{var p=JSON.parse(localStorage.getItem('toksilab_prep_v1')||'null');if(p&&p.t>d.bas){d.adim[a.id]={t:p.t,son:p.t,oto:1};yaz(s)}}catch(e){}}})}}

/* cihaz sayfasının kendi görev durumunu okur (salt okunur); gerekli görevler bitince adımı işaretler */
function gorevDurumu(){try{if(typeof window.TL_GOREV==='function')return window.TL_GOREV()||null;
  /* hsgcms_pilot.html klasik betik: global S.tasks */
  if(typeof S!=='undefined'&&S&&S.tasks)return S.tasks}catch(e){}return null}
function takipEt(){var s=oku(),m=s.aktif,M=MOD[m];if(!M||!s.mod||!s.mod[m])return;var d=gorevDurumu();if(!d)return;
 M.adimlar.forEach(function(a){if(!a.takip||a.takip.sayfa!==BU||s.mod[m].adim[a.id])return;
  if(a.takip.gorev.every(function(g){return !!d[g]})){tamamla(m,a.id,{oto:1});toast('✓ '+a.ad+' tamamlandı · sıradaki adıma geçebilirsin')}})}
/* ---------- sayfa eşleme ---------- */
function dosya(u){return (u||'').split('#')[0].split('?')[0].split('/').pop()||'index.html'}
var BU=dosya(location.pathname);
function sayfaAdimlari(m){var M=MOD[m];if(!M)return [];return M.adimlar.filter(function(a){return dosya(a.sayfa)===BU||(a.ek||[]).indexOf(BU)>=0})}

/* ---------- çubuk ---------- */
var CSS='#tle{position:fixed;z-index:2147483000;top:8px;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:8px;max-width:calc(100vw - 24px);height:36px;padding:0 6px 0 12px;border-radius:999px;background:rgba(14,21,24,.94);color:#EAF2F3;border:1px solid rgba(43,217,192,.55);box-shadow:0 8px 24px rgba(0,0,0,.35);font:600 13px/1 "Source Sans 3",system-ui,sans-serif;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}'+
'#tle *{box-sizing:border-box}#tle b{font-weight:700}#tle .tm{font:600 10px "IBM Plex Mono",ui-monospace,monospace;letter-spacing:.08em;color:#7CF2D8;white-space:nowrap}'+
'#tle .ta{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:220px}#tle .tb{width:74px;height:6px;border-radius:9px;background:#2C3B42;overflow:hidden;flex:none}#tle .tb i{display:block;height:100%;background:linear-gradient(90deg,#2BD9C0,#7CF2D8)}'+
'#tle .tp{font:600 11px "IBM Plex Mono",ui-monospace,monospace;color:#9BB0B6}#tle button,#tle a.tl{flex:none;border:0;border-radius:999px;height:26px;padding:0 11px;font:700 12.5px "Source Sans 3",system-ui,sans-serif;cursor:pointer;color:#EAF2F3;background:#25333A;text-decoration:none;display:inline-flex;align-items:center;gap:4px;white-space:nowrap}'+
'#tle button:hover,#tle a.tl:hover{background:#30434B}#tle .ok{background:linear-gradient(90deg,#2BD9C0,#7CF2D8);color:#062126}#tle .ok.on{background:#1E4D43;color:#7CF2D8}#tle .ik{width:26px;padding:0;justify-content:center}'+
'#tle.kucuk{padding:0 4px 0 10px;gap:6px}#tle.kucuk .gz{display:none}'+
'#tlm{position:fixed;z-index:2147483001;top:50px;left:50%;transform:translateX(-50%);width:min(380px,calc(100vw - 24px));background:rgba(20,30,34,.98);color:#EAF2F3;border:1px solid #34454D;border-radius:14px;padding:10px;box-shadow:0 16px 40px rgba(0,0,0,.45);font:14px/1.35 "Source Sans 3",system-ui,sans-serif;display:grid;gap:4px}'+
'#tlm[hidden]{display:none}#tlm h4{margin:2px 4px 6px;font:700 17px "Barlow Condensed",system-ui,sans-serif;letter-spacing:.01em}#tlm a{display:grid;grid-template-columns:24px 1fr auto;gap:8px;align-items:center;padding:6px 8px;border-radius:9px;color:#EAF2F3;text-decoration:none}'+
'#tlm a:hover{background:#25333A}#tlm a.cur{background:#1C3A3A}#tlm a i{font-style:normal;width:22px;height:22px;border-radius:50%;display:grid;place-items:center;background:#33444C;font:700 11px "IBM Plex Mono",monospace}#tlm a.ok i{background:#2DBE5B;color:#062126}'+
'#tlm a small{color:#9BB0B6;font-size:11.5px}#tlm .alt{display:flex;gap:6px;margin-top:6px;border-top:1px solid #34454D;padding-top:8px}#tlm .alt a{display:inline-flex;flex:1;justify-content:center;background:#25333A;font-weight:700;font-size:13px}'+
'#tlt{position:fixed;z-index:2147483002;top:52px;left:50%;transform:translateX(-50%);background:#0E2B27;color:#7CF2D8;border:1px solid #2BD9C0;border-radius:10px;padding:7px 12px;font:700 13px "Source Sans 3",system-ui,sans-serif;box-shadow:0 8px 20px rgba(0,0,0,.35);transition:opacity .4s}'+
'@media (max-width:760px){#tle .ta{max-width:120px}#tle .tb,#tle .tp,#tle .sk{display:none}}@media print{#tle,#tlm,#tlt{display:none!important}}';

/* sayfa başına konum: mevcut başlık ve panellerin üstüne binmesin */
var KONUM={'terazi_pilot.html':{top:'62px'},'pipet_pilot.html':{top:'62px'},'vorteks_pilot.html':{top:'62px'},
 'hsgcms_pilot.html':{top:'6px',left:'calc(50% + 120px)'},'lab_giris.html':{top:'56px'},
 'ornek_hazirlama.html':{top:'auto',bottom:'12px'}};
var EL=null,MENU=null;
function $(t,a,h){var e=document.createElement(t);if(a)for(var k in a)e.setAttribute(k,a[k]);if(h!=null)e.innerHTML=h;return e}
function kucukMu(){try{return localStorage.getItem('toksilab_egitim_kucuk')==='1'}catch(e){return false}}
function toast(t){var x=document.getElementById('tlt');if(x)x.remove();x=$('div',{id:'tlt'},t);document.body.appendChild(x);setTimeout(function(){x.style.opacity='0'},1800);setTimeout(function(){x.remove()},2300)}

function ciz(){
 if(window.TLE_CUBUK_YOK)return;
 var s=oku(),m=s.aktif,M=MOD[m];
 if(!M){kaldir();return}
 var bura=sayfaAdimlari(m);if(!bura.length){kaldir();return}
 var P=ilerleme(m),sir=P.siradaki;
 /* bu sayfadaki adım: sıradaki adım buradaysa o, değilse bu sayfadaki ilk adım */
 var a=bura.filter(function(x){return sir&&x.id===sir.id})[0]||bura.filter(function(x){return !bitti(m,x.id)})[0]||bura[0];
 var i=M.adimlar.indexOf(a),ok=bitti(m,a.id),sonraki=M.adimlar[i+1];
 if(!EL){var st=$('style',{id:'tle-css'},CSS);document.head.appendChild(st);EL=$('div',{id:'tle',role:'region','aria-label':'Eğitim çubuğu'});var K=KONUM[BU];if(K&&innerWidth>900)for(var p in K)EL.style[p]=K[p];document.body.appendChild(EL)}
 var k=kucukMu();EL.className=k?'kucuk':'';
 var h='<span class="tm">🎓 '+(k?'':'EĞİTİM · ')+(i+1)+'/'+P.top+'</span>';
 if(!k){
  h+='<span class="ta gz" title="'+M.ad+'"><b>'+a.ad+'</b></span>'+
   '<span class="tb gz" title="İlerleme %'+P.yuzde+' ('+P.n+'/'+P.top+' adım)"><i style="width:'+P.yuzde+'%"></i></span>'+
   '<button class="ok gz'+(ok?' on':'')+'" data-x="ok" title="'+(ok?'Tamamlandı (geri almak için tıkla)':'Bu adımı bitirdiysen işaretle')+'">'+(ok?'✓ Tamamlandı':'✓ Adımı tamamla')+'</button>';
  if(sonraki)h+='<a class="tl gz sk" href="'+sonraki.sayfa+'" title="Sonraki adım: '+sonraki.ad+'">Sonraki ›</a>';
  else h+='<a class="tl gz sk" href="egitim.html?m='+m+'#final">Eğitim raporu ›</a>';
 }
 h+='<button class="ik" data-x="menu" title="Adımlar">☰</button><button class="ik" data-x="kucult" title="'+(k?'Genişlet':'Küçült')+'">'+(k?'▸':'–')+'</button>';
 EL.innerHTML=h;gorunurluk();
 EL.onclick=function(e){var b=e.target.closest('[data-x]');if(!b)return;var x=b.getAttribute('data-x');
  if(x==='ok'){if(bitti(m,a.id)){geriAl(m,a.id);toast('Adım işareti kaldırıldı')}else{tamamla(m,a.id,{elle:1});toast('✓ '+a.ad+' tamamlandı')}}
  else if(x==='menu'){menu(m,a)}
  else if(x==='kucult'){try{localStorage.setItem('toksilab_egitim_kucuk',k?'0':'1')}catch(_){};ciz()}};
}
function menu(m,a){
 if(MENU&&!MENU.hidden){MENU.hidden=true;return}
 var M=MOD[m],P=ilerleme(m);
 if(!MENU){MENU=$('div',{id:'tlm'});document.body.appendChild(MENU);document.addEventListener('pointerdown',function(e){if(MENU&&!MENU.hidden&&!MENU.contains(e.target)&&!(EL&&EL.contains(e.target)))MENU.hidden=true},true)}
 var h='<h4>'+M.ic+' '+M.ad+' · %'+P.yuzde+'</h4>';
 M.adimlar.forEach(function(x,j){var ok=bitti(m,x.id);h+='<a href="'+x.sayfa+'" class="'+(ok?'ok ':'')+(x.id===a.id?'cur':'')+'"><i>'+(ok?'✓':j+1)+'</i><span>'+x.ad+'</span><small>'+(x.tur==='ic'?'eğitim sayfası':dosya(x.sayfa).replace('.html',''))+'</small></a>'});
 h+='<div class="alt"><a href="egitim.html?m='+m+'">Modül sayfası</a><a href="egitimler.html">Eğitimler</a><a href="#" data-cik>Eğitimi duraklat</a></div>';
 MENU.innerHTML=h;MENU.hidden=false;var r=EL.getBoundingClientRect();MENU.style.left=Math.min(innerWidth-12-Math.min(380,innerWidth-24),Math.max(12,r.left+r.width/2-190))+'px';MENU.style.transform='none';if(r.top>innerHeight/2){MENU.style.top='auto';MENU.style.bottom=(innerHeight-r.top+8)+'px'}else{MENU.style.bottom='auto';MENU.style.top=(r.bottom+8)+'px'}
 MENU.querySelector('[data-cik]').onclick=function(e){e.preventDefault();cik();MENU.hidden=true;toast('Eğitim duraklatıldı · Eğitimler sayfasından devam edebilirsin')};
}
function gorunur(){var i=document.getElementById('intro');return !(BU==='lab_giris.html'&&i&&!i.classList.contains('out'))}
function gorunurluk(){if(EL)EL.style.display=gorunur()?'':'none';if(MENU&&!gorunur())MENU.hidden=true}
function kaldir(){if(EL){EL.remove();EL=null}if(MENU){MENU.remove();MENU=null}}

/* eğitim sayfasından gelen bağlantılar ?egitim=etanol ile etkinleştirir */
try{var q=new URLSearchParams(location.search).get('egitim');if(q&&MOD[q]&&MOD[q].durum==='aktif')basla(q)}catch(e){}
otoKontrol();
window.addEventListener('storage',function(e){if(e.key===LS||e.key==='toksilab_prep_v1'){otoKontrol();ciz()}});
window.addEventListener('focus',function(){otoKontrol();ciz()});

window.TLE={MOD:MOD,oku:oku,yaz:yaz,basla:basla,cik:cik,sifirla:sifirla,tamamla:tamamla,geriAl:geriAl,bitti:bitti,ilerleme:ilerleme,ciz:ciz,otoKontrol:otoKontrol,
 /* ileride cihaz sayfaları görev bitince çağırabilir: TLE.olay('tartim') */
 olay:function(id,veri){var s=oku();if(s.aktif&&MOD[s.aktif]&&MOD[s.aktif].adimlar.some(function(a){return a.id===id}))tamamla(s.aktif,id,veri)}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ciz);else ciz();
setInterval(takipEt,1500);
(function(){var i=document.getElementById('intro');if(BU==='lab_giris.html'&&i&&window.MutationObserver)new MutationObserver(gorunurluk).observe(i,{attributes:true,attributeFilter:['class']})})();
})();
