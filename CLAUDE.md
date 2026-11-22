# MY ToksiLab: çalışma notları

Toksikoloji laboratuvarı eğitim simülatörü. Derleme yok: düz HTML/JS, GitHub Pages'te
`main` dalından yayınlanır (https://spemrt.github.io/toksilab/). Arayüz ve metinler Türkçe.

## Önemli dosyalar
- `index.html`: ana sayfa ve eğitim kataloğu
- `lab_giris.html`: 3B laboratuvar; `?mod=tani` = "Laboratuvarı Tanı" turu
- `*_pilot.html`: cihaz simülatörleri (terazi, pipet, vorteks, santrifüj, ultra, su, SPE, gaz, HS-GC-MS…)
- `cihaz_ders.js`: 7 cihazın rehberli dersleri (terazi, pipet, vorteks, santrifüj, ultra, su, SPE).
  Her adımda `halka` öğrenciye sarı halkayla nereye tıklayacağını gösterir.
- `anamenu.js`, `egitim_cubugu.js`: sayfalar arası ortak menü ve eğitim çubuğu

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
