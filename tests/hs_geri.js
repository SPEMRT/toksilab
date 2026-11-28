// HS-GC-MS derslerinde "Geri al" testi: robot sarı işaretli tuşa/bölgeye gerçek fareyle tıklar;
// görevli adım bitince Geri al'a basar, durum adımın başındaki hâline dönmeli, görev yeniden istenmeli,
// "‹ Geri" önceki ekrana götürmeli. Sonra adımı yeniden yapar. Robotun çözemediği adımda durur (hata sayılmaz).
// Kullanım: node tests/hs_geri.js [hstus gctus ...]
const { chromium } = require('playwright');
const { sunucuAc, yonlendir, tarayiciAc } = require('./ortak');
const DERSLER = process.argv.slice(2).length ? process.argv.slice(2) : ['sistani', 'hsyukle', 'hstus', 'gctus', 'pctani', 'pcsekans'];

async function oyna(b, port, ders) {
  const p = await b.newPage({ viewport: { width: 1366, height: 860 } });
  const hata = []; p.on('pageerror', e => hata.push('JS hatası: ' + e.message));
  await yonlendir(p);
  await p.goto(`http://localhost:${port}/hsgcms_pilot.html?ders=${ders}`);
  await p.waitForSelector('#dersP .ust', { timeout: 90000 });
  await p.waitForTimeout(800);
  const r = { ders, adim: '', geri: 0, sorun: [], hata };
  let no = '', yapildi = new Set(), takilma = 0, sonNo = '';
  for (let tur = 0; tur < 400 && !hata.length; tur++) {
    const d = await p.evaluate(() => {
      const P = document.getElementById('dersP'), q = s => P.querySelector(s), il = q('#dIleri');
      return { no: (q('.ust span') || {}).textContent || '', ask: ((q('.ask') || {}).innerText || '').split('\n')[0].slice(0, 100),
        ileri: !!il && !il.disabled, test: !!P.querySelector('[data-c]') || !!q('#dSoru') || !!q('#dSonraki') || !!q('#dTekrar') };
    });
    if (d.test) { r.adim = 'teste ulaştı'; break; }
    if (d.no !== no) { no = d.no; await p.evaluate(() => { window.__gtBas = window.__geri.kopya(); }); }
    if (d.no !== sonNo) { sonNo = d.no; takilma = 0; }
    r.adim = d.no + ' ' + d.ask;
    if (d.ileri && d.ask && !yapildi.has(d.no)) {
      yapildi.add(d.no);
      let n = 0;
      for (; n < 40; n++) {
        const y = await p.evaluate(() => { const b = document.querySelector('#dGeri'); return b && !b.disabled ? b.textContent : ''; });
        if (y !== '↶ Geri al') break;
        await p.click('#dGeri'); await p.waitForTimeout(300);
      }
      if (n) {
        const c = await p.evaluate(() => ({ no: document.querySelector('#dersP .ust span').textContent, ayni: !window.__gtBas.gecersiz && window.__geri.ayni(window.__gtBas), gec: window.__gtBas.gecersiz, kilit: document.querySelector('#dIleri').disabled }));
        if (c.no !== d.no) r.sorun.push(d.no + ': adım değişti → ' + c.no);
        else if (!c.ayni && !c.gec) r.sorun.push(d.no + ': durum adımın başına dönmedi');
        else if (!c.kilit) r.sorun.push(d.no + ': görev yeniden istenmedi');
        else r.geri++;
      }
      const y2 = await p.evaluate(() => { const b = document.querySelector('#dGeri'); return b && !b.disabled ? b.textContent : ''; });
      if (y2 === '‹ Geri') {
        await p.click('#dGeri'); await p.waitForTimeout(300);
        const n2 = await p.evaluate(() => document.querySelector('#dersP .ust span').textContent);
        if (parseInt(n2) >= parseInt(d.no)) r.sorun.push(d.no + ': ‹ Geri önceki ekrana gitmedi');
      }
      continue;
    }
    if (d.ileri) { await p.click('#dIleri'); await p.waitForTimeout(300); continue; }
    // görev: sarı işaretli ilk görünür öğeye gerçek tıklama
    const k = await p.evaluate(() => {
      const el = [...document.querySelectorAll('.dersK, .dersH')].find(e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; });
      if (!el) return null; el.scrollIntoView({ block: 'center' }); const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2];
    });
    if (process.env.AYRINTI) console.log('  ·', d.no, d.ileri, JSON.stringify(k));
    if (!k && ++takilma <= 12) { await p.waitForTimeout(600); continue; }
    if (!k || ++takilma > 12) { r.adim += k ? ' (robot çözemedi)' : ' (işaretli öğe yok)'; break; }
    await p.mouse.click(k[0], k[1]); await p.waitForTimeout(450);
    // yazı isteyen adım ("… ve 2026-123 yazın", "adınızı yazın"): tıklanan kutuya yaz
    const yz = d.ask.match(/ve (\S+) yazın/) || (/adınızı yazın/.test(d.ask) && [0, 'Deneme Analist']);
    if (yz && takilma <= 3) { await p.keyboard.press('Control+A'); await p.keyboard.type(yz[1]); await p.keyboard.press('Enter'); await p.waitForTimeout(400); }
  }
  await p.close(); return r;
}
(async () => {
  const { sunucu, port } = await sunucuAc(); const b = await tarayiciAc(chromium);
  let kotu = 0;
  for (const d of DERSLER) {
    const r = await oyna(b, port, d);
    const iyi = !r.sorun.length && !r.hata.length; if (!iyi) kotu++;
    console.log(`${iyi ? '✓' : '✗'} ${d}: ${r.geri} adım geri alındı · son: ${r.adim}` + r.sorun.concat(r.hata).map(x => '\n    ' + x).join(''));
  }
  await b.close(); sunucu.close(); process.exit(kotu ? 1 : 0);
})();
