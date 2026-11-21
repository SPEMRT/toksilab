// Tüm sayfaları gerçek bir tarayıcıda açar; JS hatası, konsol hatası ve
// yüklenemeyen dosya var mı kontrol eder. Kullanım: node tests/smoke.js [sayfa.html ...]
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { KOK, sunucuAc, tarayiciAc, yonlendir } = require('./ortak');

(async () => {
  const { sunucu, port } = await sunucuAc();
  const sayfalar = process.argv.slice(2).length ? process.argv.slice(2)
    : fs.readdirSync(KOK).filter(f => f.endsWith('.html')).sort();
  const ekranDir = path.join(__dirname, 'ekran');
  fs.mkdirSync(ekranDir, { recursive: true });

  const tarayici = await tarayiciAc(chromium);
  let hataliSayfa = 0;
  for (const ad of sayfalar) {
    const sayfa = await tarayici.newPage({ viewport: { width: 1280, height: 800 } });
    const hatalar = [];
    await yonlendir(sayfa);
    sayfa.on('pageerror', e => hatalar.push('JS hatası: ' + e.message));
    sayfa.on('console', m => { if (m.type() === 'error') hatalar.push('Konsol: ' + m.text()); });
    sayfa.on('response', r => { if (r.status() >= 400) hatalar.push(`Yüklenemedi (${r.status()}): ${r.url()}`); });
    sayfa.on('requestfailed', r => hatalar.push('İstek başarısız: ' + r.url() + ' ' + (r.failure()?.errorText || '')));
    try {
      await sayfa.goto(`http://localhost:${port}/${ad}`, { waitUntil: 'load', timeout: 30000 });
      await sayfa.waitForTimeout(2500);
      await sayfa.screenshot({ path: path.join(ekranDir, ad.replace('.html', '.png')) });
    } catch (e) { hatalar.push('Açılamadı: ' + e.message); }
    // Medya dosyalarının yarıda kesilmesi (ERR_ABORTED) normaldir, sayma.
    const gercek = hatalar.filter(h => !/ERR_ABORTED/.test(h));
    console.log(`${gercek.length ? '✗' : '✓'} ${ad}`);
    gercek.forEach(h => console.log('    ' + h));
    if (gercek.length) hataliSayfa++;
    await sayfa.close();
  }
  await tarayici.close();
  sunucu.close();
  console.log(`\n${sayfalar.length - hataliSayfa}/${sayfalar.length} sayfa temiz. Ekran görüntüleri: tests/ekran/`);
  process.exit(hataliSayfa ? 1 : 0);
})();
