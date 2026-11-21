/* MY ToksiLab · SPE kartuş içi canlandırma
   Kartuş kesitinde şartlandırma → yükleme → yıkama → kurutma → elüsyon. Her adımda seçenek seçilir; parçacıklar seçime göre davranır.
   Solda renk açıklaması, ortada kartuş, sağda adımın açıklaması ve uyarılar. Kartuşun ucundan sıvı damla damla akar.
   Kullanım: window.speAnim()  (pencere açar; ✕ ya da dışına tıklayınca kapanır) */
(function () {
'use strict';
const TIP = {
  analit: { r: 7, c: '#E5484D', a: 0.6, ad: 'Analit (aradığımız madde)' },
  tuz: { r: 4, c: '#7FC8F8', a: 0, ad: 'Tuz, üre (polar)' },
  kahve: { r: 6, c: '#B07A45', a: 0.15, ad: 'Orta polar kirlilik' },
  prot: { r: 10, c: '#F2C14E', a: 0, frit: 0.65, ad: 'Protein' },
  part: { r: 6, c: '#9AA0A6', a: 0, frit: 0.92, ad: 'Partikül' },
  hucre: { r: 9, c: '#9B3B3B', a: 0, frit: 0.88, ad: 'Hücre kalıntısı' },
};
const MAT = {
  idrar: { ad: 'İdrar', c: '#EAD67C', n: { analit: 10, tuz: 16, kahve: 6, part: 2 },
    not: '<b>İdrar:</b> tuz ve üre fazla, protein az. Genelde tamponla 1:1 seyreltilir; konjuge metabolitler için önce enzimle (β-glukuronidaz) hidroliz yapılır.' },
  plazma: { ad: 'Plazma / serum', c: '#F0D59A', n: { analit: 10, tuz: 10, kahve: 8, prot: 9 },
    not: '<b>Plazma / serum:</b> proteinler fazla; ilaçların bir kısmı proteinlere bağlıdır. Asit ya da tamponla seyreltilir, gerekirse proteinler çöktürülüp santrifüjlenir. Yoksa proteinler üst fritte birikip kartuşu tıkar.' },
  kan: { ad: 'Tam kan', c: '#B9524A', n: { analit: 10, tuz: 10, kahve: 6, prot: 6, hucre: 6 },
    not: '<b>Tam kan:</b> hücreler ve proteinler kartuşu hızla tıkar. Önce hemoliz edilir (su, ultrasonik banyo), seyreltilir ve santrifüjlenir; yalnız üstteki sıvı yüklenir.' },
  atik: { ad: 'Atık su', c: '#B59D6E', n: { analit: 10, tuz: 10, kahve: 10, part: 9 },
    not: '<b>Atık su:</b> partikül ve hümik maddeler fazla, analit derişimi çok düşük (ng/L). Önce süzülür (0,45–0,7 µm), pH ayarlanır; büyük hacimler (100–500 mL) yüklenir.' },
};
const COZ = {
  meoh: { ad: 'MeOH', S: 1, c: '#BFE0FF' }, acn: { ad: 'ACN', S: 0.9, c: '#CFEFD9' }, su: { ad: 'Su', S: 0, c: '#CDEBF7' },
  tampon: { ad: 'Tampon pH 6', S: 0, c: '#E3F2C8' }, m20: { ad: 'Su:MeOH 4:1', S: 0.2, c: '#BFE8D6' }, nh: { ad: '%5 NH₄OH / MeOH', S: 1, c: '#D6C6FF' }, fa: { ad: '%2 formik asit', S: 0, c: '#F3E3C3' },
};
/* not: '!' ile başlayan not kırmızı uyarı kutusunda gösterilir */
const FAZ = [
  { ad: 'Şartlandırma', vs: 'ms', sec: [['ms', 'MeOH + su'], ['as', 'ACN + su'], ['mt', 'MeOH + tampon pH 6'], ['yok', 'Şartlandırma yok']],
    ana: 'Şartlandırma kartuşu numuneye hazırlar. <b>1)</b> Organik çözücü (genelde 1–3 mL MeOH ya da ACN) sorbentin yüzeyindeki zincirleri açar ve ıslatır. <b>2)</b> Ardından su ya da numuneyle aynı pH’taki tampon organik çözücüyü uzaklaştırır; sorbent sulu numuneyi karşılamaya hazır olur. Şartlandırmadan sonra sorbent kurutulmaz.',
    not: { ms: 'En yaygın seçim. Oasis HLB gibi polimer sorbentlerde birkaç mL MeOH ve ardından su yeterlidir.', as: 'ACN de sorbenti ıslatır; bazı metotlarda MeOH yerine kullanılır.', mt: 'İyon değiştirici kartuşlarda (MCX, MAX) su yerine numuneyle aynı pH’ta tampon kullanılır: analitin yüklü hâli korunur.',
      yok: '!Şartlandırma yapılmazsa sorbent kuru kalır ve analitler sorbente <b>tutunamaz</b>. Yüklemede analitlerin önemli bir kısmı geçip atığa gider (kırılma, <i>breakthrough</i>); sonuç olduğundan düşük çıkar.' },
    notM: { ms: 'MCX’te de önce MeOH, ardından su ya da asitli su geçirilir.' } },
  { ad: 'Yükleme', vs: 'idrar', sec: [['idrar', 'İdrar'], ['plazma', 'Plazma / serum'], ['kan', 'Tam kan'], ['atik', 'Atık su']],
    ana: 'Yükleme: ön işlemden geçmiş numune kartuştan <b>yavaşça</b>, damla damla (1–2 mL/dk) geçirilir. Analitler sorbente tutunur; tuzlar ve suda iyi çözünen maddeler geçip atığa gider. Büyük parçacıklar üst fritte kalır.' },
  { ad: 'Yıkama', vs: 'su20', sec: [['su', 'Yalnız su'], ['su20', 'Su → Su:MeOH 4:1'], ['meoh', '%100 MeOH']],
    ana: 'Yıkama: sorbentte kalan kirlilikler uzaklaştırılır. Yıkama çözeltisi kirlilikleri koparacak kadar <b>güçlü</b>, analitleri koparmayacak kadar <b>zayıf</b> olmalıdır.',
    not: { su: '!Su yalnız tuzları ve polar maddeleri yıkar. Orta polar kirlilikler (kahverengi) sorbentte kalır ve elüsyonda <b>eluata geçer</b>: eluat kirli olur.', su20: 'Önce su tuzları, sonra az metanollü karışım orta polar kirlilikleri yıkar; analitler tutunmaya devam eder. Rutin metodumuz budur.',
      meoh: '!%100 MeOH çok güçlüdür: analitlerin <b>hepsini</b> sorbentten koparır. Bütün analitler yıkama atığıyla <b>kaybolur</b>, tüpe hiçbir şey gelmez. Yıkama çözeltisinin metanol oranı metotta sabittir, değiştirilmez.' },
    vsM: 'fa', secM: [['su', 'Yalnız su'], ['fa', '%2 formik asit → %100 MeOH'], ['su20', 'Su → Su:MeOH 4:1'], ['meoh', '%100 MeOH']],
    notM: { fa: 'Rutin MCX yıkaması: %2 formik asit tuzları ve proteinleri yıkar, ortamı asidik tutar; ardından %100 MeOH orta polar kirlilikleri yıkar. Bazik ilaçlar iyonik bağla yerinde kalır: çok temiz eluat.',
      su20: 'Su ve 4:1 karışım kirliliklerin çoğunu yıkar; analitler kalır. MCX’te daha güçlü %100 MeOH yıkaması da yapılabilir.',
      meoh: 'MCX’te %100 MeOH yıkaması <b>doğrudur</b>: bazik ilaçlar iyonik bağla tutunduğu için MeOH onları koparamaz, yalnız kirlilikleri yıkar. <b>Aynı yıkama HLB’de bütün analitleri kaybettirirdi.</b>' } },
  { ad: 'Kurutma', vs: 'n2', sec: [['n2', 'Azotla kurut'], ['yok', 'Kurutma yok']],
    ana: 'Kurutma: yıkamadan sonra azot (ya da vakum) sorbentin içinden geçirilir ve kalan su uzaklaştırılır (5–15 dk).',
    not: { n2: 'Elüsyon çözücüsü suyla seyrelmez; eluat azotla daha kısa sürede uçurulur. GC-MS’e su verilmez.',
      yok: '!Kurutma yapılmazsa sorbentteki su elüsyon çözücüsüne karışır: eluat <b>sulu</b> olur, uçurma uzar, bazı analitler zayıf çözülür. Su GC-MS kolonuna ve dedektörüne zarar verir.' } },
  { ad: 'Elüsyon', vs: 'meoh', sec: [['meoh', 'MeOH'], ['acn', 'ACN'], ['nh', '%5 NH₄OH / MeOH'], ['su', 'Su']],
    ana: 'Elüsyon: altına temiz toplama tüpü konur. Analitleri sorbentten koparacak güçte, az miktarda çözücü (1–3 mL) damla damla geçirilir. Analitler tüpte toplanır: hem temiz hem derişik.',
    not: { meoh: 'MeOH, HLB’de tutulan çoğu ilacı çözer.', acn: 'ACN de güçlü bir çözücüdür; bazı analitlerde daha temiz eluat verir.', nh: 'Bazik ilaçlar iyon değiştirici (MCX) kartuşta yük etkileşimiyle de tutunur; amonyaklı metanol bu yükü giderip onları serbest bırakır.',
      su: '!Su analitleri sorbentten <b>koparamaz</b>. Analitlerin hepsi kartuşta kalır, tüp boş kalır: sonuç <b>yanlış negatif</b> çıkar.' },
    vsM: 'nh', notM: { meoh: '!MCX’te MeOH bazik ilaçları <b>koparamaz</b>: iyonik bağ yerinde kalır, analitler kartuşta kalır, tüp boş kalır. HLB’de doğru olan elüsyon burada işe yaramaz.',
      acn: '!ACN de iyonik bağı <b>koparamaz</b>: analitler kartuşta kalır.',
      nh: 'Rutin MCX elüsyonu: amonyak ortamı bazikleştirir, ilaçların artı yükü gider ve iyonik bağ kopar; MeOH ilaçları çözüp tüpe taşır.' } },
];
const ASIT_NOT = 'MCX’te numune <b>asitlendirilir</b> (pH 2–3, örneğin %2 formik ya da fosforik asitle): bazik ilaçlar artı yüklenir ve sorbentin eksi yüklü gruplarına iyonik bağla tutunur.';
const ASIT_YOK = '!Numune asitlendirilmezse bazik ilaçlar <b>yüksüz</b> kalır, iyonik bağ kurulamaz. Yalnız zayıf bağla tutunurlar ve organik yıkamada <b>kaybolurlar</b>.';
const MCX_AC = '<b>Oasis MCX (karışık modlu katyon değiştirici):</b> sorbentte HLB’deki gibi yağ seven gruplar ve ek olarak <b>eksi yüklü</b> gruplar (−) vardır. Bazik ilaçlar asidik ortamda <b>artı yüklenir</b> (+) ve sorbente iki yolla tutunur: yağ seven gruplara ve eksi yüklere (iyonik bağ). İyonik bağı organik çözücü koparamaz; ortam bazikleşip ilaç yükünü kaybedince kopar.';
const HIZLI_NOT = '!Hızlı yüklemede analitlerin sorbente tutunmaya <b>zamanı kalmaz</b>: bir kısmı geçip atığa gider. Numune damla damla, 1–2 mL/dk ile yüklenir.';
/* geometri (mantıksal 720 × 720): solda renk açıklaması, ortada kartuş */
const CX = 470, HW = 110, TOP = 40, BT = 400, BB = 520, CB = 540, TIPY = 596, DPER = 0.55;
const rnd = (a, b) => a + Math.random() * (b - a);
const icX = (v, r) => Math.max(CX - HW + r + 4, Math.min(CX + HW - r - 4, v));
const BT_ = 'border:0;border-radius:9px;padding:8px 12px;font:600 13.5px &quot;Source Sans 3&quot;,system-ui,sans-serif;color:#EAF2F3;background:#33444C;cursor:pointer;';

window.speAnim = function () {
  document.querySelectorAll('.speAn').forEach(x => x.remove());
  const W = document.createElement('div'); W.className = 'speAn ianim';
  W.style.cssText = 'position:fixed;inset:0;background:rgba(5,10,12,.72);z-index:2147483000;display:grid;place-items:center;padding:12px;overflow:auto;font-family:"Source Sans 3",system-ui,sans-serif';
  W.innerHTML = `<style>.speAn .saG{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:10px;align-items:start}@media(max-width:760px){.speAn .saG{grid-template-columns:minmax(0,1fr)}}
   .speAn .saUy{background:#3A1416;color:#FFE1E1;border-left:5px solid #E5484D;border-radius:10px;padding:9px 11px;margin-top:8px}.speAn .saUy b.nm{display:block;font:700 11px "IBM Plex Mono",monospace;color:#FF8A8A;letter-spacing:.08em;margin-bottom:3px}
   .speAn .saNt{background:#16242A;border-left:5px solid #2BD9C0;border-radius:10px;padding:9px 11px;margin-top:8px}.speAn .saSn{margin-top:8px;padding:9px 11px;border-radius:10px;background:#16242A}.speAn .saSn.kot{background:#3A1416;color:#FFE1E1;border-left:5px solid #E5484D}</style>
   <div style="background:#1E2A30;border-radius:14px;padding:12px;max-width:1000px;width:100%;display:grid;gap:8px;color:#EAF2F3">
   <div style="display:flex;align-items:center;gap:10px"><b id="saT" style="font:700 21px 'Barlow Condensed',sans-serif">Kartuşun içinde · Oasis HLB</b><span style="flex:1"></span><button id="saX" style="${BT_}background:#33444C">✕</button></div>
   <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span style="font-size:13px;color:#9BB0B6">Kartuş:</span><button data-k="hlb" style="${BT_}">Oasis HLB</button><button data-k="mcx" style="${BT_}">Oasis MCX <small style="font-weight:700;color:#F2B632;margin-left:4px">İLERİ</small></button></div>
   <div id="saF" style="display:flex;gap:4px;flex-wrap:wrap"></div>
   <div class="saG"><canvas id="saC" style="width:100%;aspect-ratio:1/1;max-width:100%;background:#0E1518;border-radius:10px;display:block"></canvas>
    <div id="saD" style="font-size:14.5px;line-height:1.5;color:#D3E0E4;background:#25333A;border-radius:10px;padding:12px 14px;min-width:0"></div></div>
   <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><span style="font-size:13px;color:#9BB0B6">Seçenek:</span><span id="saS" style="display:contents"></span><label id="saHz" style="display:none;align-items:center;gap:6px;font-size:13px;color:#C9D7DB;margin-left:6px"><input type="checkbox" id="saFast"> Hızlı yükle</label><label id="saAz" style="display:none;align-items:center;gap:6px;font-size:13px;color:#C9D7DB;margin-left:6px"><input type="checkbox" id="saAs" checked> Numuneyi asitlendir (pH 2–3)</label></div>
   <div style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><button id="saGo" style="${BT_}background:#2F7DE1">▶ Bu adımı çalıştır</button><button id="saAll" style="${BT_}">⏩ Tüm adımları oynat</button><button id="saR" style="${BT_}">↺ Baştan</button><span style="flex:1"></span><button id="saH" style="${BT_}background:#25333A">Hız 1×</button></div>
   <div id="saBi" style="font-size:12.5px;line-height:1.45;color:#9BB0B6;border-top:1px solid #33444C;padding-top:8px"></div></div>`;
  document.body.appendChild(W);
  const cv = W.querySelector('#saC'), x = cv.getContext('2d');
  let f = 0, run = false, oto = false, spd = 1, P = [], liq = null, kuyruk = [], wet = 0, kuru = false, sulu = false, clog = 0, seviye = BT, gaz = 0, bitti = [false, false, false, false, false];
  let damT = 0, damlar = [];
  let kart = 'hlb', atik0 = 0;
  let secim = FAZ.map(z => z.vs);
  const hizliMi = () => W.querySelector('#saFast').checked;
  const asitMi = () => W.querySelector('#saAs').checked;
  const notOf = (k, v) => (kart === 'mcx' && FAZ[k].notM && FAZ[k].notM[v]) || (FAZ[k].not || {})[v] || '';
  const secOf = k => (kart === 'mcx' && FAZ[k].secM) || FAZ[k].sec;
  /* uyarılı seçenek hatadır: o adımın sonucu gösterilir ama sonraki adıma geçilmez */
  const hatali = k => k === 1 ? hizliMi() || (kart === 'mcx' && !asitMi()) : notOf(k, secim[k]).charAt(0) === '!';
  const acik = k => { for (let j = 0; j < k; j++) if (hatali(j)) return false; return true; };
  const sayac = () => { const o = { bed: 0, atikA: 0, tupA: 0, tupK: 0 }; P.forEach(p => { if (p.t === 'analit') { if (p.s === 'bed') o.bed++; if (p.s === 'out' && p.v === 'atik') o.atikA++; if (p.s === 'out' && p.v === 'tup') o.tupA++; } else if (p.s === 'out' && p.v === 'tup') o.tupK++; }); return o; };
  const fit = () => { const r = cv.getBoundingClientRect(); cv.width = cv.height = Math.round(r.width * 2); };
  const hareketli = () => P.some(p => p.s === 'flow' || p.s === 'tip' || p.s === 'dusus' || p.s === 'col');
  function doldur(rec) {
    liq = { S: rec.S, c: rec.c, hiz: rec.hiz || 55, ad: rec.ad, tag: rec.tag, n: rec.n, baz: rec.baz };
    seviye = TOP + 30;
    if (rec.n) Object.entries(rec.n).forEach(([t, n]) => { const r = TIP[t].r; for (let i = 0; i < n; i++) P.push({ t, s: 'col', x: rnd(CX - HW + r + 6, CX + HW - r - 6), y: rnd(TOP + 40, BT - 30), vy: rnd(0.8, 1.3), ph: rnd(0, 6) }); });
  }
  function fazKur(k) {
    const s = secim[k]; kuyruk = []; atik0 = sayac().atikA;
    if (k === 0) { if (s === 'yok') return; const o = s === 'as' ? COZ.acn : COZ.meoh; kuyruk.push({ ...o, tag: 'org' }, { ...(s === 'mt' ? COZ.tampon : COZ.su), tag: 'su' }); }
    if (k === 1) { const m = MAT[s]; kuyruk.push({ S: 0, c: m.c, n: m.n, ad: m.ad + ' numunesi', hiz: hizliMi() ? 120 : 42 }); }
    if (k === 2) { if (s === 'fa') kuyruk.push({ ...COZ.fa }, { ...COZ.meoh }); else { kuyruk.push({ ...(s === 'meoh' ? COZ.meoh : COZ.su) }); if (s === 'su20') kuyruk.push({ ...COZ.m20 }); } }
    if (k === 3) { if (s === 'yok') { sulu = true; return; } gaz = 1; kuru = false; }
    if (k === 4) kuyruk.push({ ...COZ[s], baz: s === 'nh' });
  }
  /* kartuşun ucunda damla büyür ve düşer; uçta bekleyen parçacıklar damlayla birlikte düşer */
  function damla(dt, akar) {
    if (akar) damT += dt;
    if (damT >= DPER) {
      damT = 0; damlar.push({ y: TIPY + 6, v: 0, c: liq ? liq.c : '#BFE0FF' });
      let n = 0; P.forEach(p => { if (p.s === 'tip' && n < 3) { p.s = 'dusus'; p.vy = 0; p.x0 = p.x; n++; } });
    }
    damlar.forEach(d => { d.v += 900 * dt; d.y += d.v * dt; }); damlar = damlar.filter(d => d.y < 690);
    P.forEach(p => { if (p.s !== 'dusus') return; p.vy += 900 * dt; p.y += p.vy * dt; const u = Math.min(1, (p.y - TIPY) / Math.max(1, p.hy - TIPY)); p.x = p.x0 + (p.hx - p.x0) * u; if (p.y >= p.hy) { p.y = p.hy; p.x = p.hx; p.s = 'out'; } });
  }
  function ilerle(dt) {
    if (gaz > 0) { gaz += dt; wet = Math.max(0, wet - dt * 0.35); damla(dt, gaz < 3); if (gaz > 4.2) { gaz = 0; kuru = true; sulu = false; return true; } return false; }
    if (!liq) { if (kuyruk.length) { doldur(kuyruk.shift()); return false; } damla(dt, P.some(p => p.s === 'tip' || p.s === 'flow')); return !hareketli() && !damlar.length; }
    const hiz = liq.hiz / (1 + clog * 0.06);
    seviye = Math.min(BT, seviye + hiz * dt);
    if (liq.tag === 'org' || liq.tag === 'su') wet = Math.min(1, wet + dt * 0.25);
    const islak = wet > 0.5;
    P.forEach(p => {
      const T = TIP[p.t];
      if (p.s === 'col') {
        p.y = Math.max(p.y + hiz * p.vy * 1.4 * dt, seviye + T.r);
        p.x = icX(p.x + Math.sin(p.y * 0.05 + p.ph) * 0.5, T.r);
        if (p.y >= BT - T.r - 2) {
          if (T.frit && Math.random() < T.frit) { p.s = 'frit'; p.y = BT - T.r - rnd(0, 5); clog++; return; }
          let tut = 0;
          if (T.a > 0 && liq.S < T.a) tut = (islak ? 1 : 0.45) * (liq.hiz > 90 && p.t === 'analit' ? 0.6 : 1) * (p.t === 'kahve' ? 0.85 : 1);
          if (Math.random() < tut) { p.s = 'bed'; p.iyon = kart === 'mcx' && p.t === 'analit' && asitMi(); p.ty = BT + 12 + Math.random() * (BB - BT - 24) * (p.t === 'analit' ? 0.45 : 0.85); }
          else akit(p);
        }
      } else if (p.s === 'bed') {
        p.y += (p.ty - p.y) * Math.min(1, dt * 4);
        if (liq.S >= T.a && !(p.iyon && !liq.baz) && Math.random() < dt * 1.8) { p.iyon = false; akit(p); }
      } else if (p.s === 'frit') {
        if (liq.S === 0 && !liq.n && Math.random() < dt * 0.09) { akit(p); clog = Math.max(0, clog - 1); }
      } else if (p.s === 'flow') yuru(p, dt);
    });
    damla(dt, seviye < BT || P.some(p => p.s === 'flow' || p.s === 'tip'));
    if (seviye >= BT && !P.some(p => p.s === 'col' || p.s === 'flow')) liq = null;
    return false;
  }
  function akit(p) {
    const tup = f === 4, r = TIP[p.t].r;
    p.hx = tup ? rnd(CX - 24, CX + 24) : rnd(CX - 130, CX + 130); p.hy = tup ? rnd(668, 690) : rnd(650, 688);
    p.s = 'flow'; p.v = tup ? 'tup' : 'atik';
    p.yol = [[p.x, p.y], [icX(p.x + rnd(-30, 30), r), (BT + BB) / 2], [CX + rnd(-40, 40), BB + 6], [CX + rnd(-10, 10), CB + 22], [CX, TIPY - 4]]; p.k = 0;
  }
  function yuru(p, dt) {
    let d = (p.k >= 2 ? 70 : 150) * dt;
    while (d > 0 && p.k < p.yol.length - 1) { const [bx, by] = p.yol[p.k + 1], L = Math.hypot(bx - p.x, by - p.y); if (L <= d) { p.x = bx; p.y = by; p.k++; d -= L; } else { p.x += (bx - p.x) / L * d; p.y += (by - p.y) / L * d; d = 0; } }
    if (p.k >= p.yol.length - 1) p.s = 'tip';
  }
  function hizli(k) { f = k; fazKur(k); for (let i = 0; i < 9000; i++) { if (ilerle(1 / 30)) break; } bitti[k] = true; }
  function sifirla() { P = []; liq = null; kuyruk = []; wet = 0; kuru = false; sulu = false; clog = 0; seviye = BT; gaz = 0; damT = 0; damlar = []; bitti = [false, false, false, false, false]; run = false; oto = false; }
  function hazirla(k) { sifirla(); for (let i = 0; i < k; i++) hizli(i); f = k; ui(); }
  function baslat() { if (bitti[f] || f > 0 && !bitti[f - 1]) hazirla(f); fazKur(f); run = true; ui(); }
  /* adımın sonucu: [metin, kötü mü] */
  function ozet() {
    const o = sayac(), s = secim[f], top = P.filter(p => p.t === 'analit').length;
    if (!bitti[f]) return null;
    if (f === 0) return s === 'yok' ? ['Sorbent kuru kaldı: yüklemede analitler tutunamayacak.', 1] : ['Sorbent ıslandı ve sulu numuneye hazır.', 0];
    if (f === 1 && kart === 'mcx' && !asitMi() && !o.atikA) return ['Analitler sorbente yalnız zayıf bağla tutundu: numune asitlendirilmediği için <b>iyonik bağ kurulmadı</b>. Organik yıkamada kaybolacaklar.', 1];
    if (f === 1) return o.atikA ? [`<b>${o.atikA} / ${top} analit</b> tutunamadan atığa gitti${secim[0] === 'yok' ? ': sorbent şartlandırılmamıştı' : hizliMi() ? ': yükleme çok hızlıydı' : ''}.`, 1] : ['Analitlerin hepsi sorbente tutundu; tuzlar atığa gitti.' + (clog ? ` Üst fritte ${clog} büyük parçacık birikti, akış yavaşladı.` : ''), 0];
    if (f === 2) { const k = P.filter(p => p.t === 'kahve' && p.s === 'bed').length, kay = o.atikA - atik0;
      if (kay) return [`Yıkamada <b>${kay} / ${top} analit</b> atığa gitti: analitler kaybedildi${kart === 'mcx' && !asitMi() ? '. Numune asitlendirilmediği için iyonik bağ kurulmamıştı' : ''}.`, 1];
      if (k) return [`${k} orta polar kirlilik sorbentte kaldı: elüsyonda eluata geçecek.`, 1];
      return kart === 'mcx' && (s === 'meoh' || s === 'fa') ? ['Bazik ilaçlar iyonik bağla yerinde kaldı; MeOH kirlilikleri yıkadı: eluat çok temiz olacak.', 0] : ['Kirlilikler yıkandı; analitler sorbentte.', 0]; }
    if (f === 3) return s === 'yok' ? ['Sorbentte su kaldı: eluat sulu olacak.', 1] : ['Sorbent kurudu.', 0];
    if (f === 4) { const kot = o.tupA < top || o.tupK || sulu; return [`Tüpte <b>${o.tupA} / ${top} analit</b> (geri kazanım %${Math.round(o.tupA / top * 100)})` + (o.tupK ? `, <b>${o.tupK} kirlilik</b> eluata geçti.` : ', eluat temiz.') + (sulu ? ' Eluat sulu (kurutma yapılmadı).' : '') + (o.bed ? ` ${o.bed} analit kartuşta kaldı${kart === 'mcx' && s !== 'nh' && s !== 'su' ? ': iyonik bağ kopmadı' : ''}.` : ''), kot ? 1 : 0]; }
    return null;
  }
  function ui() {
    W.querySelector('#saF').innerHTML = FAZ.map((z, k) => { const kilit = k !== f && !acik(k); return `<button data-f="${k}"${kilit ? ' disabled title="Önceki adımı doğru seçenekle tamamlayın"' : ''} style="${BT_}flex:1;min-width:110px;background:${k === f ? '#2BD9C0' : bitti[k] && !hatali(k) ? '#1F7A3D' : '#33444C'};color:${k === f ? '#062126' : '#EAF2F3'};${kilit ? 'opacity:.45;cursor:not-allowed' : ''}">${kilit ? '🔒 ' : ''}${k + 1}. ${z.ad}</button>`; }).join('');
    W.querySelector('#saS').innerHTML = secOf(f).map(([id, ad]) => `<button data-s="${id}" style="${BT_}background:${secim[f] === id ? '#2F7DE1' : '#25333A'}">${ad}</button>`).join('');
    W.querySelector('#saHz').style.display = f === 1 ? 'flex' : 'none';
    W.querySelector('#saAz').style.display = f === 1 && kart === 'mcx' ? 'flex' : 'none';
    W.querySelector('#saT').textContent = 'Kartuşun içinde · ' + (kart === 'mcx' ? 'Oasis MCX' : 'Oasis HLB');
    W.querySelectorAll('[data-k]').forEach(b => { b.style.background = b.dataset.k === kart ? '#2F7DE1' : '#25333A'; });
    W.querySelector('#saBi').innerHTML = 'ℹ️ Bu canlandırma <b>' + (kart === 'mcx' ? 'Oasis MCX kartuşa ve bazik ilaçlara' : 'Oasis HLB kartuşa') + '</b> göre hazırlanmıştır. Buradaki çözücüler ve numuneler yöntemin mantığını göstermek için seçilmiş örneklerdir. Farklı kartuş tiplerinde ve farklı analitlerde başka çözücüler kullanılır. Laboratuvarda her zaman doğrulanmış metot talimatına (SOP) uyulur.';
    W.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { const k = +b.dataset.f; if (k !== f && !acik(k)) return; oto = false; run = false; hazirla(k); });
    W.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { secim[f] = b.dataset.s; run = false; hazirla(f); });
    const z = FAZ[f], notlar = f === 1 ? [MAT[secim[1]].not].concat(kart === 'mcx' ? [asitMi() ? ASIT_NOT : ASIT_YOK] : [], hizliMi() ? [HIZLI_NOT] : []) : [notOf(f, secim[f])];
    const kutu = n => n.charAt(0) === '!' ? `<div class="saUy"><b class="nm">⚠ DİKKAT</b>${n.slice(1)}</div>` : `<div class="saNt">${n}</div>`;
    const oz = ozet();
    W.querySelector('#saD').innerHTML = `<div style="font:700 12px 'IBM Plex Mono',monospace;color:#2BD9C0;letter-spacing:.08em">ADIM ${f + 1} / 5</div><div style="font:700 26px 'Barlow Condensed',sans-serif;color:#EAF2F3;margin-bottom:4px">${z.ad}</div>${kart === 'mcx' && f === 0 ? `<div class="saNt" style="margin:0 0 8px;border-left-color:#F2B632">${MCX_AC}</div>` : ''}${z.ana}${notlar.map(kutu).join('')}${oz ? `<div class="saSn${oz[1] ? ' kot' : ''}"><b>Sonuç:</b> ${oz[0]}</div>` : ''}${bitti[f] && hatali(f) ? `<div class="saUy"><b class="nm">🔒 SONRAKİ ADIM KİLİTLİ</b>Bu hatalı seçimle ${f < 4 ? 'bir sonraki adıma geçilmez' : 'iş bitmiş sayılmaz'}. Doğru seçeneği seçip adımı yeniden çalıştırın.</div>` : ''}${bitti[f] && !hatali(f) && f < 4 ? '<div style="margin-top:10px"><button id="saNx" style="' + BT_ + 'background:#2DBE5B">Sonraki adım: ' + FAZ[f + 1].ad + ' ›</button></div>' : ''}`;
    const nx = W.querySelector('#saNx'); if (nx) nx.onclick = () => { oto = false; f++; ui(); };
    W.querySelector('#saGo').textContent = run ? '⏸ Çalışıyor…' : bitti[f] ? '↻ Bu adımı yeniden çalıştır' : '▶ Bu adımı çalıştır';
  }
  function ciz() {
    const s = cv.width / 720; x.setTransform(s, 0, 0, s, 0, 0); x.clearRect(0, 0, 720, 720);
    /* toplama kabı */
    x.font = '600 18px Arial'; x.textAlign = 'left';
    if (f < 4) { x.fillStyle = '#1B2A31'; x.strokeStyle = '#4C6069'; x.lineWidth = 3; x.beginPath(); x.rect(CX - 150, 636, 300, 66); x.fill(); x.stroke(); x.fillStyle = '#7F949C'; x.fillText('ATIK', CX - 144, 628); }
    else { x.fillStyle = '#1B2A31'; x.strokeStyle = '#8FB6C4'; x.lineWidth = 3; x.beginPath(); x.moveTo(CX - 36, 630); x.lineTo(CX - 36, 678); x.arc(CX, 678, 36, Math.PI, 0, true); x.lineTo(CX + 36, 630); x.fill(); x.stroke(); x.fillStyle = '#8FB6C4'; x.fillText('TOPLAMA TÜPÜ', CX + 48, 690); }
    /* gövde ve sıvı */
    x.fillStyle = '#16242A'; x.fillRect(CX - HW, TOP, HW * 2, CB - TOP);
    if (liq && seviye < BT) { x.fillStyle = liq.c; x.globalAlpha = 0.5; x.fillRect(CX - HW + 3, seviye, HW * 2 - 6, BT - seviye); x.globalAlpha = 1;
      if (BT - seviye > 40) { x.fillStyle = '#0E1518'; x.font = '600 17px Arial'; x.textAlign = 'center'; x.fillText(liq.ad, CX, seviye + 26); } }
    /* sorbent: ıslaklığa göre renk */
    const kc = [214, 205, 184], ic = [150, 128, 88], m = kc.map((v, i) => Math.round(v + (ic[i] - v) * wet));
    x.fillStyle = `rgb(${m})`; x.globalAlpha = 0.85;
    for (let yy = 0; yy < 7; yy++) for (let xx = 0; xx < 12; xx++) { const px = CX - HW + 12 + xx * 18.5 + (yy % 2) * 9; if (px > CX + HW - 8) continue; x.beginPath(); x.arc(px, BT + 10 + yy * 16.5, 8, 0, 7); x.fill(); }
    x.globalAlpha = 1;
    if (kart === 'mcx') { x.fillStyle = '#0E1518'; x.font = '700 13px Arial'; x.textAlign = 'center'; for (let yy = 0; yy < 7; yy++) for (let xx = 0; xx < 12; xx += 2) { const px = CX - HW + 12 + xx * 18.5 + (yy % 2) * 9; if (px > CX + HW - 8) continue; x.fillText('−', px, BT + 14 + yy * 16.5); } }
    if (liq && seviye >= BT - 2) { x.fillStyle = liq.c; x.globalAlpha = 0.22; x.fillRect(CX - HW + 2, BT, HW * 2 - 4, BB - BT); x.globalAlpha = 1; }
    x.strokeStyle = '#5E7178'; x.lineWidth = 4; x.setLineDash([10, 6]); [BT, BB].forEach(y => { x.beginPath(); x.moveTo(CX - HW, y); x.lineTo(CX + HW, y); x.stroke(); }); x.setLineDash([]);
    x.beginPath(); x.moveTo(CX - HW, CB); x.lineTo(CX - 10, TIPY); x.lineTo(CX + 10, TIPY); x.lineTo(CX + HW, CB); x.closePath(); x.fillStyle = '#16242A'; x.fill();
    x.strokeStyle = '#8FA3AA'; x.lineWidth = 4; x.strokeRect(CX - HW, TOP, HW * 2, CB - TOP);
    x.beginPath(); x.moveTo(CX - HW, CB); x.lineTo(CX - 10, TIPY); x.lineTo(CX + 10, TIPY); x.lineTo(CX + HW, CB); x.stroke();
    /* azot */
    if (gaz > 0) for (let k = 0; k < 14; k++) { const yy = TOP + ((gaz * 0.5 + k / 14) % 1) * (CB - TOP - 10), xx = CX - 80 + (k % 5) * 40; x.strokeStyle = 'rgba(127,184,240,.8)'; x.lineWidth = 3; x.beginPath(); x.moveTo(xx - 8, yy - 10); x.lineTo(xx, yy); x.lineTo(xx + 8, yy - 10); x.stroke(); }
    /* uçta büyüyen damla ve düşen damlalar */
    const akiyor = (liq && seviye < BT) || P.some(p => p.s === 'flow' || p.s === 'tip') || (gaz > 0 && gaz < 3);
    const dc = liq ? liq.c : gaz > 0 ? '#CDEBF7' : '#BFE0FF';
    if (akiyor) { const rr = 2 + 5 * (damT / DPER); x.fillStyle = dc; x.beginPath(); x.arc(CX, TIPY + rr * 0.8, rr, 0, 7); x.fill(); }
    damlar.forEach(d => { x.fillStyle = d.c; x.beginPath(); x.ellipse(CX, d.y, 5, 7, 0, 0, 7); x.fill(); });
    /* parçacıklar */
    P.forEach(p => { if (f === 4 && p.s === 'out' && p.v === 'atik') return; const T = TIP[p.t]; x.fillStyle = T.c; x.globalAlpha = p.s === 'out' ? 0.8 : 1; x.beginPath(); x.arc(p.x, p.y, T.r, 0, 7); x.fill(); if (p.t === 'analit') { x.strokeStyle = '#fff'; x.lineWidth = 1.5; x.stroke(); if (p.iyon) { x.fillStyle = '#fff'; x.font = '700 12px Arial'; x.textAlign = 'center'; x.fillText('+', p.x, p.y + 4.5); } } });
    x.globalAlpha = 1;
    /* kartuş etiketleri (sağda) */
    x.textAlign = 'left'; x.font = '600 17px Arial'; x.fillStyle = '#9BB0B6';
    x.fillText('üst frit', CX + HW + 10, BT + 6); x.fillText('sorbent', CX + HW + 10, (BT + BB) / 2 + 6); x.fillText('alt frit', CX + HW + 10, BB + 6);
    /* renk açıklaması (solda) */
    const var_ = Object.keys(TIP).filter(t => P.some(p => p.t === t)), L = var_.length ? var_ : ['analit', 'tuz', 'kahve'];
    x.fillStyle = '#9BB0B6'; x.font = '700 15px Arial'; x.fillText('RENKLER', 18, 64);
    x.font = '17px Arial';
    L.forEach((t, i) => { const T = TIP[t], y = 98 + i * 34; x.fillStyle = T.c; x.beginPath(); x.arc(30, y - 6, Math.min(10, Math.max(6, T.r)), 0, 7); x.fill(); x.fillStyle = '#D3E0E4'; x.textAlign = 'left'; x.font = '17px Arial'; x.fillText(t === 'analit' && kart === 'mcx' ? 'Bazik ilaç (+ yüklü)' : T.ad, 48, y); });
    const sy = 98 + L.length * 34; x.fillStyle = `rgb(${m})`; x.beginPath(); x.arc(30, sy - 6, 8, 0, 7); x.fill(); x.fillStyle = '#D3E0E4'; x.fillText((wet > 0.5 ? 'Sorbent (ıslak)' : 'Sorbent (kuru)') + (kart === 'mcx' ? ', − yüklü gruplar' : ''), 48, sy);
  }
  let son = performance.now();
  function kare(now) {
    if (!document.body.contains(W)) return;
    const dt = Math.min(0.05, (now - son) / 1000) * spd; son = now;
    if (run) {
      const k = ilerle(dt);
      if (k) { run = false; bitti[f] = true; if (oto && f < 4 && !hatali(f)) { f++; baslat(); } else oto = false; ui(); }
    }
    ciz(); requestAnimationFrame(kare);
  }
  W.querySelector('#saX').onclick = () => W.remove(); W.onclick = e => { if (e.target === W) W.remove(); };
  W.querySelector('#saGo').onclick = () => { if (!run) baslat(); };
  W.querySelector('#saAll').onclick = () => { sifirla(); f = 0; oto = true; baslat(); };
  W.querySelector('#saR').onclick = () => hazirla(0);
  W.querySelector('#saH').onclick = e => { spd = spd === 1 ? 2 : spd === 2 ? 0.5 : 1; e.target.textContent = 'Hız ' + (spd === 0.5 ? '½' : spd) + '×'; };
  W.querySelector('#saFast').onchange = () => { run = false; hazirla(1); };
  W.querySelector('#saAs').onchange = () => { run = false; hazirla(1); };
  W.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { if (kart === b.dataset.k) return; kart = b.dataset.k; secim = FAZ.map(z => kart === 'mcx' ? (z.vsM || z.vs) : z.vs); W.querySelector('#saAs').checked = true; hazirla(0); });
  addEventListener('resize', fit); fit(); hazirla(0); requestAnimationFrame(kare);
};
})();
