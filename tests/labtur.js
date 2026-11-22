// "Laboratuvarı Tanı" turunu öğrenci gibi gezer: turu başlatır, kat planından her odaya
// gider, açık odalara girer, odalardaki her cihazın bilgi kartını açar.
// Kontrol: JS hatası yok, yüklenemeyen dosya yok, her adımda doğru oda/cihaz gösteriliyor.
// Kullanım: node tests/labtur.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { sunucuAc, tarayiciAc, yonlendir } = require('./ortak');

const ODALAR = [
  [1, 'Kromatografi Laboratuvarı', true], [2, 'Örnek Hazırlama Laboratuvarı', true],
  [3, 'İnorganik Analiz Laboratuvarı'], [4, 'Kimyasal Depo'], [5, 'Gaz Tüp Odası', 'gaz'],
  [6, 'Yangın ve Patlayıcı Analiz Laboratuvarı'],
];
// Oda 2'deki cihazlar ve oda 1'deki HS-GC-MS (lab_giris.html'deki DEVS sırası)
const CIHAZLAR = [[2, 'bal'], [2, 'cen'], [2, 'vor'], [2, 'pip'], [2, 'spe'], [2, 'cal'], [2, 'ult'], [2, 'elga'], [1, 'hsgc']];

(async () => {
  const { sunucu, port } = await sunucuAc();
  const tarayici = await tarayiciAc(chromium);
  const sorunlar = [];
  let adimNo = 0;
  const sonuc = (ok, metin) => { adimNo++; console.log(`${ok ? '✓' : '✗'} ${metin}`); if (!ok) sorunlar.push(metin); };

  const sayfaAc = async (hash = '') => {
    const p = await tarayici.newPage({ viewport: { width: 1280, height: 800 } });
    p.__hatalar = [];
    p.on('pageerror', e => p.__hatalar.push('JS hatası: ' + e.message));
    p.on('response', r => { if (r.status() >= 400) p.__hatalar.push(`Yüklenemedi (${r.status()}): ${r.url()}`); });
    await yonlendir(p);
    await p.goto(`http://localhost:${port}/lab_giris.html?mod=tani${hash}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForFunction(() => document.getElementById('say') && document.getElementById('mapS').children.length, null, { timeout: 90000 });
    return p;
  };
  const videoGec = p => p.evaluate(() => { const g = document.getElementById('wvX'); if (g && g.offsetParent) g.click(); }).catch(() => {});
  // Kat planı her karede yeniden çizilir; kutunun ekrandaki yerine fareyle tıkla.
  const planTikla = async (p, no) => {
    const r = await p.evaluate(n => { const e = document.querySelector(`#mapS .dr[data-no="${n}"]`).getBoundingClientRect(); return [e.left + e.width / 2, e.top + e.height / 2]; }, no);
    await p.mouse.click(r[0], r[1]);
  };
  const balon = p => p.evaluate(() => document.getElementById('say').innerText);
  const hataKontrol = (p, yer) => { while (p.__hatalar.length) sonuc(false, `${yer}: ${p.__hatalar.shift()}`); };

  // 1) Turu başlat ve koridora gir.
  const p = await sayfaAc();
  // Tura başlarken "nasıl gezilir" tanıtımı (5 kart) çıkar; öğrenci gibi İleri ile geç.
  await p.click('#enter');
  await p.waitForTimeout(800);
  const kartlar = [];
  for (let i = 0; i < 8 && await p.evaluate(() => { const k = document.getElementById('kvz'); return k && !k.hidden; }); i++) {
    kartlar.push(await p.evaluate(() => document.querySelector('#kvz h3').textContent));
    await p.evaluate(() => document.getElementById('kvzI').click()); await p.waitForTimeout(300);
  }
  sonuc(kartlar.length === 5, `Nasıl gezilir tanıtımı: ${kartlar.length} kart (${kartlar.join(' · ')})`);
  for (let i = 0; i < 30 && !(await balon(p)).includes('Koridor'); i++) { await videoGec(p); await p.waitForTimeout(1000); }
  sonuc((await balon(p)).includes('Koridor'), 'Tura başla: koridora girildi');
  hataKontrol(p, 'Tur başı');

  // 2) Kat planından her odaya git.
  for (const [no, ad, acik] of ODALAR) {
    if (acik === 'gaz') { // gaz tüp odası ayrı sayfadır; turdan girilir ve tura geri dönülür
      await planTikla(p, no);
      await p.waitForURL(/gaz_pilot\.html/, { timeout: 30000 }).catch(() => {});
      const url = p.url();
      sonuc(/gaz_pilot\.html/.test(url) && /mod=tani/.test(url), `Oda ${no} (${ad}): turdan içeri girildi`);
      await p.waitForSelector('#taniK', { timeout: 90000 }).catch(() => {});
      await p.waitForTimeout(2000);
      const gz = await p.evaluate(() => ({ k: !!document.getElementById('taniK'), ders: !!document.getElementById('dersK'), pill: (document.querySelector('.hdr .pill') || {}).textContent || '' }));
      sonuc(gz.k && !gz.ders && /LABORATUVARI TANI/.test(gz.pill), `Oda ${no}: turda açıklama kutusu var, ders paneli yok`);
      await p.screenshot({ path: path.join(__dirname, 'ekran', `labtur_oda${no}.png`) });
      hataKontrol(p, `Oda ${no} içi`);
      await p.evaluate(() => (document.getElementById('taniGeri') || document.getElementById('hLab') || document.getElementById('mHome')).click()); // '‹ Koridora dön'
      await p.waitForURL(/lab_giris\.html/, { timeout: 30000 }).catch(() => {});
      await p.waitForFunction(() => document.getElementById('say') && /Gaz tüp odasından çıktın/.test(document.getElementById('say').innerText), null, { timeout: 90000 }).catch(() => {});
      const geri = await p.evaluate(() => ({ url: location.href, b: document.getElementById('say').innerText, pill: (document.querySelector('.hdr2 .pill') || {}).textContent || '' }));
      sonuc(/mod=tani/.test(geri.url) && /Gaz tüp odasından çıktın/.test(geri.b) && /TANI/.test(geri.pill), `Oda ${no}: tura, koridorun sonuna geri dönüldü` + ` (adres: ${geri.url.replace(/^.*\//, '')} · etiket: ${geri.pill} · balon: ${geri.b.slice(0, 70)})`);
    } else if (acik) { // açık odadan sonra koridora dönülür
      await planTikla(p, no);
      let girdi = false;
      for (let i = 0; i < 25 && !girdi; i++) {
        await videoGec(p); await p.waitForTimeout(1000);
        girdi = await p.locator('#back').isVisible().catch(() => false);
      }
      await videoGec(p); await p.waitForTimeout(800);
      sonuc(girdi && (await balon(p)).includes(ad.split(' ')[0]), `Oda ${no} (${ad}): içeri girildi`);
      await p.screenshot({ path: path.join(__dirname, 'ekran', `labtur_oda${no}.png`) });
      if (girdi) {
        for (let i = 0; i < 10 && await p.evaluate(() => document.getElementById('wv')?.classList.contains('on')); i++) { await videoGec(p); await p.waitForTimeout(800); }
        await p.click('#back'); await p.waitForTimeout(2500);
      }
    } else {
      await planTikla(p, no);
      await p.waitForTimeout(3000);
      sonuc((await balon(p)).includes(ad), `Oda ${no} (${ad}): kapıya gidildi, bilgi verildi`);
    }
    hataKontrol(p, `Oda ${no}`);
  }
  await p.close();

  // 3) Her cihazın bilgi kartı (kaldığın yerden dönüş bağlantısıyla cihazın önünden başlanır).
  for (const [oda, k] of CIHAZLAR) {
    const q = await sayfaAc(`#r${oda}-${k}`);
    await q.waitForTimeout(1500); await videoGec(q);
    const chip = q.locator('#devchip');
    const ad = (await chip.innerText().catch(() => '')).replace(/\s·\s*bilgi.*$/, '').trim();
    await chip.evaluate(e => e.click()).catch(() => {}); // etiket 3B sahnede gezer; doğrudan tıkla
    await q.waitForTimeout(800);
    const kart = await q.evaluate(() => { const r = document.getElementById('room'); return r && !r.hidden ? r.innerText : ''; });
    const iyi = kart && ad && kart.includes(ad.replace(/^\S+\s/, '')) && !/undefined|NaN/.test(kart) && kart.includes('Bu cihazla neler yapılır');
    sonuc(!!iyi, `Oda ${oda} · ${ad || k}: bilgi kartı` + (iyi ? '' : ` (kart: ${kart.slice(0, 80).replace(/\n/g, ' ')})`));
    hataKontrol(q, `Cihaz ${k}`);
    await q.close();
  }

  await tarayici.close(); sunucu.close();
  console.log(`\n${adimNo - sorunlar.length}/${adimNo} kontrol temiz.`);
  process.exit(sorunlar.length ? 1 : 0);
})();
