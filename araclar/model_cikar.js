// Cihaz sayfalarındaki (…_pilot.html) 3B cihaz modelini .glb dosyasına çıkarır.
// Lab turu (lab_giris.html) Örnek Hazırlama odasında bu dosyaları yükler; böylece turdaki
// cihazlar eğitim sayfalarındakiyle aynı görünür. Cihaz sayfasında model değişirse bu aracı
// yeniden çalıştır:  node araclar/model_cikar.js            (hepsi)
//                    node araclar/model_cikar.js terazi     (tek cihaz)
// Gerekenler: tests/ klasöründe bir kez `npm install` (Playwright ve three.js kopyaları).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { KOK, sunucuAc, tarayiciAc, yonlendir } = require('../tests/ortak');

// bolge: cihaza ait nesnelerin (cm) içinde kaldığı kutu [xmin,xmax, ymin,ymax, zmin,zmax].
// Kutunun dışına taşan nesneler (tezgâh, duvar, tezgâhtaki diğer eşyalar) alınmaz.
const CIHAZ = {
  terazi: { sayfa: 'terazi_pilot.html', bolge: [-15, 15, -0.5, 40, -26, 31] },
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
      const res = await r.fetch(); const t = (await res.text()).replace('R3={renderer,scene', 'R3=window.__R3={renderer,scene');
      r.fulfill({ response: res, body: t, headers: { ...res.headers(), 'content-type': 'text/html; charset=utf-8' } });
    });
    await p.goto(`http://localhost:${port}/${c.sayfa}?serbest=1`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await p.waitForFunction(() => window.__R3 && window.__R3.scene, null, { timeout: 90000 });
    await p.waitForTimeout(3000);
    const sonuc = await p.evaluate(async bolge => {
      const THREE = await import('three');
      const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
      const sc = window.__R3.scene, grup = new THREE.Group(), kutu = new THREE.Box3();
      let n = 0;
      sc.children.forEach(o => {
        if (o.isLight || o.isCamera || o.isSprite || !o.visible) return;
        const b = new THREE.Box3().setFromObject(o, true); if (b.isEmpty()) return;
        const [x0, x1, y0, y1, z0, z1] = bolge;
        if (b.min.x < x0 || b.max.x > x1 || b.min.y < y0 || b.max.y > y1 || b.min.z < z0 || b.max.z > z1) return;
        const k = o.clone(true); k.traverse(m => { if (m.isSprite) m.visible = false; }); grup.add(k); kutu.union(b); n++;
      });
      // tabanın ortası (0,0,0), birim cm → m
      const m = kutu.getCenter(new THREE.Vector3());
      grup.children.forEach(o => o.position.sub(new THREE.Vector3(m.x, kutu.min.y, m.z)));
      const dis = new THREE.Group(); dis.name = 'cihaz'; dis.scale.setScalar(0.01); dis.add(grup);
      const buf = await new GLTFExporter().parseAsync(dis, { binary: true, onlyVisible: true });
      let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000));
      const boy = kutu.getSize(new THREE.Vector3());
      return { n, b64: btoa(s), boy: [boy.x, boy.y, boy.z].map(v => +(v / 100).toFixed(3)) };
    }, c.bolge);
    const dosya = path.join(cikti, ad + '.glb');
    fs.writeFileSync(dosya, Buffer.from(sonuc.b64, 'base64'));
    console.log(`✓ ${ad}: ${sonuc.n} nesne, boyut ${sonuc.boy.join(' × ')} m, ${(fs.statSync(dosya).size / 1024).toFixed(0)} KB → modeller/${ad}.glb`);
    await p.close();
  }
  await tarayici.close(); sunucu.close();
})();
