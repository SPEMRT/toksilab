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
