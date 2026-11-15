/* MY ToksiLab · HS-GC-MS METOT GELİŞTİRME modülü (kanda alkol)
   hsgcms_pilot.html?mod=metot
   Kullanıcı SOP yöntemini (ALKOL1.M, kilitli) kopyalayıp GC tuş takımı, MassHunter GC/MS parametreleri ve
   7694E tuş takımıyla serbestçe değiştirir. Sağ panel:
   · TAHMİN: değişikliğin kromatograma etkisi (gri: SOP), madde tablosu (RT, W½, Rs, alan, durum), notlar
   · Tahmin raporu: cihaza girilecek parametreler + beklenen sonuçlar (yazdır / CSV) → gerçek cihazda denemek için
   · Gerçek cihaz: gözlenen RT / W½ / tM gir → motor kendi cihazına uydurulur (gc_motor.js · GCM.kalibreEt)
   · Görevler ve deney defteri (kendi yöntemleriyle yapılan her analiz)
   Veri üretimi gc_motor.js'tedir; bu dosya yalnız arayüz ve akıştır. */
(function(){'use strict';
var ON=false;try{ON=new URLSearchParams(location.search).get('mod')==='metot'}catch(e){}
if(!ON||!window.GCM)return;
var G=window.GCM,K=G.K,NM=G.NM,SOPM=G.SOPM,HS0=G.HS0;
var f2=function(v,n){return v==null||isNaN(v)?'–':String((+v).toFixed(n==null?2:n)).replace('.',',')};
var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
var LSG='toksilab_metot_gorev_v1';
var pct=function(x){var v=Math.round(x*1000)/10;return (v>0?'+':'')+f2(v===0?0:v,1)+'%'};

/* ---------- görünüm ---------- */
var css=document.createElement('style');css.textContent=
'.main.mg{grid-template-columns:1fr 410px}@media (max-width:1000px){.main.mg{grid-template-columns:1fr}}'+
'.mgP{display:grid;gap:10px}.mgP h3{font:700 18px "Barlow Condensed",sans-serif;letter-spacing:.03em;display:flex;justify-content:space-between;align-items:center}'+
'.mgc{background:#18232A;border:1px solid #2C3D45;border-radius:12px;padding:9px 10px;display:grid;gap:7px}'+
'.mgh{font:700 11.5px "IBM Plex Mono",monospace;color:var(--teal);letter-spacing:.06em;display:flex;gap:6px;align-items:center;flex-wrap:wrap}'+
'.mgh .sp{flex:1}.mgP select{background:#0E1518;color:var(--ink);border:1px solid #34454D;border-radius:7px;padding:3px 5px;font:600 12px "Source Sans 3",sans-serif;max-width:100%}'+
'.mgb{display:flex;flex-wrap:wrap;gap:6px}.mgb button,.mgBtn{background:#25333A;border-radius:8px;padding:6px 9px;font-weight:700;font-size:12.5px;color:var(--ink)}.mgb button:hover{background:#30434B}'+
'.mgb button.p{background:var(--blue)}.mgb button.t{background:#1F9A97}.mgb button:disabled{opacity:.45;cursor:default}'+
'.mgd{font-size:12.5px;line-height:1.35;color:#C9D8DC;display:grid;gap:2px}.mgd b{color:#FFD98A;font-weight:700}.mgd .z{color:#8FA4AA}'+
'.mgT{width:100%;border-collapse:collapse;font-size:12px}.mgT th{font:600 10px "IBM Plex Mono",monospace;color:#8FA4AA;text-align:right;padding:2px 3px;border-bottom:1px solid #2C3D45}.mgT th:first-child,.mgT td:first-child{text-align:left}'+
'.mgT td{padding:3px;text-align:right;border-bottom:1px solid #22313A;font-variant-numeric:tabular-nums}.mgT td.w{text-align:left;font-size:11px;color:#FFD98A}.mgT td.ok{text-align:left;color:#8FE0A8;font-size:11px}'+
'.mgT .d{font-size:10.5px;color:#8FA4AA}.mgT .up{color:#7FDCD0}.mgT .dn{color:#F2A0A2}'+
'.mgN{font-size:12px;line-height:1.38;color:#C9D8DC;display:grid;gap:5px;max-height:220px;overflow:auto}.mgN div{border-left:3px solid #F2B632;padding-left:7px}.mgN div.i{border-color:#2F7DE1}'+
'.mgS{font-size:12.5px;color:#C9D8DC;line-height:1.4}.mgS b{color:#EAF2F3}'+
'.mgG{display:grid;gap:5px}.mgG .task{font-size:12.5px}.mgG .task small{display:block;color:#8FA4AA;font-size:11px}'+
'.mgL{display:grid;gap:4px;max-height:260px;overflow:auto}.mgL div{font-size:12px;background:#0E1518;border-radius:8px;padding:5px 7px;cursor:pointer;line-height:1.35}.mgL div:hover{background:#1C2B31}.mgL i{font-style:normal;color:#8FA4AA}'+
'#mgCv{width:100%;height:190px;background:#0B1114;border-radius:8px;display:block}'+
'#mgModal{position:fixed;inset:0;z-index:2147483100;background:rgba(5,10,12,.72);display:grid;place-items:start center;overflow:auto;padding:24px 12px}'+
'#mgModal .mgcard{background:#fff;color:#16242A;border-radius:12px;max-width:980px;width:100%;padding:18px 20px;font:14px/1.45 "Source Sans 3",sans-serif}'+
'#mgModal h2{font:700 24px "Barlow Condensed",sans-serif;margin-bottom:4px}#mgModal h3{font:700 15px "Barlow Condensed",sans-serif;letter-spacing:.04em;margin:14px 0 6px;color:#1F6F8B;text-transform:uppercase}'+
'#mgModal table{border-collapse:collapse;width:100%;font-size:13px}#mgModal td,#mgModal th{border:1px solid #D5DEE2;padding:4px 7px;text-align:left;vertical-align:top}#mgModal th{background:#EEF4F6;font-weight:700}'+
'#mgModal .ch{background:#FFF6D8}#mgModal .grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}'+
'#mgModal .bt{background:#1F6F8B;color:#fff;border-radius:8px;padding:7px 12px;font-weight:700;margin-right:6px}#mgModal .bt.g{background:#E3EBEE;color:#16242A}'+
'#mgModal input{width:80px;padding:3px 5px;border:1px solid #AAB;border-radius:5px;font:inherit}#mgModal .note{font-size:12.5px;color:#4A5B62}'+
'#mgModal img{max-width:100%;border:1px solid #D5DEE2;border-radius:6px}'+
'@media print{body.mgprint>*:not(#mgModal){display:none!important}body.mgprint{background:#fff;padding:0}body.mgprint #mgModal{position:static;background:none;padding:0}body.mgprint #mgModal .noP{display:none}}';
document.head.appendChild(css);
document.title='HS-GC-MS Metot Geliştirme';
var pill=document.querySelector('.hdr .pill');if(pill)pill.textContent='HS-GC-MS · METOT GELİŞTİRME (KANDA ALKOL)';
document.querySelector('.main').classList.add('mg');
var side=document.querySelector('.side');
side.innerHTML='<div class="mgP" id="mgP"></div><div id="tasks" hidden></div>';

/* ---------- yöntem yardımcıları ---------- */
var USERM=function(n){return METH[n]&&!METH[n].locked&&['ALKOL2.M','SARTLAMA.M','GENEL_TARAMA.M'].indexOf(n)<0};
function yeniAd(){for(var i=1;i<100;i++){var n='METOT_'+i+'.M';if(!METH[n])return n}return 'METOT_X.M'}
function yeniYontem(kaynak){if(IC.running){say('Sekans çalışırken yöntem değiştirilemez.');return}var n=yeniAd(),src=METH[kaynak||'ALKOL1.M']||SOPM;METH[n]=clone(src);METH[n].name=n;METH[n].locked=false;METH[n].mod=false;
 if(METHODS.indexOf(n)<0)METHODS.push(n);applyMeth(n);G.persist();if(PC.built)daTree();
 say(`<b>${n}</b> oluşturuldu (${src.name} kopyası) ve yüklendi. GC tuş takımından (Oven, Front Inlet, Col 1, Aux #) ya da MassHunter ▸ <b>GC Parameters</b> / <b>MS Source</b>’tan istediğin parametreyi değiştir. Sağdaki tahmin anında güncellenir.`);render(true)}
function yontemYukle(n){if(IC.running){say('Sekans çalışırken yöntem değiştirilemez.');render(true);return}applyMeth(n);if(PC.built)icRender();say(`<b>${n}</b> yüklendi${METH[n].locked?' (SOP, kilitli: değiştirmek için önce kopyala)':''}. GC ve tuş takımı artık bu yöntemin değerlerini gösteriyor.`);render(true)}
function sopaDon(){var n=IC.method;if(!USERM(n))return;var keep={name:n,locked:false};METH[n]=Object.assign(clone(SOPM),keep);applyMeth(n);G.persist();say(`<b>${n}</b> SOP değerlerine döndürüldü.`);render(true)}
function sil(){var n=IC.method;if(!USERM(n)||IC.running)return;if(!confirm(n+' silinsin mi?'))return;G.silYontem(n);applyMeth('ALKOL1.M');render(true)}
function farklar(m,hs){var o=m.oven,s=SOPM.oven,R=[],ad=function(lab,a,b,u){if(a!==b)R.push([lab,b,a,u||''])};
 ad('Fırın başlangıç',o.init,s.init,'°C');ad('Başlangıç bekleme',o.hold,s.hold,'dk');ad('Rampa 1',o.r1,s.r1,'°C/dk');ad('Son sıcaklık 1',o.f1,s.f1,'°C');ad('Son bekleme 1',o.h1,s.h1,'dk');
 if(o.r2||s.r2){ad('Rampa 2',o.r2||0,s.r2||0,'°C/dk');if(o.r2){ad('Son sıcaklık 2',o.f2,s.f2,'°C');ad('Son bekleme 2',o.h2,s.h2,'dk')}}
 ad('Inlet modu',m.inlet.mode,SOPM.inlet.mode);if(m.inlet.mode!=='Splitless')ad('Split oranı',m.inlet.ratio,SOPM.inlet.ratio,':1');ad('Inlet sıcaklığı',m.inlet.temp,SOPM.inlet.temp,'°C');
 ad('Kolon akışı',m.col,SOPM.col,'mL/dk');ad('MSD hattı (Aux 2)',m.aux2,SOPM.aux2,'°C');
 var ms=m.ms||defMS(),ms0=SOPM.ms||defMS();ad('Solvent delay',ms.sd,ms0.sd,'dk');ad('Toplama modu',ms.acq,ms0.acq);
 if(ms.acq!=='Scan'&&JSON.stringify(ms.sim)!==JSON.stringify(ms0.sim))R.push(['SIM grupları',ms0.sim.map(function(g){return f2(g.t)}).join(' / '),ms.sim.map(function(g){return f2(g.t)}).join(' / '),'dk']);
 var H=[['Vial sıcaklığı','vial','°C'],['Loop sıcaklığı','loop','°C'],['Transfer hattı','tl','°C'],['GC cycle time','cycle','dk'],['Vial dengelenme','eq','dk'],['Basınçlandırma','press','dk'],['Loop doldurma','fill','dk'],['Loop dengelenme','leq','dk'],['Enjeksiyon','inj','dk']];
 H.forEach(function(h){if(hs[h[1]]!==HS0[h[1]])R.push(['HS · '+h[0],HS0[h[1]],hs[h[1]],h[2]])});if(hs.shake!==HS0.shake)R.push(['HS · Çalkalama','HIGH',['OFF','LOW','HIGH'][hs.shake],'']);
 return R}
G.farklar=farklar;

/* ---------- tahmin ---------- */
var VIALS=[['KAL-0,25',{c:.25,type:'cal'}],['KAL-0,01',{c:.01,type:'cal'}],['KAL-0,5',{c:.5,type:'cal'}],['QC-0,25',{c:.25,type:'qc'}],['NUMUNE-01',{c:.342,type:'num',acet:.006,meoh:.006}],['BLANK',{c:0,type:'blank'}]];
var ST={v:0,sop:true,key:'',F:null,F0:null,st:null,st0:null,seq:'tam',log:[],gorev:{}};
try{ST.gorev=JSON.parse(localStorage.getItem(LSG)||'{}')||{}}catch(e){}
function curM(){return METH[IC.method]||SOPM}
function hesapla(){var m=curM(),hs=G.hsNow(),v=VIALS[ST.v][1];ST.F=G.predict(m,hs,v);ST.F0=G.predict(SOPM,HS0,v);ST.st=G.stats(ST.F);ST.st0=G.stats(ST.F0);ST.M=G.model(m,hs);
 /* MS kapalıyken (solvent delay) çıkan pikleri kesikli göstermek için: MS baştan açık varsayımıyla */
 ST.Fh=null;if(K.some(function(k){return ST.F.lostWhy[k]==='sd'})){var mh=clone(m);mh.name=m.name;mh.ms=clone(m.ms||defMS());mh.ms.sd=0;mh.ms.acq='Scan';ST.Fh=G.predict(mh,hs,v);ST.Fh.extra=(ST.Fh.extra||[]).filter(function(x){return !x.air})}}
function oran(F){if(!F.A.etoh||!F.A.npr)return null;var a=areaIon(F,'etoh',31),b=areaIon(F,'npr',31);return b>0&&a>0?a/b:null}

function ciz(){var cv=document.getElementById('mgCv');if(!cv||!cv.offsetWidth)return;var r=prepCv(cv),c=r[0],W=r[1],H=r[2];c.fillStyle='#0B1114';c.fillRect(0,0,W,H);
 var F=ST.F,F0=ST.F0,src=hasSim(F)?'sim':'scan',L=34,R=8,T=16,B=22,t1=Math.max(F.end||4.8,ST.sop?F0.end:0),N=520;
 var X=function(t){return L+t/t1*(W-L-R)};
 var ser=[];[[F,'#3EA6FF',1.6]].concat(ST.sop?[[F0,'rgba(200,214,219,.55)',1.1]]:[]).forEach(function(s){var pts=[],mx=0;for(var i=0;i<=N;i++){var t=i/N*t1,v=G.clean(s[0],t,hasSim(s[0])?'sim':'scan');pts.push(v);if(v>mx)mx=v}ser.push({p:pts,col:s[1],w:s[2],mx:mx})});
 var ymx=Math.max.apply(null,ser.map(function(s){return s.mx}))*1.15||1,Y=function(v){return H-B-v/ymx*(H-B-T)};
 var hid=null;if(ST.Fh){var sdh=fms(F).sd,hp=[],hm=0;for(var j=0;j<=N;j++){var th=j/N*t1;if(th>sdh){hp.push(null);continue}var vh=G.clean(ST.Fh,th,'scan');vh=vh==null?null:Math.max(0,vh);hp.push(vh);if(vh>hm)hm=vh}hid={p:hp,mx:hm}}
 /* solvent delay */
 var sd=fms(F).sd;c.fillStyle='rgba(120,130,135,.18)';c.fillRect(L,T,X(sd)-L,H-B-T);c.fillStyle='#8FA4AA';c.font='10px "IBM Plex Mono",monospace';c.textAlign='left';if(X(sd)-L>46)c.fillText('MS kapalı',L+3,T+10);if(ST.Fh&&X(sd)-L>46){c.fillStyle='#F2B632';c.fillText('- - kaçan pik',L+3,T+22)}
 /* SIM grupları */
 if(hasSim(F)){c.setLineDash([3,3]);c.strokeStyle='rgba(43,217,192,.5)';fms(F).sim.forEach(function(g){if(g.t>t1)return;c.beginPath();c.moveTo(X(g.t),T);c.lineTo(X(g.t),H-B);c.stroke();c.fillStyle='#2BD9C0';c.fillText(g.name.slice(0,9),X(g.t)+2,H-B-4)});c.setLineDash([])}
 /* eksenler */
 c.strokeStyle='#4A5B62';c.lineWidth=1;c.beginPath();c.moveTo(L,T);c.lineTo(L,H-B);c.lineTo(W-R,H-B);c.stroke();c.fillStyle='#9BB0B6';c.textAlign='center';
 var st=t1>12?2:t1>6?1:.5;for(var t=0;t<=t1+1e-9;t+=st){c.fillText(f2(t,st<1?1:0),X(t),H-B+12)}c.textAlign='left';c.fillText('dk',W-R-14,H-4);
 c.save();c.translate(10,(H-B+T)/2);c.rotate(-Math.PI/2);c.textAlign='center';c.fillText(src==='sim'?'SIM TIC':'SCAN TIC',0,0);c.restore();
 if(hid&&hid.mx>0){var ref=Math.max(ymx*.8,1);c.setLineDash([4,3]);c.strokeStyle='rgba(242,182,50,.85)';c.lineWidth=1.2;c.beginPath();var on2=false;hid.p.forEach(function(v,i){var x=L+i/N*(W-L-R);if(v==null){on2=false;return}var y=H-B-v/hid.mx*ref*(H-B-T)/ymx;if(on2)c.lineTo(x,y);else{c.moveTo(x,y);on2=true}});c.stroke();c.setLineDash([]);
  c.fillStyle='#F2B632';c.font='bold 10px "Source Sans 3",sans-serif';c.textAlign='center';K.forEach(function(k){if(ST.F.lostWhy[k]!=='sd'||!ST.Fh.A[k])return;c.fillText(NM[k].replace('n-propanol','n-PrOH')+'?',X(ST.Fh.rt[k]),T+20+(k==='etoh'?12:0))});c.textAlign='left'}
 ser.slice().reverse().forEach(function(s){c.strokeStyle=s.col;c.lineWidth=s.w;c.beginPath();var on=false;s.p.forEach(function(v,i){var x=L+i/N*(W-L-R);if(v==null){on=false;return}var y=Y(v);if(on)c.lineTo(x,y);else{c.moveTo(x,y);on=true}});c.stroke()});
 /* etiketler */
 c.font='bold 10px "Source Sans 3",sans-serif';c.textAlign='center';K.forEach(function(k){var x=ST.st[k];if(!x.rt||x.rt>t1)return;var v=G.clean(F,F.rt[k],src);if(v==null)return;c.fillStyle=x.flags.length?'#F2B632':'#EAF2F3';c.fillText(NM[k].replace('n-propanol','n-PrOH'),X(x.rt),Math.max(T+8,Y(v)-5))});
 (F.extra||[]).forEach(function(x){if(!x.air||x.rt<sd||x.rt>t1)return;var v=G.clean(F,x.rt,src);if(v==null)return;c.fillStyle='#F2A0A2';c.fillText('hava',X(x.rt),Math.max(T+8,Y(v)-5))});
 c.textAlign='left';c.font='10px "IBM Plex Mono",monospace';c.fillStyle='#3EA6FF';c.fillText('━ '+F.method,L+4,T-4);if(ST.sop){c.fillStyle='#C8D6DB';c.fillText('━ SOP',L+4+c.measureText('━ '+F.method+'   ').width,T-4)}}

var DUR={SIM:'yanlış SIM grubunda',ION:'iyon ölçülmüyor',SAT:'dedektör doygun',MERGE:'çakışıyor (birleşik pik)',FRONT:'aşırı yükleme (fronting)',TAIL:'kuyruklanma'};
function tablo(){var F=ST.F,s=ST.st,s0=ST.st0,h='<table class="mgT"><tr><th>Madde</th><th>RT dk</th><th>W½ s</th><th>Rs</th><th>Alan</th><th style="text-align:left">Durum</th></tr>';
 K.forEach(function(k){var x=s[k],x0=s0[k];var nm=NM[k]+(k==='npr'?' (ISTD)':'');
  if(!x.rt){h+=`<tr><td>${nm}</td><td>–</td><td>–</td><td>–</td><td>–</td><td class="w">${x.lost==='sd'?'solvent delay’den önce çıkıyor: görülmez':x.lost==='run'?'run bitene kadar çıkmıyor → sonraki enjeksiyonda hayalet pik':'yok'}</td></tr>`;return}
  var d=x0.rt?x.rt-x0.rt:null,fl=x.flags.filter(function(f){return k!=='acet'||f!=='ION'});
  h+=`<tr><td>${nm}</td><td>${f2(x.rt,3)}${d!=null&&Math.abs(d)>=.0005?`<div class="d ${d<0?'up':'dn'}">${d>0?'+':''}${f2(d,3)}</div>`:''}</td><td>${f2(x.w50,1)}</td><td>${x.rsPrev!=null?f2(x.rsPrev,1):''}</td><td>${f2(x.fac,2)}×</td>`+
   (fl.length?`<td class="w">${fl.map(function(f){return DUR[f]}).join('; ')}</td>`:'<td class="ok">✓</td>')+'</tr>'});
 return h+'</table>'}
function ozet(){var M=ST.M,m=curM(),hs=G.hsNow(),r=oran(ST.F),r0=oran(ST.F0),cyc=Math.max(hs.cycle,M.ready+(hs.eq>0?0:0));
 var rs=K.map(function(k){return ST.st[k].rsPrev}).filter(function(x){return x!=null}),rmin=rs.length?Math.min.apply(null,rs):null;
 return `<div class="mgS">Run <b>${f2(M.run)} dk</b> (SOP ${f2(runLen(SOPM))}) · GC tekrar hazır <b>${f2(M.ready)} dk</b> · HS cycle ${f2(hs.cycle,1)} dk → <b>${Math.floor(60/cyc)} numune/saat</b><br>`+
  `En düşük Rs <b>${f2(rmin,1)}</b>${rmin!=null&&rmin<1.5?' <span style="color:#F2B632">(&lt; 1,5)</span>':''} · EtOH/ISTD yanıt oranı ${r!=null&&r0?`<b>${pct(r/r0-1)}</b> SOP’a göre`:'<b style="color:#F2A0A2">hesaplanamaz</b>'}`+
  `${r!=null&&r0&&Math.abs(r/r0-1)>.02?'<br><span style="color:#F2B632">SOP ile kurulmuş kalibrasyonla ölçersen sonuç bu kadar sapar: yöntem değişince kalibrasyon yeniden kurulmalı.</span>':''}</div>`}

/* ---------- panel ---------- */
var lastKey='';
function render(force){var P=document.getElementById('mgP');if(!P)return;var m=curM(),hs=G.hsNow();
 var key=JSON.stringify([IC.method,m,hs,ST.v,ST.sop,G.ver,IC.running]);if(!force&&key===lastKey)return;lastKey=key;hesapla();
 var D=farklar(m,hs),u=USERM(IC.method);
 P.innerHTML=`<h3>METOT GELİŞTİRME <span style="font:600 11px 'IBM Plex Mono',monospace;color:#8FA4AA">motor v2</span></h3>
 <div class="mgc"><div class="mgh">AKTİF YÖNTEM<span class="sp"></span><select id="mgSel">${METHODS.map(function(n){return `<option ${n===IC.method?'selected':''}>${n}${METH[n]&&METH[n].locked?' 🔒':''}</option>`}).join('')}</select></div>
  <div class="mgd">${D.length?D.map(function(r){return `<div>${r[0]}: <span class="z">${esc(r[1])}</span> → <b>${esc(r[2])}</b> ${r[3]}</div>`}).join(''):`<div class="z">${m.locked?'SOP yöntemi (kilitli). Değiştirmek için <b>+ Yeni</b>: SOP’un kopyası oluşur.':'SOP ile aynı. GC / HS tuş takımında ya da MassHunter’da bir parametre değiştir.'}</div>`}</div>
  <div class="mgb"><button class="t" id="mgNew">+ Yeni (SOP kopyası)</button>${u?'':`<button id="mgCopy">Kopyala</button>`}<button id="mgEd">GC parametreleri ›</button><button id="mgMs">MS ›</button>${u?`<button id="mgRst">SOP’a döndür</button><button id="mgDel">Sil</button>`:''}</div></div>
 <div class="mgc"><div class="mgh">TAHMİN<span class="sp"></span><select id="mgV">${VIALS.map(function(v,i){return `<option value="${i}" ${i===ST.v?'selected':''}>${v[0]}</option>`}).join('')}</select><label style="font-weight:600;color:#C9D8DC"><input type="checkbox" id="mgSop" ${ST.sop?'checked':''}> SOP</label></div>
  <canvas id="mgCv"></canvas>${tablo()}${ozet()}
  ${ST.M.notes.length?`<div class="mgN">${ST.M.notes.map(function(n){return `<div class="${n[0]==='col'?'i':''}">${n[1]}</div>`}).join('')}</div>`:''}
  <div class="mgb"><button class="p" id="mgRep">📄 Tahmin raporu</button><button id="mgCmp">🔬 Gerçek cihazla karşılaştır</button></div></div>
 <div class="mgc"><div class="mgh">ANALİZ</div>
  <div class="mgb"><select id="mgSet"><option value="tam" ${ST.seq==='tam'?'selected':''}>Tam set (12 vial)</option><option value="hizli" ${ST.seq==='hizli'?'selected':''}>Hızlı set (BLANK, KAL 0,25, KAL 0,5, QC, NUMUNE)</option></select></div>
  <div class="mgb"><button id="mgPrep">1 · Vialleri hazırla + yükle</button><button id="mgSeq">2 · Sekansı ${esc(IC.method)} ile kur</button><button class="p" id="mgRun" ${IC.running?'disabled':''}>3 · ▶ Çalıştır</button></div>
  <div class="mgd z">Kısayollar isteğe bağlı: aynı işleri “Vial hazırlama”, “HS’e yükle” ve MassHunter sekans tablosunda elle de yapabilirsin. ${IC.running?`<b>Sekans çalışıyor</b> (${IC.idx}/${IC.rows.length}).`:''}</div>
  <div class="mgb"><button id="mgSpd">Hız: ${SPDv()}×</button><button id="mgDA">Veri analizi ›</button></div></div>
 <div class="mgc"><div class="mgh">GÖREVLER</div><div class="mgG">${gorevHTML()}</div></div>
 <div class="mgc"><div class="mgh">DENEY DEFTERİ<span class="sp"></span><span style="color:#8FA4AA">${ST.log.length} analiz</span></div><div class="mgL">${defterHTML()}</div></div>`;
 baglan();requestAnimationFrame(ciz)}
function SPDv(){return ST.spd||120}
function baglan(){var q=function(id){return document.getElementById(id)};
 q('mgSel').onchange=function(e){yontemYukle(e.target.value.replace(/ 🔒$/,''))};
 q('mgNew').onclick=function(){yeniYontem('ALKOL1.M')};if(q('mgCopy'))q('mgCopy').onclick=function(){yeniYontem(IC.method)};
 q('mgEd').onclick=function(){pcAc();gcEditDlg('oven')};q('mgMs').onclick=function(){pcAc();msEditDlg()};
 if(q('mgRst'))q('mgRst').onclick=sopaDon;if(q('mgDel'))q('mgDel').onclick=sil;
 q('mgV').onchange=function(e){ST.v=+e.target.value;render(true)};q('mgSop').onchange=function(e){ST.sop=e.target.checked;render(true)};
 q('mgRep').onclick=rapor;q('mgCmp').onclick=karsilastir;
 q('mgSet').onchange=function(e){ST.seq=e.target.value};q('mgPrep').onclick=vialHazirla;q('mgSeq').onclick=sekansKur;q('mgRun').onclick=calistir;
 q('mgSpd').onclick=function(){ST.spd=SPDv()===120?360:SPDv()===360?720:120;if(window.__hs)__hs.spd(ST.spd);render(true)};
 q('mgDA').onclick=function(){pcAc();pcApp('da')};
 document.querySelectorAll('.mgL [data-i]').forEach(function(d){d.onclick=function(){var e=ST.log[+d.dataset.i];if(!e)return;pcAc();pcApp('da');daLoad(e.F)}})}
function pcAc(){if(S.view!=='pc')show('pc');if(!PC.built)pcBuild()}

/* ---------- hızlı akış ---------- */
var HIZLI=['BLANK','KAL-0,25','KAL-0,5','QC-0,25','NUMUNE-01'];
function secilen(){return ST.seq==='hizli'?PLAN.filter(function(p){return HIZLI.indexOf(p.id)>=0}):PLAN.slice()}
function vialHazirla(){if(S.hs.run){say('HS çalışırken karusele dokunulmaz.');return}var L=secilen();
 L.forEach(function(p){if(!p.ready){STEPS.forEach(function(s){p.steps[s[0]]=p.steps[s[0]]||1});p.ready=true}});
 Object.keys(S.slots).forEach(function(k){var p=VBY(S.slots[k]);if(p)p.where=null;delete S.slots[k]});
 L.forEach(function(p,i){S.slots[i+1]=p.id;p.where=i+1});S.hs.v[0][1]=1;S.hs.v[1][1]=L.length;S.hand=null;
 if(S.view==='hslid')build();else renderLoad();
 var self=L.filter(function(p){return p.self}).length;
 say(`${L.length} vial karuselde (yuva 1–${L.length}); HS’te FIRST VIAL 1, LAST VIAL ${L.length}. ${self?self+' vial örnek hazırlama laboratuvarında senin hazırladığın içerikle; ':''}Kalanlar SOP’a göre hazırlandı. Şimdi <b>2 · Sekansı kur</b>.`);render(true)}
var TYP={blank:'Blank',cal:'Calibration',qc:'QC',num:'Sample'};
function sekansKur(){if(IC.running){say('Sekans çalışıyor; bitmesini bekle.');return}var ks=loadedRange();if(!ks.length){say('Karusel boş: önce <b>1 · Vialleri hazırla + yükle</b>.');return}
 var mb=IC.method.replace(/\.M$/i,''),d=new Date(),dd=('0'+d.getDate()).slice(-2)+('0'+(d.getMonth()+1)).slice(-2),base=ROOT+'data\\METOT\\'+mb+'_'+dd,i=1,path=base;
 var ex=function(p){var fo=folderOf(p);return DATA.some(function(x){return x.name.toUpperCase()===fo.toUpperCase()})};while(ex(path))path=base+'_'+(++i);
 IC.rows.length=0;ks.forEach(function(n){var p=VBY(S.slots[n]);IC.rows.push({name:p.id,vial:String(n),mpath:ROOT+'methods',mfile:IC.method,dpath:path,dfile:(String(n).padStart(2,'0')+'_'+p.id).replace(/[^A-Z0-9_-]/gi,'_'),type:TYP[p.type]||'Sample',level:'',dil:'',vol:''})});
 IC.checked=false;if(PC.built)icRender();
 say(`Sekans tablosu kuruldu: ${ks.length} satır, Method File <b>${IC.method}</b>, data klasörü <b>${folderOf(path)}</b>. MassHunter’da kalemle kontrol edebilirsin. Sonra <b>3 · ▶ Çalıştır</b> (= Run Sequence + HS Start).`);render(true)}
function calistir(){if(IC.running){say('Sekans zaten çalışıyor.');return}if(!loadedRange().length){say('Karusel boş: önce <b>1 · Vialleri hazırla + yükle</b>.');return}
 if(!IC.rows.length||IC.rows.some(function(r){return r.mfile!==IC.method})){sekansKur()}
 if(METH[IC.method].oven.init<G.AMB){say(`<b>${IC.method}</b> başlangıç sıcaklığı ${METH[IC.method].oven.init} °C: fırın bu sıcaklığa inemez (kriyo yok), GC hazır olmaz. Başlangıcı ≥ ${G.AMB} °C yap.`);return}
 pcAc();startSeqDlg('run');var d=[].slice.call(desk().querySelectorAll('.dlg')).pop(),b=d&&d.querySelector('#ssRun');if(!b)return;b.click();
 if(!IC.running)return;var tries=0;(function dene(){if(!IC.running)return;if(hsReady()&&gcReady()){hsStart();render(true);return}if(++tries===1)say('Sekans başladı. GC / HS ayar sıcaklıklarına ulaşınca HS <b>Start</b> otomatik verilecek…');if(tries<240)setTimeout(dene,500)})()}

/* ---------- analiz bitti: deney defteri + değerlendirme ---------- */
G.onAcq=function(F){var p=PLAN.find(function(x){return x.id===F.sample})||{};var e={F:F,t:new Date(),meth:F.method,hs:F.eng.hs,vial:F.sample,st:G.stats(F),run:F.end};
 e.ideal=G.predict(METH[F.method]||SOPM,Object.assign({},F.eng.hs),{c:p.c||0,type:p.type||'cal',acet:p.acet,meoh:p.meoh});ST.log.unshift(e);
 var m=[],nm=function(k){return NM[k]};
 K.filter(function(k){return k!=='acet'}).forEach(function(k){var x=e.st[k],y=G.stats(e.ideal)[k];if(x.rt)m.push(`${nm(k)} ${f2(x.rt,3)} dk${y.rt?` <span style="color:#6B7F86">(tahmin ${f2(y.rt,3)})</span>`:''}`);else m.push(`<b style="color:#C62828">${nm(k)} yok</b> (${F.lostWhy[k]==='sd'?'solvent delay’den önce çıktı':'run içinde kolondan çıkamadı'})`)});
 var w=[];K.forEach(function(k){var x=e.st[k];if(x.flags.indexOf('SAT')>=0)w.push(nm(k)+' dedektörü doyurdu');if(x.flags.indexOf('MERGE')>=0&&k!=='acet')w.push(nm(k)+' başka bir pikle çakıştı');if(x.flags.indexOf('SIM')>=0)w.push(nm(k)+' yanlış SIM grubunun penceresinde')});
 (F.extra||[]).forEach(function(x){if(x.ghost)w.push(`${f2(x.rt,2)} dk’da geniş <b>hayalet pik</b>: önceki enjeksiyondan kolonda kalan ${x.name.split(' ')[0]}`);if(x.air&&x.rt>=fms(F).sd)w.push(`${f2(x.rt,2)} dk’da <b>hava piki</b> (solvent delay tM’den kısa)`)});
 if(F.eng.hs.wait>.04)w.push(`HS, GC hazır olsun diye ${f2(F.eng.hs.wait,1)} dk bekledi`);
 var ok=!IC.running;say(`<b>${F.name}</b> · ${F.method}: ${m.join(' · ')}.${w.length?' <span style="color:#B85C00">⚠ '+w.join('; ')+'.</span>':''}${ok?'<br>Sekans tamamlandı ✓ Sonuçları <b>Veri analizi</b>’nde incele; deney defterinde her analize tıklayarak aç.':''}`);
 gorevKontrol(e);render(true)};
function defterHTML(){if(!ST.log.length)return '<div class="z" style="cursor:default;color:#8FA4AA">Henüz analiz yok. Kendi yönteminle bir vial analiz ettiğinde buraya düşer.</div>';
 return ST.log.slice(0,30).map(function(e,i){var s=e.st,r=s.etoh.rt?f2(s.etoh.rt,3):'–',rs=K.map(function(k){return s[k].rsPrev}).filter(function(x){return x!=null}),fl=[];K.forEach(function(k){s[k].flags.forEach(function(f){if(f!=='ION'&&fl.indexOf(f)<0)fl.push(f)})});
  var lost=K.filter(function(k){return k!=='acet'&&!s[k].rt}).map(function(k){return NM[k]});
  return `<div data-i="${i}"><b>${esc(e.F.name)}</b> <i>${e.t.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})} · ${esc(e.meth)}</i><br>EtOH ${r} dk · Rs min ${f2(rs.length?Math.min.apply(null,rs):null,1)} · oran ${f2(oran(e.F),3)}${lost.length?` · <span style="color:#F2A0A2">yok: ${lost.join(', ')}</span>`:''}${fl.length?` · <span style="color:#F2B632">${fl.map(function(f){return DUR[f]}).join(', ')}</span>`:''}</div>`}).join('')}

/* ---------- görevler ---------- */
var GOREV=[
 ['yeni','Kendi yöntemini oluştur ve bir parametreyi değiştir','SOP kilitli: + Yeni ile kopyala, sonra GC / HS tuş takımı ya da MassHunter.'],
 ['ilk','Kendi yönteminle bir vial analiz et; ölçülen kromatogramı tahminle karşılaştır','Deney defterinde ölçülen ve tahmin edilen RT yan yana yazar.'],
 ['hizli','Hızlı yöntem: run ≤ 3,0 dk, üç alkol de doğru SIM grubunda ve tüm Rs ≥ 1,5','İpucu: başlangıç sıcaklığı, bekleme, rampa… pikler 2,2 dk’dan önce çıkarsa solvent delay ve SIM grup zamanları da değişmeli.'],
 ['dinamik','Doygunluğa girmeden yanıtı artır: KAL 0,5’te doygunluk yok, etanol yanıtı SOP’un ≥ 1,4 katı','Split oranı, vial sıcaklığı… En yüksek kalibratör dedektörün doğrusal aralığında kalmalı.'],
 ['denge','HS dengesi: vial dengelenmeyi ≤ 1 dk yapıp QC 0,25’i analiz et','Alan ve EtOH/ISTD oranı nasıl değişti? İç standart neyi düzeltir, neyi düzeltemez?'],
 ['cakisma','Çakışma yarat (Rs < 1), sonra kendi yönteminle Rs ≥ 1,5’e geri getir','Fırını ısıtmak hızlandırır ama ayırımı bozar.'],
 ['hayalet','Bir maddenin run içinde çıkamadığı bir yöntem dene: sonraki enjeksiyonda ne gördün?','Alkoller zayıf tutulur: iki enjeksiyon arasında fırın beklerken çoğu zaman kolondan çıkıp gider. Hayalet pik için run’ı kısa, son sıcaklığı düşük ve HS GC CYCLE TIME’ı kısa tut.'],
 ['valid','Yeni yönteminle kalibrasyon kur (≥ 5 seviye, etanol r² ≥ 0,995)','Veri analizinde yöntemini yükle ▸ Set Up Quantitation ▸ Update Calibration.'],
 ['gercek','Tahmini gerçek cihazında dene: gözlenen RT’leri gir, motoru cihazına uydur','🔬 Gerçek cihazla karşılaştır.']];
function gorevYap(id){if(ST.gorev[id])return;ST.gorev[id]=Date.now();try{localStorage.setItem(LSG,JSON.stringify(ST.gorev))}catch(e){}beep(1800,.08,.04);setTimeout(function(){beep(2600,.08,.04)},90)}
function minRs(st,only){var a=[];K.forEach(function(k){var x=st[k];if(x.rsPrev!=null&&(!only||(only.indexOf(k)>=0&&only.indexOf(x.prev)>=0)))a.push(x.rsPrev)});return a.length?Math.min.apply(null,a):null}
function gorevKontrol(e){var u=USERM(e.meth);if(u)gorevYap('ilk');var s=e.st;
 var three=['meoh','etoh','npr'].every(function(k){return s[k].rt&&s[k].flags.indexOf('SIM')<0&&s[k].flags.indexOf('ION')<0&&s[k].flags.indexOf('MERGE')<0});
 var r=minRs(s);if(u&&e.run<=3.0001&&three&&r!=null&&r>=1.5)gorevYap('hizli');
 if(e.vial==='KAL-0,5'&&s.etoh.rt&&s.etoh.fac>=1.4&&!s.etoh.sat&&!s.npr.sat)gorevYap('dinamik');
 if(e.vial==='QC-0,25'&&e.hs.eq-(e.hs.wait||0)<=1.0001)gorevYap('denge');
 if(r!=null&&r<1)ST.cak=1;if(ST.cak&&u&&r!=null&&r>=1.5&&three)gorevYap('cakisma');
 if((e.F.extra||[]).some(function(x){return x.ghost}))gorevYap('hayalet')}
function gorevGenel(){var n=0;for(var k in METH)if(USERM(k)&&farklar(METH[k],HS0).length)n++;if(n)gorevYap('yeni');
 if(G.P.obs.length)gorevYap('gercek');
 for(var k2 in CAL){if(!USERM(k2))continue;var C=CAL[k2],e=C&&C.cmp&&C.cmp.find(function(c){return !c.istd&&/etan/i.test(c.name)});if(!e)continue;var lv=Object.values(e.lv).filter(function(l){return l.ri>0});if(lv.length<5)continue;
  var x=lv.map(function(l){return l.c}),y=lv.map(function(l){return l.r/l.ri}),n2=x.length,mx=x.reduce(function(a,b){return a+b})/n2,my=y.reduce(function(a,b){return a+b})/n2,sxy=0,sxx=0,syy=0;x.forEach(function(v,i){sxy+=(v-mx)*(y[i]-my);sxx+=(v-mx)*(v-mx);syy+=(y[i]-my)*(y[i]-my)});
  if(sxx>0&&syy>0&&sxy*sxy/(sxx*syy)>=.995)gorevYap('valid')}}
function gorevHTML(){var n=0;return GOREV.map(function(g){var ok=!!ST.gorev[g[0]];return `<div class="task ${ok?'done':''}"><i>${ok?'✓':++n}</i><span>${g[1]}<small>${g[2]}</small></span></div>`}).join('')}

/* ---------- tahmin raporu ---------- */
function modal(html){var o=document.getElementById('mgModal');if(o)o.remove();o=document.createElement('div');o.id='mgModal';o.innerHTML='<div class="mgcard">'+html+'</div>';document.body.appendChild(o);
 o.addEventListener('click',function(e){if(e.target===o)kapat()});return o}
function kapat(){var o=document.getElementById('mgModal');if(o)o.remove();document.body.classList.remove('mgprint')}
function paramTablolari(m,hs){var o=m.oven,I=m.inlet,ms=m.ms||defMS(),s=SOPM,so=s.oven,ms0=s.ms||defMS(),T=Math.max(G.AMB,o.init);
 var row=function(a,v,v0){var ch=String(v)!==String(v0);return `<tr class="${ch?'ch':''}"><td>${a}</td><td><b>${esc(v)}</b></td><td>${esc(v0)}</td></tr>`};
 var hd='<tr><th>Parametre</th><th>Bu yöntem</th><th>SOP</th></tr>';
 return `<div class="grid2"><div><h3>6890N GC · ${esc(m.name||IC.method)}</h3><table>${hd}
  ${row('Oven · Initial temp',o.init+' °C',so.init+' °C')}${row('Oven · Initial time',o.hold+' min',so.hold+' min')}${row('Ramp 1 · Rate',o.r1+' °C/min',so.r1+' °C/min')}${row('Ramp 1 · Final temp',o.f1+' °C',so.f1+' °C')}${row('Ramp 1 · Final time',o.h1+' min',so.h1+' min')}
  ${row('Ramp 2 · Rate',o.r2?o.r2+' °C/min':'Off',so.r2?so.r2+' °C/min':'Off')}${o.r2?row('Ramp 2 · Final temp',o.f2+' °C',so.f2+' °C')+row('Ramp 2 · Final time',o.h2+' min',so.h2+' min'):''}
  ${row('Run time',f2(runLen(m))+' min',f2(runLen(s))+' min')}
  ${row('Front inlet · Mode',I.mode,s.inlet.mode)}${row('Front inlet · Temp',I.temp+' °C',s.inlet.temp+' °C')}${I.mode==='Splitless'?'':row('Split ratio',I.ratio+':1',s.inlet.ratio+':1')+row('Split flow',f2(I.ratio*m.col,1)+' mL/min',f2(s.inlet.ratio*s.col,1)+' mL/min')}
  ${row('Column 1 · Mode','Constant flow','Constant flow')}${row('Column 1 · Flow (He)',m.col+' mL/min',s.col+' mL/min')}${row('Column 1 · Pressure ('+T+' °C)',f2(G.pIn(m,T))+' psi',f2(G.pIn(s,s.oven.init))+' psi')}${row('Column 1 · Avg velocity',Math.round(G.uAvg(m,T))+' cm/s',Math.round(G.uAvg(s,s.oven.init))+' cm/s')}
  ${row('Aux 2 (MSD transfer line)',m.aux2+' °C',s.aux2+' °C')}</table></div>
  <div><h3>7694E headspace</h3><table>${hd}
  ${row('VIAL',hs.vial+' °C',HS0.vial+' °C')}${row('LOOP',hs.loop+' °C',HS0.loop+' °C')}${row('TR.LINE',hs.tl+' °C',HS0.tl+' °C')}${row('GC CYCLE TIME',hs.cycle+' min',HS0.cycle+' min')}${row('VIAL EQ.TIME',hs.eq+' min',HS0.eq+' min')}
  ${row('PRESSURIZ.TIME',hs.press+' min',HS0.press+' min')}${row('LOOP FILL TIME',hs.fill+' min',HS0.fill+' min')}${row('LOOP EQ.TIME',hs.leq+' min',HS0.leq+' min')}${row('INJECT TIME',hs.inj+' min',HS0.inj+' min')}${row('SHAKE',['OFF','LOW','HIGH'][hs.shake],'HIGH')}</table>
  <h3>5975B MSD</h3><table>${hd}${row('Solvent delay',f2(ms.sd)+' min',f2(ms0.sd)+' min')}${row('Acquisition',ms.acq,ms0.acq)}${ms.acq!=='SIM'?row('Scan range',ms.lo+'–'+ms.hi,ms0.lo+'–'+ms0.hi):''}
  ${ms.acq!=='Scan'?ms.sim.map(function(g,i){var g0=ms0.sim[i];return row('SIM '+(i+1)+' · '+esc(g.name),f2(g.t)+' min · m/z '+g.ions.map(function(x){return x[0]}).join(', '),g0?f2(g0.t)+' min · m/z '+g0.ions.map(function(x){return x[0]}).join(', '):'–')}).join(''):''}</table></div></div>`}
function sonucTablosu(F,F0){var s=G.stats(F),s0=G.stats(F0);var h='<table><tr><th>Madde</th><th>RT (dk)</th><th>SOP RT</th><th>W½ (s)</th><th>Rs (önceki pik)</th><th>Alan / SOP</th><th>Hedef iyon yüksekliği</th><th>Durum</th></tr>';
 K.forEach(function(k){var x=s[k],y=s0[k];h+=`<tr><td>${NM[k]}${k==='npr'?' (ISTD)':''}</td><td><b>${x.rt?f2(x.rt,3):'–'}</b></td><td>${y.rt?f2(y.rt,3):'–'}</td><td>${x.rt?f2(x.w50,1):'–'}</td><td>${x.rsPrev!=null?f2(x.rsPrev,1)+' ('+NM[x.prev]+')':''}</td><td>${x.rt?f2(x.fac,2)+'×':'–'}</td><td>${x.rt?Math.round(x.h).toLocaleString('tr-TR'):'–'}</td><td>${!x.rt?(x.lost==='sd'?'solvent delay öncesi (görülmez)':'run içinde çıkmaz'):x.flags.filter(function(f){return k!=='acet'||f!=='ION'}).map(function(f){return DUR[f]}).join('; ')||'✓'}</td></tr>`});
 var r=oran(F),r0=oran(F0);return h+`</table><p class="note">EtOH/ISTD yanıt oranı (m/z 31): <b>${f2(r,4)}</b> · SOP ${f2(r0,4)}${r&&r0?` (${(r/r0-1)*100>=0?'+':''}${f2((r/r0-1)*100,1)}%)`:''}. Alanlar SOP’a göre görelidir; mutlak alan cihazın ayarına (tune, EM voltajı) bağlıdır.</p>`}
function csv(m,hs,F,F0){var s=G.stats(F),s0=G.stats(F0),L=[['bolum','parametre','deger','sop']];farklar(m,hs).forEach(function(r){L.push(['degisen',r[0],r[2]+' '+r[3],r[1]+' '+r[3]])});
 K.forEach(function(k){var x=s[k],y=s0[k];L.push(['tahmin',NM[k]+' RT dk',x.rt?x.rt.toFixed(3):'',y.rt?y.rt.toFixed(3):'']);L.push(['tahmin',NM[k]+' W1/2 s',x.rt?x.w50.toFixed(2):'',y.rt?y.w50.toFixed(2):'']);L.push(['tahmin',NM[k]+' Rs',x.rsPrev!=null?x.rsPrev.toFixed(2):'',y.rsPrev!=null?y.rsPrev.toFixed(2):'']);L.push(['tahmin',NM[k]+' alan/SOP',x.rt?x.fac.toFixed(3):'','1'])});
 return L.map(function(r){return r.map(function(v){return '"'+String(v).replace(/"/g,'""')+'"'}).join(';')}).join('\n')}
function rapor(){var m=curM(),hs=G.hsNow(),v=VIALS[ST.v],img='';var cv=document.getElementById('mgCv');try{img=cv.toDataURL('image/png')}catch(e){}
 var o=modal(`<div class="noP" style="float:right"><button class="bt" id="mrP">🖨 Yazdır / PDF</button><button class="bt g" id="mrC">CSV kopyala</button><button class="bt g" id="mrX">Kapat</button></div>
 <h2>Tahmin raporu · ${esc(IC.method)}</h2><div class="note">${new Date().toLocaleString('tr-TR')} · HS-GC-MS kanda alkol · DB-WAX 30 m × 0,25 mm × 0,25 µm · referans vial: <b>${v[0]}</b> · MY ToksiLab kromatografi motoru v2${G.P.obs.length?` (kendi cihaz gözlemlerine uydurulmuş: ${G.P.obs.length} gözlem)`:''}</div>
 <h3>Cihaza girilecek parametreler</h3><p class="note">Sarı satırlar SOP’tan farklı olanlar. Bu değerleri gerçek cihaza girip aynı vial setini analiz edersen aşağıdaki tahminle karşılaştırabilirsin.</p>${paramTablolari(m,hs)}
 <h3>Beklenen kromatogram</h3>${img?`<img src="${img}" alt="Tahmini kromatogram">`:''}${sonucTablosu(ST.F,ST.F0)}
 ${ST.M.notes.length?`<h3>Neden böyle?</h3><ul style="padding-left:20px">${ST.M.notes.map(function(n){return '<li>'+n[1]+'</li>'}).join('')}</ul>`:''}
 <h3>Gerçek cihazda denerken</h3><ul style="padding-left:20px" class="note"><li>Önce SOP ile bir KAL 0,25 analiz et: kendi cihazının bugünkü RT’lerini kaydet (kolon kısaltıldıysa RT’ler kayar).</li><li>Sonra bu yöntemle aynı vial setini analiz et; RT, W½ ve alan oranlarını “Gerçek cihazla karşılaştır” penceresine gir. Motor, kolonuna göre yeniden uydurulur.</li><li>Hava pikinin zamanı (tM) için solvent delay’i kısa tutup m/z 32/40/44’e bakabilirsin; kolon akışı ve uzunluğunun doğrudan ölçüsüdür.</li><li>Solvent delay’den önce çıkacak pik varsa MS’i zamanında açmayı ve SIM grup başlangıçlarını yeni RT’lere göre kaydırmayı unutma.</li></ul>
 <h3>Model varsayımları</h3><p class="note">Tutunma ln k = a + b/T ile, fırın programı adım adım (6890N’in en yüksek ısıtma hızı sınırıyla) entegre edilir; a ve b SOP’taki ölçülmüş RT’lere sabitlenmiştir. Ölü zaman sabit akış ve vakum çıkışa göre (tM ∝ F<sup>−1/2</sup>). Pik genişliği: kolon katkısı (Golay, optimum ~${28} cm/s) + enjeksiyon bandı (loop hacmi / inlet akışı, başlangıç sıcaklığında faz odaklaması). HS: K(T) van ’t Hoff, denge 1−e<sup>−t/τ</sup> (çalkalama ve sıcaklığa bağlı), β = 9. Dedektör doygunluğu iyon başına. Değerler gerçekçi büyüklükte ama yaklaşıktır; gerçek gözlemlerle uydurma yapıldıkça tahmin cihazına yaklaşır.</p>`);
 o.querySelector('#mrX').onclick=kapat;o.querySelector('#mrP').onclick=function(){document.body.classList.add('mgprint');window.print();setTimeout(function(){document.body.classList.remove('mgprint')},500)};
 o.querySelector('#mrC').onclick=function(){var t=csv(m,hs,ST.F,ST.F0);var done=function(){o.querySelector('#mrC').textContent='✓ Kopyalandı'};if(navigator.clipboard)navigator.clipboard.writeText(t).then(done,function(){prompt('CSV:',t)});else prompt('CSV:',t)}}

/* ---------- gerçek cihazla karşılaştırma ---------- */
function karsilastir(){var m=curM(),hs=G.hsNow(),F=ST.F,s=G.stats(F),P=G.P;
 var o=modal(`<div class="noP" style="float:right"><button class="bt g" id="mkX">Kapat</button></div><h2>Gerçek cihazla karşılaştır</h2>
 <p class="note">Bu yöntemi (<b>${esc(IC.method)}</b>) gerçek cihazında koştuğunda gördüğün değerleri gir. Boş bırakılan alanlar kullanılmaz. Gözlemler bu tarayıcıda saklanır; “Motoru uydur” dediğinde her madde için tutunma parametreleri (a, b) ve ölü zaman bütün gözlemlerine en iyi uyacak şekilde yeniden hesaplanır.</p>
 <table><tr><th>Madde</th><th>Tahmin RT</th><th>Gözlenen RT (dk)</th><th>Tahmin W½ (s)</th><th>Gözlenen W½ (s)</th></tr>
 ${['meoh','etoh','npr','acet'].map(function(k){var x=s[k];return `<tr><td>${NM[k]}</td><td>${x.rt?f2(x.rt,3):'–'}</td><td><input id="mo_${k}" inputmode="decimal" placeholder="${x.rt?x.rt.toFixed(3):''}"></td><td>${x.rt?f2(x.w50,1):'–'}</td><td><input id="mw_${k}" inputmode="decimal"></td></tr>`}).join('')}
 <tr><td>hava piki (tM)</td><td>${f2(G.tMat(m,Math.max(G.AMB,m.oven.init)),3)}</td><td><input id="mo_tm" inputmode="decimal"></td><td></td><td></td></tr></table>
 <p style="margin-top:10px"><button class="bt" id="mkS">Gözlemi kaydet</button><button class="bt" id="mkF" ${P.obs.length?'':'disabled'}>⚙ Motoru gözlemlere uydur</button><button class="bt g" id="mkR">Motoru varsayılana döndür</button></p>
 <div id="mkOut"></div><h3>Kayıtlı gözlemler (${P.obs.length})</h3><div id="mkL"></div>`);
 var num=function(id){var v=parseFloat(String((o.querySelector('#'+id)||{}).value||'').replace(',','.'));return isNaN(v)?null:v};
 var liste=function(){var L=o.querySelector('#mkL');if(!P.obs.length){L.innerHTML='<p class="note">Henüz gözlem yok.</p>';return}
  L.innerHTML='<table><tr><th>#</th><th>Yöntem</th><th>Fırın</th><th>Akış</th><th>Gözlenen → tahmin (dk)</th><th></th></tr>'+P.obs.map(function(ob,i){var mm=G.METHlike(ob.m),pr=G.predict(mm,ob.hs||HS0,{c:.25,type:'cal'});
   return `<tr><td>${i+1}</td><td>${esc(ob.m.name||'')}</td><td>${ob.m.oven.init} °C/${ob.m.oven.hold} dk → ${ob.m.oven.r1} °C/dk → ${ob.m.oven.f1} °C</td><td>${ob.m.col}</td><td>${K.filter(function(k){return ob.rt[k]>0}).map(function(k){var p=pr.A[k]?pr.rt[k]:null;return `${NM[k]} ${f2(ob.rt[k],3)} → ${p?f2(p,3):'–'}${p?` (<b style="color:${Math.abs(p-ob.rt[k])>.02?'#C62828':'#1F7A3A'}">${p-ob.rt[k]>=0?'+':''}${f2(p-ob.rt[k],3)}</b>)`:''}`}).join('<br>')}</td><td><button class="bt g" data-del="${i}">Sil</button></td></tr>`}).join('')+'</table>';
  L.querySelectorAll('[data-del]').forEach(function(b){b.onclick=function(){G.gozlemSil(+b.dataset.del);karsilastir()}})};
 liste();
 o.querySelector('#mkX').onclick=kapat;
 o.querySelector('#mkS').onclick=function(){var rt={},w={},n=0;K.forEach(function(k){var v=num('mo_'+k);if(v!=null&&v>0&&v<60){rt[k]=v;n++}var x=num('mw_'+k);if(x!=null&&x>0)w[k]=x});
  if(!n){o.querySelector('#mkOut').innerHTML='<p class="note" style="color:#C62828">En az bir maddenin gözlenen RT’sini gir.</p>';return}
  G.gozlemEkle(Object.assign(clone(m),{name:IC.method}),rt,Object.keys(w).length?w:null,num('mo_tm'),hs);gorevYap('gercek');karsilastir();o=document.getElementById('mgModal');o.querySelector('#mkOut').innerHTML='<p class="note" style="color:#1F7A3A">Gözlem kaydedildi. SOP’tan farklı fırın programı ya da akışla gözlem girdikçe hem a hem b (sıcaklık duyarlılığı) uydurulur; tek koşulla yalnız a ayarlanır. En iyi sonuç için gerçek cihazında SOP’u da koşup gözlem olarak gir.</p>'};
 o.querySelector('#mkF').onclick=function(){var b=this;b.disabled=true;b.textContent='Hesaplanıyor…';setTimeout(function(){var rep=G.kalibreEt();render(true);karsilastir();var oo=document.getElementById('mgModal');
  oo.querySelector('#mkOut').innerHTML='<p class="note" style="color:#1F7A3A">Motor uyduruldu: '+rep.map(function(r){return `${NM[r.k]} ${r.n} nokta, RMS hata ${f2(r.rms*60,1)} s`}).join(' · ')+'. Tahmin paneli ve rapor artık bu parametrelerle hesaplanıyor.</p>';
  say('Kromatografi motoru gerçek cihaz gözlemlerine uyduruldu. Tahminler artık <b>senin kolonuna ve cihazına</b> göre.')},30)};
 o.querySelector('#mkR').onclick=function(){if(!confirm('Bütün gözlemler silinsin ve motor varsayılana dönsün mü?'))return;G.sifirla();render(true);karsilastir()}}

/* ---------- başlangıç ---------- */
G.onChange=function(){clearTimeout(ST.ch);ST.ch=setTimeout(function(){render()},60)};
setInterval(function(){gorevGenel();render()},900);
addEventListener('resize',function(){requestAnimationFrame(ciz)});
var mevcut=METHODS.filter(USERM);
if(!mevcut.length){var n=yeniAd();METH[n]=clone(METH['ALKOL1.M']);METH[n].name=n;METH[n].locked=false;METHODS.push(n);G.persist();mevcut=[n]}
applyMeth(mevcut[mevcut.length-1]);
renderTasks=function(){};
render(true);
setTimeout(function(){say(`<b>Metot geliştirme laboratuvarı.</b> SOP yöntemi ALKOL1.M kilitli; senin için <b>${IC.method}</b> (SOP kopyası) yüklendi. Parametreleri serbestçe değiştir: GC tuş takımı (Oven, Front Inlet, Col 1 ▸ Flow, Aux #), MassHunter ▸ GC Parameters ve MS Source, HS tuş takımı (vial/loop/hat sıcaklığı, dengelenme, çalkalama). Sağdaki <b>TAHMİN</b> etkisini anında gösterir (gri: SOP). Sonra vialleri hazırla, sekansı kendi yönteminle kur ve analiz et: veri yönteminin parametrelerine göre oluşur.`)},50);
G.modul={render:render,ST:ST,rapor:rapor,karsilastir:karsilastir,vialHazirla:vialHazirla,sekansKur:sekansKur,calistir:calistir,yeniYontem:yeniYontem};
})();
