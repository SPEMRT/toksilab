/* MY ToksiLab · Rehberli dersler: 3B cihaz sayfaları
   Sayfa doğrudan rehberli açılır; ?serbest=1 ile eski serbest kullanım açılır. ?ders= yoksa bölüm listesi gösterilir.
   vorteks_pilot.html?ders=vortani | vorkul | vorlle   (tanıma · HS viali · ekstraksiyon)
   terazi_pilot.html?ders=terani | terkal | ter10      (tanıma · seviye ve kalibrasyon · 10 mg tartım)
   Sayfanın 3B sahnesini ve kendi işlevlerini kullanır; sahneye ve fiziğe dokunmaz. */
(function(){
'use strict';
var Q=null;try{Q=new URLSearchParams(location.search)}catch(e){}
if(!Q||Q.get('serbest')==='1'||Q.get('gorev')==='free')return;
var SAYFA=location.pathname.split('/').pop()||'';
var LS='toksilab_ders_v1';
var P,i=0,gecti=false,uyari='',puan=0,sn=0,cevap=null,hataM='',SONP=null;
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
 {bolum:'Ayar',ask:'<b>Anahtara</b> tıklayın. Her tıklamada konum değişir: O → ON → TOUCH. <b>TOUCH</b> olana kadar tıklayın.',halka:['sw',0,54],ok:function(s){return s.sw==='touch'},
  b:'Anahtar TOUCH konumunda',html:'<p>Güç ışığı yandı; sağ üstteki göstergede <b>TOUCH</b> yazıyor. Başlık şu an dönmüyor: TOUCH modunda yalnızca tüp bastırıldığında döner.</p><p>Kısa karıştırmalar için en güvenli moddur; tüpü kaldırdığınız anda cihaz durur.</p>'},
 {bolum:'Ayar',ask:'<b>Hız düğmesine</b> tıklayın ve açılan kutudaki <b>+</b> ile hızı <b>5</b>. kademeye getirin.',halka:['knob',0,54],ok:function(s){return s.lvl===5},hata:function(){var s=S();return s.lvl>5?'Hız '+s.lvl+'. kademede. <b>−</b> ile 5’e indirin.':''},
  b:'Hız: 5. kademe',html:'<p>5. kademe yaklaşık <b>1500 rpm</b>’dir. Küçük bir vial için orta hız yeterlidir:</p><ul><li>Çok düşük hızda girdap oluşmaz, sıvı karışmaz.</li><li>Çok yüksek hızda vial elden kayabilir.</li></ul>'},
 {bolum:'Karıştırma',ask:'Raftaki <b>HS vialine</b> (kısa, koyu kırmızı sıvılı) tıklayarak viali alın.',halka:['tubes.hs',-38,70],ok:function(s){return s.held==='hs'||s.cupT==='hs'},hata:yanlisTup('hs'),
  b:'Vial elinizde',html:'<p>Viale bakın: altta koyu kırmızı <b>kan</b>, üstte berrak sıvı (su ve iç standart). İki tabaka henüz karışmamış.</p><p>Vorteksten önce her zaman kapağa bakılır. HS vialinin kapağı preslenmiştir ve sızdırmaz.</p>'},
 {bolum:'Karıştırma',ask:'Viali yerleştirin: <b>karıştırma başlığına</b> tıklayın.',oto:1,halka:['cup',0,62],ok:function(s){return s.cupT==='hs'}},
 {bolum:'Karıştırma',ask:'Vialin (ya da başlığın) üstüne <b>basılı tutun</b>. Sıvı tek renk olana kadar bırakmayın.',tut:1,canli:function(s){return 'Homojenlik: %'+Math.round(s.mix.hs*100)+(s.press?' · '+Math.round(s.rpm/10)*10+' rpm':' · bekliyor')},halka:['cup',-6,92],ok:function(s){return s.mix.hs>=1},
  hata:function(){var s=S();return s.cupT!=='hs'?'Vial başlıkta değil. Viali alıp başlığa tıklayın.':s.sw!=='touch'?'Anahtar TOUCH konumunda olmalı.':s.lvl<3?'Hız çok düşük; düğmeden 5. kademeye getirin.':''},
  b:'Vial homojen',html:'<p>Bastırdığınızda başlık döndü, bıraktığınızda durdu: TOUCH modu böyle çalışır.</p><p>Sıvı artık <b>tek renk</b>: kan, su ve iç standart tamamen karıştı. Yaklaşık 10 saniye yetti.</p><p>Karışmamış bir vialde cihaz gaz fazından eksik örnek alır ve sonuç düşük çıkar.</p>'},
 {bolum:'Bitirme',ask:'Viali kaldırın: <b>başlığa</b> bir kez, kısaca tıklayın (basılı tutmayın).',oto:1,dugme:['Viali kaldır',function(){if(S().cupT)window.cupTap()}],halka:['cup',-6,92],ok:function(s){return s.held==='hs'&&!s.cupT}},
 {bolum:'Bitirme',ask:'Viali yerine koyun: <b>tüp rafına</b> tıklayın.',oto:1,halka:['rack',-34,120],ok:function(s){return !s.held&&!s.cupT}},
 {bolum:'Bitirme',ask:'Cihazı kapatın: <b>anahtara</b> tıklayarak <b>O</b> konumuna getirin.',halka:['sw',0,54],ok:function(s){return s.sw==='off'},
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
 {bolum:'Hazırlık',ask:'Raftaki <b>Falkon tüpüne</b> (uzun olan) tıklayarak tüpü alın.',oto:1,halka:['tubes.fal',-60,80],ok:function(s){return s.held==='fal'},hata:yanlisTup('fal')},
 {bolum:'Hazırlık',ask:'Tüpün kapağı açık, tezgâhta duruyor. Aşağıdaki düğmeyle kapağı kapatın.',dugme:['Kapağı sıkıca kapat',function(){if(!S().caps.fal)window.capToggle()}],ok:function(s){return s.caps.fal},
  hata:function(){var s=S();if(s.cupT==='fal'&&!s.caps.fal){window.cupTap();return 'Kapağı açık tüp başlığa konmaz; tüp elinize geri alındı. Önce kapağı kapatın.'}return ''},
  b:'Önce kapak',html:'<p>Vorteksten önce bakılacak ilk şey kapaktır. Açık ya da gevşek kapakla karıştırılırsa:</p><ul><li>Sıvı dışarı sıçrar; <b>numune kaybolur</b>.</li><li>Tezgâh, cihaz ve eldiven kirlenir (<b>bulaşma</b>).</li><li>Çözücü buharı solunur.</li></ul><p>Vidalı kapak sonuna kadar çevrilerek kapatılır.</p>'},
 {bolum:'Hazırlık',ask:'<b>Hız düğmesine</b> tıklayın ve hızı <b>3</b>. kademeye getirin.',halka:['knob',0,54],ok:function(s){return s.lvl===3},hata:function(){var s=S();return s.lvl>3?'Hız '+s.lvl+'. kademede. <b>−</b> ile 3’e indirin.':''},
  b:'Düşük hızla başlayın',html:'<p>Sonunda yüksek hıza çıkacaksınız, ama <b>başlangıç her zaman düşük hızdadır</b>.</p><p>Yüksek hızla başlanırsa sıvı bir anda kapağa sıçrar. Kapağa yapışan sıvı karışmaya katılmaz ve tüp elinizden kayabilir.</p>'},
 {bolum:'Karıştırma',ask:'Tüpü yerleştirin: <b>karıştırma başlığına</b> tıklayın.',oto:1,halka:['cup',0,62],ok:function(s){return s.cupT==='fal'},hata:yanlisTup('fal')},
 {bolum:'Karıştırma',ask:'<b>Anahtara</b> bir kez tıklayarak <b>ON</b> konumuna getirin.',halka:['sw',0,54],ok:function(s){return s.sw==='on'},hata:function(){return S().sw==='touch'?'Anahtar TOUCH konumuna geçti. ON olana kadar yeniden tıklayın.':''},
  b:'ON: sürekli çalışma',html:'<p>Başlık dönmeye başladı ve siz durdurana kadar dönecek. Uzun karıştırmalarda elinizle bastırmanız gerekmez; yine de tüp <b>sıkıca tutulur</b>.</p><p>Şu an hız düşük: sıvı yavaşça dönüyor, ama iki tabaka hâlâ ayrı.</p>'},
 {bolum:'Karıştırma',ask:'Şimdi hızı yükseltin: <b>hız düğmesine</b> tıklayın ve <b>8</b>. kademeye çıkarın.',oto:1,halka:['knob',0,54],ok:function(s){return s.lvl>=7&&s.cupT==='fal'}},
 {bolum:'Karıştırma',ask:'<b>30 saniye</b> yüksek hızda karıştırın. Tüpü ve göstergeyi izleyin…',bekle:1,canli:function(s){return 'Yüksek hızda geçen süre: '+Math.min(30,Math.floor(s.tHigh))+' / 30 sn · ekstraksiyon %'+Math.round(s.mix.fal*100)},ok:function(s){return s.mix.fal>=1},
  hata:function(){var s=S();return s.cupT!=='fal'?'Tüp başlıkta değil. Tüpü başlığa geri koyun.':s.sw!=='on'?'Anahtar ON konumunda olmalı.':s.lvl<7?'Hız düştü. En az 7. kademe olmalı.':''},
  b:'Ekstraksiyon tamam',html:'<p>Tüpe bakın: iki tabaka kayboldu, sıvı <b>bulanık</b> ve tek renk. Buna <b>emülsiyon</b> denir: iki sıvı çok küçük damlacıklar hâlinde birbirine karıştı ve aradığımız madde çözücüye geçti.</p><p>Süre kısa tutulursa ya da hız düşük kalırsa maddenin bir kısmı plazmada kalır; sonuç düşük çıkar.</p>'},
 {bolum:'Bitirme',ask:'Tüpü kaldırın: <b>başlığa</b> bir kez, kısaca tıklayın (basılı tutmayın).',oto:1,dugme:['Tüpü kaldır',function(){if(S().cupT)window.cupTap()}],halka:['cup',-6,92],ok:function(s){return s.held==='fal'&&!s.cupT}},
 {bolum:'Bitirme',ask:'Cihazı kapatın: <b>anahtara</b> tıklayarak <b>O</b> konumuna getirin.',oto:1,halka:['sw',0,54],ok:function(s){return s.sw==='off'}},
 {bolum:'Bitirme',ask:'Tüpü yerine koyun: <b>tüp rafına</b> tıklayın.',halka:['rack',-34,120],ok:function(s){return !s.held&&!s.cupT},
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
return {sayfa:'terazi_pilot.html',hazir:'__bal',ad:'ANALİTİK TERAZİ',model:'MY-Terazi µ6',adTam:'Analitik terazinin',
 acl:'Teraziyi üç kısa bölümde, adım adım öğrenin. Sırayla ilerlemeniz önerilir; her bölüm 3–6 dakika sürer.',
 GM:{parts:'terani',level:'terkal',w10:'ter10',w5:'ter10'},AD:AD,ADI:ADI,DERS:DERS,SIRA:['terani','terkal','ter10'],
 senkron:function(s,o){if(o.terani&&o.terani.bitti)s.done.parts=1;if(o.terkal&&o.terkal.bitti)s.done.level=1;if(o.ter10&&o.ter10.bitti)s.done.w10=1},
 /* fareyle sensörün üstünde durmak kapıyı kendiliğinden açar; derste tıklamayla çakışmasın diye kullanım kipinde fare gezinmesi sahneye iletilmez (sürükleme etkilenmez) */
 kur:function(){addEventListener('pointermove',function(e){if(e.pointerType==='mouse'&&!e.buttons&&e.target.tagName==='CANVAS'&&S()&&S().mode==='use')e.stopPropagation()},true)}};
}

/* ---------- sayfaya göre cihaz ---------- */
var C=null;[vorteks,terazi].some(function(f){var c=f();if(c.sayfa===SAYFA){C=c;return true}});
if(!C)return;
/* eski ?gorev= bağlantıları ilgili bölüme yönlendirilir */
if(Q.get('gorev')&&C.GM[Q.get('gorev')]){Q.set('ders',C.GM[Q.get('gorev')]);Q.delete('gorev');location.replace(location.pathname+'?'+Q.toString());return}
var D=Q.get('ders')||'liste';
var DERS=C.DERS,SIRA=C.SIRA;
var L=DERS[D],ADIM=L?L.adim:[],SORU=L?L.soru:[];

/* ---------- görünüm ---------- */
var css=document.createElement('style');
css.textContent=
'body.cders .mentor,body.cders #stepc,body.cders #tband,body.cders #side,body.cders #res,body.cders .rot,body.cders #mTasks,body.cders #mParts,body.cders #mUse,body.cders #mPanel,body.cders #mReset,body.cders #egCubuk{display:none!important}'+
'body.cders #tip{visibility:hidden!important}'+
'body.cders .stage{right:390px}body.cders #cv3{width:calc(100vw - 390px)!important}'+
'#dersK{position:fixed;z-index:20;top:0;right:0;bottom:0;width:390px;overflow:auto;padding:14px;background:#1E2A30;box-shadow:-10px 0 30px rgba(0,0,0,.35)}'+
'@media (max-width:900px){body.cders .stage{right:0;bottom:46dvh}body.cders #cv3{width:100vw!important;height:54dvh!important}#dersK{top:auto;left:0;width:auto;height:46dvh;border-radius:16px 16px 0 0;padding:10px 12px}}'+
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
function cikisBagla(){var l=P.querySelector('#dListe'),s=P.querySelector('#dSerbest');if(l)l.onclick=function(){ac('liste')};if(s)s.onclick=function(){var q=new URLSearchParams(location.search);q.delete('ders');q.delete('gorev');q.set('serbest','1');location.href=location.pathname+'?'+q.toString()}}

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
  if(a.ask)h+='<div class="ask'+(gecti?' tamam':'')+'">'+(gecti?(a.bekle?'✓ Açıklamayı okuyun, sonra devam edin.':'✓ Doğru. Açıklamayı okuyun, sonra devam edin.'):a.ask)+(uyari&&!gecti?'<small>'+uyari+'</small>':'')+'</div>';
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
function git(n){if(n<0||n>=ADIM.length)return;i=n;gecti=false;uyari='';hataM='';SONP=null;ciz()}
function tamam(){var a=ADIM[i];if(a.oto){git(i+1);return}gecti=true;uyari='';ciz()}
function tik(){
 var a=ADIM[i],s=S();if(!s||a.test)return;
 if(s.mode!==L.mod){s.mode=L.mod;window.render()}
 if(a.ask&&!gecti){
  if(a.ok&&a.ok(s)){tamam();return}
  if(a.hata){var m=a.hata();if(m!==hataM){hataM=m;uyari=m;ciz()}}
  canli()}}
/* parça tanıma: sayfanın kendi (gizlenmiş) açıklama balonundan hangi parçaya dokunulduğu okunur */
function parcaTik(){
 var a=ADIM[i];if(!a||!a.parca||gecti)return;
 setTimeout(function(){var t=document.getElementById('tip'),b=t&&!t.hidden&&t.querySelector('b');if(!b)return;var id=C.AD[b.textContent];if(!id)return;
  if(a.parca.indexOf(id)>=0){tamam()}else{uyari='Burası: <b>'+C.ADI[id]+'</b>. Yanıp sönen halkanın gösterdiği yere tıklayın.';ciz()}},30)}
/* yanıp sönen halka: sahnedeki nesnenin ekrandaki yerine konur */
function halka(){
 var h=document.getElementById('dersHalka'),a=L&&ADIM[i];
 if(h){var g=a&&a.halka&&a.ask&&!gecti&&window.scrOf;
  if(g){try{var y=typeof a.halka==='function'?a.halka(S()):a.halka,p,w;
   var hh;if(y[0].charAt(0)==='#'){var r=document.querySelector(y[0]).getBoundingClientRect();if(!r.width)throw 0;p=[r.left+r.width/2,r.top+r.height/2];w=r.width+16;hh=r.height+16}else{p=window.scrOf(y[0]);w=hh=y[2]}
   h.style.display='block';h.style.borderRadius=y[0].charAt(0)==='#'?'12px':'50%';h.style.left=p[0]+'px';h.style.top=(p[1]+y[1])+'px';h.style.width=w+'px';h.style.height=hh+'px'}catch(e){h.style.display='none'}}
  else h.style.display='none'}
 requestAnimationFrame(halka)}
function basla(){
 if(!window[C.hazir]||!window.S||!window.scrOf){setTimeout(basla,150);return}
 document.body.classList.add('cders');
 var K=document.createElement('div');K.id='dersK';P=document.createElement('div');P.id='dersP';K.appendChild(P);document.body.appendChild(K);
 var H=document.createElement('div');H.id='dersHalka';document.body.appendChild(H);
 /* önceki bölümlerin kaydı sayfanın görev durumuna da işlenir (eğitim modülü takibi için) */
 var o=oku(),s=S();C.senkron(s,o);if(C.kur)C.kur();
 if(!L){s.mode='parts';window.render();liste();dispatchEvent(new Event('resize'));return}
 if(L.once)L.once(s);window.reset(L.gorev||'free');s=S();s.mode=L.mod;if(L.kur)L.kur();window.render();
 var cv=document.querySelector('#cv3 canvas');if(cv)cv.addEventListener('pointerup',parcaTik);
 git(0);setInterval(tik,120);requestAnimationFrame(halka);dispatchEvent(new Event('resize'))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',basla);else basla();
})();