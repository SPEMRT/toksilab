// Testlerin ortak parçaları: yerel sunucu, tarayıcı ve dış adres yönlendirmeleri.
const http = require('http');
const fs = require('fs');
const path = require('path');

const KOK = path.resolve(__dirname, '..');
const NM = path.join(__dirname, 'node_modules');
const TURLER = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.mp4': 'video/mp4', '.vtt': 'text/vtt', '.css': 'text/css' };

function sunucuAc() {
  const sunucu = http.createServer((req, res) => {
    const yol = path.join(KOK, decodeURIComponent(req.url.split('?')[0]));
    if (!yol.startsWith(KOK) || !fs.existsSync(yol) || fs.statSync(yol).isDirectory()) {
      res.writeHead(404); return res.end();
    }
    res.writeHead(200, { 'Content-Type': TURLER[path.extname(yol)] || 'application/octet-stream' });
    fs.createReadStream(yol).pipe(res);
  });
  return new Promise(r => sunucu.listen(0, () => r({ sunucu, port: sunucu.address().port })));
}

function tarayiciAc(chromium) {
  const vekil = process.env.HTTPS_PROXY || process.env.https_proxy;
  return chromium.launch({
    ...(vekil ? { proxy: { server: vekil, bypass: 'localhost,127.0.0.1' } } : {}),
    args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
  });
}

// CDN kapalıysa (ör. kısıtlı ağ) three.js'i tests/node_modules'tan sun.
function yerelCdn(url) {
  let m;
  if ((m = url.match(/cdn\.jsdelivr\.net\/npm\/three@0\.160\.0\/(.+)$/))) return path.join(NM, 'three160', m[1]);
  if ((m = url.match(/cdn\.jsdelivr\.net\/npm\/three@0\.128\.0\/(.+)$/))) return path.join(NM, 'three128', m[1]);
  if (/cdnjs\.cloudflare\.com\/ajax\/libs\/three\.js\/r128\/three\.min\.js$/.test(url)) return path.join(NM, 'three128', 'build', 'three.min.js');
  return null;
}

async function yonlendir(sayfa) {
  // Sitenin kendi tam adresleri (spemrt.github.io/toksilab/...) → depodaki dosya.
  await sayfa.route(/^https:\/\/spemrt\.github\.io\/toksilab\//, async r => {
    const ad = decodeURIComponent(new URL(r.request().url()).pathname.replace(/^\/toksilab\//, ''));
    const dosya = path.join(KOK, ad);
    if (dosya.startsWith(KOK) && fs.existsSync(dosya)) return r.fulfill({ path: dosya, contentType: TURLER[path.extname(dosya)] });
    return r.fulfill({ status: 404 });
  });
  if (fs.existsSync(NM)) await sayfa.route(/^https:\/\/(cdn\.jsdelivr\.net|cdnjs\.cloudflare\.com)\//, async r => {
    const dosya = yerelCdn(r.request().url());
    if (dosya && fs.existsSync(dosya)) return r.fulfill({ path: dosya, contentType: 'text/javascript' });
    return r.continue();
  });
}

module.exports = { KOK, sunucuAc, tarayiciAc, yonlendir };
