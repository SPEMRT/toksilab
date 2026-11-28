# MY ToksiLab: çalışma notları

Toksikoloji laboratuvarı eğitim simülatörü. Derleme yok: düz HTML/JS, GitHub Pages'te
`main` dalından yayınlanır (https://spemrt.github.io/toksilab/). Arayüz ve metinler Türkçe.

## Önemli dosyalar
- `index.html`: ana sayfa ve eğitim kataloğu
- `lab_giris.html`: 3B laboratuvar; `?mod=tani` = "Laboratuvarı Tanı" turu
- `*_pilot.html`: cihaz simülatörleri (terazi, pipet, vorteks, santrifüj, ultra, su, SPE, gaz, HS-GC-MS…)
- `cihaz_ders.js`: 8 cihazın rehberli dersleri (terazi, pipet, vorteks, santrifüj, ultra, su, gaz tüp odası, SPE).
  Her adımda `halka` öğrenciye sarı halkayla nereye tıklayacağını gösterir.
- `anamenu.js`, `egitim_cubugu.js`: sayfalar arası ortak menü ve eğitim çubuğu
- `maskot.js`: rehber maskotları (Uzm. MY fotoğraflı rehber kartlarının yerine). Her sayfanın `<head>`inde
  yüklenir; sayfa adına göre karakter seçer (`SAYFA`): Toksi (damla, lider; varsayılan: ana sayfa, lab turu,
  SPE, su, ultra, vorteks, santrifüj, gaz tüp odası), Vivi (HS viali: hsgcms_pilot, egitim), Pipo (pipet ucu:
  pipet_pilot), Molli (molekül: kalibrasyon, terazi, örnek hazırlama). Eski `img#av`/`.mentor img` ve "UZM. MY"
  etiketlerini kendisi değiştirir; `#say`/`#sayT` yazısına göre sevinir/düşünür. Derslerde `MASKOT.kart(durum, metin)`
  (durum: bekle, dogru, yanlis, bak); `cihaz_ders.js` ve `hs_ders.js` paneline `ruh(a)` ile eklenir.
  Ana sayfada "ToksiLab ekibi" kartı. Uzm. MY videoları, lab turundaki personel kartı ve eğitim belgesindeki
  "Eğitici · Uzm. MY" imzası bilinçli olarak değişmedi.
- `index.html` üst menüde "Hakkında" paneli (`panelAc('hakkinda')`, adresle `#hakkinda`): kullanıcının kendi yazdığı
  "MY ToksiLab’ın çıkış hikâyesi" ve imzası (Uzman Biyolog Murat Yayla, Toksikoloji Laboratuvarı Analisti). Metni
  kullanıcı onaylamadan değiştirme.
- HS-GC-MS derslerinde (`hs_ders.js`) animasyonlar (kolon, inlet) sahnede solda, yanında bilgi paneli `#anYan`
  ("Ne görüyorsun?" = adımın `animNot`u; dar ekranda altta); ders panelinde artık "İzlerken şunlara bakın" yok.
  `gctani` kolon adımında (`deney:1`) Vivi ile sıcaklık deneyi: SOP izle → sabit 60 °C → sabit 120 °C → SOP'a dön;
  açıklamalar `colAnim`ın `W._ca.rt()` hesapladığı alıkonma süreleriyle yazılır. Amaç: uçucu/kaynama noktası düşük
  maddelerde fırın düşük sıcaklıkta başlatılır. Testte adıma gitmek için `window.__hsDers` (git, bul, tamam).
- HS ve GC-MS dersleri tek ders: `?ders=hsgc` "HS-GC-MS sistemi", 8 bölüm (numunenin yolculuğu sırasıyla):
  sistani (hstani + gctani adımları çalışma anında birleşir), hsyukle, hstus, gctus, pctani, pcsekans, hsbaslat,
  hsgctest (her dersin ilk sorusu). Eski `?ders=hs` / `?ders=gc` buraya açılır; hstani+gctani bitmişse sistani ✓.
  Veri analizi (`?ders=da`) ve metot geliştirme (`?mod=metot`) ayrı.
- HS-GC-MS serbest kullanım `hs_serbest.js`: `?serbest=hs|gc|pc` ya da parametresiz açılışta; üç sekme, alt düğmeler,
  sağda "Burada neler yapabilirsin?" + maskot (sayfanın `#say` uyarılarını aktarır). SOP ekranı (16 adım) yalnızca
  "Kanda etanol" modülü aktifken (localStorage `toksilab_egitim_v1`.aktif) ya da `?gorev=`/`?mod=`/`?egitim=`/`?sop=` ile.
  Dersten "serbest kullanım"a geçişte bölümün cihazının sekmesi açılır.
- Ana sayfa "Eğitimler" paneli (`index.html` → `egitimCiz`): ilk açılışta 5 kategori 1→5 öğrenme yolu (renkli kartlar,
  ilerleme çubuğu, Toksi + "Devam et ›" sıradaki konuyu açar); kategoriye dokununca kartlar üstte numaralı şeride
  küçülür, konular kare kartlar (✓ bitti, SIRADAKİ, kısmi %); karta dokununca ayrıntı penceresi (`#ekDt`, bölümler +
  Başla). İlerleme `IZ` tablosuyla: cihaz/HS dersleri `toksilab_ders_v1` (ders kimlikleri), kalibrasyon
  `toksilab_kalibrasyon_v1` (8 bölüm), analiz modülü `TLE`. Yeni ders eklenince `IZ`'ye kimlikleriyle ekle.
- Ana sayfa (`index.html`): karşılama "Bir laboratuvar. Sınırsız deneme. Gerçek bir deneyim." (anahtar kelimeler
  turkuaz) ve bento kartlar (Laboratuvarı Tanı büyük, Eğitimler ve Adli Vakalar küçük); 1366×768 ekrana sığacak kadar
  sade. Kullanıcı isteğiyle kaldırılanlar: büyük Toksi ve balonu, sayaçlar, "ToksiLab ekibi" bölümü, üst menüdeki
  "Hakkında" ve "Eğitimler" (Hakkında paneli `#hakkinda` adresiyle hâlâ açılır). İlerleme varsa "Kaldığın yer ·
  Devam et" şeridi (`anaCiz`). İlerleme yalnızca tarayıcıda (localStorage); hesap/sunucu yok.
- Videolar şimdilik kapalı (kullanıcı isteği; dosyalar depoda): `index.html` ve `lab_giris.html`'de
  `VIDEO_KAPALI=true`; `false` yapınca hoş geldiniz ve lab turu tanıtım videoları geri gelir.
- "Nasıl kullanılır?" paneli (`nasilCiz`, adresle `#nasil`): üç büyük renkli sekme (Başlarken: 4 adım + 3 ipucu ·
  Ekrandaki işaretler: sarı halka, formül çerçevesi, ✓, SIRADAKİ, maskot yüzleri, düğmeler · Sık sorulanlar: 7 soru).
  Site değişince (yeni işaret, yeni özellik) bu içerikleri de güncelle.
- SPE yükleme dersi (`speyuk`, koç adımı t=2; `spe_pilot.html` → `speKoc`): kartuş tamamen boşalmadan da yer açıldıkça
  (≥ 0,5 mL) numune eklenebilir; akarken ≥ 1,5 mL yer açılınca Toksi "İstersen şimdi ekle…" der (isteğe bağlı, halka
  yok); pipette artan numune kendi tüpüne geri bırakılır. Koç adımlarında (`koc`, `kocT`) sıradaki işi maskot söyler
  (`ruh`/`canli` canlı günceller), panelde yalnız ilerleme (`yukDurum`: K1 ← N1 x / 10 mL). Test için sayfa işlevleri
  `window.__speTest` (aspirate, dispense, togglePull, pipetAl, ucTak, ucAt, setReg). `tests/dersler.js` speyuk bu
  makinede koç adımında takılıyor (değişiklikten önce de; 3B yavaşlığı).
- SPE dispenser ayarlanabilir (1 · 2 · 3 mL, `S.dispVol`, üstteki `#dvol` kutusu, izin anahtarı `dvol`). Dispenser
  ayarlı hacmi verir; kartuşta yer yoksa taşar ("kartuş taştı" kaydı, raporda −5). Şartlandırma, yıkama ve elüsyonda
  da kartuş boşalmadan (≥ 1 mL yer) eklenebilir; koç dispenseri yere göre ayarlatır (halka `#dv1..3`).
- SPE yanlış numune: derste `uyar()` ile engellenir (yanlış kartuşa ekleme, pipetteki numuneyi başka tüpe boşaltma,
  kullanılmış uçla başka tüpe girme); Toksi kırmızı "⛔ Dur!" der (`log` kaydında `ciddi`). Serbest kullanımda izin
  verilir, kaydedilir ve puandan düşülür (numuneler karıştı −30, numune tüpü kontamine −30).
- SPE modeli: kolon rafının üst plakası y = 0,79'da; kartuş başı (flanş) plakaya oturur, kafa inince arada boşluk
  kalmaz. Kartuşun üstü açık (açık uçlu gövde, halka baş), sorbent açık bej (`SORB0`), fritler gri.
- SPE akış hızı kuralı (kullanıcının laboratuvar pratiği): istenen hızda akan kartuş rafta varken tıkanan kartuş için
  basınç ARTIRILMAZ; koç "Basıncı artırma… önce K1 bitsin, standa al" der. Basınç yalnız tıkanan kartuş rafta tek
  kalınca artırılır; sonraki adımda kartuşlar rafa dönünce koç ADJ'yi `S.adj0` değerine (derste 5 psi) indirtir.
  Numune ya da elüsyon > 3 mL/dk akarsa kayıt "çok hızlı akıyor" (kartuş başına bir kez; serbestte −10).
- SPE MAX düğmesi açılışta 0 psi (yanlışlıkla MAX'a alınırsa sıvı fırlamaz); kurutma adımında öğrenci 20 psi yapar
  (halka önce MAX düğmesi, sonra mod seçici). Mod seçicide ortada ölü bölge: gaz kapalıyken ortaya tıklama bir şey
  açmaz; ADJ sol (x < −0,02), MAX sağ (x > 0,04). Sıvı adımında MAX seçilirse koç "MAX yalnız kurutmada" der.
  Dispenserle adımın toplamından fazla verilmesi engellenmez (gerçekçi); "fazla hacim" kaydı ve Toksi uyarısı yeter. "Nasıl kullanılır?" panelinden "Analiz modülleri" kartı kullanıcı isteğiyle kaldırıldı.
- Geri al (`geri_al.js`, ortak motor): derslerde "↶ Geri al" son işlemi tek tek geri alır; adımda işlem kalmayınca
  "‹ Geri" önceki ekrana döner (Devam'a basılan an); geri alınan adımın görevi yeniden istenir. Yöntem: dokunuştan hemen
  önce (`pointerdown`, yakalama evresi) cihaz durumunun kopyası alınır; dokunuş işlem yaptıysa (sayfa `__izin` ile izin verdi,
  bir düğmeye basıldı ya da dersin yeri değişti) ve durum değiştiyse yığına konur (en çok 300). Sahneler `S`'ten çizildiği
  için geri yükleme görüntüyü de düzeltir. `cihaz_ders.js` (8 cihaz + serbest kullanımda üst çubukta `#mGeri`), `hs_ders.js`
  (HS-GC-MS; durum: S, PLAN, IC, METH, açık ekran ve menüler; programda pencere açıkken yapılanlar pencereyle birlikte tek
  işlem; cihaz çalışırken kapalı), `kalibrasyon_pilot.html` (`geriAl`: önce verilen yanıt silinir, sonra önceki adım).
  Hareket sürerken (`S.busy`, `S.anim`, SPE tween) geri alınmaz. Ctrl+Z da çalışır. Sayfanın `S` dışında durumu varsa
  `window.__geriAdaptor` = {al, koy, ayni, mesgul} verir (SPE: kartuşlar, şişe/tüp hacimleri, döküntüler, `S.hand.src` kimlikle).
  Kendi kendine değişen değerler karşılaştırmada sayılmaz (`YOKSAY`: terazi `disp`, gaz basınçları, santrifüj `lidA`…).
  Yeni bir cihaz sayfasında durum `S` dışında tutuluyorsa adaptör ekle; test: `GERI=1 node tests/dersler.js <sayfa>`.
- `modeller/*.glb`: lab turundaki (Örnek Hazırlama odası) cihaz modelleri; cihaz sayfalarından
  `node araclar/model_cikar.js [cihaz]` ile çıkarılır. Bir cihaz sayfasında 3B model değişirse bu aracı
  o cihaz için yeniden çalıştır ve lab turunu kontrol et.

## Değişiklikten sonra test (zorunlu)
Testler `tests/` klasöründe; ayrıntı `tests/README.md`. İlk kullanımda bir kez: `cd tests && npm install`.

| Ne değişti | Çalıştır |
|---|---|
| Her değişiklik | `node tests/smoke.js` (sayfalar hatasız açılıyor mu, ~1 dk) |
| Bir cihazın dersi/sayfası | `node tests/dersler.js <cihaz>_pilot.html` |
| `lab_giris.html` veya `gaz_pilot.html` | `node tests/labtur.js` |
| `cihaz_ders.js` ortak kısmı, `anamenu.js`, `egitim_cubugu.js` | `node tests/dersler.js` (hepsi, uzun sürer: arka planda çalıştır) |
| Geri al (`geri_al.js`, ders dosyalarındaki geri al kısmı, bir sayfanın durumu) | `GERI=1 node tests/dersler.js <sayfa>` · HS-GC-MS: `node tests/hs_geri.js` |

- Sonucu kullanıcıya bildir; başarısız test varsa nedenini incele (simülasyon hatası mı, test robotunun eksiği mi) ve açıkça söyle.
- Yeni bir derste halkanın göstermediği, öğrencinin karar verdiği bir adım varsa robot takılabilir:
  `tests/dersler.js` içindeki `COZUM` listesine o adım için kısa bir tarif ekle.
- Bulut makinesinde ekran kartı yoktur; 3B sayfalar yavaştır. SPE'nin uzun dersleri (şartlandırma,
  yükleme, elüsyon) burada bitmeyebilir; bunu kullanıcıya söyle.
- `⚠ Halkanın ortası tutmadı` uyarıları çok tıklama gerektiren adımlarda çoğu zaman yanlış alarmdır;
  `⚠ Halka ekranın dışında` ise gerçek bir sorundur.

## Çalışma şekli
- Değişiklikler ayrı dalda yapılır, kullanıcı GitHub'da çekme isteğini onaylayarak `main`'e alır.
- Birleştirmeden önce önizleme: `https://raw.githack.com/SPEMRT/toksilab/<dal>/<sayfa>.html`
  (sayfalar arası geçişler canlı siteye gider; o kısımlar ancak birleştirince denenebilir).

## Yapılanlar ve sıradaki işler (kullanıcıyla konuşulanlar)
**Yapıldı:**
- Lab turu, Örnek Hazırlama odası: tezgâhtaki 7 cihaz eğitim sayfalarındaki modellerle değiştirildi
  (`modeller/*.glb`). Ultra saf su, terazi ve santrifüjün görünümü laboratuvardaki gerçek cihaza göre
  düzenlendi (yalnız lab turunda; `araclar/model_cikar.js` içindeki `duzelt`/`uzat`); eğitim sayfaları aynı.
- Bilgi kartlarında gerçek cihaz fotoğrafı: ELGA, terazi, santrifüj (`gorseller/*.jpg`; kurum
  etiketleri bulanık, ≈ 20–30 KB). Fotoğraflarda kurum adı, sözleşme no, demirbaş etiketleri varsa
  siteye koymadan önce bulanıklaştır.
- `kalibrasyon_pilot.html`: adım adım rehberli ders (fentanil ng/mL zinciri, birimlerin sadeleşmesi,
  etanol 2 g/L ara stoktan 0,05–0,5 g/L, HS vialinde 2 mL, su ile; hesap satırı; test).
- Kalibrasyon dersine "Mix" bölümü (fentanil ile etanol arasında): 5 madde (fentanil, morfin, kokain,
  MDMA, amfetamin), her ana stok 1 mg/mL → Mix AS-1/2/3 → aynı 0,05–5 ng/mL kalibratörler. Her madde kendi
  C₁V₁=C₂V₂ hesabı; 5'e bölme/5 ile çarpma hatalarına özel ipucu (`s.ip`); farklı stok örneği (MDMA
  0,1 mg/mL → 100 µL); etiket/uyum/tuz-baz notları; teste 2 mix sorusu. Kullanıcı dosyaları şimdilik
  GitHub'a elle yüklüyor (bu oturumda yazma izni yoktu).
- Kalibrasyon dersinin etanol bölümü etanol + metanol mix oldu: saf sıvılardan 25 mL balonda 2 g/L mix
  ara stok (m = C×V → saflığa böl → V = m/ρ; etanol %99,8, ρ 0,789 → 63,5 µL; metanol %99,9, ρ 0,792 →
  63,2 µL), su ile; kalibratörler aynı (0,05/0,1/0,5 g/L, HS vialinde 2 mL). Soru başına tolerans `s.tol`,
  ipucu başına tolerans `s.ip[[oran, metin, tol]]`.
- Kalibrasyon dersi bölüm listesiyle açılır (cihaz derslerindeki gibi): 8 bölüm, biten ✓, "Kaldığın yerden
  devam et", panelde "☰ Bölümler", üstteki bölüm çubuğu tıklanabilir. Ortadan bir bölüme atlanınca önceki
  bölümlerin plan satırları dolu gelir (`atla`). İlerleme tarayıcıda: localStorage `toksilab_kalibrasyon_v1`.
- Soru adımlarında kullanılacak formül sarı halkayla işaretlenir ("● BU FORMÜL"; telefonda formüle kaydırılır):
  formül kutularında `data-f` (c = C₁V₁, m = kütle, saf = saflık, v = hacim); adımda `g.f`, yoksa `g.formul` → c.
  Yoğunluk kutusunda üç formül ayrı kartlarda, oklarla, birimler parantez içinde.

**Sıradaki (öncelik kullanıcıda; önce sor):**
1. Kalibrasyon dersine eklemeler (kullanıcı anlatacak).
2. Kalan cihazların (vorteks, pipet, ultrasonik banyo, SPE) fotoğraflarını bilgi kartlarına eklemek.
3. "Sanal eğitmen": derslerde hata/doğru anında kullanıcının HeyGen videosu (önceden kaydedilmiş kısa
   klipler, her kullanımda ücret yok). Önce SPE (ör. elüsyonda su seçmek) ve kalibrasyon için klip listesi
   ve konuşma metinleri; serbest kullanım "sessiz sınav" olduğu için orada klipler sonda raporda oynasın.
4. Lab turunda cihaz kartlarına "▶ Uzm. MY anlatıyor" videosu (kullanıcı önlükle cihaz yanında fotoğraf
   çekip HeyGen'de seslendirecek; 20–40 sn, alt yazılı, kendiliğinden açılmasın).
5. Siteyi Cloudflare Pages'te şifreli yayınlamak (kullanıcı adı + şifre ya da Cloudflare Access).
6. `lab_giris.html`'de `viewport` etiketi yok; telefonda tur küçük görünüyor (kullanıcıya sorulmadı).
