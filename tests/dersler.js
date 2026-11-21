// Rehberli dersleri bir öğrenci gibi baştan sona oynatır: yanıp sönen sarı halkaya
// tıklar, ders düğmelerine basar, soruları yanıtlar. Bir adımda takılırsa ya da
// JavaScript hatası çıkarsa o dersi başarısız sayar.
// Kullanım: node tests/dersler.js                 (tüm dersler)
//           node tests/dersler.js spe_pilot.html   (bir sayfanın dersleri)
//           node tests/dersler.js spe_pilot.html?ders=speyuk
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { sunucuAc, yonlendir, tarayiciAc } = require('./ortak');

const KOK = path.resolve(__dirname, '..');
const ADIM_SURESI = +process.env.ADIM_SURESI || 120000; // bir adımda en fazla bekleme (ms)

// cihaz_ders.js başındaki listeden dersleri çıkar: "sayfa.html?ders=a | b | c"
function dersListesi() {
  const bas = fs.readFileSync(path.join(KOK, 'cihaz_ders.js'), 'utf8').split('*/')[0];
  const L = [];
  for (const m of bas.matchAll(/(\w+_pilot\.html)\?ders=([\w |]+?)\s{2,}/g))
    m[2].split('|').map(s => s.trim()).filter(Boolean).forEach(d => L.push(`${m[1]}?ders=${d}`));
  return L;
}

async function dersOynat(tarayici, port, hedef) {
  const sayfa = await tarayici.newPage({ viewport: { width: 1280, height: 800 } });
  const hatalar = [];
  sayfa.on('pageerror', e => hatalar.push('JS hatası: ' + e.message));
  await yonlendir(sayfa);
  const sonuc = { hedef, tamam: false, adim: '', hatalar, sure: 0 };
  const t0 = Date.now();
  try {
    await sayfa.goto(`http://localhost:${port}/${hedef}`, { waitUntil: 'load', timeout: 30000 });
    await sayfa.waitForSelector('#dersP .ust', { timeout: 30000 });
    let sonAnahtar = '', adimBasi = Date.now(), sonTik = 0, deneme = 0;
    while (true) {
      if (hatalar.length) break;
      const d = await sayfa.evaluate(() => {
        const P = document.getElementById('dersP');
        const q = s => P.querySelector(s);
        const ileri = q('#dIleri');
        const halkalar = [...document.querySelectorAll('.dersHalka2')]
          .filter(h => h.style.display === 'block')
          .map(h => [parseFloat(h.style.left), parseFloat(h.style.top)]);
        return {
          no: (q('.ust span') || {}).textContent || '',
          ask: ((q('.ask') || {}).innerText || '').split('\n')[0].slice(0, 140),
          bitti: !!q('#dSonraki'),
          ileri: !!ileri && !ileri.disabled,
          secenek: P.querySelectorAll('[data-c]').length,
          cevaplandi: !!q('#dSoru'),
          dugme: P.querySelectorAll('[data-dg]').length,
          tut: !!q('#dTut'),
          halkalar,
        };
      });
      if (d.bitti) { sonuc.tamam = true; break; }
      const anahtar = d.no + '|' + d.ask + '|' + d.cevaplandi + '|' + d.ileri;
      if (anahtar !== sonAnahtar) { sonAnahtar = anahtar; adimBasi = Date.now(); deneme = 0; if (process.env.AYRINTI) console.log('   ·', anahtar, JSON.stringify(d.halkalar), d.dugme, d.tut); }
      sonuc.adim = `${d.no} ${d.ask}`.trim();
      if (Date.now() - adimBasi > ADIM_SURESI) { hatalar.push('Adımda takıldı: ' + sonuc.adim); break; }

      if (d.cevaplandi) await sayfa.click('#dSoru');
      else if (d.secenek) await sayfa.click('#dersP [data-c]');
      else if (d.ileri) await sayfa.click('#dIleri');
      else if (Date.now() - sonTik > 1500) {
        // Adım öğrenciden bir işlem bekliyor: düğme, basılı tutma ya da halkaya tıklama.
        sonTik = Date.now(); deneme++;
        if (d.dugme) await sayfa.click(`#dersP [data-dg="${(deneme - 1) % d.dugme}"]`);
        else if (d.tut) {
          const b = await sayfa.locator('#dTut').boundingBox();
          await sayfa.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
          await sayfa.mouse.down(); await sayfa.waitForTimeout(4000); await sayfa.mouse.up();
        } else if (d.halkalar.length) {
          const [x, y] = d.halkalar[(deneme - 1) % d.halkalar.length];
          await sayfa.mouse.click(x, y);
        }
      }
      await sayfa.waitForTimeout(250);
    }
  } catch (e) { hatalar.push('Hata: ' + e.message.split('\n')[0]); }
  sonuc.sure = Math.round((Date.now() - t0) / 1000);
  if (!sonuc.tamam || hatalar.length) {
    fs.mkdirSync(path.join(__dirname, 'ekran'), { recursive: true });
    await sayfa.screenshot({ path: path.join(__dirname, 'ekran', 'ders_' + hedef.replace(/\W+/g, '_') + '.png') }).catch(() => {});
  }
  await sayfa.close();
  return sonuc;
}

(async () => {
  const { sunucu, port } = await sunucuAc();
  const arg = process.argv.slice(2);
  const tum = dersListesi();
  const hedefler = arg.length ? tum.filter(h => arg.some(a => h === a || h.startsWith(a + '?'))).concat(arg.filter(a => a.includes('?ders=') && !tum.includes(a))) : tum;
  const tarayici = await tarayiciAc(chromium);
  // Aynı anda birkaç ders oynatılır (PARALEL=3 varsayılan).
  let kotu = 0, sira = 0;
  const isci = async () => {
    while (sira < hedefler.length) {
      const h = hedefler[sira++];
      const r = await dersOynat(tarayici, port, h);
      const iyi = r.tamam && !r.hatalar.length;
      if (!iyi) kotu++;
      console.log(`${iyi ? '✓' : '✗'} ${h}  (${r.sure} sn)` +
        (iyi ? '' : '\n    son adım: ' + r.adim + r.hatalar.map(x => '\n    ' + x).join('')));
    }
  };
  await Promise.all(Array.from({ length: +process.env.PARALEL || 3 }, isci));
  await tarayici.close(); sunucu.close();
  console.log(`\n${hedefler.length - kotu}/${hedefler.length} ders sonuna kadar oynandı.`);
  process.exit(kotu ? 1 : 0);
})();
