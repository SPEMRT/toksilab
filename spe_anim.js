/* MY ToksiLab · SPE kartuş içi canlandırma
   Kartuş kesitinde şartlandırma → yükleme → yıkama → kurutma → elüsyon. Her adımda seçenek seçilir; parçacıklar seçime göre davranır.
   Kullanım: window.speAnim()  (pencere açar; ✕ ya da dışına tıklayınca kapanır) */
(function () {
'use strict';
const TIP = {
  analit: { r: 7, c: '#E5484D', a: 0.6, ad: 'Analit (aradığımız madde)' },
  tuz: { r: 4, c: '#7FC8F8', a: 0, ad: 'Tuz, üre (polar)' },
  kahve: { r: 6, c: '#B07A45', a: 0.15, ad: 'Orta polar kirlilik' },
  prot: { r: 11, c: '#F2C14E', a: 0, frit: 0.65, ad: 'Protein' },
  part: { r: 6, c: '#9AA0A6', a: 0, frit: 0.92, ad: 'Partikül' },
  hucre: { r: 10, c: '#9B3B3B', a: 0, frit: 0.88, ad: 'Hücre kalıntısı' },
};
const MAT = {
  idrar: { ad: 'İdrar', c: '#EAD67C', n: { analit: 10, tuz: 18, kahve: 6, part: 2 },
    not: '<b>İdrar:</b> tuz ve üre fazla, protein az. Genelde tamponla 1:1 seyreltilir; konjuge metabolitler için önce enzimle (β-glukuronidaz) hidroliz yapılır.' },
  plazma: { ad: 'Plazma / serum', c: '#F0D59A', n: { analit: 10, tuz: 10, kahve: 8, prot: 10 },
    not: '<b>Plazma / serum:</b> proteinler fazla; ilaçların bir kısmı proteinlere bağlıdır. Asit ya da tamponla seyreltilir, gerekirse proteinler çöktürülüp santrifüjlenir. Yoksa proteinler üst fritte birikip kartuşu tıkar.' },
  kan: { ad: 'Tam kan', c: '#B9524A', n: { analit: 10, tuz: 10, kahve: 6, prot: 7, hucre: 7 },
    not: '<b>Tam kan:</b> hücreler ve proteinler kartuşu hızla tıkar. Önce hemoliz edilir (su, ultrasonik banyo), seyreltilir ve santrifüjlenir; yalnız üstteki sıvı yüklenir.' },
  atik: { ad: 'Atık su', c: '#B59D6E', n: { analit: 10, tuz: 10, kahve: 10, part: 10 },
    not: '<b>Atık su:</b> partikül ve hümik maddeler fazla, analit derişimi çok düşük (ng/L). Önce süzülür (0,45–0,7 µm), pH ayarlanır; büyük hacimler (100–500 mL) yüklenir.' },
};
const COZ = {
  meoh: { ad: 'MeOH', S: 1, c: '#BFE0FF' }, acn: { ad: 'ACN', S: 0.9, c: '#CFEFD9' }, su: { ad: 'Su', S: 0, c: '#CDEBF7' },
  tampon: { ad: 'Tampon pH 6', S: 0, c: '#E3F2C8' }, m20: { ad: 'Su:MeOH 4:1', S: 0.2, c: '#BFE8D6' }, nh: { ad: '%5 NH₄OH / MeOH', S: 1, c: '#D6C6FF' },
};
const FAZ = [
  { ad: 'Şartlandırma', vs: 'ms', sec: [['ms', 'MeOH + su'], ['as', 'ACN + su'], ['mt', 'MeOH + tampon pH 6'], ['yok', 'Şartlandırma yok']],
    ana: 'Şartlandırma kartuşu numuneye hazırlar. <b>1)</b> Organik çözücü (genelde 1–3 mL MeOH ya da ACN) sorbentin yüzeyindeki zincirleri açar ve ıslatır. <b>2)</b> Ardından su ya da numuneyle aynı pH’taki tampon organik çözücüyü uzaklaştırır; sorbent sulu numuneyi karşılamaya hazır olur. Şartlandırmadan sonra sorbent kurutulmaz.',
    not: { ms: 'En yaygın seçim. Oasis HLB gibi polimer sorbentlerde birkaç mL MeOH ve ardından su yeterlidir.', as: 'ACN de sorbenti ıslatır; bazı metotlarda MeOH yerine kullanılır.', mt: 'İyon değiştirici kartuşlarda (MCX, MAX) su yerine numuneyle aynı pH’ta tampon kullanılır: analitin yüklü hâli korunur.', yok: '<b>Dikkat:</b> kuru sorbent sulu numunedeki maddeleri iyi tutamaz. Yüklemede analitlerin bir kısmı geçip atığa gider (kırılma, <i>breakthrough</i>).' } },
  { ad: 'Yükleme', vs: 'idrar', sec: [['idrar', 'İdrar'], ['plazma', 'Plazma / serum'], ['kan', 'Tam kan'], ['atik', 'Atık su']],
    ana: 'Yükleme: ön işlemden geçmiş numune kartuştan <b>yavaşça</b> (1–2 mL/dk) geçirilir. Analitler sorbente tutunur; tuzlar ve suda iyi çözünen maddeler geçip atığa gider. Büyük parçacıklar üst fritte kalır.' },
  { ad: 'Yıkama', vs: 'su20', sec: [['su', 'Yalnız su'], ['su20', 'Su → Su:MeOH 4:1'], ['meoh', '%100 MeOH']],
    ana: 'Yıkama: sorbentte kalan kirlilikler uzaklaştırılır. Yıkama çözeltisi kirlilikleri koparacak kadar <b>güçlü</b>, analitleri koparmayacak kadar <b>zayıf</b> olmalıdır.',
    not: { su: 'Su tuzları ve polar maddeleri yıkar. Orta polar kirlilikler (kahverengi) sorbentte kalır ve elüsyonda eluata geçer.', su20: 'Önce su tuzları, sonra az metanollü karışım orta polar kirlilikleri yıkar; analitler tutunmaya devam eder. Rutin metodumuz budur.', meoh: '<b>Dikkat:</b> çok güçlü yıkama. Analitler de sorbentten kopup atığa gider. Yıkama çözeltisinin metanol oranı metotta sabittir.' } },
  { ad: 'Kurutma', vs: 'n2', sec: [['n2', 'Azotla kurut'], ['yok', 'Kurutma yok']],
    ana: 'Kurutma: yıkamadan sonra azot (ya da vakum) sorbentin içinden geçirilir ve kalan su uzaklaştırılır (5–15 dk).',
    not: { n2: 'Elüsyon çözücüsü suyla seyrelmez; eluat azotla daha kısa sürede uçurulur. GC-MS’e su verilmez.', yok: '<b>Dikkat:</b> sorbentteki su elüsyon çözücüsüne karışır: eluat sulu olur, uçurma uzar; GC-MS analizi için uygun değildir.' } },
  { ad: 'Elüsyon', vs: 'meoh', sec: [['meoh', 'MeOH'], ['acn', 'ACN'], ['nh', '%5 NH₄OH / MeOH'], ['su', 'Su']],
    ana: 'Elüsyon: altına temiz toplama tüpü konur. Analitleri sorbentten koparacak güçte, az miktarda çözücü (1–3 mL) yavaşça geçirilir. Analitler tüpte toplanır: hem temiz hem derişik.',
    not: { meoh: 'MeOH, HLB’de tutulan çoğu ilacı çözer.', acn: 'ACN de güçlü bir çözücüdür; bazı analitlerde daha temiz eluat verir.', nh: 'Bazik ilaçlar iyon değiştirici (MCX) kartuşta yük etkileşimiyle de tutunur; amonyaklı metanol bu yükü giderip onları serbest bırakır.', su: '<b>Dikkat:</b> su analitleri sorbentten koparamaz. Analitler kartuşta kalır, tüp boş kalır.' } },
];
/* kartuş geometrisi (mantıksal 1200 × 720) */
const CX = 330, HW = 120, TOP = 40, BT = 400, BB = 520, CB = 540, TIPY = 596;
const rnd = (a, b) => a + Math.random() * (b - a);

window.speAnim = function () {
  document.querySelectorAll('.speAn').forEach(x => x.remove());
  const W = document.createElement('div'); W.className = 'speAn ianim';
  W.style.cssText = 'position:fixed;inset:0;background:rgba(5,10,12,.72);z-index:2147483000;display:grid;place-items:center;padding:12px;overflow:auto;font-family:"Source Sans 3",system-ui,sans-serif';
  W.innerHTML = `<div style="background:#1E2A30;border-radius:14px;padding:12px;max-width:820px;width:100%;display:grid;gap:8px;color:#EAF2F3">
   <div style="display:flex;align-items:center;gap:10px"><b style="font:700 21px 'Barlow Condensed',sans-serif">Kartuşun içinde · katı faz ekstraksiyonu</b><span style="flex:1"></span><button id="saX" style="${BT_}background:#33444C">✕</button></div>
   <div id="saF" style="display:flex;gap:4px"></div>
   <canvas id="saC" style="width:100%;aspect-ratio:1200/720;background:#0E1518;border-radius:10px;display:block"></canvas>
   <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><span style="font-size:13px;color:#9BB0B6" id="saSL">Seçenek:</span><span id="saS" style="display:contents"></span></div>
   <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><button id="saGo" style="${BT_}background:#2F7DE1">▶ Bu adımı çalıştır</button><button id="saAll" style="${BT_}">⏩ Tüm adımları oynat</button><button id="saR" style="${BT_}">↺ Baştan</button><span style="flex:1"></span><button id="saH" style="${BT_}background:#25333A">Hız 1×</button><label id="saHz" style="display:none;align-items:center;gap:6px;font-size:13px;color:#C9D7DB"><input type="checkbox" id="saFast"> Hızlı yükle</label></div>
   <div id="saD" style="font-size:14.5px;line-height:1.5;color:#D3E0E4;background:#25333A;border-radius:10px;padding:10px 12px"></div></div>`;
  document.body.appendChild(W);
  const cv = W.querySelector('#saC'), x = cv.getContext('2d');
  let f = 0, run = false, oto = false, spd = 1, P = [], liq = null, kuyruk = [], wet = 0, kuru = false, sulu = false, clog = 0, seviye = BT, gaz = 0, mesaj = '', bitti = [false, false, false, false, false];
  const secim = FAZ.map(z => z.vs);
  const sayac = () => { const o = { bed: 0, atikA: 0, tupA: 0, tupK: 0 }; P.forEach(p => { if (p.t === 'analit') { if (p.s === 'bed') o.bed++; if (p.s === 'out' && p.v === 'atik') o.atikA++; if (p.s === 'out' && p.v === 'tup') o.tupA++; } else if (p.s === 'out' && p.v === 'tup') o.tupK++; }); return o; };
  const fit = () => { const r = cv.getBoundingClientRect(); cv.width = Math.round(r.width * 2); cv.height = Math.round(r.width * 2 * 720 / 1200); };
  /* sıvı ekle: çözücü ya da numune; parçacıklar sütuna dağılır */
  function doldur(rec) {
    liq = { S: rec.S, c: rec.c, hiz: rec.hiz || 55, ad: rec.ad, tag: rec.tag, n: rec.n };
    seviye = TOP + 30;
    if (rec.n) Object.entries(rec.n).forEach(([t, n]) => { for (let i = 0; i < n; i++) P.push({ t, s: 'col', x: rnd(CX - HW + 14, CX + HW - 14), y: rnd(TOP + 40, BT - 30), vy: rnd(0.8, 1.3) }); });
  }
  function fazKur(k) {
    const s = secim[k]; kuyruk = []; mesaj = '';
    if (k === 0) { if (s === 'yok') { mesaj = 'Şartlandırma yapılmadı: sorbent kuru.'; return; } const o = s === 'as' ? COZ.acn : COZ.meoh; kuyruk.push({ ...o, tag: 'org' }, { ...(s === 'mt' ? COZ.tampon : COZ.su), tag: 'su' }); }
    if (k === 1) { const m = MAT[s]; kuyruk.push({ S: 0, c: m.c, n: m.n, ad: m.ad + ' numunesi', hiz: W.querySelector('#saFast').checked ? 120 : 42 }); }
    if (k === 2) { kuyruk.push({ ...(s === 'meoh' ? COZ.meoh : COZ.su) }); if (s === 'su20') kuyruk.push({ ...COZ.m20 }); }
    if (k === 3) { if (s === 'yok') { mesaj = 'Kurutma yapılmadı: sorbentte su var.'; sulu = true; return; } gaz = 1; kuru = false; }
    if (k === 4) { kuyruk.push({ ...COZ[s] }); }
  }
  function ilerle(dt) {
    if (gaz > 0) { gaz += dt; wet = Math.max(0, wet - dt * 0.35); if (gaz > 4.2) { gaz = 0; kuru = true; sulu = false; return true; } return false; }
    if (!liq) { if (kuyruk.length) { doldur(kuyruk.shift()); return false; } return P.every(p => p.s !== 'flow'); }
    const hiz = liq.hiz / (1 + clog * 0.06);
    seviye = Math.min(BT, seviye + hiz * dt);
    if (liq.tag === 'org' || liq.tag === 'su') wet = Math.min(1, wet + dt * 0.25);
    const islak = wet > 0.5;
    P.forEach(p => {
      const T = TIP[p.t];
      if (p.s === 'col') {
        p.y = Math.max(p.y + hiz * p.vy * 1.4 * dt, seviye + T.r);
        p.x += Math.sin((p.y + p.x) * 0.05) * 0.4;
        if (p.y >= BT - T.r - 2) {
          if (T.frit && Math.random() < T.frit) { p.s = 'frit'; p.y = BT - T.r - rnd(0, 6); clog++; return; }
          let tut = 0;
          if (T.a > 0 && liq.S < T.a) tut = (islak ? 1 : 0.45) * (liq.hiz > 90 && p.t === 'analit' ? 0.65 : 1) * (p.t === 'kahve' ? 0.85 : 1);
          if (Math.random() < tut) { p.s = 'bed'; p.ty = BT + 12 + Math.random() * (BB - BT - 24) * (p.t === 'analit' ? 0.45 : 0.85); p.tx = p.x; }
          else akit(p);
        }
      } else if (p.s === 'bed') {
        p.y += (p.ty - p.y) * Math.min(1, dt * 4);
        if (liq.S >= T.a && Math.random() < dt * 1.8) akit(p);
      } else if (p.s === 'frit') {
        if (liq.S === 0 && !liq.n && Math.random() < dt * 0.09) { akit(p); clog = Math.max(0, clog - 1); }
      } else if (p.s === 'flow') yuru(p, dt);
    });
    if (seviye >= BT && P.every(p => p.s !== 'flow' && p.s !== 'col')) { liq = null; }
    return false;
  }
  function akit(p) {
    const tup = f === 4, hx = tup ? rnd(CX - 26, CX + 26) : rnd(CX - 140, CX + 140), hy = tup ? rnd(660, 700) : rnd(640, 690);
    p.s = 'flow'; p.v = tup ? 'tup' : 'atik';
    p.yol = [[p.x, p.y], [p.x + rnd(-30, 30), (BT + BB) / 2], [CX + rnd(-40, 40), BB + 8], [CX, TIPY], [CX, TIPY + 20], [hx, hy]]; p.k = 0;
  }
  function yuru(p, dt) {
    let d = 230 * dt;
    while (d > 0 && p.k < p.yol.length - 1) { const [ax, ay] = [p.x, p.y], [bx, by] = p.yol[p.k + 1], L = Math.hypot(bx - ax, by - ay); if (L <= d) { p.x = bx; p.y = by; p.k++; d -= L; } else { p.x += (bx - ax) / L * d; p.y += (by - ay) / L * d; d = 0; } }
    if (p.k >= p.yol.length - 1) p.s = 'out';
  }
  /* bir fazı ekrana çizmeden sonuna kadar çalıştır (öndeki adımlar atlanınca) */
  function hizli(k) { f = k; fazKur(k); for (let i = 0; i < 6000; i++) { if (ilerle(1 / 30)) break; } bitti[k] = true; }
  function sifirla() { P = []; liq = null; kuyruk = []; wet = 0; kuru = false; sulu = false; clog = 0; seviye = BT; gaz = 0; mesaj = ''; bitti = [false, false, false, false, false]; run = false; oto = false; }
  function hazirla(k) { sifirla(); for (let i = 0; i < k; i++) hizli(i); f = k; ui(); }
  function baslat() { if (bitti[f] || f > 0 && !bitti[f - 1]) hazirla(f); fazKur(f); run = true; ui(); }
  function ozet() {
    const o = sayac(), s = secim[f];
    if (!bitti[f]) return '';
    if (f === 0) return s === 'yok' ? 'Sorbent kuru kaldı.' : 'Sorbent ıslandı ve sulu numuneye hazır.';
    if (f === 1) return o.atikA ? `<b>${o.atikA} analit</b> tutunamadan atığa gitti${secim[0] === 'yok' ? ' (sorbent şartlandırılmamıştı)' : W.querySelector('#saFast').checked ? ' (yükleme çok hızlıydı)' : ''}.` : 'Analitlerin hepsi sorbente tutundu; tuzlar atığa gitti.' + (clog ? ` Üst fritte ${clog} büyük parçacık birikti: akış yavaşladı.` : '');
    if (f === 2) { const k = P.filter(p => p.t === 'kahve' && p.s === 'bed').length; return s === 'meoh' ? `Yıkamada <b>${o.atikA} analit</b> atığa gitti: çözücü çok güçlüydü.` : k ? `${k} orta polar kirlilik sorbentte kaldı: elüsyonda eluata geçecek.` : 'Kirlilikler yıkandı; analitler sorbentte.'; }
    if (f === 3) return s === 'yok' ? 'Sorbentte su kaldı.' : 'Sorbent kurudu.';
    if (f === 4) { const top = P.filter(p => p.t === 'analit').length; return `Tüpte <b>${o.tupA} / ${top} analit</b> (geri kazanım %${Math.round(o.tupA / top * 100)})` + (o.tupK ? `, <b>${o.tupK} kirlilik</b> eluata geçti.` : ', eluat temiz.') + (sulu ? ' Eluat sulu (kurutma yapılmadı).' : ''); }
    return '';
  }
  function ui() {
    W.querySelector('#saF').innerHTML = FAZ.map((z, k) => `<button data-f="${k}" style="${BT_}flex:1;background:${k === f ? '#2BD9C0' : bitti[k] ? '#1F7A3D' : '#33444C'};color:${k === f ? '#062126' : '#EAF2F3'}">${k + 1}. ${z.ad}</button>`).join('');
    W.querySelector('#saS').innerHTML = FAZ[f].sec.map(([id, ad]) => `<button data-s="${id}" style="${BT_}background:${secim[f] === id ? '#2F7DE1' : '#25333A'}">${ad}</button>`).join('');
    W.querySelector('#saHz').style.display = f === 1 ? 'flex' : 'none';
    W.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { oto = false; run = false; hazirla(+b.dataset.f); });
    W.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { secim[f] = b.dataset.s; run = false; hazirla(f); });
    const z = FAZ[f], nt = f === 1 ? MAT[secim[1]].not + (W.querySelector('#saFast').checked ? '<br><b>Dikkat:</b> hızlı yüklemede analitlerin sorbente tutunmaya zamanı kalmaz; bir kısmı geçip gider.' : '') : z.not[secim[f]];
    const oz = ozet();
    W.querySelector('#saD').innerHTML = `<b style="color:#2BD9C0">${f + 1}. ${z.ad}</b> · ${z.ana}<br><span style="color:#F2D27A">${nt}</span>${oz ? `<div style="margin-top:6px;padding-top:6px;border-top:1px solid #33444C">Sonuç: ${oz}</div>` : ''}`;
    W.querySelector('#saGo').textContent = run ? '⏸ Çalışıyor…' : bitti[f] ? '↻ Bu adımı yeniden çalıştır' : '▶ Bu adımı çalıştır';
  }
  function ciz() {
    const s = cv.width / 1200; x.setTransform(s, 0, 0, s, 0, 0); x.clearRect(0, 0, 1200, 720);
    /* toplama kabı */
    if (f < 4) { x.fillStyle = '#1B2A31'; x.strokeStyle = '#4C6069'; x.lineWidth = 3; x.beginPath(); x.rect(CX - 170, 630, 340, 76); x.fill(); x.stroke(); x.fillStyle = '#7F949C'; x.font = '600 20px Arial'; x.textAlign = 'left'; x.fillText('ATIK', CX + 180, 690); }
    else { x.fillStyle = '#1B2A31'; x.strokeStyle = '#8FB6C4'; x.lineWidth = 3; x.beginPath(); x.moveTo(CX - 40, 620); x.lineTo(CX - 40, 680); x.arc(CX, 680, 40, Math.PI, 0, true); x.lineTo(CX + 40, 620); x.fill(); x.stroke(); x.fillStyle = '#8FB6C4'; x.font = '600 20px Arial'; x.textAlign = 'left'; x.fillText('TOPLAMA TÜPÜ', CX + 56, 690); }
    /* gövde */
    x.fillStyle = '#16242A'; x.fillRect(CX - HW, TOP, HW * 2, CB - TOP);
    if (liq && seviye < BT) { x.fillStyle = liq.c; x.globalAlpha = 0.55; x.fillRect(CX - HW + 3, seviye, HW * 2 - 6, BT - seviye); x.globalAlpha = 1; }
    /* sorbent: ıslaklığa göre renk */
    const kc = [214, 205, 184], ic = [150, 128, 88], m = kc.map((v, i) => Math.round(v + (ic[i] - v) * wet));
    for (let yy = 0; yy < 7; yy++) for (let xx = 0; xx < 13; xx++) { x.fillStyle = `rgb(${m})`; x.globalAlpha = 0.85; x.beginPath(); x.arc(CX - HW + 12 + xx * 18.5 + (yy % 2) * 9, BT + 10 + yy * 16.5, 8, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    if (liq && seviye >= BT - 2) { x.fillStyle = liq.c; x.globalAlpha = 0.25; x.fillRect(CX - HW + 2, BT, HW * 2 - 4, BB - BT); x.globalAlpha = 1; }
    x.strokeStyle = '#5E7178'; x.lineWidth = 4; [BT, BB].forEach(y => { x.setLineDash([10, 6]); x.beginPath(); x.moveTo(CX - HW, y); x.lineTo(CX + HW, y); x.stroke(); }); x.setLineDash([]);
    x.strokeStyle = '#8FA3AA'; x.lineWidth = 4; x.strokeRect(CX - HW, TOP, HW * 2, CB - TOP);
    x.beginPath(); x.moveTo(CX - HW, CB); x.lineTo(CX - 12, TIPY); x.lineTo(CX + 12, TIPY); x.lineTo(CX + HW, CB); x.fillStyle = '#16242A'; x.fill(); x.stroke();
    /* azot */
    if (gaz > 0) for (let k = 0; k < 14; k++) { const yy = TOP + ((gaz * 0.5 + k / 14) % 1) * (TIPY - TOP), xx = CX - 90 + (k % 5) * 45; x.strokeStyle = 'rgba(127,184,240,.8)'; x.lineWidth = 3; x.beginPath(); x.moveTo(xx - 8, yy - 10); x.lineTo(xx, yy); x.lineTo(xx + 8, yy - 10); x.stroke(); }
    /* damla */
    if ((liq && seviye < BT) || P.some(p => p.s === 'flow')) for (let k = 0; k < 3; k++) { const u = (performance.now() / 600 + k / 3) % 1; x.fillStyle = liq ? liq.c : '#BFE0FF'; x.beginPath(); x.arc(CX, TIPY + 6 + u * 26, 4, 0, 7); x.fill(); }
    /* parçacıklar */
    P.forEach(p => { if (f === 4 && p.s === 'out' && p.v === 'atik') return; const T = TIP[p.t]; x.fillStyle = T.c; x.globalAlpha = p.s === 'out' ? 0.75 : 1; x.beginPath(); x.arc(p.x, p.y, T.r, 0, 7); x.fill(); if (p.t === 'analit') { x.strokeStyle = '#fff'; x.lineWidth = 1.5; x.stroke(); } });
    x.globalAlpha = 1;
    /* etiketler */
    x.textAlign = 'right'; x.font = '600 19px Arial'; x.fillStyle = '#9BB0B6';
    x.fillText('üst frit', CX - HW - 12, BT + 6); x.fillText('sorbent', CX - HW - 12, (BT + BB) / 2 + 6); x.fillText('alt frit', CX - HW - 12, BB + 6);
    /* sağ panel */
    const RX = 640; x.textAlign = 'left';
    x.fillStyle = '#2BD9C0'; x.font = '700 22px Arial'; x.fillText(`ADIM ${f + 1} / 5`, RX, 70);
    x.fillStyle = '#EAF2F3'; x.font = '700 40px Arial'; x.fillText(FAZ[f].ad, RX, 116);
    const o = sayac(), tp = P.filter(p => p.t === 'analit').length;
    const satir = [['Kartuştaki sıvı', gaz > 0 ? 'azot' : liq ? liq.ad : '—'], ['Sorbent', gaz > 0 ? 'kurutuluyor' : kuru ? 'kuru (kurutuldu)' : wet > 0.5 ? (sulu ? 'ıslak, sulu' : 'ıslak (şartlandırılmış)') : 'kuru (şartlandırılmamış)'],
      ['Sorbentte analit', tp ? `${o.bed} / ${tp}` : '—'], ['Atığa giden analit', `${o.atikA}`], ['Tüpteki analit', `${o.tupA}`], ['Tüpteki kirlilik', `${o.tupK}`]];
    x.font = '22px Arial'; satir.forEach(([a, b], i) => { x.fillStyle = '#9BB0B6'; x.fillText(a, RX, 170 + i * 36); x.fillStyle = i === 3 && o.atikA ? '#FF8A8A' : i === 5 && o.tupK ? '#FFC870' : '#EAF2F3'; x.font = '700 22px Arial'; x.fillText(b, RX + 250, 170 + i * 36); x.font = '22px Arial'; });
    const var_ = Object.keys(TIP).filter(t => P.some(p => p.t === t));
    x.font = '20px Arial'; (var_.length ? var_ : ['analit', 'tuz', 'kahve']).forEach((t, i) => { const T = TIP[t]; x.fillStyle = T.c; x.beginPath(); x.arc(RX + 10, 410 + i * 32, Math.min(10, T.r), 0, 7); x.fill(); x.fillStyle = '#C9D7DB'; x.fillText(T.ad, RX + 30, 417 + i * 32); });
    if (mesaj) { x.fillStyle = '#F2D27A'; x.font = '600 20px Arial'; x.fillText(mesaj, RX, 650); }
  }
  let son = performance.now();
  function kare(now) {
    if (!document.body.contains(W)) return;
    const dt = Math.min(0.05, (now - son) / 1000) * spd; son = now;
    if (run) {
      const k = ilerle(dt);
      if (k) { run = false; bitti[f] = true; if (oto && f < 4) { f++; baslat(); } else { oto = false; } ui(); }
    }
    ciz(); requestAnimationFrame(kare);
  }
  W.querySelector('#saX').onclick = () => W.remove(); W.onclick = e => { if (e.target === W) W.remove(); };
  W.querySelector('#saGo').onclick = () => { if (!run) baslat(); };
  W.querySelector('#saAll').onclick = () => { sifirla(); f = 0; oto = true; baslat(); };
  W.querySelector('#saR').onclick = () => hazirla(0);
  W.querySelector('#saH').onclick = e => { spd = spd === 1 ? 2 : spd === 2 ? 0.5 : 1; e.target.textContent = 'Hız ' + (spd === 0.5 ? '½' : spd) + '×'; };
  W.querySelector('#saFast').onchange = () => { run = false; hazirla(1); };
  addEventListener('resize', fit); fit(); hazirla(0); requestAnimationFrame(kare);
};
const BT_ = 'border:0;border-radius:9px;padding:8px 12px;font:600 13.5px &quot;Source Sans 3&quot;,system-ui,sans-serif;color:#EAF2F3;background:#33444C;cursor:pointer;';
})();
