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
