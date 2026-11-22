// Cihaz sayfalarındaki (…_pilot.html) 3B cihaz modelini .glb dosyasına çıkarır.
// Lab turu (lab_giris.html) Örnek Hazırlama odasında bu dosyaları yükler; böylece turdaki
// cihazlar eğitim sayfalarındakiyle aynı görünür. Cihaz sayfasında model değişirse bu aracı
// yeniden çalıştır:  node araclar/model_cikar.js            (hepsi)
//                    node araclar/model_cikar.js terazi     (tek cihaz)
// Gerekenler: tests/ klasöründe bir kez `npm install` (Playwright ve three.js kopyaları).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const { KOK, sunucuAc, tarayiciAc, yonlendir } = require('../tests/ortak');

// bolge: cihaza ait nesnelerin (cm) içinde kaldığı kutu [xmin,xmax, ymin,ymax, zmin,zmax].
// Kutunun dışına taşan nesneler (tezgâh, duvar, tezgâhtaki diğer eşyalar) alınmaz.
// icerden: sahnede tek büyük grup varsa (SPE) o grubun içindeki parçalar ayrı ayrı seçilir.
// Birimler sayfadan sayfaya değişir; lab turu modeli odadaki eski modelin genişliğine oturtur.
const CIHAZ = {
  terazi: { sayfa: 'terazi_pilot.html', bolge: [-15, 15, -0.5, 40, -26, 31] },
  santrifuj: { sayfa: 'santrifuj_pilot.html', bolge: [-14, 14, -0.5, 40, -16, 18] },
  vorteks: { sayfa: 'vorteks_pilot.html', bolge: [-8, 8, -0.5, 30, -8, 10] },
  pipet: { sayfa: 'pipet_pilot.html', bolge: [-23, -9, -0.5, 32, -10, 4] },
  ultra: { sayfa: 'ultra_pilot.html', bolge: [-19, 19, -1.5, 25, -10, 10] },
  su: { sayfa: 'su_pilot.html', bolge: [-13, 13, -0.5, 46, -18, 19] },
  spe: { sayfa: 'spe_pilot.html', bolge: [-2.6, 2.6, -0.1, 5.6, -2.2, 2.2], icerden: true, eski: true },
};

(async () => {
  const sec = process.argv.slice(2);
  const adlar = sec.length ? sec : Object.keys(CIHAZ);
  const cikti = path.join(KOK, 'modeller');
  fs.mkdirSync(cikti, { recursive: true });
  const { sunucu, port } = await sunucuAc();
  const tarayici = await tarayiciAc(chromium);
  for (const ad of adlar) {
    const c = CIHAZ[ad]; if (!c) { console.log('✗ bilinmeyen cihaz: ' + ad); continue; }
    const p = await tarayici.newPage({ viewport: { width: 1280, height: 800 } });
    p.on('pageerror', e => console.log('   JS: ' + e.message));
    await yonlendir(p);
    // sahneye dışarıdan ulaşmak için: R3 nesnesi window.__R3 olarak da tutulur (yalnız bu araçta)
    await p.route(new RegExp(c.sayfa.replace('.', '\\.') + '(\\?.*)?$'), async r => {
      const res = await r.fetch(); const t = (await res.text()).replace('R3={renderer,scene', 'R3=window.__R3={renderer,scene').replace('const scene = new THREE.Scene();', 'const scene = window.__SC = new THREE.Scene();');
      r.fulfill({ response: res, body: t, headers: { ...res.headers(), 'content-type': 'text/html; charset=utf-8' } });
    });
    await p.goto(`http://localhost:${port}/${c.sayfa}?serbest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForFunction(() => (window.__R3 && window.__R3.scene) || (window.__SC && window.__SC.children.length > 5), null, { timeout: 90000 });
    // eski three.js (r128, SPE): dışa aktarıcı ayrı betik olarak yüklenir
    if (c.eski) await p.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/exporters/GLTFExporter.js' });
    await p.waitForTimeout(3000);
    const sonuc = await p.evaluate(async ({ bolge, icerden, eski }) => {
      const THREE = eski ? window.THREE : await import('three');
      const GLTFExporter = eski ? THREE.GLTFExporter : (await import('three/addons/exporters/GLTFExporter.js')).GLTFExporter;
      const sc = window.__R3 ? window.__R3.scene : window.__SC, grup = new THREE.Group(), kutu = new THREE.Box3();
      sc.updateMatrixWorld(true);
      let kaynak = sc.children;
      if (icerden) { let en = null, enN = -1; sc.children.forEach(o => { let k = 0; o.traverse(m => { if (m.isMesh) k++; }); if (k > enN) { enN = k; en = o; } }); kaynak = en.children; }
      let n = 0;
      kaynak.forEach(o => {
        if (o.isLight || o.isCamera || o.isSprite || o.type === 'GridHelper' || !o.visible) return;
        // sınır kutusu: boyutu hesaplanamayan (NaN) tek tük parçalar atlanır, nesnenin kalanı sayılır
        const b = new THREE.Box3();
        o.traverse(m => { if (!m.isMesh || !m.visible || [].concat(m.material || []).every(x => x.visible === false)) return; const mb = new THREE.Box3().setFromObject(m); const v = [mb.min.x, mb.max.x, mb.min.y, mb.max.y, mb.min.z, mb.max.z]; if (!mb.isEmpty() && v.every(Number.isFinite)) b.union(mb); });
        if (b.isEmpty()) return;
        const [x0, x1, y0, y1, z0, z1] = bolge;
        if (b.min.x < x0 || b.max.x > x1 || b.min.y < y0 || b.max.y > y1 || b.min.z < z0 || b.max.z > z1) return;
        const k = o.clone(true); k.applyMatrix4(o.parent.matrixWorld); k.traverse(m => { const mt = [].concat(m.material || []); if (m.isSprite || (mt.length && mt.every(x => x.visible === false || (x.transparent && x.opacity === 0)))) m.visible = false; }); /* görünmez tıklama alanları alınmaz */ grup.add(k); kutu.union(b); n++;
      });
      // tabanın ortası (0,0,0), birim cm → m
      const m = kutu.getCenter(new THREE.Vector3());
      grup.children.forEach(o => o.position.sub(new THREE.Vector3(m.x, kutu.min.y, m.z)));
      const dis = new THREE.Group(); dis.name = 'cihaz'; dis.scale.setScalar(0.01); dis.add(grup);
      const ex = new GLTFExporter(), sec = { binary: true, onlyVisible: true };
      const buf = ex.parseAsync ? await ex.parseAsync(dis, sec) : await new Promise((ok, ko) => ex.parse(dis, ok, sec, ko));
      let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      const boy = kutu.getSize(new THREE.Vector3());
      return { n, b64: btoa(s), boy: [boy.x, boy.y, boy.z].map(v => +(v / 100).toFixed(3)) };
    }, { bolge: c.bolge, icerden: !!c.icerden, eski: !!c.eski });
    const dosya = path.join(cikti, ad + '.glb'), ham = dosya + '.ham';
    fs.writeFileSync(ham, Buffer.from(sonuc.b64, 'base64'));
    // dosya boyutunu küçült (meshopt): şekil verisi kısaltılır, dokulara (etiket, ekran) dokunulmaz.
    // Lab turu bu dosyaları MeshoptDecoder ile açar.
    execFileSync(path.join(__dirname, '..', 'tests', 'node_modules', '.bin', 'gltf-transform'), ['meshopt', ham, dosya], { stdio: 'ignore' });
    const hamKB = (fs.statSync(ham).size / 1024).toFixed(0); fs.unlinkSync(ham);
    console.log(`✓ ${ad}: ${sonuc.n} nesne, ${hamKB} KB → ${(fs.statSync(dosya).size / 1024).toFixed(0)} KB → modeller/${ad}.glb`);
    await p.close();
  }
  await tarayici.close(); sunucu.close();
})();
