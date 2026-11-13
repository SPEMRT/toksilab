/* MY ToksiLab · Rehberli dersler: Headspace örnekleyici (Agilent 7694E)
   hsgcms_pilot.html?ders=hs        → bölüm listesi
   hsgcms_pilot.html?ders=hstani    → Cihazı tanıma
   hsgcms_pilot.html?ders=hsyukle   → Numune yükleme
   hsgcms_pilot.html?ders=hstus     → Tuş takımı parametreleri
   hsgcms_pilot.html?ders=hsbaslat  → Analizi başlatma
   hsgcms_pilot.html?ders=da        → Veri analizi bölüm listesi (datani · dakrom · dasonuc)
   hsgcms_pilot.html?ders=gc        → GC-MS bölüm listesi (gctani · gctus · pctani: Yazılımı tanıma ve menüler · pcsekans: Sekans)
   Sayfanın kendi fotoğraflarını, tuş takımını ve yöntem değerlerini kullanır. ?ders= yoksa hiçbir şey yapmaz. */
(function(){
'use strict';
var PILOT=!!window.__DERS_PILOT,D=null;
try{D=PILOT?(sessionStorage.getItem('toksilab_ders_git')||'hs'):new URLSearchParams(location.search).get('ders')}catch(e){if(PILOT)D='hs'}
if(!D)return;
var BASE=/github\.io$/.test(location.hostname)?'':'https://spemrt.github.io/toksilab/';
var LS='toksilab_ders_v1';
var HS,S,A,P,G,SON=null,i=0,gecti=false,uyari='',puan=0,sn=0,cevap=null,kaydir=false,hataM='';
function spd(v){if(A.spd)A.spd(v)}
function ac(id){if(PILOT){try{sessionStorage.setItem('toksilab_ders_git',id)}catch(e){}location.reload()}else location.href=location.pathname+'?ders='+id}

/* ---------- yardımcılar ---------- */
var Z=function(n){return function(h){return h.mode==='zone'&&h.idx===n&&h.buf===''}};
var E=function(n){return function(h){return h.mode==='event'&&h.idx===n}};
var V=function(n){return function(h){return h.mode==='vial'&&h.idx===n}};
/* bir parametreye değer yazdırırken sıradaki tuşu gösterir */
var yaz=function(mode,key,idx,deger){return function(h){
  if(h.mode!==mode)return [key];
  if(h.idx!==idx)return [key,'down'];
  if(h.buf===deger)return ['enter'];
  if(deger.indexOf(h.buf)!==0)return ['clear'];
  return ['d'+deger.charAt(h.buf.length)]}};
var YUK={4:'BLANK',5:'QC-0,25',6:'NUMUNE-01'};
function sifirla(){
 HS.mode='idle';HS.idx=0;HS.buf='';HS.run=null;HS.msg=null;S.gc.run=false;S.gc.rt=0;S.lost=0;
 HS.z[0][1]=80;HS.z[1][1]=120;HS.z[2][1]=120;HS.za=[80,120,120];S.gc.ovenA=S.gc.ovenSet;
 [11,4,.2,.2,.05,.5].forEach(function(v,k){HS.e[k][1]=v});HS.v[0][1]=1;HS.v[1][1]=2;HS.v[2][1]=2;
 Object.keys(S.slots).forEach(function(k){delete S.slots[k]});S.hand=null;S.lid=false;
 A.PLAN.forEach(function(p){p.where=null;p.ready=false});
 G.sec='status';G.cur=0;G.top=0;G.buf='';G.p.oven[0][1]=35;G.ovenSet=35;G.p.finlet[0][1]='Split';spd(120)}
function vialHazir(){A.PLAN.forEach(function(p){if(p.id==='BLANK'||p.id==='QC-0,25'||p.id==='NUMUNE-01')p.ready=true})}
function vialYukle(){vialHazir();Object.keys(YUK).forEach(function(n){S.slots[n]=YUK[n];A.PLAN.forEach(function(p){if(p.id===YUK[n])p.where=+n})})}
var yuvaHata=function(){var m='';Object.keys(S.slots).forEach(function(n){if(YUK[n]!==S.slots[n])m='<b>'+S.slots[n]+'</b> yanlış yuvada ('+n+'). Viale dokunarak geri alın ve doğru yuvaya koyun.'});return m};
var hazirHata=function(h){return h.msg==='NOT READY'||h.msg==='GC NOT READY'?'Cihaz henüz hazır değil. Birkaç saniye bekleyip yeniden deneyin.':''};
var menuAcik=function(m,bar){var e=document.querySelector((bar||'#icMB')+'>div[data-m="'+m+'"]');return !!e&&e.classList.contains('open')};
/* menü: kapalıyken menü adını, açıkken (komut verilmişse) o komutu etkin kılar */
var MENU=function(bar,m,komut){var d=document.querySelector(bar+'>div[data-m="'+m+'"]');if(!d)return [];if(!komut||!d.classList.contains('open'))return [d];
 var r=[];d.querySelectorAll('.dd>div').forEach(function(x){if(x.textContent===komut)r.push(x)});return r};
var DOSYA=function(ad){var r=null;A.DATA.forEach(function(f){f.files.forEach(function(x){if(x.name===ad)r=x})});return r};
var QRES=function(k){var F=A.DA.F,q=F&&F.quant;if(!q)return null;var r=null;q.res.forEach(function(x){if(x.c.name===k)r=x});return r};
var ETOH=function(){var r=QRES('etanol');return r&&!r.miss?r:null};
var METOH=function(){var t=document.querySelector('#desk .dlg .rep'),m=t&&t.textContent.match(/metanol.*$/m);if(!m)return '';var x=m[0];return /N\.D\./.test(x)?'tespit edilmedi (N.D.)':/<LOQ/.test(x)?'pik var ama ölçüm sınırının altında (&lt;LOQ); sayısal değer verilmez':/N\.A\./.test(x)?'uygun pik bulunamadı (N.A.)':'sayısal sonuç raporda'};
/* veri dosyası açma adımı: sol tıkla seç, sağ tıkla Load Data File */
var YUKLE=function(bolum,ad,b,html){var q='#daTree [data-f="ORNEK_SET|'+ad+'"]';return {bolum:bolum,ask:'Soldaki listede <b>'+ad+'</b> dosyasına <b>sağ tıklayın</b> ve açılan menüden <b>Load Data File</b> komutunu seçin.',
 izin:function(){return document.querySelector('#desk .ctxm')?['#desk .ctxm [data-i="0"]']:[q]},ok:function(){return !!A.DA.F&&A.DA.F.name===ad&&!document.querySelector('#desk .ctxm')},
 hata:function(){return A.DA.open['d:ORNEK_SET']?'':'ORNEK_SET klasörü kapalı.'},gir:function(){A.DA.open['d:ORNEK_SET']=true;if(A.daTree)A.daTree()},b:b,html:html}};
var dlgAcik=function(t){var r=false;document.querySelectorAll('#desk .dlg .dt b').forEach(function(b){if(b.textContent.indexOf(t)===0)r=true});return r};
var fazBekle=function(ph,vial){return function(h){return !!h.run&&h.run.ph===ph&&(!vial||h.run.vial===vial)}};

/* ---------- dersler ----------
   adım alanları → ask: yapılacak iş · ok(h): tamamlandı mı · keys(h): yanacak tuşlar · hot: yanacak fotoğraf bölgesi (kes: dokunuş yalnızca derse sayılır)
   sec(): yanacak diğer öğeler · view: izinli görünümler · gir(): adıma girerken · oto: açıklamasız, kendiliğinden ilerler · b/ne/neden/yanlis ya da html: açıklama */
var DERS={
hstani:{ad:'Cihazı tanıma',ic:'🔍',ozet:'Headspace örnekleyicinin parçaları: fırın, karusel, tuş takımı, transfer hattı, gaz.',baslik:'HEADSPACE · CİHAZI TANIMA',view:['main'],yukGizle:1,
 adim:[
 {bolum:'Giriş',b:'Üç cihaz, tek sistem',
  html:'<p>Fotoğraftaki sistem üç cihazdan oluşur:</p><ul><li><b>Solda: headspace örnekleyici (7694E).</b> Viali ısıtır, üstündeki gazdan örnek alır.</li><li><b>Sağda: gaz kromatografi (6890N).</b> Bileşikleri birbirinden ayırır.</li><li><b>Ortada: kütle dedektörü (5975B).</b> Ayrılan bileşikleri tanır ve ölçer.</li></ul><p>Bu derste yalnızca soldaki cihazı, headspace örnekleyiciyi tanıyacaksınız.</p>'},
 {bolum:'Dış görünüm',ask:'Headspace örnekleyicinin <b>fırın kapağına</b> dokunun.',hot:'HS fırın kapağı',kes:1,
  b:'Fırın ve kapak',ne:'Kapağın altında ısıtılan bir fırın ve 12 yuvalı döner tabla (karusel) vardır. Vialler buraya yerleştirilir.',
  neden:'Fırın, vialleri yöntemdeki sıcaklıkta (80 °C) tutar. Böylece etanol sıvıdan gaz boşluğuna geçer.',yanlis:'Kapak açıkken cihaz çalışmaz; çalışırken de kapak açılmaz, çünkü vialler sıcak ve basınçlıdır.',son:'DİKKAT'},
 {bolum:'Dış görünüm',ask:'Şimdi <b>tuş takımına</b> dokunun.',hot:'HS tuş takımı',kes:1,
  b:'Ekran ve tuş takımı',ne:'Cihazın bütün ayarları buradan yapılır: sıcaklıklar, süreler, hangi viallerin analiz edileceği.',
  neden:'Ekran her parametrenin gerçek (Actual) ve ayarlanan (Setpoint) değerini gösterir. Altındaki iki ışık cihazın durumunu bildirir: Not Ready ve Run.',yanlis:'Tuş takımını “Tuş takımı parametreleri” bölümünde tek tek kullanacaksınız.',son:'SONRA'},
 {bolum:'Dış görünüm',ask:'Tezgâhtaki <b>headspace viallerine</b> dokunun.',hot:'HS vialleri',kes:1,
  b:'Headspace vialleri',ne:'20 mL’lik cam şişelerdir. Alüminyum kapak ve altındaki septum (lastik conta) viali gaz sızdırmaz biçimde kapatır.',
  neden:'Örnek vialin yalnızca alt kısmını doldurur. Üstte kalan boşluk, etanolün toplanacağı gaz fazıdır: “headspace” adı buradan gelir.',yanlis:'Kapak iyi sıkılmamışsa (crimp) gaz kaçar ve sonuç düşük çıkar.',son:'DİKKAT'},
 {bolum:'Dış görünüm',ask:'Cihazdan çıkan gri hortuma, <b>transfer hattına</b> dokunun.',hot:'HS transfer hattı',kes:1,
  b:'Transfer hattı',ne:'Vialden alınan gaz örneğini GC’nin girişine (inlet) taşıyan ısıtılmış hattır.',
  neden:'120 °C’de tutulur. Örnek yol boyunca soğursa yoğunlaşır ve GC’ye ulaşmaz.',yanlis:'Hat sıcaktır; çıplak elle tutulmaz, bükülmez.',son:'DİKKAT'},
 {bolum:'Dış görünüm',ask:'Duvardaki <b>helyum regülatörlerine</b> dokunun.',hot:'Helyum regülatörleri',kes:1,
  b:'Helyum (taşıyıcı gaz)',ne:'Gaz Tüp Odası’ndan gelen helyumun basıncı burada ayarlanır. Soldaki regülatör HS-GC-MS’i besler.',
  neden:'Helyum iki iş yapar: viali basınçlandırır ve örneği transfer hattından GC’ye taşır.',yanlis:'Gaz biterse ya da basınç düşerse cihaz örnek alamaz. Analizden önce manometreye bakılır.',son:'DİKKAT'},
 {bolum:'İç görünüm',ask:'Şimdi içine bakalım: <b>fırın kapağına</b> yeniden dokunarak kapağı açın.',hot:'HS fırın kapağı',view:['main','hslid'],ok:function(){return S.view==='hslid'},
  b:'Karusel',html:'<p>Yuvarlak tabla <b>karusel</b>dir. 12 yuvası vardır ve her yuvanın yanında numarası yazar. Cihaz vialleri bu numaralara göre sırayla işler.</p><p>Analiz sırasında karusel döner; sırası gelen vial iğnenin altına gelir, iğne septumu delerek gaz örneğini alır.</p>'},
 {bolum:'İç görünüm',ask:'<b>Kapak dayama koluna</b> dokunun.',hot:'Kapak dayama kolu',kes:1,view:['hslid'],
  b:'Kapak dayama kolu',ne:'Fırın kapağını açık tutan metal koldur.',neden:'Vialleri yerleştirirken iki elinizin de serbest kalmasını sağlar.',yanlis:'Kapak tam kapatılmadan analiz başlatılamaz; ekranda OVEN LID OPEN yazar.',son:'DİKKAT'},
 {bolum:'İç görünüm',ask:'Karuselin yanındaki <b>sıcak yüzey uyarısına</b> dokunun.',hot:'Sıcak yüzey',kes:1,view:['hslid'],
  b:'Sıcak yüzey',ne:'Fırın 80 °C’dedir; karusel ve çevresindeki metal yüzeyler sıcaktır.',neden:'Bu işaret yanık tehlikesini gösterir.',yanlis:'Vial yerleştirirken eldiven kullanın, metal yüzeylere dokunmayın.',son:'DİKKAT'},
 {bolum:'İç görünüm',ask:'Sol üstteki <b>‹ Kapağı kapat</b> düğmesiyle kapağı kapatın.',sec:function(){return ['#st .back']},geri:1,view:['hslid','main'],ok:function(){return S.view==='main'},
  b:'Özet',html:'<p>Headspace örnekleyicinin yolu şöyledir:</p><ul><li>Vial karuselde <b>ısıtılır</b>.</li><li>Helyum viali <b>basınçlandırır</b>.</li><li>Gaz örneği <b>loop</b> adlı halkaya dolar.</li><li><b>Transfer hattı</b> örneği GC’ye taşır.</li></ul>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['“Headspace” neyi ifade eder?',['Vialdeki sıvının üstünde kalan gaz boşluğunu','Cihazın üst kapağını','Kolonun giriş ucunu'],0,'Cihaz sıvıdan değil, bu gaz boşluğundan örnek alır.'],
 ['Helyumun headspace örnekleyicideki görevi nedir?',['Vialleri soğutmak','Viali basınçlandırmak ve örneği GC’ye taşımak','Kanı seyreltmek'],1,'Taşıyıcı gaz hem basıncı sağlar hem örneği taşır.'],
 ['Cihaz çalışırken fırın kapağı neden açılmaz?',['Ekran kapanır','Karusel durmaz','Vialler sıcak ve basınçlıdır'],2,'Sıcak ve basınçlı vial yaralanmaya yol açabilir.']]},

hsyukle:{ad:'Numune yükleme',ic:'🧪',ozet:'Vialleri karusele doğru sırayla yerleştirme; FIRST VIAL ve LAST VIAL ayarı.',baslik:'HEADSPACE · NUMUNE YÜKLEME',view:['main'],kur:vialHazir,
 adim:[
 {bolum:'Hazırlık',b:'Yüklemeden önce',
  html:'<p>Bu derste üç vial yükleyeceksiniz: <b>BLANK</b> (boş kan), <b>QC</b> (kontrol) ve <b>NUMUNE</b>. Gerçek analizde bunların arasına kalibratörler de girer.</p><p>Her vialde şunlara bakın:</p><ul><li>Kapak sıkı mı? Elle çevirdiğinizde dönmemelidir.</li><li>Etiket okunuyor mu?</li><li>Camda çatlak var mı?</li></ul>'},
 {bolum:'Yükleme',ask:'Headspace <b>fırın kapağına</b> dokunarak kapağı açın.',hot:'HS fırın kapağı',view:['main','hslid'],ok:function(){return S.view==='hslid'},
  b:'Kapak açık',html:'<p>Kapak yalnızca cihaz çalışmıyorken açılır. Fırın 80 °C’dedir: eldivenle çalışın.</p><p>Fotoğrafta karuselin <b>4–10</b> numaralı yuvaları görünüyor. Sağdaki şema karuselin tamamını üstten gösterir.</p>'},
 {bolum:'Yükleme',ask:'Alttaki listeden <b>BLANK</b> vialine dokunun.',oto:1,view:['hslid'],sec:function(){return ['#chips .chip[data-id="BLANK"]']},ok:function(){return S.hand==='BLANK'||S.slots[4]==='BLANK'}},
 {bolum:'Yükleme',ask:'Viali <b>4</b> numaralı yuvaya koyun.',view:['hslid'],hot:'Yuva 4',sec:function(){return S.hand==='BLANK'?['#car g[data-n="4"]']:['#chips .chip[data-id="BLANK"]']},ok:function(){return S.slots[4]==='BLANK'},hata:yuvaHata,
  b:'Yuva numarası',html:'<p>Vialin konduğu <b>yuva numarası</b> önemlidir: cihaz vialleri adlarıyla değil, yuva numaralarıyla tanır.</p><p>Bu numara, bilgisayardaki sekans tablosunun <b>Vial</b> sütununa da yazılır. İkisi uyuşmazsa sonuçlar yanlış örnek adıyla kaydedilir.</p>'},
 {bolum:'Yükleme',ask:'Şimdi <b>QC-0,25</b> vialini <b>5</b>, <b>NUMUNE-01</b> vialini <b>6</b> numaralı yuvaya koyun.',view:['hslid'],hata:yuvaHata,
  sec:function(){var q=S.slots[5]==='QC-0,25',id=q?'NUMUNE-01':'QC-0,25',n=q?6:5;return S.hand===id?['#car g[data-n="'+n+'"]','#st .hs[data-t="Yuva '+n+'"]']:['#chips .chip[data-id="'+id+'"]']},
  ok:function(){return S.slots[5]==='QC-0,25'&&S.slots[6]==='NUMUNE-01'},
  b:'Sıranın anlamı',html:'<ul><li><b>BLANK</b> önce gelir: sistemin temiz olduğunu gösterir.</li><li><b>QC</b> ikinci gelir: derişimi bilinen kontrol örneğidir, cihazın doğru ölçtüğünü kanıtlar.</li><li><b>NUMUNE</b> bunlardan sonra analiz edilir.</li></ul><p>Viallerin arasında <b>boş yuva bırakılmaz</b>; cihaz boş yuvaya gelince durur.</p>'},
 {bolum:'Yükleme',ask:'Sol üstteki <b>‹ Kapağı kapat</b> düğmesiyle kapağı kapatın.',sec:function(){return ['#st .back']},geri:1,view:['hslid','main'],ok:function(){return S.view==='main'},
  b:'Kapak kapalı',html:'<p>Kapak açık unutulursa cihaz başlamaz ve ekranda <b>OVEN LID OPEN</b> yazar. Fotoğrafta cihazın üstünde “3 vial yüklü” notu görünüyor.</p><p>Şimdi cihaza hangi yuvaların dolu olduğunu bildireceksiniz.</p>'},
 {bolum:'Vial aralığı',ask:'<b>Tuş takımına</b> dokunun.',oto:1,hot:'HS tuş takımı',view:['main','hskey'],ok:function(){return S.view==='hskey'}},
 {bolum:'Vial aralığı',ask:'İlk viali bildirin: <b>Vial Parameters</b> → <b>4</b> → <b>Enter</b>.',view:['hskey'],keys:yaz('vial','vial',0,'4'),ok:function(h){return h.v[0][1]===4},
  b:'FIRST VIAL = 4',html:'<p>Cihaz analize 4 numaralı yuvadan başlayacak. FIRST VIAL her zaman 1 olmak zorunda değildir; ilk vialinizi hangi yuvaya koyduysanız o numara girilir.</p>'},
 {bolum:'Vial aralığı',ask:'Son viali bildirin: <b>Vial Parameters</b> (ya da <b>▼</b>) → <b>6</b> → <b>Enter</b>.',view:['hskey'],keys:yaz('vial','vial',1,'6'),ok:function(h){return h.v[1][1]===6},
  b:'LAST VIAL = 6',html:'<p>Cihaz artık 4, 5 ve 6 numaralı yuvaları sırayla işleyecek: BLANK → QC → NUMUNE.</p><p>Bilgisayardaki sekans tablosunda da <b>Vial</b> sütunu aynı sırayla 4, 5, 6 olmalıdır.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Cihaz vialleri neye göre tanır?',['Etiketteki ada göre','Karuseldeki yuva numarasına göre','Vialin rengine göre'],1,'Bu yüzden yuva numarası sekans tablosuyla aynı olmalıdır.'],
 ['Vialler 3, 4, 5 ve 6 numaralı yuvalarda. FIRST VIAL ve LAST VIAL ne olmalı?',['1 ve 4','3 ve 6','1 ve 6'],1,'İlk ve son dolu yuvanın numarası girilir.'],
 ['BLANK, QC ve NUMUNE hangi sırayla yüklenir?',['NUMUNE → QC → BLANK','QC → NUMUNE → BLANK','BLANK → QC → NUMUNE'],2,'Önce sistemin temiz ve doğru olduğu gösterilir, sonra numune ölçülür.']]},

hstus:{ad:'Tuş takımı parametreleri',ic:'🎛',ozet:'Sıcaklıklar, süreler ve vial parametreleri; değer değiştirme ve yöntem yükleme.',baslik:'HEADSPACE · TUŞ TAKIMI',view:['hskey'],
 adim:[
 {bolum:'Giriş',b:'Headspace örnekleyici ne yapar?',
  html:'<p>Kan örneği cihaza <b>sıvı olarak verilmez</b>. Kapalı vial ısıtılır; etanol sıvıdan, vialin üst kısmındaki gaz boşluğuna (<b>headspace</b>) geçer. Cihaz bu gazdan belirli bir hacim alıp GC’ye gönderir.</p><p>Tuş takımındaki parametreler bu işin <b>hangi sıcaklıkta</b> ve <b>ne kadar sürede</b> yapılacağını belirler. Her birine tek tek bakacağız.</p>'},
 {bolum:'Giriş',b:'Ekranı tanıyın',ekran:1,
  html:'<p>Ekranda üç bilgi vardır:</p><ul><li><b>Sol:</b> parametrenin adı</li><li><b>Actual:</b> o an ölçülen gerçek değer</li><li><b>Setpoint:</b> sizin ayarladığınız hedef değer</li></ul><p>Actual, Setpoint’e ulaşana kadar kırmızı <b>Not Ready</b> ışığı yanar ve cihaz analiz başlatmaz. Şu an ekranda <b>READY</b> yazıyor: cihaz hazır.</p>'},

 {bolum:'Sıcaklıklar',ask:'<b>Zone Temps</b> tuşuna basın.',ok:Z(0),keys:function(){return ['zone']},
  b:'VIAL · fırın sıcaklığı',deger:'80 °C',
  ne:'Vialin ısıtıldığı fırının sıcaklığıdır.',
  neden:'Vial ısındıkça etanol sıvıdan gaz boşluğuna geçer. 80 °C, yeterli sinyali verir; kanı ve vial içi basıncı da zorlamaz.',
  yanlis:'Düşük olursa sinyal zayıflar. Çok yüksek olursa su buharı ve basınç artar, septum kaçırabilir. Bütün vialler aynı sıcaklıkta ısıtılmalıdır.'},
 {bolum:'Sıcaklıklar',ask:'<b>Zone Temps</b> tuşuna bir kez daha basın (ya da <b>▼</b>).',ok:Z(1),keys:function(){return ['zone','down']},
  b:'LOOP · örnek halkası sıcaklığı',deger:'120 °C',
  ne:'Loop, vialden alınan gazın ölçüldüğü sabit hacimli halkadır.',
  neden:'Vialden (80 °C) daha sıcak tutulur. Böylece buhar loop içinde yoğunlaşmaz.',
  yanlis:'Vialden soğuk olursa buhar sıvılaşır: sonuç düşük çıkar ve bir sonraki örneğe bulaşma (taşınma) olur.'},
 {bolum:'Sıcaklıklar',ask:'<b>Zone Temps</b> tuşuna bir kez daha basın.',ok:Z(2),keys:function(){return ['zone','down']},
  b:'TR.LINE · transfer hattı sıcaklığı',deger:'120 °C',
  ne:'Loop’taki gazı GC’nin girişine (inlet) taşıyan ısıtılmış hattır.',
  neden:'Loop ile aynı ya da biraz daha yüksek sıcaklıkta tutulur; gaz yol boyunca soğumamalıdır.',
  yanlis:'Hat soğuk kalırsa örnek yolda yoğunlaşır; pikler küçülür ve kuyruklanır.'},

 {bolum:'Süreler',b:'Bir vialin çevrimi',cevrim:1,
  html:'<p>Cihaz her vial için aynı sırayı izler. Aşağıdaki şerit bu sırayı gösterir; <b>Event Times</b> tuşundaki her parametre şeridin bir bölümünün süresidir.</p><p>Süreler <b>dakika</b> cinsindendir: 0,20 dk = 12 saniye.</p>'},
 {bolum:'Süreler',ask:'<b>Event Times</b> tuşuna basın.',ok:E(0),keys:function(){return ['event']},faz:'c',
  b:'GC CYCLE TIME · GC çevrim süresi',deger:'11,0 dk',
  ne:'Art arda iki enjeksiyon arasındaki süredir.',
  neden:'GC’nin bir analizi bitirmesi ve fırının yeniden başlangıç sıcaklığına soğuması için gereken süreden uzun olmalıdır.',
  yanlis:'Kısa tutulursa GC hazır olmadan yeni örnek gelir; o örneğin verisi kaybolur.'},
 {bolum:'Süreler',ask:'<b>Event Times</b> tuşuna yeniden basın (ya da <b>▼</b>).',ok:E(1),keys:function(){return ['event','down']},faz:0,
  b:'VIAL EQ. TIME · vial dengeleme süresi',deger:'4,0 dk',
  ne:'Vialin, delinmeden önce fırında beklediği süredir.',
  neden:'Etanolün sıvı ile gaz arasında dengeye gelmesi zaman alır. Çalkalama (SHAKE) bu süreyi kısaltır.',
  yanlis:'Kısa olursa gaz fazına yeterince etanol geçmez; sonuç düşük ve tekrarlanamaz olur.'},
 {bolum:'Süreler',ask:'<b>Event Times</b> tuşuna yeniden basın.',ok:E(2),keys:function(){return ['event','down']},faz:1,
  b:'PRESSURIZ. TIME · basınçlandırma süresi',deger:'0,20 dk (12 sn)',
  ne:'İğne septumu deler ve taşıyıcı gaz vialin içine dolar.',
  neden:'Vialde oluşan basınç, bir sonraki adımda gazı loop’a itecek güçtür.',
  yanlis:'Yetersiz basınçta loop tam dolmaz; alanlar küçülür.'},
 {bolum:'Süreler',ask:'<b>Event Times</b> tuşuna yeniden basın.',ok:E(3),keys:function(){return ['event','down']},faz:2,
  b:'LOOP FILL TIME · loop doldurma süresi',deger:'0,20 dk (12 sn)',
  ne:'Çıkış valfi açılır; basınçlı gaz vialden loop’a akar ve halkayı doldurur.',
  neden:'Loop’un tamamen örnek gazıyla dolması için yeterli olmalıdır.',
  yanlis:'Çok kısa olursa loop yarım dolar; çok uzun olursa vialdeki basınç boşalır, örnek kaybedilir.'},
 {bolum:'Süreler',ask:'<b>Event Times</b> tuşuna yeniden basın.',ok:E(4),keys:function(){return ['event','down']},faz:3,
  b:'LOOP EQ. TIME · loop dengeleme süresi',deger:'0,05 dk (3 sn)',
  ne:'Valf kapanır; loop içindeki gazın basıncı ve sıcaklığı sabitlenir.',
  neden:'Her enjeksiyonda loop’ta aynı miktarda gaz bulunmasını sağlar.',
  yanlis:'Atlanırsa enjeksiyonlar arasındaki fark (tekrarlanabilirlik) kötüleşir.'},
 {bolum:'Süreler',ask:'<b>Event Times</b> tuşuna yeniden basın.',ok:E(5),keys:function(){return ['event','down']},faz:4,
  b:'INJECT TIME · enjeksiyon süresi',deger:'0,50 dk (30 sn)',
  ne:'Valf döner; taşıyıcı gaz loop’taki örneği transfer hattından GC’ye süpürür. GC analizi bu anda başlar.',
  neden:'Loop’un tamamen boşalması için yeterli olmalıdır.',
  yanlis:'Kısa olursa örneğin bir kısmı loop’ta kalır ve sonraki enjeksiyona taşınır.'},

 {bolum:'Vialler',ask:'<b>Vial Parameters</b> tuşuna basın.',ok:V(0),keys:function(){return ['vial']},
  b:'FIRST VIAL · ilk vial',deger:'yuva no',
  ne:'Analizin başlayacağı karusel yuvasının numarasıdır.',
  neden:'Cihaz vialleri FIRST VIAL’dan LAST VIAL’a kadar sırayla işler. Bu sıra, bilgisayardaki sekans tablosuyla aynı olmalıdır.',
  yanlis:'Yanlış girilirse sonuçlar yanlış örnek adıyla kaydedilir.'},
 {bolum:'Vialler',ask:'<b>Vial Parameters</b> tuşuna yeniden basın (ya da <b>▼</b>).',ok:V(1),keys:function(){return ['vial','down']},
  b:'LAST VIAL · son vial',deger:'yuva no',
  ne:'Analiz edilecek son vialin yuva numarasıdır.',
  neden:'Karusele kaç vial yüklediyseniz ona göre ayarlanır. Örnek: 1–6 yuvalar doluysa FIRST 1, LAST 6.',
  yanlis:'Aralıkta boş yuva varsa cihaz <b>VIAL NOT FOUND</b> uyarısı verir ve başlamaz.'},
 {bolum:'Vialler',ask:'<b>Vial Parameters</b> tuşuna yeniden basın.',ok:V(2),keys:function(){return ['vial','down']},
  b:'SHAKE · çalkalama',deger:'HIGH (2)',
  ne:'Dengeleme sırasında vialin çalkalanmasıdır: 0 = kapalı, 1 = düşük, 2 = yüksek.',
  neden:'Çalkalama, etanolün gaz fazına geçişini hızlandırır; kısa dengeleme süresinde bile kararlı sonuç verir.',
  yanlis:'Kapalıyken aynı süre yetmeyebilir; sonuçlar düşük çıkar.'},

 {bolum:'Uygulama',ask:'Şimdi bir değeri siz değiştirin: VIAL sıcaklığını <b>85</b> yapın. Sırayla <b>Zone Temps</b> → <b>8</b> → <b>5</b> → <b>Enter</b>.',
  ok:function(h){return h.z[0][1]===85},keys:yaz('zone','zone',0,'85'),
  b:'Değer değiştirme',deger:'sayı + Enter',
  html:'<p>Yeni değer <b>Enter</b>’a basınca geçerli olur. Ekrana bakın: Setpoint 85 oldu, Actual yavaş yavaş yükseliyor. İkisi eşitlenene kadar kırmızı <b>Not Ready</b> ışığı yanar.</p><p>Yanlış rakam yazarsanız <b>Clear</b> ile silebilirsiniz.</p>'},
 {bolum:'Uygulama',ask:'Sınırın dışında bir değer deneyin: <b>3</b> → <b>0</b> → <b>0</b> → <b>Enter</b>.',
  ok:function(h){return h.msg==='INVALID ENTRY'},keys:yaz('zone','zone',0,'300'),
  b:'Geçersiz değer',deger:'INVALID ENTRY',
  html:'<p>Cihaz her parametre için bir aralık tanır; VIAL sıcaklığı 40–200 °C arasında olabilir. Aralık dışındaki değer kabul edilmez ve eski değer korunur.</p>'},
 {bolum:'Uygulama',ask:'Yöntemin değerine dönün: <b>8</b> → <b>0</b> → <b>Enter</b>.',
  ok:function(h){return h.z[0][1]===80},keys:yaz('zone','zone',0,'80'),
  b:'Yöntem değerine dönüş',deger:'80 °C',
  html:'<p>Doğrulanmış bir yöntemin değerleri keyfî olarak değiştirilmez. Bir değeri değiştirdiyseniz analizden önce mutlaka yöntemdeki değere geri alın.</p>'},
 {bolum:'Uygulama',ask:'Kayıtlı yöntemi yükleyin: <b>Load Method</b> → <b>Enter</b>.',
  ok:function(h){return h.msg==='METHOD 2 LOADED'},keys:function(h){return h.mode==='load'?['enter']:['load']},
  b:'Load Method · yöntem yükleme',deger:'yöntem 2',
  html:'<p>Cihazın belleğinde 5 yöntem saklanabilir. Kanda alkol yöntemi <b>2</b> numaradadır. Yöntemi yüklemek, bütün sıcaklık ve süreleri tek adımda doğru değerlere getirir; en güvenli yol budur.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Loop ve transfer hattı neden vialden daha sıcak tutulur?',['Analizi hızlandırmak için','Buhar yolda yoğunlaşmasın diye','Etanolü parçalamak için'],1,'Gaz soğuk bir yüzeye değerse sıvılaşır; sonuç düşer ve taşınma olur.'],
 ['Ekranda Actual 62, Setpoint 80 görünüyor ve Not Ready ışığı yanıyor. Ne yaparsınız?',['Hemen Start’a basarım','Setpoint’i 62 yaparım','Sıcaklık 80’e ulaşana kadar beklerim'],2,'Cihaz, Actual değeri Setpoint’e ulaşmadan hazır olmaz.'],
 ['Karuselde 1–6 numaralı yuvalar dolu. FIRST VIAL ve LAST VIAL ne olmalı?',['1 ve 6','1 ve 12','6 ve 1'],0,'Aralıkta boş yuva kalırsa cihaz VIAL NOT FOUND uyarısı verir.'],
 ['Vial dengeleme süresi çok kısa tutulursa ne olur?',['Sonuç düşük ve tekrarlanamaz çıkar','Kolon zarar görür','Hiçbir şey değişmez'],0,'Etanol gaz fazına yeterince geçemeden örnek alınmış olur.']]},

hsbaslat:{ad:'Analizi başlatma',ic:'▶️',ozet:'Start öncesi kontrol, sık yapılan hata, vialin cihazdaki yolculuğu, Stop.',baslik:'HEADSPACE · ANALİZİ BAŞLATMA',view:['hskey'],
 kur:function(){vialYukle();HS.v[0][1]=4;HS.v[1][1]=6},
 adim:[
 {bolum:'Kontrol listesi',b:'Start’a basmadan önce',
  html:'<p>Bu derste vialler yüklü: 4, 5 ve 6 numaralı yuvalarda BLANK, QC ve NUMUNE var. Start’tan önce beş şeye bakılır:</p><ul><li>Fırın kapağı <b>kapalı</b> mı?</li><li>Vialler doğru yuvalarda mı?</li><li>FIRST VIAL ve LAST VIAL doğru mu?</li><li>Ekranda <b>READY</b> yazıyor mu?</li><li>Bilgisayarda sekans başlatıldı mı?</li></ul>'},
 {bolum:'Kontrol listesi',b:'Hazır mı?',ekran:1,
  html:'<p>Ekrana bakın: <b>READY</b> yazıyor ve kırmızı <b>Not Ready</b> ışığı sönük. Bütün sıcaklıklar ayar değerine ulaşmış demektir.</p><p>Not Ready yanıyorsa Start’a basılmaz; sıcaklıkların oturması beklenir.</p>'},
 {bolum:'Sık yapılan hata',ask:'Bir hatayı bilerek yapalım. LAST VIAL’ı <b>7</b> yapın: <b>Vial Parameters</b> → <b>▼</b> → <b>7</b> → <b>Enter</b>.',oto:1,keys:yaz('vial','vial',1,'7'),ok:function(h){return h.v[1][1]===7}},
 {bolum:'Sık yapılan hata',ask:'Şimdi <b>Start</b>’a basın.',keys:function(){return ['start']},ok:function(h){return /^VIAL 7 NOT/.test(h.msg||'')},hata:hazirHata,
  b:'VIAL 7 NOT FOUND',html:'<p>Cihaz başlamadı: 7 numaralı yuva boş. Cihaz, FIRST VIAL ile LAST VIAL arasındaki her yuvada vial arar; biri eksikse çalışmaz.</p><p>Bu uyarıyı görürseniz karuseli ve vial aralığını yeniden kontrol edin.</p>'},
 {bolum:'Sık yapılan hata',ask:'Düzeltin: LAST VIAL’ı yeniden <b>6</b> yapın. Yanıp sönen tuşları izleyin: <b>6</b> → <b>Enter</b>.',oto:1,keys:yaz('vial','vial',1,'6'),ok:function(h){return h.v[1][1]===6}},
 {bolum:'Başlatma',b:'Önce bilgisayar, sonra Start',
  html:'<p>Sıra önemlidir:</p><ul><li><b>1.</b> Bilgisayarda sekans başlatılır (Run Sequence). Program “Pre-Run” durumunda bekler.</li><li><b>2.</b> Headspace’te <b>Start</b>’a basılır.</li></ul><p>Sıra tersine çevrilirse cihaz örneği GC’ye gönderir ama bilgisayar veriyi <b>kaydetmez</b>. İğneyle delinmiş vial yeniden kullanılamaz; örnek baştan hazırlanmak zorunda kalır.</p><p>Bu derste bilgisayardaki adım yapılmış sayılır.</p>'},
 {bolum:'Başlatma',ask:'<b>Start</b>’a basın.',geriYok:1,keys:function(){return ['start']},ok:function(h){return !!h.run},hata:hazirHata,bitince:function(){spd(0)},faz:0,
  b:'Dengeleme başladı',html:'<p>Yeşil <b>Run</b> ışığı yandı. Ekranda <b>VIAL 4 EQUIB</b> yazıyor: 4 numaralı vial fırında dengeleniyor. Sağdaki sayı kalan süredir (dakika).</p><p>Bu sırada etanol sıvıdan gaz boşluğuna geçer; vial çalkalanır.</p>'},
 {bolum:'Vialin yolculuğu',ask:'Dengeleme süresi doluyor. Ekranı izleyin…',bekle:1,geriYok:1,gir:function(){spd(40)},ok:fazBekle('PRESS'),bitince:function(){spd(0)},faz:1,
  b:'Basınçlandırma',html:'<p>Ekranda <b>PRESS</b> yazıyor. İğne septumu deldi ve helyum vialin içine doluyor.</p><p>Oluşan basınç, bir sonraki adımda gazı loop’a itecek.</p>'},
 {bolum:'Vialin yolculuğu',ask:'Ekranı izleyin…',bekle:1,geriYok:1,gir:function(){spd(40)},ok:fazBekle('LOOP FILL'),bitince:function(){spd(0)},faz:2,
  b:'Loop doluyor',html:'<p>Ekranda <b>LOOP FILL</b> yazıyor. Çıkış valfi açıldı; basınçlı gaz vialden loop’a akıyor ve halkayı dolduruyor.</p><p>Ardından valf kapanır ve loop içindeki gaz kısa bir süre dengelenir.</p>'},
 {bolum:'Vialin yolculuğu',ask:'Ekranı izleyin…',bekle:1,geriYok:1,gir:function(){spd(40)},ok:fazBekle('INJECT'),bitince:function(){spd(0)},faz:4,
  b:'Enjeksiyon',html:'<p>Ekranda <b>INJECT</b> yazıyor. Taşıyıcı gaz, loop’taki örneği transfer hattından GC’ye süpürüyor.</p><p>Headspace aynı anda GC’ye “başla” sinyali gönderir: <b>GC analizi ve veri kaydı bu anda başlar.</b></p>'},
 {bolum:'Vialin yolculuğu',ask:'GC çevrim süresi doluyor. Sıradaki viali bekleyin…',bekle:1,geriYok:1,gir:function(){spd(120)},ok:fazBekle('PRESS',5),bitince:function(){spd(0)},faz:'c',
  b:'Sıradaki vial',html:'<p>Ekranda <b>VIAL 5</b> yazıyor. GC çevrim süresi (11 dk) doldu ve cihaz kendiliğinden bir sonraki viale geçti.</p><p>Bu döngü LAST VIAL’a kadar sürer. Başında beklemeniz gerekmez; ama ilk enjeksiyonun sorunsuz geçtiğini görmeden cihazın başından ayrılmayın.</p>'},
 {bolum:'Durdurma',ask:'Dersi bitirmek için <b>Stop/Reset</b>’e basın.',geriYok:1,keys:function(){return ['stop']},ok:function(h){return !h.run},bitince:function(){spd(120)},
  b:'Stop/Reset',html:'<p>Analiz durdu. Gerçek çalışmada Stop’a yalnızca <b>zorunlu durumlarda</b> basılır (yanlış vial, gaz kaçağı, yanlış yöntem).</p><p>Durdurulan analizde iğneyle delinmiş vialler yeniden kullanılamaz; o örnekler baştan hazırlanır.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Doğru başlatma sırası hangisidir?',['Önce headspace’te Start, sonra bilgisayarda sekans','Önce bilgisayarda sekans, sonra headspace’te Start','Sıra önemli değildir'],1,'Bilgisayar hazır beklemiyorsa veri kaydedilmez.'],
 ['Ekranda VIAL 7 NOT FOUND yazıyor. En olası neden nedir?',['Helyum bitmiştir','Fırın soğuktur','LAST VIAL 7 girilmiş ama 7. yuva boştur'],2,'Cihaz, girilen aralıktaki her yuvada vial arar.'],
 ['GC analizi ve veri kaydı hangi anda başlar?',['Enjeksiyon (INJECT) anında','Dengeleme başlarken','Start’a basıldığı anda'],0,'Headspace, enjeksiyonla birlikte GC’ye başla sinyali gönderir.'],
 ['Analiz yarıda durdurulursa delinmiş viallere ne yapılır?',['Aynı vialler yeniden analiz edilir','Kapakları değiştirilir','Örnekler baştan hazırlanır'],2,'Septum delinince gaz kaçar; vial artık güvenilir değildir.']]}
,
gctani:{grup:'gc',ad:'Cihazı tanıma',ic:'🔍',ozet:'GC fırını, kolon, inlet, kütle dedektörü ve bilgisayar: örneğin izlediği yol.',baslik:'GC-MS · CİHAZI TANIMA',view:['main'],yukGizle:1,
 adim:[
 {bolum:'Giriş',b:'GC-MS ne yapar?',
  html:'<p>Headspace’ten gelen gaz örneği bir karışımdır: içinde etanol, metanol, iç standart ve başka uçucular bulunur. GC-MS bu karışımı iki adımda çözer:</p><ul><li><b>GC (gaz kromatografi, 6890N):</b> bileşikleri birbirinden <b>ayırır</b>. Her bileşik kolondan farklı zamanda çıkar.</li><li><b>MS (kütle dedektörü, 5975B):</b> kolondan çıkan her bileşiği <b>tanır</b> ve miktarını ölçer.</li></ul><p>Örneğin yolu: inlet → kolon → kütle dedektörü → bilgisayar.</p>'},
 {bolum:'Dış görünüm',ask:'Sağdaki büyük kapağa, <b>GC fırın kapağına</b> dokunun.',hot:'GC fırın kapağı',kes:1,
  b:'GC fırını',ne:'Kapağın arkasında, içinde kolonun durduğu bir fırın vardır.',neden:'Fırın kolonu bir programa göre ısıtır. Sıcaklık arttıkça bileşikler kolonda daha hızlı ilerler; böylece hepsi sırayla ve ayrı ayrı çıkar.',yanlis:'Analiz sırasında kapak açılmaz: fırın soğur, analiz bozulur.',son:'DİKKAT'},
 {bolum:'Dış görünüm',ask:'En sağdaki <b>GC tuş takımına</b> dokunun.',hot:'GC tuş takımı',kes:1,
  b:'Ekran ve tuş takımı',ne:'Fırın, inlet, kolon ve dedektör hattının sıcaklık, basınç ve akış değerleri buradan izlenir.',neden:'Ekran her değerin gerçek (Actual) ve ayarlanan (Setpoint) hâlini gösterir. Not Ready ışığı, cihazın analize hazır olup olmadığını bildirir.',yanlis:'Tuş takımını “Tuş takımı parametreleri” bölümünde kullanacaksınız.',son:'SONRA'},
 {bolum:'Dış görünüm',ask:'Ortadaki cihaza, <b>kütle dedektörüne (5975B MSD)</b> dokunun.',hot:'5975B MSD',kes:1,
  b:'Kütle dedektörü (MSD)',ne:'Kolondan çıkan bileşikleri elektronlarla parçalar ve oluşan iyonları kütlelerine göre ayırır.',neden:'Her bileşiğin parçalanma deseni (kütle spektrumu) parmak izi gibidir. Etanol m/z 45 ve 31, metanol m/z 31 ve 32 iyonlarıyla tanınır.',yanlis:'Dedektör yüksek vakum altında çalışır. Vakum bozulursa (kaçak, kapak açılması) ölçüm yapılamaz.',son:'DİKKAT'},
 {bolum:'Dış görünüm',ask:'Üstteki kuleye, <b>otomatik enjektöre</b> dokunun.',hot:'7683B otomatik enjektör',kes:1,
  b:'Otomatik enjektör (7683B)',ne:'Sıvı örnekleri şırıngayla inlete veren robottur.',neden:'Sıvı enjeksiyonlu GC-MS analizlerinde (örneğin ilaç taraması) kullanılır.',yanlis:'Kanda alkol analizinde örnek headspace’ten gaz olarak gelir; bu enjektör kullanılmaz.',son:'BU ANALİZDE'},
 {bolum:'Dış görünüm',ask:'En sağdaki <b>bilgisayara</b> dokunun.',hot:'Bilgisayar',kes:1,
  b:'Bilgisayar',ne:'Cihazı yöneten yazılım burada çalışır.',neden:'Yöntem (hangi sıcaklık, hangi iyonlar), sekans (hangi vial, hangi sırayla) ve sonuçların değerlendirilmesi bilgisayardan yapılır.',yanlis:'Bilgisayarda sekans başlatılmadan yapılan enjeksiyonun verisi kaydedilmez.',son:'DİKKAT'},
 {bolum:'Fırının içi',ask:'Şimdi fırının içine bakalım: <b>GC fırın kapağına</b> yeniden dokunarak kapağı açın.',hot:'GC fırın kapağı',view:['main','oven'],ok:function(){return S.view==='oven'},
  b:'Fırının içi',html:'<p>Ortadaki halka biçiminde sarılı ince boru <b>kolon</b>dur. Arkadaki ızgaranın gerisinde, sıcak havayı fırının her yerine eşit dağıtan bir fan vardır.</p><p>Kapak açıkken fırın soğur ve cihaz “hazır değil” durumuna geçer.</p>'},
 {bolum:'Fırının içi',ask:'Ortadaki sarılı <b>kolona</b> dokunun.',hot:'Kolon (DB-WAX)',kes:1,view:['oven'],
  b:'Kolon: DB-WAX, 30 m',ne:'30 metre uzunluğunda, saç teli kadar ince bir cam borudur. İç yüzeyi ince bir sıvı tabakayla (sabit faz) kaplıdır.',neden:'Bileşikler bu tabakaya farklı ölçüde tutunur. Az tutunan önce, çok tutunan sonra çıkar: metanol yaklaşık 2,9, etanol 3,2, iç standart (n-propanol) 3,8 dakikada.',yanlis:'Kolon kırılgandır ve sıcaklık sınırı vardır. Sınır aşılırsa kaplama bozulur.',son:'DİKKAT'},
 {bolum:'Fırının içi',ask:'Sol üstteki <b>ön inlete</b> dokunun.',hot:'Ön inlet',kes:1,view:['oven'],
  b:'Ön inlet (giriş)',ne:'Örneğin kolona girdiği yerdir. Headspace’in transfer hattı buraya bağlıdır; kolonun bir ucu da buraya takılır.',neden:'210 °C’de tutulur. “Split” modunda çalışır: gelen gazın küçük bir kısmı kolona girer, kalanı dışarı atılır. Böylece kolon aşırı yüklenmez ve pikler keskin olur.',yanlis:'Bağlantı gevşekse gaz kaçar; alanlar küçülür ve tekrarlanabilirlik bozulur.',son:'DİKKAT'},
 {bolum:'Fırının içi',ask:'Soldaki <b>MSD transfer hattına</b> dokunun.',hot:'MSD transfer hattı',kes:1,view:['oven'],
  b:'MSD transfer hattı',ne:'Kolonun çıkış ucu fırın duvarındaki bu hattan geçerek kütle dedektörüne ulaşır.',neden:'260 °C’de tutulur. Kolondan çıkan bileşikler dedektöre varmadan yoğunlaşmamalıdır.',yanlis:'Buradaki bir sızıntı dedektöre hava sokar; ekranda hava iyonları (m/z 28 ve 32) yükselir.',son:'DİKKAT'},
 {bolum:'Fırının içi',ask:'Fırın tabanındaki küçük parçalara, <b>ferrule ve somunlara</b> dokunun.',hot:'Ferrule ve somunlar',kes:1,view:['oven'],
  b:'Ferrule ve somunlar',ne:'Kolonu inlete ve dedektöre sızdırmaz biçimde bağlayan küçük conta (ferrule) ve somunlardır.',neden:'Kolon her takıldığında yeni ferrule kullanılır.',yanlis:'Eski ya da ezilmiş ferrule sızdırır. Kolon değişiminden sonra sızıntı kontrolü yapılır.',son:'DİKKAT'},
 {bolum:'Fırının içi',ask:'Sol üstteki <b>‹ Kapağı kapat</b> düğmesiyle kapağı kapatın.',sec:function(){return ['#st .back']},geri:1,view:['oven','main'],ok:function(){return S.view==='main'},
  b:'Özet',html:'<p>Örneğin GC-MS’teki yolu:</p><ul><li><b>İnlet:</b> örnek kolona girer.</li><li><b>Kolon:</b> bileşikler birbirinden ayrılır.</li><li><b>MSD transfer hattı:</b> bileşikler dedektöre taşınır.</li><li><b>Kütle dedektörü:</b> her bileşik tanınır ve ölçülür.</li><li><b>Bilgisayar:</b> sonuç kromatogram olarak kaydedilir.</li></ul>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['GC ve MS’in görevleri hangisinde doğru verilmiştir?',['GC tanır, MS ayırır','GC ayırır, MS tanır ve ölçer','İkisi de yalnızca ısıtır'],1,'Kolon bileşikleri ayırır; kütle dedektörü her birini tanır.'],
 ['Bileşikler kolondan neden farklı zamanlarda çıkar?',['Kolonun iç kaplamasına farklı ölçüde tutundukları için','Fan onları sırayla ittiği için','Renkleri farklı olduğu için'],0,'Az tutunan önce, çok tutunan sonra çıkar.'],
 ['Kanda alkol analizinde otomatik enjektör (7683B) neden kullanılmaz?',['Arızalı olduğu için','Örnek headspace’ten gaz olarak geldiği için','Kolon çok kısa olduğu için'],1,'Otomatik enjektör sıvı örnekler içindir.'],
 ['MSD transfer hattında sızıntı olursa ne görülür?',['Fırın ısınmaz','Tuş takımı kilitlenir','Hava iyonları (m/z 28 ve 32) yükselir'],2,'Dedektöre hava girdiğinin işaretidir.']]},

gctus:{grup:'gc',ad:'Tuş takımı parametreleri',ic:'🎛',ozet:'Fırın programı, inlet, kolon akışı, dedektör hattı ve Status ekranı.',baslik:'GC-MS · TUŞ TAKIMI',view:['gckey'],etiket:'Yöntem',
 adim:[
 {bolum:'Giriş',b:'Ekranı tanıyın',ekran:1,
  html:'<p>GC ekranı dört satırdır. En üstte hangi bölümde olduğunuz yazar; altında o bölümün parametreleri sıralanır.</p><ul><li><b>Actual:</b> o an ölçülen değer</li><li><b>Setpoint:</b> yöntemdeki hedef değer</li><li><b>&lt;</b> işareti: seçili satır. <b>▲ ▼</b> tuşlarıyla satırlar arasında gezilir.</li></ul><p>Şu an <b>STATUS</b> ekranındasınız: “Ready for injection”, cihazın enjeksiyona hazır olduğunu gösterir.</p>'},
 {bolum:'Fırın',ask:'<b>Oven</b> tuşuna basın.',keys:function(){return ['oven']},ok:function(){return G.sec==='oven'&&G.cur===0},prog:0,
  b:'Temp · başlangıç sıcaklığı',deger:'35 °C',
  ne:'Analiz başlarken fırının (ve kolonun) sıcaklığıdır.',neden:'Alkoller çok uçucudur. Düşük sıcaklıkta başlamak, metanol ile etanolün kolonda birbirinden ayrılmasına zaman tanır.',yanlis:'Yüksek başlanırsa pikler üst üste biner; iki bileşik ayırt edilemez.'},
 {bolum:'Fırın',ask:'<b>▼</b> tuşuna basın.',keys:function(){return ['down']},ok:function(){return G.sec==='oven'&&G.cur===1},prog:0,
  b:'Init time · başlangıçta bekleme',deger:'2,00 dk',
  ne:'Fırının başlangıç sıcaklığında beklediği süredir.',neden:'Bu iki dakikada bileşikler kolonda yavaşça ilerler ve birbirinden uzaklaşır.',yanlis:'Kısa tutulursa ayrım kötüleşir; uzun tutulursa analiz gereksiz yere uzar.'},
 {bolum:'Fırın',ask:'<b>▼</b> tuşuna basın.',keys:function(){return ['down']},ok:function(){return G.sec==='oven'&&G.cur===2},prog:1,
  b:'Rate 1 · ısıtma hızı',deger:'50 °C/dk',
  ne:'Bekleme bittikten sonra fırının dakikada kaç derece ısınacağıdır.',neden:'Hızlı ısıtma, geride kalan bileşikleri (n-propanol ve daha ağır olanlar) kolondan çabuk çıkarır.',yanlis:'Çok yavaş olursa pikler genişler ve analiz uzar.'},
 {bolum:'Fırın',ask:'<b>▼</b> tuşuna basın.',keys:function(){return ['down']},ok:function(){return G.sec==='oven'&&G.cur===3},prog:2,
  b:'Final temp 1 · son sıcaklık',deger:'150 °C',
  ne:'Isıtmanın duracağı sıcaklıktır.',neden:'Kolonda kalan her şeyi dışarı atacak kadar yüksek, kolonun sınırını aşmayacak kadar düşüktür.',yanlis:'Düşük kalırsa kolonda kalıntı birikir ve sonraki analize taşınır. Kolonun sınırı aşılırsa kaplaması bozulur.'},
 {bolum:'Fırın',ask:'<b>▼</b> tuşuna basın.',keys:function(){return ['down']},ok:function(){return G.sec==='oven'&&G.cur===4},prog:2,
  b:'Final time 1 · sonda bekleme',deger:'0,50 dk',
  ne:'Fırının son sıcaklıkta beklediği süredir.',neden:'Kolon temizlenir. Toplam analiz yaklaşık 4,8 dakika sürer; sonra fırın yeniden 35 °C’ye soğur.',yanlis:'Fırın soğumadan yeni enjeksiyon yapılamaz. Headspace’teki GC çevrim süresi (11 dk) bu yüzden analizden uzundur.'},
 {bolum:'Inlet',ask:'<b>Front Inlet</b> tuşuna basın.',keys:function(){return ['finlet']},ok:function(){return G.sec==='finlet'&&G.cur===0},
  b:'Mode · inlet modu',deger:'Split',
  ne:'Örneğin kolona nasıl verileceğini belirler.',neden:'Split modunda gelen gazın yalnızca bir kısmı kolona girer, kalanı dışarı atılır. Headspace örneği derişik olduğu için bu mod kullanılır.',yanlis:'Splitless modunda örneğin tamamı kolona girer; kolon aşırı yüklenir, pikler bozulur.'},
 {bolum:'Inlet',ask:'<b>▼</b> tuşuna basın.',keys:function(){return ['down']},ok:function(){return G.sec==='finlet'&&G.cur===1},
  b:'Temp · inlet sıcaklığı',deger:'210 °C',
  ne:'Örneğin kolona girdiği bölgenin sıcaklığıdır.',neden:'Headspace’ten gelen gazın yoğunlaşmadan, bir bütün hâlinde kolona girmesini sağlar.',yanlis:'Düşük olursa örnek inlette takılır; pikler küçülür ve kuyruklanır.'},
 {bolum:'Inlet',ask:'<b>▼</b> tuşuna basın.',keys:function(){return ['down']},ok:function(){return G.sec==='finlet'&&G.cur===2},
  b:'Pressure · inlet basıncı',deger:'7,07 psi',
  ne:'Taşıyıcı gazın (helyum) kolonun girişindeki basıncıdır.',neden:'Bu basınç helyumu kolon boyunca iter. Cihaz, istenen akışı sağlayacak basıncı kendisi hesaplar.',yanlis:'Actual değeri Setpoint’e ulaşamıyorsa gaz bitmiş ya da bir yerde kaçak vardır.'},
 {bolum:'Inlet',ask:'<b>▼</b> tuşuna basın.',keys:function(){return ['down']},ok:function(){return G.sec==='finlet'&&G.cur===3},
  b:'Split ratio · bölme oranı',deger:'20 : 1',
  ne:'Dışarı atılan gazın kolona giren gaza oranıdır. 20:1, örneğin yaklaşık yirmide birinin kolona girdiğini gösterir.',neden:'Kolonu aşırı yüklemeden yeterli sinyal verir.',yanlis:'Oran büyürse pikler küçülür (duyarlılık düşer); küçülürse pikler genişler ve tepeleri düzleşir.'},
 {bolum:'Kolon',ask:'<b>Col 1</b> tuşuna basın.',keys:function(){return ['col1']},ok:function(){return G.sec==='col1'&&G.cur===2},
  b:'Flow · kolon akışı',deger:'1,1 mL/dk',
  ne:'Helyumun kolon içindeki akış hızıdır. Kolon: DB-WAX, 30 m × 250 µm.',neden:'Sabit akış (Const flow) modunda çalışır: fırın ısınsa da akış aynı kalır, bileşiklerin çıkış zamanı değişmez.',yanlis:'Akış değişirse bütün pikler kayar; bileşikler beklenen zamanda çıkmaz ve yazılım onları tanıyamaz.'},
 {bolum:'Dedektör hattı',ask:'<b>Aux #</b> tuşuna basın.',keys:function(){return ['aux']},ok:function(){return G.sec==='aux'&&G.cur===0},
  b:'Aux 2 Temp · MSD transfer hattı',deger:'260 °C',
  ne:'Kolonun kütle dedektörüne geçtiği hattın sıcaklığıdır.',neden:'Fırının son sıcaklığından (150 °C) yüksektir; hiçbir bileşik bu hatta yoğunlaşmaz.',yanlis:'Soğuk kalırsa bileşikler hatta tutunur; pikler kuyruklanır ve küçülür.'},
 {bolum:'Durum',ask:'<b>Status</b> tuşuna basın.',keys:function(){return ['status']},ok:function(){return G.sec==='status'},
  b:'Status · cihaz durumu',html:'<p>“<b>Ready for injection</b>” yazıyorsa bütün sıcaklık ve basınçlar yerindedir.</p><p>Cihaz hazır değilse neden hazır olmadığı burada satır satır yazar; örneğin “Oven temp not ready” ya da “Oven door open”. Kırmızı <b>Not Ready</b> ışığı yandığında ilk bakılacak yer bu ekrandır.</p>'},
 {bolum:'Uygulama',ask:'Fırın sıcaklığını değiştirmeyi deneyin: <b>Oven</b> → <b>4</b> → <b>0</b> → <b>Enter</b>.',
  keys:function(){if(G.sec!=='oven'||G.cur!==0)return ['oven'];if(G.buf==='40')return ['enter'];if('40'.indexOf(G.buf)!==0)return ['clear'];return ['d'+'40'.charAt(G.buf.length)]},
  ok:function(){return !!SON&&SON.k==='enter'&&SON.buf==='40'},bitince:function(){G.p.oven[0][1]=35;G.ovenSet=35;G.buf=''},
  b:'Yöntem kilitli',html:'<p>Değer değişmedi: ekranda hâlâ <b>35</b> yazıyor. Cihazda doğrulanmış bir yöntem yüklüdür ve tuş takımından değiştirilemez.</p><p>Bir parametreyi değiştirmek gerekirse bu, bilgisayarda <b>yeni bir yöntem</b> olarak kaydedilerek yapılır. Doğrulanmış yöntemin değerleri keyfî olarak değiştirilmez.</p>'},
 {bolum:'Uygulama',ask:'Şimdi GC’nin kendi <b>Start</b> tuşuna basın.',keys:function(){return ['start']},ok:function(){return !!SON&&SON.k==='start'},
  b:'GC’de Start’a basılmaz',html:'<p>Hiçbir şey olmadı. Bu sistemde analizi <b>headspace başlatır</b>: enjeksiyon anında GC’ye ve bilgisayara kendiliğinden “başla” sinyali gönderir.</p><p>Sizin Start’a bastığınız yer headspace’in tuş takımıdır. GC’de elle Start’a basılırsa fırın programı örnek olmadan çalışır.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Fırın neden düşük sıcaklıkta (35 °C) başlar?',['Elektrik tasarrufu için','Metanol ve etanolün birbirinden ayrılması için','Kolonu soğutmak için'],1,'Uçucu bileşikler düşük sıcaklıkta daha iyi ayrılır.'],
 ['Split ratio 20:1 ne anlama gelir?',['Örneğin yaklaşık yirmide biri kolona girer','Analiz 20 dakika sürer','Fırın 20 °C/dk ısınır'],0,'Kalan kısım dışarı atılır; kolon aşırı yüklenmez.'],
 ['Kırmızı Not Ready ışığı yanıyor. Nedenini nereden öğrenirsiniz?',['Oven tuşundan','Start tuşuna basarak','Status tuşundan'],2,'Status ekranı cihazın neden hazır olmadığını yazar.'],
 ['Bu sistemde analizi hangi cihaz başlatır?',['Headspace örnekleyici','GC’nin Start tuşu','Kütle dedektörü'],0,'Headspace, enjeksiyon anında GC’ye başla sinyali gönderir.']]},
pctani:{grup:'gc',ad:'Yazılımı tanıma ve menüler',ic:'🖥',ozet:'Veri toplama programının ekranı: durum kutuları, simgeler, canlı değerler ve üstteki menüler.',baslik:'BİLGİSAYAR · YAZILIMI TANIMA',view:['pc'],
 adim:[
 {bolum:'Giriş',b:'İki program',
  html:'<p>Bilgisayarda iki program çalışır; alttaki görev çubuğundan birinden diğerine geçilir:</p><ul><li><b>GCMS/Enhanced MassHunter:</b> cihazı yönetir ve veriyi <b>toplar</b>. Sekans burada hazırlanır ve başlatılır.</li><li><b>Enhanced Data Analysis:</b> toplanan veriyi <b>değerlendirir</b>: kromatogram, kalibrasyon, sonuç raporu.</li></ul><p>Bu bölümde birinci programı, yani şu an açık olan ekranı tanıyacaksınız.</p>'},
 {bolum:'Ekran',ask:'En üstteki <b>başlık satırına</b> tıklayın.',dok:'#appIC .ttl',
  b:'Başlık satırı',html:'<p>Başlıkta üç dosya adı yazar:</p><ul><li><b>ALKOL1.M</b>: yüklü yöntem (sıcaklıklar, akış, izlenecek iyonlar).</li><li><b>ATUNE.U</b>: kütle dedektörünün ayar (tune) dosyası.</li><li><b>default.sequence.xml</b>: açık olan sekans dosyası.</li></ul><p>Analizden önce buraya bakın: doğru yöntem yüklü mü?</p>'},
 {bolum:'Ekran',ask:'Sol üstteki <b>Run Status</b> kutusuna tıklayın.',dok:'#rsB',
  b:'Run Status · çalışma durumu',html:'<ul><li><b>Idle:</b> boşta, sekans çalışmıyor.</li><li><b>Pre-Run:</b> sekans başlatıldı, program headspace’in enjeksiyonunu bekliyor.</li><li><b>Run:</b> analiz sürüyor, veri kaydediliyor.</li><li><b>Paused:</b> sekans duraklatıldı.</li></ul>'},
 {bolum:'Ekran',ask:'Altındaki <b>Instrument Status</b> kutusuna tıklayın.',dok:'#isB',
  b:'Instrument Status · cihaz durumu',html:'<p><b>Ready</b> (yeşil): bütün sıcaklıklar ve basınçlar yerinde, cihaz enjeksiyona hazır.</p><p><b>Not Ready</b> (sarı): bir değer henüz hedefe ulaşmadı. Nedeni GC tuş takımındaki <b>Status</b> ekranında yazar.</p>'},
 {bolum:'Ekran',ask:'Mavi vial resminin bulunduğu <b>örnek kutusuna</b> tıklayın.',dok:function(){var e=document.getElementById('snm');return e?[e.parentNode.parentNode]:[]},
  b:'Örnek bilgisi',html:'<p>O an analiz edilen (ya da sıradaki) örneği gösterir:</p><ul><li><b>Vial numarası</b> (vialin üstünde)</li><li><b>Sample Name:</b> örneğin adı</li><li><b>Data File:</b> verinin kaydedileceği dosya</li></ul><p>Yanındaki büyük yeşil ok tek bir analiz başlatır; kanda alkol analizinde kullanılmaz, çünkü analizi headspace başlatır.</p>'},
 {bolum:'Ekran',ask:'Siyah zeminli <b>Run Time</b> sayacına tıklayın.',dok:'#rtD',
  b:'Run Time · analiz süresi',html:'<p>Sayaç, süren analizin kaçıncı dakikasında olduğunu gösterir. Altında yöntemin toplam süresi yazar: <b>4,80 dk</b>.</p>'},
 {bolum:'Ekran',ask:'Sekizgen <b>STOP</b> düğmesine tıklayın (derste bir şey durdurmaz).',dok:'#stopB',
  b:'STOP',html:'<p>Çalışan sekansı iptal eder. Sekans çalışırken kırmızı olur.</p><p>Yalnızca zorunlu durumlarda kullanılır. Bilgisayarda sekansı durdurmak headspace’i durdurmaz; headspace’te de <b>Stop/Reset</b>’e basmak gerekir.</p>'},
 {bolum:'Simgeler',ask:'<b>Sequence</b> başlığının altındaki simge grubuna tıklayın.',dok:'#icSeq',
  b:'Sequence simgeleri',html:'<p>Soldan sağa:</p><ul><li>📂 <b>Load Sequence:</b> kayıtlı sekansı açar.</li><li>💾 <b>Save Sequence:</b> sekansı kaydeder.</li><li>🏃 <b>Run Sequence</b> (koşan adam): sekansı başlatır.</li><li>✏️ <b>Edit Sequence</b> (kalem): sekans tablosunu açar.</li><li>✔️ <b>Sequence Check:</b> başlatmadan önce tabloyu denetler.</li></ul><p>Günlük işte en çok kullanılan üçü: kalem, ✓ ve koşan adam.</p>'},
 {bolum:'Simgeler',ask:'<b>Method (External Device)</b> başlığının altındaki gri simgelere tıklayın.',dok:'#icMet',
  b:'Method simgeleri (pasif)',html:'<p>Bu simgeler gridir, çünkü örneği veren cihaz (headspace) bilgisayara bağlı değildir: yazılım onu “dış cihaz” (External Device) olarak görür.</p><p>Bu yüzden tek analiz buradan başlatılmaz; her zaman sekans kullanılır.</p>'},
 {bolum:'Simgeler',ask:'<b>Instrument</b> başlığının altındaki simge grubuna tıklayın.',dok:'#icIns',
  b:'Instrument simgeleri',html:'<ul><li>💉 <b>ALS</b> ve 🧫 <b>Sample Tray:</b> otomatik enjektör; bu analizde kullanılmaz.</li><li>🌡 <b>GC Parameters:</b> fırın, inlet ve dedektör hattı ayarları.</li><li>📯 <b>MS Source:</b> kütle dedektörü ayarları (SIM/Scan, iyonlar).</li><li>🔧 <b>MS Tune:</b> dedektörün ayar testi.</li><li>⏲ <b>Vacuum:</b> vakum durumu.</li></ul>'},
 {bolum:'Canlı değerler',ask:'Siyah zeminli <b>sıcaklık göstergelerine</b> tıklayın.',dok:'#icTiles',
  b:'Canlı değerler',html:'<p>Cihazdan o an okunan değerlerdir:</p><ul><li><b>Oven:</b> fırın (35 °C)</li><li><b>Inlet-F:</b> ön inlet (210 °C)</li><li><b>Column-1 Flow:</b> kolon akışı (1,1 mL/dk)</li><li><b>Aux-2:</b> MSD transfer hattı (260 °C)</li><li><b>MS Source:</b> iyon kaynağı (230 °C)</li><li><b>MS Quad:</b> kuadrupol (150 °C)</li></ul><p>GC tuş takımında gördüğünüz değerlerin aynısıdır.</p>'},
 {bolum:'Canlı değerler',ask:'Altındaki dört küçük <b>izleme penceresine</b> tıklayın.',dok:'#icMon',
  b:'İzleme pencereleri',html:'<p>Analiz sürerken dedektörün o an ne gördüğünü gösterir: anlık kütle spektrumu, toplam iyon akımı (TIC), tarama (Scan) ve seçili iyon (SIM 31) sinyali.</p><p>Analiz yokken boştur.</p>'},
 {bolum:'Canlı değerler',ask:'Büyük <b>Chromatogram</b> penceresine tıklayın.',dok:'#icCv',
  b:'Canlı kromatogram',html:'<p>Analiz sırasında kromatogram burada canlı çizilir: yatay eksen zaman (dakika), dikey eksen sinyal şiddetidir. Her pik bir bileşiktir.</p><p>Bu pencere yalnızca izlemek içindir; değerlendirme Data Analysis programında yapılır.</p>'},
 {bolum:'Canlı değerler',ask:'En alttaki <b>durum satırına</b> tıklayın.',dok:'#icSB',
  b:'Durum satırı',html:'<p>Programın o an ne yaptığını tek cümleyle yazar: “Ready”, “Waiting for start signal from external device (7694E)…”, “Acquiring …”.</p><p>Bir şey beklediğiniz gibi gitmiyorsa önce buraya bakın.</p>'},
 {bolum:'Menüler',ask:'Menü çubuğunda <b>Method</b> menüsüne tıklayın.',izin:function(){return ['#icMB>div[data-m="Method"]']},ok:function(){return menuAcik('Method')},
  b:'Method menüsü',html:'<ul><li><b>Load Method…</b> Kayıtlı bir yöntemi yükler.</li><li><b>Save Method</b> Değişiklikleri kaydeder. Doğrulanmış yöntem kilitlidir, üzerine kaydedilemez.</li><li><b>Save Method As…</b> Yöntemi yeni bir adla kaydeder; değişiklik gerekirse yol budur.</li><li><b>Edit Entire Method…</b> Fırın, inlet ve dedektör hattı ayarlarının penceresini açar.</li><li><b>Run Method</b> Tek analiz başlatır; bu sistemde kullanılmaz.</li></ul>'},
 {bolum:'Menüler',ask:'<b>Instrument</b> menüsüne tıklayın.',izin:function(){return ['#icMB>div[data-m="Instrument"]']},ok:function(){return menuAcik('Instrument')},
  b:'Instrument menüsü',html:'<ul><li><b>GC Parameters…</b> GC ayarları: fırın programı, inlet, akış.</li><li><b>MS Parameters…</b> Kütle dedektörü ayarları.</li><li><b>MS Tune…</b> Dedektörün ayar testi. Düzenli yapılır; sonucu kayda geçer.</li></ul>'},
 {bolum:'Menüler',ask:'<b>Sequence</b> menüsüne tıklayın.',izin:function(){return ['#icMB>div[data-m="Sequence"]']},ok:function(){return menuAcik('Sequence')},
  b:'Sequence menüsü',html:'<p>En çok kullanacağınız menüdür; simgelerle aynı işleri yapar:</p><ul><li><b>Load / Save / Save As:</b> sekans dosyasını açar ve kaydeder.</li><li><b>Edit Sequence…</b> Sekans tablosu (kalem simgesi).</li><li><b>Sequence Check…</b> Tabloyu denetler (✓ simgesi).</li><li><b>Run Sequence…</b> Sekansı başlatır (koşan adam).</li><li><b>Pause / Resume Sequence:</b> duraklatır ve sürdürür.</li></ul>'},
 {bolum:'Menüler',ask:'<b>View</b> menüsüne tıklayın.',izin:function(){return ['#icMB>div[data-m="View"]']},ok:function(){return menuAcik('View')},
  b:'View menüsü',html:'<p><b>Data Analysis:</b> değerlendirme programına geçer. Aynı geçiş alttaki görev çubuğundan da yapılır.</p>'},
 {bolum:'Menüler',ask:'<b>Abort</b> menüsüne tıklayın.',izin:function(){return ['#icMB>div[data-m="Abort"]']},ok:function(){return menuAcik('Abort')},
  b:'Abort menüsü',html:'<p><b>Abort Sequence:</b> çalışan sekansı iptal eder; STOP düğmesiyle aynıdır. Program önce onay ister.</p><p>Kalan menüler (<b>Checkout, Window, Graphics, Help</b>) pencere düzeni ve yardım içindir; günlük analizde kullanılmaz.</p>'},
 {bolum:'Menüler',ask:'En alttaki görev çubuğunda <b>Enhanced Data Analysis</b> düğmesine tıklayın (derste program değişmez).',dok:'#tbDA',
  b:'Görev çubuğu',html:'<p>İki program arasında buradan geçilir. Analiz bittikten sonra sonuçları değerlendirmek için <b>Enhanced Data Analysis</b> açılır.</p><p>Veri toplanırken de Data Analysis’e geçebilirsiniz; toplama arka planda sürer.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Run Status kutusunda “Pre-Run” yazıyor. Bu ne demektir?',['Analiz bitti','Sekans başlatıldı, program headspace’in enjeksiyonunu bekliyor','Cihaz arızalı'],1,'Headspace’te Start’a basılınca durum Run olur.'],
 ['Method (External Device) simgeleri neden gridir?',['Yöntem silinmiştir','Bilgisayar kilitlidir','Örneği veren headspace, yazılıma bağlı olmayan bir dış cihazdır'],2,'Bu yüzden analiz her zaman sekansla yürütülür.'],
 ['Sekans tablosunu açmanın iki yolu hangisidir?',['Kalem simgesi ya da Sequence ▸ Edit Sequence…','STOP düğmesi ya da Abort menüsü','Yeşil ok ya da Method ▸ Run Method'],0,'Simgeler, menüdeki komutların kısayoludur.'],
 ['Doğrulanmış yöntemde bir değeri değiştirmek gerekirse ne yapılır?',['Save Method ile üzerine kaydedilir','Save Method As… ile yeni bir adla kaydedilir','GC tuş takımından değiştirilir'],1,'Doğrulanmış yöntem kilitlidir; değişiklik yeni yöntem olarak kaydedilir.']]},

pcsekans:{grup:'gc',ad:'Sekans oluşturma ve başlatma',ic:'📋',ozet:'Sekans tablosu, kontrol raporu, Run Sequence ve ilk verinin kaydedilmesi.',baslik:'BİLGİSAYAR · SEKANS',view:['pc'],
 kur:function(){vialYukle();HS.v[0][1]=4;HS.v[1][1]=6},
 adim:[
 {bolum:'Giriş',b:'Sekans nedir?',
  html:'<p>Sekans, cihaza verilen iş listesidir. Her satırı bir vialdir ve şunları söyler: örneğin adı, hangi yuvada olduğu, hangi yöntemle analiz edileceği ve verinin nereye, hangi adla kaydedileceği.</p><p>Bu derste karuselde üç vial hazır: <b>4</b> numarada BLANK, <b>5</b> numarada QC-0,25, <b>6</b> numarada NUMUNE-01.</p>'},
 {bolum:'Tablo',ask:'Sequence bölümündeki <b>kalem</b> simgesine (Edit Sequence) tıklayın.',izin:function(){return ['#icSeq .ib[data-i="3"]']},ok:function(){return dlgAcik('Sequence Table')},
  b:'Sequence Table',html:'<p>Sekans tablosu açıldı. Önemli sütunlar:</p><ul><li><b>Name:</b> örneğin adı</li><li><b>Vial:</b> karuseldeki yuva numarası</li><li><b>Method File:</b> kullanılacak yöntem</li><li><b>Data Path:</b> verinin kaydedileceği klasör</li><li><b>Data File:</b> veri dosyasının adı</li><li><b>Type:</b> örneğin türü (Blank, Calibration, QC, Sample)</li></ul><p>Tabloda önceki çalışmadan kalma satırlar var; şimdi kendi listenizi oluşturacaksınız.</p>'},
 {bolum:'Tablo',ask:'Tabloyu doldurun: <b>Tools ▾</b> düğmesine, ardından <b>Karusele göre doldur</b> seçeneğine tıklayın.',
  izin:function(){var m=document.getElementById('stTM');return m&&m.style.display==='block'?['#stFill']:['#stTo']},
  ok:function(){var r=document.querySelectorAll('#stG tr[data-i]'),v=document.querySelector('#stG tr[data-i="0"] [data-k="vial"]');return r.length===3&&!!v&&v.value==='4'},
  b:'Tablo dolduruldu',html:'<p>Üç satır oluştu; karuseldeki dizilişle aynı sırada: BLANK (4), QC-0,25 (5), NUMUNE-01 (6).</p><p>Bu düğme bir eğitim kolaylığıdır. Gerçek programda her hücre elle yazılır; aşağı doğru kopyalamak için <b>⬇</b> (Fill Down) ve sayıyı artırarak kopyalamak için <b>⇊</b> düğmeleri kullanılır.</p><p><b>Data File</b> sütununa dikkat edin: her satırın dosya adı farklıdır. Aynı ad iki kez kullanılamaz.</p>'},
 {bolum:'Tablo',ask:'Bir hücreyi elle değiştirin: 3. satırın <b>Name</b> hücresine tıklayın, içindekini silin ve <b>2026-123</b> yazın.',
  izin:function(){return ['#stG tr[data-i="2"] [data-k="name"]']},ok:function(){var e=document.querySelector('#stG tr[data-i="2"] [data-k="name"]');return !!e&&e.value.trim()==='2026-123'},
  b:'Örnek adı',html:'<p>Name sütununa gerçek çalışmada vaka ya da kayıt numarası yazılır. Bu ad rapora aynen çıkar; yanlış yazılırsa sonuç yanlış kişiye ait görünür.</p>'},
 {bolum:'Tablo',ask:'Tabloyu kaydetmek için alttaki <b>OK</b> düğmesine tıklayın.',izin:function(){return ['#stOK']},ok:function(){return !dlgAcik('Sequence Table')&&A.IC.rows.length===3},
  b:'Tablo kaydedildi',html:'<p>Program tabloyu kaydederken basit hataları yakalar: boş dosya adı, seçilmemiş yöntem, aynı dosya adının iki kez kullanılması.</p><p>Asıl denetim bir sonraki adımdadır.</p>'},
 {bolum:'Kontrol',ask:'Sequence bölümündeki <b>✔️</b> simgesine (Sequence Check) tıklayın.',izin:function(){return ['#icSeq .ib[data-i="4"]']},ok:function(){return dlgAcik('Start Sequence')},
  b:'Start Sequence penceresi',html:'<p>Kontrol de başlatma da bu pencereden yapılır. Önemli alanlar:</p><ul><li><b>Overwrite Existing Data Files:</b> işaretlenirse aynı adlı eski verinin üzerine yazar. <b>İşaretlemeyin</b>; eski veri geri gelmez.</li><li><b>Operator Name:</b> analizi yapanın adı; kayda geçer.</li><li><b>Sequence Comment:</b> isteğe bağlı açıklama.</li></ul>'},
 {bolum:'Kontrol',ask:'<b>Operator Name</b> kutusuna tıklayın ve adınızı yazın.',oto:1,izin:function(){return ['#ssN']},ok:function(){var e=document.getElementById('ssN');return !!e&&e.value.trim().length>=3}},
 {bolum:'Kontrol',ask:'Alttaki büyük <b>Run Sequence</b> düğmesine tıklayın. (Bu pencereyi ✔️ ile açtığınız için yalnızca kontrol yapılır.)',izin:function(){return ['#ssRun']},ok:function(){return dlgAcik('SequenceCheck.txt')},
  b:'Kontrol raporu',html:'<p>Program her satırı denetledi ve sonucu bir metin dosyasında gösterdi. Üç satırın karşısında da <b>OK</b> ve altta <b>“No errors found”</b> yazıyor.</p><p>Görebileceğiniz hatalar:</p><ul><li><b>data file already exists:</b> o klasörde aynı adlı veri var.</li><li><b>duplicate data file:</b> iki satırda aynı dosya adı.</li><li><b>HS position ≠ vial</b> (uyarı): tablodaki yuva numarası karuseldekiyle uyuşmuyor.</li></ul>'},
 {bolum:'Kontrol',ask:'Raporu <b>Close</b> düğmesiyle kapatın.',oto:1,izin:function(){return ['#desk .dlg .bts button']},ok:function(){return !dlgAcik('SequenceCheck.txt')}},
 {bolum:'Başlatma',ask:'Şimdi sekansı başlatın: <b>koşan adam</b> simgesine (Run Sequence) tıklayın.',oto:1,izin:function(){return ['#icSeq .ib[data-i="2"]']},ok:function(){return dlgAcik('Start Sequence')}},
 {bolum:'Başlatma',ask:'Açılan pencerede <b>Run Sequence</b> düğmesine tıklayın.',geriYok:1,izin:function(){return ['#ssRun']},ok:function(){return A.IC.running},
  b:'Sekans başladı',html:'<p>Ekranda üç şey değişti:</p><ul><li>Menülerin üstünde sarı şerit: <b>Sequence running … waiting for 7694E start signal</b></li><li><b>Run Status: Pre-Run</b></li><li>STOP düğmesi kırmızı</li></ul><p>Bilgisayar hazır bekliyor. Henüz hiçbir vial analiz edilmedi; analizi headspace başlatacak.</p>'},
 {bolum:'Başlatma',ask:'Headspace’in tuş takımındasınız. <b>Start</b>’a basın.',geriYok:1,view:['hskey'],keys:function(){return ['start']},ok:function(h){return !!h.run},hata:hazirHata,
  b:'Headspace başladı',html:'<p>Headspace 4 numaralı viali dengeliyor. Dengeleme bitince örneği GC’ye verecek ve aynı anda bilgisayara “başla” sinyali gönderecek.</p><p>Şimdi bilgisayara dönüp ekranı izleyeceksiniz.</p>'},
 {bolum:'Veri toplama',ask:'Enjeksiyon yapıldı; kromatogram çiziliyor. Ekranı izleyin…',bekle:1,geriYok:1,gir:function(){spd(120)},ok:function(){if(A.IC.acq&&G.run)spd(40);return !!A.IC.acq&&G.run&&G.rt>=4.2},bitince:function(){spd(0)},
  b:'Veri toplanıyor',html:'<p>Ekrana bakın:</p><ul><li><b>Run Status: Run</b>; sayaç analizin kaçıncı dakikasında olduğunu gösteriyor.</li><li>Örnek kutusunda <b>BLANK</b>, vial 4 ve veri dosyasının adı yazıyor.</li><li>Kromatogramda yaklaşık 3,8 dakikada belirgin tek bir pik var: <b>iç standart</b> (n-propanol).</li></ul><p>BLANK’te etanol piki olmamalıdır; olsaydı sistemde bulaşma var demekti.</p>'},
 {bolum:'Veri toplama',ask:'Kalan iki vial sırayla analiz ediliyor. Sekansın bitmesini bekleyin…',bekle:1,geriYok:1,gir:function(){spd(240)},ok:function(){return !A.IC.running&&A.IC.done>=3},bitince:function(){spd(120)},
  b:'Sekans tamamlandı',html:'<p>Üç vialin verisi de kaydedildi. Sarı şerit kapandı, Run Status yeniden <b>Idle</b>.</p><p>Veriler, tabloda seçilen klasörde (<b>ALKOL_DENEME</b> altında bugünün tarihi) duruyor. Sıradaki iş, bu verileri <b>Enhanced Data Analysis</b> programında değerlendirmektir.</p>'},
 {bolum:'Sınama',test:1}],
 soru:[
 ['Sekans tablosunda Vial sütununa ne yazılır?',['Örneğin hacmi','Vialin karuseldeki yuva numarası','Analiz süresi'],1,'Tablodaki numara karuseldeki yuvayla aynı olmalıdır.'],
 ['“Overwrite Existing Data Files” kutusu neden işaretlenmez?',['Aynı adlı eski verinin üzerine yazar; eski veri kaybolur','Analizi yavaşlatır','Raporu kapatır'],0,'Silinen veri geri getirilemez.'],
 ['Run Sequence’a bastınız; Run Status “Pre-Run” oldu. Sıradaki adım nedir?',['Beklemek, analiz kendiliğinden başlar','GC tuş takımında Start’a basmak','Headspace tuş takımında Start’a basmak'],2,'Bilgisayar headspace’in başla sinyalini bekler.'],
 ['BLANK kromatogramında hangi pik görülmelidir?',['Yalnızca iç standart (n-propanol)','Etanol ve metanol','Hiç pik olmamalıdır'],0,'İç standart her viale eklenir; BLANK’te etanol görülmesi bulaşma işaretidir.']]},
datani:{grup:'da',ad:'Programı tanıma ve menüler',ic:'🖥',ozet:'Dosya ağacı, veri açma, SCAN / SIM / spektrum pencereleri, araç çubuğu ve menüler.',baslik:'VERİ ANALİZİ · PROGRAMI TANIMA',view:['pc'],app:'da',
 pcKur:function(){A.setDAMethod('ALKOL1.M')},
 adim:[
 {bolum:'Giriş',b:'Enhanced Data Analysis',
  html:'<p>Bu program, toplanmış veriyi değerlendirir. Cihaza hiçbir komut göndermez; yalnızca kaydedilmiş dosyalarla çalışır. Bu yüzden burada yapacağınız hiçbir işlem analizi bozmaz.</p><p>Ekran üç kısımdır: <b>solda</b> dosya ağacı, <b>sağda</b> üç pencere, <b>üstte</b> menüler ve araç çubuğu.</p>'},
 {bolum:'Dosyalar',ask:'En üstteki <b>başlık satırına</b> tıklayın.',dok:'#appDA .ttl',
  b:'Başlık satırı',html:'<p>Başlıkta sırasıyla şunlar yazar:</p><ul><li>Yüklü <b>yöntem</b> (ALKOL1.M): hesaplamada bu yöntemin kalibrasyonu kullanılır.</li><li>Açık olan <b>veri dosyası</b>.</li><li>Dosyanın durumu: <b>Not Quantitated</b> (henüz hesaplanmadı) ya da <b>Quantitated</b>.</li></ul>'},
 {bolum:'Dosyalar',ask:'Soldaki <b>dosya ağacına</b> tıklayın.',dok:'#daTree',
  b:'Dosya ağacı',html:'<ul><li><b>methods:</b> kayıtlı yöntemler. Kalın yazılı olan, yüklü yöntemdir.</li><li><b>data:</b> veri klasörleri. Her analiz, adı <b>.D</b> ile biten ayrı bir dosyadır.</li></ul><p>Klasör adının yanındaki sayı, içindeki dosya sayısını gösterir.</p>'},
 {bolum:'Dosyalar',ask:'<b>ORNEK_SET</b> klasörüne tıklayarak klasörü açın.',izin:function(){return ['#daTree [data-fo="d:ORNEK_SET"]']},ok:function(){return !!A.DA.open['d:ORNEK_SET']},
  b:'ORNEK_SET klasörü',html:'<p>Bu klasörde tam bir analiz serisi var; derslerde bunu kullanacaksınız:</p><ul><li><b>ORN_BLANK:</b> boş kan</li><li><b>ORN_KAL_…:</b> dokuz kalibratör (0,01–0,5 g/L)</li><li><b>ORN_QC_0,25:</b> kontrol örneği</li><li><b>ORN_NUMUNE_A:</b> numune</li></ul>'},
 YUKLE('Dosyalar','ORN_KAL_0,2.D',
  'Veri açıldı','<p>Dosya adına sol tık yalnızca seçer; veriyi açmak için <b>sağ tık ▸ Load Data File</b> gerekir. Gerçek programda da böyledir.</p><p>Sağda üç pencere doldu; kromatogramda üç pik var:</p><ul><li><b>2,91 dk:</b> metanol</li><li><b>3,17 dk:</b> etanol</li><li><b>3,79 dk:</b> iç standart (n-propanol)</li></ul>'),
 {bolum:'Pencereler',ask:'Üstteki pencereye, <b>[3] TIC (data.ms)</b> kromatogramına tıklayın.',dok:'#cvC',
  b:'SCAN kromatogramı',html:'<p><b>SCAN</b> verisidir: dedektör bütün iyonları tarar. Her pikin tam kütle spektrumu buradan alınır; bu yüzden <b>tanımlama</b> (bu pik hangi madde?) için kullanılır.</p><p>Bütün iyonlar ölçüldüğü için taban çizgisi daha gürültülüdür.</p>'},
 {bolum:'Pencereler',ask:'Ortadaki pencereye, <b>[4] TIC (datasim.ms)</b> kromatogramına tıklayın.',dok:'#cvC2',
  b:'SIM kromatogramı',html:'<p><b>SIM</b> verisidir: dedektör yalnızca seçilmiş birkaç iyonu izler (metanol 31/32, etanol 29/45, n-propanol 31/41/59).</p><p>Daha az iyon ölçüldüğü için sinyal temiz ve duyarlıdır; düşük derişimler burada daha iyi görülür.</p><p>Yöntem aynı enjeksiyonda iki veriyi birden toplar.</p>'},
 {bolum:'Pencereler',ask:'Alttaki <b>[1] Spectrum</b> penceresine tıklayın.',dok:'#cvS',
  b:'Spektrum penceresi',html:'<p>Şimdilik boş. Kromatogramda bir pike <b>sağ tuşla çift tıkladığınızda</b> o pikin kütle spektrumu burada açılır.</p><p>Bunu bir sonraki bölümde yapacaksınız.</p>'},
 {bolum:'Araç çubuğu',ask:'Menülerin altındaki <b>araç çubuğuna</b> tıklayın.',dok:'#daTB',
  b:'Araç çubuğu',html:'<p>En sık kullanılan komutların kısayollarıdır. Soldan sağa:</p><ul><li>📂 veri açma · 🔁 kromatogramı yeniden çiz</li><li><b>∫</b> pikleri integre et (alan hesapla)</li><li>⧉ kromatogramları üst üste bindir</li><li>🔎 kütüphane araması</li><li>⚖ 📊 ↻ kalibrasyon kurulumu, bileşikler, güncelleme</li><li><b>Σ</b> hesapla · 📄 rapor</li></ul>'},
 {bolum:'Menüler',ask:'Menü çubuğunda <b>File</b> menüsüne tıklayın.',izin:function(){return MENU('#daMB','File')},ok:function(){return menuAcik('File','#daMB')},
  b:'File menüsü',html:'<ul><li><b>Load Data File…</b> Veri dosyası açar (ağaçtaki sağ tıkla aynı iş).</li><li><b>Print…</b> Açık pencereyi yazdırır.</li><li><b>Exit</b> Programı kapatır.</li></ul>'},
 {bolum:'Menüler',ask:'<b>Method</b> menüsüne tıklayın.',izin:function(){return MENU('#daMB','Method')},ok:function(){return menuAcik('Method','#daMB')},
  b:'Method menüsü',html:'<ul><li><b>Load Method…</b> Değerlendirmede kullanılacak yöntemi yükler. Kalibrasyon yöntemin içindedir; yanlış yöntem yüklüyse sonuç yanlış eğriyle hesaplanır.</li><li><b>Save Method</b> ve <b>Edit Method…</b> Yöntemi kaydeder ve düzenler.</li></ul>'},
 {bolum:'Menüler',ask:'<b>Chromatogram</b> menüsüne tıklayın.',izin:function(){return MENU('#daMB','Chromatogram')},ok:function(){return menuAcik('Chromatogram','#daMB')},
  b:'Chromatogram menüsü',html:'<p>Uzun bir menüdür; günlük işte şu komutlar kullanılır:</p><ul><li><b>Redraw TIC:</b> kromatogramı ilk hâline döndürür.</li><li><b>Extract Ion Chromatograms…</b> Seçtiğiniz iyonların kromatogramını ayrı ayrı çizer.</li><li><b>Integrate:</b> piklerin alanını hesaplar.</li><li><b>Integration Results…</b> Alanları tablo olarak gösterir.</li></ul>'},
 {bolum:'Menüler',ask:'<b>Spectrum</b> menüsüne tıklayın.',izin:function(){return MENU('#daMB','Spectrum')},ok:function(){return menuAcik('Spectrum','#daMB')},
  b:'Spectrum menüsü',html:'<ul><li><b>Subtract:</b> arka plan spektrumunu çıkarır.</li><li><b>Tabulate:</b> spektrumdaki iyonları ve şiddetlerini tablo olarak verir.</li><li><b>Select Library…</b> Aramada kullanılacak kütüphaneyi seçer.</li><li><b>Library Search Report…</b> Açık spektrumu kütüphanede arar ve en iyi eşleşmeleri listeler.</li></ul>'},
 {bolum:'Menüler',ask:'<b>Calibrate</b> menüsüne tıklayın.',izin:function(){return MENU('#daMB','Calibrate')},ok:function(){return menuAcik('Calibrate','#daMB')},
  b:'Calibrate menüsü',html:'<ul><li><b>Set Up Quantitation…</b> Yeni bir kalibrasyonun genel ayarları.</li><li><b>Edit Compounds…</b> Bileşikler, iyonları ve kalibrasyon eğrileri.</li><li><b>List…</b> Kalibrasyonun özeti.</li><li><b>Update…</b> Kalibratör verileriyle eğriyi günceller.</li><li><b>Clear…</b> Kalibrasyonu siler.</li></ul><p>ALKOL1.M’in kalibrasyonu doğrulanmıştır ve kilitlidir; yapısı değiştirilemez.</p>'},
 {bolum:'Menüler',ask:'<b>Quantitate</b> menüsüne tıklayın.',izin:function(){return MENU('#daMB','Quantitate')},ok:function(){return menuAcik('Quantitate','#daMB')},
  b:'Quantitate menüsü',html:'<ul><li><b>Calculate:</b> açık dosyadaki bileşiklerin derişimini kalibrasyon eğrisinden hesaplar.</li><li><b>Generate Report…</b> Sonuç raporunu açar.</li></ul><p>Sonuç almak için kullanacağınız menü budur.</p>'},
 {bolum:'Menüler',ask:'<b>Tools</b> menüsüne tıklayın.',izin:function(){return MENU('#daMB','Tools')},ok:function(){return menuAcik('Tools','#daMB')},
  b:'Tools menüsü',html:'<ul><li><b>Overlay Chromatograms…</b> Birden çok dosyanın kromatogramını üst üste çizer.</li><li><b>Reset Windows:</b> pencereleri ilk hâline döndürür.</li></ul><p>Kalan menüler: <b>Export Reports</b> sonuçları dosyaya aktarır, <b>View ▸ Instrument Control</b> veri toplama programına döner, <b>Options</b> ve <b>Help</b> ayarlar ve yardım içindir.</p>'},
 {bolum:'Menüler',ask:'En alttaki <b>durum satırına</b> tıklayın.',dok:'#daSB',
  b:'Durum satırı',html:'<p>Son yapılan işlemi yazar: “Loaded …”, “Integration complete: 3 peaks”, “Quantitation complete”.</p><p>Bir komut çalışmadıysa nedeni çoğu zaman burada görünür.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Bir veri dosyası nasıl açılır?',['Dosya adına sol tıklanır','Dosya adına sağ tıklanır ve Load Data File seçilir','Dosya sürüklenip pencereye bırakılır'],1,'Sol tık yalnızca seçer.'],
 ['SCAN ve SIM verisi arasındaki fark nedir?',['SCAN bütün iyonları tarar, SIM yalnızca seçili iyonları izler','SCAN daha duyarlıdır','İkisi aynı veridir'],0,'SCAN tanımlama, SIM duyarlı ölçüm içindir.'],
 ['Derişim hesabı hangi menüden yapılır?',['Chromatogram','Spectrum','Quantitate'],2,'Quantitate ▸ Calculate, sonra Generate Report.'],
 ['Data Analysis’te yanlış yöntem yüklüyse ne olur?',['Cihaz durur','Sonuç yanlış kalibrasyon eğrisiyle hesaplanır','Veri silinir'],1,'Kalibrasyon yöntemin içinde saklanır.']]},

dakrom:{grup:'da',ad:'Kromatogram ve spektrum',ic:'📈',ozet:'Yakınlaştırma, pik alanı, kütle spektrumu, kütüphane araması, iyon kromatogramı, üst üste bindirme.',baslik:'VERİ ANALİZİ · KROMATOGRAM',view:['pc'],app:'da',
 pcKur:function(){A.DA.open['d:ORNEK_SET']=true;A.daLoad(DOSYA('ORN_KAL_0,2.D'))},
 adim:[
 {bolum:'Giriş',b:'Kromatogram nasıl okunur?',
  html:'<p>Ekranda 0,2 g/L kalibratörün verisi açık. Kromatogramda:</p><ul><li><b>Yatay eksen</b> zamandır (dakika). Bir pikin çıktığı zamana <b>tutunma süresi</b> (R.T.) denir; aynı madde her analizde aynı zamanda çıkar.</li><li><b>Dikey eksen</b> sinyal şiddetidir.</li><li>Pikin <b>alanı</b> maddenin miktarıyla orantılıdır.</li></ul><p>Tutunma süresi “hangi madde?”, alan “ne kadar?” sorusunu yanıtlar.</p>'},
 {bolum:'Kromatogram',ask:'Yakınlaştırın: üstteki kromatogramda farenin <b>sol tuşunu basılı tutarak</b> ilk iki piki içine alacak şekilde (yaklaşık <b>2,8</b>’den <b>3,4</b>’e) sürükleyin.',izin:function(){return ['#cvC']},
  ok:function(){var r=A.DA.range;return r[0]>=2.5&&r[0]<2.9&&r[1]>3.2&&r[1]<=3.7},
  hata:function(){var r=A.DA.range;return (r[1]-r[0]<2.5)?'Aralık uygun olmadı. Kromatograma <b>sol çift tıklayarak</b> geri dönün ve 2,8 ile 3,4 arasını yeniden seçin.':''},
  b:'Yakınlaştırma',html:'<p>Seçtiğiniz aralık pencereyi doldurdu: solda metanol (2,91 dk), sağda etanol (3,17 dk). İki pik birbirinden tamamen ayrılmış; aralarında sinyal taban çizgisine iniyor.</p><p>Geri dönmek için kromatograma <b>sol çift tıklanır</b>.</p>'},
 {bolum:'Kromatogram',ask:'Araç çubuğundaki <b>∫</b> (Integrate) simgesine tıklayın.',izin:function(){return ['#daTB span[data-i="2"]']},ok:function(){return A.DA.integ},
  b:'İntegrasyon',html:'<p>Program her pikin altındaki alanı hesapladı:</p><ul><li>Pik tepesindeki sayı <b>tutunma süresi</b>dir.</li><li>Pikin altındaki kırmızı çizgi <b>taban çizgisi</b>dir; alan, pik ile bu çizgi arasında kalan bölgedir.</li></ul><p>Taban çizgisi yanlış çizilirse alan, dolayısıyla sonuç da yanlış olur. Bu yüzden integrasyon her zaman gözle kontrol edilir.</p>'},
 {bolum:'Kromatogram',ask:'Alanları tablo olarak görün: <b>Chromatogram</b> menüsünü açın ve <b>Integration Results…</b> komutuna tıklayın.',izin:function(){return MENU('#daMB','Chromatogram','Integration Results...')},ok:function(){return dlgAcik('Integration Results')},
  b:'Integration Results',html:'<p>Her satır bir piktir. Önemli sütunlar:</p><ul><li><b>R.T.:</b> tutunma süresi</li><li><b>peak height:</b> pik yüksekliği</li><li><b>corr. area:</b> düzeltilmiş alan (hesaplamada kullanılan değer)</li><li><b>% of total:</b> pikin toplam alandaki payı</li></ul>'},
 {bolum:'Kromatogram',ask:'Tabloyu <b>Close</b> ile kapatın.',oto:1,izin:function(){return ['#desk .dlg .bts button']},ok:function(){return !dlgAcik('Integration Results')}},
 {bolum:'Spektrum',ask:'Etanol pikinin (<b>3,170</b>) tepesine, üstteki kromatogramda <b>sağ tuşla çift tıklayın</b>.',izin:function(){return ['#cvC']},
  ok:function(){var D=A.DA;return !!D.spec&&D.specSrc==='scan'&&Math.abs(D.scanT-3.17)<.04},
  hata:function(){var D=A.DA,r=D.range;if(r[1]-r[0]>2||r[0]>3.1||r[1]<3.25)return 'Etanol piki görünmüyor. Sol çift tıklayıp 2,8–3,4 aralığını yeniden seçin.';return D.spec&&D.specSrc==='scan'&&Math.abs(D.scanT-3.17)>=.04?'Bu, '+D.scanT.toFixed(2).replace('.',',')+' dakikadaki spektrum. Etanol piki 3,17 dakikada; tepesine sağ çift tıklayın.':''},
  b:'Kütle spektrumu',html:'<p>Alttaki pencerede etanolün kütle spektrumu açıldı. Her çizgi bir iyondur; yatay eksen iyonun kütlesi (m/z), dikey eksen şiddetidir.</p><ul><li><b>m/z 31:</b> en yüksek iyon (hedef iyon)</li><li><b>m/z 45</b> ve <b>46:</b> etanole özgü iyonlar (niteleyiciler)</li></ul><p>Bu desen etanolün parmak izidir. Metanolde 45 ve 46 yoktur; iki madde böyle ayırt edilir.</p>'},
 {bolum:'Kütüphane',ask:'Kütüphaneyi seçin: <b>Spectrum</b> menüsünü açın ve <b>Select Library…</b> komutuna tıklayın.',oto:1,izin:function(){return MENU('#daMB','Spectrum','Select Library...')},ok:function(){return dlgAcik('Library Search Parameters')}},
 {bolum:'Kütüphane',ask:'1. satırdaki <b>Browse…</b> düğmesine tıklayın.',oto:1,izin:function(){return ['#desk .dlg [data-b="0"]']},ok:function(){return dlgAcik('Select Library')}},
 {bolum:'Kütüphane',ask:'Listeden <b>W9N11.L</b> kütüphanesini seçin ve <b>Open</b> düğmesine tıklayın.',oto:1,izin:function(){return ['#slS','#slO']},ok:function(){var e=document.getElementById('lb0');return !dlgAcik('Select Library')&&!!e&&/W9N11\.L$/i.test(e.value)},
  hata:function(){var e=document.getElementById('lb0');return !dlgAcik('Select Library')&&e&&e.value&&!/W9N11\.L$/i.test(e.value)?'Başka bir kütüphane seçildi. Browse… ile yeniden açıp W9N11.L seçin.':''}},
 {bolum:'Kütüphane',ask:'Pencereyi <b>OK</b> ile kapatın.',izin:function(){var e=document.getElementById('lb0');return e&&!/W9N11\.L$/i.test(e.value)?['#desk .dlg [data-b="0"]','#slS','#slO']:['#lbOK']},ok:function(){return /W9N11/i.test(A.DA.lib[0]||'')&&!dlgAcik('Library Search Parameters')},
  b:'Kütüphane seçildi',html:'<p><b>W9N11.L</b>, Wiley ve NIST kütüphanelerinin birleşimidir; yüz binlerce maddenin kütle spektrumunu içerir.</p><p>Program, açık spektrumu bu kayıtlarla karşılaştırıp en çok benzeyenleri listeler.</p>'},
 {bolum:'Kütüphane',ask:'Aramayı yapın: <b>Spectrum</b> menüsünü açın ve <b>Library Search Report…</b> komutuna tıklayın.',izin:function(){return MENU('#daMB','Spectrum','Library Search Report...')},ok:function(){return dlgAcik('Library Search Report')},
  b:'Kütüphane sonucu',html:'<p>İlk sırada <b>Ethanol</b> var. <b>Qual</b> sütunu eşleşme kalitesidir (en çok 99); 80 ve üstü iyi bir eşleşmedir.</p><p>Kütüphane eşleşmesi tek başına kanıt sayılmaz. Bir pikin kimliği üç şeyle birlikte doğrulanır: <b>tutunma süresi</b>, <b>kütle spektrumu</b> ve aynı koşulda çalışılmış <b>standart</b>.</p>'},
 {bolum:'Kütüphane',ask:'Raporu <b>Close</b> ile kapatın.',oto:1,izin:function(){return ['#desk .dlg .bts button']},ok:function(){return !dlgAcik('Library Search Report')}},
 {bolum:'İyonlar',ask:'Kromatograma <b>sol çift tıklayarak</b> tam görünüme dönün.',oto:1,izin:function(){return ['#cvC']},ok:function(){var r=A.DA.range;return r[1]-r[0]>2}},
 {bolum:'İyonlar',ask:'<b>Chromatogram</b> menüsünü açın ve <b>Extract Ion Chromatograms…</b> komutuna tıklayın.',oto:1,izin:function(){return MENU('#daMB','Chromatogram','Extract Ion Chromatograms...')},ok:function(){return dlgAcik('Extract Ion Chromatograms')}},
 {bolum:'İyonlar',ask:'Kutularda 31, 45 ve 59 yazıyor. <b>OK</b> düğmesine tıklayın.',izin:function(){return ['#eOK']},ok:function(){return !!A.DA.eic&&!dlgAcik('Extract Ion Chromatograms')},
  b:'İyon kromatogramları',html:'<p>Her renk tek bir iyonun kromatogramıdır:</p><ul><li><b>m/z 31:</b> üç pikte de var (üç alkolün ortak iyonu).</li><li><b>m/z 45:</b> yalnızca etanolde güçlü.</li><li><b>m/z 59:</b> yalnızca n-propanolde.</li></ul><p>Niteleyici iyonların mantığı budur: doğru zamanda çıkan pikte, doğru iyonlar doğru oranda bulunmalıdır.</p>'},
 {bolum:'Karşılaştırma',ask:'Araç çubuğundaki <b>⧉</b> (Overlay) simgesine tıklayın.',oto:1,izin:function(){return ['#daTB span[data-i="3"]']},ok:function(){return dlgAcik('Overlay Chromatograms')}},
 {bolum:'Karşılaştırma',ask:'<b>Kalibratörleri seç</b> düğmesine, ardından <b>OK</b> düğmesine tıklayın.',
  izin:function(){return document.querySelectorAll('#desk .dlg [data-f]:checked').length>=5?['#oOK']:['#oCal']},ok:function(){return !!A.DA.overlay&&A.DA.overlay.length>=5},
  b:'Kalibratörler üst üste',html:'<p>Dokuz kalibratörün kromatogramı aynı pencerede:</p><ul><li><b>Metanol ve etanol pikleri</b> derişim arttıkça büyüyor.</li><li><b>İç standart piki</b> (3,79 dk) hepsinde aynı boyda.</li></ul><p>İç standardın görevi budur: her viale aynı miktarda eklenir. Enjeksiyonlar arasında küçük farklar olsa bile etanol alanının iç standart alanına <b>oranı</b> değişmez; hesaplama bu oranla yapılır.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Tutunma süresi (R.T.) neyi gösterir?',['Maddenin miktarını','Pikin kolondan çıktığı zamanı; maddenin kimliği için ipucudur','Analizin toplam süresini'],1,'Miktarı pikin alanı gösterir.'],
 ['Bir pikin kütle spektrumu nasıl açılır?',['Pike sol tıklanır','Menüden Integrate seçilir','Pike sağ tuşla çift tıklanır'],2,'Spektrum alttaki pencerede açılır.'],
 ['Kütüphane araması “Ethanol, Qual 95” verdi. Bu tek başına yeterli midir?',['Evet, kimlik kesinleşmiştir','Hayır; tutunma süresi ve standartla birlikte değerlendirilir','Hayır, kalite 100 olmalıdır'],1,'Kütüphane eşleşmesi destekleyici kanıttır.'],
 ['Kalibratörler üst üste bindirildiğinde iç standart piki neden hep aynı boydadır?',['Her viale aynı miktarda eklendiği için','Dedektör onu ölçmediği için','Kolonda tutunmadığı için'],0,'Hesaplama etanol/iç standart alan oranıyla yapılır.']]},

dasonuc:{grup:'da',ad:'Kalibrasyon ve sonuç',ic:'📄',ozet:'Kalibrasyon eğrisi, QC kontrolü, numunenin hesaplanması ve sonuç raporunun okunması.',baslik:'VERİ ANALİZİ · SONUÇ',view:['pc'],app:'da',
 pcKur:function(){A.DA.open['d:ORNEK_SET']=true;A.DA._ecTab='id';A.daLoad(DOSYA('ORN_KAL_0,2.D'))},
 adim:[
 {bolum:'Giriş',b:'Derişim nasıl hesaplanır?',
  html:'<p>Cihaz doğrudan “g/L” ölçmez; pik alanı ölçer. Alanı derişime çeviren şey <b>kalibrasyon eğrisi</b>dir:</p><ul><li>Derişimi bilinen kalibratörler analiz edilir.</li><li>Her birinde <b>etanol alanı / iç standart alanı</b> oranı hesaplanır.</li><li>Bu oranlar derişime karşı çizilir: bir doğru elde edilir.</li><li>Numunenin oranı bu doğruya yerleştirilir ve derişimi okunur.</li></ul><p>ALKOL1.M yönteminde dokuz seviyeli (0,01–0,5 g/L), doğrulanmış bir kalibrasyon hazırdır.</p>'},
 {bolum:'Kalibrasyon',ask:'<b>Calibrate</b> menüsünü açın ve <b>Edit Compounds…</b> komutuna tıklayın.',izin:function(){return MENU('#daMB','Calibrate','Edit Compounds...')},ok:function(){return dlgAcik('Edit Compounds --')},
  b:'Edit Compounds',html:'<p>Solda yöntemdeki üç bileşik listelenir:</p><ul><li>🟨 <b>n-propanol:</b> iç standart (ISTD)</li><li>🟦 <b>metanol</b> ve <b>etanol:</b> hedef bileşikler</li></ul><p>Sağda seçili bileşiğin tanımı yer alır. Şu an iç standart seçili.</p>'},
 {bolum:'Kalibrasyon',ask:'Soldaki listeden <b>etanol</b> satırına tıklayın.',izin:function(){return ['#ecT [data-i="2"]']},ok:function(){return dlgAcik('Edit Compounds -- Compound #3')},
  b:'Etanolün tanımı',html:'<p>Program bir piki şu ölçütlerle “etanol” olarak tanır:</p><ul><li><b>Ret Time 3,170</b> ve <b>± 0,5 dk</b> pencere: pik bu aralıkta çıkmalı.</li><li><b>Target 31:</b> alanı ölçülen iyon.</li><li><b>Q1 45</b> ve <b>Q2 46:</b> niteleyici iyonlar. Hedef iyona oranları beklenen değerin ± %20’si içinde olmalı.</li></ul><p>Bu ölçütlerden biri tutmazsa sonuç raporda işaretlenir.</p>'},
 {bolum:'Kalibrasyon',ask:'Üstteki sekmelerden <b>Calibration</b> sekmesine tıklayın.',izin:function(){return ['#desk .dlg [data-tab="cal"]']},ok:function(){return A.DA._ecTab==='cal'&&dlgAcik('Edit Compounds -- Compound #3')},
  b:'Kalibrasyon eğrisi',html:function(){var c=A.DA.cal.cmp[2],f=A.fit?A.fit(c):null;return '<p>Solda seviyeler, altta eğri görünüyor. Her nokta bir kalibratördür; doğru bu noktalardan geçer.</p><ul><li><b>Linear term:</b> doğrunun eğimi</li><li><b>Coef of Det (r²):</b> noktaların doğruya uyumu'+(f?': <b>'+f.r2.toFixed(4).replace('.',',')+'</b>':'')+'</li></ul><p>Kabul ölçütü <b>r² ≥ 0,995</b>. Bu değer sağlanmıyorsa kalibrasyon kabul edilmez ve numune sonucu verilmez.</p>'}},
 {bolum:'Kalibrasyon',ask:'Pencereyi <b>Cancel</b> ile kapatın.',oto:1,izin:function(){return ['#ecC']},ok:function(){return !dlgAcik('Edit Compounds')},bitince:function(){A.DA._ecTab='id'}},
 YUKLE('Kontrol örneği','ORN_QC_0,25.D',
  'Önce kontrol örneği','<p>Numuneden önce <b>QC</b> (kontrol) örneğine bakılır. QC’nin derişimi bilinir: <b>0,25 g/L</b>.</p><p>Program bu örnek için doğru değeri buluyorsa kalibrasyona güvenilir; bulamıyorsa numune sonuçları da verilmez.</p>'),
 {bolum:'Kontrol örneği',ask:'Hesaplayın: <b>Quantitate</b> menüsünü açın ve <b>Calculate</b> komutuna tıklayın.',izin:function(){return MENU('#daMB','Quantitate','Calculate')},ok:function(){return dlgAcik('Quantitation Report')},
  b:'QC raporu',html:function(){var e=ETOH(),c=e&&e.conc!=null?e.conc:null,ok=c!=null&&Math.abs(c-.25)<=.0375;return '<p>Rapor açıldı. <b>Target Compounds</b> bölümünde etanol satırına bakın:</p><ul><li><b>R.T.:</b> pikin çıktığı zaman</li><li><b>QIon:</b> hedef iyon (31)</li><li><b>Response:</b> pik alanı</li><li><b>Conc:</b> hesaplanan derişim'+(c!=null?': <b>'+c.toFixed(3).replace('.',',')+' g/L</b>':'')+'</li></ul><p>Kabul aralığı nominal değerin ± %15’idir: 0,2125–0,2875 g/L. '+(c!=null?(ok?'Sonuç aralığın içinde: <b>QC geçti</b>, numuneye geçilebilir.':'Sonuç aralığın dışında: QC kaldı.'):'')+'</p>'}},
 {bolum:'Kontrol örneği',ask:'Raporu <b>Close</b> ile kapatın.',oto:1,izin:function(){return ['#desk .dlg .bts button']},ok:function(){return !dlgAcik('Quantitation Report')}},
 YUKLE('Numune','ORN_NUMUNE_A.D',
  'Numune açıldı','<p>Kromatogramda etanol piki (3,17 dk) ve iç standart (3,79 dk) belirgin. Öncesinde çok küçük pikler de var; rapor bunların ne olduğunu gösterecek.</p>'),
 {bolum:'Numune',ask:'Araç çubuğundaki <b>Σ</b> (Calculate) simgesine tıklayın.',izin:function(){return ['#daTB span[data-i="8"]']},ok:function(){return dlgAcik('Quantitation Report')},
  b:'Numune raporu',html:function(){var e=ETOH(),m=METOH();return '<p>Etanol sonucu: <b>'+(e&&e.conc!=null?e.conc.toFixed(3).replace('.',',')+' g/L':'hesaplanamadı')+'</b>. Adli raporda kan alkolü g/L olarak verilir (yaklaşık promil).</p><p>Raporu okurken şunlara bakın:</p><ul><li><b>Qvalue:</b> niteleyici iyon oranlarının uyumu (en çok 100). Yanında <b>#</b> varsa oran tutmamıştır; sonuç kontrol edilmeden raporlanmaz.</li><li><b>Dev(Min):</b> iç standardın beklenen zamandan sapması.</li>'+(m?'<li>Metanol satırı: <b>'+m+'</b></li>':'')+'</ul><p>Kısaltmalar: <b>&lt;LOQ</b> pik var ama en düşük kalibratörün altında; <b>N.D.</b> tespit edilmedi; <b>N.A.</b> beklenen zamanda uygun pik bulunamadı.</p>'}},
 {bolum:'Numune',ask:'Raporu <b>Close</b> ile kapatın.',oto:1,izin:function(){return ['#desk .dlg .bts button']},ok:function(){return !dlgAcik('Quantitation Report')}},
 {bolum:'Kabul ölçütleri',b:'Sonuç ne zaman raporlanır?',
  html:'<p>Bir numune sonucu ancak şunların hepsi sağlanıyorsa raporlanır:</p><ul><li><b>BLANK temiz:</b> boş kanda etanol yok.</li><li><b>Kalibrasyon:</b> r² ≥ 0,995.</li><li><b>QC:</b> nominal değerin ± %15’i içinde.</li><li><b>Tanımlama:</b> tutunma süresi pencerenin içinde, niteleyici oranları uygun (# yok).</li><li><b>Aralık:</b> sonuç kalibrasyon aralığının içinde. Üstündeyse numune seyreltilip yeniden çalışılır.</li></ul><p>Bunlardan biri sağlanmıyorsa sonuç verilmez; neden araştırılır ve analiz tekrarlanır.</p>'},
 {bolum:'Sınama',test:1}],
 soru:[
 ['Hesaplamada etanol alanı neye oranlanır?',['Metanol alanına','İç standart (n-propanol) alanına','Toplam alana'],1,'Oran, enjeksiyon farklarını dengeler.'],
 ['Kalibrasyon eğrisi için kabul ölçütü hangisidir?',['r² ≥ 0,995','r² ≥ 0,90','Eğim = 1'],0,'Ölçüt sağlanmıyorsa numune sonucu verilmez.'],
 ['0,25 g/L’lik QC için hangi sonuç kabul edilir?',['0,20 g/L','0,31 g/L','0,26 g/L'],2,'Kabul aralığı 0,2125–0,2875 g/L (± %15).'],
 ['Raporda etanolün Qvalue değerinin yanında # işareti var. Ne yapılır?',['Sonuç olduğu gibi raporlanır','Sonuç kontrol edilmeden raporlanmaz; spektrum incelenir','İşaret silinir'],1,'# işareti, niteleyici iyon oranının tutmadığını gösterir.']]}
};
var GRUP={hs:{ad:'HEADSPACE ÖRNEKLEYİCİ',alt:'Agilent 7694E',son:'Headspace örnekleyicinin bütün bölümlerini tamamladınız.',sira:['hstani','hsyukle','hstus','hsbaslat']},
 gc:{ad:'GC-MS',alt:'Agilent 6890N · 5975B',son:'GC-MS’in bütün bölümlerini tamamladınız.',sira:['gctani','gctus','pctani','pcsekans']},
 da:{ad:'VERİ ANALİZİ',alt:'Enhanced Data Analysis',son:'Veri analizinin bütün bölümlerini tamamladınız.',sira:['datani','dakrom','dasonuc']}};
var FAZ=[['Dengeleme','4,0'],['Basınç','0,20'],['Loop dolar','0,20'],['Loop denge','0,05'],['Enjeksiyon','0,50']];
var L=DERS[D],ADIM=L?L.adim:[],SORU=L?L.soru:[],GR=GRUP[L?(L.grup||'hs'):(GRUP[D]?D:'hs')],SIRA=GR.sira,GID=L?(L.grup||'hs'):(GRUP[D]?D:'hs');

/* ---------- görünüm ---------- */
var css=document.createElement('style');
css.textContent=
'body.ders #nav,body.ders .mentor,body.ders .side>*:not(#dersP),body.ders #egCubuk{display:none!important}'+
'body.ders:not(.dersGeri) .stage .back{display:none!important}body.ders.dersYuk #loadP{display:none!important}'+
'body.ders .main{grid-template-columns:minmax(0,1fr) minmax(340px,440px)}'+
'body.ders .side{padding:14px;gap:10px}'+
'body.ders.dersPC .main{grid-template-columns:minmax(0,1fr) 350px}'+
'body.dersPC .mbar>div:not(.dersH){pointer-events:none}body.dersPC .mbar>div.dersH .dd{pointer-events:none}body.dersPC .mbar .dd>div.dersH{pointer-events:auto;background:#FFE9A8}'+
'body.dersPC #desk .dersH{outline-width:4px!important;outline-offset:1px;position:relative;z-index:45}body.dersPC #desk .mbar>div.dersH{position:relative;z-index:auto}'+
'@media (max-width:1000px){body.ders .main,body.ders.dersPC .main{grid-template-columns:1fr}}'+
'#dersM{display:none;position:fixed;z-index:60;left:8px;right:8px;bottom:8px;background:#F1F6F7;color:#16242A;border-left:5px solid #F2B632;border-radius:12px;padding:10px 12px;font-size:15px;line-height:1.35;box-shadow:0 8px 24px rgba(0,0,0,.5)}'+
'@media (max-width:1000px){#dersM.on{display:block}}'+
'#dersP{display:grid;gap:10px;min-width:0;grid-template-columns:minmax(0,1fr);font-size:15px;line-height:1.45;color:#D7E4E7}'+
'#dersP .ust{display:flex;justify-content:space-between;align-items:baseline;gap:8px}'+
'#dersP .ust b{font:700 19px "Barlow Condensed",sans-serif;color:#EAF2F3;letter-spacing:.02em}'+
'#dersP .ust span{font:600 11px "IBM Plex Mono",monospace;color:#9BB0B6;white-space:nowrap}'+
'#dersP .bol{display:flex;gap:4px}#dersP .bol i{flex:1 1 0;min-width:0;font:600 10px "IBM Plex Mono",monospace;font-style:normal;text-align:center;color:#6F858C;border-top:3px solid #33444C;padding-top:4px;letter-spacing:.02em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'#dersP .bol i.g{border-color:#2DBE5B;color:#8FE0A8}#dersP .bol i.s{border-color:#2BD9C0;color:#EAF2F3}'+
'#dersP .ask{background:#F1F6F7;color:#16242A;border-radius:12px;padding:11px 13px;border-left:5px solid #F2B632;font-size:16px}'+
'#dersP .ask.tamam{border-left-color:#2DBE5B;background:#E6F6EB}'+
'#dersP .ask small{display:block;margin-top:5px;color:#B3261E;font-weight:600;font-size:13.5px}'+
'#dersP .kart{background:#25333A;border-radius:12px;padding:12px 13px;display:grid;gap:8px}'+
'#dersP .kart h4{font:700 18px "Barlow Condensed",sans-serif;color:#2BD9C0;letter-spacing:.02em;margin:0}'+
'#dersP .kart .dg{font:600 13px "IBM Plex Mono",monospace;color:#F2B632}'+
'#dersP .kart dl{display:grid;gap:7px;margin:0}#dersP .kart dt{font:600 10.5px "IBM Plex Mono",monospace;letter-spacing:.08em;color:#9BB0B6}#dersP .kart dd{margin:0}'+
'#dersP .kart ul{margin:0 0 0 18px;display:grid;gap:3px}#dersP .kart p+p,#dersP .kart p+ul,#dersP .kart ul+p{margin-top:7px}'+
'#dersP .cev{display:grid;gap:4px}#dersP .cev .ser{display:flex;gap:3px}'+
'#dersP .cev .ser div{flex:1;background:#33444C;border-radius:6px;padding:5px 2px;text-align:center;font-size:11px;line-height:1.2;color:#C9D8DC;min-width:0}'+
'#dersP .cev .ser div b{display:block;font:600 11px "IBM Plex Mono",monospace;color:#9BB0B6}'+
'#dersP .cev .ser div.on{background:#2BD9C0;color:#062126}#dersP .cev .ser div.on b{color:#062126}'+
'#dersP .cev .cy{font:600 11px "IBM Plex Mono",monospace;color:#9BB0B6;text-align:center;border:1px dashed #4A5F68;border-top:0;border-radius:0 0 8px 8px;padding:3px}'+
'#dersP .cev .cy.on{color:#062126;background:#2BD9C0;border-color:#2BD9C0}'+
'#dersP .alt{display:flex;gap:8px;flex-wrap:wrap}'+
'#dersP button{border:0;border-radius:10px;padding:10px 14px;font:700 14.5px "Source Sans 3",system-ui,sans-serif;background:#33444C;color:#EAF2F3;cursor:pointer}'+
'#dersP button.p{background:#2F7DE1;flex:1}#dersP button:disabled{opacity:.4;cursor:default}'+
'#dersP button.ince{flex:1;background:none;color:#9BB0B6;font-weight:600;font-size:13px;padding:4px}'+
'#dersP .sec{display:grid;gap:6px}#dersP .sec button{text-align:left;font-weight:600;background:#33444C}'+
'#dersP .sec button.d{background:#1F7A3D}#dersP .sec button.y{background:#8E2A2E}'+
'#dersP .acl{font-size:13.5px;color:#B9CBD0}'+
'#dersP .liste{display:grid;gap:8px}'+
'#dersP .liste button{display:grid;grid-template-columns:30px 1fr auto;gap:10px;align-items:center;text-align:left;background:#25333A;padding:12px}'+
'#dersP .liste button:hover{background:#2D3E46}#dersP .liste .no{width:30px;height:30px;border-radius:50%;background:#33444C;display:grid;place-items:center;font:700 13px "IBM Plex Mono",monospace}'+
'#dersP .liste button.bitti .no{background:#2DBE5B;color:#062126}'+
'#dersP .liste b{display:block;font:700 17px "Barlow Condensed",sans-serif;letter-spacing:.02em}#dersP .liste small{display:block;font-weight:400;font-size:13px;color:#B9CBD0;line-height:1.35}'+
'#dersP .liste em{font:600 11px "IBM Plex Mono",monospace;font-style:normal;color:#7FDCD0;white-space:nowrap}'+
'.hs.dersK{animation:dersK 1.1s infinite;z-index:3}@keyframes dersK{0%,100%{box-shadow:0 0 0 2px rgba(242,182,50,.35) inset}50%{box-shadow:0 0 0 4px #F2B632 inset,0 0 14px rgba(242,182,50,.9);background:rgba(242,182,50,.22)}}'+
'.dersH{outline:3px solid #F2B632!important;outline-offset:2px;animation:dersD 1.1s infinite}'+
'body.ders .hs.pulse:not(.dersK){animation:none}'+
'body.ders #car g:not(.dersH) circle{stroke:#55666E;stroke-width:1.5}#car g.dersH{outline:none!important;animation:none}#car g.dersH circle{stroke:#F2B632;stroke-width:5}'+
'.disp.dersD{outline:3px solid #F2B632;z-index:2;outline-offset:2px;animation:dersD 1.1s infinite}@keyframes dersD{50%{outline-color:rgba(242,182,50,.25)}}'+
'@media (prefers-reduced-motion:reduce){.hs.dersK,.dersH,.disp.dersD{animation:none}.hs.dersK{box-shadow:0 0 0 4px #F2B632 inset}}';
document.head.appendChild(css);

function oku(){try{return JSON.parse(localStorage.getItem(LS)||'{}')}catch(e){return {}}}
function kayit(){try{var o=oku();o[D]={bitti:1,puan:puan,soru:SORU.length,t:Date.now()};localStorage.setItem(LS,JSON.stringify(o))}catch(e){}}
var bolumler=[];ADIM.forEach(function(a){if(bolumler.indexOf(a.bolum)<0)bolumler.push(a.bolum)});
var cikis='<div class="alt">'+(L?'<button class="ince" id="dListe">☰ Bölümler</button>':'')+(PILOT?'':'<button class="ince" id="dSerbest">Dersten çık · serbest kullanım</button>')+'</div>';
function cikisBagla(){var l=P.querySelector('#dListe'),s=P.querySelector('#dSerbest');if(l)l.onclick=function(){ac(GID)};if(s)s.onclick=function(){location.href=location.pathname}}

/* ---------- bölüm listesi ---------- */
function liste(){
 var o=oku(),h='<div class="ust"><b>'+GR.ad+'</b><span>'+GR.alt+'</span></div>';
 h+='<div class="acl">Cihazı kısa bölümler hâlinde öğrenin. Sırayla ilerlemeniz önerilir; her bölüm 5–10 dakika sürer.</div><div class="liste">';
 SIRA.forEach(function(id,k){var d=DERS[id],b=o[id]&&o[id].bitti;
  h+='<button data-d="'+id+'" class="'+(b?'bitti':'')+'"><span class="no">'+(b?'✓':k+1)+'</span><span><b>'+d.ad+'</b><small>'+d.ozet+'</small></span><em>'+(b?'Tekrarla':'Başla ›')+'</em></button>'});
 if(PILOT)['hs','gc','da'].forEach(function(dg){if(dg!==GID)h+='<button data-d="'+dg+'"><span class="no">⇄</span><span><b>'+GRUP[dg].ad+' dersleri</b><small>Bu grubun bölümlerine geçin.</small></span><em>Aç ›</em></button>'});
 P.innerHTML=h+'</div>'+cikis;cikisBagla();
 P.querySelectorAll('[data-d]').forEach(function(b){b.onclick=function(){ac(b.dataset.d)}})}

/* ---------- ders ---------- */
function serit(faz){
 return '<div class="cev"><div class="ser">'+FAZ.map(function(f,k){return '<div class="'+(faz===k?'on':'')+'">'+f[0]+'<b>'+f[1]+'</b></div>'}).join('')+'</div><div class="cy'+(faz==='c'?' on':'')+'">GC CYCLE TIME · iki enjeksiyon arası 11,0 dk</div></div>'}
function program(seg){
 /* fırın programı: 35 °C 2 dk → 50 °C/dk → 150 °C 0,5 dk (toplam 4,8 dk) */
 var X=function(t){return 34+t/4.8*222},Y=function(T){return 92-(T-35)/115*66},p=[[0,35],[2,35],[4.3,150],[4.8,150]],h='<svg viewBox="0 0 300 118" style="width:100%;height:auto;display:block" role="img" aria-label="Fırın sıcaklık programı">';
 h+='<line x1="34" y1="92" x2="290" y2="92" stroke="#4A5F68"/><line x1="34" y1="16" x2="34" y2="92" stroke="#4A5F68"/>';
 for(var k=0;k<3;k++)h+='<line x1="'+X(p[k][0])+'" y1="'+Y(p[k][1])+'" x2="'+X(p[k+1][0])+'" y2="'+Y(p[k+1][1])+'" stroke="'+(seg===k?'#2BD9C0':'#6F858C')+'" stroke-width="'+(seg===k?5:2.5)+'" stroke-linecap="round"/>';
 var T=function(x,y,t,a){return '<text x="'+x+'" y="'+y+'" font-size="10.5" fill="#C9D8DC" font-family="IBM Plex Mono,monospace" text-anchor="'+(a||'middle')+'">'+t+'</text>'};
 h+=T(30,Y(35)+4,'35','end')+T(30,Y(150)+4,'150','end')+T(34,10,'°C','middle')+T(X(0),106,'0')+T(X(2),106,'2,0')+T(X(4.3),106,'4,3')+T(X(4.8),106,'4,8')+T(X(4.8)+14,106,'dk','start')+T(X(1),Y(35)-8,'bekleme')+T(X(3.15)-30,Y(92),'50 °C/dk')+T(X(4.55)-6,Y(150)-8,'son');
 return '<div class="cev">'+h+'</svg></div>'}
function aciklama(a){
 var h='<div class="kart"><h4>'+a.b+'</h4>'+(a.deger?'<div class="dg">'+(L.etiket||'ALKOL2.M')+': '+a.deger+'</div>':'');
 if(a.html)h+='<div>'+(typeof a.html==='function'?a.html():a.html)+'</div>';
 else h+='<dl><div><dt>NEDİR?</dt><dd>'+a.ne+'</dd></div><div><dt>'+(a.son?'NE İŞE YARAR?':'NEDEN BU DEĞER?')+'</dt><dd>'+a.neden+'</dd></div><div><dt>'+(a.son||'YANLIŞ AYARLANIRSA')+'</dt><dd>'+a.yanlis+'</dd></div></dl>';
 if(a.cevrim||a.faz!==undefined)h+=serit(a.faz);
 if(a.prog!==undefined)h+=program(a.prog);
 return h+'</div>'}
function ciz(){
 var a=ADIM[i],bi=bolumler.indexOf(a.bolum),h='';
 h+='<div class="ust"><b>'+L.baslik+'</b><span>'+(i+1)+' / '+ADIM.length+'</span></div>';
 h+='<div class="bol">'+bolumler.map(function(b,k){return '<i class="'+(k<bi?'g':k===bi?'s':'')+'">'+b+'</i>'}).join('')+'</div>';
 if(a.test){h+=test()}
 else{
  if(a.ask)h+='<div class="ask'+(gecti?' tamam':'')+'">'+(gecti?(a.bekle?'✓ Açıklamayı okuyun, sonra devam edin.':'✓ Doğru. Açıklamayı okuyun, sonra devam edin.'):a.ask)+(uyari&&!gecti?'<small>'+uyari+'</small>':'')+'</div>';
  if(!a.ask||gecti)h+=aciklama(a);
  else if(a.faz!==undefined)h+=serit(a.faz);
  else if(a.prog!==undefined)h+=program(a.prog);
  h+='<div class="alt"><button id="dGeri"'+(i&&!a.geriYok?'':' disabled')+'>‹ Geri</button><button class="p" id="dIleri"'+(a.ask&&!gecti?' disabled':'')+'>Devam ›</button></div>'}
 h+=cikis;P.innerHTML=h;cikisBagla();
 var m=document.getElementById('dersM'),dar=matchMedia('(max-width:1000px)').matches,bekle=!!a.ask&&!gecti;
 if(m){m.className=bekle?'on':'';m.innerHTML=bekle?a.ask+(uyari?'<br><b style="color:#B3261E">'+uyari+'</b>':''):''}
 if(dar&&kaydir){kaydir=false;(bekle?document.getElementById(S.view==='pc'?'pcW':S.view==='hslid'&&!a.hot&&a.sec?'loadP':'stageW'):P).scrollIntoView({block:'start',behavior:'smooth'})}
 var g=P.querySelector('#dGeri'),n=P.querySelector('#dIleri');
 if(g)g.onclick=function(){git(i-1)};if(n)n.onclick=function(){git(i+1)};
 P.querySelectorAll('[data-c]').forEach(function(b){b.onclick=function(){if(cevap!==null)return;cevap=+b.dataset.c;if(cevap===SORU[sn][2])puan++;ciz()}});
 var sd=P.querySelector('#dSoru');if(sd)sd.onclick=function(){sn++;cevap=null;if(sn>=SORU.length)kayit();ciz()};
 var tk=P.querySelector('#dTekrar');if(tk)tk.onclick=function(){ac(D)};
 var sr=P.querySelector('#dSonraki');if(sr)sr.onclick=function(){ac(sr.dataset.d)};
 var eg=P.querySelector('#dEgitim');if(eg)eg.onclick=function(){location.href=BASE+'index.html#egitim'}}
function test(){
 if(sn>=SORU.length){var k=SIRA.indexOf(D),sonra=SIRA[k+1];
  return '<div class="kart"><h4>Bölüm tamamlandı</h4><div class="dg">'+puan+' / '+SORU.length+' doğru</div><div><p><b>'+L.ad+'</b> bölümünü bitirdiniz.</p>'+(puan<SORU.length?'<p>Yanlış yanıtladığınız konular için bölümü yeniden izleyebilirsiniz.</p>':'')+(sonra?'<p>Sıradaki bölüm: <b>'+DERS[sonra].ad+'</b>.</p>':'<p>'+GR.son+'</p>')+'</div></div><div class="alt"><button id="dTekrar">↺ Baştan</button>'+(sonra?'<button class="p" id="dSonraki" data-d="'+sonra+'">Sonraki bölüm ›</button>':PILOT?'<button class="p" id="dSonraki" data-d="'+GID+'">Bölümler ›</button>':'<button class="p" id="dEgitim">Eğitimlere dön ›</button>')+'</div>'}
 var s=SORU[sn],h='<div class="kart"><h4>Soru '+(sn+1)+' / '+SORU.length+'</h4><div>'+s[0]+'</div><div class="sec">';
 s[1].forEach(function(c,k){h+='<button data-c="'+k+'" class="'+(cevap===null?'':k===s[2]?'d':k===cevap?'y':'')+'">'+c+'</button>'});
 h+='</div>'+(cevap!==null?'<div class="acl">'+(cevap===s[2]?'✓ Doğru. ':'✗ Doğru yanıt işaretlendi. ')+s[3]+'</div>':'')+'</div>';
 if(cevap!==null)h+='<div class="alt"><button class="p" id="dSoru">'+(sn+1<SORU.length?'Sonraki soru ›':'Sonucu gör ›')+'</button></div>';
 return h}
function izinli(a){return a.view||L.view}
function git(n){if(n<0||n>=ADIM.length)return;var geri=n<i;i=n;gecti=false;uyari='';hataM='';SON=null;var a=ADIM[i];
 /* ileri giderken ekran olduğu gibi kalır (aynı tuşa yeniden basılır); geri dönüşte temiz ekrandan başlanır */
 HS.buf='';G.buf='';if(geri||!n){HS.mode='idle';HS.idx=0}
 var v=izinli(a);if(v.indexOf(S.view)<0||geri)A.show(v[0]);
 document.body.classList.toggle('dersGeri',!!a.geri);document.body.classList.toggle('dersPC',v[0]==='pc');if(v[0]==='pc'){var ap=L.app||'ic',el=document.getElementById(ap==='da'?'appDA':'appIC');if(A.pcApp&&el&&!el.classList.contains('on'))A.pcApp(ap);dispatchEvent(new Event('resize'));if(L.pcKur&&!L._kuruldu){L._kuruldu=1;L.pcKur()}}
 var tp=document.getElementById('tip');if(tp)tp.style.display='none';
 if(a.gir)a.gir();kaydir=true;ciz();isaret()}
function isaret(){
 var a=ADIM[i],bek=!!a.ask&&!gecti,ks=(bek&&a.keys)?a.keys(HS):[],ss=(bek&&a.sec)?a.sec():[];
 document.querySelectorAll('#st .hs').forEach(function(d){var k=d.classList.contains('key')?ks.indexOf(d.dataset.k)>=0:(bek&&!!a.hot&&d.dataset.t===a.hot);d.classList.toggle('dersK',k)});
 document.querySelectorAll('.dersH').forEach(function(d){d.classList.remove('dersH')});
 ss.forEach(function(q){document.querySelectorAll(q).forEach(function(d){d.classList.add(d.classList.contains('hs')?'dersK':'dersH')})});
 if(bek)hedef(a).forEach(function(d){d.classList.add('dersH')});
 var e=document.querySelector('#st .disp');if(e)e.classList.toggle('dersD',!!a.ekran||(!!a.ask&&gecti&&(S.view==='hskey'||S.view==='gckey')))}
/* bilgisayar ekranı: yanacak ve tıklanabilecek öğeler (dok: tıklama yalnızca derse sayılır · izin: öğe gerçekten çalışır) */
function hedef(a){var r=[];
 if(a.dok){if(typeof a.dok==='function')r=r.concat(a.dok());else document.querySelectorAll(a.dok).forEach(function(d){r.push(d)})}
 if(a.izin)r=r.concat(izinEl(a));
 return r}
function izinEl(a){var r=[];a.izin().forEach(function(q){if(typeof q==='string')document.querySelectorAll(q).forEach(function(d){r.push(d)});else if(q)r.push(q)});return r}
function icinde(L,t){for(var k=0;k<L.length;k++)if(L[k]===t||L[k].contains(t))return true;return false}
function pcKoruma(e){
 if(!L||S.view!=='pc')return;var a=ADIM[i],t=e.target;
 if(t.closest&&t.closest('.dlg .bts [data-b]'))return; /* programın kendi uyarı kutuları her zaman kapatılabilir */
 var bek=!a.test&&!!a.ask&&!gecti;
 if(bek&&a.izin&&icinde(izinEl(a),t))return;
 e.stopPropagation();e.preventDefault();
 if(!bek||e.type!=='click')return;
 if(a.dok){var Dk=typeof a.dok==='function'?a.dok():[].slice.call(document.querySelectorAll(a.dok));if(icinde(Dk,t)){tamam();return}}
 if(!a.bekle){uyari='Yanıp sönen yere tıklayın.';ciz()}}
function tamam(){var a=ADIM[i];if(a.bitince)a.bitince();if(a.oto){git(i+1);return}gecti=true;uyari='';kaydir=true;ciz()}
function tik(){
 var a=ADIM[i];if(a.test)return;
 var v=izinli(a);if(v.indexOf(S.view)<0)A.show(v[0]);
 if(a.ask&&!gecti){
  if(a.ok&&a.ok(HS))tamam();
  else if(a.hata){var m=a.hata(HS);if(m!==hataM){hataM=m;uyari=m;ciz()}}}
 isaret()}
function dokunus(e){
 var a=ADIM[i],d=e.target.closest&&e.target.closest('.hs');if(!d||a.test)return;
 if(d.classList.contains('key')){
  if(!a.ask||gecti||!a.keys){e.stopPropagation();e.preventDefault();return}
  var ks=a.keys(HS),k=d.dataset.k;
  if(ks.indexOf(k)<0&&k!=='clear'){e.stopPropagation();e.preventDefault();uyari='Bu adımda yanıp sönen tuşu kullanın.';setTimeout(ciz,60)}
  else{SON={k:k,buf:S.view==='gckey'?G.buf:HS.buf};if(uyari){uyari='';setTimeout(ciz,60)}}
  return}
 /* fotoğraf bölgeleri */
 var ad=d.dataset.t||'';
 if(/^Yuva /.test(ad))return;
 if(!a.ask||gecti){if(L.yukGizle||!a.ask){e.stopPropagation();e.preventDefault()}return}
 if(!a.hot)return;
 if(ad===a.hot){if(a.kes){e.stopPropagation();e.preventDefault();tamam()}return}
 e.stopPropagation();e.preventDefault();uyari='Burası: <b>'+ad+'</b>. Yanıp sönen bölgeye dokunun.';ciz()}
function basla(){
 if(!window.__hs||!document.querySelector('.side')){setTimeout(basla,150);return}
 A=window.__hs;S=A.S;HS=S.hs;G=S.gc;document.body.classList.add('ders');
 P=document.createElement('div');P.id='dersP';document.querySelector('.side').appendChild(P);
 var M=document.createElement('div');M.id='dersM';document.body.appendChild(M);
 var st=document.getElementById('st');
 if(!L){A.show('main');liste();st.addEventListener('click',function(e){if(e.target.closest('.hs')){e.stopPropagation();e.preventDefault()}},true);
  setInterval(function(){if(S.view!=='main')A.show('main')},300);return}
 sifirla();if(L.kur)L.kur();if(L.yukGizle)document.body.classList.add('dersYuk');
 A.show(L.view[0]);
 var dk=document.getElementById('desk');if(dk)['mousedown','click','dblclick','contextmenu','pointerdown'].forEach(function(n){dk.addEventListener(n,pcKoruma,true)});
 st.addEventListener('pointerdown',function(e){if(e.target.closest('.hs.key'))dokunus(e)},true);
 st.addEventListener('click',function(e){if(!e.target.closest('.hs.key'))dokunus(e)},true);
 git(0);setInterval(tik,150);setTimeout(function(){dispatchEvent(new Event('resize'))},60)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',basla);else basla();
})();
