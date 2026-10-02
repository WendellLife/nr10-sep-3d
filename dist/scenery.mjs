// Cenário estático da fábrica, construído conforme layout.mjs: sala elétrica (QGBT, CCM-2, banco de capacitores), galpão,
// geração fotovoltaica, cabine primária, poste de entrada, rede da distribuidora e caminhão com cesto aéreo.
// Devolve as peças que o jogo liga, desliga ou anima (bloqueio, aterramentos, anteparo, cones, cesto, fogo, faíscas).
import * as T from './three.module.js';
import {structures as S,sala,cabine,poste,rede,derivacao,truck,meetingPoint} from './layout.mjs';
import {glowSprite,particleTextures} from './graphics.mjs';
export function buildScenery(scene,TX){
 const mats={};
 const mat=(c,metal=0,rough=.7)=>mats[c+'-'+metal+'-'+rough]??=new T.MeshStandardMaterial({color:c,metalness:metal,roughness:rough});
 const shadowed=(m,cast=true)=>{m.castShadow=cast;m.receiveShadow=true;return m;};
 const box=(w,h,d,c,x,y,z,parent=scene,metal=0)=>{const m=shadowed(new T.Mesh(new T.BoxGeometry(w,h,d),typeof c==='object'?c:mat(c,metal)));m.position.set(x,y,z);parent.add(m);return m;};
 const cyl=(r,rb,h,c,x,y,z,parent=scene,n=16)=>{const m=shadowed(new T.Mesh(new T.CylinderGeometry(r,rb,h,n),typeof c==='object'?c:mat(c,.2)));m.position.set(x,y,z);parent.add(m);return m;};
 const sphere=(r,c,x,y,z,parent=scene)=>{const m=shadowed(new T.Mesh(new T.SphereGeometry(r,16,12),typeof c==='object'?c:mat(c)),true);m.position.set(x,y,z);parent.add(m);return m;};
 const rod=(a,b,r,c,parent=scene)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b);const m=cyl(r,r,av.distanceTo(bv),c,0,0,0,parent,8);m.position.copy(av.clone().add(bv).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),bv.sub(av).normalize());return m;};
 function canvasPlane(w,h,draw,res=768){const cv=document.createElement('canvas');cv.width=res;cv.height=Math.round(res*h/w);const g=cv.getContext('2d');draw(g,cv.width,cv.height);const tx=new T.CanvasTexture(cv);tx.colorSpace=T.SRGBColorSpace;tx.anisotropy=4;return new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tx,roughness:.8}));}
 function sign(text,w,h,x,y,z,bg='#173e31',fg='#ffffff',parent=scene,ry=0){
  const m=canvasPlane(w,h,(g,W,H)=>{g.fillStyle=bg;g.fillRect(0,0,W,H);g.strokeStyle=fg;g.lineWidth=6;g.strokeRect(12,12,W-24,H-24);
   g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';const lines=text.split('\n');g.font=`bold ${Math.min(110,H/(lines.length+1))}px Arial`;
   lines.forEach((s,i)=>g.fillText(s,W/2,H*(i+1)/(lines.length+1),W-54));});
  m.position.set(x,y,z);m.rotation.y=ry;parent.add(m);return m;}
 // Placa de perigo com o raio (triângulo amarelo) e texto.
 function danger(text,w,x,y,z,parent=scene,ry=0){
  const h=w*.62;const m=canvasPlane(w,h,(g,W,H)=>{g.fillStyle='#f5f2e8';g.fillRect(0,0,W,H);g.fillStyle='#d62d20';g.fillRect(0,0,W,H*.3);g.fillStyle='#fff';g.font=`bold ${H*.2}px Arial`;g.textAlign='center';g.textBaseline='middle';g.fillText('PERIGO',W/2,H*.16);
   const cx=W*.2,cy=H*.66,s=H*.28;g.fillStyle='#f5c518';g.beginPath();g.moveTo(cx,cy-s);g.lineTo(cx+s*1.1,cy+s*.8);g.lineTo(cx-s*1.1,cy+s*.8);g.closePath();g.fill();g.strokeStyle='#111';g.lineWidth=H*.03;g.stroke();
   g.fillStyle='#111';g.beginPath();g.moveTo(cx+s*.12,cy-s*.55);g.lineTo(cx-s*.28,cy+s*.12);g.lineTo(cx+s*.02,cy+s*.12);g.lineTo(cx-s*.14,cy+s*.65);g.lineTo(cx+s*.3,cy-s*.05);g.lineTo(cx,cy-s*.05);g.closePath();g.fill();
   g.fillStyle='#111';g.textAlign='left';const lines=text.split('\n');g.font=`bold ${Math.min(H*.16,H*.62/lines.length)}px Arial`;lines.forEach((t,i)=>g.fillText(t,W*.4,H*.42+(i+.5)*H*.58/lines.length,W*.57));},512);
  m.position.set(x,y,z);m.rotation.y=ry;parent.add(m);return m;}
 const out={trees:[],puddles:[],groundMats:[],items:{},see:[]};
 // ---- Terreno: pátio de concreto, gramado em volta, calçada e via ao norte ----
 const concreteMat=new T.MeshStandardMaterial({map:TX.concrete,normalMap:TX.concreteN,normalScale:new T.Vector2(.5,.5),color:'#d2d4cf',roughness:.88});
 const slab=new T.Mesh(new T.BoxGeometry(49,.3,26.4),concreteMat);slab.position.set(2.5,-.15,-.5);slab.receiveShadow=true;scene.add(slab);
 const grassMat=new T.MeshStandardMaterial({map:TX.grass,roughness:1});
 const grass=new T.Mesh(new T.PlaneGeometry(240,240),grassMat);grass.rotation.x=-Math.PI/2;grass.position.y=-.32;grass.receiveShadow=true;scene.add(grass);
 const asphaltMat=new T.MeshStandardMaterial({map:TX.asphalt,normalMap:TX.asphaltN,normalScale:new T.Vector2(.6,.6),color:'#8d9498',roughness:.95});
 const road=new T.Mesh(new T.BoxGeometry(120,.3,6),asphaltMat);road.position.set(3,-.17,-18.6);road.receiveShadow=true;scene.add(road);
 for(let x=-50;x<56;x+=3)box(1.4,.02,.14,'#e9e2c8',x,-.015,-18.6);
 box(120,.12,2.2,'#b7b4aa',3,-.06,-14.75);
 out.groundMats.push(concreteMat,asphaltMat,grassMat);
 // Faixas de piso: rota de pedestres e área do ponto de encontro.
 for(let x=-18;x<24;x+=1.2)box(.6,.012,.12,'#f2c230',x,.006,-1.05);
 {const m=new T.Mesh(new T.CircleGeometry(2.6,40),new T.MeshStandardMaterial({color:'#2f8a57',roughness:.9}));m.rotation.x=-Math.PI/2;m.position.set(meetingPoint.x,.01,meetingPoint.z);scene.add(m);
  sign('PONTO DE\nENCONTRO',1.6,.9,meetingPoint.x+2.9,1.7,meetingPoint.z-.2,'#2f8a57');rod([meetingPoint.x+2.9,0,meetingPoint.z-.25],[meetingPoint.x+2.9,1.25,meetingPoint.z-.25],.04,'#7a858b');}
 // Alambrado na divisa com a calçada.
 for(let x=-20.8;x<=25.8;x+=2.6)rod([x,0,-13.75],[x,2.1,-13.75],.035,'#8e979c');
 {const f=new T.Mesh(new T.PlaneGeometry(46.6,2),new T.MeshStandardMaterial({color:'#8e979c',transparent:true,opacity:.28,side:T.DoubleSide,depthWrite:false}));f.position.set(2.5,1.05,-13.75);scene.add(f);}
 // Poças (só aparecem com chuva, no módulo SEP).
 for(const [x,z,r] of [[-6,-12,1.2],[-12,-5,1.1],[-3,-6,1.3],[-15,-3,1.2],[2,-12.6,1]]){
  const p=new T.Mesh(new T.CircleGeometry(r,28),new T.MeshStandardMaterial({color:'#51626d',roughness:.06,metalness:.35,transparent:true,opacity:0,depthWrite:false}));
  p.rotation.x=-Math.PI/2;p.position.set(x,.02,z);p.scale.set(1,.72,1);scene.add(p);out.puddles.push(p);}
 // ---- Rede da distribuidora (13,8 kV) ao longo da via ----
 const poleMat=mat('#b9b6ad',0,.85);
 function pole(x,z,h){const p=cyl(.13,.2,h,poleMat,x,h/2,z,scene,10);return p;}
 for(const x of rede.poles){pole(x,rede.z,10.4);box(.12,.12,2.2,'#a7a39a',x,rede.y-.15,rede.z);for(const pz of rede.phases){cyl(.06,.08,.24,'#c8d3d8',x,rede.y,pz,scene,8);}}
 const wireMat=new T.MeshStandardMaterial({color:'#5a6168',metalness:.6,roughness:.4});
 for(const pz of rede.phases){const w=new T.Mesh(new T.CylinderGeometry(.022,.022,80,6),wireMat);w.rotation.z=Math.PI/2;w.position.set(2,rede.y+.12,pz);scene.add(w);}
 sign('REDE 13,8 kV\nDISTRIBUIDORA',1.6,.6,-8,3,rede.z+.22,'#23282c','#f5c948');
 // Derivação: chaves fusíveis no poste da rede que alimentam o ramal da fábrica.
 const fuses=[];{const x=derivacao.x,z=derivacao.z;box(1.9,.1,.1,'#a7a39a',x,8.7,z+.4);
  rede.phases.forEach((pz,i)=>{const g=new T.Group();g.position.set(x-.7+i*.7,8.85,z+.45);scene.add(g);box(.08,.4,.08,'#d9dfe2',0,0,0,g);const tube=box(.05,.38,.05,'#3a3f44',0,0,.07,g);fuses.push(tube);});
  sign('CHAVE DA\nDERIVAÇÃO',1,.45,x+.9,7.6,z+.3,'#23282c','#f5c948');}
 out.items.fuses=fuses;
 // ---- Poste de entrada com para-raios ----
 {const x=poste.x,z=poste.z;pole(x,z,9.6);box(2,.12,.12,'#a7a39a',x,poste.top,z);
  for(let i=0;i<3;i++){const px=x-.8+i*.8;cyl(.05,.07,.26,'#c8d3d8',px,poste.top+.2,z,scene,8);cyl(.07,.07,.4,'#8a5a3a',px,poste.top-.3,z+.1,scene,10);
   // Ramal: da chave da derivação até o poste.
   const from=[derivacao.x-.7+i*.7,8.65,derivacao.z+.45],to=[px,poste.top+.3,z];rod(from,to,.018,'#5a6168');
   rod([px,poste.top-.1,z],[x+.05,poste.top-1.2,z+.15],.015,'#3a3f44');}
  // Descida do cabo para a cabine (eletroduto) e cabo de aterramento.
  rod([x+.18,poste.top-1.2,z+.18],[x+.18,0,z+.18],.06,'#55606a');rod([x-.18,poste.top-.4,z+.18],[x-.18,0,z+.18],.012,'#7a5a3a');
  danger('ALTA TENSÃO\n13,8 kV',.7,x,2.4,z+.21);}
 // ---- Cabine primária e medição ----
 {const c=cabine,brick=mat('#c9b49a',0,.9);box(c.w,3.4,c.d,brick,c.x,1.7,c.z);box(c.w+.4,.18,c.d+.4,'#8a8f94',c.x,3.48,c.z,scene,.2);
  box(1.4,2.2,.06,'#6b7880',c.x-1.2,1.1,c.z+c.d/2+.03,scene,.5);for(let i=0;i<6;i++)box(1.3,.03,.02,'#4c575e',c.x-1.2,.3+i*.35,c.z+c.d/2+.07);
  for(const dx of [.6,1.8])box(.7,.45,.05,'#3d464c',c.x+dx,2.7,c.z+c.d/2+.03);
  danger('CABINE PRIMÁRIA\n13,8 kV • SÓ AUTORIZADOS',1.3,c.x-1.2,2.7,c.z+c.d/2+.07);
  const m=S.medicao;box(m.w,1.1,m.d,'#e6e9ea',m.x,1.4,m.z,scene,.2);box(.36,.2,.02,'#1b2a33',m.x,1.62,m.z+.16);box(.36,.1,.02,'#8ff0b8',m.x,1.62,m.z+.175);
  sign('MEDIÇÃO\nDISTRIBUIDORA',.9,.38,m.x,2.2,m.z+.16,'#1f5fa0');
  // Fronteira do SEP: faixa no piso diante da medição.
  const strip=box(1.4,.015,.14,'#ff8a3d',m.x,.012,m.z+.45);out.items.sepLine=strip;}
 // ---- Caminhão com cesto aéreo ----
 {const t=truck,g=new T.Group();g.position.set(t.x,0,t.z);scene.add(g);
  box(6.4,.45,2.1,'#2f3438',0,.75,0,g,.4);box(1.8,1.7,2.2,'#f2f2ec',2.2,1.75,0,g,.2);box(.06,.7,1.9,'#9fd0e6',3.12,2.1,0,g,.6);box(1.8,.1,2.2,'#f5c548',2.2,2.62,0,g);
  box(4.2,.7,2.2,'#e9e7df',-1.2,1.3,0,g,.2);for(const x of [-2.6,-.1,2.3])for(const z of [-1.05,1.05]){const w=cyl(.45,.45,.32,'#1d2427',x,.45,z,g,18);w.rotation.x=Math.PI/2;}
  for(const x of [-2.9,.4])for(const z of [-1.3,1.3]){rod([x,.9,z*.8],[x,.05,z],.06,'#d99a16',g);box(.4,.06,.4,'#3a3f44',x,.04,z,g);}
  sign('LINHA VIVA\nMANUTENÇÃO',1.6,.55,-1.2,1.35,1.11,'#d6461f','#fff',g);
  box(1.1,.6,.5,'#c9cfd2',-.4,1.95,1.0,g,.4);sign('FERRAMENTAS AT',1,.25,-.4,1.95,1.26,'#23282c','#f5c948',g);
  const turret=cyl(.45,.55,.5,'#d99a16',t.boomBase.x-t.x,1.9,0,g,16);
  out.truck={group:g};}
 const boomMat=new T.MeshStandardMaterial({color:'#f2f2ec',roughness:.5,metalness:.2});
 const boom=new T.Mesh(new T.BoxGeometry(.32,1,.32),boomMat);boom.castShadow=true;scene.add(boom);
 const boom2=new T.Mesh(new T.BoxGeometry(.22,1,.22),mat('#e6c14a',.2,.5));boom2.castShadow=true;scene.add(boom2);
 const bucket=new T.Group();scene.add(bucket);box(.9,1.05,.9,'#f5c518',0,.52,0,bucket,.1);box(.92,.08,.92,'#2b3033',0,1.06,0,bucket);
 const seat=new T.Object3D();seat.position.set(0,.05,0);bucket.add(seat);
 const stowed=new T.Vector3(truck.x+1.2,2.3,truck.z),raised=new T.Vector3(truck.bucketUp.x,truck.bucketUp.y,truck.bucketUp.z),base=new T.Vector3(truck.boomBase.x,truck.boomBase.y+.2,truck.boomBase.z);
 const tmpV=new T.Vector3(),up=new T.Vector3(0,1,0);
 function placeBoom(k){const p=tmpV.copy(stowed).lerp(raised,k);if(k>0&&k<1)p.y+=Math.sin(k*Math.PI)*1.6;bucket.position.copy(p);bucket.position.y-=.05;
  const elbow=base.clone().lerp(p,.55);elbow.y+=k*2.2+.2;
  for(const [m,a,b] of [[boom,base,elbow],[boom2,elbow,p.clone().setY(p.y+.6)]]){const dir=b.clone().sub(a);m.position.copy(a).addScaledVector(dir,.5);m.scale.set(1,dir.length(),1);m.quaternion.setFromUnitVectors(up,dir.normalize());}}
 placeBoom(0);
 out.bucket={group:bucket,seat,k:0,target:0,update(dt){this.k+=(this.target-this.k)*Math.min(1,dt*.9);if(Math.abs(this.target-this.k)<.002)this.k=this.target;placeBoom(this.k);}};
 // Mesa de planejamento do SEP, com OS e rádio.
 {const t=S.sepTable;box(t.w,.06,t.d,'#d8cfb7',t.x,.82,t.z);for(const dx of [-.7,.7])box(.06,.8,.6,'#5e666b',t.x+dx,.4,t.z);box(.42,.01,.3,'#f6f6f2',t.x-.3,.86,t.z);box(.42,.01,.3,'#fff6c8',t.x+.2,.86,t.z+.05);box(.08,.2,.06,'#23282c',t.x+.6,.95,t.z-.2);sign('OS • PROCEDIMENTO • APR',1.5,.25,t.x,1.2,t.z+.42,'#2a4a5c');}
 // Cones, fita e placas (aparecem com a sinalização do SEP).
 {const g=new T.Group();scene.add(g);const pts=[[-19.6,-10.8],[-17,-9.6],[-14.6,-11.2],[-13.4,-9.6]];
  for(const [x,z] of [[-19.6,-10.8],[-17.8,-9.8],[-16,-9.8],[-14.2,-11.2],[-4.8,-12.8],[-4.8,-10.8],[-5.6,-9.6]]){const c=new T.Group();c.position.set(x,0,z);g.add(c);cyl(.05,.2,.6,'#f07a28',0,.3,0,c);cyl(.11,.13,.08,'#f4f1e6',0,.38,0,c);box(.42,.04,.42,'#23282c',0,.02,0,c);}
  rod([-19.6,.55,-10.8],[-17.8,.55,-9.8],.012,'#f5c518',g);rod([-17.8,.55,-9.8],[-16,.55,-9.8],.012,'#f5c518',g);rod([-16,.55,-9.8],[-14.2,.55,-11.2],.012,'#f5c518',g);
  rod([-4.8,.55,-12.8],[-4.8,.55,-10.8],.012,'#f5c518',g);rod([-4.8,.55,-10.8],[-5.6,.55,-9.6],.012,'#f5c518',g);
  const s=sign('HOMENS\nTRABALHANDO',.8,.6,-5.2,.75,-11.6,'#f07a28','#111',g);s.rotation.y=Math.PI/2;
  g.visible=false;out.items.cones=g;}
 // Aterramento temporário do ramal (SEP): cabos das fases até a haste no pé do poste.
 {const g=new T.Group();scene.add(g);const x=poste.x,z=poste.z;for(let i=0;i<3;i++){const px=x-.8+i*.8;rod([px,poste.top+.32,z+.06],[x+.45,poste.top-.6,z+.3],.014,'#c79a3c',g);}
  rod([x+.45,poste.top-.6,z+.3],[x+.6,0,z+.6],.02,'#c79a3c',g);cyl(.03,.03,.6,'#b87333',x+.6,.0,z+.6,g,8);box(.12,.12,.12,'#f5c518',x+.45,poste.top-.6,z+.3,g);
  g.visible=false;out.items.sepGround=g;}
 // Coberturas isolantes na rede vizinha (SEP, etapa das zonas).
 {const g=new T.Group();scene.add(g);for(const pz of rede.phases){const c=cyl(.09,.09,3.2,'#ff7a1a',-17.8,rede.y+.12,pz,g,10);c.rotation.z=Math.PI/2;}g.visible=false;out.items.covers=g;}
 // ---- Sala elétrica de baixa tensão ----
 {const s=sala,wallMat=new T.MeshStandardMaterial({map:TX.wall,normalMap:TX.wallN,normalScale:new T.Vector2(.5,.5),color:'#d9dcd6',roughness:.7,metalness:.1});
  for(const k of ['salaBack','salaLeft','salaRight','salaFrontL','salaFrontR']){const w=S[k];box(w.w,3.2,w.d,wallMat,w.x,1.6,w.z);}
  box(1.6,.5,.2,wallMat,s.x,2.95,s.door.z);const roof=box(10.4,.16,5.6,'#9aa3a8',s.x,3.28,s.z,scene,.2);out.see.push(roof);
  box(5.6,.02,4.6,'#7e8a90',s.x,.012,s.z);
  sign('SALA ELÉTRICA • BT',2.4,.42,s.x-2.6,2.7,s.door.z+.12,'#1f5f4a');danger('ACESSO RESTRITO\nA AUTORIZADOS',.9,s.x+1.6,2.2,s.door.z+.12);
  const lamp=new T.PointLight('#fff4e0',2.6,11,1.5);lamp.position.set(s.x,2.9,s.z);scene.add(lamp);
  // Faixa amarela no piso: limite de aproximação diante dos painéis.
  box(8.4,.012,.08,'#f5c518',s.x-.4,.02,-9.25);}
 // QGBT: porta aberta no trecho do barramento.
 {const q=S.qgbt,cab=mat('#c9ced1',.35,.5);box(q.w,2.1,q.d,cab,q.x,1.05,q.z,scene,.3);
  for(const dx of [-1,0,1])box(.96,1.9,.03,'#b5bcc0',q.x+dx,1.05,q.z+q.d/2+.02,scene,.3);
  box(.9,.9,.04,'#21272b',q.x,1.3,q.z+q.d/2+.03);for(let i=0;i<3;i++)box(.82,.06,.03,'#d9864a',q.x,1.05+i*.22,q.z+q.d/2+.06,scene,.8);
  const door=box(.9,.9,.03,'#b5bcc0',q.x-.45,1.3,q.z+q.d/2+.45,scene,.3);door.rotation.y=-1.3;door.position.x=q.x-.48;
  out.items.qgbtLabel=sign('QGBT',1,.3,q.x,2.28,q.z+q.d/2+.02,'#1f2a30','#f5c948');out.items.qgbtLabelNew=sign('QGBT-2 (NOVO)',1.3,.3,q.x,2.28,q.z+q.d/2+.025,'#1f2a30','#9ef0c0');
  const arc=sign('ENERGIA INCIDENTE\n8 cal/cm² a 45 cm',.75,.32,q.x+1,1.9,q.z+q.d/2+.05,'#f07a28','#111');out.items.arcLabel=arc;
  danger('BARRAMENTO\nENERGIZADO',.55,q.x-1,1.95,q.z+q.d/2+.05);
  // Anteparo isolante sobre o barramento (Formação, etapa proteger).
  const shield=new T.Mesh(new T.BoxGeometry(1.0,1.0,.04),new T.MeshStandardMaterial({color:'#ff7a1a',transparent:true,opacity:.62,roughness:.4}));shield.position.set(q.x,1.3,q.z+q.d/2+.12);scene.add(shield);shield.visible=false;out.items.shield=shield;}
 // CCM-2 com a gaveta da bomba.
 {const c=S.ccm;box(c.w,2.1,c.d,mat('#c9ced1',.35,.5),c.x,1.05,c.z,scene,.3);
  for(let r=0;r<4;r++)for(let k=0;k<2;k++)box(1,.44,.03,(r===2&&k===0)?'#d3dade':'#b5bcc0',c.x-.52+k*1.04,.3+r*.47,c.z+c.d/2+.02,scene,.3);
  const handle=box(.08,.22,.06,'#d62d20',c.x-.52,.3+2*.47,c.z+c.d/2+.07);out.items.handle=handle;
  sign('BOMBA DE RECALQUE',.9,.16,c.x-.52,.3+2*.47+.15,c.z+c.d/2+.05,'#1f2a30','#ffffff');sign('CCM-2',.9,.3,c.x,2.28,c.z+c.d/2+.02,'#1f2a30','#f5c948');
  // Cadeado e etiqueta de bloqueio.
  const lock=new T.Group();lock.position.set(c.x-.52,.3+2*.47,c.z+c.d/2+.1);scene.add(lock);box(.1,.08,.04,'#d62d20',.05,-.14,0,lock);const sh=new T.Mesh(new T.TorusGeometry(.035,.01,6,12,Math.PI),mat('#c9d1d4',.8,.3));sh.position.set(.05,-.1,0);lock.add(sh);
  const tag=canvasPlane(.16,.26,(g,W,H)=>{g.fillStyle='#d62d20';g.fillRect(0,0,W,H);g.fillStyle='#fff';g.font=`bold ${W*.2}px Arial`;g.textAlign='center';g.fillText('PERIGO',W/2,H*.2);g.font=`bold ${W*.13}px Arial`;g.fillText('NÃO OPERE',W/2,H*.42);g.fillText('BLOQUEADO',W/2,H*.56);g.font=`${W*.11}px Arial`;g.fillText('Resp.: VOCÊ',W/2,H*.78);},256);tag.position.set(.12,-.32,.02);lock.add(tag);
  lock.visible=false;out.items.lock=lock;
  // Aterramento temporário nos bornes da gaveta.
  const ground=new T.Group();scene.add(ground);for(let i=0;i<3;i++)rod([c.x-.75+i*.18,.85,c.z+c.d/2+.08],[c.x+.6,.12,c.z+c.d/2+.35],.012,'#c79a3c',ground);box(.14,.1,.1,'#2e7d32',c.x+.6,.1,c.z+c.d/2+.35,ground);
  ground.visible=false;out.items.ground=ground;
  const tagSign=sign('NÃO ENERGIZE\nEM MANUTENÇÃO',.62,.36,c.x+.5,1.25,c.z+c.d/2+.05,'#d62d20','#fff');tagSign.visible=false;out.items.tagSign=tagSign;}
 // Banco de capacitores.
 {const b=S.capacitor;box(b.w,1.9,b.d,mat('#d5d9db',.3,.5),b.x,.95,b.z,scene,.3);for(let i=0;i<7;i++)box(.02,.06,1.2,'#7e888d',b.x-b.w/2-.01,.5+i*.16,b.z);
  const s=sign('BANCO DE\nCAPACITORES',.8,.4,b.x-b.w/2-.02,1.75,b.z,'#1f2a30','#f5c948');s.rotation.y=-Math.PI/2;
  const d=danger('ENERGIA\nARMAZENADA',.5,b.x-b.w/2-.02,1.3,b.z+.55);d.rotation.y=-Math.PI/2;}
 // Prontuário e diagrama unifilar.
 {const p=S.prontuario;box(p.w,1.6,p.d,'#8a6d4a',p.x,.8,p.z);for(let i=0;i<5;i++)box(.3,.36,.08,['#1f5fa0','#d62d20','#2f8a57','#f5c518','#5e666b'][i],p.x+.12,1.25,p.z-.5+i*.24);
  const u=canvasPlane(1.2,.8,(g,W,H)=>{g.fillStyle='#f6f6f2';g.fillRect(0,0,W,H);g.strokeStyle='#1f2a30';g.lineWidth=4;g.font='bold 34px Arial';g.fillStyle='#1f2a30';g.fillText('DIAGRAMA UNIFILAR',20,44);
   g.beginPath();g.moveTo(W/2,70);g.lineTo(W/2,150);g.stroke();g.strokeRect(W/2-40,150,80,60);g.beginPath();g.moveTo(80,250);g.lineTo(W-80,250);g.stroke();g.beginPath();g.moveTo(W/2,210);g.lineTo(W/2,250);g.stroke();
   [140,300,460,620].forEach((x,i)=>{g.beginPath();g.moveTo(x,250);g.lineTo(x,330);g.stroke();g.beginPath();g.arc(x,360,26,0,7);g.stroke();g.font='22px Arial';g.fillText(['QGBT','CCM-2','CAP.','FV'][i],x-26,420);});
   g.font='22px Arial';g.fillText('Rev. atual • aterramento TN-S',20,H-24);},768);
  u.position.set(p.x+.37,1.95,p.z);u.rotation.y=Math.PI/2;scene.add(u);
  const s=sign('PRONTUÁRIO',.9,.22,p.x+.37,2.45,p.z,'#1f5fa0');s.rotation.y=Math.PI/2;}
 // Caixa de bloqueio (cadeados e etiquetas) e extintor de CO2.
 {const l=S.lotoBox;box(l.w,.8,l.d,'#d62d20',l.x,1.4,l.z);box(l.w-.1,.6,.02,'#f6f6f2',l.x,1.4,l.z-.16);for(let i=0;i<6;i++)box(.07,.09,.03,['#d62d20','#1f5fa0','#2f8a57','#f5c518','#5e666b','#d62d20'][i],l.x-.42+i*.17,1.45,l.z-.18);
  const s=sign('BLOQUEIO',.9,.2,l.x,1.95,l.z-.17,'#d62d20');s.rotation.y=Math.PI;
  const e=S.extintor;cyl(.12,.12,.6,'#c62b20',e.x,.62,e.z,scene,14);cyl(.04,.04,.16,'#23282c',e.x,1.0,e.z,scene,8);rod([e.x,1.0,e.z],[e.x+.15,.75,e.z-.12],.025,'#23282c');const es=sign('CO₂',.3,.18,e.x,1.25,e.z-.15,'#c62b20');es.rotation.y=Math.PI;}
 // Fogo e fumaça no banco de capacitores (Reciclagem).
 {const g=new T.Group();g.position.set(S.capacitor.x-.4,1.95,S.capacitor.z);scene.add(g);const flames=[],smoke=[];
  for(let i=0;i<9;i++){const f=glowSprite(i%3===0?'#fff1a8':i%2?'#ffb02e':'#ff5a14',.7);f.userData.seed=Math.random()*6;g.add(f);flames.push(f);}
  for(let i=0;i<14;i++){const p=new T.Sprite(new T.SpriteMaterial({map:particleTextures.puff,color:'#2e3236',transparent:true,depthWrite:false,opacity:0}));p.userData.seed=i/14;g.add(p);smoke.push(p);}
  const light=new T.PointLight('#ff7a2a',0,6,1.6);light.position.set(0,.4,0);g.add(light);
  g.visible=false;out.items.fire={group:g,update(t,on){g.visible=on;if(!on)return;flames.forEach((f,i)=>{const k=Math.sin(t*9+f.userData.seed)*.5+.5;f.position.set(Math.sin(i*2)*.18,.1+k*.35+(i%3)*.12,Math.cos(i*2)*.18);f.scale.setScalar(.55+k*.45);});
   smoke.forEach(p=>{const k=(t*.35+p.userData.seed)%1;p.position.set(Math.sin(p.userData.seed*20)*.3+k*.4,.3+k*2.6,Math.cos(p.userData.seed*15)*.3);p.scale.setScalar(.6+k*2.2);p.material.opacity=.9*(1-k);});light.intensity=4+Math.sin(t*14)*1.2;}};}
 // ---- Galpão de produção com a furadeira ----
 {for(const k of ['galA','galB','galC','galD']){const p=S[k];box(p.w,4.6,p.d,'#8e979c',p.x,2.3,p.z,scene,.4);}
  // Galpão sem telhado (estrutura aberta), para o jogador enxergar a furadeira e a equipe: só as vigas do contorno.
  for(const z of [1.5,9.5])box(10.4,.18,.18,'#8e979c',16,4.55,z,scene,.4);for(const x of [11,21])box(.18,.18,8.4,'#8e979c',x,4.55,5.5,scene,.4);
  box(9.6,.012,6.4,'#9aa2a2',16,.01,5.6);sign('GALPÃO DE PRODUÇÃO',2.6,.42,16,4.15,1.62,'#2a4a5c');
  const f=S.furadeira;box(.8,.12,.8,'#3c4a55',f.x,.06,f.z,scene,.4);box(.6,.6,.5,'#2f6f8f',f.x,.42,f.z,scene,.3);cyl(.07,.07,1.6,'#9aa4a8',f.x,1.3,f.z-.15,scene,10);box(.42,.42,.6,'#2f6f8f',f.x,2.0,f.z,scene,.3);cyl(.02,.02,.3,'#c9d1d4',f.x,1.62,f.z+.12,scene,8);box(.5,.04,.5,'#5b6770',f.x,1.15,f.z+.08,scene,.5);
  sign('FURADEIRA',.6,.16,f.x,2.35,f.z+.31,'#2a4a5c');
  const t=S.torno;box(t.w,.9,t.d,'#2f6f8f',t.x,.45,t.z,scene,.3);box(t.w-.2,.3,.3,'#9aa4a8',t.x,1.05,t.z,scene,.5);
  const q=S.qdGalpao;box(q.w,1,q.d,'#c9ced1',q.x,1.3,q.z,scene,.3);sign('QD GALPÃO',.7,.18,q.x,1.95,q.z+.16,'#1f2a30','#f5c948');
  // Faíscas na carcaça energizada (Formação, etapa do choque).
  const sparks=[];const sg=new T.Group();sg.position.set(f.x,1.1,f.z+.3);scene.add(sg);for(let i=0;i<10;i++){const p=glowSprite('#9fe7ff',.18);p.userData.seed=Math.random()*6;sg.add(p);sparks.push(p);}
  const sl=new T.PointLight('#9fdcff',0,5,1.8);sg.add(sl);sg.visible=false;
  out.items.sparks={group:sg,update(t,on){sg.visible=on;if(!on)return;sparks.forEach((p,i)=>{const k=(t*3+p.userData.seed)%1;p.position.set(Math.sin(p.userData.seed*9)*.25*k,Math.cos(i)*.15+k*.2,Math.cos(p.userData.seed*7)*.25*k);p.material.opacity=1-k;p.scale.setScalar(.08+(1-k)*.14);});sl.intensity=Math.random()<.4?3.5:.6;}};}
 // ---- Estacionamento com geração fotovoltaica, inversor e string box ----
 {for(const k of ['cpA','cpB','cpC','cpD']){const p=S[k];box(p.w,3.2,p.d,'#9aa4a8',p.x,1.6,p.z,scene,.5);}
  const pv=canvasPlane(8.6,5.8,(g,W,H)=>{g.fillStyle='#1a2c4a';g.fillRect(0,0,W,H);g.strokeStyle='#c9d1d4';g.lineWidth=3;for(let x=0;x<=W;x+=W/8){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}for(let y=0;y<=H;y+=H/4){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}g.strokeStyle='#2c4670';g.lineWidth=1;for(let x=0;x<W;x+=W/48){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}},1024);
  pv.material.metalness=.5;pv.material.roughness=.25;pv.rotation.x=-Math.PI/2+.18;pv.position.set(19,3.35,-7.2);pv.castShadow=true;scene.add(pv);out.see.push(pv);
  const car=S.car;box(car.w,.7,car.d,'#4f7fa8',car.x,.55,car.z,scene,.4);box(car.w*.55,.55,car.d-.1,'#9fd0e6',car.x-.2,1.15,car.z,scene,.5);for(const dx of [-1.4,1.4])for(const dz of [-.9,.9]){const w=cyl(.3,.3,.2,'#1d2427',car.x+dx,.3,car.z+dz,scene,14);w.rotation.x=Math.PI/2;}
  const inv=S.inversor;box(inv.w,2.2,inv.d,'#8e979c',inv.x,1.1,inv.z-.05,scene,.4);box(.6,.75,.2,'#f2f2ec',inv.x+.4,1.45,inv.z+.18,scene,.2);box(.5,.5,.18,'#7e888d',inv.x-.4,1.3,inv.z+.18,scene,.3);
  sign('INVERSOR',.55,.14,inv.x+.4,1.95,inv.z+.29,'#1f2a30','#ffffff');sign('STRING BOX • CC',.6,.14,inv.x-.4,1.68,inv.z+.28,'#1f2a30','#f5c948');
  danger('DUAS FONTES\nREDE + SOLAR',.6,inv.x,.55,inv.z+.2);
  rod([inv.x-.4,1.55,inv.z+.1],[inv.x-.4,3.1,inv.z+.1],.035,'#3a3f44');rod([inv.x-.4,3.1,inv.z+.1],[15.2,3.2,-7.2],.035,'#3a3f44');}
 // ---- Bancada de EPI, armário de ferramentas e escadas ----
 {const b=S.bancada;box(b.w,.08,b.d,'#d8cfb7',b.x,.85,b.z);for(const dx of [-1.3,1.3])box(.08,.85,.7,'#5e666b',b.x+dx,.42,b.z);
  for(const dx of [-1.1,-.6])sphere(.15,'#f2f2ec',b.x+dx,1.0,b.z-.1);for(const dx of [-.1,.3]){box(.14,.05,.32,'#1b1b1b',b.x+dx,.92,b.z+.1);box(.14,.02,.08,'#d62d20',b.x+dx,.95,b.z-.08);}
  box(.5,.06,.36,'#355e8a',b.x+.85,.92,b.z);sign('EPI • VESTIMENTA ANTICHAMA',2.4,.36,b.x,1.7,b.z-.3,'#8f5a10','#fff');rod([b.x-1.2,.8,b.z-.35],[b.x-1.2,1.9,b.z-.35],.03,'#7a858b');rod([b.x+1.2,.8,b.z-.35],[b.x+1.2,1.9,b.z-.35],.03,'#7a858b');
  // Arara com o conjunto antichama.
  rod([b.x-1.9,0,b.z],[b.x-1.9,1.8,b.z],.03,'#7a858b');box(.5,.9,.12,'#355e8a',b.x-1.9,1.25,b.z+.1);
  const f=S.ferramentas;box(f.w,1.7,f.d,'#2f5f7f',f.x,.85,f.z,scene,.3);box(f.w-.1,1.1,.02,'#c9cfd2',f.x,1.15,f.z+f.d/2+.01);for(let i=0;i<5;i++)box(.05,.3,.03,['#d62d20','#f5c518','#d62d20','#1f5fa0','#f5c518'][i],f.x-.5+i*.25,1.25,f.z+f.d/2+.03);box(.12,.22,.06,'#f5c518',f.x+.45,.85,f.z+f.d/2+.03);
  sign('FERRAMENTAS ISOLADAS',1.3,.22,f.x,1.85,f.z+f.d/2+.02,'#1f2a30','#f5c948');
  const e=S.escadas;box(e.w,1.6,.08,'#7a858b',e.x,.8,e.z-.2);const al=box(.4,2.6,.06,'#c9cfd2',e.x-.4,1.3,e.z+.05,scene,.7);al.rotation.z=.08;const fb=box(.4,2.6,.06,'#f5c518',e.x+.4,1.3,e.z+.05);fb.rotation.z=-.08;
  sign('ESCADAS',.9,.2,e.x,2.75,e.z,'#2a4a5c');sign('ALUMÍNIO',.36,.1,e.x-.4,.6,e.z+.1,'#5e666b');sign('FIBRA',.36,.1,e.x+.4,.6,e.z+.1,'#8f5a10');}
 // ---- Área de treinamento: quadro e painel didático ----
 const boardCanvas=document.createElement('canvas');boardCanvas.width=1024;boardCanvas.height=512;const boardTex=new T.CanvasTexture(boardCanvas);boardTex.colorSpace=T.SRGBColorSpace;
 {const b=S.board;rod([b.x-1.1,0,b.z],[b.x-1.1,2.6,b.z],.05,'#6b747a');rod([b.x+1.1,0,b.z],[b.x+1.1,2.6,b.z],.05,'#6b747a');
  const m=new T.Mesh(new T.PlaneGeometry(2.3,1.15),new T.MeshStandardMaterial({map:boardTex,roughness:.7,emissive:'#ffffff',emissiveMap:boardTex,emissiveIntensity:.3}));m.position.set(b.x,1.9,b.z+.17);scene.add(m);box(2.4,1.25,.08,'#3a4349',b.x,1.9,b.z+.1);
  const d=S.didatico;const dp=canvasPlane(1.3,1.1,(g,W,H)=>{g.fillStyle='#10303f';g.fillRect(0,0,W,H);g.fillStyle='#f5c948';g.font='bold 44px Arial';g.fillText('CORRENTE NO CORPO',24,60);
   const rows=[['≈ 1 mA','percepção (formigamento)','#8ff0b8'],['≈ 10 mA','pode não conseguir soltar','#ffd166'],['30 mA','limite do DR de proteção','#ffd166'],['dezenas de mA','pelo tórax: fibrilação','#ff8a6b']];
   rows.forEach(([a,b,c],i)=>{g.fillStyle=c;g.font='bold 40px Arial';g.fillText(a,24,150+i*140);g.fillStyle='#e8f1f5';g.font='34px Arial';g.fillText(b,24,200+i*140);});g.fillStyle='#9fb6c2';g.font='26px Arial';g.fillText('Ordem de grandeza • IEC 60479',24,H-24);},640);
  dp.position.set(d.x,1.6,d.z+.17);scene.add(dp);box(1.4,1.2,.08,'#3a4349',d.x,1.6,d.z+.1);rod([d.x,0,d.z],[d.x,1,d.z],.05,'#6b747a');
  for(const k of ['benchA','benchB']){const bb=S[k];box(bb.w,.08,bb.d,'#9a7b52',bb.x,.42,bb.z);for(const dx of [-.8,.8])box(.08,.42,.4,'#5e666b',bb.x+dx,.21,bb.z);}
  sign('ÁREA DE TREINAMENTO NR 10',2.6,.36,b.x+1.3,2.85,b.z,'#2f6f5a','#fff');}
 out.board={draw(info){const g=boardCanvas.getContext('2d');g.fillStyle='#10303f';g.fillRect(0,0,1024,512);g.fillStyle='#f5c948';g.fillRect(0,0,1024,78);g.fillStyle='#10303f';g.font='bold 48px Arial';g.textAlign='left';g.fillText('NR 10 • '+info.module.toUpperCase()+' • '+info.course,26,56,972);
  g.fillStyle='#ffffff';g.font='bold 46px Arial';g.fillText(info.clock+'  •  '+info.title,30,160,964);g.fillStyle='#cfe3ee';g.font='34px Arial';
  g.fillText('Circuito: '+info.circuit,30,240,964);g.fillText('Estado: '+info.state,30,300,964);g.fillStyle='#ffd166';g.fillText('Zonas (Anexo II): até 1 kV  Rr 0,20 m • Rc 0,70 m',30,380,964);g.fillText('13,8 kV  Rr 0,38 m • Rc 1,38 m',30,440,964);boardTex.needsUpdate=true;}};
 // ---- Mesa de ordens de serviço (Formação e Reciclagem) ----
 {const d=S.osDesk;box(d.w,.06,d.d,'#d8cfb7',d.x,.8,d.z);for(const dx of [-.8,.8])box(.06,.78,.7,'#5e666b',d.x+dx,.39,d.z);box(.42,.01,.3,'#f6f6f2',d.x-.3,.84,d.z);box(.42,.01,.3,'#fff6c8',d.x+.25,.84,d.z+.05);box(.3,.2,.02,'#23282c',d.x+.5,.95,d.z-.25);
  sign('ORDENS DE SERVIÇO',1.5,.28,d.x,1.25,d.z-.42,'#2a4a5c');}
 // ---- Árvores e muro ----
 function tree(x,z,s=1){const g=new T.Group();g.position.set(x,0,z);scene.add(g);cyl(.2*s,.28*s,3*s,'#5b4632',0,1.5*s,0,g,10);
  const foliage=new T.Group();foliage.position.y=3*s;g.add(foliage);for(const [dx,dy,dz,r,c] of [[0,.8,0,1.5,'#4f7a3f'],[.9,.1,.3,1.1,'#5a8845'],[-.9,.2,-.2,1.15,'#476f39'],[.1,1.6,.2,.95,'#5f9148']])sphere(r*s,c,dx*s,dy*s,dz*s,foliage);
  out.trees.push({g,foliage,seed:Math.random()*6});return g;}
 for(const k of ['tree1','tree2','tree3'])tree(S[k].x,S[k].z,1.1);
 for(const [x,z,s] of [[-24,6,1.3],[29,-4,1.4],[-25,-9,1.2],[29,9,1.2],[8,15.5,1.3],[-10,15,1.1]])tree(x,z,s);
 out.mats=mats;out.box=box;out.cyl=cyl;out.sphere=sphere;out.rod=rod;out.sign=sign;out.mat=mat;
 return out;
}
