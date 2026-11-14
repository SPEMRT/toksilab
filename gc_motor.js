/* MY ToksiLab · HS-GC-MS kromatografi motoru v2 (kanda alkol, DB-WAX)
   hsgcms_pilot.html ana betiğinden SONRA yüklenir; oradaki veri üretim ve çizim fonksiyonlarını
   genişletir. Kullanıcının değiştirebildiği her parametre (6890N fırın / inlet / kolon akışı / MSD hattı,
   5975B solvent delay ve SIM grupları, 7694E bölge sıcaklıkları, olay süreleri, çalkalama) veriye
   fiziksel olarak tutarlı biçimde yansır.

   İlke: bütün etkiler SOP (ALKOL1.M + 7694E yöntem 2) değerine göre NORMALİZE edilir ve tutunma modeli
   SOP'ta ölçülen sürelere sabitlenir. Bu yüzden SOP parametreleriyle üretilen veri eski motorla aynıdır;
   yalnız parametre SOP'tan saptığında fark doğar.

   Modeller (basitleştirilmiş ama yönü ve büyüklüğü gerçekçi):
   · Tutunma: ln k = a + b/T (van 't Hoff), sıcaklık programı adım adım entegre edilir; fırının en
     yüksek ısıtma hızı (6890N, 230 V) sınırlanır; ölü zaman tM sabit akış + vakum çıkışa göre
     (tM ∝ F^-1/2 · T^-0,15).
   · Pik genişliği: σ² = σ_kolon² + σ_enjeksiyon². σ_kolon ∝ tM(1+kE)√H(u) (Golay/van Deemter),
     σ_enj = (loop süpürme süresi/√12)·(1+kE)/(1+k0) (başlangıç sıcaklığında faz odaklaması).
   · Miktar: split oranı, splitless süpürme, HS dağılım katsayısı K(T), denge yaklaşımı 1−e^(−t/τ),
     basınçlandırma/loop doldurma, yoğuşma (loop/hat < vial), soğuk inlet ve MSD hattı.
   · Dedektör doygunluğu (iyon başına), kolon aşırı yüklemesi (fronting), çakışan piklerde drop-line /
     birleşik integrasyon, WAX kolon kanaması (m/z 44/45), hava piki (solvent delay tM'den kısaysa),
     run bitmeden çıkamayan maddenin sonraki enjeksiyonda hayalet pik olması, HS taşınması.
   Gerçek cihaz verisiyle (gözlenen RT) a, b ve tM yeniden uydurulabilir: GCM.kalibreEt(). */
(function(){'use strict';
if(typeof makeFile!=='function'||typeof METH==='undefined')return;
var O={makeFile:makeFile,chromAt:chromAt,specFrom:specFrom,ionSig:ionSig,ticAt:ticAt,specAt:specAt,areaIon:areaIon,
 peaksOf:peaksOf,applyMeth:applyMeth,acqStart:acqStart,acqEnd:acqEnd,icTick:icTick,methRT:methRT};
var G=window.GCM={O:O,ver:1};
var K=['acet','meoh','etoh','npr'];
var NM={acet:'aseton',meoh:'metanol',etoh:'etanol',npr:'n-propanol'};
var SOPM=clone(METH['ALKOL1.M']);
var HS0={vial:80,loop:120,tl:120,cycle:11,eq:4,press:.2,fill:.2,leq:.05,inj:.5,shake:2};
var T0K=273.15,VLOOP=1.0,SAT=1.6e6,UOPT=28,AMB=28,BETA=9,SIG0=.0065;
var COL={L:30,id:.25,df:.25,faz:'DB-WAX',tmax:250};
/* 6890N (230 V) en yüksek ısıtma hızı, °C/dk */
var maxRate=function(T){return T<70?120:T<115?95:T<175?65:45};
var COOL=40; /* ortalama soğuma hızı, °C/dk (simülasyon döngüsüyle aynı) */
/* HS: tuzlu (%20 NaCl) kan matriksinde 80 °C'de etkin dağılım katsayısı K, sıcaklık katsayısı B (K),
   dengeye yaklaşım zaman sabiti τ (dk, HIGH çalkalama) */
var HSP={acet:{K:18,B:4300,tau:.8},meoh:{K:96,B:4900,tau:.95},etoh:{K:86,B:5077,tau:1},npr:{K:60,B:5400,tau:1.15}};
var SHAKE=[4,1.8,1];
var AIR={name:'hava (N2/O2/Ar/CO2)',spec:{28:100,32:28,40:1.3,44:.2},base:28};
var BLEED={44:35,45:100};

/* ---------- yardımcılar ---------- */
var cl=function(x,a,b){return Math.max(a,Math.min(b,x))};
function Phi(x){var t=1/(1+.2316419*Math.abs(x)),d=.3989423*Math.exp(-x*x/2),p=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));return x>0?1-p:p}
function mkRnd(seed){var s=Math.floor(seed*4294967295)>>>0||1;return function(){s=(s+0x6D2B79F5)>>>0;var t=s;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
function mkGs(r){return function(){var u=0;for(var i=0;i<6;i++)u+=r();return u-3}}
function hsNow(){var h=S.hs;return {vial:h.z[0][1],loop:h.z[1][1],tl:h.z[2][1],cycle:h.e[0][1],eq:h.e[1][1],press:h.e[2][1],fill:h.e[3][1],leq:h.e[4][1],inj:h.e[5][1],shake:h.v[2][1]}}
G.hsNow=hsNow;G.HS0=HS0;G.SOPM=SOPM;G.NM=NM;G.K=K;G.SAT=SAT;G.AMB=AMB;G.COL=COL;G.maxRate=maxRate;

/* ---------- ayarlanabilir model parametreleri (gerçek cihaz verisiyle uydurulur) ---------- */
var LSK='toksilab_gcmotor_v1';
var P={tm0:30*100/36/60,par:{},ck:{},obs:[],wsc:{}};
function kOf(ab,T){return Math.exp(ab[0]+ab[1]/(T+T0K))}
function tMat(m,T){return P.tm0*Math.sqrt(SOPM.col/Math.max(.05,m.col))*Math.pow((T+T0K)/308.15,-.15)}
function uAvg(m,T){return COL.L*100/(tMat(m,T)*60)}
/* vakum çıkışlı kolonda giriş basıncı (psig): p_i² ∝ F·η(T)·T, η ∝ T^0,7 ; SOP: 1,1 mL/dk, 35 °C → 7,07 psi */
function pIn(m,T){return Math.sqrt(21.77*21.77*(m.col/SOPM.col)*Math.pow((T+T0K)/308.15,1.7))-14.7}
G.tMat=tMat;G.uAvg=uAvg;G.pIn=pIn;

/* fırının gerçek sıcaklığı: ayar programı, ısıtma hızı sınırıyla */
function ovenAct(m,dt){var end=runLen(m),T=Math.max(AMB,m.oven.init),out=[],t=0;while(t<=end+1e-9){var Ts=Tprog(m,t);T=Ts>T?Math.min(Ts,T+maxRate(T)*dt):Ts;out.push(T);t+=dt}return out}
/* tutunma: z = kolon boyunca alınan yol (0→1) */
function el2(m,k,ab,z0,cache){var end=runLen(m)+1e-4,dt=.002,z=z0||0,t=0,i=0;var TA=cache||ovenAct(m,dt);var T=TA[0],k0=kOf(ab,T);
 while(t<end){T=TA[Math.min(i,TA.length-1)];var kk=kOf(ab,T),tm=tMat(m,T),dz=dt/(tm*(1+kk));
  if(z+dz>=1){var f=(1-z)/dz;return {rt:t+f*dt,kE:kk,k0:k0,TE:T,tmE:tm}}z+=dz;t+=dt;i++}
 return {rt:null,z:z,k0:k0,TE:T,tmE:tMat(m,T)}}
G.el2=el2;
function anchorA(k,b,rt,m){m=m||SOPM;var TA=ovenAct(m,.002),lo=-40,hi=5;for(var i=0;i<50;i++){var mid=(lo+hi)/2,r=el2(m,k,[mid,b],0,TA);if(r.rt==null||r.rt>rt)hi=mid;else lo=mid}return (lo+hi)/2}
function injBand(m,hs){var sl=m.inlet.mode==='Splitless',Fin=sl?m.col:m.col*(1+m.inlet.ratio),sw=VLOOP/Fin,inj=Math.max(.001,hs.inj);
 return {sl:sl,Fin:Fin,sweep:sw,band:Math.min(inj,sw),frac:Math.min(1,inj/sw),onCol:Math.min(1,inj/sw)/(sl?1:1+m.inlet.ratio)}}
function Hrel(u){return .5*(UOPT/u+u/UOPT)}
function calibrate(){var TA=ovenAct(SOPM,.002),b0=injBand(SOPM,HS0);
 K.forEach(function(k){if(!P.par[k])P.par[k]=[anchorA(k,KP[k],RT[k]),KP[k]];
  var r=el2(SOPM,k,P.par[k],0,TA),u=COL.L*100/(r.tmE*60),inj=b0.band/Math.sqrt(12)*(1+r.kE)/(1+r.k0),col=Math.sqrt(Math.max(1e-8,SIG0*SIG0-inj*inj));
  P.ck[k]=col/(r.tmE*(1+r.kE)*Math.sqrt(Hrel(u)))*(P.wsc[k]||1)});G.ver++;MC={}}
function load(){try{var o=JSON.parse(localStorage.getItem(LSK)||'null');if(o&&o.par){P.par=o.par;P.tm0=o.tm0||P.tm0;P.obs=o.obs||[];P.wsc=o.wsc||{}}}catch(e){}}
function save(){try{localStorage.setItem(LSK,JSON.stringify({par:P.par,tm0:P.tm0,obs:P.obs,wsc:P.wsc}))}catch(e){}}
G.P=P;

/* ---------- HS ---------- */
function hsConc(k,T){var p=HSP[k];return 1/(p.K*Math.exp(p.B*(1/(T+T0K)-1/353.15))+BETA)}
function eqFrac(k,hs){var tau=HSP[k].tau*SHAKE[cl(hs.shake|0,0,2)]*Math.exp(1800*(1/(hs.vial+T0K)-1/353.15));return 1-Math.exp(-Math.max(0,hs.eq)/tau)}
var fill=function(t){return 1-Math.exp(-Math.max(0,t)/.04)};

/* ---------- MODEL: yöntem + HS → her bileşik için RT, σ, kuyruk, miktar çarpanı, notlar ---------- */
var MC={};
function model(m,hs){hs=hs||HS0;var key=JSON.stringify([m.oven,m.col,m.inlet,m.aux2,hs,G.ver]);if(MC[key])return MC[key];
 var TA=ovenAct(m,.002),B=injBand(m,hs),B0=injBand(SOPM,HS0),N=[],o=m.oven,c={},rl=runLen(m);
 /* sıcaklık ve geçiş etkileri */
 var cold=cl((160-m.inlet.temp)/100,0,1),cold2=cl((200-m.aux2)/120,0,1);
 var cond=cl((hs.vial+15-hs.loop)/40,0,1)+cl((hs.loop-hs.tl)/30,0,1),condL=Math.min(.6,.45*cond);
 var press=fill(hs.press)/fill(HS0.press),fl=fill(hs.fill)/fill(HS0.fill);
 var leak=hs.vial>95?cl((hs.vial-95)/40,0,.5):0;
 var rv=Math.sqrt(Math.pow(hs.leq<.02?.03:0,2)+Math.pow(leak*.3,2)+Math.pow(cond*.04,2)+Math.pow(hs.press<.05?.05:0,2)+Math.pow(hs.fill<.05?.05:0,2));
 K.forEach(function(k){var r=el2(m,k,P.par[k],0,TA),x={k:k,why:[]};c[k]=x;
  var hsF=hsConc(k,hs.vial)/hsConc(k,HS0.vial),e=eqFrac(k,hs),e0=eqFrac(k,HS0);
  x.fac=(B.onCol/B0.onCol)*hsF*(e/e0)*press*fl*(1-condL)*(1-.35*cold)*(1-.5*cold2)*(1-leak*.5);
  x.eq=e;x.hsF=hsF;x.rv=Math.sqrt(rv*rv+Math.pow(.12*Math.max(0,e0-e),2));x.rvc=.3*Math.max(0,e0-e);
  x.tf=1.6+1.2*cold+2*cold2+1.2*cond;
  if(r.rt==null){x.rt=null;x.z=r.z;x.sg=SIG0;return}
  var u=COL.L*100/(r.tmE*60),sc=P.ck[k]*r.tmE*(1+r.kE)*Math.sqrt(Hrel(u)),si=B.band/Math.sqrt(12)*(1+r.kE)/(1+r.k0);
  x.rt=r.rt;x.kE=r.kE;x.k0=r.k0;x.TE=r.TE;x.u=u;x.sgCol=sc;x.sgInj=si;x.sg=cl(Math.sqrt(sc*sc+si*si),.003,.5)});
 /* notlar (öğretici) */
 var f2=function(v,n){return String((+v).toFixed(n==null?2:n)).replace('.',',')};
 if(B.sl)N.push(['inlet',`<b>Splitless</b>: loop yalnız kolon akışıyla (${f2(m.col,1)} mL/dk) süpürülür; ${f2(hs.inj)} dk’lık enjeksiyonda loop’un %${Math.round(B.frac*100)}’i kolona girer. Kolona giren madde SOP’un ~${Math.round(B.onCol/B0.onCol)} katı: geniş pik, kolon ve dedektör aşırı yüklenir.`]);
 else if(m.inlet.ratio!==SOPM.inlet.ratio)N.push(['inlet',`Split ${f2(m.inlet.ratio,1)}:1 → kolona giren miktar SOP’un <b>${f2(B.onCol/B0.onCol)}×</b>’i. Enjeksiyon bandı ${f2(B.band*60,1)} s (SOP ${f2(B0.band*60,1)} s).`]);
 if(cold>0)N.push(['inlet',`Inlet ${m.inlet.temp} °C: HS gazındaki su buharı inlette yoğuşabilir → alan kaybı ve kuyruklanma.`]);
 if(cold2>0)N.push(['aux',`MSD transfer hattı ${m.aux2} °C: soğuk nokta → pikler kuyruklanır, yanıt düşer.`]);
 if(m.col!==SOPM.col)N.push(['col',`Kolon akışı ${f2(m.col)} mL/dk → ortalama hız ${f2(uAvg(m,o.init),0)} cm/s (SOP 36), tM ${f2(tMat(m,o.init))} dk, giriş basıncı ${f2(pIn(m,o.init))} psi. Golay optimumu ~${UOPT} cm/s: uzaklaştıkça plaka sayısı düşer.`]);
 if(o.init<AMB)N.push(['oven',`<b>Başlangıç ${o.init} °C ortam sıcaklığının altında.</b> Kriyo soğutma yok: fırın ~${AMB} °C’nin altına inemez, GC “Not Ready” kalır ve HS enjeksiyon yapmaz.`]);
 else if(o.init!==SOPM.oven.init)N.push(['oven',`Başlangıç ${o.init} °C (SOP ${SOPM.oven.init}): ${o.init>SOPM.oven.init?'k küçülür, pikler erken çıkar ve birbirine yaklaşır; başlangıçtaki faz odaklaması zayıflar':'k büyür, pikler geç çıkar ama daha iyi ayrılır; odaklama güçlenir'}.`]);
 [[o.r1,o.init,o.f1],[o.r2,o.f1,o.f2]].forEach(function(R){if(!R[0])return;var lim=Math.min.apply(null,[R[1],(R[1]+R[2])/2,R[2]-1].map(maxRate));if(R[0]>lim)N.push(['oven',`Rampa ${R[0]} °C/dk: 6890N bu aralıkta en fazla ~${lim} °C/dk ısınabilir; fırın ayar değerinin gerisinde kalır (gerçek sıcaklık kullanılarak hesaplandı).`])});
 var tmax=Math.max(o.init,o.f1,o.r2?o.f2:0);if(tmax>200)N.push(['oven',`Fırın ${tmax} °C’ye çıkıyor: WAX fazı kanar (m/z 44/45 taban yükselir; 45 etanolün niteleyici iyonu!).`]);
 var cd=Math.max(0,tmax-Math.max(AMB,o.init))/COOL+(o.eq||0),ready=rl+cd;
 if(hs.cycle<ready)N.push(['cycle',`GC run ${f2(rl)} dk + soğuma/dengelenme ${f2(cd)} dk = ${f2(ready)} dk > HS GC CYCLE TIME ${f2(hs.cycle,1)} dk: HS her enjeksiyondan önce GC’nin hazır olmasını bekler; vial fırında daha uzun kalır.`]);
 if(hs.vial!==HS0.vial)N.push(['hs',`Vial ${hs.vial} °C: dağılım katsayısı K değişir → tepe boşluğundaki etanol SOP’un ${f2(c.etoh.hsF)}×’i, n-propanol ${f2(c.npr.hsF)}×’i. Oran (analit/ISTD) neredeyse aynı kalır: iç standart bunu dengeler.`+(hs.vial>95?' 95 °C üstünde su buharı basıncı hızla artar: septum sızıntısı ve tekrarlanabilirlik kaybı.':'')]);
 if(hs.eq!==HS0.eq||hs.shake!==HS0.shake)N.push(['hs',`Dengelenme ${f2(hs.eq,1)} dk, çalkalama ${['OFF','LOW','HIGH'][hs.shake|0]}: etanol dengenin %${Math.round(c.etoh.eq*100)}’inde, n-propanol %${Math.round(c.npr.eq*100)}’inde (SOP %${Math.round(eqFrac('etoh',HS0)*100)}). ${c.etoh.eq<.9?'Denge eksik: alan düşer, analit/ISTD oranı kayar, tekrarlanabilirlik bozulur.':''}`]);
 if(cond>0)N.push(['hs',`Loop ${hs.loop} °C / hat ${hs.tl} °C, vial ${hs.vial} °C: buhar soğuk yüzeyde yoğuşur → alan kaybı, kuyruk ve <b>bir sonraki viale taşınma</b>.`]);
 if(press<.9)N.push(['hs','Basınçlandırma süresi çok kısa: vial basınçlanmadan loop dolmaz, alan düşer.']);if(fl<.9)N.push(['hs','Loop doldurma süresi çok kısa: loop tam dolmaz.']);
 if(B.frac<1&&!B.sl)N.push(['hs',`INJECT TIME ${f2(hs.inj)} dk loop’u süpürmeye yetmiyor (gereken ${f2(B.sweep)} dk): örneğin bir kısmı kolona gitmez.`]);
 var res={c:c,notes:N,band:B,run:rl,ready:ready,cd:cd,tmax:tmax,hs:hs,m:m};MC[key]=res;return res}
G.model=model;

/* gürültüsüz taban alanlar (makeFile ile aynı formül, rastgele terimler olmadan) */
function baseA(content){var c=((content.c||0)*(content.cf!=null?content.cf:1))||(content.cx||0),isA0=87000,isA=isA0*(content.isf!=null?content.isf:1),RK=.3,num=content.type==='num',bl=content.type==='blank';
 var mc=num?(content.meoh||0):c;
 return {npr:isA,etoh:c>0&&!(bl&&!content.cx)?RK*1.142*(c/.07)*isA0+700:(bl?0:700),meoh:mc>0?RK*.6789*(mc/.07)*isA0+900:(bl?0:900),acet:3800+(content.acet||0)*900000}}

/* ---------- veri dosyasına uygula ---------- */
G.pend=[];G.carry={};
function engApply(F,m,hs,opt){opt=opt||{};var M=model(m,hs),r=mkRnd(hashS(F.name+F.folder+'#eng')),g=mkGs(r),ideal=!!opt.ideal;
 F.eng={v:2,hs:clone(hs),meth:clone({oven:m.oven,inlet:m.inlet,col:m.col,aux2:m.aux2}),notes:M.notes.map(function(n){return n[1]}),fac:{},sat:{},ideal:ideal};
 F.ms=clone(m.ms||defMS());F.end=M.run;F.lf={};F.tf={};F.lost=[];F.lostWhy={};
 var common=ideal?1:1+g()*Math.sqrt(K.reduce(function(a,k){return a+M.c[k].rvc*M.c[k].rvc},0)/4),acq=opt.acq&&!ideal,nw=[];
 K.forEach(function(k){var x=M.c[k];F.tf[k]=x.tf;F.lf[k]=1;F.eng.fac[k]=x.fac;
  F.A[k]*=x.fac*common*(ideal?1:1+g()*x.rv);
  if(acq&&G.carry[k])F.A[k]+=G.carry[k]*(M.band.onCol/injBand(SOPM,HS0).onCol);
  if(x.rt==null){F.lost.push(k);F.lostWhy[k]='run';if(acq&&F.A[k]>0)nw.push({k:k,z:x.z,A:F.A[k]});F.A[k]=0;F.rt[k]=99;F.sg[k]=SIG0;return}
  F.rt[k]=x.rt+(ideal?0:F.rt[k]-RT[k]);F.sg[k]=x.sg;
  var load=F.A[k]/2.13e5;if(load>3){F.lf[k]=1+.9*Math.log10(load/3);F.rt[k]+=x.sg*(F.lf[k]-1)*.8}
  if(F.rt[k]<F.ms.sd){F.lost.push(k);F.lostWhy[k]='sd';F.A[k]=0}});
 /* hava piki: tM'de, tutunmasız */
 var B=M.band,tm=tMat(m,Math.max(AMB,m.oven.init));
 F.extra=(F.extra||[]).filter(function(x){return !x.eng}).concat([{name:AIR.name,eng:1,air:1,rt:tm+.003,sg:Math.max(.004,B.band/Math.sqrt(12)+.002),A:4e6*B.onCol/injBand(SOPM,HS0).onCol*(hs.vial>0?1:1),spec:AIR.spec,base:AIR.base}]);
 if(acq){
  /* önceki enjeksiyondan kolonda kalanlar: soğuma + bekleme sırasında başlangıç sıcaklığında ilerler,
     bu run'ın programıyla çıkar → geniş "hayalet" pik */
  var old=G.pend;G.pend=[];
  var gap=Math.max(.5,G.lastGap||2),Ti=Math.max(AMB,m.oven.init);
  old.forEach(function(p){var ab=P.par[p.k],z=p.z+gap/(tMat(m,Ti)*(1+kOf(ab,Ti)));if(z>=1){G.gapLost=(G.gapLost||[]).concat([p.k]);return}var e=el2(m,p.k,ab,z);
   if(e.rt!=null){if(e.rt>=F.ms.sd)F.extra.push({name:NM[p.k]+' (önceki enjeksiyondan)',eng:1,ghost:p.k,rt:e.rt,sg:Math.min(.4,(M.c[p.k].sg||SIG0)*2.5+.01),A:p.A*.9,spec:SPEC[p.k],base:BASE[p.k]})}
   else G.pend.push({k:p.k,z:e.z,A:p.A*.9})});
  nw.forEach(function(p){G.pend.push(p)});
  /* HS taşınması (yoğuşma) */
  var cond=cl((hs.vial+15-hs.loop)/40,0,1)+cl((hs.loop-hs.tl)/30,0,1);G.carry={};
  if(cond>0)K.forEach(function(k){if(F.A[k]>0)G.carry[k]=F.A[k]*.03*cond});
  G.lastGap=M.cd+Math.max(0,hs.cycle-M.ready)}
 /* doygunluk bilgisi */
 K.forEach(function(k){if(F.A[k]>0)F.eng.sat[k]=hk(F,k)*(hasSim(F)?SIMGAIN:1)>SAT});
 return F}
G.engApply=engApply;
G.ctx=null;
window.makeFile=function(name,folder,vial,content,sample,type,mname){var F=O.makeFile(name,folder,vial,content,sample,type);if(!mname)return F;
 F.method=mname;var m=METH[mname];if(!m)return F;
 return engApply(F,m,(G.ctx&&G.ctx.hs)||hsNow(),{acq:!!(G.ctx&&G.ctx.acq)})};
/* tahmin: gürültüsüz, kolonda kalan/taşınma etkisi olmadan */
G.predict=function(m,hs,content){var F=O.makeFile('TAHMIN.D','TAHMIN',1,content||{c:.25,type:'cal'},'TAHMIN','cal');F.A=baseA(content||{c:.25,type:'cal'});K.forEach(function(k){F.rt[k]=RT[k]});F.seed=1;F.method=m.name;return engApply(F,m,hs||hsNow(),{ideal:true})};
window.methRT=function(m){var M=model(m,HS0),o={};K.forEach(function(k){var x=M.c[k];o[k]=x.rt==null?null:{rt:x.rt,sg:x.sg}});return o};

/* ---------- sinyal ---------- */
function shp(F,k,t){var s=F.sg[k],d=t-F.rt[k];return d<0?Math.exp(-.5*Math.pow(d/(s*(F.lf?F.lf[k]:1)),2)):Math.exp(-.5*Math.pow(d/(s*(F.tf?F.tf[k]:1.6)),2))}
function hk(F,k){var lf=F.lf?F.lf[k]:1,tf=F.tf?F.tf[k]:1.6;return F.A[k]*3.2*(.0065/F.sg[k])*(2.6/(lf+tf))*(100/SPEC[k][BASE[k]])}
G.hk=hk;
function ionRaw(F,t,m){var v=0;for(var i=0;i<4;i++){var k=K[i];if(!F.A[k])continue;var sh=shp(F,k,t);if(sh<1e-6)continue;v+=hk(F,k)*sab(F,k,m)/100*sh}return v+exAt(F,t,m)}
function bleedAt(F,t,m){if(!BLEED[m]||!F.eng)return 0;var T=Tprog(F.eng.meth,t);var b=2500*(Math.exp((T-180)/20)-Math.exp(-1.5));return b>0?b*BLEED[m]/100:0}
var sat=function(v){return v>SAT?SAT+(v-SAT)*.03:v};
function ion2(F,t,m,src){var v=ionRaw(F,t,m)+bleedAt(F,t,m);if(src==='scan'&&F.sub)v=Math.max(0,v-(F.sub.spec[m]||0));return v}
/* gürültüsüz sinyal (tahmin grafiği bunu çizer); null = bu anda veri yok */
function sigCore(F,t,src,mz){var ms=fms(F);if(t<ms.sd||t>(F.end||4.8))return null;if((src==='scan'&&!hasScan(F))||(src==='sim'&&!hasSim(F)))return null;
 var g=src==='sim'?simGroupAt(ms,t):null;if(src==='sim'&&!g)return null;var v=0,m;
 if(src==='scan'){if(mz!=null){m=Math.round(mz);if(m>=ms.lo&&m<=ms.hi)v=sat(ion2(F,t,m,src))}else for(m=Math.max(20,Math.ceil(ms.lo));m<=Math.min(66,Math.floor(ms.hi));m++)v+=sat(ion2(F,t,m,src))}
 else g.ions.forEach(function(io){if(mz!=null&&Math.abs(io[0]-mz)>.5)return;v+=sat(ion2(F,t,Math.round(io[0]),src)*SIMGAIN)});
 return v}
G.clean=sigCore;
window.chromAt=function(F,t,src,mz){if(!F||!F.eng||F.clip)return O.chromAt(F,t,src,mz);var v=sigCore(F,t,src,mz);if(v==null)return 0;
 var ms=fms(F),g=src==='sim'?simGroupAt(ms,t):null;
 var i=Math.round(t*4000),r1=hz1(i*12.9898+(F.seed||1)),r2=hz1(i*78.233+(F.seed||1)*3.1),r3=hz1(i*3.7+(F.seed||1));
 if(src==='scan'){var nf=Math.min(3,Math.max(.25,Math.pow(150/Math.max(ms.thr,1),.35)));if(mz!=null)return v+nf*(r1>.3?600+r1*2200:r2*300);
  return v+nf*(16000+11000*r1+6000*r2*r3+4500*Math.sin(t*6.3+(F.seed||1))+2500*Math.sin(t*23+(F.seed||1)*2))}
 if(mz!=null){if(!g.ions.some(function(io){return Math.abs(io[0]-mz)<.5}))return 0;return v+25+45*r1}
 return v+g.ions.length*(70+70*r1)};
window.specFrom=function(F,t,src){if(!F||!F.eng||F.clip)return O.specFrom(F,t,src);var sp={},ms=fms(F);if(t<ms.sd||t>(F.end||4.8))return sp;
 if(src==='sim'){var g=simGroupAt(ms,t);if(!g||!hasSim(F))return sp;g.ions.forEach(function(io){var m=Math.round(io[0]);sp[m]=Math.max(1,Math.round(sat(ion2(F,t,m,'sim')*SIMGAIN)+20+40*hz1(m*7.7+t*91+(F.seed||1))))});return sp}
 if(!hasScan(F))return sp;for(var m=Math.max(20,Math.ceil(ms.lo));m<=Math.min(66,Math.floor(ms.hi));m++){var v=sat(ion2(F,t,m,'scan'));var nz=hz1(m*77.1+t*313+(F.seed||1));if(nz>.55)v+=nz*ms.thr*4;if(v>=ms.thr)sp[m]=Math.round(v)}return sp};
window.ionSig=function(F,t,m){if(!F||!F.eng)return O.ionSig(F,t,m);return ionRaw(F,t,m)+bleedAt(F,t,m)};
window.ticAt=function(F,t,kind,mz){if(!F||!F.eng)return O.ticAt(F,t,kind,mz);kind=kind||'sim';
 if(kind==='eic')return chromAt(F,t,hasScan(F)?'scan':'sim',mz);if(kind==='scan'||!hasSim(F))return chromAt(F,t,'scan');return chromAt(F,t,'sim')};
window.specAt=function(F,t){if(!F||!F.eng)return O.specAt(F,t);return specFrom(F,t,hasScan(F)?'scan':'sim')};

/* ---------- integrasyon: çakışma, birleşme, doygunluk ---------- */
function side(F,a,b){/* a önce çıkıyor: a'nın sağ, b'nin sol genişliği */return F.sg[a]*(F.tf?F.tf[a]:1.6)+F.sg[b]*(F.lf?F.lf[b]:1)}
function merged(F,a,b,ha,hb){var x=F.rt[a]<=F.rt[b]?[a,b]:[b,a];var d=Math.abs(F.rt[a]-F.rt[b]);return d/side(F,x[0],x[1])<1+.3*Math.abs(Math.log(Math.max(1e-9,ha)/Math.max(1e-9,hb)))}
G.merged=merged;
function satFrac(F,k,m){var h=hk(F,k)*sab(F,k,m)/100*(hasSim(F)&&msInSim(F,m,F.rt[k])?SIMGAIN:1);if(h<=SAT)return 1;
 var s=F.sg[k],lf=F.lf[k],tf=F.tf[k],a=0,b=0;for(var i=-300;i<=300;i++){var d=i/50*s,sh=d<0?Math.exp(-.5*Math.pow(d/(s*lf),2)):Math.exp(-.5*Math.pow(d/(s*tf),2)),v=h*sh;a+=sat(v);b+=v}return a/b}
function msInSim(F,m,t){var ms=fms(F);if(ms.acq==='Scan')return false;var g=simGroupAt(ms,t);return !!(g&&g.ions.some(function(io){return Math.abs(io[0]-m)<.5}))}
window.areaIon=function(F,k,m){if(!F||!F.eng)return O.areaIon(F,k,m);if(!F.A[k])return 0;
 var own=F.A[k]*sab(F,k,m)/SPEC[k][BASE[k]],a=own*satFrac(F,k,m),hK=hk(F,k)*sab(F,k,m);
 for(var i=0;i<4;i++){var j=K[i];if(j===k||!F.A[j]||!(sab(F,j,m)>0))continue;var hJ=hk(F,j)*sab(F,j,m),aj=F.A[j]*sab(F,j,m)/SPEC[j][BASE[j]]*satFrac(F,j,m);
  var x=F.rt[k]<=F.rt[j]?[k,j]:[j,k],d=Math.abs(F.rt[k]-F.rt[j]),p=Phi(-d/side(F,x[0],x[1]));if(p<1e-6)continue;
  if(merged(F,k,j,hK,hJ)){if(hK>=hJ)a+=aj;else return 0}else a+=(aj-own)*p}
 (F.extra||[]).forEach(function(x){if(Math.abs(x.rt-F.rt[k])<Math.max(.05,2*F.sg[k]))a+=x.A*(x.spec[m]||0)/x.spec[x.base]});
 if(F.isSub&&F.sub)a*=subRatio(F,k,m);return Math.max(0,Math.round(a))};
window.peaksOf=function(F){if(!F||!F.eng)return O.peaksOf(F);var ms=fms(F),L=[];
 K.forEach(function(k){if(!(F.A[k]>2500)||F.rt[k]<ms.sd||F.rt[k]>F.end)return;L.push({k:k,rt:F.rt[k],area:Math.round(F.A[k]*TICF[k]*(100/SPEC[k][BASE[k]])),h:Math.round(Math.min(hk(F,k)*TICF[k],SAT*3))})});
 (F.extra||[]).forEach(function(x){if(x.rt<ms.sd||x.rt>F.end)return;var ar=x.A*(x.air?.3:1)*100/x.spec[x.base];if(ar<2500)return;L.push({k:null,x:x,rt:x.rt,area:Math.round(ar),h:Math.round(Math.min(x.A*3.2*(.0065/x.sg),SAT*3))})});
 L.sort(function(a,b){return a.rt-b.rt});var out=[];
 L.forEach(function(p){var q=out[out.length-1];if(q&&q.k&&p.k&&merged(F,q.k,p.k,q.h,p.h)){if(p.h>q.h){q.rt=p.rt;q.k=p.k}q.area+=p.area;q.h=Math.max(q.h,p.h);q.mer=(q.mer||1)+1}else out.push(Object.assign({},p))});return out};

/* ---------- tahmin istatistikleri (modül ve rapor için) ---------- */
var QI={meoh:[31,[32]],etoh:[31,[45,46]],npr:[31,[59,60]],acet:[43,[58]]};
/* maddenin "kendi" SIM grubunu tanıtan iyon: pik bu iyonu ölçmeyen bir grubun penceresine düşerse SIM verisinde kimliği kaybolur */
var SIMKEY={meoh:32,etoh:45,npr:59};G.SIMKEY=SIMKEY;
G.QI=QI;
G.stats=function(F){var ms=fms(F),out={};var det=K.filter(function(k){return F.A[k]>0});
 K.forEach(function(k){var x={k:k,rt:F.A[k]?F.rt[k]:null,sg:F.sg[k],lf:F.lf[k],tf:F.tf[k],fac:F.eng?F.eng.fac[k]:1,lost:F.lostWhy?F.lostWhy[k]:null,flags:[]};out[k]=x;
  if(!F.A[k])return;x.w50=F.sg[k]*1.1774*(F.lf[k]+F.tf[k])*60;var t=QI[k][0];
  x.h=hk(F,k)*sab(F,k,t)/100*(msInSim(F,t,F.rt[k])?SIMGAIN:1);x.sat=x.h>SAT;
  x.sn=x.h/45;x.tgtOK=msHas(F,t,F.rt[k]);x.qOK=QI[k][1].every(function(q){return msHas(F,q,F.rt[k])});
  var g=hasSim(F)?simGroupAt(ms,F.rt[k]):null;x.grp=g?g.name:null;
  if(!x.tgtOK||!x.qOK)x.flags.push('ION');
  if(hasSim(F)&&k!=='acet'&&!msInSim(F,SIMKEY[k],F.rt[k]))x.flags.push('SIM');if(x.sat)x.flags.push('SAT');if(F.lf[k]>1.05)x.flags.push('FRONT');if(F.tf[k]>2)x.flags.push('TAIL')});
 var ord=det.slice().sort(function(a,b){return F.rt[a]-F.rt[b]});
 for(var i=1;i<ord.length;i++){var a=ord[i-1],b=ord[i];var rs=(F.rt[b]-F.rt[a])/(2*side(F,a,b));out[b].rsPrev=rs;out[b].prev=a;
  var ha=hk(F,a),hb=hk(F,b);if(merged(F,a,b,ha,hb)){out[b].flags.push('MERGE');out[a].flags.push('MERGE')}}
 return out};

/* ---------- uydurma: gerçek cihaz gözlemleri ---------- */
function predRT(meth,k,ab){var r=el2(meth,k,ab);return r.rt}
function golden(f,a,b,n){var g=.6180339887,c=b-g*(b-a),d=a+g*(b-a),fc=f(c),fd=f(d);for(var i=0;i<n;i++){if(fc<fd){b=d;d=c;fd=fc;c=b-g*(b-a);fc=f(c)}else{a=c;c=d;fc=fd;d=a+g*(b-a);fd=f(d)}}return (a+b)/2}
G.kalibreEt=function(){var obs=P.obs.slice();
 var hasSop=obs.some(function(o){return JSON.stringify(o.m.oven)===JSON.stringify(SOPM.oven)&&o.m.col===SOPM.col});
 if(!hasSop)obs.push({m:{oven:SOPM.oven,col:SOPM.col,name:'ALKOL1.M'},rt:{meoh:RT.meoh,etoh:RT.etoh,npr:RT.npr,acet:RT.acet},sop:1});
 var tms=obs.map(function(o){return o.tm&&o.m.col?o.tm*Math.sqrt(o.m.col/SOPM.col):0}).filter(Boolean);if(tms.length)P.tm0=tms.reduce(function(a,b){return a+b},0)/tms.length;
 var rep=[];
 K.forEach(function(k){var pts=obs.filter(function(o){return o.rt[k]>0});if(!pts.length)return;var TAs=pts.map(function(o){return ovenAct(o.m,.002)});
  var err=function(ab){var e=0;pts.forEach(function(o,i){var r=el2(o.m,k,ab,0,TAs[i]);var d=r.rt==null?10:r.rt-o.rt[k];e+=d*d});return e};
  var fitA=function(b){return golden(function(a){return err([a,b])},-40,5,40)};
  var sig=function(o){return JSON.stringify([o.m.oven,o.m.col])};var b=pts.length<2||pts.every(function(o){return sig(o)===sig(pts[0])})?(P.par[k]?P.par[k][1]:KP[k]):golden(function(b){return err([fitA(b),b])},1500,9000,28);
  var a=fitA(b);P.par[k]=[a,b];rep.push({k:k,n:pts.length,rms:Math.sqrt(err([a,b])/pts.length)})});
 /* genişlik ölçeği */
 calibrate();K.forEach(function(k){var w=P.obs.filter(function(o){return o.w&&o.w[k]>0});if(!w.length){return}var s=0;w.forEach(function(o){var F=G.predict(METHlike(o.m),HS0,{c:.25,type:'cal'});s+=o.w[k]/(F.sg[k]*1.1774*(F.lf[k]+F.tf[k])*60)});P.wsc[k]=(P.wsc[k]||1)*s/w.length});
 calibrate();save();return rep};
function METHlike(m){var b=clone(SOPM);b.oven=clone(m.oven);b.col=m.col;if(m.inlet)b.inlet=clone(m.inlet);if(m.aux2)b.aux2=m.aux2;if(m.ms)b.ms=clone(m.ms);return b}
G.gozlemEkle=function(meth,rt,w,tm,hs){P.obs.push({m:{oven:clone(meth.oven),col:meth.col,inlet:clone(meth.inlet),aux2:meth.aux2,name:meth.name},rt:rt,w:w||null,tm:tm||null,hs:hs||null,t:Date.now()});save()};
G.gozlemSil=function(i){P.obs.splice(i,1);save()};
G.sifirla=function(){P.par={};P.obs=[];P.wsc={};P.tm0=30*100/36/60;try{localStorage.removeItem(LSK)}catch(e){}calibrate()};
G.METHlike=METHlike;

/* ---------- cihaz bağlantıları ---------- */
/* GC tuş takımı → yüklü (kilitsiz) yöntem */
G.keypad=function(sec,i,v){var m=METH[IC.method];if(!m||m.locked)return null;var g=S.gc,msg=null;
 if(sec==='oven'){var f=['init','hold','r1','f1','h1','r2'][i];if(!f)return null;m.oven[f]=v;if(f==='r2'&&v&&!(m.oven.f2>m.oven.f1))m.oven.f2=m.oven.f1;if(f==='init'){g.ovenSet=v;if(v<AMB)msg=`Başlangıç <b>${v} °C</b> kaydedildi, ama fırında kriyo yok: oda sıcaklığının üstüne (~${AMB} °C) inebilir. GC <b>Not Ready</b> kalacak ve HS enjeksiyon yapmayacak.`}}
 else if(sec==='finlet'){if(i===1)m.inlet.temp=v;else if(i===3){if(v<1)return {skip:1,msg:'Split oranı en az 1:1.'};m.inlet.ratio=v}else if(i===4){m.inlet.ratio=+(v/m.col).toFixed(1)}else return {skip:1,msg:'Sabit akış modunda inlet basıncı ve toplam akış <b>hesaplanır</b>: kolon akışı ve split oranından gelir. Kolon akışını <b>Col 1 ▸ Flow</b>’dan, split oranını buradan değiştir.'}}
 else if(sec==='col1'){if(i===2){if(v<.1)return {skip:1,msg:'Akış en az 0,1 mL/dk olmalı.'};m.col=v}else return {skip:1,msg:'Sabit akış (Const flow) modunda basınç ve ortalama hız <b>hesaplanır</b>; yalnız <b>Flow</b> girilir.'}}
 else if(sec==='aux'){if(i===0)m.aux2=v;else return null}
 else return null;
 m.mod=true;O.applyMeth.call(null,IC.method);syncKeys();G.changed();
 return {msg:msg||`${IC.method} yöntemi güncellendi (bellekte): bundan sonraki enjeksiyonlar bu değerle koşar. Run süresi ${runLen(m).toFixed(2).replace('.',',')} dk.`}};
G.keypadMode=function(mode){var m=METH[IC.method];if(!m||m.locked)return;m.inlet.mode=mode;m.mod=true;G.changed()};
function syncKeys(){var m=METH[IC.method];if(!m)return;var g=S.gc,T=g.ovenA||m.oven.init;
 g.p.finlet[0][1]=m.inlet.mode;g.p.finlet[3][1]=m.inlet.ratio;g.p.finlet[4][1]=+(m.inlet.ratio*m.col).toFixed(1);g.p.finlet[5][1]=+(m.inlet.mode==='Splitless'?m.col+3:m.inlet.ratio*m.col+m.col+3).toFixed(1);
 g.p.finlet[2][1]=+pIn(m,T).toFixed(2);g.p.col1[2][1]=m.col;g.p.col1[3][1]=+pIn(m,T).toFixed(2);g.p.col1[4][1]=Math.round(uAvg(m,T));
 g.p.oven[5][1]=m.oven.r2||0}
G.syncKeys=syncKeys;
window.applyMeth=function(name){O.applyMeth(name);syncKeys();G.changed()};
G.changed=function(){if(G.onChange)try{G.onChange()}catch(e){console.error(e)}};
/* enjeksiyon anı: HS durumunu ve GC'yi bekleme süresini veri dosyasına aktar */
window.acqStart=function(vial){var r=S.hs.run,hs=hsNow();hs.wait=(r&&r.wait)||0;hs.eq+=hs.wait;if(r){r.wait=0;r.wmsg=0}
 G.ctx={hs:hs,acq:true};try{O.acqStart(vial)}finally{G.ctx=null}
 if(!IC.acq){/* veri toplanmadı ama kolon yine de enjeksiyonu aldı */var m=METH[IC.method];if(m){var F=O.makeFile('X.D','X',vial,{c:0,type:'blank'},'X','Blank');F.name='_kayip_'+Date.now();G.ctx={hs:hs,acq:true};try{engApply(F,m,hs,{acq:true})}finally{G.ctx=null}}}};
window.acqEnd=function(){var F=IC.acq&&IC.acq.F;O.acqEnd();if(F&&F.eng&&G.onAcq)try{G.onAcq(F)}catch(e){console.error(e)}};
/* fırın ortam sıcaklığının altına inemez; basınç ve hız fırın sıcaklığıyla değişir (sabit akış) */
var tk=0;window.icTick=function(){O.icTick();var g=S.gc;if(S.view!=='oven'&&g.ovenA<AMB)g.ovenA=AMB;
 if(++tk%4===0){var m=METH[IC.method];if(m){var T=g.ovenA;g.p.col1[3][1]=+pIn(m,T).toFixed(2);g.p.finlet[2][1]=g.p.col1[3][1];g.p.col1[4][1]=Math.round(uAvg(m,T));var tl=document.querySelectorAll('#icTiles>div');if(tl[2]&&tl[2].firstElementChild)tl[2].firstElementChild.textContent=m.col}}
 if(tk%8===0)persist()};
/* kullanıcı yöntemleri tarayıcıda saklanır */
var MLS='toksilab_metot_v1',lastP='';
function persist(){var o={};for(var n in METH){var m=METH[n];if(!m.locked&&['ALKOL2.M','SARTLAMA.M','GENEL_TARAMA.M'].indexOf(n)<0)o[n]=m}var s=JSON.stringify(o);if(s===lastP)return;lastP=s;try{localStorage.setItem(MLS,s)}catch(e){}}
G.persist=persist;
(function(){try{var o=JSON.parse(localStorage.getItem(MLS)||'{}');for(var n in o){if(METH[n]&&METH[n].locked)continue;METH[n]=o[n];METH[n].locked=false;if(!METH[n].ms)METH[n].ms=defMS();if(METHODS.indexOf(n)<0)METHODS.push(n)}lastP=JSON.stringify(o)}catch(e){}})();
G.silYontem=function(n){if(!METH[n]||METH[n].locked)return;delete METH[n];var i=METHODS.indexOf(n);if(i>=0)METHODS.splice(i,1);persist()};

load();calibrate();syncKeys();
})();
