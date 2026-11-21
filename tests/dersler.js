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

// Halkanın göstermediği, öğrencinin kendi karar verdiği adımlar için doğru davranış.
// Her çözüm sayfanın içinde çalışır; adım metni (ask) desene uyunca halka yerine çağrılır.
const COZUM = [
  { sayfa: 'pipet_pilot.html', ask: /hacmi ([\d,]+) µL/, fn: () => {
    // Kutu kapalıysa halka (hacim halkası) açar; açıksa − / + ile hedef hacme git.
    const hedef = parseFloat(document.querySelector('#dersP .ask').innerText.match(/hacmi ([\d,]+) µL/)[1].replace(',', '.'));
    const v = document.getElementById('vpop');
    if (!v || v.hidden) return 'halka';
    for (let n = 0; n < 400 && Math.abs(window.S.vol - hedef) > 1e-3; n++)
      document.getElementById(window.S.vol < hedef ? 'vpP' : 'vpM').click();
  } },
  { sayfa: 'terazi_pilot.html', ask: /Kabarcığı ortalayın/, fn: () => {
    // Canlı ipucunu uygula: doğru ayağın kutusu açıksa ↻ / ↺; değilse halka (ayak) açar.
    const g = window.sugg(), f = document.getElementById('fpop');
    if (!g || !f || f.hidden) return 'halka';
    if (!document.getElementById('fpT').textContent.startsWith(g[0] === 'L' ? 'Sol' : 'Sağ')) return 'halka';
    document.getElementById(g[1] > 0 ? 'fpCW' : 'fpCCW').click();
  } },
  { sayfa: 'vorteks_pilot.html', ask: /(\d+)\. kademeye getirin/, fn: () => {
    // Kutu kapalıysa halka (hız düğmesi) açar; açıksa + / − ile hedef kademeye git.
    const hedef = +document.querySelector('#dersP .ask').innerText.match(/(\d+)\. kademeye/)[1];
    const k = document.getElementById('kpop');
    if (!k || k.hidden) return 'halka';
    const v = window.S.lvl;
    if (v !== hedef) document.getElementById(v < hedef ? 'kpP' : 'kpM').click();
  } },
  { sayfa: 'santrifuj_pilot.html', ask: /yerleştirin|karşısına \(8 yuva/i, degil: /denge (mikro)?tüpü hazırlayın/i, fn: () => {
    // Aynı tür tüpleri karşılıklı diz; tek kalanı boş bir çiftin bir yarısına koy.
    const s = window.S, N = s.slots.length, h = N / 2;
    const bos = s.tray.filter(t => t.where == null && !/^w/.test(t.kind));
    const g = {}; bos.forEach(t => (g[t.kind] = g[t.kind] || []).push(t));
    const yer = () => { for (let k = 0; k < h; k++) if (!s.slots[k] && !s.slots[k + h]) return k; return -1; };
    const koy = (t, k) => { s.sel = t.id; window.slot(k); };
    for (const L of Object.values(g)) {
      while (L.length >= 2) { const k = yer(); koy(L.shift(), k); koy(L.shift(), k + h); }
      if (L.length) koy(L[0], yer());
    }
  } },
  { sayfa: 'santrifuj_pilot.html', ask: /denge (mikro)?tüpü hazırlayın/i, fn: () => {
    // Hacim düğmelerini sırayla dene; denge tüpünü karşısız tüpün karşısına koy, olmazsa geri al.
    const s = window.S, N = s.slots.length, h = N / 2;
    const bal = () => s.tray.find(t => /^w/.test(t.kind));
    const b = bal();
    if (b && b.where != null) { if (s.f.placed) return; window.slot(b.where); }
    const dg = document.querySelectorAll('#dersP [data-dg]');
    window.__coz = (window.__coz || 0); if (dg.length) dg[window.__coz++ % dg.length].click();
    const t = bal(); if (!t) return;
    for (let k = 0; k < N; k++) if (s.slots[k] && !s.slots[(k + h) % N]) { s.sel = t.id; window.slot((k + h) % N); return; }
  } },
];

// Halka ekran dışında kalırsa testin devam edebilmesi için sayfanın kendi işlevi.
const EKRAN_DISI = {
  'santrifuj_pilot.html': () => window.toggleLid(),
};

async function dersOynat(tarayici, port, hedef) {
  const sayfa = await tarayici.newPage({ viewport: { width: 1280, height: 800 } });
  const hatalar = [];
  sayfa.on('pageerror', e => hatalar.push('JS hatası: ' + e.message));
  await yonlendir(sayfa);
  const sonuc = { hedef, tamam: false, adim: '', hatalar, uyarilar: [], kayma: '', sure: 0 };
  const t0 = Date.now();
  try {
    await sayfa.goto(`http://localhost:${port}/${hedef}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await sayfa.waitForSelector('#dersP .ust', { timeout: 90000 });
    let canliTik = '', sonCanli = '', sonAnahtar = '', adimBasi = Date.now(), sonTik = 0, deneme = 0;
    while (true) {
      if (hatalar.length) break;
      const d = await sayfa.evaluate(() => {
        const P = document.getElementById('dersP');
        const q = s => P.querySelector(s);
        const ileri = q('#dIleri');
        const halkalar = [...document.querySelectorAll('.dersHalka2')]
          .filter(h => h.style.display === 'block')
          .map(h => [parseFloat(h.style.left), parseFloat(h.style.top), parseFloat(h.style.width) || 40]);
        return {
          no: (q('.ust span') || {}).textContent || '',
          ask: ((q('.ask') || {}).innerText || '').split('\n')[0].slice(0, 140),
          bitti: !!q('#dSonraki'),
          ileri: !!ileri && !ileri.disabled,
          secenek: P.querySelectorAll('[data-c]').length,
          cevaplandi: !!q('#dSoru'),
          dugme: P.querySelectorAll('[data-dg]').length,
          tut: !!q('#dTut'),
          canli: (q('#dCanli') || {}).textContent || '',
          halkalar,
        };
      });
      if (d.bitti) { sonuc.tamam = true; break; }
      const anahtar = d.no + '|' + d.ask + '|' + d.cevaplandi + '|' + d.ileri;
      if (anahtar !== sonAnahtar) {
        sonTik = Date.now() - 700; canliTik = d.canli; // kamera yerine otursun diye ilk tıklamadan önce kısa bekleme
        if (sonuc.kayma && d.ileri) { sonuc.uyarilar.push('Halkanın ortası tutmadı, kenarına tıklayınca geçti: ' + sonuc.kayma); }
        sonuc.kayma = ''; sonAnahtar = anahtar; adimBasi = Date.now(); deneme = 0; if (process.env.AYRINTI) console.log('   ·', anahtar, JSON.stringify(d.halkalar), d.dugme, d.tut); }
      // Canlı gösterge değişiyorsa (rotor dönüyor, sıvı akıyor) adım ilerliyor demektir; takılmış sayma.
      if (d.canli !== sonCanli) { sonCanli = d.canli; adimBasi = Date.now(); }
      sonuc.adim = `${d.no} ${d.ask}`.trim();
      if (Date.now() - adimBasi > ADIM_SURESI) { hatalar.push('Adımda takıldı: ' + sonuc.adim); break; }

      if (d.cevaplandi) await sayfa.click('#dSoru');
      else if (d.secenek) await sayfa.click('#dersP [data-c]');
      else if (d.ileri) await sayfa.click('#dIleri');
      // Son tıklamadan sonra canlı gösterge değiştiyse işlem sürüyor: yeniden tıklama, bekle.
      else if (sonTik && d.canli !== canliTik && Date.now() - sonTik < 60000) { canliTik = d.canli; sonTik = Date.now(); }
      else if (Date.now() - sonTik > 1500) {
        canliTik = d.canli;
        // Adım öğrenciden bir işlem bekliyor: düğme, basılı tutma ya da halkaya tıklama.
        sonTik = Date.now(); deneme++;
        const sayfaAdi = hedef.split('?')[0];
        const coz = COZUM.find(c => c.sayfa === sayfaAdi && c.ask.test(d.ask) && !(c.degil && c.degil.test(d.ask)));
        if (coz && (await sayfa.evaluate(coz.fn)) !== 'halka') { /* çözüm uygulandı */ }
        else if (coz) { const [x, y] = d.halkalar[0] || []; if (x != null) await sayfa.mouse.click(x, y); }
        else if (d.dugme) await sayfa.click(`#dersP [data-dg="${(deneme - 1) % d.dugme}"]`);
        else if (d.tut) {
          const b = await sayfa.locator('#dTut').boundingBox();
          await sayfa.mouse.move(b.x + b.width / 2, b.y + b.height / 2);
          await sayfa.mouse.down(); await sayfa.waitForTimeout(4000); await sayfa.mouse.up();
        } else if (d.halkalar.length && d.halkalar.every(([x, y]) => x < 0 || y < 0 || x > 1280 || y > 800)) {
          // Halka ekranın dışında: öğrenci göremez. Bulguyu kaydet, sayfanın kendi işleviyle devam et.
          const not = 'Halka ekranın dışında (' + d.halkalar.map(([x, y]) => Math.round(x) + ',' + Math.round(y)).join(' ') + '): ' + d.no + ' ' + d.ask;
          if (!sonuc.uyarilar.includes(not)) sonuc.uyarilar.push(not);
          const ed = EKRAN_DISI[hedef.split('?')[0]];
          if (ed) await sayfa.evaluate(ed);
        } else if (d.halkalar.length) {
          // Önce halkanın ortası; tutmazsa halkanın içinde başka noktalar (öğrenci de böyle dener).
          const n = d.halkalar.length, [x, y, w] = d.halkalar[(deneme - 1) % n];
          const KAY = [[0, 0], [0, 0], [0, -.3], [0, .3], [-.3, 0], [.3, 0], [0, -.4], [-.25, -.25], [.25, -.25]];
          const [ox, oy] = KAY[Math.floor((deneme - 1) / n) % KAY.length];
          if (ox || oy) sonuc.kayma = d.no + ' ' + d.ask;
          await sayfa.mouse.click(x + ox * w, y + oy * w);
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
        (iyi ? '' : '\n    son adım: ' + r.adim + r.hatalar.map(x => '\n    ' + x).join('')) +
        r.uyarilar.map(x => '\n    ⚠ ' + x).join(''));
    }
  };
  await Promise.all(Array.from({ length: +process.env.PARALEL || 3 }, isci));
  await tarayici.close(); sunucu.close();
  console.log(`\n${hedefler.length - kotu}/${hedefler.length} ders sonuna kadar oynandı.`);
  process.exit(kotu ? 1 : 0);
})();
