# Tarayıcı testleri

Bütün sayfaları gerçek bir Chromium'da açar, şunları kontrol eder:
JavaScript hatası, konsol hatası, yüklenemeyen dosya (resim, video, script).
Her sayfanın ekran görüntüsünü `tests/ekran/` klasörüne kaydeder.

## Kurulum (bir kere)

    cd tests
    npm install
    npx playwright install chromium   # bilgisayarında Playwright tarayıcısı yoksa

## Çalıştırma

    node tests/smoke.js                 # tüm sayfalar
    node tests/smoke.js spe_pilot.html  # tek sayfa

Hata yoksa çıkış kodu 0, varsa 1 olur.

Not: `npm install` ile gelen three.js kopyaları, CDN'e erişilemeyen ortamlarda
kullanılır. Site yine CDN'den yüklemeye devam eder, sayfalarda değişiklik yoktur.

## Ders testi (rehberli dersler)

    node tests/dersler.js                    # tüm dersler (temel beceriler + SPE)
    node tests/dersler.js spe_pilot.html     # bir cihazın dersleri
    node tests/dersler.js spe_pilot.html?ders=speyuk

Robot, öğrenci gibi yanıp sönen sarı halkaya tıklar, ders düğmelerine basar, soruları
yanıtlar. Halkanın göstermediği karar adımları (tüpleri karşılıklı dizmek, hacim
ayarlamak vb.) için `COZUM` listesindeki tarifleri kullanır. Takılırsa hangi adımda
takıldığını yazar ve `tests/ekran/ders_*.png` ekran görüntüsünü kaydeder.
`⚠` satırları dersi bozmayan ama öğrenciyi zorlayabilecek bulgulardır
(ör. halka ekranın dışında). Ayrıntı için: `AYRINTI=1`, paralel sayısı: `PARALEL=3`.

## Geri al testi

    GERI=1 node tests/dersler.js vorteks_pilot.html
    node tests/hs_geri.js                    # HS-GC-MS dersleri (sistani hsyukle hstus gctus pctani pcsekans)

`GERI=1` ile robot her görevli adım bitince "↶ Geri al"a basar: cihaz adımın başındaki
hâline dönmeli, görev yeniden istenmeli, "‹ Geri" bir önceki ekrana götürmeli. Sonra adımı
yeniden yapar. Çıktıda kaç adımın geri alındığı yazılır. `hs_geri.js` robotunun çözemediği
adımda (ör. hücreye yazı yazmak, animasyon görevi) durur; bu hata sayılmaz.

## Lab turu testi

    node tests/labtur.js

"Laboratuvarı Tanı" turunu başlatır ("nasıl gezilir" tanıtımından geçer), kat planından
6 odanın hepsine gider, açık odalara ve gaz tüp odasına girip tura döner, 9 cihazın bilgi kartını açar.
