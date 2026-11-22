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

## Lab turu testi

    node tests/labtur.js

"Laboratuvarı Tanı" turunu başlatır, kat planından 6 odanın hepsine gider, açık
odalara girer, 9 cihazın bilgi kartını açar.
