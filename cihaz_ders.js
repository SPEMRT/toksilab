/* MY ToksiLab · Rehberli dersler: 3B cihaz sayfaları
   Sayfa doğrudan rehberli açılır; ?ders= yoksa bölüm listesi gösterilir.
   Serbest kullanım aynı sayfada açılır (?serbest=1): görev yok, solda yalnız ⚙ Kontroller eklenir, sağ panel küçültülebilir.
   santrifuj_pilot.html?ders=sentani | senkan | senlle | senepp  (tanıma · kandan plazma · faz ayırma · protein çöktürme)
   vorteks_pilot.html?ders=vortani | vorkul | vorlle   (tanıma · HS viali · ekstraksiyon)
   terazi_pilot.html?ders=terani | terkal | ter10      (tanıma · seviye ve kalibrasyon · 10 mg tartım)
   ultra_pilot.html?ders=ulttani | ultdeg              (tanıma · mobil faz degazlama)
   pipet_pilot.html?ders=piptani | pipsu | pipkan | pipstok | pipdcm  (tanıma · ileri · ters · 5 µL · DCM ön ıslatma)
   su_pilot.html?ders=sutani | sudol | susiz            (tanıma · 500 mL şişe · kartuş sızıntısı)
   spe_pilot.html?ders=spetani | spesart | speyuk | speelu  (tanıma · şartlandırma · yükleme · yıkama, kurutma, elüsyon)
   Sayfanın 3B sahnesini ve kendi işlevlerini kullanır; sahneye ve fiziğe dokunmaz. */
(function(){
'use strict';
var Q=null;try{Q=new URLSearchParams(location.search)}catch(e){}
if(!Q)return;
var SERB=Q.get('serbest')==='1'||Q.get('gorev')==='free',NOT='';
var SAYFA=location.pathname.split('/').pop()||'';
var LS='toksilab_ders_v1';
var P,i=0,UST=0,ustG=false,gecti=false,uyari='',puan=0,sn=0,cevap=null,hataM='',SONP=null;
function S(){return window.S}
function adres(d){var q=new URLSearchParams(location.search);q.delete('gorev');q.delete('serbest');if(d)q.set('ders',d);else q.delete('ders');var s=q.toString();return location.pathname+(s?'?'+s:'')}
function ac(d){location.href=adres(d==='liste'?'':d)}
function oku(){try{return JSON.parse(localStorage.getItem(LS)||'{}')}catch(e){return {}}}

/* ---------- vorteks ---------- */
function vorteks(){
var AD={'Karıştırma başlığı (kauçuk kap)':'cup','Anahtar: O / ON / TOUCH':'sw','Hız ayar düğmesi':'knob','Güç ışığı':'led','Kaymaz (vantuz) ayaklar':'feet','Gövde ve motor':'body','HS viali (20 mL, krimpli)':'hs','Falkon tüpü 15 mL':'fal','Eppendorf tüpü 1,5 mL':'ep','Tüp rafı':'rack'};
var ADI={cup:'karıştırma başlığı',sw:'anahtar',knob:'hız düğmesi',led:'güç ışığı',feet:'ayaklar',body:'gövde',hs:'HS viali',fal:'Falkon tüpü',ep:'Eppendorf tüpü',rack:'tüp rafı'};
var TUP={hs:'HS viali',fal:'Falkon tüpü',ep:'Eppendorf tüpü'};
/* yanlış tüp alınırsa rafa geri konur */
function yanlisTup(dogru){return function(){var s=S();if(s.held&&s.held!==dogru){var k=s.held;window.toRack();return 'Aldığınız '+TUP[k]+' idi; rafa geri kondu. Yanıp sönen halkanın gösterdiği tüpe tıklayın.'}return ''}}
var DERS={
vortani:{ad:'Cihazı tanıma',ozet:'Vorteks ne işe yarar; başlık, anahtar, hız düğmesi ve tüpler.',baslik:'VORTEKS · CİHAZI TANIMA',mod:'parts',
 adim:[
 {bolum:'Giriş',b:'Vorteks ne işe yarar?',
  html:'<p>Vorteks, bir tüpün içindeki sıvıyı saniyeler içinde karıştıran küçük bir cihazdır. Üstündeki başlık hızla küçük daireler çizer; tüpün dibini başlığa bastırdığınızda sıvının içinde bir <b>girdap</b> oluşur ve içindekiler karışır.</p><p>Laboratuvarda iki iş için kullanılır:</p><ul><li>Kan ile iç standardı karıştırıp <b>tek tip</b> (homojen) hâle getirmek.</li><li>Ekstraksiyonda iki ayrı sıvıyı birbirine iyice temas ettirmek.</li></ul><p>Sahneyi sürükleyerek döndürebilir, tekerlekle yakınlaştırabilirsiniz.</p>'},
 {bolum:'Parçalar',ask:'Cihazın üstündeki siyah <b>karıştırma başlığına</b> tıklayın.',parca:['cup'],halka:['cup',0,62],
  b:'Karıştırma başlığı',ne:'Kauçuktan yapılmış, çukur bir kaptır. Tüpün dibi buraya oturur.',neden:'Motor başlığı küçük bir daire üzerinde döndürür. Bu hareket tüpteki sıvıya geçer ve girdabı oluşturur.',yanlis:'Tüp başlığa <b>dik ve sıkıca</b> bastırılır. Gevşek tutulan tüp elden kayar.'},
 {bolum:'Parçalar',ask:'Ön yüzdeki <b>anahtara</b> tıklayın.',parca:['sw'],halka:['sw',0,54],
  b:'Anahtar: O / ON / TOUCH',ne:'Cihazın üç konumlu çalışma anahtarıdır.',neden:'<b>O:</b> kapalı. <b>ON:</b> başlık sürekli döner. <b>TOUCH:</b> başlık yalnızca tüp bastırıldığında döner, bırakınca durur.',yanlis:'Kısa karıştırmalarda TOUCH, uzun karıştırmalarda ON kullanılır. İş bitince anahtar O’ya alınır.'},
 {bolum:'Parçalar',ask:'Anahtarın yanındaki yuvarlak <b>hız düğmesine</b> tıklayın.',parca:['knob'],halka:['knob',0,54],
  b:'Hız ayar düğmesi',ne:'Başlığın dönme hızını ayarlar: 0–10 kademe, yaklaşık 0–3000 devir/dakika (rpm).',neden:'Hız, tüpe ve yapılan işe göre seçilir. Küçük hacimde orta hız yeter; ekstraksiyonda yüksek hız gerekir.',yanlis:'<b>Her zaman düşük hızla başlanır</b>, sonra artırılır. Yüksek hızla başlanırsa sıvı kapağa sıçrar.'},
 {bolum:'Parçalar',ask:'Ön yüzdeki küçük <b>güç ışığına</b> tıklayın.',parca:['led'],halka:['led',0,40],
  b:'Güç ışığı',ne:'Anahtar ON ya da TOUCH konumundayken yeşil yanar.',neden:'Cihazın açık olduğunu bir bakışta gösterir.',yanlis:'Işık yanıyorsa cihaz çalışmaya hazırdır; TOUCH modunda başlığa dokunan her şey onu döndürür.'},
 {bolum:'Parçalar',ask:'Cihazın altındaki <b>ayaklardan birine</b> tıklayın.',parca:['feet'],halka:['foot',0,44],
  b:'Kaymaz ayaklar',ne:'Vantuz biçiminde kauçuk ayaklardır.',neden:'Yüksek hızda cihazın titreşimle tezgâh üzerinde yürümesini önler.',yanlis:'Tezgâh kuru ve düz olmalıdır. Islak tezgâhta vantuzlar tutmaz.'},
 {bolum:'Parçalar',ask:'Cihazın <b>gövdesine</b> tıklayın.',parca:['body'],halka:['body',-78,84],
  b:'Gövde ve motor',ne:'İçinde başlığı döndüren motor bulunur.',neden:'Ağır gövde, cihazı çalışırken yerinde tutar.',yanlis:'Üstüne sıvı dökülürse cihaz kapatılır, fişi çekilir ve temizlenir. Sıvı motora ulaşmamalıdır.'},
 {bolum:'Tüpler',ask:'Sağdaki <b>tüp rafına</b> ya da tüplerden birine tıklayın.',parca:['rack','hs','fal','ep'],halka:['rack',-34,120],
  b:'Tüpler ve raf',html:'<p>Rafta üç ayrı tüp duruyor; derslerde bunları kullanacaksınız:</p><ul><li><b>HS viali</b> (kısa, cam, metal kapaklı): kanda alkol analizi için. Kapağı preslenmiştir, açılmaz.</li><li><b>Falkon tüpü</b> (uzun, mavi vidalı kapaklı): ekstraksiyon için.</li><li><b>Eppendorf tüpü</b> (küçük): az hacimli örnekler için.</li></ul><p>Kullanılmayan tüp her zaman rafta, dik durur.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['TOUCH konumunda başlık ne zaman döner?',['Anahtar açıldığı anda, sürekli','Yalnızca tüp başlığa bastırıldığında','Hiç dönmez'],1,'Tüp bırakılınca başlık durur.'],
 ['Hız nasıl ayarlanmalıdır?',['Düşük hızla başlanır, sonra artırılır','Her zaman en yüksek hız seçilir','Hız önemli değildir'],0,'Yüksek hızla başlanırsa sıvı kapağa sıçrar.'],
 ['Kaymaz ayakların görevi nedir?',['Cihazı ısıtmak','Tüpü tutmak','Cihazın tezgâhta yürümesini önlemek'],2,'Bu yüzden tezgâh kuru ve düz olmalıdır.']],
 bitti:function(){S().done.parts=1}},

vorkul:{ad:'İlk karıştırma: HS viali',ozet:'TOUCH modu, hız ayarı, viali başlığa bastırma ve homojenlik.',baslik:'VORTEKS · İLK KARIŞTIRMA',mod:'use',
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',
  html:'<p>Kanda alkol analizi için hazırlanmış bir HS vialini karıştıracaksınız. Vialde kan dipte, su ve iç standart üstte duruyor: iki ayrı tabaka.</p><p>Vial bu hâliyle analiz edilirse sonuç yanlış çıkar. Birkaç saniyelik bir karıştırma yeter; bunun için <b>TOUCH</b> modu kullanılır.</p>'},
 {bolum:'Ayar',ask:'<b>Anahtara</b> tıklayın. Her tıklamada konum değişir: O → ON → TOUCH. <b>TOUCH</b> olana kadar tıklayın.',halka:['sw',0,54],izin:['sw'],ok:function(s){return s.sw==='touch'},
  b:'Anahtar TOUCH konumunda',html:'<p>Güç ışığı yandı; sağ üstteki göstergede <b>TOUCH</b> yazıyor. Başlık şu an dönmüyor: TOUCH modunda yalnızca tüp bastırıldığında döner.</p><p>Kısa karıştırmalar için en güvenli moddur; tüpü kaldırdığınız anda cihaz durur.</p>'},
 {bolum:'Ayar',ask:'<b>Hız düğmesine</b> tıklayın ve açılan kutudaki <b>+</b> ile hızı <b>5</b>. kademeye getirin.',halka:['knob',0,54],izin:['knob'],ok:function(s){return s.lvl===5},hata:function(){var s=S();return s.lvl>5?'Hız '+s.lvl+'. kademede. <b>−</b> ile 5’e indirin.':''},
  b:'Hız: 5. kademe',html:'<p>5. kademe yaklaşık <b>1500 rpm</b>’dir. Küçük bir vial için orta hız yeterlidir:</p><ul><li>Çok düşük hızda girdap oluşmaz, sıvı karışmaz.</li><li>Çok yüksek hızda vial elden kayabilir.</li></ul>'},
 {bolum:'Karıştırma',ask:'Raftaki <b>HS vialine</b> (kısa, koyu kırmızı sıvılı) tıklayarak viali alın.',halka:['tubes.hs',-38,70],izin:['tube:hs'],ok:function(s){return s.held==='hs'||s.cupT==='hs'},hata:yanlisTup('hs'),
  b:'Vial elinizde',html:'<p>Viale bakın: altta koyu kırmızı <b>kan</b>, üstte berrak sıvı (su ve iç standart). İki tabaka henüz karışmamış.</p><p>Vorteksten önce her zaman kapağa bakılır. HS vialinin kapağı preslenmiştir ve sızdırmaz.</p>'},
 {bolum:'Karıştırma',ask:'Viali yerleştirin: <b>karıştırma başlığına</b> tıklayın.',oto:1,halka:['cup',0,62],izin:['cup'],ok:function(s){return s.cupT==='hs'}},
 {bolum:'Karıştırma',ask:'Vialin (ya da başlığın) üstüne <b>basılı tutun</b>. Sıvı tek renk olana kadar bırakmayın.',tut:1,izin:['cup','tube:hs'],canli:function(s){return 'Homojenlik: %'+Math.round(s.mix.hs*100)+(s.press?' · '+Math.round(s.rpm/10)*10+' rpm':' · bekliyor')},halka:['cup',-6,92],ok:function(s){return s.mix.hs>=1},
  hata:function(){var s=S();return s.cupT!=='hs'?'Vial başlıkta değil. Viali alıp başlığa tıklayın.':s.sw!=='touch'?'Anahtar TOUCH konumunda olmalı.':s.lvl<3?'Hız çok düşük; düğmeden 5. kademeye getirin.':''},
  b:'Vial homojen',html:'<p>Bastırdığınızda başlık döndü, bıraktığınızda durdu: TOUCH modu böyle çalışır.</p><p>Sıvı artık <b>tek renk</b>: kan, su ve iç standart tamamen karıştı. Yaklaşık 10 saniye yetti.</p><p>Karışmamış bir vialde cihaz gaz fazından eksik örnek alır ve sonuç düşük çıkar.</p>'},
 {bolum:'Bitirme',ask:'Viali kaldırın: <b>başlığa</b> bir kez, kısaca tıklayın (basılı tutmayın).',oto:1,dugme:['Viali kaldır',function(){if(S().cupT)window.cupTap()}],halka:['cup',-6,92],izin:['cup','tube:hs'],ok:function(s){return s.held==='hs'&&!s.cupT}},
 {bolum:'Bitirme',ask:'Viali yerine koyun: <b>tüp rafına</b> tıklayın.',oto:1,halka:['rack',-34,120],izin:['rack','tube:hs'],ok:function(s){return !s.held&&!s.cupT}},
 {bolum:'Bitirme',ask:'Cihazı kapatın: <b>anahtara</b> tıklayarak <b>O</b> konumuna getirin.',halka:['sw',0,54],izin:['sw'],ok:function(s){return s.sw==='off'},
  b:'İş bitti',html:'<p>Sırayı aklınızda tutun:</p><ul><li>Anahtar <b>TOUCH</b>, hız orta.</li><li>Kapağı kontrol et, viali başlığa koy.</li><li>Sıvı tek renk olana kadar <b>bastır</b>.</li><li>Viali rafa koy, anahtarı <b>O</b> yap.</li></ul><p>Vial artık headspace cihazına yüklenebilir.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['HS viali neden karıştırılır?',['Isınması için','Kan, su ve iç standardın tek tip hâle gelmesi için','Kapağı sıkılaşsın diye'],1,'Karışmamış vialde sonuç düşük çıkar.'],
 ['Kısa bir karıştırma için hangi konum seçilir?',['TOUCH','ON','O'],0,'TOUCH’ta tüp kaldırılınca cihaz kendiliğinden durur.'],
 ['Karıştırmanın yeterli olduğu nasıl anlaşılır?',['Cihaz ses verir','Vial ısınır','Sıvı tek renk olur, tabaka kalmaz'],2,'İki tabaka görünüyorsa karıştırma sürdürülür.']],
 bitti:function(){S().done.hs=1}},

vorlle:{ad:'Sıvı-sıvı ekstraksiyon: Falkon tüpü',ozet:'Kapak kontrolü, düşük hızla başlama, ON modu ve 30 saniye yüksek hız.',baslik:'VORTEKS · EKSTRAKSİYON',mod:'use',kur:function(){var s=S();s.caps.fal=false},
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',
  html:'<p>Falkon tüpünde iki sıvı var: altta <b>plazma</b>, üstte <b>organik çözücü</b>. Bu ikisi su ile yağ gibi birbirine karışmaz.</p><p>Aradığımız madde plazmadan çözücüye geçsin diye iki sıvının çok güçlü ve uzun süre karıştırılması gerekir: <b>yüksek hızda 30 saniye</b>. Bunun için <b>ON</b> (sürekli) modu kullanılır.</p><p>Çözücü tüpe yeni eklendi; <b>kapak henüz açık</b>.</p>'},
 {bolum:'Hazırlık',ask:'Raftaki <b>Falkon tüpüne</b> (uzun olan) tıklayarak tüpü alın.',oto:1,halka:['tubes.fal',-60,80],izin:['tube:fal'],ok:function(s){return s.held==='fal'},hata:yanlisTup('fal')},
 {bolum:'Hazırlık',ask:'Tüpün kapağı açık, tezgâhta duruyor. Aşağıdaki düğmeyle kapağı kapatın.',izin:[],dugme:['Kapağı sıkıca kapat',function(){if(!S().caps.fal)window.capToggle()}],ok:function(s){return s.caps.fal},
  hata:function(){var s=S();if(s.cupT==='fal'&&!s.caps.fal){window.cupTap();return 'Kapağı açık tüp başlığa konmaz; tüp elinize geri alındı. Önce kapağı kapatın.'}return ''},
  b:'Önce kapak',html:'<p>Vorteksten önce bakılacak ilk şey kapaktır. Açık ya da gevşek kapakla karıştırılırsa:</p><ul><li>Sıvı dışarı sıçrar; <b>numune kaybolur</b>.</li><li>Tezgâh, cihaz ve eldiven kirlenir (<b>bulaşma</b>).</li><li>Çözücü buharı solunur.</li></ul><p>Vidalı kapak sonuna kadar çevrilerek kapatılır.</p>'},
 {bolum:'Hazırlık',ask:'<b>Hız düğmesine</b> tıklayın ve hızı <b>3</b>. kademeye getirin.',halka:['knob',0,54],izin:['knob'],ok:function(s){return s.lvl===3},hata:function(){var s=S();return s.lvl>3?'Hız '+s.lvl+'. kademede. <b>−</b> ile 3’e indirin.':''},
  b:'Düşük hızla başlayın',html:'<p>Sonunda yüksek hıza çıkacaksınız, ama <b>başlangıç her zaman düşük hızdadır</b>.</p><p>Yüksek hızla başlanırsa sıvı bir anda kapağa sıçrar. Kapağa yapışan sıvı karışmaya katılmaz ve tüp elinizden kayabilir.</p>'},
 {bolum:'Karıştırma',ask:'Tüpü yerleştirin: <b>karıştırma başlığına</b> tıklayın.',oto:1,halka:['cup',0,62],izin:['cup'],ok:function(s){return s.cupT==='fal'},hata:yanlisTup('fal')},
 {bolum:'Karıştırma',ask:'Tüpü elinizle başlığa <b>bastırarak tutun</b>. Çalıştırmadan önce tutulur.',izin:[],dugme:['✋ Tüpü bastırarak tut',function(){if(!S().hold)window.holdToggle()}],ok:function(s){return s.hold||s.press},
  b:'Tüp her zaman elle tutulur',html:'<p>ON modunda başlık siz durdurana kadar döner, ama tüp başlığın üstünde <b>kendi kendine durmaz</b>: elle bastırılmazsa karışmaz, hız artınca başlıktan <b>fırlar</b> ve tezgâha düşer.</p><p>Bu yüzden önce tüp başlığa bastırılarak tutulur, sonra anahtar açılır; iş bitince önce anahtar kapatılır, sonra tüp bırakılır.</p>'},
 {bolum:'Karıştırma',ask:'<b>Anahtara</b> bir kez tıklayarak <b>ON</b> konumuna getirin.',halka:['sw',0,54],izin:['sw'],ok:function(s){return s.sw==='on'},hata:function(){return S().sw==='touch'?'Anahtar TOUCH konumuna geçti. ON olana kadar yeniden tıklayın.':''},
  b:'ON: sürekli çalışma',html:'<p>Başlık dönmeye başladı ve siz durdurana kadar dönecek. Uzun karıştırmalarda elinizle bastırmanız gerekmez; yine de tüp <b>sıkıca tutulur</b>.</p><p>Şu an hız düşük: sıvı yavaşça dönüyor, ama iki tabaka hâlâ ayrı.</p>'},
 {bolum:'Karıştırma',ask:'Şimdi hızı yükseltin: <b>hız düğmesine</b> tıklayın ve <b>8</b>. kademeye çıkarın.',oto:1,halka:['knob',0,54],izin:['knob'],ok:function(s){return s.lvl>=7&&s.cupT==='fal'}},
 {bolum:'Karıştırma',ask:'<b>30 saniye</b> yüksek hızda karıştırın. Tüpü ve göstergeyi izleyin…',bekle:1,izin:[],canli:function(s){return 'Yüksek hızda geçen süre: '+Math.min(30,Math.floor(s.tHigh))+' / 30 sn · ekstraksiyon %'+Math.round(s.mix.fal*100)},ok:function(s){return s.mix.fal>=1},
  dugme:['✋ Tüpü bastırarak tut',function(){if(!S().hold)window.holdToggle()}],
  hata:function(){var s=S();return s.cupT!=='fal'?'Tüp başlıkta değil. Tüpü başlığa geri koyun.':!(s.hold||s.press)?'Tüpü bastırarak tutmuyorsunuz: karışmıyor. Aşağıdaki düğmeyle yeniden tutun.':s.sw!=='on'?'Anahtar ON konumunda olmalı.':s.lvl<7?'Hız düştü. En az 7. kademe olmalı.':''},
  b:'Ekstraksiyon tamam',html:'<p>Tüpe bakın: iki tabaka kayboldu, sıvı <b>bulanık</b> ve tek renk. Buna <b>emülsiyon</b> denir: iki sıvı çok küçük damlacıklar hâlinde birbirine karıştı ve aradığımız madde çözücüye geçti.</p><p>Süre kısa tutulursa ya da hız düşük kalırsa maddenin bir kısmı plazmada kalır; sonuç düşük çıkar.</p>'},
 {bolum:'Bitirme',ask:'Tüpü kaldırın: <b>başlığa</b> bir kez, kısaca tıklayın (basılı tutmayın).',oto:1,dugme:['Tüpü kaldır',function(){if(S().cupT)window.cupTap()}],halka:['cup',-6,92],izin:['cup','tube:fal'],ok:function(s){return s.held==='fal'&&!s.cupT}},
 {bolum:'Bitirme',ask:'Cihazı kapatın: <b>anahtara</b> tıklayarak <b>O</b> konumuna getirin.',oto:1,halka:['sw',0,54],izin:['sw'],ok:function(s){return s.sw==='off'}},
 {bolum:'Bitirme',ask:'Tüpü yerine koyun: <b>tüp rafına</b> tıklayın.',halka:['rack',-34,120],izin:['rack','tube:fal'],ok:function(s){return !s.held&&!s.cupT},
  b:'Sıradaki adım: santrifüj',html:'<p>Emülsiyon bu hâliyle kullanılamaz; iki sıvının yeniden ayrılması gerekir. Bunun için tüp <b>santrifüje</b> konur (4000 rpm, 5 dakika). Ardından üstteki çözücü tabakası alınır.</p><p>Aklınızda kalsın:</p><ul><li>Önce <b>kapak</b>.</li><li><b>Düşük</b> hızla başla, sonra yükselt.</li><li>Yüksek hızda <b>30 saniye</b>.</li><li>Tüpü kaldır, cihazı <b>kapat</b>.</li></ul>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Vorteksten önce ilk olarak neye bakılır?',['Tüpün rengine','Kapağın sıkıca kapalı olduğuna','Tezgâhın sıcaklığına'],1,'Açık kapak numune kaybına ve bulaşmaya yol açar.'],
 ['Ekstraksiyonda neden yüksek hız ve 30 saniye gerekir?',['İki sıvının iyice temas etmesi ve maddenin çözücüye geçmesi için','Tüpün ısınması için','Kapağın sıkışması için'],0,'Kısa ya da zayıf karıştırmada madde plazmada kalır.'],
 ['Karıştırma bitti; tüp bulanık. Sıradaki adım nedir?',['Hemen analiz edilir','Bir kez daha vortekslenir','Santrifüjle iki sıvı yeniden ayrılır'],2,'Santrifüjden sonra üstteki çözücü tabakası alınır.']],
 bitti:function(){S().done.lle=1}}
};
return {sayfa:'vorteks_pilot.html',hazir:'__vor',ad:'VORTEKS',model:'MY-Vorteks VX-3000',adTam:'Vorteksin',
 acl:'Cihazı üç kısa bölümde, adım adım öğrenin. Sırayla ilerlemeniz önerilir; her bölüm 3–5 dakika sürer.',
 GM:{parts:'vortani',hs:'vorkul',lle:'vorlle'},AD:AD,ADI:ADI,DERS:DERS,SIRA:['vortani','vorkul','vorlle'],
 senkron:function(s,o){if(o.vortani&&o.vortani.bitti)s.done.parts=1;if(o.vorkul&&o.vorkul.bitti)s.done.hs=1;if(o.vorlle&&o.vorlle.bitti)s.done.lle=1}};
}

/* ---------- analitik terazi ---------- */
function terazi(){
var AD={'Dokunmatik ekran (terminal)':'scr','Sensörler (eller serbest kapı)':'sens','Sol yan kapı':'dl','Sağ yan kapı':'dr','Üst cam':'top','Tartım kefesi (ızgara)':'pan','Seviye göstergesi':'lvl','Ayarlanabilir ayaklar':'feet',
 '→0← Sıfırla':'kz','→T← Dara':'kt','Kaydet':'ks','Ayarlar':'kc','Alüminyum tartım kayığı':'al','Plastik tartım kayığı':'pl','Temiz spatula kabı':'sh','Referans standart':'vi','Erlen':'erl','Balon joje (10 mL, A sınıfı)':'vol'};
var ADI={scr:'ekran',sens:'sensör',dl:'sol kapı',dr:'sağ kapı',top:'üst cam',pan:'tartım kefesi',lvl:'seviye göstergesi',feet:'ayaklar',kz:'Sıfırla tuşu',kt:'Dara tuşu',ks:'Kaydet tuşu',kc:'Ayarlar tuşu',al:'alüminyum kayık',pl:'plastik kayık',sh:'spatula kabı',vi:'referans standart',erl:'erlen',vol:'balon joje'};
function mg(v){return (v<0?'−':'')+Math.abs(v).toFixed(3).replace('.',',')+' mg'}
function acik(s){return s.tL||s.tR}
function kararli(s){return s.doorL<.05&&s.doorR<.05&&s.hand<=0&&!s.calRun&&performance.now()-s.lastDist>2200}
/* kapı kapalıysa halka sensörü, açıksa hedefi gösterir */
function kapiYaHedef(h){return function(s){return acik(s)?h:['sensR',0,44]}}
function kapiUyari(){return acik(S())?'':'Kapı kapalı; kefeye ulaşamazsınız. Önce <b>sağ sensöre</b> tıklayın.'}
function ekran(s){return 'Ekran: '+mg(s.disp)+(kararli(s)?' · ● KARARLI':' · bekleniyor…')}
var HEDEF=10,TOL=.1;
var DERS={
terani:{ad:'Cihazı tanıma',ozet:'Mikroterazi neden kapalı bir kutudur; ekran, sensörler, kefe, seviye ve tezgâhtaki malzemeler.',baslik:'TERAZİ · CİHAZI TANIMA',mod:'parts',
 adim:[
 {bolum:'Giriş',b:'Analitik terazi ne işe yarar?',
  html:'<p>Bu bir <b>mikroterazidir</b>: 0,000001 g’a, yani <b>1 mikrograma (µg)</b> kadar okur. Bir toz zerresinin bile ağırlığını gösterir.</p><p>Laboratuvarda referans standartlar (saf madde) bununla tartılır. Kalibrasyon çözeltilerinin doğruluğu bu tartıma bağlıdır: burada yapılan hata, analizin sonuna kadar taşınır.</p><p>Bu kadar hassas olduğu için terazi <b>camdan bir kutunun</b> içindedir. Hava akımı, titreşim, eldeki sıcaklık bile okunan değeri değiştirir.</p><p>Sahneyi sürükleyerek döndürebilir, tekerlekle yakınlaştırabilirsiniz.</p>'},
 {bolum:'Parçalar',ask:'Öndeki <b>dokunmatik ekrana</b> tıklayın.',parca:['scr','kz','kt','ks','kc'],halka:['term',0,70],
  b:'Dokunmatik ekran',ne:'Tartım değerini ve tuşları gösteren terminaldir. Altı ondalık basamak gösterir: 0,000001 g = 1 µg.',neden:'Dört tuş kullanacaksınız: <b>→0← Sıfırla</b> (boş kefe), <b>→T← Dara</b> (kabın ağırlığını düşer), <b>Kaydet</b> (değeri kayda geçirir), <b>Ayarlar</b> (kalibrasyon ve birim).',yanlis:'Değer ancak ekranda <b>● KARARLI</b> yazınca okunur ya da kaydedilir. Oynayan değer kaydedilmez.'},
 {bolum:'Parçalar',ask:'Ekranın üst köşelerindeki küçük <b>sensörlerden</b> birine tıklayın.',parca:['sens'],halka:['sensR',0,44],
  b:'Sensörler (eller serbest)',ne:'Kızılötesi sensörlerdir. Elinizi yaklaştırınca ilgili yan kapı açılır ya da kapanır.',neden:'Kapıya elle dokunmadan çalışırsınız: cam titremez, parmak izi kalmaz, eldiven kirlenmez.',yanlis:'Simülasyonda sensöre tıklamak, elinizi yaklaştırmak demektir.'},
 {bolum:'Parçalar',ask:'Camdan <b>yan kapılardan</b> birine tıklayın.',parca:['dl','dr'],halka:['doorR',0,70],
  b:'Yan kapılar',ne:'Geriye doğru kayarak açılan cam kapılardır. Kayık ve madde kefeye yandan konur.',neden:'Kapalı kutu, hava akımını keser. Kapı kapalıyken değer durulur.',yanlis:'Açık kapıyla okunan değer oynar ve yanlıştır. Değer <b>her zaman kapılar kapalıyken</b> okunur.'},
 {bolum:'Parçalar',ask:'İçerideki yuvarlak <b>tartım kefesine</b> tıklayın.',parca:['pan'],halka:['panHot',0,60],
  b:'Tartım kefesi',ne:'Tartılacak kabın konduğu ızgara biçimli tabladır.',neden:'Izgara yapısı, hava akımının kefeye çarpma etkisini azaltır.',yanlis:'Madde <b>hiçbir zaman doğrudan kefeye</b> konmaz. Önce kefeye bir tartım kayığı konur, madde kayığa eklenir.'},
 {bolum:'Parçalar',ask:'Ekranın köşesindeki <b>seviye göstergesine</b> (su terazisi) tıklayın.',parca:['lvl'],halka:['lvl',0,44],
  b:'Seviye göstergesi',ne:'Ekrana yerleştirilmiş küçük bir su terazisidir.',neden:'Kabarcık ortadaysa terazi düz duruyordur. Eğik terazi yanlış tartar.',yanlis:'Terazinin yeri değişince, tezgâha çarpılınca ve her gün işe başlarken kabarcığa bakılır.'},
 {bolum:'Parçalar',ask:'Terazinin öndeki <b>ayaklarından</b> birine tıklayın.',parca:['feet'],halka:['footR',0,44],
  b:'Ayarlanabilir ayaklar',ne:'Çevrilerek yükseltilip alçaltılan vida ayaklardır.',neden:'Kabarcık ortada değilse ayaklar çevrilerek terazi düzlenir.',yanlis:'Kabarcık her zaman <b>yüksek tarafa</b> kaçar. Ayak, kabarcık ortalanana kadar küçük adımlarla çevrilir.'},
 {bolum:'Malzemeler',ask:'Tezgâhtaki malzemelerden birine tıklayın: <b>tartım kayığı</b>, spatula kabı, referans standart ya da balon joje.',parca:['al','pl','sh','vi','erl','vol'],halka:['ital',-14,60],
  b:'Tezgâhtaki malzemeler',html:'<p>Tartımda kullanacağınız malzemeler:</p><ul><li><b>Tartım kayığı</b> (alüminyum ya da plastik): maddenin konduğu küçük kap.</li><li><b>Temiz spatula kabı</b>: her madde için yeni, temiz bir spatula alınır.</li><li><b>Referans standart</b>: sertifikalı saf madde. Fazla alınan madde <b>asla şişeye geri konmaz</b>.</li><li><b>Balon joje</b>: tartılan madde içine aktarılır ve çözücüyle çizgisine tamamlanır.</li></ul>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Terazi neden camdan bir kutunun içindedir?',['Tozdan korumak için, başka nedeni yok','Hava akımı ve titreşim okunan değeri değiştirdiği için','Işıktan korumak için'],1,'Bu yüzden değer kapılar kapalıyken okunur.'],
 ['Madde nereye konur?',['Doğrudan kefeye','Kefedeki tartım kayığına','Ekranın üstüne'],1,'Kefeye dökülen madde hem kaybolur hem kefeyi kirletir.'],
 ['Fazla alınan referans standart ne yapılır?',['Şişeye geri konur','Atığa atılır','Başka bir kayığa konur'],1,'Şişeye geri konan madde stok standardı kirletebilir.']],
 bitti:function(){S().done.parts=1}},

terkal:{ad:'Seviye ve iç kalibrasyon',ozet:'Kabarcığı ayaklarla ortalama ve terazinin kendini referans ağırlıkla ayarlaması.',baslik:'TERAZİ · SEVİYE VE KALİBRASYON',mod:'use',gorev:'level',
 once:function(s){s.lev={x:3,y:-1};s.cal=false},
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',
  html:'<p>Her gün tartıma başlamadan önce iki şey yapılır:</p><ul><li><b>Seviye:</b> Terazi düz mü? Su terazisindeki kabarcık ortada olmalı.</li><li><b>İç kalibrasyon:</b> Terazi, içindeki bilinen bir ağırlıkla kendini ayarlar.</li></ul><p>Sağ üstteki kutu ekranın yakından görünüşüdür. Kabarcığa bakın: <b>kırmızı ve kenarda</b>. Terazi şu an eğik.</p>'},
 {bolum:'Seviye',ask:'Yanıp sönen halkanın gösterdiği <b>ayağa</b> tıklayın.',halka:function(){var g=window.sugg();return [g&&g[0]==='L'?'footL':'footR',0,44]},ok:function(){var f=document.getElementById('fpop');return f&&!f.hidden},
  b:'Ayak seçildi',html:'<p>Ayağın üstünde iki düğme açıldı:</p><ul><li><b>↻</b> saat yönünde çevirir.</li><li><b>↺</b> saat yönünün tersine çevirir.</li></ul><p>Her çevirmede ayak biraz yükselir ya da alçalır; kabarcık yer değiştirir.</p>'},
 {bolum:'Seviye',ask:'Kabarcığı ortalayın. Aşağıdaki ipucuna göre <b>↻</b> ya da <b>↺</b> düğmesine tıklayın; gerekirse öbür ayağa geçin.',canli:function(){var g=window.sugg();return window.levelOk()?'Kabarcık ortada ✓':g?'İpucu: '+(g[0]==='L'?'sol':'sağ')+' ayağı '+(g[1]>0?'↻':'↺')+' çevirin':'…'},
  halka:function(){var g=window.sugg();return [g&&g[0]==='L'?'footL':'footR',0,44]},ok:function(){return window.levelOk()},
  b:'Terazi düz',html:'<p>Kabarcık ortada ve <b>yeşil</b>. Terazi artık düz duruyor.</p><p>Kural: kabarcık her zaman <b>yüksek tarafa</b> kaçar. Hangi taraf yüksekse o taraftaki ayak alçaltılır.</p><p>Eğik bir terazide kefeye gelen yük doğru ölçülmez; sonuç her tartımda biraz sapar.</p>'},
 {bolum:'Kalibrasyon',ask:'Ekrandaki <b>Ayarlar</b> tuşuna tıklayın.',halka:['keyc',0,40],ok:function(s){return s.menu||s.calRun>0||s.cal},
  b:'Ayarlar menüsü',html:'<p>Menüde iki seçenek var: <b>iç kalibrasyon</b> ve tartım birimi (g / mg).</p><p>Kalibrasyondan önce iki koşul aranır: <b>kapılar kapalı</b> ve <b>kefe boş</b>. Şu an ikisi de sağlanıyor.</p>'},
 {bolum:'Kalibrasyon',ask:'Açılan menüde <b>⚖ İç kalibrasyon</b> düğmesine tıklayın.',oto:1,halka:function(s){return s.menu?['#smCal',0,0]:['keyc',0,40]},ok:function(s){return s.calRun>0||s.cal}},
 {bolum:'Kalibrasyon',ask:'Kalibrasyon sürüyor. Bu sırada kapılara ve kefeye dokunmayın…',bekle:1,canli:function(s){return s.cal?'Kalibrasyon tamam ✓':'Kalibrasyon sürüyor… '+Math.max(0,Math.ceil(s.calRun))+' sn'},ok:function(s){return s.cal&&!s.calRun},
  b:'İç kalibrasyon tamam',html:'<p>Terazinin içinde motorla inip kalkan, ağırlığı tam bilinen bir <b>referans ağırlık</b> vardır. Terazi bu ağırlığı tartar ve gördüğü değeri gerçek değerle eşleştirerek kendini ayarlar.</p><p>İç kalibrasyon yapılır:</p><ul><li>Her gün işe başlarken,</li><li>Oda sıcaklığı değişince,</li><li>Terazi yerinden oynatılıp yeniden düzlenince.</li></ul><p>Terazi şimdi tartıma hazır.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Kabarcık sağa kaçmışsa terazinin hangi tarafı yüksektir?',['Sağ taraf','Sol taraf','Kabarcık yükseklikle ilgili değildir'],0,'Kabarcık her zaman yüksek tarafa kaçar.'],
 ['İç kalibrasyondan önce hangi koşullar sağlanmalıdır?',['Kefede kayık olmalı','Kapılar kapalı, kefe boş ve terazi düz olmalı','Bir kapı açık kalmalı'],1,'Aksi hâlde terazi kendini yanlış ayarlar.'],
 ['İç kalibrasyon ne zaman yapılır?',['Yalnızca terazi ilk alındığında','Her gün işe başlarken ve sıcaklık değişince','Hiç yapılmaz'],1,'Terazi yerinden oynatılınca da yinelenir.']],
 bitti:function(){S().done.level=1}},

ter10:{ad:'10,00 mg referans standart tartımı',ozet:'Kayık, dara, spatulayla ekleme, kararlı değeri kaydetme ve balon jojeye aktarma.',baslik:'TERAZİ · 10 mg TARTIM',mod:'use',gorev:'w10',
 once:function(s){s.lev={x:0,y:0};s.cal=true},
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',
  html:'<p>Bir referans standarttan <b>10,00 mg</b> tartacaksınız. Kabul edilen aralık <b>± 0,10 mg</b>: 9,90 ile 10,10 mg arası.</p><p>Bu madde bir balon jojeye aktarılıp çözülecek ve kalibrasyon çözeltisi olacak. Tartımdaki her hata, o çözeltiyle yapılan bütün ölçümlere geçer.</p><p>Terazi düzlendi ve kalibre edildi; doğrudan tartıma başlayabilirsiniz.</p>'},
 {bolum:'Kayık',ask:'Sağ yan kapıyı açın: ekranın sağ üstündeki <b>sensöre</b> tıklayın.',halka:['sensR',0,44],ok:function(s){return acik(s)},
  b:'Kapı açıldı',html:'<p>Sağ üstteki ekran kutusuna bakın: kapı açılınca değer <b>oynamaya</b> başladı. Bu, içeri giren hava akımıdır.</p><p>Kapı açıkken okunan hiçbir değere güvenilmez.</p>'},
 {bolum:'Kayık',ask:'Tezgâhtaki <b>alüminyum tartım kayığına</b> tıklayarak kayığı alın.',halka:['ital',-14,60],ok:function(s){return s.held==='al'||s.boat==='al'},hata:function(){var s=S();if(s.held==='pl'){window.item('pl');return 'Plastik kayığı aldınız; yerine kondu. Bu tartımda alüminyum kayık kullanılır.'}if(s.held==='sp'){window.item('sh');return 'Spatulayı aldınız; yerine kondu. Önce kayık alınır.'}return ''},
  b:'Alüminyum kayık',html:'<p>Alüminyum kayık hafiftir ve <b>statik elektrik</b> tutmaz. Plastik kaplar statik yüklenebilir; toz tanecikleri kenarlara yapışır ve değer kayar.</p>'},
 {bolum:'Kayık',ask:'Kayığı yerleştirin: içerideki <b>tartım kefesine</b> tıklayın.',halka:kapiYaHedef(['panHot',0,60]),ok:function(s){return s.boat==='al'},hata:kapiUyari,
  b:'Kayık kefede',html:'<p>Kayık kefenin <b>ortasına</b> kondu. Kenara konan yük, bazı terazilerde küçük bir sapma yaratır.</p><p>Ekran şimdi kayığın kendi ağırlığını gösteriyor (yaklaşık 148 mg). Bu ağırlığı birazdan sıfırlayacaksınız.</p>'},
 {bolum:'Dara',ask:'Kapıyı kapatın: <b>sağ sensöre</b> yeniden tıklayın.',oto:1,halka:['sensR',0,44],ok:function(s){return !acik(s)}},
 {bolum:'Dara',ask:'Değer durulunca ekranda <b>● KARARLI</b> yazar. Sonra <b>→T← Dara</b> tuşuna tıklayın.',canli:ekran,halka:['keyt',0,40],ok:function(s){return s.ev.tare&&s.boat==='al'},hata:function(){var s=S();return acik(s)?'Kapı açık. Dara kapılar kapalıyken alınır.':s.pendingTare?'Terazi değerin durulmasını bekliyor; durulunca dara kendiliğinden alınacak.':''},
  b:'Dara alındı',html:'<p>Ekran <b>sıfır</b> oldu. Kayığın ağırlığı artık hesaba katılmıyor; bundan sonra ekran yalnızca <b>eklediğiniz maddeyi</b> gösterir.</p><p>Dara, kefede bir kap varken kullanılır. Boş kefe için <b>Sıfırla</b> tuşu vardır.</p>'},
 {bolum:'Ekleme',ask:'Tezgâhtaki <b>temiz spatula kabına</b> tıklayarak bir spatula alın.',halka:['itsh',0,60],ok:function(s){return s.held==='sp'},
  b:'Temiz spatula',html:'<p>Her standart için <b>yeni ve temiz</b> bir spatula kullanılır. Başka bir maddeye değmiş spatula, standarda o maddeyi bulaştırır (<b>çapraz bulaşma</b>).</p>'},
 {bolum:'Ekleme',ask:'<b>Referans standart</b> şişesine tıklayarak spatulaya biraz madde alın.',oto:1,halka:['itvi',0,60],ok:function(s){return s.spLoad}},
 {bolum:'Ekleme',ask:'Kapıyı açın (<b>sağ sensör</b>), sonra <b>kayığa</b> (kefeye) tıklayarak madde ekleyin. Hedefe yaklaşana kadar (8,5 mg üstü) birkaç kez ekleyin.',canli:function(s){return 'Kayıktaki madde ≈ '+mg(s.powder)+' · hedef 10,00 mg'},halka:kapiYaHedef(['panHot',0,60]),
  ok:function(s){return s.powder>=8.5},
  b:'Hedefe yaklaştınız',html:function(){return (S().powder>HEDEF+TOL?'<p><b>Hedef aşıldı</b> ('+mg(S().powder)+'). Sıradaki adımda fazlalığı alacaksınız.</p>':'')+'<p>Spatuladan her seferinde 1–4 mg kadar madde düştü. Hedefe çok yaklaşınca bu kadar büyük adımlarla devam edilmez: hedef kolayca aşılır.</p><p>Son miligramlar için spatulaya <b>hafifçe vurarak</b> birkaç tanecik düşürülür.</p>'}},
 {bolum:'Ekleme',ask:'Aşağıdan <b>Az (hafif vur)</b> düğmesine basın, sonra kayığa tıklayarak <b>9,90–10,10 mg</b> aralığına getirin. Aşarsanız <b>Fazlayı al</b> düğmesini kullanın.',canli:function(s){var d=s.powder-HEDEF;return 'Kayıktaki madde ≈ '+mg(s.powder)+(Math.abs(d)<=TOL?' · aralıkta ✓':d>0?' · hedef aşıldı':' · '+mg(-d)+' eksik')+' · mod: '+(s.sp==='az'?'Az':'Bol')},
  dugme:[['Az (hafif vur)',function(){S().sp='az';window.render()}],['Fazlayı al',function(){window.removeExcess()}]],halka:kapiYaHedef(['panHot',0,60]),
  ok:function(s){return Math.abs(s.powder-HEDEF)<=TOL-.005},hata:function(){var s=S();return !acik(s)?'Kapı kapalı. Önce <b>sağ sensöre</b> tıklayın.':s.powder>HEDEF+TOL?'Hedef aşıldı. <b>Fazlayı al</b> düğmesine basın. Alınan madde şişeye değil, atığa gider.':''},
  b:'Aralıktasınız',html:'<p>Kayıktaki madde 9,90–10,10 mg aralığında.</p><p>Hedef aşılırsa fazlalık spatulayla alınır ve <b>atığa</b> atılır. Stok şişesine geri konmaz: şişedeki saf maddeyi kirletebilir.</p>'},
 {bolum:'Kayıt',ask:'Spatulayı bırakın: <b>spatula kabına</b> tıklayın.',oto:1,halka:['itsh',0,60],ok:function(s){return s.held!=='sp'}},
 {bolum:'Kayıt',ask:'Kapıyı kapatın: <b>sağ sensöre</b> tıklayın.',oto:1,halka:['sensR',0,44],ok:function(s){return !acik(s)}},
 {bolum:'Kayıt',ask:'<b>● KARARLI</b> yazısını bekleyin, sonra ekrandaki <b>Kaydet</b> tuşuna tıklayın.',canli:ekran,halka:['keys',0,40],ok:function(s){return s.res&&s.res.ok},
  hata:function(){var s=S();return acik(s)?'Kapı açık. Kayıt kapılar kapalıyken alınır.':s.res&&!s.res.ok?'Kayıt kabul edilmedi: değer aralık dışında. Kapıyı açıp Az ya da Fazlayı al ile düzeltin, sonra yeniden kaydedin.':''},
  b:function(){return 'Kaydedildi: '+mg(S().res.v)},html:'<p>Değer kapılar kapalı ve <b>kararlıyken</b> kaydedildi. Kayıt tarih, saat, terazi numarası ve kullanıcı adıyla laboratuvarın kayıt sistemine (LIMS) geçer.</p><p>Ekran gram biriminde: 0,010000 g = 10,000 mg.</p><p>Kâğıda elle yazılan değerlerde okuma ve yazım hatası olabilir; bu yüzden değer terazinin kendi kaydından alınır.</p>'},
 {bolum:'Aktarım',ask:'Kapıyı açın (<b>sağ sensör</b>), sonra <b>kefeye</b> tıklayarak dolu kayığı alın.',oto:1,halka:kapiYaHedef(['panHot',0,60]),ok:function(s){return (s.held==='al'&&s.heldPow>0)||s.ev.transfer}},
 {bolum:'Aktarım',ask:'Tezgâhtaki <b>balon jojeye</b> tıklayarak maddeyi aktarın.',halka:['itvol',0,70],ok:function(s){return s.ev.transfer&&s.fl.vol>0},hata:function(){var s=S();if(s.fl.erl>0)return 'Madde erlene boşaltıldı. Kalibrasyon çözeltisi kesin hacim ister; balon joje kullanılır. Bölümü yeniden deneyin.';return ''},
  b:'Madde balon jojede',html:'<p>Kayıktaki madde <b>10 mL’lik balon jojeye</b> aktarıldı. Ardından:</p><ul><li>Kayık az miktar çözücüyle (ör. metanol) jojenin içine <b>durulanır</b>; kayıkta tanecik kalmaz.</li><li>Madde çözülür, joje çözücüyle <b>çizgisine</b> tamamlanır.</li></ul><p>Sonuç: 10 mg / 10 mL = <b>1 mg/mL</b> stok çözelti.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Dara tuşu ne yapar?',['Teraziyi kapatır','Kefedeki kabın ağırlığını düşer, ekran sıfırlanır','Değeri kaydeder'],1,'Böylece ekran yalnızca eklenen maddeyi gösterir.'],
 ['Değer ne zaman kaydedilir?',['Kapı açıkken, hemen','Kapılar kapalı ve ekranda ● KARARLI yazarken','Herhangi bir anda'],1,'Açık kapıda değer hava akımıyla oynar.'],
 ['Hedef aşıldı. Ne yaparsınız?',['Fazlayı spatulayla alıp atığa atarım','Fazlayı şişeye geri koyarım','Değeri olduğu gibi kaydederim'],0,'Şişeye geri konan madde stoku kirletebilir.'],
 ['Hedefe yaklaşınca nasıl eklenir?',['Spatulaya hafifçe vurarak az az','Bol miktarda, hızlıca','Kayığı sallayarak'],0,'Büyük adımlarla hedef kolayca aşılır.']],
 bitti:function(){S().done.w10=1}}
};
/* rehberli derste her adımda yalnız yönlendirilen parça etkileşimli (adım metnine göre) */
['terkal','ter10'].forEach(function(id){DERS[id].adim.forEach(function(a){if(!a.ask||a.izin)return;var t=a.ask;
 var M=[['ayağa','foot'],['Kabarcığı ortalayın','foot'],['<b>Ayarlar</b>','key:c'],['İç kalibrasyon','key:c'],['Kalibrasyon sürüyor',''],
  ['tartım kayığına','item:al item:pl'],['tartım kefesine','sens pan'],['Dara</b>','sens key:t'],['spatula kabına','item:sh'],['Referans standart','item:vi'],
  ['<b>kayığa</b>','sens pan'],['Az (hafif vur)','sens pan'],['Kaydet</b>','key:s'],['dolu kayığı','sens pan'],['balon jojeye','item:vol'],['sensör','sens']];
 for(var k=0;k<M.length;k++)if(t.indexOf(M[k][0])>=0){a.izin=M[k][1]?M[k][1].split(' '):[];return}})});
return {sayfa:'terazi_pilot.html',hazir:'__bal',ad:'ANALİTİK TERAZİ',model:'MY-Terazi µ6',adTam:'Analitik terazinin',
 acl:'Teraziyi üç kısa bölümde, adım adım öğrenin. Sırayla ilerlemeniz önerilir; her bölüm 3–6 dakika sürer.',
 GM:{parts:'terani',level:'terkal',w10:'ter10',w5:'ter10'},AD:AD,ADI:ADI,DERS:DERS,SIRA:['terani','terkal','ter10'],
 senkron:function(s,o){if(o.terani&&o.terani.bitti)s.done.parts=1;if(o.terkal&&o.terkal.bitti)s.done.level=1;if(o.ter10&&o.ter10.bitti)s.done.w10=1},
 /* fareyle sensörün üstünde durmak kapıyı kendiliğinden açar; derste tıklamayla çakışmasın diye kullanım kipinde fare gezinmesi sahneye iletilmez (sürükleme etkilenmez) */
 kur:function(){addEventListener('pointermove',function(e){if(e.pointerType==='mouse'&&!e.buttons&&e.target.tagName==='CANVAS'&&S()&&S().mode==='use')e.stopPropagation()},true)}};
}
/* ---------- ultrasonik banyo ---------- */
function ultra(){
var AD={'Paslanmaz çelik hazne (3 L)':'tank','Su seviyesi işareti (2/3)':'mark','“Kuru çalıştırma” uyarısı':'dry','Süre göstergesi (Min · Sec)':'tmin','Sıcaklık göstergesi (Set · Actual °C)':'ttmp','Tuşlar':'bt','Ultrasonic ve Heating ışıkları':'led','Tutamaklar':'hdl','Paslanmaz sepet':'basket','Su kabı':'jug','Mobil faz şişesi (1 L)':'bottle','Kuru ekstrakt tüpleri (yüzer spor)':'rack'};
var ADI={tank:'hazne',mark:'su seviyesi işareti',dry:'kuru çalıştırma uyarısı',tmin:'süre göstergesi',ttmp:'sıcaklık göstergesi',bt:'tuşlar',led:'ışıklar',hdl:'tutamaklar',basket:'sepet',jug:'su kabı',bottle:'mobil faz şişesi',rack:'tüp sporu'};
function L1(v){return v.toFixed(1).replace('.',',')+' L'}
function popAcik(){var b=document.getElementById('bpop');return b&&!b.hidden}
function pop(sec,yedek){return function(){return popAcik()&&document.querySelector(sec)?[sec,0,0]:yedek}}
var DERS={
ulttani:{ad:'Cihazı tanıma',ozet:'Ultrason nasıl çalışır; hazne, 2/3 çizgisi, panel, sepet ve su kabı.',baslik:'ULTRASONİK BANYO · TANIMA',mod:'parts',gorev:'parts',
 adim:[
 {bolum:'Giriş',b:'Ultrasonik banyo ne işe yarar?',
  html:'<p>Ultrasonik banyo, su dolu çelik bir haznedir. Tabanındaki parçalar suya insan kulağının duyamayacağı kadar yüksek frekansta (40 kHz) <b>ses dalgası</b> verir.</p><p>Bu dalgalar suda milyonlarca minik kabarcık oluşturur ve bu kabarcıklar hemen patlar. Buna <b>kavitasyon</b> denir.</p><p>Laboratuvarda iki iş için kullanılır:</p><ul><li><b>Degazlama:</b> LC-MS/MS mobil fazındaki çözünmüş havayı çıkarmak.</li><li><b>Çözme:</b> tüp duvarına yapışmış kuru kalıntıyı çözücüde çözmek.</li></ul><p>Sahneyi sürükleyerek döndürebilir, tekerlekle yakınlaştırabilirsiniz.</p>'},
 {bolum:'Parçalar',ask:'Çelik <b>hazneye</b> tıklayın.',parca:['tank'],halka:['part:tank',0,80],
  b:'Hazne',ne:'Yaklaşık 3 litrelik paslanmaz çelik kaptır. Ses dalgasını veren parçalar tabanına yapıştırılmıştır.',neden:'Ses dalgası suyla numuneye geçer. Numune doğrudan değil, <b>suyun içinden</b> etkilenir.',yanlis:'Hazneye numune çözeltisi dökülmez; içinde yalnızca su olur. Numune kendi kabında suya konur.'},
 {bolum:'Parçalar',ask:'Haznenin iç duvarındaki <b>su seviyesi işaretine</b> tıklayın.',parca:['mark','tank'],halka:['part:mark',0,56],
  b:'2/3 çizgisi',ne:'Haznenin yaklaşık üçte ikisini gösteren çizgidir.',neden:'Numune kabı içindeyken su bu çizgide olmalıdır. Ses dalgası en iyi bu seviyede iletilir.',yanlis:'Az su: ses enerjisi metalde kalır, parçalar ısınıp bozulur. Fazla su: numune konunca taşar.'},
 {bolum:'Parçalar',ask:'Ön paneldeki çarpı işaretli <b>“kuru çalıştırma” uyarısına</b> tıklayın.',parca:['dry'],halka:['part:dry',0,44],
  b:'Kuru çalıştırma uyarısı',ne:'“Susuz çalıştırmayın” anlamına gelen simgedir.',neden:'Susuz çalışan banyo birkaç saniyede bozulur.',yanlis:'Banyo <b>hiçbir zaman</b> boşken açılıp çalıştırılmaz.'},
 {bolum:'Parçalar',ask:'Paneldeki <b>süre göstergesine</b>, sıcaklık göstergesine ya da tuşlardan birine tıklayın.',parca:['tmin','ttmp','bt','led'],halka:['part:tmin',0,56],
  b:'Kontrol paneli',html:'<ul><li><b>Süre (Min):</b> 1–99 dakika ayarlanır. Süre bitince cihaz durur ve öter.</li><li><b>Sıcaklık (°C):</b> solda ayar, sağda suyun gerçek sıcaklığı.</li><li><b>Tuşlar:</b> süre ▲▼, sıcaklık ▲▼, ortada sarı <b>▶❚❚</b> (başlat / duraklat), altta kırmızı <b>⏻</b> (aç / kapat).</li><li><b>Işıklar:</b> Ultrasonic = ultrason çalışıyor; Heating = ısıtıcı çalışıyor.</li></ul><p>Ultrason suyu kendiliğinden de yavaşça ısıtır.</p>'},
 {bolum:'Parçalar',ask:'Haznenin içindeki <b>paslanmaz sepete</b> tıklayın.',parca:['basket','tank'],halka:['part:basket',0,64],
  b:'Sepet',ne:'Haznenin içine oturan delikli çelik sepettir.',neden:'Numune kabı sepete konur. Sepet titreşimi eşit dağıtır ve cam şişeyi tabana çarpmaktan korur.',yanlis:'Şişe haznenin tabanına doğrudan konmaz.'},
 {bolum:'Malzemeler',ask:'Tezgâhtaki <b>su kabına</b> ya da <b>mobil faz şişesine</b> tıklayın.',parca:['jug','bottle','rack'],halka:['part:jug',0,60],
  b:'Su kabı ve mobil faz şişesi',html:'<ul><li><b>Su kabı:</b> hazne bununla doldurulur. Su kirlenince değiştirilir.</li><li><b>Mobil faz şişesi (1 L):</b> LC-MS/MS’in kullandığı sıvı (su + %0,1 formik asit). Bir sonraki bölümde bunu degaze edeceksiniz.</li></ul>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Ultrasonik banyoda numuneyi etkileyen nedir?',['Sıcak hava','Sudaki ses dalgalarının oluşturduğu minik kabarcıklar (kavitasyon)','Mıknatıs'],1,'Ses dalgası suyun içinden numune kabına geçer.'],
 ['Hazne ne kadar doldurulur?',['Yaklaşık 2/3’üne kadar','Ağzına kadar','Birkaç santim, az su yeter'],0,'Az su cihazı bozar, fazla su taşar.'],
 ['Banyo susuz çalıştırılırsa ne olur?',['Hiçbir şey olmaz','Daha hızlı çalışır','Ses dalgasını veren parçalar ısınıp bozulur'],2,'Paneldeki çarpı işaretli simge bunu hatırlatır.']],
 bitti:function(){S().done.parts=1}},

ultdeg:{ad:'Mobil fazı degaze etme',ozet:'Hazneyi doldurma, kapağı gevşetme, 10 dakika ısıtmasız ultrason ve kapatma.',baslik:'ULTRASONİK BANYO · DEGAZLAMA',mod:'use',gorev:'degas',
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',
  html:'<p>LC-MS/MS’in <b>mobil fazı</b> (1 L su + %0,1 formik asit) içinde çözünmüş hava vardır. Bu hava cihazın pompasında kabarcık yapar:</p><ul><li>Basınç dalgalanır,</li><li>Maddelerin çıkış zamanı kayar,</li><li>Sonuçlar tutarsız olur.</li></ul><p>Bu yüzden şişe kullanılmadan önce ultrasonik banyoda <b>degaze edilir</b>: çözünmüş hava kabarcık hâlinde dışarı atılır.</p>'},
 {bolum:'Hazırlık',ask:'Tezgâhtaki <b>su kabına</b> tıklayın; açılan kutudan <b>+0,5 L</b> ile hazneye su ekleyin. Haznede 1,5–2,0 L olunca durun.',canli:function(s){return 'Haznedeki su: '+L1(s.water)+' · hedef 1,5–2,0 L (şişe konunca +0,45 L)'},
  halka:pop('#w1',['part:jug',0,60]),izin:['part:jug','bath','part:tank','part:mark','part:basket'],ok:function(s){return s.water>=1.5&&s.water<=2.05},hata:function(){return S().water>2.05?'Su fazla. Kutudaki <b>Banyoyu boşalt</b> ile boşaltıp yeniden doldurun.':''},
  b:'Su hazır',html:'<p>Haznede yeterince su var. Şişe konunca su yükselecek ve <b>2/3 çizgisine</b> gelecek.</p><p>Su seviyesi şişeyle birlikte hesaplanır: önce boş haznede çizgiye kadar doldurursanız, şişeyi koyunca taşar.</p>'},
 {bolum:'Hazırlık',ask:'Cihazı açın: paneldeki kırmızı <b>⏻</b> tuşuna tıklayın.',halka:['key:pw',0,40],izin:['key:pw'],ok:function(s){return s.pow},
  b:'Cihaz açık',html:'<p>Ekranda ayarlı süre (dakika) ve sıcaklık görünüyor.</p><p>Degazlamada <b>ısıtma yapılmaz</b>. Isınan mobil fazdan çözücü buharlaşır ve bileşimi değişir. Sıcaklık ayarı oda sıcaklığında kalır.</p>'},
 {bolum:'Şişe',ask:'<b>Mobil faz şişesine</b> tıklayın ve açılan kutudan <b>Kapağı yarım tur gevşet</b>’i seçin.',halka:pop('#b1',['bottle',0,64]),izin:['bottle'],ok:function(s){return s.bot.cap==='loose'},
  b:'Kapak gevşek',html:'<p>Kapak yarım tur gevşetildi, ama şişenin üstünde duruyor.</p><ul><li>Kapak <b>sıkı</b> kalırsa çıkan gaz kaçamaz; degazlama olmaz, şişede basınç birikir.</li><li>Kapak <b>tamamen açılırsa</b> şişeye toz ve banyo suyu girebilir.</li></ul>'},
 {bolum:'Şişe',ask:'Şişeye yeniden tıklayın ve <b>Şişeyi banyoya (sepete) koy</b>’u seçin.',halka:pop('#b2',['bottle',0,64]),izin:['bottle'],ok:function(s){return s.bot.in},
  b:'Şişe sepette',html:function(){var s=S(),lv=s.water+.45;return '<p>Şişe sepete kondu; su yükseldi: haznede şimdi <b>'+L1(lv)+'</b>.</p><p>Su seviyesi şişedeki sıvının seviyesine yakın olmalı. Böylece ses dalgası şişedeki sıvının tamamına ulaşır.</p>'}},
 {bolum:'Çalıştırma',ask:'Süreyi <b>10 dakikaya</b> getirin: süre göstergesinin altındaki <b>▲</b> tuşuna tıklayın.',canli:function(s){return 'Ayarlı süre: '+s.tmin+' dk · hedef 10 dk'},halka:function(s){return [s.tmin>10?'key:tDn':'key:tUp',0,36]},izin:['key:tUp','key:tDn'],ok:function(s){return s.tmin===10},
  hata:function(){return S().tmin>10?'Süre 10 dakikayı geçti. <b>▼</b> ile azaltın.':''},
  b:'Süre: 10 dakika',html:'<p>Mobil faz degazlaması için <b>10–15 dakika</b> yeterlidir. Daha uzun süre bir yarar sağlamaz; su ısınır ve çözücü buharlaşır.</p>'},
 {bolum:'Çalıştırma',ask:'Ortadaki sarı <b>▶❚❚</b> tuşuna tıklayarak ultrasonu başlatın.',oto:1,halka:['key:go',0,40],izin:['key:go'],ok:function(s){return s.ev.start}},
 {bolum:'Çalıştırma',ask:'Ultrason çalışıyor. Şişeyi izleyin… (Simülasyonda 1 saniye = 1 dakika.)',bekle:1,izin:[],canli:function(s){var r=Math.max(0,Math.ceil(s.rem));return (s.ev.fin?'Süre bitti ✓':'Kalan: '+Math.floor(r/60)+' dk '+(r%60)+' sn')+' · çözünmüş gaz %'+Math.round(s.bot.gas)},ok:function(s){return s.ev.fin},
  b:'Degazlama tamam',html:function(){return '<p>Çalışırken şişenin içinden <b>kabarcıklar</b> yükseldi: bu, sıvıdan çıkan çözünmüş havadır. Çözünmüş gaz %100’den <b>%'+Math.round(S().bot.gas)+'</b>’e indi.</p><p>Süre bitince cihaz öttü ve kendiliğinden durdu.</p>'}},
 {bolum:'Bitirme',ask:'Şişeye tıklayın ve <b>Şişeyi banyodan çıkar</b>’ı seçin.',oto:1,halka:pop('#b2',['bottle',0,64]),izin:['bottle'],ok:function(s){return !s.bot.in}},
 {bolum:'Bitirme',ask:'Şişeye yeniden tıklayın ve <b>Kapağı sıkıca kapat</b>’ı seçin.',oto:1,halka:pop('#b1',['bottle',0,64]),izin:['bottle'],ok:function(s){return s.bot.cap==='tight'}},
 {bolum:'Bitirme',ask:'Cihazı kapatın: kırmızı <b>⏻</b> tuşuna tıklayın.',halka:['key:pw',0,40],izin:['key:pw'],ok:function(s){return !s.pow},
  b:'Mobil faz hazır',html:'<p>Şişenin dışı kuru bir kâğıtla silinir, üzerine tarih ve hazırlayanın adı yazılır, sonra LC-MS/MS’e bağlanır. Cihazda pompa bir süre yeni sıvıyla yıkanır (<b>purge</b>).</p><p>Aklınızda kalsın:</p><ul><li>Su <b>2/3</b> çizgisine (şişeyle birlikte).</li><li>Kapak <b>gevşek</b>, ısıtma <b>yok</b>.</li><li><b>10 dakika</b> ultrason.</li><li>Şişeyi çıkar, kapağı <b>sık</b>, cihazı <b>kapat</b>.</li></ul>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Mobil faz neden degaze edilir?',['Rengi açılsın diye','Çözünmüş hava pompada kabarcık yapıp basıncı dalgalandırmasın diye','Soğusun diye'],1,'Kabarcıklar çıkış zamanlarını kaydırır, sonuçlar tutarsız olur.'],
 ['Degazlamada şişenin kapağı nasıl olmalıdır?',['Sıkıca kapalı','Tamamen açık','Yarım tur gevşek'],2,'Gaz kaçabilir, ama toz ve su girmez.'],
 ['Degazlama sırasında banyo ısıtılır mı?',['Hayır; ısınan mobil fazın bileşimi buharlaşmayla değişir','Evet, 60 °C’ye','Evet, kaynayana kadar'],0,'Ultrason suyu zaten biraz ısıtır.']],
 bitti:function(){S().done.degas=1}}
};
return {sayfa:'ultra_pilot.html',hazir:'__ult',ad:'ULTRASONİK BANYO',model:'3 L · 40 kHz',adTam:'Ultrasonik banyonun',
 acl:'Cihazı iki kısa bölümde, adım adım öğrenin. Sırayla ilerlemeniz önerilir; her bölüm 3–5 dakika sürer.',
 GM:{parts:'ulttani',degas:'ultdeg'},AD:AD,ADI:ADI,DERS:DERS,SIRA:['ulttani','ultdeg'],
 senkron:function(s,o){if(o.ulttani&&o.ulttani.bitti)s.done.parts=1;if(o.ultdeg&&o.ultdeg.bitti)s.done.degas=1}};
}

/* ---------- santrifüj ---------- */
function santrifuj(){
var AD={'Kapak (kilitli)':'lid','Ekran':'lcd','PROG tuşu':'k_prog','RCF tuşu':'k_rcf','SELECT tuşu':'k_select','START/STOP tuşu':'k_start','Ayar düğmesi':'knob','Rotor':'rotor','Rotor somunu (mil)':'hub','Rotor haznesi':'bowl','Tüp rafı (tepsi)':'rack'};
var ADI={lid:'kapak',lcd:'ekran',k_prog:'PROG tuşu',k_rcf:'RCF tuşu',k_select:'SELECT tuşu',k_start:'START/STOP tuşu',knob:'ayar düğmesi',rotor:'rotor',hub:'rotor somunu',bowl:'rotor haznesi',rack:'tüp rafı',tube:'tüp'};
for(var i=1;i<=5;i++)AD['Kan '+i]='tube';
function tup(id){return S().tray.filter(function(t){return t.id===id})[0]}
function g2(v){return v.toFixed(2).replace('.',',')}
function rpm(v){return Math.round(v).toLocaleString('tr-TR')}
function mmss(sn){sn=Math.max(0,Math.round(sn));return Math.floor(sn/60)+':'+('0'+sn%60).slice(-2)}
function tol(s){return {buc:.5,mic:.15,ang:.5}[s.rotor]||.5}
function denge(s){var v=window.imb(),n=s.slots.filter(Boolean).length,t=tol(s);return 'Rotorda '+n+' tüp · dengesizlik '+g2(v.m)+' g (sınır '+g2(t)+' g)'+(n&&v.m>t?' ✗':n?' ✓':'')}
function ekran(s){return 'Ekran: P'+(s.prog||'–')+' · '+rpm(s.rpm)+' rpm · '+mmss(s.sec)+' · ayar alanı: '+(s.sel2==='t'?'süre':'hız')}
function calisma(s){return {idle:'Hazır',accel:'Hızlanıyor',run:'Çalışıyor',decel:'Yavaşlıyor',error:'DENGESİZLİK, duruyor'}[s.phase]+' · '+rpm(Math.round(s.cur/10)*10)+' rpm · kalan '+mmss(s.phase==='idle'?0:s.left)}
var KAPAK=['lidH',-10,80];
/* raftaki yerleşmemiş tüplerin hepsine sarı halka; tüp seçiliyse önerilen karşı yuvaya da */
function tupHalka(tur,yk){return function(s){var L=s.tray.filter(function(t){return (tur?tur.indexOf(t.kind)>=0:true)&&t.where==null}).map(function(t){return ['tubes.'+t.id,yk||-46,56]});
 var N=s.slots.length;if(s.sel){for(var k=0;k<N;k++){if(s.slots[k]&&!s.slots[(k+N/2)%N]){L.unshift(['slotHot.'+s.rotor+'.'+((k+N/2)%N)+'.hs',0,46]);break}}}return L.length?L:null}}
/* ayar düğmesi açılır kutusu açıksa halka sağ/sol düğmede */
function dugmeHalka(yon){return function(){var k=document.getElementById('kpop');return k&&!k.hidden?['#'+(yon<0?'kL':'kR'),0,0]:['keys.knob',0,54]}}
function ac_(){return {bolum:'Hazırlık',ask:'<b>Kapağın ön kenarına</b> tıklayarak kapağı açın.',oto:1,halka:KAPAK,izin:['lid'],ok:function(s){return s.lid==='open'}}}
function kapat_(){return {bolum:'Çalıştırma',ask:'Kapağın ön kenarına tıklayarak <b>kapağı kapatın</b>.',halka:KAPAK,izin:['lid'],ok:function(s){return s.lid==='closed'&&s.f.closed},
  hata:function(){var s=S();return s.lid==='closed'&&!s.f.placed?'Yerleşim tamamlanmadan kapak kapandı. Kapağı yeniden açıp tüpleri dengeli yerleştirin.':''},
  b:'Kapak kapalı',html:'<p>Kapak kapandı. Çalışma sırasında kapak <b>kilitlenir</b>: rotor tamamen durmadan açılamaz. Dönen bir rotora el değmesi ciddi yaralanmaya yol açar; kapağı zorlamayın.</p>'}}
function start_(){return {bolum:'Çalıştırma',ask:'Kırmızı <b>START/STOP</b> tuşuna basın.',halka:['keys.start',0,40],izin:['key:start'],ok:function(s){return s.phase!=='idle'||!!s.result},
  hata:function(){var s=S();return s.msg==='Err'?'Cihaz başlamadı: hız, takılı rotorun sınırının üstünde. Hızı düşürün.':s.msg==='LId'?'Kapak açık; cihaz çalışmaz. Önce kapağı kapatın.':''},
  b:'Santrifüj hızlanıyor',html:'<p>Rotor birkaç saniyede ayarlanan hıza çıkar; o sırada cihaz dengesizliği de ölçer. Dengesizlik sınırı aşılırsa kendini durdurur.</p><p>Süre, rotor <b>ayarlanan hıza ulaştığında</b> saymaya başlar. Simülasyonda süre hızlandırılmıştır.</p>'}}
function bekle_(){return {bolum:'Çalıştırma',ask:'Santrifüj çalışıyor. Kapaktaki <b>pencereden</b> rotoru izleyin; rotor <b>tamamen durana</b> kadar bekleyin.',bekle:1,izin:[],canli:calisma,ok:function(s){return s.phase==='idle'&&!!s.result},
  b:'Rotor durdu',html:'<p>Süre doldu, rotor yavaşladı ve durdu; ekranda <b>End</b> yazıyor. Kapak kilidi ancak şimdi açılır.</p><p>Bitince tüpler <b>sarsılmadan</b> alınır: ayrılan tabakalar yeniden karışmasın.</p>'}}
function sonuc_(ok,kotu){return {bolum:'Sonuç',ask:'<b>Kapağı açın</b> ve tüplere bakın.',halka:KAPAK,izin:['lid'],ok:function(s){return s.f.done},
  b:function(){var k=S().tray.filter(function(t){return t.st}).map(function(t){return t.st}),w=k.indexOf('bad')>=0?'bad':k.indexOf('mid')>=0?'mid':'ok';return w==='ok'?'Ayrım tamam ✓':'Ayrım yetersiz'},
  html:function(){var r=S().result,k=S().tray.filter(function(t){return t.st}).map(function(t){return t.st}),w=k.indexOf('bad')>=0?'bad':k.indexOf('mid')>=0?'mid':'ok';
   return '<p>'+rpm(r.rpm)+' rpm · '+(r.min).toFixed(1).replace('.',',')+' dakika.</p>'+(w==='ok'?ok:kotu)}}}
var KOVA='<p>Takılı rotor <b>kovalı (swing-out) rotor</b>: dört kolun ucunda dört kova, her kovada turuncu adaptörde 4 yuva (toplam 16). En fazla <b>4500 rpm</b>. Rotor dönerken kovalar dışa doğru yatay açılır; tüpler dönme sırasında yatay durur, çöken madde tüpün tam dibinde toplanır.</p><p>Yuvalar numaralıdır: <b>1–4</b> birinci kova, <b>5–8</b> ikinci, <b>9–12</b> üçüncü, <b>13–16</b> dördüncü. Karşılıklı kovalar <b>1. ↔ 3.</b> ve <b>2. ↔ 4.</b>; bir yuvanın tam karşısı <b>8 yuva ötesidir</b> (1 ↔ 9, 5 ↔ 13).</p>';
var KUR=function(rot){return function(){var s=S();if(s.rotor!==rot){s.rotor=rot;s.slots=Array({buc:16,mic:24,ang:12}[rot]).fill(null);s.tray.forEach(function(t){t.where=null})}var k=document.getElementById('kpop');if(k)k.hidden=true}};

var DERS={
sentani:{ad:'Cihazı tanıma',ozet:'Santrifüj ne yapar; kapak, ekran, tuşlar tek tek, ayar düğmesi, rotor ve denge.',baslik:'SANTRİFÜJ · CİHAZI TANIMA',mod:'parts',gorev:'parts',kur:function(){KUR('buc')();S().lid='closed'},
 adim:[
 {bolum:'Giriş',b:'Santrifüj ne işe yarar?',
  html:'<p>Santrifüj tüpleri çok hızlı döndürür. Dönme, tüpteki her şeyi dışa, yani tüpün <b>dibine</b> doğru iten güçlü bir kuvvet yaratır. Bu kuvvet yerçekiminin binlerce katıdır.</p><p>Sonuçta <b>ağır olan dibe</b> iner, hafif olan üstte kalır. Laboratuvarda üç iş için kullanılır:</p><ul><li><b>Kan:</b> hücreleri dibe indirip üstte berrak plazmayı ayırmak.</li><li><b>Sıvı-sıvı ekstraksiyon:</b> vorteksten sonra karışan iki sıvıyı yeniden ayırmak.</li><li><b>Protein çöktürme:</b> çöken proteinleri mikrotüpün dibinde sıkı bir pelet hâline getirmek.</li></ul><p>Bu kadar hızlı dönen bir cihazda en önemli kural <b>dengedir</b>; bunu bölümler boyunca göreceksiniz.</p>'},
 {bolum:'Ön panel',ask:'Cihazın üstündeki beyaz <b>kapağa</b> tıklayın.',parca:['lid'],halka:KAPAK,
  b:'Kapak (kilitli)',ne:'Rotor haznesini kapatan, menteşeli kapaktır.',neden:'Çalışma sırasında kilitlenir: rotor tamamen durmadan açılmaz. Kapak açıkken de cihaz çalışmaz.',yanlis:'Kapak hiçbir zaman zorlanmaz. Çalışırken açılmaya çalışılan kapak hem kilidi bozar hem de dönen rotora el değebilir.'},
 {bolum:'Ön panel',ask:'Ön paneldeki turuncu <b>ekrana</b> tıklayın.',parca:['lcd'],halka:['lcd',0,110],
  b:'Ekran',ne:'Soldan sağa: <b>P</b> program numarası, <b>rpm</b> hız, <b>dk:sn</b> süre.',neden:'Durgunken ayarları, çalışırken anlık hızı ve kalan süreyi gösterir. Altı çizili alan, ayar düğmesinin değiştireceği alandır.',yanlis:'Başlatmadan önce ekrandaki hız ve süre <b>her seferinde</b> okunur. Önceki kullanıcıdan kalan program numunenize uygun olmayabilir.'},
 {bolum:'Ön panel',ask:'Ekranın altındaki ilk tuşa, <b>PROG</b> tuşuna tıklayın.',parca:['k_prog'],halka:['keys.prog',0,40],
  b:'PROG tuşu',ne:'Kayıtlı hazır programları sırayla yükler: P1, P2, P3.',neden:'Sık kullanılan hız-süre ikilileri hazır durur; her basışta sıradaki program ekrana gelir.',yanlis:'Program yalnız bir başlangıçtır. Yüklenen hızın takılı rotorun sınırı içinde ve numuneye uygun olduğu her seferinde kontrol edilir.'},
 {bolum:'Ön panel',ask:'Yanındaki <b>RCF</b> tuşuna tıklayın.',parca:['k_rcf'],halka:['keys.rcf',0,40],
  b:'RCF tuşu',ne:'Hızı g kuvveti olarak gösterir (RCF: yerçekiminin kaç katı).',neden:'Aynı rpm, büyük rotorda daha büyük kuvvet yaratır; yayınlarda bu yüzden g kuvveti verilir.',yanlis:'Bu laboratuvarda ayarlar <b>rpm</b> ile yapılır; RCF tuşunu kullanmanız gerekmez.'},
 {bolum:'Ön panel',ask:'<b>SELECT</b> tuşuna tıklayın.',parca:['k_select'],halka:['keys.select',0,40],
  b:'SELECT tuşu',ne:'Ayar alanını <b>hız ↔ süre</b> arasında değiştirir.',neden:'Ekranda seçili alanın altı çizilidir. Ayar düğmesi yalnız seçili alanı değiştirir.',yanlis:'Değer girmeden önce altı çizili alana bakın: hızı değiştirmek isterken süreyi değiştirmek sık yapılan bir hatadır.'},
 {bolum:'Ön panel',ask:'Kırmızı <b>START/STOP</b> tuşuna tıklayın.',parca:['k_start'],halka:['keys.start',0,40],
  b:'START/STOP tuşu',ne:'Çalıştırmayı başlatır; çalışırken basılırsa durdurur.',neden:'Durdurulduğunda rotor yavaşlar; kapak ancak rotor tamamen durunca açılır.',yanlis:'Acil durumda da STOP kullanılır; kapak zorlanmaz, rotorun durması beklenir.'},
 {bolum:'Ön panel',ask:'Sağdaki büyük yuvarlak <b>ayar düğmesine</b> tıklayın.',parca:['knob'],halka:['keys.knob',0,54],
  b:'Ayar düğmesi',ne:'SELECT ile seçilen alanı (hız ya da süre) değiştirir.',neden:'<b>Sağa çevirince artar, sola çevirince azalır.</b> Hız 100 rpm, süre 30 saniye adımlarla değişir. Simülasyonda düğmeye tıklayınca açılan kutudaki ↻ (sağa) ve ↺ (sola) ile çevirirsiniz; basılı tutunca hızlı değişir.',yanlis:'Değeri değiştirdikten sonra ekranı yeniden okuyun.'},
 {bolum:'İç parçalar',ask:'İçini görmek için kapağı açın.',dugme:['Kapağı aç',function(){S().lid='open'}],ok:function(s){return s.lidA>.9},
  b:'Rotor haznesi açıldı',html:KOVA},
 {bolum:'İç parçalar',ask:'Kovalardan birine ya da rotorun koluna tıklayın.',parca:['rotor'],halka:['rotorG.buc',0,170],
  b:'Rotor',ne:'Tüpleri taşıyan, motorla dönen parçadır. Bu cihazın üç rotoru var; yuvalar turuncu halkalı ve numaralıdır.',neden:'<b>Kovalı rotor</b> 4 kova × 4 yuva, en fazla <b>4500 rpm</b> (kan, ekstraksiyon ve Falkon tüpleri). <b>Mikrotüp rotoru</b> 24 × 1,5/2 mL, en fazla <b>14000 rpm</b>. <b>Açılı rotor</b> 12 × 5 mL, en fazla <b>5000 rpm</b>. Tüp tipine göre rotor seçilir.',yanlis:'Her rotorun bir <b>en yüksek hızı</b> vardır ve aşılmaz. Kovalı rotorda dört kova her zaman takılı olur; boş kova bile çıkarılmaz.'},
 {bolum:'İç parçalar',ask:'Rotorun ortasındaki <b>somuna</b> tıklayın.',parca:['hub'],halka:['rotorG.buc',-26,50],
  b:'Rotor somunu (mil)',ne:'Rotoru motor miline sabitler.',neden:'Rotor takıldıktan sonra somunun sıkıldığından emin olunur; gevşek rotor dönerken yerinden çıkabilir.',yanlis:'Rotor değiştirirken somun iyice sıkılır; çalışmadan önce rotoru elle hafifçe çevirip yerine oturduğu kontrol edilir.'},
 {bolum:'İç parçalar',ask:'Rotorun çevresindeki <b>hazneye</b> tıklayın.',parca:['bowl'],halka:['rotorG.buc',10,230],
  b:'Rotor haznesi',ne:'Rotorun içinde döndüğü hazne.',neden:'Bir tüp kırılır ya da sızdırırsa sıvıyı tutar.',yanlis:'Hazne temiz ve kuru tutulur. Kırık tüp olursa cihaz durunca temizlenir; kan dökülmüşse dezenfekte edilir.'},
 {bolum:'İç parçalar',ask:'Sağdaki <b>tüp rafına</b> ya da raftaki bir tüpe tıklayın.',parca:['rack','tube'],halka:['rack',-30,140],
  b:'Tüpler ve denge',html:'<p>Rafta 5 kan tüpü duruyor. Santrifüjde en önemli kural: <b>tüpler rotora karşılıklı ve eşit ağırlıkta</b> dizilir.</p><p>Dengesiz bir rotor dönerken şiddetle titrer, cihazı tezgâhta yürütür, yatakları ve rotoru bozar. Bu cihaz dengesizliği algılayınca kendini durdurur.</p><p>Tek sayıda tüp varsa karşısına aynı ağırlıkta <b>su dolu bir denge tüpü</b> konur.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Santrifüjde tüpler nasıl dizilir?',['Yan yana, aynı tarafa','Karşılıklı ve eşit ağırlıkta','Rastgele'],1,'Dengesiz rotor titrer ve cihaz durur; rotor ve yataklar zarar görür.'],
 ['Hızı ya da süreyi azaltmak için ne yapılır?',['Ayar düğmesi sola çevrilir','PROG tuşuna basılır','Cihaz kapatılıp açılır'],0,'Sağa çevirince artar, sola çevirince azalır; SELECT hangi alanın değişeceğini seçer.'],
 ['Kapak ne zaman açılabilir?',['Rotor tamamen durduktan sonra','Süre bitmeden önce','Yavaşlarken'],0,'Çalışma sırasında kapak kilitlidir; zorlanmaz.']],
 bitti:function(){S().done.parts=1;S().lid='closed'}},

senkan:{ad:'Kan: plazma ayırma',ozet:'Kovalı rotor, karşılıklı dizme, denge tüpü, 4000 rpm 10 dakika.',baslik:'SANTRİFÜJ · KANDAN PLAZMA',mod:'use',gorev:'kan',kur:KUR('buc'),
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',
  html:'<p>Rafta <b>5 kan tüpü</b> var (her biri 4,0 mL). Hücreleri dibe indirip üstte berrak <b>plazmayı</b> ayıracaksınız.</p><p>Sıra hep aynıdır:</p><ul><li>Kapağı aç, doğru rotoru kontrol et.</li><li>Tüpleri <b>karşılıklı</b> diz; gerekiyorsa denge tüpü koy.</li><li>Kapağı kapat, hız ve süreyi ayarla, başlat.</li><li>Rotor durunca kapağı aç, tüpleri sarsmadan al.</li></ul><p>Her adımda yalnız o adımın parçasıyla çalışılır; açıklamayı okuyup <b>Devam</b>’a basın.</p>'},
 ac_(),
 {bolum:'Hazırlık',b:'Doğru rotor mu?',html:KOVA+'<p>Kan tüpleri kovadaki adaptörlere dik oturur; kovalı rotor kan için doğru rotordur.</p>'},
 {bolum:'Yerleştirme',ask:'Raftaki <b>5 kan tüpünü</b> rotora yerleştirin: tüpe tıklayın, sonra bir yuvaya. Her tüpün <b>karşısına</b> (8 yuva ötesi) bir tüp gelsin.',canli:denge,izin:['tube','slot','rack'],
  halka:tupHalka(['blood']),
  ok:function(s){return s.tray.filter(function(t){return t.kind==='blood'}).every(function(t){return t.where!=null})},
  b:function(){return S().f.placed?'Dengeli yerleştirdiniz':'Bir tüp karşısız kaldı'},
  html:function(){return S().f.placed?'<p>Beş tüpü dengeli dizdiniz. Yine de en güvenli ve en kolay yol, tek kalan tüpün karşısına <b>denge tüpü</b> koymaktır.</p>':'<p>Beş tek sayıdır: iki çift karşılıklı, ama biri <b>karşısız</b>. Göstergede dengesizlik sınırın üstünde; cihaz bu hâliyle çalıştırılırsa titreşip durur.</p><p>Çözüm: karşısına aynı ağırlıkta <b>su dolu denge tüpü</b> koymak.</p>'}},
 {bolum:'Yerleştirme',ask:'Denge tüpü hazırlayın: kan tüpü 4,0 mL kan içeriyor (kan sudan biraz ağırdır). Aşağıdan su hacmini seçin, sonra hazırlanan tüpü <b>karşısız tüpün karşısına</b> koyun.',canli:denge,izin:['tube','slot'],
  dugme:[['3,0 mL',function(){window.makeBalance(3)}],['3,5 mL',function(){window.makeBalance(3.5)}],['4,0 mL',function(){window.makeBalance(4)}],['4,5 mL',function(){window.makeBalance(4.5)}]],
  halka:function(s){var d=s.tray.filter(function(t){return t.kind==='water'})[0];if(!d||d.where!=null)return null;var N=s.slots.length;for(var k=0;k<N;k++){if(s.slots[k]&&!s.slots[(k+N/2)%N])return ['slotHot.'+s.rotor+'.'+((k+N/2)%N)+'.hs',0,46]}return null},
  ok:function(s){return s.f.placed},
  hata:function(){var s=S(),d=s.tray.filter(function(t){return t.kind==='water'})[0];if(!d||d.where==null)return '';return 'Hâlâ dengesiz ('+g2(window.imb().m)+' g). Denge tüpü doğru yuvada mı, hacmi kan tüpüne yakın mı? Tüpe tıklayarak geri alabilir, başka hacim seçebilirsiniz.'},
  b:'Rotor dengeli',html:'<p>Dengesizlik sınırın altında. Denge tüpü, karşısındaki numuneyle <b>aynı ağırlıkta</b> olmalıdır; aynı hacim yetmez, çünkü kan sudan yoğundur (≈ 1,06 g/mL).</p><p>Gerçekte denge tüpü terazide tartılarak hazırlanır.</p>'},
 kapat_(),
 {bolum:'Ayar',b:'Ekrana bakın',html:function(){var s=S();return '<p>Ekranda <b>P'+s.prog+' · '+rpm(s.rpm)+' rpm · '+mmss(s.sec)+'</b> yazıyor. Bu, mikrotüpler için kayıtlı program.</p><p>Takılı kovalı rotor en fazla <b>4500 rpm</b> çıkar. Bu ayarla START’a basılırsa cihaz çalışmaz ya da gerçek hayatta rotor zarar görür. Önceki kullanıcıdan kalan programa güvenilmez; her seferinde okunur.</p>'}},
 {bolum:'Ayar',ask:'<b>PROG</b> tuşuna basarak <b>P1</b>’i yükleyin.',halka:['keys.prog',0,40],izin:['key:prog'],canli:ekran,ok:function(s){return s.prog===1},
  b:'P1: 3000 rpm · 5:00',html:'<p>P1 rotorun sınırı içinde, ama kandan berrak plazma almak için <b>yetersiz</b>: 3000 rpm’de 5 dakikada hücreler tam çökmez, plazma bulanık kalır.</p><p>Plazma için bu laboratuvarda <b>4000 rpm, 10 dakika</b> kullanılır. Hızı ve süreyi ayar düğmesiyle değiştireceksiniz.</p>'},
 {bolum:'Ayar',ask:'Ayar alanı <b>hız</b> (ekranda rpm’in altı çizili). <b>Ayar düğmesine</b> tıklayın; açılan kutuda <b>↻ sağa</b> çevirerek hızı <b>4000 rpm</b>’e çıkarın. Fazla çıkarsa <b>↺ sola</b> çevirin.',halka:dugmeHalka(1),izin:['key:knob','key:select'],canli:ekran,ok:function(s){return s.rpm>=4000&&s.rpm<=4500&&s.sel2!=='t'},
  hata:function(){var s=S();return s.sel2==='t'?'Ayar alanı süreye geçmiş. <b>SELECT</b> ile hıza dönün.':s.rpm>4500?'Kovalı rotorun sınırı 4500 rpm. Düğmeyi <b>sola</b> çevirerek düşürün.':''},
  b:'Hız: 4000 rpm',html:'<p>Düğme sağa çevrildikçe hız 100 rpm artar, sola çevrildikçe azalır. Kuvvet <b>hızın karesiyle</b> artar: 4000 rpm, 3000 rpm’e göre yaklaşık 1,8 kat daha güçlü çöktürür.</p>'},
 {bolum:'Ayar',ask:'<b>SELECT</b> ile süre alanına geçin, sonra ayar düğmesini <b>sağa</b> çevirerek süreyi <b>10:00</b>’a getirin.',halka:function(s){return s.sel2==='t'?dugmeHalka(1)():['keys.select',0,40]},izin:['key:knob','key:select'],canli:ekran,ok:function(s){return s.sec>=600&&s.sec<=900&&s.rpm>=4000&&s.rpm<=4500},
  hata:function(){var s=S();return s.sec>900?'Süre fazla uzun. Düğmeyi <b>sola</b> çevirerek 10:00’a indirin.':''},
  b:'Ayar tamam: 4000 rpm · 10:00',html:'<p>Başlatmadan önce son kez ekrana bakılır: hız rotorun sınırı içinde mi, süre doğru mu?</p>'},
 start_(),bekle_(),
 sonuc_('<p>Tüplerde altta koyu kırmızı <b>hücreler</b>, üstte berrak sarı <b>plazma</b>. Plazma, hücre tabakasına dokunulmadan pipetle alınır.</p><p>Aklınızda kalsın:</p><ul><li>Tüpler <b>karşılıklı</b>; tek kalan için <b>denge tüpü</b>.</li><li>Ekranı oku: hız rotorun <b>sınırı içinde</b> mi?</li><li>Kan için <b>4000 rpm, 10 dakika</b>.</li><li>Kapak ancak rotor <b>durunca</b> açılır.</li></ul>','<p>Plazma bulanık; hücreler tam çökmemiş. Kan için daha yüksek hız ya da daha uzun süre gerekir. Bölümü baştan deneyin.</p>'),
 {bolum:'Kontrol',test:1}],
 soru:[
 ['5 kan tüpü santrifüjlenecek. Ne yapılır?',['Beşi yan yana dizilir','Tek kalanın karşısına aynı ağırlıkta su tüpü konur','Bir tüp dışarıda bırakılır, analiz edilmez'],1,'Denge tüpü numuneyle aynı ağırlıkta olmalıdır.'],
 ['Ekranda 13000 rpm yazıyor, kovalı rotor takılı (en fazla 4500 rpm). Ne yapılır?',['Hemen başlatılır','Hız rotorun sınırı içine düşürülür','Süre kısaltılır'],1,'Rotorun en yüksek hızı aşılmaz.'],
 ['Denge tüpüne neden kanla aynı hacimde değil, aynı ağırlıkta su konur?',['Kan sudan yoğundur; eşit hacim eşit ağırlık değildir','Su daha ucuzdur','Fark etmez'],0,'Kan ≈ 1,06 g/mL; denge ağırlığa göre kurulur.']],
 bitti:function(){S().done.kan=1}},

senlle:{ad:'Ekstraksiyon tüplerinde faz ayırma',ozet:'Kovalı rotor, gaz alma, farklı yoğunluklu çözücüler, karşılıklı dizme.',baslik:'SANTRİFÜJ · FAZ AYIRMA',mod:'use',gorev:'lle',kur:KUR('buc'),
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',
  html:'<p>Rafta 4 ekstraksiyon tüpü var. Vorteksten sonra içlerindeki iki sıvı (sulu faz ve organik çözücü) bulanık bir emülsiyon hâlinde. Santrifüj iki sıvıyı yeniden ayıracak.</p><ul><li><b>E1, E2</b>: etil asetat (≈ 0,90 g/mL, sudan hafif: üstte kalır)</li><li><b>D1, D2</b>: diklorometan, DCM (≈ 1,33 g/mL, sudan ağır: alta iner)</li></ul><p>İki önemli nokta: organik çözücü tüpte <b>basınç</b> yapar ve iki çözücünün tüpleri <b>aynı ağırlıkta değildir</b>.</p>'},
 ac_(),
 {bolum:'Hazırlık',b:'Kovalı rotor',html:KOVA},
 {bolum:'Hazırlık',ask:'Her tüpün kapağını çeker ocakta yavaşça açıp <b>gazını alın</b>, sonra sıkıca kapatın.',izin:[],canli:function(s){var n=s.tray.filter(function(t){return (t.kind==='ea'||t.kind==='dcm')&&t.vent}).length;return 'Gazı alınan tüp: '+n+' / 4'},
  dugme:[['E1 gazını al',function(){window.vent('E1')}],['E2',function(){window.vent('E2')}],['D1',function(){window.vent('D1')}],['D2',function(){window.vent('D2')}]],
  ok:function(s){return s.tray.filter(function(t){return t.kind==='ea'||t.kind==='dcm'}).every(function(t){return t.vent})},
  b:'Basınç alındı',html:'<p>Uçucu çözücü vorteks sırasında ısınıp buharlaşır ve tüpte basınç yapar. Gazı alınmadan santrifüje konan tüp <b>sızdırabilir</b> ya da kapağı fırlayabilir; çözücü buharı haznede yayılır.</p><p>Gaz alma her zaman <b>çeker ocakta</b> yapılır.</p>'},
 {bolum:'Yerleştirme',ask:'Dört tüpü yerleştirin: her tüpün karşısına (8 yuva ötesi) <b>aynı çözücüyü</b> taşıyan tüpü koyun (E1 ↔ E2, D1 ↔ D2).',canli:denge,izin:['tube','slot','rack'],
  halka:tupHalka(['ea','dcm']),
  ok:function(s){return s.f.placed},
  hata:function(){var s=S();if(!s.tray.every(function(t){return t.where!=null}))return '';return 'Dört tüp de rotorda ama rotor dengesiz ('+g2(window.imb().m)+' g). Etil asetatlı tüp DCM’li tüpün karşısına konmuş olabilir; tüpe tıklayıp yerini değiştirin.'},
  b:'Dengeli',html:'<p>Etil asetatlı tüpler DCM’li tüplerden <b>daha hafiftir</b> (aynı hacimde DCM yaklaşık %50 daha ağır). Bu yüzden etil asetat tüpü DCM tüpünün karşısına konursa rotor dengesiz olur; karşılıklı tüpler aynı içerikte olmalıdır.</p>'},
 kapat_(),
 {bolum:'Ayar',ask:'<b>PROG</b> tuşuyla <b>P1</b>’i yükleyin (3000 rpm · 5:00).',halka:['keys.prog',0,40],izin:['key:prog'],canli:ekran,ok:function(s){return s.prog===1},
  b:'P1 faz ayırma için uygun',html:'<p>İki sıvıyı ayırmak, kanı ayırmaktan kolaydır: <b>3000 rpm, 5 dakika</b> emülsiyonu kırmaya yeter ve kovalı rotorun sınırı içindedir.</p><p>Gerekenden çok yüksek hız ekstraksiyonda yarar sağlamaz; tüpü zorlar.</p>'},
 start_(),bekle_(),
 sonuc_('<p>Fazlar net ayrıldı: etil asetat tüplerinde organik faz <b>üstte</b>, DCM tüplerinde <b>altta</b>. Ara yüzde emülsiyon yok.</p><p>Organik faz pipetle alınırken ara yüze dokunulmaz. DCM altta olduğu için pipet sulu fazın içinden geçirilir; bu yüzden DCM’li ekstraksiyonda dikkatli olunur.</p>','<p>Ara yüzde emülsiyon kaldı. Hızı ya da süreyi artırıp yeniden santrifüjleyin.</p>'),
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Organik çözücülü tüp santrifüjden önce neden gazı alınır?',['Çözücü buharı tüpte basınç yapar; tüp sızdırabilir ya da kapak fırlayabilir','Tüp soğusun diye','Gerek yoktur'],0,'Gaz alma çeker ocakta yapılır.'],
 ['Etil asetat tüpünün karşısına ne konur?',['DCM tüpü','Aynı hacimde etil asetat tüpü','Boş tüp'],1,'DCM daha yoğundur; karşılıklı tüpler aynı ağırlıkta olmalı.'],
 ['DCM ile ekstraksiyonda organik faz nerededir?',['Üstte','Altta','Ortada'],1,'DCM sudan ağırdır (1,33 g/mL).']],
 bitti:function(){S().done.lle=1}},

senepp:{ad:'Eppendorf: protein çöktürme',ozet:'Rotor değişimi, 7 mikrotüp + denge tüpü, 13000 rpm.',baslik:'SANTRİFÜJ · PROTEİN ÇÖKTÜRME',mod:'use',gorev:'epp',kur:KUR('buc'),
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',
  html:'<p>Rafta <b>7 Eppendorf mikrotüpü</b> var: her birinde 0,3 mL kan ve 0,7 mL asetonitril. Asetonitril kandaki proteinleri çöktürdü; tüpler bulanık.</p><p>Çöken proteinleri dibe sıkı bir <b>pelet</b> hâlinde indirip üstteki berrak sıvıyı (süpernatan) almak için <b>yüksek hız</b> gerekir: 10000 rpm’in üstü.</p><p>Takılı kovalı rotor ise en fazla 4500 rpm çıkar ve mikrotüp yuvası yoktur.</p>'},
 ac_(),
 {bolum:'Rotor',ask:'Mikrotüpler kovalı rotora uymaz. Aşağıdaki düğmeyle <b>mikrotüp rotorunu</b> takın.',izin:[],dugme:['Rotoru değiştir',function(){window.changeRotor()}],ok:function(s){return s.rotor==='mic'},
  hata:function(){var s=S();return s.slots.some(Boolean)?'Rotorda tüp var; önce tüpleri çıkarın.':s.rotor==='ang'?'Bu açılı rotor. Bir kez daha basın.':''},
  b:'Mikrotüp rotoru takıldı',html:'<p><b>24 × 1,5/2 mL</b>, en fazla <b>14000 rpm</b>. Rotor değiştirirken:</p><ul><li>Cihaz durmuş ve kapak açık olmalı; rotor boş olmalı.</li><li>Rotor mile tam oturtulur, <b>somun sıkılır</b>.</li><li>Mikrotüp kapakları kapatılır; açık kapak dönerken kopabilir.</li></ul><p>Yanlış rotorda mikrotüp boşta kalır ve kırılır.</p>'},
 {bolum:'Yerleştirme',ask:'Raftaki <b>7 mikrotüpü</b> rotora yerleştirin; mümkün olduğunca karşılıklı dizin (24 yuvalı rotorda karşı yuva 12 yuva ötesi).',canli:denge,izin:['tube','slot','rack'],
  halka:tupHalka(['epp'],-30),
  ok:function(s){return s.tray.filter(function(t){return t.kind==='epp'}).every(function(t){return t.where!=null})},
  b:'Yedi tüp: biri karşısız',html:'<p>Yedi tek sayıdır; bir tüp karşısız kalır. Mikrotüp rotorunda dengesizlik sınırı daha dardır (0,15 g): tüpler küçük, ama hız çok yüksek.</p>'},
 {bolum:'Yerleştirme',ask:'Denge mikrotüpü hazırlayın (mikrotüpte 1,0 mL sıvı var) ve <b>karşısız tüpün karşısına</b> koyun.',canli:denge,izin:['tube','slot'],
  dugme:[['0,8 mL su',function(){window.makeBalance(.8)}],['1,0 mL',function(){window.makeBalance(1)}],['1,2 mL',function(){window.makeBalance(1.2)}]],
  halka:function(s){var d=s.tray.filter(function(t){return t.kind==='wm'})[0];if(!d||d.where!=null)return null;for(var k=0;k<24;k++){var t=s.slots[k];if(t&&!s.slots[(k+12)%24])return ['slotHot.mic.'+((k+12)%24)+'.hs',0,36]}return null},
  ok:function(s){return s.f.placed},
  hata:function(){var s=S(),d=s.tray.filter(function(t){return t.kind==='wm'})[0];if(!d||d.where==null)return '';return 'Hâlâ dengesiz ('+g2(window.imb().m)+' g). Denge tüpünü karşısız tüpün tam karşısına koyun.'},
  b:'Rotor dengeli',html:'<p>Sekiz tüp, dört karşılıklı çift. Yüksek hızda küçük bir ağırlık farkı bile büyük kuvvet yaratır; bu yüzden mikrotüp rotorunun sınırı daha dardır.</p>'},
 kapat_(),
 {bolum:'Ayar',ask:'Ekrandaki programı okuyun. Gerekirse <b>PROG</b> ile <b>P2</b>’yi yükleyin (13000 rpm · 10:00).',halka:['keys.prog',0,40],izin:['key:prog'],canli:ekran,ok:function(s){return s.prog===2||(s.rpm>=10000&&s.rpm<=14000&&s.sec>=300)},
  b:'P2: 13000 rpm · 10:00',html:'<p>13000 rpm mikrotüp rotorunun sınırı (14000) içinde ve protein peletini sıkılaştırmaya yeter. Kovalı ya da açılı rotorla bu hız <b>asla</b> kullanılmaz.</p>'},
 start_(),bekle_(),
 sonuc_('<p>Dipte sıkı bir <b>protein peleti</b>, üstte berrak <b>süpernatan</b>. Süpernatan, pelete dokunulmadan pipetle alınıp analize (ör. LC-MS/MS) verilir.</p><p>Aklınızda kalsın: mikrotüp → <b>mikrotüp rotoru</b>; karşılıklı diz, tek kalana <b>denge tüpü</b>; yüksek hız ama <b>rotorun sınırı içinde</b>.</p>','<p>Pelet gevşek ya da süpernatan bulanık. Daha yüksek hız (≥ 10000 rpm) gerekir.</p>'),
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Mikrotüpler kovalı rotora konabilir mi?',['Evet','Hayır; mikrotüp rotoru takılır','Yalnız düşük hızda'],1,'Mikrotüp için mikrotüp rotoru takılır; diğer rotorlarda boşta kalır ve kırılabilir.'],
 ['Rotor değiştirmeden önce ne kontrol edilir?',['Cihaz durmuş, kapak açık ve rotor boş mu','Ekran parlaklığı','Tüplerin rengi'],0,'Takılan rotorun somunu da sıkılır.'],
 ['Protein çöktürmede neden yüksek hız gerekir?',['Tüp ısınsın diye','Küçük protein parçacıkları sıkı bir pelet olarak dibe insin diye','Süre kısalsın diye'],1,'Bu laboratuvarda mikrotüp için 13000 rpm, 10 dakika.']],
 bitti:function(){S().done.epp=1}}
};
return {sayfa:'santrifuj_pilot.html',hazir:'__cen',sonucKarti:true,ad:'SANTRİFÜJ',model:'MY-Centri 320',adTam:'Santrifüjün',
 acl:'Cihazı dört kısa bölümde, adım adım öğrenin. Sırayla ilerlemeniz önerilir; her bölüm 4–6 dakika sürer.',
 GM:{parts:'sentani',kan:'senkan',lle:'senlle',epp:'senepp'},AD:AD,ADI:ADI,DERS:DERS,SIRA:['sentani','senkan','senlle','senepp'],
 senkron:function(s,o){['sentani:parts','senkan:kan','senlle:lle','senepp:epp'].forEach(function(x){x=x.split(':');if(o[x[0]]&&o[x[0]].bitti)s.done[x[1]]=1})},
 /* serbest kullanım sessiz sınavdır: uyarı ve sonuç kartı yok; her çalıştırma kaydedilir, ✅ İşi bitirdim ile rapor */
 serbest:{yerlesim:'kontrol',sessiz:true,
  kur:function(){if(window.serbestKur)window.serbestKur()},
  ses:function(s){var o=window.serbestRapor&&window.serbestRapor.ot(),n=o?o.kayit.length:0;return n?'<b>'+n+' çalıştırma</b> kaydedildi. Bitirince <b>✅ İşi bitirdim</b>: değerlendirme raporun açılır. Raporu soldaki <b>📋 Rapor</b> ile yeniden açabilirsin.':'Serbest kullanım: uyarı yok, kendi bildiğin gibi çalış. <b>🧪 Numune seç</b> ile tüpleri rafa al, santrifüjle. Her çalıştırma kaydedilir. Bitirince <b>✅ İşi bitirdim</b>’e bas: değerlendirme raporun açılır.'},
  numune:[['kan','Kan · 5 tüp'],['lle','Ekstraksiyon · 4 tüp'],['epp','Eppendorf · 7 mikrotüp'],['fal','Falkon 15 mL · 6 tüp']],
  numuneSec:function(id){var s=S();if(s.phase!=='idle'){return 'Santrifüj çalışırken numune değiştirilmez.'}s.slots.fill(null);window.reset(id);S().mode='use';if(window.autoBalance)window.autoBalance();window.render();return ''},
  ek:'<button class="bt sbVent" id="sbVent" hidden>💨 Gazını al (çeker ocakta)</button><button class="bt sbBitir" id="sbBitir">✅ İşi bitirdim · Raporu gör</button>',
  ekBagla:function(d){d.querySelector('#sbBitir').onclick=function(){if(window.serbestRapor)window.serbestRapor.ac()};d.querySelector('#sbVent').onclick=function(){var s=S(),t=s.tray.filter(function(x){return (x.kind==='ea'||x.kind==='dcm')&&!x.vent}),sel=t.filter(function(x){return x.id===s.sel})[0];(sel?[sel]:t).forEach(function(x){window.vent(x.id)})}},
  ekYenile:function(d,s){var b=d.querySelector('#sbVent');if(!b)return;var t=s.tray.filter(function(x){return (x.kind==='ea'||x.kind==='dcm')&&!x.vent}),sel=t.filter(function(x){return x.id===s.sel})[0];b.hidden=!t.length;b.textContent=sel?'💨 '+sel.id+' tüpünün gazını al':'💨 Gazını al: '+t.length+' tüp (çeker ocakta)'}}};
}


/* ---------- otomatik pipet ---------- */
function pipet(){
var AD={'Kontrol düğmesi (piston)':'cap','Hacim ayar halkası':'ring','Uç atma (ejektör) düğmesi':'ej','Parmak dayanağı':'hook','Hacim göstergesi':'disp','Kalibrasyon / ayar açıklığı':'cal','Ejektör kovanı ve uç konisi':'sleeve','Tek kullanımlık uç':'tip','Pipet gövdesi':'body'};
var ADI={cap:'kontrol düğmesi (piston)',ring:'hacim ayar halkası',ej:'ejektör düğmesi',hook:'parmak dayanağı',disp:'hacim göstergesi',cal:'kalibrasyon açıklığı',sleeve:'ejektör kovanı',tip:'uç',body:'pipet gövdesi'};
function H(id,dy,r){return ['hot:'+id,dy||0,r||46]}
function lupHalka(){return ['#lsv',0,0]}
function birakHalka(){return ['#lrel',0,0]}
function hacimHalka(){var v=document.getElementById('vpop');return v&&!v.hidden?['#vpop',0,0]:H('ring',0,50)}
function derinlik(s){return 'Piston: '+(s.depth<.05?'yukarıda (0)':s.depth<1.1?'1. durakta':'2. durakta')+' · uçta '+(s.tip&&s.tip.liq>0?Math.round(s.tip.liq)+' µL':'sıvı yok')}
function teraziC(s){return 'Hedef tüp (terazi): '+(s.dst).toFixed(1).replace('.',',')+' µL'}
/* ileri ve ters pipetaj derslerinin ortak adımları */
function aktarim(o){var P=o.pip,V=o.vol,ters=o.ters,hac=V+' µL';
 var A=[
 {bolum:'Hazırlık',ask:'Standdaki <b>'+P+'</b> pipetine ('+o.renk+' düğmeli) tıklayarak alın.',halka:H('body:'+P,0,60),izin:['body:'+P,'stand:'+P],ok:function(s){return s.pip===P},
  b:P+' seçildi',html:'<p>Pipet elinizde, <b>uç kutusunun üstünde</b> duruyor. Hacmi burada ayarlayıp sonra uç takacaksınız.</p><p>'+hac+' '+P+'’nin aralığında ('+o.aralik+') ve üst sınırına yakın. Pipetin doğruluğu aralığın <b>üst kısmında</b> en iyidir.</p><p>Kural: hacmi ölçebilen <b>en küçük</b> pipet seçilir. Örneğin 150 µL, P1000 ile de çekilir ama aralığın en altında kaldığı için hata büyür.</p>'},
 o.hacimAyar?{bolum:'Hazırlık',ask:'Pipetin üstündeki <b>hacim ayar halkasına</b> tıklayın. Açılan kutuda <b>−</b> ile hacmi <b>'+hac+'</b>’ye indirin.',halka:hacimHalka,izin:['ring'],canli:function(s){return 'Göstergede: '+(s.pip==='P10'?s.vol.toFixed(1).replace('.',','):Math.round(s.vol))+' µL · hedef '+hac},ok:function(s){return Math.abs(s.vol-V)<1e-6},
  hata:function(){var s=S();return s.vol<V?'Hacim '+(s.pip==='P10'?s.vol.toFixed(1).replace('.',','):Math.round(s.vol))+' µL oldu; <b>+</b> ile '+hac+'’ye çıkarın.':''},
  b:'Hacim: '+hac,html:'<p>Göstergedeki değeri <b>karşıdan</b> bakarak okuyun; yandan bakınca rakam kayar.</p><p>Halka yalnız pipetin aralığında döner. Aralığın dışına zorlamak mekanizmayı bozar ve kalibrasyonu kaydırır.</p>'}
 :{bolum:'Hazırlık',b:'Hacim: '+hac,html:'<p>'+P+' pipetinin göstergesinde zaten <b>'+hac+'</b> yazıyor; ayarlamaya gerek yok. Yine de her işten önce göstergeyi <b>karşıdan</b> okuyarak kontrol edin.</p>'},
 {bolum:'Hazırlık',ask:'<b>Uç kutusuna</b> tıklayın: pipet aşağı inip uca bastırılır ve uç takılır.',halka:H('loc:tips',0,70),izin:['loc:tips'],ok:function(s){return !!s.tip&&!s.anim},
  b:'Uç takıldı',html:'<p>Sıvı yalnız <b>uca</b> girer, pipetin gövdesine asla girmez. Her numune ve her çözelti için <b>yeni uç</b> takılır.</p><p>'+P+' için '+o.uc+' uçlar kullanılır.</p>'},
 ters?
 {bolum:'Çekme',ask:'PİSTON panelinde pistona havada <b>iki kez tıklayın</b>: önce 1., sonra <b>2. durağa</b> iner.',halka:lupHalka,izin:['piston'],canli:derinlik,ok:function(s){return s.depth>=1.15&&!s.imm},
  b:'Ters pipetaj: havada 2. durak',html:'<p>Kan gibi <b>viskoz</b> (koyu) sıvılar uç duvarında ince bir film bırakır. İleri pipetajla verilirse bu film hedefe gitmez ve hacim eksik kalır.</p><p><b>Ters pipetajda</b> havada 2. durağa basılır; böylece ayarlanandan biraz <b>fazla</b> çekilir. Hedefte yalnız 1. durağa basılır: tam ayarlanan hacim verilir, fazlası uçta kalır.</p>'}
 :{bolum:'Çekme',ask:'PİSTON panelinde pistona havada <b>bir kez tıklayın</b>: piston <b>1. durağa</b> iner ve orada kalır.',halka:lupHalka,izin:['piston'],canli:derinlik,ok:function(s){return s.depth>=.95&&s.depth<1.15&&!s.imm},
  hata:function(){var s=S();return s.depth>=1.15?'Piston 2. durağa indi. <b>⬆ BIRAK</b> ile bırakın, sonra pistona yalnız <b>bir kez</b> tıklayın.':''},
  b:'İleri pipetaj: havada 1. durak',html:'<p>Pistonda iki durak vardır:</p><ul><li><b>1. durak:</b> hafif bir dirençle durulan yer. Ayarlanan hacim kadar hava çıkar.</li><li><b>2. durak (boşaltma):</b> biraz daha bastırınca inilen en alt nokta. Uçta kalan son damlayı üflemek içindir.</li></ul><p>Pistona <b>daldırmadan önce, havada</b> basılır. Uç sıvıdayken basılırsa numuneye hava üflenir.</p>'},
 {bolum:'Çekme',ask:'<b>Kaynak tüpe</b> tıklayın: pipet tüpün üstüne gelir.',oto:1,halka:H('loc:src',0,60),izin:['loc:src'],ok:function(s){return s.loc==='src'}},
 {bolum:'Çekme',ask:'Kaynak tüpe <b>yeniden tıklayın</b>: uç sıvının 2–3 mm altına girer.',halka:H('loc:src',0,60),izin:['loc:src'],ok:function(s){return s.imm==='sh'},
  b:'Uç sıvıda',html:'<p>Uç yüzeyin yalnız <b>2–3 mm</b> altına daldırılır:</p><ul><li>Fazla derin: ucun dışına sıvı yapışır ve hedefe fazladan gider.</li><li>Fazla sığ: piston bırakılınca uç hava çeker.</li></ul><p>Pipet dik tutulur.</p>'},
 {bolum:'Çekme',ask:'PİSTON panelindeki <b>⬆ BIRAK</b> düğmesine basın: piston yavaşça bırakılır, sıvı uca çekilir.',halka:birakHalka,izin:['piston'],canli:derinlik,ok:function(s){return s.tip&&s.tip.liq>0&&s.depth<.05},
  b:'Sıvı uçta',html:'<p>Piston <b>yavaşça</b> bırakıldı. Hızlı bırakılırsa sıvı uca sıçrar, içeride hava kabarcığı kalır ve hacim eksik olur.</p>'+(ters?'<p>Ters pipetajda ayarlanandan biraz fazla çekildi; bu normaldir.</p>':'<p>Uç sıvıdan çıkarılmadan önce bir saniye beklenir; sıvı uçta yerine oturur.</p>')},
 {bolum:'Çekme',ask:'Kaynak tüpe tıklayarak <b>ucu sıvıdan çıkarın</b>.',oto:1,halka:H('loc:src',0,60),izin:['loc:src'],ok:function(s){return !s.imm}},
 {bolum:'Boşaltma',ask:'<b>Hedef tüpe</b> tıklayın (terazinin üstündeki tüp).',oto:1,halka:H('loc:dst',0,60),izin:['loc:dst'],ok:function(s){return s.loc==='dst'}},
 {bolum:'Boşaltma',ask:'Hedef tüpe <b>yeniden tıklayın</b>: uç tüpün iç duvarına değer.',halka:H('loc:dst',0,60),izin:['loc:dst'],ok:function(s){return !!s.imm},
  b:'Uç duvarda',html:'<p>Uç tüpün <b>iç duvarına</b>, hafif eğik değdirilir. Sıvı duvardan aşağı süzülür, son damla duvarda kalmaz.</p>'},
 ters?
 {bolum:'Boşaltma',ask:'Pistona <b>bir kez tıklayın</b>: yalnız <b>1. durağa</b> iner. İkinci kez tıklamayın.',halka:lupHalka,izin:['piston'],canli:teraziC,ok:function(s){return s.tip&&s.tip.del>0&&s.depth>=.95&&s.depth<1.15},
  b:'Ayarlanan hacim verildi',html:'<p>1. durakta tam <b>'+hac+'</b> verildi; fazlası uçta kaldı. Ters pipetajda 2. durağa <b>basılmaz</b>: basılırsa fazlalık da hedefe gider.</p><p>Uçta kalan kan, uçla birlikte atılır.</p>'}
 :{bolum:'Boşaltma',ask:'Pistona <b>iki kez tıklayın</b>: önce 1. durak (sıvı verilir), sonra 2. durak (son damla üflenir).',halka:lupHalka,izin:['piston'],canli:teraziC,ok:function(s){return s.tip&&s.tip.del>0&&s.depth>=1.15},
  hata:function(){var s=S();return s.depth>=.95&&s.depth<1.15?'Piston 1. durakta. Pistona <b>bir kez daha</b> tıklayın: 2. durağa insin.':''},
  b:'Sıvı verildi',html:'<p>1. durakta sıvının büyük kısmı verildi; 2. durakta uçta kalan <b>son damla</b> da üflendi.</p><p>Şimdi piston <b>basılı kalırken</b> uç sıvıdan çıkarılacak. Piston uç sıvıdayken bırakılırsa sıvı uca geri çekilir.</p>'},
 {bolum:'Boşaltma',ask:'Piston basılıyken hedef tüpe tıklayarak <b>ucu çıkarın</b>.',oto:1,halka:H('loc:dst',0,60),izin:['loc:dst'],ok:function(s){return !s.imm}},
 {bolum:'Boşaltma',ask:'Şimdi pistonu bırakın: <b>⬆ BIRAK</b> düğmesine basın.',halka:birakHalka,izin:['piston'],ok:function(s){return !!s.res},
  b:'Sonuç',html:function(){var r=S().res;return r?'<p>Hedef tüp terazinin üstünde: teslim edilen hacim tartımla ölçüldü. Sol üstteki kartta sonucu görüyorsunuz.</p><p>Teslim: <b>'+r.D.toFixed(1).replace('.',',')+' µL</b> · hata <b>'+(r.err>0?'+':'')+r.err.toFixed(1).replace('.',',')+' %</b>. Kabul sınırı <b>±2 %</b>.</p>':''}},
 {bolum:'Bitirme',ask:'<b>Uç atığına</b> (kırmızı kap) tıklayın.',oto:1,halka:H('loc:waste',0,70),izin:['loc:waste'],ok:function(s){return s.loc==='waste'}},
 {bolum:'Bitirme',ask:'<b>Ejektöre</b> basın: piston panelindeki turuncu <b>EJEKTÖR</b> düğmesi (ya da pipetteki turuncu düğme).',halka:['#lej',0,0],izin:['ej'],ok:function(s){return !s.tip&&!s.ej},
  b:'Uç atıldı',html:'<p>Uç ele dokunmadan, ejektörle doğrudan atığa atıldı. '+(o.pip&&V===200?'Kanlı uç <b>tıbbi atık</b> kabına gider.':'Kullanılmış uç bir daha kullanılmaz.')+'</p>'},
 {bolum:'Bitirme',ask:'Pipeti yerine asın: <b>pipet standına</b> tıklayın.',halka:H('stand',0,70),izin:['stand','body:'+P,'stand:'+P],ok:function(s){return s.loc==='rest'},
  b:'İş bitti',html:'<p>Kullanılmayan pipet standda <b>dik</b> durur. Yatırılırsa uçta kalan sıvı pipetin içine akar ve pistonu bozar.</p><p>Sırayı aklınızda tutun:</p><ul>'+o.ozet+'</ul>'},
 {bolum:'Kontrol',test:1}];
 /* uçucu çözücü: çektikten sonra uç 2 kez ön ıslatılır (sıvı kaynağa verilip yeniden çekilir) */
 if(o.onIslat){var k=0;while(k<A.length&&A[k].b!=='Sıvı uçta')k++;
  A.splice(k+1,0,{bolum:'Çekme',ask:'Ucu <b>2 kez ön ıslatın</b>: pistona <b>bir kez tıklayın</b> (DCM kaynağa geri verilir), sonra <b>⬆ BIRAK</b> (yeniden çekilir). Bunu iki kez yapın.',
   halka:function(s){return s.depth<.05?lupHalka():birakHalka()},izin:['piston'],canli:function(s){return 'Ön ıslatma '+Math.min(2,(s.tip&&s.tip.pw)||0)+' / 2 · '+derinlik(s)},
   ok:function(s){return s.tip&&(s.tip.pw||0)>=2&&s.tip.liq>0&&s.depth<.05},
   hata:function(){var s=S();return s.depth>=1.15?'Piston 2. durağa indi. Ön ıslatmada yalnız <b>1. durağa</b> basılır; <b>⬆ BIRAK</b> ile bırakın.':''},
   b:'Uç ön ıslatıldı',html:'<p>DCM gibi organik çözücüler <b>uçucudur</b> ve yüzey gerilimleri düşüktür. Uçtaki hava çözücü buharıyla doymamışsa, çözücü buharlaşır, hava genleşir ve sıvıyı uçtan <b>damlatır</b>.</p><p>Ön ıslatmada uç 2–3 kez aynı sıvıyla doldurulup boşaltılır; uçtaki hava buharla doyar ve damlama durur.</p><p>Yine de oyalanmayın: ucu çıkarıp <b>hızla</b> hedefe geçin.</p>'})}
 return A}
var DERS={
piptani:{ad:'Cihazı tanıma',ozet:'Pipet nedir; piston ve iki durağı, hacim halkası, ejektör, uç ve pipet çeşitleri.',baslik:'PİPET · CİHAZI TANIMA',mod:'parts',gorev:'parts',
 adim:[
 {bolum:'Giriş',b:'Otomatik pipet ne işe yarar?',
  html:'<p>Otomatik pipet, mikrolitre (µL) düzeyindeki küçük hacimleri doğru ölçüp aktarır. 1000 µL = 1 mL’dir.</p><p>Laboratuvarda kan, idrar, iç standart, çözücü… hemen her şey pipetle aktarılır. <b>Pipetleme hatası, sonucun hatası olur.</b></p><p>Sıvı pipetin içine girmez: ucuna takılan <b>tek kullanımlık uca</b> çekilir.</p><p>Sahneyi sürükleyerek döndürebilir, tekerlekle yakınlaştırabilirsiniz.</p>'},
 {bolum:'Parçalar',ask:'Pipetin en üstündeki <b>kontrol düğmesine (piston)</b> tıklayın.',parca:['cap'],halka:H('cap',0,44),
  b:'Kontrol düğmesi (piston)',ne:'Başparmakla basılan düğmedir; rengi pipetin hacim aralığını gösterir.',neden:'Bastıkça içerideki piston hava iter. Bırakınca hava, dolayısıyla sıvı geri çekilir.',yanlis:'Piston her zaman <b>yavaşça</b> bırakılır. Hızlı bırakılırsa sıvı sıçrar, uca hava girer.'},
 {bolum:'Parçalar',b:'Pistonun iki durağı',
  html:'<p>Pistona bastığınızda iki ayrı yerde durur:</p><ul><li><b>1. durak:</b> hafif bir dirençle hissedilir. Ayarlanan hacim burada ölçülür.</li><li><b>2. durak (boşaltma):</b> direnci aşıp biraz daha bastırınca inilen en alt nokta. Uçta kalan son damlayı üfler.</li></ul><p>Simülasyonda pistonu <b>PİSTON</b> panelinden kullanacaksınız:</p><ul><li>Pistona <b>bir kez tıklamak</b> 1. durağa indirir, <b>bir kez daha</b> tıklamak 2. durağa.</li><li><b>⬆ BIRAK</b> düğmesi pistonu yavaşça bırakır.</li><li>Panelin üstündeki <b>⠿ PİSTON</b> yazısından tutup paneli istediğiniz yere taşıyabilirsiniz.</li></ul>'},
 {bolum:'Parçalar',ask:'Pistonun altındaki <b>hacim ayar halkasına</b> tıklayın.',parca:['ring'],halka:H('ring',0,46),
  b:'Hacim ayar halkası',ne:'Çevirerek hacim ayarlanır.',neden:'Halka pistonun ne kadar yol alacağını, yani çekilecek hacmi belirler.',yanlis:'Pipetin aralığının dışına <b>zorlanmaz</b>: mekanizma bozulur, kalibrasyon kayar.'},
 {bolum:'Parçalar',ask:'Gövdedeki <b>hacim göstergesine</b> (rakamlı pencere) tıklayın.',parca:['disp'],halka:H('part:disp',0,44),
  b:'Hacim göstergesi',ne:'Ayarlanan hacmi µL olarak gösterir.',neden:'Her işten önce bakılır: yanlış hacimle çalışmak en sık yapılan hatadır.',yanlis:'Gösterge <b>karşıdan</b> okunur; yandan bakınca rakam kayar.'},
 {bolum:'Parçalar',ask:'Pistonun yanındaki turuncu <b>ejektör düğmesine</b> tıklayın.',parca:['ej'],halka:H('ej',0,40),
  b:'Ejektör (uç atma) düğmesi',ne:'Pistonun yanındaki turuncu düğmedir. Basınca alttaki kovan aşağı iner ve ucu iter.',neden:'Uç ele dokunmadan atılır; kanlı uç doğrudan tıbbi atığa gider.',yanlis:'Uç her zaman <b>atık kabının üstünde</b> atılır; tüpe ya da tezgâha düşmemelidir.'},
 {bolum:'Parçalar',ask:'Gövdenin yanındaki turkuaz <b>parmak dayanağına</b> tıklayın.',parca:['hook'],halka:H('part:hook',0,44),
  b:'Parmak dayanağı',ne:'Gövdedeki turkuaz çıkıntıdır; işaret parmağı buraya dayanır.',neden:'Pipet elde rahat durur, el yorulmaz.',yanlis:'Pipet avuçta sıkılmaz: elin sıcaklığı içerideki havayı ısıtır, hacim kayar.'},
 {bolum:'Parçalar',ask:'Alttaki <b>ejektör kovanı ve uç konisine</b> tıklayın.',parca:['sleeve','tip'],halka:H('part:sleeve',0,44),
  b:'Uç konisi',ne:'Ucun takıldığı konik uçtur; üstündeki kovan ejektörle aşağı iner.',neden:'Uç koniye bastırılarak sıkıca takılır; gevşek uç hava kaçırır.',yanlis:'Uç elle takılmaz: pipet uç kutusundaki uca bastırılır.'},
 {bolum:'Parçalar',ask:'En alttaki <b>tek kullanımlık uca</b> tıklayın.',parca:['tip'],halka:H('part:tip',0,44),
  b:'Tek kullanımlık uç',ne:'Plastik uçtur; sıvı yalnız buraya girer.',neden:'Her numune için yeni uç: bir numunenin kalıntısı ötekine geçmez (kontaminasyon).',yanlis:'Kullanılmış uçla kaynağa girilmez. Uç takılıyken pipet yatırılmaz.'},
 {bolum:'Çeşitler',b:'Hangi pipet, hangi hacim?',
  html:'<p>Laboratuvarda farklı aralıklarda pipetler vardır; düğme renkleri aralığı gösterir:</p><ul><li><b>P10</b> (gri): 0,5–10 µL</li><li><b>P200</b> (sarı): 20–200 µL</li><li><b>P1000</b> (mavi): 100–1000 µL</li></ul><p>Kural: hacmi ölçebilen <b>en küçük</b> pipet seçilir. Pipet aralığının üst kısmında en doğru, alt ucunda en hatalıdır.</p><p>Arkadaki döner standda pipetler kullanılmadığında <b>dik</b> asılı durur.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['150 µL için hangi pipet seçilir?',['P1000','P200','P10'],1,'150 µL, P200’ün aralığında ve üst kısmına yakın; doğruluk en iyi orada.'],
 ['Pistonun 2. durağı ne içindir?',['Uçta kalan son damlayı üflemek için','Hacmi ayarlamak için','Ucu atmak için'],0,'Ayarlanan hacim 1. durakta ölçülür.'],
 ['Pistona ne zaman basılır?',['Uç sıvıdayken','Uç sıvıya girmeden önce, havada','Fark etmez'],1,'Uç sıvıdayken basılırsa numuneye hava üflenir.']],
 bitti:function(){S().done.parts=1}},
pipsu:{ad:'İleri pipetaj: 150 µL su',ozet:'Pipet seçimi, hacim ayarı, uç takma, 1. ve 2. durak, ucu atma.',baslik:'PİPET · İLERİ PİPETAJ',mod:'use',gorev:'su',
 adim:[{bolum:'Giriş',b:'Ne yapacaksınız?',html:'<p>Kaynak tüpteki <b>Tip I su</b>dan <b>150 µL</b>’yi hedef tüpe aktaracaksınız. Hedef tüp bir terazinin üstünde: verdiğiniz hacim tartımla ölçülecek.</p><p>Su gibi akışkan sıvılar <b>ileri pipetajla</b> aktarılır: havada 1. durağa basılır, sıvıya girilir, piston yavaşça bırakılır; hedefte önce 1., sonra 2. durağa basılır.</p>'}].concat(aktarim({pip:'P200',vol:150,renk:'sarı',aralik:'20–200 µL',uc:'sarı',hacimAyar:true,ters:false,
  ozet:'<li>Uygun pipet, doğru hacim, yeni uç.</li><li>Havada <b>1. durak</b>, 2–3 mm daldır, <b>yavaş</b> bırak.</li><li>Hedefte duvara değdir: 1. sonra 2. durak.</li><li>Piston basılıyken ucu çıkar, sonra bırak.</li><li>Ucu atığa at, pipeti standa as.</li>'})),
 soru:[
 ['İleri pipetajda havada pistona nereye kadar basılır?',['1. durağa','2. durağa','Hiç basılmaz'],0,'2. durak hedefte, son damlayı üflemek için kullanılır.'],
 ['Hedefte boşalttıktan sonra doğru sıra hangisi?',['Pistonu bırak, sonra ucu çıkar','Piston basılıyken ucu çıkar, sonra bırak','Ucu sıvıda bırak'],1,'Uç sıvıdayken piston bırakılırsa sıvı uca geri çekilir.'],
 ['Piston neden yavaşça bırakılır?',['Pipet bozulmasın diye','Sıvı sıçramasın, uca hava girmesin diye','Daha hızlı bitsin diye'],1,'Hızlı bırakmak hava kabarcığına ve eksik hacme yol açar.']],
 bitti:function(){S().done.su=1}},
pipkan:{ad:'Ters pipetaj: 200 µL kan',ozet:'Viskoz numune: havada 2. durak, hedefte yalnız 1. durak.',baslik:'PİPET · TERS PİPETAJ',mod:'use',gorev:'kan',
 adim:[{bolum:'Giriş',b:'Ne yapacaksınız?',html:'<p>Kaynak tüpteki <b>tam kan</b>dan <b>200 µL</b>’yi hedef tüpe aktaracaksınız.</p><p>Kan <b>viskozdur</b> (koyu, ağır akar) ve uç duvarında ince bir film bırakır. İleri pipetajla bu film hedefe gitmez, hacim eksik kalır.</p><p>Bu yüzden <b>ters pipetaj</b> kullanılır: havada <b>2. durağa</b> basılır, hedefte yalnız <b>1. durağa</b>.</p>'}].concat(aktarim({pip:'P200',vol:200,renk:'sarı',aralik:'20–200 µL',uc:'sarı',hacimAyar:false,ters:true,
  ozet:'<li>Havada <b>2. durak</b>, 2–3 mm daldır, yavaş bırak.</li><li>Hedefte yalnız <b>1. durak</b>; fazlası uçta kalır.</li><li>Piston basılıyken ucu çıkar, sonra bırak.</li><li>Kanlı ucu tıbbi atığa at.</li>'})),
 soru:[
 ['Kan neden ters pipetajla aktarılır?',['Daha hızlı olduğu için','Uç duvarında kalan film hacmi azalttığı için','Kan pıhtılaşmasın diye'],1,'Ters pipetajda fazla çekilir, hedefe tam ayarlanan hacim verilir.'],
 ['Ters pipetajda hedefte pistona nereye kadar basılır?',['Yalnız 1. durağa','2. durağa','Hiç basılmaz'],0,'2. durağa basılırsa fazlalık da hedefe gider.'],
 ['Uçta kalan fazla kan ne olur?',['Kaynağa geri verilir ya da uçla birlikte atılır','Hedefe eklenir','Uçta bırakılıp yeniden kullanılır'],0,'Uç her zaman tıbbi atığa atılır.']],
 bitti:function(){S().done.kan=1}},
pipstok:{ad:'Küçük hacim: 5 µL ara stok (P10)',ozet:'P10 seçimi, 0,5’lik adımlarla hacim ayarı, şeffaf uç, ileri pipetaj.',baslik:'PİPET · KÜÇÜK HACİM',mod:'use',gorev:'stok',
 adim:[{bolum:'Giriş',b:'Ne yapacaksınız?',html:'<p>Kaynak tüpteki <b>ara stok</b> çözeltisinden (etanol + metanol, 2 g/L) <b>5 µL</b>’yi hedef tüpe aktaracaksınız. Bu hacim, kalibratör hazırlarken sık kullanılır.</p><p>5 µL çok küçüktür: yarım damladan az. Küçük bir hata yüzde olarak büyür; 0,1 µL’lik sapma bile <b>%2</b> eder.</p><p>Bu yüzden en küçük pipet, <b>P10</b> seçilir ve ileri pipetaj yapılır.</p>'}].concat(aktarim({pip:'P10',vol:5,renk:'gri',aralik:'0,5–10 µL',uc:'küçük, şeffaf',hacimAyar:true,ters:false,
  ozet:'<li>5 µL için <b>P10</b>: aralığın ortasında, doğruluk yüksek.</li><li>Hacmi göstergeden karşıdan okuyarak ayarla.</li><li>Havada 1. durak, 2–3 mm daldır, yavaş bırak.</li><li>Hedefte uç duvara değsin: 1. sonra 2. durak.</li><li>Ucu at, pipeti standa as.</li>'})),
 soru:[
 ['5 µL için hangi pipet seçilir?',['P10','P200','P1000'],0,'P200’ün alt sınırı 20 µL’dir; 5 µL’yi ölçemez.'],
 ['5 µL’de 0,1 µL’lik sapma yüzde kaç hata eder?',['%0,1','%2','%20'],1,'Küçük hacimde küçük sapma büyük yüzde hata demektir.'],
 ['Küçük hacimde uç sıvıya nasıl daldırılır?',['Olabildiğince derine','2–3 mm, dik tutarak','Hiç daldırılmaz'],1,'Derin daldırmada ucun dışına yapışan sıvı hedefe fazladan gider.']],
 bitti:function(){S().done.stok=1}},
pipdcm:{ad:'Organik çözücü: 100 µL DCM, ön ıslatma',ozet:'Uçucu çözücü: çeker ocak, ucu 2 kez ön ıslatma, hızlı çalışma.',baslik:'PİPET · ORGANİK ÇÖZÜCÜ',mod:'use',gorev:'dcm',
 adim:[{bolum:'Giriş',b:'Ne yapacaksınız?',html:'<p>Kaynak tüpteki <b>diklorometan</b>dan (DCM) <b>100 µL</b>’yi hedef tüpe aktaracaksınız. DCM ekstraksiyonda sık kullanılan bir organik çözücüdür.</p><p>DCM <b>uçucudur</b> ve buharı zararlıdır: iş <b>çeker ocakta</b> yapılır.</p><p>Uçucu çözücüler uçta beklerken <b>damlar</b>. Bunu önlemek için uç, çektikten sonra <b>2 kez ön ıslatılır</b>: sıvı kaynağa verilip yeniden çekilir. Sonra hızlı çalışılır.</p>'}].concat(aktarim({pip:'P200',vol:100,renk:'sarı',aralik:'20–200 µL',uc:'sarı',hacimAyar:true,ters:false,onIslat:true,
  ozet:'<li>Çeker ocakta çalış.</li><li>Çektikten sonra ucu <b>2 kez ön ıslat</b>.</li><li>Ucu çıkar, <b>oyalanmadan</b> hedefe geç.</li><li>Hedefte 1. sonra 2. durak; ucu at.</li>'})),
 soru:[
 ['DCM neden uçtan damlar?',['Çok ağır olduğu için','Uçucu olduğu için: buharlaşır, uçtaki hava genleşip sıvıyı iter','Uç bozuk olduğu için'],1,'Ön ıslatma uçtaki havayı buharla doyurur.'],
 ['Ön ıslatma nasıl yapılır?',['Ucu suyla yıkayarak','Aynı sıvıyı uca 2–3 kez çekip kaynağa geri vererek','Ucu ısıtarak'],1,'Sonra hacim yeniden çekilir ve hızlıca hedefe verilir.'],
 ['DCM ile nerede çalışılır?',['Açık tezgâhta','Çeker ocakta','Buzdolabında'],1,'Buharı solunmamalıdır.']],
 bitti:function(){S().done.dcm=1}}
};
return {sayfa:'pipet_pilot.html',hazir:'__pip',sonucKarti:true,ad:'OTOMATİK PİPET',model:'MY-Pipet P10 · P200 · P1000',adTam:'Otomatik pipetin',
 acl:'Pipeti beş kısa bölümde, adım adım öğrenin. Sırayla ilerlemeniz önerilir; her bölüm 4–6 dakika sürer.',
 GM:{parts:'piptani',su:'pipsu',kan:'pipkan',stok:'pipstok',dcm:'pipdcm'},AD:AD,ADI:ADI,DERS:DERS,SIRA:['piptani','pipsu','pipkan','pipstok','pipdcm'],
 senkron:function(s,o){if(o.piptani&&o.piptani.bitti)s.done.parts=1;if(o.pipsu&&o.pipsu.bitti)s.done.su=1;if(o.pipkan&&o.pipkan.bitti)s.done.kan=1;if(o.pipstok&&o.pipstok.bitti)s.done.stok=1;if(o.pipdcm&&o.pipdcm.bitti)s.done.dcm=1},
 /* serbest kullanım sessiz sınavdır: iş seçilir, her aktarım kaydedilir, ✅ İşi bitirdim ile rapor */
 serbest:{yerlesim:'kontrol',sessiz:true,kur:function(){if(window.serbestKur)window.serbestKur()},
  numune:[['su','150 µL Tip I su'],['kan','200 µL tam kan'],['stok','5 µL ara stok'],['dcm','100 µL diklorometan (DCM)']],
  numuneSec:function(id){return window.serbestIs?window.serbestIs(id):''},
  ek:'<button class="bt sbBitir" id="sbBitir">✅ İşi bitirdim · Raporu gör</button>',ekBagla:function(d){d.querySelector('#sbBitir').onclick=function(){if(window.serbestRapor)window.serbestRapor.ac()}},
  ses:function(s){var o=window.serbestRapor&&window.serbestRapor.ot(),n=o?o.kayit.length:0,is=window.serbestRapor&&window.serbestRapor.is();
   return '<b>İş:</b> '+(is||'—')+' aktar (kaynak tüp → terazideki hedef tüp). İşi <b>🧪 Numune seç</b> ile değiştirebilirsin.<br>'+(n?'<b>'+n+' aktarım</b> kaydedildi. Bitirince <b>✅ İşi bitirdim</b>; raporu soldaki <b>📋 Rapor</b> ile yeniden açabilirsin.':'Uyarı yok, kendi bildiğin gibi çalış. Her aktarım kaydedilir. Bitirince <b>✅ İşi bitirdim</b>’e bas.')}}};
}


/* ---------- ultra saf su cihazı ---------- */
function su(){
var AD={'Dağıtım tabancası (el ünitesi)':'hand','Dağıtım tuşu (üstteki siyah tuş)':'trig','Ekran':'scr','Dağıtım düğmesi (kolba simgesi)':'btn','Yukarı / aşağı ve onay (↵) tuşları':'nav','Esnek kol':'arm','Son kullanım filtresi (POU, LC134)':'pou','Hijyen kapağı':'hyg','Kartuş kapakları (sağ ve sol yan)':'cart','Besleme ve atık hattı':'feed'};
var ADI={hand:'dağıtım tabancası',trig:'dağıtım tuşu',scr:'ekran',btn:'kolba simgesi',nav:'yukarı / aşağı tuşları',arm:'esnek kol',pou:'son kullanım filtresi',hyg:'hijyen kapağı',cart:'kartuş kapakları',feed:'besleme ve atık hattı'};
function H(id,dy,r){return ['hot:'+id,dy||0,r||46]}
function popAcik(){var b=document.getElementById('bpop');return b&&!b.hidden}
function pop(sec,yedek){return function(){return popAcik()&&document.querySelector(sec)?[sec,0,0]:yedek}}
function f1(v){return v.toFixed(1).replace('.',',')}
var EL=['part:hand','part:pou','part:scr','part:arm','sink'];
function sise(s){return 'Şişede '+Math.round(s.bot.v)+' mL · direnç '+f1(s.R)+' MΩ·cm'}
var DERS={
sutani:{ad:'Cihazı tanıma',ozet:'Ultra saf su nedir; tabanca, dağıtım tuşu, ekran, filtre, hijyen kapağı, kartuşlar.',baslik:'ULTRA SAF SU · TANIMA',mod:'parts',gorev:'parts',
 adim:[
 {bolum:'Giriş',b:'Ultra saf su cihazı ne işe yarar?',
  html:'<p>Musluk suyunda iyonlar, organik maddeler, partiküller ve bakteriler vardır. Bu cihaz suyu kartuşlardan (iyon değiştirici reçine, aktif karbon) ve filtrelerden geçirerek <b>ultra saf su</b> (Tip I) üretir.</p><p>Suyun saflığı <b>direnç</b> ile ölçülür: içinde iyon kalmamış suyun direnci <b>18,2 MΩ·cm</b>’dir (25 °C). Değer bunun altındaysa su ultra saf değildir.</p><p>Laboratuvarda çözelti, kalibratör ve LC-MS/MS mobil fazı hep bu suyla hazırlanır.</p><p>Sahneyi sürükleyerek döndürebilir, tekerlekle yakınlaştırabilirsiniz.</p>'},
 {bolum:'Parçalar',ask:'Suyu veren <b>dağıtım tabancasına</b> (el ünitesi) tıklayın.',parca:['hand'],halka:H('part:hand',0,60),
  b:'Dağıtım tabancası',ne:'Suyu verdiğiniz el ünitesidir; esnek bir kolla cihaza bağlıdır.',neden:'Tabanca lavaboya ya da şişenin ağzına götürülür; kol onu bırakılan yerde tutar.',yanlis:'Kullanılmadığında yerine (yuvasına) konur.'},
 {bolum:'Parçalar',ask:'Tabancanın üstündeki <b>siyah dağıtım tuşuna</b> tıklayın.',parca:['trig'],halka:H('trig',0,40),
  b:'Dağıtım tuşu',ne:'Bir kez basınca su akar, yeniden basınca durur.',neden:'Az miktar su almak ve bekleyen ilk suyu lavaboya atmak için kullanılır.',yanlis:'Tabancanın altında lavabo ya da açık şişe yoksa su verilmez.'},
 {bolum:'Parçalar',ask:'Tabancadaki <b>ekrana</b> tıklayın.',parca:['scr'],halka:H('part:scr',0,44),
  b:'Ekran',ne:'Suyun direncini (MΩ·cm) ve sıcaklığını gösterir.',neden:'Su alınmadan önce bakılır: direnç <b>18,2</b> olmadan su ultra saf değildir.',yanlis:'Cihaz bir süre beklemişse ilk su ultra saf değildir; önce lavaboya akıtılır.'},
 {bolum:'Parçalar',ask:'Tabancadaki <b>kolba simgesine</b> (dağıtım düğmesi) tıklayın.',parca:['btn','nav'],halka:H('btn',0,40),
  b:'Kolba simgesi',ne:'Belirli bir hacmi otomatik vermek için kullanılır.',neden:'Menüden hacim seçilir (ör. 500 mL), ▶ Başlat’a basılır; cihaz o hacmi verince kendiliğinden durur.',yanlis:'Dağıtım sürerken şişenin başından ayrılınmaz.'},
 {bolum:'Parçalar',ask:'Tabancanın ucundaki <b>son kullanım filtresine</b> tıklayın.',parca:['pou','hyg'],halka:H('part:pou',0,44),
  b:'Son kullanım filtresi',ne:'0,2 µm’lik membran filtredir.',neden:'Suya karışabilecek partikül ve bakterileri son anda tutar.',yanlis:'Ucuna elle dokunulmaz. Son kullanma tarihi geçince değiştirilir.'},
 {bolum:'Parçalar',ask:'Filtrenin ucundaki <b>hijyen kapağına</b> tıklayın.',parca:['hyg'],halka:H('part:hyg',0,40),
  b:'Hijyen kapağı',ne:'Filtrenin ucunu kapatan küçük kapaktır.',neden:'Kullanılmadığında filtre ucunu toza ve bakteriye karşı korur.',yanlis:'Su vermeden önce çıkarılır, iş bitince <b>hemen</b> geri takılır. Takılıyken su verilirse kapak dolar, su taşar.'},
 {bolum:'Parçalar',ask:'Cihazın yanındaki <b>kartuş kapağına</b> tıklayın.',parca:['cart'],halka:H('door:R',0,60),
  b:'Kartuş kapakları',ne:'İki yandaki kapakların arkasında saflaştırma kartuşları durur.',neden:'Kartuşlar suyu iyonlardan ve organik maddeden arındırır. Direnç düşmeye başlayınca kartuş değiştirilir.',yanlis:'Kartuş yuvasına tam oturmazsa conta sızdırır; cihaz alarm verip dağıtımı durdurur.'},
 {bolum:'Parçalar',ask:'Arkadaki <b>besleme ve atık hortumlarına</b> tıklayın.',parca:['feed'],halka:H('part:feed',0,50),
  b:'Besleme ve atık hattı',ne:'Sarı hortum ön arıtılmış suyu getirir; şeffaf hortum fazla suyu lavaboya boşaltır.',neden:'Cihaz ön arıtılmış (RO) suyu son kez saflaştırır.',yanlis:'Hortumlar bükülmez, ezilmez.'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Ultra saf suyun direnci ne olmalıdır?',['1,8 MΩ·cm','18,2 MΩ·cm','182 MΩ·cm'],1,'Direnç bunun altındaysa suda iyon kalmış demektir.'],
 ['Cihaz bir süre beklemişse ilk su ne yapılır?',['Doğrudan şişeye alınır','Direnç 18,2 olana kadar lavaboya akıtılır','Kaynatılır'],1,'Borularda bekleyen su ultra saf değildir.'],
 ['Hijyen kapağı ne zaman takılır?',['Hiç takılmaz','Yalnız akşamları','İş biter bitmez, hemen'],2,'Filtre ucu açıkta kalırsa toz ve bakteri bulaşır.']],
 bitti:function(){S().done.parts=1}},
sudol:{ad:'500 mL şişeye ultra saf su',ozet:'Hijyen kapağı, ilk suyu atma, şişeyi 3 kez çalkalama, 500 mL otomatik dağıtım.',baslik:'ULTRA SAF SU · ŞİŞE DOLDURMA',mod:'use',gorev:'man',
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',html:'<p>Temiz bir cam şişeye <b>500 mL</b> ultra saf su alacaksınız.</p><p>Cihaz bir süredir bekliyor: ekrandaki direnç <b>18,2’nin altında</b>. Borularda bekleyen su ultra saf değildir; önce lavaboya akıtılır.</p><p>Sıra: hijyen kapağı → ilk suyu at → şişeyi 3 kez çalkala → 500 mL al → kapat ve topla.</p>'},
 {bolum:'Hazırlık',ask:'Tabancanın ucundaki <b>hijyen kapağına</b> tıklayın: kapak çıkarılır.',halka:H('part:hyg',0,40),izin:['part:hyg'],ok:function(s){return !s.hyg},
  b:'Hijyen kapağı çıktı',html:'<p>Filtrenin ucu artık açık. Ucuna <b>dokunmayın</b>: elinizin değmesi suyu kirletir.</p>'},
 {bolum:'İlk su',ask:'<b>Tabancaya</b> tıklayın: tabanca lavabonun üstüne gelir.',oto:1,halka:H('part:hand',0,60),izin:EL,ok:function(s){return s.hand==='sink'}},
 {bolum:'İlk su',ask:'Tabancanın üstündeki <b>siyah tuşa</b> bir kez tıklayın: su lavaboya akar. Ekranda direnç <b>18,2</b> olana kadar bekleyin.',halka:H('trig',0,40),izin:['trig'],canli:function(s){return 'Direnç '+f1(s.R)+' MΩ·cm · lavaboya '+Math.round(s.toSink)+' mL'},ok:function(s){return !!s.ev.flushed},
  b:'Su ultra saf',html:'<p>Direnç <b>18,2 MΩ·cm</b>’ye ulaştı: borularda bekleyen su atıldı, gelen su artık ultra saf.</p><p>Bekleyen su havadan CO₂ ve borudan iyon alır; bu suyla hazırlanan çözeltiler kirli olur.</p>'},
 {bolum:'İlk su',ask:'Siyah tuşa <b>yeniden tıklayın</b>: akış durur.',oto:1,halka:H('trig',0,40),izin:['trig'],ok:function(s){return !s.flowing}},
 {bolum:'Çalkalama',ask:'<b>Cam şişeye</b> tıklayın ve açılan kutudan <b>Kapağı aç</b>’ı seçin.',oto:1,halka:pop('#pp1',H('bottle',0,70)),izin:['bottle'],ok:function(s){return !s.bot.cap}},
 {bolum:'Çalkalama',ask:'Şişeye yeniden tıklayın ve <b>Tabancayı şişeye götür</b>’ü seçin.',oto:1,halka:pop('#pp2',H('bottle',0,70)),izin:['bottle'],ok:function(s){return s.hand==='bottle'}},
 {bolum:'Çalkalama',ask:'Siyah tuşa tıklayın, şişeye <b>30–50 mL</b> su alın, sonra yeniden tıklayıp durdurun.',halka:H('trig',0,40),izin:['trig'],canli:sise,ok:function(s){return s.bot.v>=15&&!s.flowing}},
 {bolum:'Çalkalama',ask:'Şişeye tıklayın ve <b>Çalkala ve lavaboya dök</b>’ü seçin.',halka:pop('#pp3',H('bottle',0,70)),izin:['bottle'],ok:function(s){return s.bot.rinse>=1},
  b:'Şişe çalkalandı (1/3)',html:'<p>Şişenin iç yüzeyinde toz, eski çözelti ya da deterjan kalıntısı olabilir. Aynı ultra saf suyla <b>3 kez</b> çalkalanırsa şişe bu suya “şartlanır”.</p><p>Çalkalama suyu lavaboya dökülür.</p>'},
 {bolum:'Çalkalama',ask:'Çalkalamayı <b>2 kez daha</b> yapın: şişe → <b>Kapağı aç</b>, siyah tuşla biraz su al ve durdur, şişe → <b>Çalkala ve lavaboya dök</b>.',
  halka:function(s){return s.bot.cap?pop('#pp1',H('bottle',0,70))():(s.bot.v<15||s.flowing)?H('trig',0,40):pop('#pp3',H('bottle',0,70))()},izin:['bottle','trig'],canli:function(s){return 'Çalkalama '+Math.min(3,s.bot.rinse)+' / 3 · '+sise(s)},ok:function(s){return s.bot.rinse>=3},
  hata:function(){var s=S();return s.flowing&&s.bot.cap?'Şişenin kapağı kapalı: su tezgâha akıyor! Siyah tuşla durdurun, önce kapağı açın.':''},
  b:'Şişe şartlandı',html:'<p>Şişe 3 kez çalkalandı. Artık doldurulabilir.</p>'},
 {bolum:'Doldurma',ask:'Şişeye tıklayın ve <b>Kapağı aç</b>’ı seçin.',oto:1,halka:pop('#pp1',H('bottle',0,70)),izin:['bottle'],ok:function(s){return !s.bot.cap}},
 {bolum:'Doldurma',ask:'Tabancadaki <b>kolba simgesine</b> tıklayın. Menüde <b>500 mL</b> seçili; <b>▶ Başlat</b>’a basın.',halka:pop('#np3',H('btn',0,40)),izin:['btn','nav'],ok:function(s){return !!s.ev.volStart},
  hata:function(){var s=S();return s.volSet!==500?'Menüde '+s.volSet+' mL seçili; <b>500</b>’ü seçin.':''},
  b:'Otomatik dağıtım',html:'<p>Cihaz 500 mL’yi ölçerek verir ve kendiliğinden durur. Bu sırada şişenin başında kalınır.</p>'},
 {bolum:'Doldurma',ask:'Cihaz 500 mL verince kendiliğinden durur. Bekleyin…',bekle:1,izin:[],canli:sise,ok:function(s){return !s.volMode&&s.bot.v>=480},
  b:'Şişe doldu',html:'<p>Şişede 500 mL ultra saf su var. Ultra saf su havayla temas ettikçe CO₂ ve toz alır; kapak hemen kapatılır.</p>'},
 {bolum:'Bitirme',ask:'Şişeye tıklayın ve <b>Kapağı kapat</b>’ı seçin.',oto:1,halka:pop('#pp1',H('bottle',0,70)),izin:['bottle'],ok:function(s){return s.bot.cap}},
 {bolum:'Bitirme',ask:'<b>Tabancaya</b> tıklayın: yerine (yuvasına) döner.',oto:1,halka:H('part:hand',0,60),izin:EL,ok:function(s){return s.hand==='dock'}},
 {bolum:'Bitirme',ask:'<b>Hijyen kapağına</b> tıklayın: filtrenin ucuna takılır.',halka:H('part:hyg',0,40),izin:['part:hyg'],ok:function(s){return !!s.res},
  b:'Ultra saf su hazır',html:'<p>Sol üstteki kartta sonucu görüyorsunuz.</p><p>Şişe etiketlenir (tarih, paraf). Ultra saf su uzun süre bekletilmez; aynı gün kullanılır.</p><p>Sırayı aklınızda tutun:</p><ul><li>Hijyen kapağını çıkar.</li><li>İlk suyu lavaboya at: direnç <b>18,2</b> olana kadar.</li><li>Şişeyi <b>3 kez</b> çalkala.</li><li>Hacmi kolba menüsünden ver.</li><li>Şişeyi kapat, tabancayı yerine koy, hijyen kapağını <b>tak</b>.</li></ul>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Şişeye su almadan önce ekranda ne görülmelidir?',['Direnç 18,2 MΩ·cm','Sıcaklık 40 °C','Hacim 0 mL'],0,'Direnç 18,2’nin altındaysa su ultra saf değildir.'],
 ['Şişe neden 3 kez çalkalanır?',['Soğusun diye','Şişe aynı suyla şartlansın, kalıntı kalmasın diye','Su hızlı aksın diye'],1,'Çalkalama suyu lavaboya dökülür.'],
 ['İş bitince en son ne yapılır?',['Hijyen kapağı takılır','Cihaz fişten çekilir','Kartuş kapağı açılır'],0,'Filtre ucu açıkta kalmamalıdır.']],
 bitti:function(){S().done.man=1}},
susiz:{ad:'Kartuş sızıntısı',ozet:'Sızıntı alarmı: tarafı bul, kartuşu yerine bastır, kapağı kapat, tezgâhı kurula.',baslik:'ULTRA SAF SU · SIZINTI',mod:'use',gorev:'leak',
 adim:[
 {bolum:'Giriş',b:'Ne oldu?',html:'<p>Cihazın yanından tezgâha <b>su sızıyor</b>. Ekranda sızıntı alarmı var ve cihaz dağıtımı <b>kilitledi</b>.</p><p>En sık neden: kartuş değiştirildikten sonra yuvasına tam oturmamıştır; conta sızdırır.</p><p>Tezgâhtaki suyun hangi taraftan geldiğine bakın.</p>'},
 {bolum:'Sızıntı',ask:'Suyun geldiği taraftaki <b>kartuş kapağına</b> tıklayarak açın.',halka:function(s){return H('door:'+s.leak.side,0,60)},izin:['door:L','door:R'],ok:function(s){return !!s.door[s.leak.side]},
  hata:function(){var s=S(),o=s.leak.side==='L'?'R':'L';return s.door[o]?'Bu taraftaki kartuş yerinde. Sızıntı <b>diğer taraftan</b> geliyor.':''},
  b:'Kartuş yuvasından çıkmış',html:'<p>Kartuş yuvasına tam oturmamış; alt taraftaki conta sızdırıyor.</p>'},
 {bolum:'Sızıntı',ask:'Yuvasından çıkmış <b>kartuşa</b> tıklayarak yerine bastırın.',halka:function(s){return H('cart:'+s.leak.side,0,60)},izin:['cart:L','cart:R'],ok:function(s){return s.leak.seated},
  b:'Klik!',html:'<p>Kartuş yuvasına oturdu; sızıntı durdu, alarm söndü.</p><p>Kartuş değiştirildikten sonra her zaman <b>klik</b> sesi gelene kadar bastırılır.</p>'},
 {bolum:'Toparlama',ask:'Kartuş kapağına tıklayarak <b>kapatın</b>.',oto:1,halka:function(s){return H('door:'+s.leak.side,0,60)},izin:['door:L','door:R'],ok:function(s){return !s.door.L&&!s.door.R}},
 {bolum:'Toparlama',ask:'Tezgâhtaki <b>suya</b> tıklayın: kâğıt havluyla kurulayın.',halka:H('leakP',0,70),izin:['leakP'],ok:function(s){return !!s.res},
  b:'Sızıntı giderildi',html:'<p>Kartuş yerine oturduktan sonra cihaz birkaç dakika çalıştırılır, ilk su lavaboya atılır ve direncin yeniden <b>18,2 MΩ·cm</b>’ye çıktığı görülür.</p><p>Sızıntı sürerse conta ya da kartuş değiştirilir.</p>'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Sızıntı alarmında cihaz ne yapar?',['Dağıtımı kilitler','Daha hızlı çalışır','Hiçbir şey'],0,'Sızıntı giderilmeden su verilmez.'],
 ['Kartuş sızdırıyorsa en sık neden nedir?',['Su çok soğuk','Kartuş yuvasına tam oturmamış','Ekran bozuk'],1,'Kartuş klik sesi gelene kadar bastırılır.'],
 ['Sızıntı giderildikten sonra ne kontrol edilir?',['Direncin yeniden 18,2 MΩ·cm’ye çıktığı','Şişenin rengi','Hortumun uzunluğu'],0,'Önce ilk su lavaboya atılır.']],
 bitti:function(){S().done.leak=1}}
};
return {sayfa:'su_pilot.html',hazir:'__su',sonucKarti:true,ad:'ULTRA SAF SU CİHAZI',model:'ELGA PURELAB flex',adTam:'Ultra saf su cihazının',
 acl:'Cihazı üç kısa bölümde, adım adım öğrenin. Sırayla ilerlemeniz önerilir; her bölüm 3–6 dakika sürer.',
 GM:{parts:'sutani',man:'sudol',leak:'susiz'},AD:AD,ADI:ADI,DERS:DERS,SIRA:['sutani','sudol','susiz'],
 senkron:function(s,o){if(o.sutani&&o.sutani.bitti)s.done.parts=1;if(o.sudol&&o.sudol.bitti)s.done.man=1;if(o.susiz&&o.susiz.bitti)s.done.leak=1},
 /* serbest kullanım sessiz sınavdır: iş seçilir, her şişe kaydedilir, ✅ İşi bitirdim ile rapor */
 serbest:{yerlesim:'kontrol',sessiz:true,kur:function(){if(window.serbestKur)window.serbestKur()},
  numune:[['man','500 mL şişeye ultra saf su'],['vol','1000 mL mobil faz suyu']],
  numuneSec:function(id){return window.serbestIs?window.serbestIs(id):''},
  ek:'<button class="bt sbBitir" id="sbBitir">✅ İşi bitirdim · Raporu gör</button>',ekBagla:function(d){d.querySelector('#sbBitir').onclick=function(){if(window.serbestRapor)window.serbestRapor.ac()}},
  ses:function(s){var o=window.serbestRapor&&window.serbestRapor.ot(),n=o?o.kayit.length:0,is=window.serbestRapor&&window.serbestRapor.is();
   return '<b>İş:</b> '+(is||'—')+'. İşi <b>🧪 Numune seç</b> ile değiştirebilirsin.<br>'+(n?'<b>'+n+' şişe</b> kaydedildi. Bitirince <b>✅ İşi bitirdim</b>; raporu soldaki <b>📋 Rapor</b> ile yeniden açabilirsin.':'Uyarı yok, kendi bildiğin gibi çalış. Bitirince <b>✅ İşi bitirdim</b>’e bas.')}}};
}

/* ---------- katı faz ekstraksiyonu (SPE · CEREX 48) ---------- */
function spe(){
var AD={'Oasis HLB 3 cc kartuş kutusu: tıkla, bir kartuş al':'box','Kolon rafı: elindeki kartuşu bir deliğe yerleştir':'rack','48 pozisyonlu kolon rafı':'rack','Raf ön yüzü: tıkla, rafı öne çek / geri it':'rack',
 'Atık rafı ve beyaz atık teknesi':'waste','Atık sıvı':'waste','Toplama rafı (12 × 75 mm tüpler)':'coll','Toplama tüpü':'coll','Toplanan eluat':'coll',
 'Basınç kafası: indirmek için iki anahtara aynı anda bas':'platen','Silikon conta (kartuş üstlerine oturur)':'platen','Sıkıştırma bloğu':'platen','Kelebek civata':'platen','Gaz hortumu bağlantısı':'platen',
 'Sol baskı anahtarı: sağ anahtarla birlikte bas':'two','Sağ baskı anahtarı: sol anahtarla birlikte bas':'two','Mod seçici: sol ADJ · orta OFF · sağ MAX':'mode',
 'Ayarlanabilir akış manometresi (0–15 psi)':'adj','Ayarlanabilir akış regülatörü: tıkla ve + / − ile ayarla':'adj','Maksimum akış manometresi (0–60 psi)':'max','Maksimum akış regülatörü: tıkla ve + / − ile ayarla':'max',
 'Akış ölçer (rotametre)':'rm','Rotametre iğneli vanası':'rm','Kılavuz kolon':'post','Kılavuz burcu':'post','Mavi gaz hortumu':'gas','Arka gaz bağlantısı (hortum)':'gas','Arka gaz girişi (azot hattı)':'gas',
 'Bekleme standı: biten kartuşu buraya koy':'stand','Peçete kutusu: tıkla, peçete al':'tissue','Çöp kutusu: kullanılmış kartuşu ya da ıslak peçeteyi at':'bin','Ön kontrol paneli':'panel','Paslanmaz çelik gövde':'body'};
['MeOH','Su','Su:MeOH 4:1','Elüsyon MeOH'].forEach(function(t){AD[t+' şişesi ve dispenseri: tıkla, dispenseri seç (3 mL)']='erlen';AD[t+' dispenseri (3 mL): tıkla, dispenseri seç']='disp'});
AD['Uç kutusu (5 mL pipet uçları): tıkla, pipete yeni uç tak']='tipbox';AD['Otomatik pipet (P5000, 3 mL): tıkla, pipeti al ya da standa koy']='pip';AD['Uç atık kutusu: kullanılmış ucu at']='tipwaste';
for(var j=1;j<=5;j++){AD['N'+j+' numune tüpü: tıkla, pipetle al']='tube';AD['Y'+j+': N'+j+' için yedek numune, tıkla, pipetle al']='tube'}
var ADI={disp:'şişe başı dispenser',pip:'otomatik pipet',tipbox:'uç kutusu',tipwaste:'uç atık kutusu',box:'kartuş kutusu',rack:'kolon rafı',waste:'atık rafı ve teknesi',coll:'toplama rafı',platen:'basınç kafası',two:'baskı anahtarı',mode:'mod seçici',adj:'ADJ (ayarlanabilir akış) regülatörü ve manometresi',max:'MAX (maksimum akış) regülatörü ve manometresi',rm:'rotametre (akış ölçer)',post:'kılavuz kolon',gas:'azot hattı',stand:'bekleme standı',erlen:'çözelti erleni',tube:'numune tüpü',tissue:'peçete kutusu',bin:'çöp kutusu',panel:'ön panel',body:'cihaz gövdesi'};
function H(n,r){return [n,0,r||46]}
var DG=['#dersP [data-dg="0"]',0,0],ODAK_SON=null;
function E(){return window.carts||[]}
function vol(c){return window.cartVol(c)}
function f1(v){return v.toFixed(1).replace('.',',')}
function rafta(){return E().filter(function(c){return c.k<2&&c.where==='rack'})}
function akis(s){var r=rafta();return 'Basınç '+f1(s.p)+' psi · '+(r.length?r.map(function(c){return 'K'+(c.k+1)+' '+f1(vol(c))+' mL, '+f1(c.flow)+' mL/dk'}).join(' · '):'rafta kartuş yok')}
var KAFA=['✋✋ İki anahtara birlikte bas',function(){window.ikiAnahtar()}];
/* öğrencinin son protokol sapması derste hemen gösterilir */
function sapma(){var s=S(),x=s.log[0];return x&&!x.info&&s.time-x.t<150?'⚠ '+x.msg:''}
function koc(t,ask,b,kaynak,html){return {bolum:{0:'Şartlandırma',1:'Şartlandırma',2:'Yükleme',3:'Yıkama',4:'Yıkama',6:'Elüsyon'}[t],ask:ask,dugme:KAFA,
 izin:kaynak.concat(['cart','stand','twoL','twoR','mode','knob','pull','pipstand','tipbox','tipwaste']),canli:function(){return 'Sıradaki: '+window.speKoc(t).is},halka:function(){return window.speKoc(t).h},
 ok:function(){return !!window.speKoc(t).bitti},hata:sapma,b:b,html:html}}
var DERS={
spetani:{ad:'Cihazı tanıma',ozet:'SPE nedir; kartuş, kolon rafı, atık ve toplama rafı, basınç kafası, anahtarlar, mod seçici, ADJ / MAX, rotametre.',baslik:'SPE · TANIMA',mod:'parts',gorev:'parts',
 adim:[
 {bolum:'Giriş',b:'Katı faz ekstraksiyonu (SPE) nedir?',
  html:'<p>Bir numunede aradığımız maddeler (<b>analitler</b>) çoğu zaman çok azdır ve başka pek çok maddeyle karışıktır; bu hâliyle cihaza verilemez.</p><p><b>SPE</b> bu maddeleri numuneden ayırır, temizler ve derişik hâle getirir:</p><ul><li>Numune, içi dolgu maddesiyle (<b>sorbent</b>) dolu küçük bir <b>kartuştan</b> geçirilir.</li><li>Aradığımız maddeler sorbente tutunur, geri kalanı akıp gider.</li><li>Sonra az miktar çözücüyle tutunan maddeler geri alınır.</li></ul><p><b>CEREX 48</b> sıvıları kartuşlardan azotla iterek geçirir; aynı anda 48 kartuş çalışabilir.</p><p>Sahneyi sürükleyerek döndürebilir, tekerlekle yakınlaştırabilirsiniz.'},
 {bolum:'Giriş',b:'SPE adım adım: kartuşun içi',html:'<p>Şimdi kartuşun içine bakalım. Açılan pencerede beş adımı tek tek ya da baştan sona oynatabilirsiniz.</p><ul><li>Her adımda farklı çözücü ve numune seçip sonucu görün.</li><li>Yanlış seçimleri de deneyin: analitlerin nasıl kaybolduğunu görün. Hatalı adımdan sonra ilerlenmez.</li><li>İleri seviye: <b>Oasis MCX</b> kartuşunda aynı işlemin nasıl farklı sonuç verdiğini karşılaştırın.</li></ul><button class="p" style="width:100%" onclick="window.speAnim&&window.speAnim()">▶ Kartuşun içini aç</button><p style="font-size:13.5px;color:#9BB0B6">Canlandırmayı istediğiniz an üst çubuktaki <b>🔬 Kartuşun içi</b> düğmesiyle yeniden açabilirsiniz.</p>'},
 {bolum:'Kartuş',ask:'<b>Kartuş kutusuna</b> tıklayın.',parca:['box'],halka:H('box',60),
  b:'Oasis HLB 3 cc kartuş',ne:'İçinde 60 mg polimer sorbent bulunan 3 mL’lik plastik kartuştur. Sorbent hem suyu seven hem yağı seven gruplar taşır (HLB: hidrofilik-lipofilik denge).',neden:'Farklı yapıdaki pek çok maddeyi aynı anda tutabilir.',yanlis:'Kartuşun alt ucuna elle dokunulmaz. Kullanılmış kartuş yeniden kullanılmaz.'},
 {bolum:'Raflar',ask:'Kartuşların takıldığı <b>kolon rafına</b> tıklayın.',parca:['rack'],halka:H('rack',70),
  b:'Kolon rafı',ne:'48 delikli rafdır; kartuşlar bu deliklere takılır.',neden:'Kartuşları basınç kafasının tam altında, düz ve sabit tutar.',yanlis:'Kartuşlar sırayla ve numune numarasıyla eşleşecek şekilde takılır (K1 ← N1). Karışırsa sonuç başka numuneye yazılır.'},
 {bolum:'Raflar',ask:'Kolon rafının altındaki <b>atık rafına</b> (beyaz tekne) tıklayın.',parca:['waste'],halka:H('waste',60),
  b:'Atık rafı ve teknesi',ne:'Kartuşlardan süzülen sıvıların toplandığı beyaz teknedir.',neden:'Şartlandırma, yükleme ve yıkama sıvıları atıktır; buraya akar.',yanlis:'Elüsyondan önce atık rafı <b>toplama rafıyla</b> değiştirilir; yoksa analitler atığa gider.'},
 {bolum:'Raflar',ask:'Yanda bekleyen <b>toplama rafına</b> tıklayın.',parca:['coll'],halka:H('coll',70),
  b:'Toplama rafı',ne:'Her kartuşun altına bir cam tüp (12 × 75 mm) getiren raftır.',neden:'Elüsyonda analitleri taşıyan çözücü (<b>eluat</b>) bu tüplerde toplanır.',yanlis:'Toplama rafına geçmeden önce basınç kafası kaldırılır.'},
 {bolum:'Basınç',ask:'Üstteki siyah <b>basınç kafasına</b> tıklayın.',parca:['platen','post'],halka:H('platen',70),
  b:'Basınç kafası',ne:'Kılavuz kolonlar üzerinde inip kalkan kafadır. Altındaki silikon conta her kartuşun ağzına oturur.',neden:'Azot her kartuşa ayrı ayrı verilir; sıvı kartuştan aşağı itilir.',yanlis:'Kartuş takarken ya da çözelti eklerken kafa yukarıda olmalıdır.'},
 {bolum:'Basınç',ask:'Ön paneldeki <b>baskı anahtarlarından</b> birine tıklayın.',parca:['two'],halka:[H('two:L',40),H('two:R',40)],
  b:'İki baskı anahtarı',ne:'Panelin iki yanındaki anahtarlardır. Kafa, ikisine <b>birlikte</b> basınca iner ya da kalkar.',neden:'İki el de anahtardayken kafa hareket eder: el kafanın altında kalıp sıkışmaz.',yanlis:'Raf öne çekiliyken kafa indirilmez.'},
 {bolum:'Basınç',ask:'Panelin altındaki <b>mod seçiciye</b> tıklayın.',parca:['mode'],halka:H('mode',40),
  b:'Mod seçici',ne:'Üç konumlu koldur: solda <b>ADJ</b>, ortada <b>OFF</b>, sağda <b>MAX</b>.',neden:'ADJ ile sıvılar ayarlı düşük basınçla geçirilir; MAX ile kartuşlar yüksek basınçla kurutulur. OFF gazı keser.',yanlis:'Kartuşlar boşalınca gaz hemen OFF’a alınır.'},
 {bolum:'Basınç',ask:'Soldaki <b>ADJ manometresine</b> ya da altındaki düğmeye tıklayın.',parca:['adj'],halka:H('gauge:adj',44),
  b:'ADJ: ayarlanabilir akış',ne:'0–15 psi arası düşük basınç verir. Düğmesiyle ayarlanır, manometresi basıncı gösterir.',neden:'Sıvıların kartuştan damla damla (yaklaşık 1–2 mL/dk) geçmesi için kullanılır.',yanlis:'Basınç yavaş yavaş artırılır. Hızlı akış analitlerin sorbente tutunmasına zaman bırakmaz.'},
 {bolum:'Basınç',ask:'Sağdaki <b>MAX manometresine</b> ya da altındaki düğmeye tıklayın.',parca:['max'],halka:H('gauge:max',44),
  b:'MAX: maksimum akış',ne:'0–60 psi arası yüksek basınç verir.',neden:'Yıkamadan sonra kartuşları azotla <b>kurutmak</b> için kullanılır (20 psi, 15 dk).',yanlis:'Sıvı geçirirken MAX kullanılmaz: akış çok hızlanır.'},
 {bolum:'Basınç',ask:'Paneldeki cam tüplü <b>rotametreye</b> (akış ölçer) tıklayın.',parca:['rm'],halka:H('rm',50),
  b:'Rotametre',ne:'İçindeki bilye gaz akışıyla yükselir; L/dk okunur.',neden:'Gazın gerçekten aktığını gösterir. Kartuşlar boşaldıkça akış artar.',yanlis:'Kafa kapalıyken bilye çok yükseliyorsa gaz boşalan kartuşlardan kaçıyordur.'},
 {bolum:'Tezgâh',ask:'Arkadaki şişelerin üstündeki <b>dispenserlerden</b> birine tıklayın.',parca:['disp','erlen'],halka:H('disp:water',44),
  b:'Şişe başı dispenser',html:'<p>Çözücü şişeleri: <b>MeOH</b> (şartlandırma), <b>su</b> (şartlandırma ve yıkama), <b>su:MeOH 4:1</b> (yıkama), <b>elüsyon MeOH</b>.</p><p>Her şişenin üstünde <b>3 mL’ye ayarlı</b> bir dispenser vardır: dispenser seçilir, her kartuşa bir basışta 3 mL verilir.</p><ul><li>Hacim her seferinde aynıdır.</li><li>Şişeye pipet ya da uç girmez: çözücü <b>kontamine olmaz</b>.</li></ul>'},
 {bolum:'Tezgâh',ask:'Numune rafının arkasındaki <b>otomatik pipete</b> tıklayın.',parca:['pip','tipbox','tipwaste'],halka:H('pipstand',50),
  b:'Otomatik pipet ve uçlar',html:'<p>Numuneler (<b>N1–N5</b>, 10’ar mL) <b>otomatik pipetle</b> (P5000, 3 mL’ye ayarlı) alınır.</p><ul><li>Pipete uç kutusundan <b>yeni uç</b> takılır.</li><li>Aynı numunenin sonraki porsiyonları aynı uçla alınabilir.</li><li>Numune değişince uç <b>mutlaka</b> uç atık kutusuna atılır ve yeni uç takılır.</li></ul><p>Bir numunenin ucuyla başka numunenin tüpüne girilirse <b>çapraz kontaminasyon</b> olur: sonuç yanlış kişiye ait bir maddeyi gösterebilir.</p>'},
 {bolum:'Tezgâh',ask:'<b>Bekleme standına</b> tıklayın.',parca:['stand'],halka:H('stand',60),
  b:'Bekleme standı',ne:'Kartuş kutusunun yanındaki küçük standdır; adımını erken bitiren kartuşlar buraya konur.',neden:'Biten kartuş rafta kalırsa diğerleri akarken basınç altında boş kalır ve sorbent kurur. Kafa kaldırılıp biten kartuş standa alınır, hepsi bitince rafa geri takılır.',yanlis:'Şartlandırmadan yükleme sonuna kadar sorbent kurutulmaz.'},
 {bolum:'Kontrol',test:1}],
 soru:[
 ['SPE’de adımların doğru sırası hangisidir?',['Yükleme → şartlandırma → elüsyon → yıkama','Şartlandırma → yükleme → yıkama → kurutma → elüsyon','Elüsyon → yükleme → kurutma'],1,'Önce sorbent hazırlanır, sonra numune yüklenir, kirlilikler yıkanır, kurutulur ve analitler alınır.'],
 ['Kafa neden iki anahtara birlikte basınca iner?',['Daha hızlı insin diye','İki el de anahtardayken el kafanın altında sıkışmasın diye','Gaz tasarrufu için'],1,'Bu bir iş güvenliği önlemidir.'],
 ['Kartuşları kurutmak için hangi mod kullanılır?',['ADJ, 5 psi','OFF','MAX, 20 psi'],2,'ADJ en fazla 15 psi verir; kurutma için MAX ile 20 psi gerekir.']],
 bitti:function(){S().done.parts=1}},
spesart:{ad:'Kartuş takma ve şartlandırma',ozet:'İki kartuşu rafa tak; 3 mL MeOH ve 3 mL su ile şartlandır; kafa, ADJ basıncı, mod seçici.',baslik:'SPE · ŞARTLANDIRMA',mod:'use',gorev:'bos',
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',html:'<p>İki Oasis HLB kartuşunu rafa takıp <b>şartlandıracaksınız</b>: önce 3 mL metanol (MeOH), sonra 3 mL su.</p><p>Kuru sorbent sudaki analitleri iyi tutamaz. Metanol sorbenti ıslatıp gözeneklerini açar; su da metanolü uzaklaştırıp sorbenti sulu numuneye hazırlar.</p>'},
 {bolum:'Kartuş',ask:'Kolon rafının <b>ön yüzüne</b> tıklayın: raf öne gelir.',halka:H('pull',50),izin:['pull'],ok:function(s){return s.pulled&&s.pullT>=.999},
  b:'Raf öne çekildi',html:'<p>Kartuş takarken ve kartuşlara çözelti eklerken raf <b>öne çekilir</b>; kafanın altında çalışılmaz.</p><p>Basınç vermeden önce raf yeniden kafanın altına itilir.</p>'},
 {bolum:'Kartuş',ask:'<b>Kartuş kutusuna</b> tıklayın: bir kartuş alın. Kartuşlar aldığınız sırayla K1, K2 diye numaralanır.',oto:1,halka:H('box',60),izin:['box'],ok:function(s){return s.hand&&s.hand.type==='cart'}},
 {bolum:'Kartuş',ask:'Kolon rafında yanıp sönen <b>deliğe</b> tıklayın ya da sol üstteki <b>Rafa yerleştir</b>’e basın: kartuşu takın.',oto:1,halka:function(s){return s.hand&&s.hand.type==='cart'?[H('hole:2',36),['#btnHPlace',0,0]]:H('box',60)},izin:['rackTop','box'],ok:function(){return rafta().length>=1}},
 {bolum:'Kartuş',ask:'İkinci kartuşu da alın (kutuya tıklayın) ve yanındaki <b>deliğe</b> takın.',oto:1,halka:function(s){return s.hand&&s.hand.type==='cart'?[H('hole:4',36),['#btnHPlace',0,0]]:H('box',60)},izin:['box','rackTop'],ok:function(){return rafta().length>=2}},
 {bolum:'MeOH',ask:'MeOH şişesinin üstündeki <b>dispensere</b> tıklayın: dispenser seçilir.',halka:H('disp:meoh',44),izin:['src:meoh'],ok:function(s){return s.hand&&s.hand.type==='disp'&&s.hand.src.id==='meoh'},
  b:'MeOH dispenseri seçildi',html:'<p>Dispenser <b>3 mL’ye ayarlı</b>. Bir kartuşa tıkladığınızda o kartuşa 3 mL MeOH verilir; dispenser siz bırakana kadar seçili kalır.</p><p>Şişeye pipet girmediği için çözücü kontamine olmaz.</p>'},
 {bolum:'MeOH',ask:'<b>K1</b> kartuşuna tıklayın: 3 mL MeOH verilir.',oto:1,halka:H('cart:0',40),izin:['cart:0'],ok:function(){return E()[0].added>=2.98||E()[0].step>0}},
 {bolum:'MeOH',ask:'<b>K2</b> kartuşuna da tıklayın: dispenser yeniden 3 mL verir.',halka:function(s){return s.hand&&s.hand.type==='disp'?H('cart:1',40):H('disp:meoh',44)},izin:['src:meoh','cart:1'],ok:function(){return E()[1].added>=2.98||E()[1].step>0},hata:sapma,
  b:'İki kartuşta da metanol var',html:'<p>Kartuş en fazla 3 mL alır. Şimdi metanolü basınçla kartuşlardan geçireceksiniz.</p>'},
 {bolum:'Basınç',ask:'Rafın <b>ön yüzüne</b> yeniden tıklayın: raf kafanın altına geri gider.',oto:1,halka:H('pull',50),izin:['pull'],ok:function(s){return !s.pulled&&s.pullT<=.001&&!s.busy}},
 {bolum:'Basınç',ask:'İki baskı anahtarına <b>birlikte</b> basın: basınç kafası iner. Panelde ✋✋ düğmesini kullanın (klavyede A ile L’ye birlikte de basabilirsiniz).',dugme:KAFA,halka:[DG,H('two:L',36),H('two:R',36)],izin:['twoL','twoR'],ok:function(s){return s.headDown&&s.headT>=.999},
  b:'Kafa indi',ne:'Kafanın altındaki conta her kartuşun ağzına oturdu.',neden:'Azot her kartuşa ayrı verilir; her kartuş kendi hızında akar.',yanlis:'Kafa inmeden önce eller ve pipet kafanın altından çekilir.'},
 {bolum:'Basınç',ask:'<b>ADJ düğmesine</b> tıklayın ve açılan kutuda <b>−</b> ile basıncı <b>5 psi</b> yapın.',halka:function(){var r=document.getElementById('regpop');return r&&!r.hidden?['#regMinus',0,0]:H('knob:adj',44)},izin:['knob:adj'],canli:function(s){return 'ADJ ayarı: '+s.adj+' psi'},ok:function(s){return s.adj>=4&&s.adj<=6},
  b:'Basınç 5 psi',ne:'Sıvıların kartuştan geçiş hızını basınç belirler.',neden:'Hedef damla damla akıştır (yaklaşık 1–2 mL/dk): analitlerin sorbentle temas edip tutunmasına zaman kalır.',yanlis:'Basınç bir anda yükseltilmez. Akmayan kartuş olursa basınç birkaç psi artırılır.'},
 {bolum:'Basınç',ask:'Mod seçicinin <b>sol</b> tarafına (ADJ) tıklayın: gaz açılır.',oto:1,halka:H('mode:adj',36),izin:['mode'],ok:function(s){return s.gm==='adj'},
  hata:function(){return S().gm==='max'?'MAX seçildi: bu yüksek basınçtır. Mod seçicinin ortasına tıklayıp kapatın, sonra sol tarafına (ADJ) tıklayın.':''}},
 {bolum:'Basınç',ask:'Metanol kartuşlardan damla damla geçiyor. Manometre basıncı, rotametre gaz akışını gösteriyor. Kartuşlar <b>boşalana</b> kadar bekleyin…',oto:1,izin:[],canli:akis,ok:function(){var r=rafta();return r.length===2&&r.every(function(c){return vol(c)<.002&&c.step>=1})}},
 {bolum:'Basınç',ask:'Kartuşlar boşaldı: mod seçicinin <b>ortasına</b> tıklayın, gazı kapatın (OFF).',halka:H('mode',40),izin:['mode'],ok:function(s){return s.gm==='off'},hata:sapma,
  b:'Sorbent ıslak kalmalı',html:'<p>Kartuş boşaldıktan sonra gaz açık kalırsa azot sorbentin içinden geçer ve sorbent <b>kurur</b>. Şartlandırmadan yükleme bitene kadar sorbent kurutulmaz; kuruyan sorbent analitleri iyi tutamaz.</p><p>Bu yüzden kartuşlar boşalınca gaz hemen kapatılır. Ders boyunca kartuş boşalmak üzereyken hız kendiliğinden <b>1×</b>’e iner.</p>'},
 koc(1,'Şimdi her kartuşa <b>3 mL su</b> ekleyip aynı yolla geçirin: kafa yukarı → raf öne → su ekle → raf geri → kafa aşağı → ADJ → boşalınca OFF. Sıradaki işi sarı halka ve aşağıdaki yazı gösterir.',
  'Şartlandırma tamam',['src:water'],
  '<p>İki kartuş da şartlandırıldı: sorbent ıslak ve sulu numuneye hazır.</p><p>Bir kartuş diğerinden önce biterse, öteki akarken basınç altında boş kalmasın diye <b>bekleme standına</b> alınır; ikisi de bitince rafa geri takılır.</p><p>Sırayı aklınızda tutun:</p><ul><li>Kafa yukarıda, raf öndeyken çözelti ekle.</li><li>Rafı geri it.</li><li>Kafayı indir, ADJ ile damla damla geçir.</li><li>Kartuş boşalınca gazı hemen kapat.</li></ul>'),
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Şartlandırmada önce hangi çözelti geçirilir?',['Su','Metanol (MeOH)','Numune'],1,'Metanol sorbenti ıslatır; ardından su metanolü uzaklaştırır.'],
 ['Kartuş boşalınca ne yapılır?',['Gaz hemen kapatılır (OFF)','MAX’a alınır','Beklenir'],0,'Boş kartuştan geçen azot sorbenti kurutur.'],
 ['Sıvılar kartuştan hangi hızda geçirilir?',['Olabildiğince hızlı','Damla damla, yaklaşık 1–2 mL/dk','Hiç basınç verilmeden'],1,'Analitlerin sorbente tutunmasına zaman kalmalıdır.']],
 bitti:function(){S().done.sart=1}},
speyuk:{ad:'Numune yükleme',ozet:'10 mL numuneyi kendi kartuşuna yükle (N1 → K1, N2 → K2); tıkanan kartuşta basıncı artır, erken biteni standa al.',baslik:'SPE · YÜKLEME',mod:'use',gorev:'sart',
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',html:'<p>İki kartuş rafta ve <b>şartlandırılmış</b>: sorbent ıslak.</p><p>Her tüpte <b>10 mL</b> numune var. Kartuş 3 mL aldığı için numune parça parça yüklenir: <b>3 + 3 + 3 + 1 mL</b>. Her parça geçince sıradaki eklenir.</p><p><b>N1 → K1</b>, <b>N2 → K2</b>. Numune başka kartuşa giderse sonuç başka numuneye yazılır.</p><p>N2 bulanık: içindeki partiküller kartuşu yavaş yavaş tıkayabilir. ADJ basıncı 5 psi’ye ayarlı.</p><p>Numuneler <b>otomatik pipetle</b> (P5000, 3 mL’ye ayarlı) alınır. <b>Her numuneye yeni uç</b> takılır: aynı uçla başka numunenin tüpüne girilirse <b>çapraz kontaminasyon</b> olur.</p>'},
 {bolum:'Yükleme',ask:'Kolon rafının <b>ön yüzüne</b> tıklayın: raf öne gelir, kartuşlara numune eklenebilir.',oto:1,halka:H('pull',50),izin:['pull'],ok:function(s){return s.pulled&&s.pullT>=.999}},
 {bolum:'Yükleme',ask:'Pipet standındaki <b>otomatik pipeti</b> (P5000) alın.',oto:1,halka:H('pipstand',50),izin:['pipstand'],ok:function(s){return s.hand&&s.hand.type==='pip'}},
 {bolum:'Yükleme',ask:'<b>Uç kutusuna</b> tıklayın: pipete yeni uç takın.',oto:1,halka:H('tipbox',50),izin:['tipbox'],ok:function(s){return s.hand&&s.hand.type==='pip'&&!!s.hand.uc}},
 {bolum:'Yükleme',ask:'<b>N1</b> numune tüpüne tıklayın: pipetle 3 mL çekin. Bu numune yalnız <b>K1</b>’e gider.',oto:1,halka:H('src:n1',50),izin:['src:n1'],ok:function(s){return s.hand&&s.hand.type==='pip'&&s.hand.vol>0&&s.hand.src&&s.hand.src.id==='n1'}},
 {bolum:'Yükleme',ask:'<b>K1</b> kartuşuna tıklayın: numuneyi ekleyin.',oto:1,halka:H('cart:0',40),izin:['cart:0'],ok:function(){return E()[0].yuk>0}},
 koc(2,'Kalan numuneyi yükleyin: K1’e <b>N1</b>’den, K2’ye <b>N2</b>’den toplam <b>10’ar mL</b>. Akmayan kartuş olursa ADJ basıncını yavaşça artırın. Sıradaki işi sarı halka gösterir.',
  'Yükleme tamam',['src:n1','src:n2','src:y1','src:y2'],
  function(){var c=E();return '<p>K1’e '+f1(c[0].yuk)+' mL, K2’ye '+f1(c[1].yuk)+' mL numune yüklendi. Analitler artık sorbente tutunmuş durumda.</p><p>Bulanık numuneler kartuşu tıkar: akış yavaşlar, sonunda durur. O zaman basınç birkaç psi artırılır (ADJ en fazla 15 psi).</p><p>Pipet her zaman kartuşun üstündeyken sıkılır: dökülen numune geri gelmez, sonuç eksik çıkar.</p>'}),
 {bolum:'Kontrol',test:1}],
 soru:[
 ['10 mL numune 3 mL’lik kartuşa nasıl yüklenir?',['Hepsi birden dökülür','3 + 3 + 3 + 1 mL, her parça geçince sıradaki eklenir','Yalnız 3 mL yüklenir'],1,'Kartuş en fazla 3 mL alır.'],
 ['Bir kartuş yüklemede akmıyorsa ne yapılır?',['MAX’a alınır','Basınç birkaç psi yavaşça artırılır','Kartuş atılır'],1,'Partiküller kartuşu tıkar; basınç yavaş yavaş artırılır.'],
 ['N2 numunesi hangi kartuşa yüklenir?',['K1','Hangisi boşsa','K2'],2,'Numune ve kartuş numarası her zaman eşleşir.']],
 bitti:function(){S().done.yuk=1}},
speelu:{ad:'Yıkama, kurutma ve elüsyon',ozet:'3 × 3 mL su ve 3 mL su:MeOH 4:1 ile yıka; MAX 20 psi ile 15 dk kurut; toplama rafına geç; 3 mL MeOH ile elüe et.',baslik:'SPE · ELÜSYON',mod:'use',gorev:'yuk',
 adim:[
 {bolum:'Giriş',b:'Ne yapacaksınız?',html:'<p>Numuneler yüklendi; analitler sorbentte. Şimdi:</p><ul><li><b>Yıkama:</b> 3 × 3 mL su (tuzlar ve suda çözünen kirlilikler), sonra 3 mL su:MeOH 4:1 (biraz daha az polar kirlilikler). Analitler sorbentte kalır.</li><li><b>Kurutma:</b> MAX, 20 psi, 15 dk. Sorbentteki su uzaklaşır.</li><li><b>Elüsyon:</b> toplama rafına geçilir, 3 mL MeOH analitleri sorbentten çözüp tüpe taşır.</li></ul><p>ADJ basıncı 5 psi’ye ayarlı.</p>'},
 koc(3,'Kartuşları <b>3 × 3 mL su</b> ile yıkayın: her kartuşa 3 mL ekleyin, geçirin, üç kez tekrarlayın.','Su yıkaması tamam',['src:water'],
  '<p>Su, sorbentte tutunmayan tuzları ve suda iyi çözünen kirlilikleri yıkadı. Analitler sorbente tutunduğu için suyla gitmez.</p>'),
 koc(4,'Şimdi her kartuşa <b>3 mL su:MeOH 4:1</b> ekleyip geçirin.','Yıkama tamam',['src:mix'],
  '<p>Az miktarda metanol içeren karışım, sudan daha güçlü bir yıkamadır: biraz daha az polar kirlilikleri de uzaklaştırır.</p><p>Metanol oranı yükselirse analitler de yıkanıp gider; bu yüzden yıkama çözeltisinin oranı metotta sabittir.</p>'),
 {bolum:'Kurutma',ask:'Kafayı indirin: iki anahtara birlikte basın.',oto:1,dugme:KAFA,halka:DG,izin:['twoL','twoR'],ok:function(s){return s.headDown&&s.headT>=.999}},
 {bolum:'Kurutma',ask:'Kurutma <b>MAX</b> ile yapılır; MAX düğmesi 20 psi’de. Mod seçicinin <b>sağ</b> tarafına (MAX) tıklayın.',halka:H('mode:max',36),izin:['mode','knob:max'],ok:function(s){return s.gm==='max'&&s.max>=18},
  hata:function(){var s=S();return s.gm==='adj'?'ADJ seçildi: ADJ en fazla 15 psi verir, kurutmaya yetmez. Ortasına tıklayıp kapatın, sonra sağ tarafına (MAX) tıklayın.':s.gm==='max'&&s.max<18?'MAX ayarı '+s.max+' psi: düğmeye tıklayıp 20 psi yapın.':''},
  b:'Kurutma başladı',ne:'Azot, boş kartuşların içinden geçerek sorbentteki suyu uzaklaştırır.',neden:'Elüsyon çözücüsü suyla seyrelmez; eluat sonra daha kısa sürede uçurulur.',yanlis:'Kurutma yalnız yıkamadan sonra yapılır. Şartlandırma ile yükleme arasında sorbent kurutulmaz.'},
 {bolum:'Kurutma',ask:'Kurutma 15 dakika sürer. Beklemeyi kısaltmak için hızı <b>60×</b> yapın.',oto:1,dugme:[['⏩ Hızı 60× yap',function(){window.setSpeed(60)}]],halka:DG,izin:[],ok:function(s){return s.speed>=60}},
 {bolum:'Kurutma',ask:'Kartuşlar kurutuluyor. Bekleyin…',oto:1,izin:[],canli:function(s){return 'Basınç '+f1(s.p)+' psi · '+rafta().map(function(c){return 'K'+(c.k+1)+' '+f1(Math.min(15,c.step>5?15:c.dry/60))+' / 15 dk'}).join(' · ')},ok:function(){return rafta().every(function(c){return c.step>=6})}},
 {bolum:'Kurutma',ask:'Kurutma bitti: mod seçicinin <b>ortasına</b> tıklayın (OFF).',halka:H('mode',40),izin:['mode'],ok:function(s){return s.gm==='off'},
  b:'Sorbent kuru',html:'<p>Kartuşlar kurudu. Analitler hâlâ sorbentte.</p>'},
 {bolum:'Elüsyon',ask:'Kafayı kaldırın: iki anahtara birlikte basın.',oto:1,dugme:KAFA,halka:DG,izin:['twoL','twoR'],ok:function(s){return !s.headDown&&s.headT<=.001}},
 {bolum:'Elüsyon',ask:'Kartuşların altına <b>toplama rafını</b> alın.',dugme:[['🔄 Toplama rafına geç',function(){window.setSpeed(10);window.swapRacks()}]],halka:DG,izin:[],ok:function(s){return s.collT>=1&&!s.busy},
  b:'Toplama rafı yerinde',html:'<p>Atık rafı çıktı; her kartuşun altında artık bir <b>cam tüp</b> var.</p><p>Elüsyondan önce bu değişiklik yapılmazsa analitleri taşıyan metanol atık teknesine akar ve numune kaybolur.</p>'},
 {bolum:'Elüsyon',ask:'Elüsyonda akış yavaş olmalı: <b>ADJ düğmesine</b> tıklayıp basıncı <b>3–5 psi</b> arasına indirin.',halka:function(){var r=document.getElementById('regpop');return r&&!r.hidden?['#regMinus',0,0]:H('knob:adj',44)},izin:['knob:adj'],canli:function(s){return 'ADJ ayarı: '+s.adj+' psi'},ok:function(s){return s.adj>=3&&s.adj<=5},
  b:'Yavaş elüsyon',html:'<p>Metanolün sorbentle uzun temas etmesi analitlerin tamamen çözülüp tüpe geçmesini sağlar. Hızlı geçen metanol analitlerin bir kısmını kartuşta bırakır.</p>'},
 koc(6,'Her kartuşa <b>3 mL elüsyon MeOH</b> ekleyip ADJ ile geçirin; eluat tüplere toplanır.','Elüsyon tamam',['src:elu'],
  function(){var c=E();return '<p>Tüplerde eluat: K1 <b>'+f1(c[0].eluate)+' mL</b>, K2 <b>'+f1(c[1].eluate)+' mL</b>. Analitler bu metanolde.</p><p>Eluat sonra azotla uçurulur, az miktar çözücüde yeniden çözülür ve LC-MS/MS’e verilir.</p><p>Bütün sırayı serbest kullanımda beş numuneyle kendiniz deneyebilirsiniz.</p>'}),
 {bolum:'Kontrol',test:1}],
 soru:[
 ['Yıkamada analitler neden kartuştan gitmez?',['Sorbente tutundukları için','Kartuş kapalı olduğu için','Yıkama yapılmadığı için'],0,'Yıkama çözeltisi analitleri sorbentten koparacak kadar güçlü değildir.'],
 ['Elüsyondan önce ne yapılmalıdır?',['Atık rafı yerine toplama rafına geçilir','Kartuşlar atılır','Basınç 60 psi yapılır'],0,'Yoksa eluat atık teknesine akar.'],
 ['Kurutma neden yapılır?',['Kartuş soğusun diye','Sorbentteki su uzaklaşsın, eluat suyla seyrelmesin diye','Numune yüklensin diye'],1,'Kurutma MAX modda 20 psi ile 15 dk yapılır.']],
 bitti:function(){S().done.elu=1}}
};
return {sayfa:'spe_pilot.html',hazir:'__spe',tuval:'#c',ad:'SPE · CEREX 48',model:'Oasis HLB 3 cc',adTam:'SPE cihazının',
 acl:'Cihazı dört kısa bölümde, adım adım öğrenin. Sırayla ilerlemeniz önerilir; her bölüm 4–8 dakika sürer.',
 GM:{parts:'spetani'},AD:AD,ADI:ADI,DERS:DERS,SIRA:['spetani','spesart','speyuk','speelu'],
 /* derste sarı halkanın gösterdiği yere göre kamera kendiliğinden odaklanır (yalnız görünüm değişince) */
 odak:function(ad){var s=S();if(!s||s.mode!=='use'||!window.speOdak)return;var k=null;
  ad.some(function(n){if(n.charAt(0)==='#'){k=n.indexOf('data-dg')>=0?'on':n.indexOf('#lsA')===0?'sol':n.indexOf('#reg')===0?'on':null;return !!k}var p=n.split(':')[0],p2=n.split(':')[1];
   k=p==='box'||p==='stand'||p==='disp'?'sol':p==='hole'||p==='pull'?'raf':p==='cart'?(s.hand&&s.hand.type==='pip'?'raf':'sol'):p==='src'?(p2==='meoh'||p2==='water'||p2==='mix'||p2==='elu'?'sol':'numune'):p==='pipstand'||p==='tipbox'||p==='tipwaste'?'uc':p==='two'||p==='knob'||p==='mode'||p==='gauge'?'on':p==='coll'||p==='waste'?'genel':null;return !!k});
  if(k&&k!==ODAK_SON){ODAK_SON=k;window.speOdak(k)}},
 senkron:function(s,o){['spetani','spesart','speyuk','speelu'].forEach(function(k){if(o[k]&&o[k].bitti)s.done[k]=1})},
 /* serbest kullanım sessiz sınavdır: beş numune, uyarı yok; ✅ İşi bitirdim ile kartuş kartuş rapor */
 serbest:{yerlesim:'kontrol',sessiz:true,kur:function(){if(window.serbestKur)window.serbestKur()},
  ek:'<button class="btn sbBitir" id="sbBitir">✅ İşi bitirdim · Raporu gör</button>',ekBagla:function(d){d.querySelector('#sbBitir').onclick=function(){if(window.serbestRapor)window.serbestRapor.ac()}},
  ses:function(){var o=window.serbestRapor&&window.serbestRapor.ot(),n=o?o.kayit.length:0,b=o?o.biten:0;
   return n?'<b>'+n+' kartuş</b> kullanıldı, <b>'+b+'</b> tanesi elüsyona kadar bitti. Bitirince <b>✅ İşi bitirdim</b>: değerlendirme raporun açılır. Raporu üstteki <b>📋 Rapor</b> ile yeniden açabilirsin.':'Serbest kullanım: uyarı yok, kendi bildiğin gibi çalış. Görev: N1–N5 numunelerini Oasis HLB kartuşlarla ekstrakte et (şartlandırma → yükleme → yıkama → kurutma → elüsyon). Gereken malzemeleri üstteki <b>🧰 Tezgâh</b> düğmelerinden ya da tezgâhtaki işaretli yere tıklayarak getir. Bitirince <b>✅ İşi bitirdim</b>’e bas.'}}};
}

/* ---------- sayfaya göre cihaz ---------- */
var C=null;[vorteks,terazi,ultra,santrifuj,pipet,su,spe].some(function(f){var c=f();if(c.sayfa===SAYFA){C=c;return true}});
if(!C)return;
/* serbest kullanımda canlı uyarı kuralları: yanlış giden şey kesin dille panelde gösterilir */
var SK={
 /* terazi serbest kullanımı bir sınavdır: uyarı, halka ve not yok; yapılan her şey kaydedilir, ilk kayıttan sonra 📋 Rapor */
 'terazi_pilot.html':{yerlesim:'kontrol',sessiz:true,kur:function(){window.reset('free');var s=S();s.mode='use';s.lev={x:3,y:-1};s.cal=false;s.log=[];if(window.otBasla)window.otBasla();window.render()},
  ses:function(s){var o=window.serbestTartim&&window.serbestTartim.ot(),n=o?o.tartim.length:0;return s.pendingSave?'⏳ Kaydet’e basıldı: değer <b>● KARARLI</b> olunca kayıt alınacak'+(s.tL||s.tR?' (önce kapıyı kapat)':'')+'.':n?'<b>'+n+' kayıt</b> alındı. Raporu soldaki <b>📋 Rapor</b> ile yeniden açabilirsin. Yeni tartım için raporda <b>🔄 Tartımı yenile</b>, bitince yine <b>Kaydet</b>.':'Serbest kullanım: uyarı yok, kendi bildiğin gibi çalış. Tartımı bitirince ekrandaki <b>Kaydet</b> tuşuna bas: kayıt alınır ve değerlendirme raporun açılır.'}},
 /* vorteks ve ultrasonik banyo serbest kullanımı da sessiz sınavdır: her karıştırma / her ultrason çalıştırması kaydedilir, ✅ İşi bitirdim ile rapor açılır */
 'vorteks_pilot.html':{yerlesim:'kontrol',sessiz:true,kur:function(){if(window.serbestKur)window.serbestKur()},
  ek:'<button class="bt sbBitir" id="sbBitir">✅ İşi bitirdim · Raporu gör</button>',ekBagla:function(d){d.querySelector('#sbBitir').onclick=function(){if(window.serbestRapor)window.serbestRapor.ac()}},
  ses:function(s){var o=window.serbestRapor&&window.serbestRapor.ot(),n=o?o.kayit.length:0;return n?'<b>'+n+' karıştırma</b> kaydedildi. Bitirince <b>✅ İşi bitirdim</b>: değerlendirme raporun açılır. Raporu soldaki <b>📋 Rapor</b> ile yeniden açabilirsin.':'Serbest kullanım: uyarı yok, kendi bildiğin gibi çalış. Raftaki tüpleri karıştır; her karıştırma kaydedilir. Bitirince <b>✅ İşi bitirdim</b>’e bas: değerlendirme raporun açılır.'}},
 'ultra_pilot.html':{yerlesim:'kontrol',sessiz:true,kur:function(){if(window.serbestKur)window.serbestKur()},
  ek:'<button class="bt sbBitir" id="sbBitir">✅ İşi bitirdim · Raporu gör</button>',ekBagla:function(d){d.querySelector('#sbBitir').onclick=function(){if(window.serbestRapor)window.serbestRapor.ac()}},
  ses:function(s){var o=window.serbestRapor&&window.serbestRapor.ot(),n=o?o.kayit.length:0;return n?'<b>'+n+' ultrason çalıştırması</b> kaydedildi. Bitirince <b>✅ İşi bitirdim</b>: değerlendirme raporun açılır. Raporu soldaki <b>📋 Rapor</b> ile yeniden açabilirsin.':'Serbest kullanım: uyarı yok, kendi bildiğin gibi çalış. Görev: mobil faz şişesini degaze et. Her ultrason çalıştırması kaydedilir. Bitirince <b>✅ İşi bitirdim</b>’e bas: değerlendirme raporun açılır.'}},
 'santrifuj_pilot.html':{kural:function(s){var L=[],mx={ang:5000,mic:14000,buc:4500}[s.rotor]||5000,tol={ang:.5,mic:.15,buc:.5}[s.rotor]||.5;
   if(s.rpm>mx)L.push('Ayarlanan hız ('+s.rpm.toLocaleString('tr-TR')+' rpm) takılı rotorun sınırının üstünde (en fazla '+mx.toLocaleString('tr-TR')+' rpm). Bu ayarla çalıştırılmaz.');
   if(s.slots.some(Boolean)&&window.imb&&window.imb().m>tol)L.push('Rotor dengesiz ('+window.imb().m.toFixed(2).replace('.',',')+' g): tüpler karşılıklı ve eşit ağırlıkta olmalı; tek kalan tüpün karşısına denge tüpü koy.');
   if(s.tray.some(function(t){return (t.kind==='ea'||t.kind==='dcm')&&!t.vent}))L.push('Organik çözücülü tüplerin gazı alınmadı: santrifüjden önce kapak çeker ocakta yavaşça açılıp basınç alınır.');return L}}};
C.serbest=Object.assign({},SK[C.sayfa]||{},C.serbest||{});
/* eski ?gorev= bağlantıları ilgili bölüme yönlendirilir */
if(Q.get('gorev')&&C.GM[Q.get('gorev')]){Q.set('ders',C.GM[Q.get('gorev')]);Q.delete('gorev');location.replace(location.pathname+'?'+Q.toString());return}
var D=Q.get('ders')||'liste';
var DERS=C.DERS,SIRA=C.SIRA;
var L=DERS[D],ADIM=L?L.adim:[],SORU=L?L.soru:[];

/* ---------- görünüm ---------- */
var css=document.createElement('style');
css.textContent=
'body.cders .mentor,body.cders #stepc,body.cders #tband,body.cders:not(.serbest) #side,body.cders:not(.serbest):not(.resOk) #res,body.cders .rot,body.cders #mTasks,body.cders #mParts,body.cders #mUse,body.cders:not(.serbest) #mPanel,body.cders #mReset,body.cders #egCubuk,body.cders #mHome,body.cders #hLab{display:none!important}'+
'body.cders.dk #dersK{display:none}body.cders.dk .stage{right:0}body.cders.dk #cv3{width:100vw!important}'+
'#dersX{position:absolute;top:10px;right:10px;width:30px;height:30px;border:0;border-radius:8px;background:#33444C;color:#EAF2F3;font:700 16px/1 "Source Sans 3",sans-serif;cursor:pointer;z-index:2}#dersX:hover{background:#40545D}'+
'#dersP .ust{padding-right:38px}'+
'#dersMini{display:none;position:fixed;z-index:21;left:12px;bottom:12px;border:0;border-radius:999px;padding:10px 16px;background:#2F7DE1;color:#fff;font:700 14px "Source Sans 3",system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);cursor:pointer}body.cders.dk #dersMini{display:block}'+
'#dersP .uyari{background:#3A1416;color:#FFE1E1;border-radius:12px;padding:10px 12px;border-left:5px solid #E5484D;font-size:14.5px}#dersP .uyari b.nm{display:block;font:700 11px "IBM Plex Mono",monospace;color:#FF8A8A;letter-spacing:.08em;margin-bottom:4px}#dersP .uyari ul{margin:0 0 0 18px;display:grid;gap:4px}'+
'body.cders.serbest.sbk #dersK,body.cders.serbest.sbk #dersMini{display:none!important}body.cders.serbest.sbk.panel .stage{right:300px}body.cders.serbest.sbk.panel #cv3{width:calc(100vw - 300px)!important}body.cders.serbest.sbk:not(.panel) .stage{right:0}body.cders.serbest.sbk:not(.panel) #cv3{width:100vw!important}'+
'body.sbk #side{width:300px;padding:8px;font-size:13px;gap:8px}body.sbk #side h2{font-size:17px}body.sbk #side .sub{font-size:11px}body.sbk #side .bt{padding:6px 8px;font-size:12.5px}body.sbk #side .sideX{display:none}body.sbk .dsp{right:auto;left:96px;top:auto;bottom:12px;transform-origin:bottom left}'+
'#sbEk{display:grid;gap:7px;margin-top:4px;border-top:1px solid rgba(255,255,255,.12);padding-top:8px}#sbEk .sbNum{background:#1F9A97;color:#fff;font-weight:700}#sbEk .sbNumL{display:grid;gap:5px}#sbEk .sbNumL[hidden]{display:none}'+
'#sbEk .sbUy{background:#3A1416;color:#FFE1E1;border-radius:10px;padding:8px 10px;border-left:4px solid #E5484D;font-size:12.5px}#sbEk .sbUy b.nm{display:block;font:700 10px "IBM Plex Mono",monospace;color:#FF8A8A;letter-spacing:.08em;margin-bottom:3px}#sbEk .sbUy ul{margin:0 0 0 16px;display:grid;gap:3px}'+
'#sbEk .sbNot{background:#F1F6F7;color:#16242A;border-radius:10px;padding:8px 10px;border-left:4px solid #2BD9C0;font-size:12.5px;line-height:1.35}#sbEk .sbNot>b:first-child{display:block;font:600 10px "IBM Plex Mono",monospace;color:#1F9A97;letter-spacing:.08em;margin-bottom:2px}#sbEk [hidden]{display:none}'+
'body.sbk .sbGizle{display:none!important}#sbEk .sbVent{background:#B7791F;color:#fff;font-weight:700}#sbEk .sbVent[hidden]{display:none}'+
'#sbEk .sbSes{font-size:12.5px;color:#D7E4E7;line-height:1.4;background:#25333A;border-radius:10px;padding:8px 10px;border-left:4px solid #2BD9C0}'+
'#sbEk .sbBitir{background:#2DBE5B;color:#fff;font-weight:700}'+
'#mRapor.yeni{animation:rkY 1.2s 2}@keyframes rkY{50%{background:#2BD9C0;color:#062126}}'+
'#raporK{position:fixed;inset:0;z-index:2147483100;background:rgba(5,10,12,.7);display:grid;place-items:start center;overflow:auto;padding:22px 12px}#raporK[hidden]{display:none}'+
'#raporK .rk{background:#fff;color:#16242A;border-radius:14px;max-width:820px;width:100%;padding:18px 20px;font:14.5px/1.45 "Source Sans 3",system-ui,sans-serif}'+
'#raporK h2{font:700 24px "Barlow Condensed",sans-serif;margin:0}#raporK h3{font:700 15px "Barlow Condensed",sans-serif;letter-spacing:.05em;text-transform:uppercase;color:#1F6F8B;margin:14px 0 6px}'+
'#raporK .rkS{color:#4A5B62;font-size:13px}#raporK .rkB{float:right;display:flex;gap:6px;flex-wrap:wrap}#raporK .rkB button{border:0;border-radius:8px;padding:7px 12px;font-weight:700;cursor:pointer;background:#E3EBEE;color:#16242A}#raporK .rkB .rkP{background:#1F6F8B;color:#fff}#raporK .rkB .rkYen{background:#2DBE5B;color:#fff}'+
'#raporK .rkPuan{display:flex;align-items:baseline;gap:8px;border-left:6px solid;padding:6px 12px;margin-top:10px;background:#F4F8F9;border-radius:8px}#raporK .rkPuan b{font:700 40px "Barlow Condensed",sans-serif}#raporK .rkPuan em{font-style:normal;font-weight:700;margin-left:8px}'+
'#raporK ul{list-style:none;display:grid;gap:5px;padding:0;margin:0}#raporK li{display:grid;grid-template-columns:22px 1fr;gap:6px}#raporK li i{font-style:normal;font-weight:700;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:12px;color:#fff}#raporK li.ok i{background:#2DBE5B}#raporK li.no i{background:#E5484D}#raporK li.no span{color:#8E2A2E}'+
'#raporK .rkT{border:1px solid #D5DEE2;border-radius:10px;padding:8px 10px;margin-bottom:8px}#raporK .rkTh{display:flex;gap:10px;align-items:baseline;margin-bottom:6px;flex-wrap:wrap}#raporK .rkTh span{font:600 14px "IBM Plex Mono",monospace}#raporK .rkTh em{margin-left:auto;font-style:normal;font-weight:700;color:#1F6F8B}'+
'#raporK .rkN{margin-top:12px;font-size:12px;color:#6B7F86}#raporK .rkBos{color:#8E2A2E;font-weight:600}'+
'@media print{body.rkPrint>*:not(#raporK){display:none!important}body.rkPrint #raporK{position:static;background:none;padding:0}body.rkPrint .rkB{display:none!important}}'+
'#sbEk .sbDers{border:0;background:none;color:#9BB0B6;font:600 12.5px "Source Sans 3",sans-serif;cursor:pointer;padding:4px}'+
'@media (max-width:900px){body.cders.serbest.sbk.panel .stage{right:0;bottom:50dvh}body.cders.serbest.sbk.panel #cv3{width:100vw!important;height:50dvh!important}body.sbk #side{width:auto;max-height:50dvh}}'+
'body.cders .dsp{pointer-events:auto!important;cursor:move;transform:scale(.8);transform-origin:top right;touch-action:none;user-select:none;-webkit-user-select:none}body.cders .dsp.tasindi{transform-origin:top left}body.cders .dsp.sur{box-shadow:0 0 0 2px #2BD9C0,0 10px 26px rgba(0,0,0,.45)}'+
'body.cders.resOk #res:not(:empty):not([hidden]),body.cders.serbest #res:not(:empty):not([hidden]){display:block!important;position:fixed;left:96px;top:58px;right:auto;bottom:auto;transform:none;width:min(360px,calc(100vw - 110px));max-height:60vh;z-index:16;font-size:13px}'+
'body.cders #res .res,body.cders #res .card{padding:10px 12px}body.cders #res .big{font-size:17px}body.cders #res .resg{gap:10px}body.cders #res .resg svg{height:104px}body.cders.resOk:not(.serbest) #res #again{display:none}'+
'@media (max-width:900px){body.cders.resOk #res:not(:empty):not([hidden]),body.cders.serbest #res:not(:empty):not([hidden]){left:8px;top:56px;width:calc(100vw - 16px);max-height:34dvh}}'+
'#dersMini.uy{background:#C62828;animation:dersHal 1.1s infinite}'+
'#dersP .not{background:#F1F6F7;color:#16242A;border-radius:12px;padding:10px 12px;border-left:5px solid #2BD9C0;font-size:14.5px}#dersP .not b.nm{display:block;font:600 11px "IBM Plex Mono",monospace;color:#1F9A97;letter-spacing:.08em;margin-bottom:3px}'+

'body.cders #tip{visibility:hidden!important}'+
'body.cders .stage{right:390px}body.cders #cv3{width:calc(100vw - 390px)!important}'+
'#dersK{position:fixed;z-index:20;top:0;right:0;bottom:0;width:390px;overflow:auto;padding:14px;background:#1E2A30;box-shadow:-10px 0 30px rgba(0,0,0,.35)}'+
'@media (max-width:900px){body.cders .stage{right:0;bottom:46dvh}body.cders #cv3{width:100vw!important;height:54dvh!important}#dersK{top:auto;left:0;width:auto;height:46dvh;border-radius:16px 16px 0 0;padding:10px 12px}body.cders.dk .stage{bottom:0}body.cders.dk #cv3{height:100dvh!important}body.panel #dersMini{display:none!important}}'+
'#dersP{display:grid;gap:10px;min-width:0;grid-template-columns:minmax(0,1fr);font:15px/1.45 "Source Sans 3",system-ui,sans-serif;color:#D7E4E7}'+
'#dersP .ust{display:flex;justify-content:space-between;align-items:baseline;gap:8px}'+
'#dersP .ust b{font:700 19px "Barlow Condensed",sans-serif;color:#EAF2F3;letter-spacing:.02em}'+
'#dersP .ust span{font:600 11px "IBM Plex Mono",monospace;color:#9BB0B6;white-space:nowrap}'+
'#dersP .bol{display:flex;gap:4px}#dersP .bol i{flex:1 1 0;min-width:0;font:600 10px "IBM Plex Mono",monospace;font-style:normal;text-align:center;color:#6F858C;border-top:3px solid #33444C;padding-top:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'#dersP .bol i.g{border-color:#2DBE5B;color:#8FE0A8}#dersP .bol i.s{border-color:#2BD9C0;color:#EAF2F3}'+
'#dersP .ask{background:#F1F6F7;color:#16242A;border-radius:12px;padding:11px 13px;border-left:5px solid #F2B632;font-size:16px}'+
'#dersP .ask.tamam{border-left-color:#2DBE5B;background:#E6F6EB}'+
'#dersP .ask small{display:block;margin-top:5px;color:#B3261E;font-weight:600;font-size:13.5px}'+
'#dersP .canli{font:600 13px "IBM Plex Mono",monospace;color:#7CF2D8;background:#16242A;border-radius:10px;padding:8px 10px}'+
'#dersP .kart{background:#25333A;border-radius:12px;padding:12px 13px;display:grid;gap:8px}'+
'#dersP .kart h4{font:700 18px "Barlow Condensed",sans-serif;color:#2BD9C0;letter-spacing:.02em;margin:0}'+
'#dersP .kart .dg{font:600 13px "IBM Plex Mono",monospace;color:#F2B632}'+
'#dersP .kart dl{display:grid;gap:7px;margin:0}#dersP .kart dt{font:600 10.5px "IBM Plex Mono",monospace;letter-spacing:.08em;color:#9BB0B6}#dersP .kart dd{margin:0}'+
'#dersP .kart ul{margin:0 0 0 18px;display:grid;gap:3px}#dersP .kart p{margin:0}#dersP .kart p+p,#dersP .kart p+ul,#dersP .kart ul+p{margin-top:7px}'+
'#dersP .alt{display:flex;gap:8px;flex-wrap:wrap}'+
'#dersP button{border:0;border-radius:10px;padding:10px 14px;font:700 14.5px "Source Sans 3",system-ui,sans-serif;background:#33444C;color:#EAF2F3;cursor:pointer}'+
'#dersP button.p{background:#2F7DE1;flex:1}#dersP button:disabled{opacity:.4;cursor:default}'+
'#dersP button.is{background:#F2B632;color:#2A2000;flex:1;touch-action:none;user-select:none;-webkit-user-select:none}'+
'#dersP button.ince{flex:1;background:none;color:#9BB0B6;font-weight:600;font-size:13px;padding:4px}'+
'#dersP .sec{display:grid;gap:6px}#dersP .sec button{text-align:left;font-weight:600}'+
'#dersP .sec button.d{background:#1F7A3D}#dersP .sec button.y{background:#8E2A2E}'+
'#dersP .acl{font-size:13.5px;color:#B9CBD0}'+
'#dersP .liste{display:grid;gap:8px}'+
'#dersP .liste button{display:grid;grid-template-columns:30px 1fr auto;gap:10px;align-items:center;text-align:left;background:#25333A;padding:12px}'+
'#dersP .liste button:hover{background:#2D3E46}#dersP .liste .no{width:30px;height:30px;border-radius:50%;background:#33444C;display:grid;place-items:center;font:700 13px "IBM Plex Mono",monospace}'+
'#dersP .liste button.bitti .no{background:#2DBE5B;color:#062126}'+
'#dersP .liste b{display:block;font:700 17px "Barlow Condensed",sans-serif;letter-spacing:.02em}#dersP .liste small{display:block;font-weight:400;font-size:13px;color:#B9CBD0;line-height:1.35}'+
'#dersP .liste em{font:600 11px "IBM Plex Mono",monospace;font-style:normal;color:#7FDCD0;white-space:nowrap}'+
'#dersHalka{position:fixed;z-index:12;pointer-events:none;border-radius:50%;border:4px solid #F2B632;box-shadow:0 0 0 3px rgba(242,182,50,.25),0 0 22px rgba(242,182,50,.9);transform:translate(-50%,-50%);animation:dersHal 1.1s infinite;display:none}'+
'@keyframes dersHal{0%,100%{opacity:.55;scale:.92}50%{opacity:1;scale:1.06}}'+
'@media (prefers-reduced-motion:reduce){#dersHalka{animation:none}}';
document.head.appendChild(css);

function kayit(){try{var o=oku();o[D]={bitti:1,puan:puan,soru:SORU.length,t:Date.now()};localStorage.setItem(LS,JSON.stringify(o))}catch(e){}}
var bolumler=[];ADIM.forEach(function(a){if(bolumler.indexOf(a.bolum)<0)bolumler.push(a.bolum)});
function cikis(){return '<div class="alt">'+(L?'<button class="ince" id="dListe">☰ Bölümler</button>':'')+'<button class="ince" id="dSerbest">Serbest kullanım</button></div>'}
function cikisBagla(){var l=P.querySelector('#dListe'),s=P.querySelector('#dSerbest');if(l)l.onclick=function(){ac('liste')};if(s)s.onclick=serbestBasla}

/* ---------- serbest kullanım: aynı sayfada, görevsiz ---------- */
function serbestBasla(){SERB=true;window.__serbest=true;
 try{var q=new URLSearchParams(location.search);q.delete('ders');q.delete('gorev');q.set('serbest','1');history.replaceState(null,'',location.pathname+'?'+q.toString())}catch(e){}
 document.body.classList.add('serbest');var h=document.getElementById('dersHalka');if(h)h.style.display='none';
 if(C.serbest&&C.serbest.kur)C.serbest.kur();else{window.reset('free');S().mode='use';window.render()}
 NOT='';serbestCiz();
 if(C.serbest.yerlesim==='kontrol'){document.body.classList.add('sbk','panel');var mp=document.getElementById('mPanel');if(mp)mp.classList.add('on');kontrolEk()}else kucult(innerWidth<=900);
 dispatchEvent(new Event('resize'));
 if(!SUT)SUT=setInterval(function(){if(!SERB||!P)return;var s=S();if(!s)return;if(C.serbest.yenile)C.serbest.yenile(P,s);var L=C.serbest.kural&&!C.serbest.sessiz?C.serbest.kural(s):[],h=L.map(function(x){return '<li>'+x+'</li>'}).join('');
  var ek=document.getElementById('sbEk');if(ek&&C.serbest.ekYenile)C.serbest.ekYenile(ek,s);
  var ss=document.getElementById('sbSes');if(ss&&C.serbest.ses){var sh=C.serbest.ses(s);if(ss.innerHTML!==sh)ss.innerHTML=sh}
  var u=document.getElementById('sbUy')||P.querySelector('#dUy');if(u&&h!==SUH){SUH=h;u.innerHTML=h?'<b class="nm">⚠ DİKKAT</b><ul>'+h+'</ul>':'';u.hidden=!h;if(h&&document.body.classList.contains('dk')){var mi=document.getElementById('dersMini');if(mi)mi.classList.add('uy')}}if(!h){var m2=document.getElementById('dersMini');if(m2)m2.classList.remove('uy')}},400)}
var SUT=null,SUH='';
function serbestCiz(){
 P.innerHTML='<div class="ust"><b>'+C.ad+' · SERBEST</b><span>'+C.model+'</span></div>'+
  '<div class="kart"><h4>Serbest kullanım</h4><div><p>Görev yok: cihazı istediğiniz gibi kullanın. Cihazın parçalarına tıklayarak ya da soldaki <b>⚙ Kontroller</b> panelinden çalıştırabilirsiniz.</p><p>Paneli sağ üstteki <b>—</b> ile küçültüp cihaza tam ekran bakabilirsiniz.</p></div></div>'+
  (C.serbest&&C.serbest.html||'')+
  '<div class="uyari" id="dUy" hidden></div>'+
  '<div class="not" id="dNot"'+(NOT?'':' hidden')+'><b class="nm">UZM. MY</b><span id="dNotT">'+NOT+'</span></div>'+
  '<div class="alt"><button class="ince" id="dListe">☰ Bölümler (rehberli ders)</button></div>';
 P.querySelector('#dListe').onclick=function(){ac('liste')};if(C.serbest&&C.serbest.bagla)C.serbest.bagla(P)}
/* sayfanın kendi uzman notları (gizli mentor balonu) serbest kullanımda panele yansıtılır */
function notIzle(){var y=document.getElementById('say');if(!y||!window.MutationObserver)return;new MutationObserver(function(){if(!SERB)return;NOT=y.innerHTML;['dNot','sbNot'].forEach(function(id){var n=document.getElementById(id),t=n&&n.querySelector('.nt');if(n&&t){t.innerHTML=NOT;n.hidden=!NOT}})}).observe(y,{childList:true,characterData:true,subtree:true})}
/* serbest kullanım (kontrol düzeni): bilgi paneli yok; sağda küçültülmüş Kontroller paneli, altında Numune seç, uyarılar ve uzman notu */
function dspKur(){var e=document.getElementById('dsp');if(!e||e.dataset.sur)return;e.dataset.sur=1;e.title='Sürükleyerek istediğin yere taşı';var K2='toksilab_dsp_'+SAYFA,dr=null;
 var koy=function(fx,fy){var par=e.offsetParent||e.parentElement;if(!par)return;var W=par.clientWidth,H=par.clientHeight,w=e.offsetWidth*.8,h=e.offsetHeight*.8;var x=Math.max(4,Math.min(W-w-4,fx*W)),y=Math.max(4,Math.min(H-h-4,fy*H));
  ['left','top'].forEach(function(k,i){e.style.setProperty(k,(i?y:x)+'px','important')});['right','bottom'].forEach(function(k){e.style.setProperty(k,'auto','important')});e.classList.add('tasindi')};
 try{var o=JSON.parse(localStorage.getItem(K2)||'null');if(o)setTimeout(function(){koy(o.x,o.y)},300)}catch(_){}
 addEventListener('resize',function(){try{var o=JSON.parse(localStorage.getItem(K2)||'null');if(o)koy(o.x,o.y)}catch(_){}});
 e.addEventListener('pointerdown',function(ev){var r=e.getBoundingClientRect(),par=(e.offsetParent||e.parentElement).getBoundingClientRect();dr={dx:ev.clientX-r.left,dy:ev.clientY-r.top,par:par};e.classList.add('sur');try{e.setPointerCapture(ev.pointerId)}catch(_){}ev.preventDefault();ev.stopPropagation()});
 e.addEventListener('pointermove',function(ev){if(!dr)return;var P2=dr.par;koy((ev.clientX-dr.dx-P2.left)/P2.width,(ev.clientY-dr.dy-P2.top)/P2.height)});
 var bit=function(){if(!dr)return;dr=null;e.classList.remove('sur');var par=e.offsetParent||e.parentElement;try{localStorage.setItem(K2,JSON.stringify({x:parseFloat(e.style.left)/par.clientWidth,y:parseFloat(e.style.top)/par.clientHeight}))}catch(_){}};
 e.addEventListener('pointerup',bit);e.addEventListener('pointercancel',bit);
 e.addEventListener('dblclick',function(){try{localStorage.removeItem(K2)}catch(_){}['left','top','right','bottom'].forEach(function(k){e.style.removeProperty(k)});e.classList.remove('tasindi')})}
function kontrolEk(){var side=document.getElementById('side');if(!side||document.getElementById('sbEk'))return;var c=side.querySelector('.card')||side;var d=document.createElement('div');d.id='sbEk';
 var nl=C.serbest.numune||[];d.innerHTML=(nl.length?'<button class="bt sbNum" id="sbNumB">🧪 Numune seç ▾</button><div class="sbNumL" id="sbNumL" hidden>'+nl.map(function(n){return '<button class="bt" data-num="'+n[0]+'">'+n[1]+'</button>'}).join('')+'</div>':'')+
  (C.serbest.ek||'')+(C.serbest.sessiz?'<div class="sbSes" id="sbSes">'+(C.serbest.ses?C.serbest.ses(S()):'')+'</div>':'<div class="sbUy" id="sbUy" hidden></div><div class="sbNot" id="sbNot" hidden><b>UZM. MY</b><span class="nt"></span></div>')+'<button class="sbDers" id="sbDers">☰ Rehberli derse dön</button>';
 c.appendChild(d);var L2=d.querySelector('#sbNumL');
 if(L2)d.querySelector('#sbNumB').onclick=function(){L2.hidden=!L2.hidden};
 d.querySelectorAll('[data-num]').forEach(function(b){b.onclick=function(){var m=C.serbest.numuneSec(b.dataset.num);if(!m)L2.hidden=true;else{NOT=m;var n=document.getElementById('sbNot');if(n){n.querySelector('.nt').innerHTML=m;n.hidden=false}}}});
 d.querySelector('#sbDers').onclick=function(){ac('liste')};if(C.serbest.ekBagla)C.serbest.ekBagla(d);
 /* tüp listesi ve elle denge tüpü düğmeleri serbest kullanımda gösterilmez (denge tüpü rafa kendiliğinden gelir) */
 ['tray','balp'].forEach(function(id){var e=document.getElementById(id);if(!e)return;e.classList.add('sbGizle');var pr=e.previousElementSibling;if(pr&&pr.classList.contains('sub')&&id==='tray')pr.classList.add('sbGizle')})}
/* ortak serbest kullanım raporu (vorteks, ultrasonik banyo): sayfa kayıtları hazırlar, burada gösterilir.
   R = {baslik, kayitAd, kayitlar:[{ad,deger,puan,k:[[ok,iyi,kotu]]}], bitirme:[[ok,iyi,kotu]], puan, bos, not, sure, yenileAd, yenile} */
function raporDugme(fn){var b=document.getElementById('mRapor');if(!b){b=document.createElement('button');b.id='mRapor';b.innerHTML='<span>📋</span>Rapor';b.title='Serbest kullanım değerlendirme raporu';var nav=document.querySelector('.snav');if(nav)nav.appendChild(b)}b.onclick=fn;b.classList.add('yeni');setTimeout(function(){b.classList.remove('yeni')},2400)}
function raporGoster(R){var nt=R.puan>=90?['Çok iyi','#1F7A3A']:R.puan>=75?['İyi','#2F7DE1']:R.puan>=60?['Geliştirilmeli','#B85C00']:['Yeniden çalışılmalı','#C62828'];
 var ik=function(x){return '<li class="'+(x[0]?'ok':'no')+'"><i>'+(x[0]?'✓':'✗')+'</i><span>'+(x[0]?x[1]:x[2])+'</span></li>'};
 var o=document.getElementById('raporK');if(!o){o=document.createElement('div');o.id='raporK';document.body.appendChild(o);o.addEventListener('click',function(e){if(e.target===o)o.hidden=true})}
 o.hidden=false;o.innerHTML='<div class="rk"><div class="rkB">'+(R.yenile?'<button class="rkYen" id="rkY">🔄 '+R.yenileAd+'</button>':'')+'<button class="rkP" id="rkP">🖨 Yazdır</button><button id="rkX">Kapat</button></div>'+
  '<h2>'+R.baslik+'</h2><div class="rkS">'+new Date().toLocaleString('tr-TR')+' · süre '+R.sure+' dk · '+R.kayitlar.length+' kayıt</div>'+
  '<div class="rkPuan" style="border-color:'+nt[1]+'"><b style="color:'+nt[1]+'">'+R.puan+'</b><span>/ 100</span><em style="color:'+nt[1]+'">'+nt[0]+'</em></div>'+
  '<h3>'+R.kayitAd+'</h3>'+(R.kayitlar.length?R.kayitlar.map(function(x,i){return '<div class="rkT"><div class="rkTh"><b>'+(i+1)+'. '+x.ad+'</b><span>'+x.deger+'</span><em>'+x.puan+' puan</em></div><ul>'+x.k.map(ik).join('')+'</ul></div>'}).join(''):'<p class="rkBos">'+R.bos+'</p>')+
  (R.bitirme&&R.bitirme.length?'<h3>İşi bitirme</h3><ul>'+R.bitirme.map(ik).join('')+'</ul>':'')+
  '<p class="rkN">'+R.not+'</p></div>';
 o.querySelector('#rkX').onclick=function(){o.hidden=true};var y=o.querySelector('#rkY');if(y)y.onclick=function(){R.yenile();o.hidden=true};
 o.querySelector('#rkP').onclick=function(){document.body.classList.add('rkPrint');window.print();setTimeout(function(){document.body.classList.remove('rkPrint')},400)}}
window.__raporGoster=raporGoster;window.__raporDugme=raporDugme;
/* paneli küçült / aç */
function kucult(on){var b=document.body;b.classList.toggle('dk',!!on);if(!on&&b.classList.contains('panel')){b.classList.remove('panel');var m=document.getElementById('mPanel');if(m)m.classList.remove('on')}
 var mi=document.getElementById('dersMini');if(mi)mi.textContent=SERB?'📘 Serbest kullanım paneli':'📘 Ders panelini aç';setTimeout(function(){dispatchEvent(new Event('resize'))},30)}

function liste(){
 var o=oku(),h='<div class="ust"><b>'+C.ad+'</b><span>'+C.model+'</span></div>';
 h+='<div class="acl">'+C.acl+'</div><div class="liste">';
 SIRA.forEach(function(id,k){var d=DERS[id],b=o[id]&&o[id].bitti;
  h+='<button data-d="'+id+'" class="'+(b?'bitti':'')+'"><span class="no">'+(b?'✓':k+1)+'</span><span><b>'+d.ad+'</b><small>'+d.ozet+'</small></span><em>'+(b?'Tekrarla':'Başla ›')+'</em></button>'});
 P.innerHTML=h+'</div>'+cikis();cikisBagla();
 P.querySelectorAll('[data-d]').forEach(function(b){b.onclick=function(){ac(b.dataset.d)}})}

function aciklama(a){
 var h='<div class="kart"><h4>'+(typeof a.b==='function'?a.b():a.b)+'</h4>';
 if(a.html)h+='<div>'+(typeof a.html==='function'?a.html():a.html)+'</div>';
 else h+='<dl><div><dt>NEDİR?</dt><dd>'+a.ne+'</dd></div><div><dt>NE İŞE YARAR?</dt><dd>'+a.neden+'</dd></div><div><dt>DİKKAT</dt><dd>'+a.yanlis+'</dd></div></dl>';
 return h+'</div>'}
function ciz(){
 var a=ADIM[i],bi=bolumler.indexOf(a.bolum),h='';
 h+='<div class="ust"><b>'+L.baslik+'</b><span>'+(i+1)+' / '+ADIM.length+'</span></div>';
 h+='<div class="bol">'+bolumler.map(function(b,k){return '<i class="'+(k<bi?'g':k===bi?'s':'')+'">'+b+'</i>'}).join('')+'</div>';
 if(a.test){h+=test()}
 else{
  var bek=!!a.ask&&!gecti;
  if(a.ask)h+='<div class="ask'+(gecti?' tamam':'')+'">'+(gecti?(a.bekle?'✓ Açıklamayı okuyun, sonra devam edin.':'✓ Doğru. Açıklamayı okuyun, sonra devam edin.'):a.ask)+(uyari?'<small>'+uyari+'</small>':'')+'</div>';
  else if(uyari)h+='<div class="ask"><small style="margin-top:0">'+uyari+'</small></div>';
  if(bek&&a.canli)h+='<div class="canli" id="dCanli"></div>';
  if(bek&&a.tut)h+='<div class="alt"><button class="is" id="dTut">✋ Bastır (basılı tutun)</button></div>';
  if(bek&&a.dugme)h+='<div class="alt">'+dugmeler(a).map(function(d,k){return '<button class="is" data-dg="'+k+'">'+d[0]+'</button>'}).join('')+'</div>';
  if(!a.ask||gecti)h+=aciklama(a);
  h+='<div class="alt"><button id="dGeri"'+(i?'':' disabled')+'>‹ Geri</button><button class="p" id="dIleri"'+(a.ask&&!gecti?' disabled':'')+'>Devam ›</button></div>'}
 h+=cikis();P.innerHTML=h;cikisBagla();canli();
 var g=P.querySelector('#dGeri'),n=P.querySelector('#dIleri');
 if(g)g.onclick=function(){ac(D)};if(i&&g)g.onclick=function(){geri()};if(n)n.onclick=function(){git(i+1)};
 var t=P.querySelector('#dTut');if(t){t.addEventListener('pointerdown',function(e){e.preventDefault();try{t.setPointerCapture(e.pointerId)}catch(_){}window.startPress()});['pointerup','pointercancel'].forEach(function(ev){t.addEventListener(ev,function(){window.endPress()})})}
 P.querySelectorAll('[data-dg]').forEach(function(b){b.onclick=function(){dugmeler(a)[+b.dataset.dg][1]()}});
 P.querySelectorAll('[data-c]').forEach(function(b){b.onclick=function(){if(cevap!==null)return;cevap=+b.dataset.c;if(cevap===SORU[sn][2])puan++;ciz()}});
 var sd=P.querySelector('#dSoru');if(sd)sd.onclick=function(){sn++;cevap=null;if(sn>=SORU.length){kayit();if(L.bitti)L.bitti()}ciz()};
 var tk=P.querySelector('#dTekrar');if(tk)tk.onclick=function(){ac(D)};
 var sr=P.querySelector('#dSonraki');if(sr)sr.onclick=function(){ac(sr.dataset.d)};
 if(matchMedia('(max-width:900px)').matches)document.getElementById('dersK').scrollTop=0}
function dugmeler(a){return typeof a.dugme[0]==='string'?[a.dugme]:a.dugme}
function canli(){var a=ADIM[i],e=P.querySelector('#dCanli');if(e&&a.canli)e.textContent=a.canli(S())}
function test(){
 if(sn>=SORU.length){var k=SIRA.indexOf(D),sonra=SIRA[k+1];
  return '<div class="kart"><h4>Bölüm tamamlandı</h4><div class="dg">'+puan+' / '+SORU.length+' doğru</div><div><p><b>'+L.ad+'</b> bölümünü bitirdiniz.</p>'+(puan<SORU.length?'<p>Yanlış yanıtladığınız konular için bölümü yeniden izleyebilirsiniz.</p>':'')+(sonra?'<p>Sıradaki bölüm: <b>'+DERS[sonra].ad+'</b>.</p>':'<p>'+C.adTam+' bütün bölümlerini tamamladınız.</p>')+'</div></div><div class="alt"><button id="dTekrar">↺ Baştan</button><button class="p" id="dSonraki" data-d="'+(sonra||'liste')+'">'+(sonra?'Sonraki bölüm ›':'Bölümler ›')+'</button></div>'}
 var s=SORU[sn],h='<div class="kart"><h4>Soru '+(sn+1)+' / '+SORU.length+'</h4><div>'+s[0]+'</div><div class="sec">';
 s[1].forEach(function(c,k){h+='<button data-c="'+k+'" class="'+(cevap===null?'':k===s[2]?'d':k===cevap?'y':'')+'">'+c+'</button>'});
 h+='</div>'+(cevap!==null?'<div class="acl">'+(cevap===s[2]?'✓ Doğru. ':'✗ Doğru yanıt işaretlendi. ')+s[3]+'</div>':'')+'</div>';
 if(cevap!==null)h+='<div class="alt"><button class="p" id="dSoru">'+(sn+1<SORU.length?'Sonraki soru ›':'Sonucu gör ›')+'</button></div>';
 return h}
/* geri: cihazın durumu adım adım geri sarılamadığı için bir önceki açıklama gösterilir */
function geri(){if(i<=0)return;var k=i-1;while(k>0&&ADIM[k].oto)k--;i=k;gecti=!!ADIM[i].ask;uyari='';hataM='';ciz()}
/* Geri ile dönülen adımlar yalnızca okunur: cihaz geri sarılamadığı için yapılmış işler yeniden istenmez.
   Devam, ulaşılan en ileri adıma (UST) kadar açıklamalı adımlar üzerinden ilerler. */
function git(n){if(n<0||n>=ADIM.length)return;
 if(n<=UST&&i<UST){while(n<UST&&ADIM[n].oto)n++;i=n;gecti=n<UST?!!ADIM[n].ask:ustG;uyari='';hataM='';ciz();return}
 i=n;UST=Math.max(UST,n);ustG=false;gecti=false;uyari='';hataM='';SONP=null;ciz()}
function tamam(){var a=ADIM[i];if(a.oto){git(i+1);return}gecti=true;if(i===UST)ustG=true;uyari='';ciz()}
function tik(){
 if(SERB)return;var a=ADIM[i],s=S();if(!s||!a||a.test)return;
 if(s.mode!==L.mod){s.mode=L.mod;window.render()}
 if(a.ask&&!gecti){
  if(a.ok&&a.ok(s)){tamam();return}
  if(a.hata){var m=a.hata();if(m!==hataM){hataM=m;uyari=m;ciz()}}
  canli()}}
/* parça tanıma: sayfanın kendi (gizlenmiş) açıklama balonundan hangi parçaya dokunulduğu okunur */
function parcaTik(){
 if(SERB)return;var a=ADIM[i];if(!a||!a.parca||gecti)return;
 setTimeout(function(){var t=document.getElementById('tip'),b=t&&!t.hidden&&t.querySelector('b');if(!b)return;var id=C.AD[b.textContent];if(!id)return;
  if(a.parca.indexOf(id)>=0){tamam()}else{uyari='Burası: <b>'+C.ADI[id]+'</b>. Yanıp sönen halkanın gösterdiği yere tıklayın.';ciz()}},30)}
/* yanıp sönen halka: sahnedeki nesnenin ekrandaki yerine konur */
function halka(){
 var a=L&&ADIM[i],y=null;
 if(!SERB&&a&&a.halka&&a.ask&&!gecti&&window.scrOf){try{y=typeof a.halka==='function'?a.halka(S()):a.halka}catch(e){y=null}}
 var liste=!y?[]:Array.isArray(y[0])?y:[y];
 if(C.odak&&liste.length)try{C.odak(liste.map(function(q){return q[0]}))}catch(e){}
 while(HK.length<liste.length){var e=document.createElement('div');e.className='dersHalka2';e.style.cssText='position:fixed;z-index:12;pointer-events:none;border:4px solid #F2B632;box-shadow:0 0 0 3px rgba(242,182,50,.25),0 0 22px rgba(242,182,50,.9);transform:translate(-50%,-50%);animation:dersHal 1.1s infinite;display:none';document.body.appendChild(e);HK.push(e)}
 HK.forEach(function(h,k){var q=liste[k];if(!q){h.style.display='none';return}
  try{var p,w,hh;if(q[0].charAt(0)==='#'){var r=document.querySelector(q[0]).getBoundingClientRect();if(!r.width)throw 0;p=[r.left+r.width/2,r.top+r.height/2];w=r.width+16;hh=r.height+16}else{p=window.scrOf(q[0]);w=hh=q[2]}
   h.style.display='block';h.style.borderRadius=q[0].charAt(0)==='#'?'12px':'50%';h.style.left=p[0]+'px';h.style.top=(p[1]+q[1])+'px';h.style.width=w+'px';h.style.height=hh+'px'}catch(e){h.style.display='none'}});
 requestAnimationFrame(halka)}
var HK=[];
/* rehberli derste her adımda yalnız o adımın parçasıyla etkileşim (sayfa onHot içinde sorar) */
window.__izin=function(h){if(SERB||!L)return true;var a=ADIM[i];if(!a||a.test||!a.ask||gecti)return false;if(!a.izin)return true;
 return a.izin.some(function(p){return h===p||h.indexOf(p+':')===0})};
window.__izinUyari=function(){var a=ADIM[i];uyari=!a||!a.ask||gecti?'Bu adımda cihazla işlem yapılmaz: önce açıklamayı okuyup <b>Devam</b>’a basın.':'Bu adımda o parçayla işlem yapılmaz. Yanıp sönen sarı halkanın gösterdiği yere tıklayın.';hataM=uyari;ciz()};
function basla(){
 if(!window[C.hazir]||!window.S||!window.scrOf){setTimeout(basla,150);return}
 document.body.classList.add('cders');if(C.sonucKarti)document.body.classList.add('resOk');document.documentElement.classList.remove('dersOn');
 var K=document.createElement('div');K.id='dersK';P=document.createElement('div');P.id='dersP';K.appendChild(P);document.body.appendChild(K);
 var X=document.createElement('button');X.id='dersX';X.title='Paneli küçült';X.textContent='—';X.onclick=function(){kucult(true)};K.appendChild(X);
 var Mi=document.createElement('button');Mi.id='dersMini';Mi.textContent='📘 Ders panelini aç';Mi.onclick=function(){kucult(false)};document.body.appendChild(Mi);
 /* serbest kullanımda Kontroller açılınca ders paneli yer açmak için küçülür */
 if(window.MutationObserver)new MutationObserver(function(){if(document.body.classList.contains('panel')&&!document.body.classList.contains('dk'))kucult(true)}).observe(document.body,{attributes:true,attributeFilter:['class']});
 notIzle();dspKur();
 var H=document.createElement('div');H.id='dersHalka';document.body.appendChild(H);
 /* önceki bölümlerin kaydı sayfanın görev durumuna da işlenir (eğitim modülü takibi için) */
 var o=oku(),s=S();C.senkron(s,o);if(C.kur)C.kur();
 if(SERB){serbestBasla();return}
 if(!L){s.mode='parts';window.render();liste();dispatchEvent(new Event('resize'));return}
 if(L.once)L.once(s);window.reset(L.gorev||'free');s=S();s.mode=L.mod;if(L.kur)L.kur();window.render();
 var cv=document.querySelector(C.tuval||'#cv3 canvas');if(cv)cv.addEventListener('pointerup',parcaTik);
 git(0);setInterval(tik,120);requestAnimationFrame(halka);dispatchEvent(new Event('resize'))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',basla);else basla();
})();