import * as T from './three.module.js';
import {findRoute,walkableGrid,phaseOf} from './crew.mjs';
import {loadCharacterBase,createCharacter} from './characters.mjs';
import {createRenderPipeline,detectHardware,savedQuality,QUALITY,makeTextures,createRain,updateRain,createBolt,strikeBolt,updateBolt} from './graphics.mjs';
import {MODULES,MODULE_IDS,objectivesOf,initialState,interact,answer,canMove,currentTarget,indexOf,refSummary,KINDS,NOVA_NR10,weather,thunderDistance,inDangerRange,circuit,hazards,radii,zoneOf,ZONE_LABEL} from './rules.mjs';
import {staticObstacles,playerStart,rosters,people,live,rede,truck} from './layout.mjs';
import {buildScenery} from './scenery.mjs';
const $=id=>document.getElementById(id);
let renderer;
try{renderer=new T.WebGLRenderer({antialias:true,powerPreference:'high-performance'});}catch(e){$('loading').textContent='Não foi possível iniciar o 3D. Ative a aceleração gráfica do navegador e recarregue.';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;$('game').appendChild(renderer.domElement);$('loading').textContent='Carregando personagens…';
let charBase;try{charBase=await loadCharacterBase({anim:'models/Xbot.glb',male:'models/worker-m.glb',female:'models/worker-f.glb'});}catch(e){$('loading').textContent='Não foi possível carregar os personagens (pasta models). Verifique se ela foi publicada.';throw e;}$('loading').remove();
const scene=new T.Scene();scene.background=new T.Color('#bcd5e6');scene.fog=new T.Fog('#bcd5e6',48,100);
// Câmera em terceira pessoa a 45°, logo atrás e acima do jogador.
const camera=new T.PerspectiveCamera(52,innerWidth/innerHeight,.1,240);const look=new T.Vector3(playerStart.x,0,playerStart.z);const camOffset=new T.Vector3(0,10.8,10.8);let camDist=1;
const hemi=new T.HemisphereLight(0xdcecff,0x6f6a5e,.9);scene.add(hemi);
const sun=new T.DirectionalLight(0xfff0d8,2.3);sun.position.set(-9,20,5);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-20,right:20,top:20,bottom:-20,near:1,far:80});sun.shadow.radius=4;sun.shadow.bias=-.0003;sun.shadow.normalBias=.035;scene.add(sun);scene.add(sun.target);
const fill=new T.DirectionalLight(0xb7dcff,1.1);fill.position.set(10,7,-4);scene.add(fill);
const TX=makeTextures();const SC=buildScenery(scene,TX);
const obstacles=[...staticObstacles];const grid=walkableGrid(obstacles);
const SINGLE=MODULE_IDS.length===1;
let moduleId=MODULE_IDS.includes(location.hash.slice(1))?location.hash.slice(1):MODULE_IDS[0];
let state=initialState(moduleId),paused=true,muted=true,audio,rainGain,time=0,toastTimer,elapsed=0,finished=false,missionCollapsed=innerWidth<600;const keys=new Set();
const done=id=>state.completed.includes(id);
const objectives=()=>objectivesOf(state.module);
// Tudo o que fica entre a câmera e o jogador (ou o destino atual) fica translúcido.
const sceneryMeshes=[];scene.traverse(m=>{if(m.isMesh&&!(m.geometry.type==='PlaneGeometry'&&m.rotation.x!==0)&&m.geometry.type!=='CircleGeometry'){const b=new T.Box3().setFromObject(m);if(b.max.y>.6&&b.max.y-b.min.y>.12&&b.max.y-b.min.y<12)sceneryMeshes.push(m);}});
for(const m of SC.see)if(!sceneryMeshes.includes(m))sceneryMeshes.push(m);
const faded=new Map(),ray=new T.Raycaster();let fadeTick=0;
function updateSeeThrough(dt,points){if(++fadeTick%3===0){const hits=new Set();for(const p of points){const to=new T.Vector3(p.x,p.y,p.z),dir=to.clone().sub(camera.position),len=dir.length();ray.set(camera.position,dir.normalize());ray.far=len-.4;for(const h of ray.intersectObjects(sceneryMeshes,false))hits.add(h.object);}
 for(const m of hits)if(!faded.has(m)){m.material=m.material.clone();m.material.transparent=true;faded.set(m,{o:1,hit:true});}for(const [m,f] of faded)f.hit=hits.has(m);}
 for(const [m,f] of faded){f.o+=((f.hit?.22:1)-f.o)*Math.min(1,dt*8);m.material.opacity=f.o;m.material.depthWrite=f.o>.95;}}
// ---- Jogador ----
const player=new T.Group();scene.add(player);player.position.set(playerStart.x,0,playerStart.z);
const playerChar=createCharacter(charBase,{body:'male',surface:'#1f4e79',pants:'#22303d',skin:'#d9a97a',helmet:'#f2f2ec',helmetStripe:'#1f4e79',vest:null,gloves:'#1b1b1b',boots:'#3a2a1f',backLabel:{text:'ELETRICISTA',bg:'#1f4e79'},glow:.06});player.add(playerChar.group);
let playerMove={speed:0,turn:0},playerAction=null;
function navigationDiamond(color){const g=new T.Group();const mesh=new T.Mesh(new T.OctahedronGeometry(.32,0),new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.65,flatShading:true,roughness:.28,toneMapped:false,depthTest:false}));mesh.scale.set(.82,1.65,.82);mesh.renderOrder=20;g.add(mesh);const outline=new T.LineSegments(new T.EdgesGeometry(mesh.geometry),new T.LineBasicMaterial({color:'#12322d',transparent:true,opacity:.7,depthTest:false}));outline.scale.copy(mesh.scale);outline.renderOrder=21;g.add(outline);return g;}
const playerDiamond=navigationDiamond('#66ff38');playerDiamond.scale.setScalar(.55);playerDiamond.position.y=2.3;player.add(playerDiamond);
const marker=new T.Group();scene.add(marker);const diamond=navigationDiamond('#25ddff');marker.add(diamond);
const targetRing=new T.Group();scene.add(targetRing);
function navigationRing(inner,outer,color,order){const r=new T.Mesh(new T.RingGeometry(inner,outer,64),new T.MeshBasicMaterial({color,side:T.DoubleSide,transparent:true,opacity:1,toneMapped:false,depthTest:false,depthWrite:false}));r.rotation.x=-Math.PI/2;r.renderOrder=order;targetRing.add(r);return r;}
navigationRing(.7,1.12,'#073547',9).material.opacity=.15;navigationRing(.78,.99,'#20deff',10).material.opacity=.38;navigationRing(.76,.80,'#ffffff',11).material.opacity=.3;const targetPulse=navigationRing(1.05,1.1,'#32dfff',9);
for(let i=0;i<4;i++){const arrow=new T.Mesh(new T.ConeGeometry(.16,.35,3),new T.MeshBasicMaterial({color:'#c2faff',depthTest:false,toneMapped:false}));const a=i*Math.PI/2;arrow.position.set(Math.cos(a)*.61,.03,Math.sin(a)*.61);arrow.rotation.z=Math.PI/2;arrow.rotation.y=-a;arrow.renderOrder=12;targetRing.add(arrow);}
const tether=new T.Line(new T.BufferGeometry().setFromPoints([new T.Vector3(0,-2.4,0),new T.Vector3(0,-.6,0)]),new T.LineDashedMaterial({color:'#54eeff',dashSize:.13,gapSize:.12,transparent:true,opacity:.8,depthTest:false}));tether.computeLineDistances();marker.add(tether);
// ---- Zonas do Anexo II em volta das partes energizadas ----
const zoneMeshes=new Map();
function zoneMat(color,opacity){return new T.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,side:T.DoubleSide,toneMapped:false});}
for(const [key,h] of Object.entries(live)){
 const {rr,rc}=radii(h.kv),g=new T.Group();g.visible=false;scene.add(g);
 if(h.line){for(const pz of rede.phases){for(const [r,c,o] of [[rc,'#ffd23f',.07],[rr,'#ff3b2a',.22]]){const t=new T.Mesh(new T.CylinderGeometry(r,r,60,20,1,true),zoneMat(c,o));t.rotation.z=Math.PI/2;t.position.set(-4,rede.y+.12,pz);g.add(t);}}}
 else if(h.y>3){for(const [r,c,o] of [[rc,'#ffd23f',.12],[rr,'#ff3b2a',.3]]){const s=new T.Mesh(new T.SphereGeometry(r,24,16),zoneMat(c,o));s.position.set(h.x,h.y,h.z);g.add(s);}}
 else{const disc=new T.Mesh(new T.CircleGeometry(rr,40),zoneMat('#ff3b2a',.55));const ring=new T.Mesh(new T.RingGeometry(rr,rc,48),zoneMat('#ffd23f',.4));const edge=new T.Mesh(new T.RingGeometry(rc-.03,rc,64),zoneMat('#ffd23f',.85));
  for(const m of [disc,ring,edge]){m.rotation.x=-Math.PI/2;m.position.set(h.x,.03,h.z);m.renderOrder=6;g.add(m);}}
 zoneMeshes.set(key,g);}
const liveKey=new Map(Object.entries(live).map(([k,v])=>[v,k]));
// Distância (m) do corpo do jogador à parte energizada: segmento vertical de 0,1 a 1,8 m, menos 0,25 m do raio do corpo.
function distanceTo(h,p){
 const segY=Math.max(.1,Math.min(1.8,h.y));
 if(h.line){let best=Infinity;for(const pz of rede.phases)best=Math.min(best,Math.hypot(p.z-pz,segY-(rede.y+.12)));return Math.max(0,best-.25);}
 return Math.max(0,Math.hypot(p.x-h.x,p.z-h.z,segY-h.y)-.25);}
// ---- Equipe ----
const looks={
 Helena:{body:'female',surface:'#f2f2ec',pants:'#2f3a4a',shoes:'#2b2622',skin:'#c68642',helmet:'#f2f2ec',helmetStripe:'#1f5fa0',vest:null,gloves:null,backLabel:{text:'ENGENHARIA',bg:'#1f5fa0'}},
 Rogério:{body:'male',surface:'#1f4e79',pants:'#22303d',shoes:'#2b2622',skin:'#8d5524',beard:true,helmet:'#f2f2ec',vest:null,gloves:'#1b1b1b',backLabel:{text:'ELETRICISTA',bg:'#1f4e79'}},
 Lúcia:{body:'female',surface:'#1f4e79',pants:'#22303d',shoes:'#2b2622',skin:'#e0ac69',helmet:'#f2f2ec',vest:null,gloves:'#1b1b1b',backLabel:{text:'ELETRICISTA',bg:'#1f4e79'}},
 Bruno:{body:'male',surface:'#2c5f8a',pants:'#22303d',shoes:'#2b2622',skin:'#f1c27d',helmet:'#f2f2ec',vest:null,gloves:'#d8d2c0',backLabel:{text:'ELETRICISTA',bg:'#2c5f8a'}},
 Paula:{body:'female',surface:'#e9e4d6',pants:'#31455a',shoes:'#2b2622',skin:'#8d5524',helmet:'#2f8a57',vest:'#ed8b32',gloves:null,backLabel:{text:'SEGURANÇA',bg:'#1f5f4a'}},
 Jair:{body:'male',surface:'#7a8a6a',pants:'#3b4a5a',shoes:'#2b2622',skin:'#c68642',helmet:'#e8aa21',vest:null,gloves:'#6b5a3e',backLabel:{text:'PRODUÇÃO',bg:'#3a3f45'}}
};
const NAMES=Object.keys(people);
const workers=NAMES.map((name,i)=>{
 const rig=new T.Group();scene.add(rig);
 const char=createCharacter(charBase,{...looks[name]});rig.add(char.group);
 const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=112;const tex=new T.CanvasTexture(labelCanvas);tex.colorSpace=T.SRGBColorSpace;const label=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false}));label.scale.set(2.6,.57,1);label.position.set(0,2.2,0);rig.add(label);
 return {name,role:people[name].role,rig,char,label,labelCanvas,tex,labelText:'',phase:null,route:[],stride:i,speed:2.5+i*.08,arrived:false,mounted:false};});
const byName=n=>workers.find(w=>w.name===n);
const TONE={info:['#f5d777','#142c39e8'],alerta:['#ffb36b','#3a2a12e8'],perigo:['#ff8f7a','#4a1712ee'],ok:['#9ef0c0','#123a2ae8']};
function setLabel(w,sub,tone){const text=sub+tone;if(w.labelText===text)return;w.labelText=text;const [color,bg]=TONE[tone]||TONE.info;const c=w.labelCanvas.getContext('2d');c.clearRect(0,0,512,112);c.fillStyle=bg;c.fillRect(0,0,512,112);c.textAlign='center';c.fillStyle=color;c.font='bold 33px Arial';c.fillText(w.name+' · '+w.role,256,44);c.fillStyle='#ffffff';c.font='25px Arial';c.fillText(sub,256,84,490);w.tex.needsUpdate=true;}
function walkAlong(w,dt){let budget=w.speed*dt,moving=false;while(budget>0&&w.route.length){const p=w.route[0],dx=p.x-w.rig.position.x,dz=p.z-w.rig.position.z,d=Math.hypot(dx,dz);if(d<.01){w.route.shift();continue;}const step=Math.min(budget,d);w.rig.position.x+=dx/d*step;w.rig.position.z+=dz/d*step;budget-=step;const angle=Math.atan2(dx,dz);w.rig.rotation.y+=Math.atan2(Math.sin(angle-w.rig.rotation.y),Math.cos(angle-w.rig.rotation.y))*.25;moving=true;if(step===d)w.route.shift();}return moving;}
const facePlayer=(w,k=.08)=>{const a=Math.atan2(player.position.x-w.rig.position.x,player.position.z-w.rig.position.z);w.rig.rotation.y+=Math.atan2(Math.sin(a-w.rig.rotation.y),Math.cos(a-w.rig.rotation.y))*k;};
const turnTo=(w,a,k=.12)=>{w.rig.rotation.y+=Math.atan2(Math.sin(a-w.rig.rotation.y),Math.cos(a-w.rig.rotation.y))*k;};
function placeWorkers(){for(const w of workers){const r=rosters[state.module][w.name];w.rig.position.set(r.x,0,r.z);w.rig.rotation.y=r.angle;w.phase=null;w.route=[];w.arrived=false;w.mounted=false;w.char.setPose('none');}SC.bucket.k=0;SC.bucket.target=0;}
const seatWorld=new T.Vector3();
function updateWorkers(dt){
 let anyMounted=false;
 for(const w of workers){
  const ph=phaseOf(state.module,w.name,state);const key=ph.key+ph.label+(ph.mount?'M':'');
  if(w.phase!==key){w.phase=key;w.arrived=false;w.route=[];
   if(ph.mount){w.mounted=true;}
   else{if(w.mounted){w.mounted=false;w.rig.position.set(-13.6,0,-11.3);}w.route=findRoute(w.rig.position,ph.at,obstacles,grid);}}
  setLabel(w,ph.label,ph.tone);
  w.stride+=dt;let pose='none',speed=0;const extra={};const before=w.rig.rotation.y;
  if(w.mounted){anyMounted=true;SC.bucket.seat.getWorldPosition(seatWorld);w.rig.position.copy(seatWorld);turnTo(w,-Math.PI/2,.2);pose=SC.bucket.k>.95?ph.pose:'none';if(pose==='inspect')extra.work=1;}
  else{w.rig.position.y=0;const moving=walkAlong(w,dt);
   if(moving){speed=w.speed;}
   else{w.arrived=true;pose=ph.pose;if(['inspect','repair','push','wipe','cones'].includes(pose))extra.work=pose==='wipe'?2:1;
    if(ph.tone==='alerta'&&!['reach','wipe','repair'].includes(pose))facePlayer(w,.06);else turnTo(w,ph.angle,.08);
    if(pose==='reach'&&ph.tone==='perigo'){extra.wave=1;}}}
  extra.turn=(w.rig.rotation.y-before)/Math.max(dt,.001);
  w.char.setPose(pose);w.char.update(dt,speed,extra);
  // Tremor de quem está preso ao circuito.
  if(ph.key==='choque'){w.char.group.position.x=Math.sin(time*60)*.015;}else w.char.group.position.x=0;}
 SC.bucket.target=anyMounted?1:0;SC.bucket.update(dt);
}
const present=()=>workers.length;
// ---- Objetos que mudam com o andamento ----
function updateItems(){
 const m=state.module,d=done,cur=currentTarget(state)?.id,I=SC.items;
 const formacaoActive=m==='formacao'&&!d('reenergizar');
 I.lock.visible=formacaoActive&&d('bloquear');I.ground.visible=formacaoActive&&d('aterrar');I.shield.visible=formacaoActive&&d('proteger');I.tagSign.visible=formacaoActive&&d('sinalizar');
 I.handle.rotation.z=m==='formacao'&&d('seccionar')&&!d('reenergizar')?Math.PI/2:0;
 I.cones.visible=m==='sep'&&d('sinalizacao')&&!state.finished;I.sepGround.visible=m==='sep'&&d('aterramento')&&!d('liberacao');I.covers.visible=m==='sep'&&d('zonas')&&!d('liberacao');
 const open=m==='sep'&&d('manobra')&&!d('liberacao');I.fuses.forEach(f=>{f.rotation.x=open?-1.1:0;f.position.y=open?-.12:0;});
 I.sepLine.visible=m==='sep';I.qgbtLabel.visible=m!=='reciclagem';I.qgbtLabelNew.visible=m==='reciclagem';I.arcLabel.visible=m!=='formacao';
 return {fire:m==='reciclagem'&&cur==='incendio',sparks:m==='formacao'&&cur==='choque'};
}
// ---- Clima (tempestade só no SEP) ----
const skyDay=new T.Color('#bcd5e6'),skyStorm=new T.Color('#2e3946'),tmp=new T.Color();
const WX={dark:0,rain:0,wind:0,wet:0};
const rain=createRain(scene,2600);const bolt=createBolt(scene);
let flash=0,nextStrike=0,thunder=null,lastStep=-1;
function strike(wx){const dist=6+wx.thunderDelay*2.6;strikeBolt(bolt,player.position.x+(Math.random()-.5)*26,Math.max(-34,player.position.z-dist));flash=1;thunder={t0:time,delay:wx.thunderDelay,rumbled:false};}
function thunderSound(delay){if(muted||!audio)return;const len=audio.sampleRate*2.6,b=audio.createBuffer(1,len,audio.sampleRate),dd=b.getChannelData(0);let last=0;for(let i=0;i<len;i++){last=(last+.02*(Math.random()*2-1))/1.02;dd[i]=last*6*Math.exp(-i/len*2.4);}const s=audio.createBufferSource();s.buffer=b;const f=audio.createBiquadFilter();f.type='lowpass';f.frequency.value=260;const g=audio.createGain();g.gain.value=delay<5?1.2:.6;s.connect(f).connect(g).connect(audio.destination);s.start();}
function updateWeather(dt){
 const wx=weather(state.module,state.step),k=Math.min(1,dt*.55);
 for(const key of ['dark','rain','wind'])WX[key]+=(wx[key]-WX[key])*k;WX.wet+=(Math.min(1,wx.rain*1.3)-WX.wet)*Math.min(1,dt*(wx.rain>WX.wet?.5:.08));
 tmp.copy(skyDay).lerp(skyStorm,WX.dark);scene.background.copy(tmp);scene.fog.color.copy(tmp);scene.fog.near=48-WX.dark*30;scene.fog.far=100-WX.dark*50-WX.rain*15;
 sun.intensity=2.3*(1-WX.dark*.9)+flash*3;hemi.intensity=.9*(1-WX.dark*.7)+.1+flash*1.6;fill.intensity=1.1*(1-WX.dark)+flash*1.2;renderer.toneMappingExposure=.95-WX.dark*.1+flash*.4;
 sun.position.set(look.x-12,19,look.z+8);sun.target.position.set(look.x,0,look.z);
 for(const m of SC.groundMats){if(!m.userData.r0){m.userData.r0=m.roughness;m.userData.c0=m.color.clone();}m.roughness=m.userData.r0*(1-WX.wet*.6);m.color.copy(m.userData.c0).multiplyScalar(1-WX.wet*.25);}
 SC.puddles.forEach((p,i)=>{p.material.opacity=Math.max(0,Math.min(.8,(WX.wet-.25-i*.03)*1.6));});
 updateRain(rain,dt,WX.rain,WX.wind,look);
 SC.trees.forEach(t=>{t.foliage.rotation.z=Math.sin(time*1.4+t.seed)*(.012+WX.wind*.08);t.foliage.rotation.x=Math.sin(time*1.1+t.seed*2)*(.008+WX.wind*.04);});
 if(state.step!==lastStep){lastStep=state.step;nextStrike=time+1.2;if(wx.thunderDelay==null)thunder=null;}
 if(wx.thunderDelay!=null&&!finished&&time>=nextStrike){strike(wx);nextStrike=time+8;}
 if(thunder&&!thunder.rumbled&&time>=thunder.t0+thunder.delay){thunder.rumbled=true;thunderSound(thunder.delay);}
 flash=Math.max(0,flash-dt*3.2);updateBolt(bolt,dt);$('flash').style.opacity=String(Math.min(.65,flash*.6));$('storm-dim').style.opacity=String(Math.min(.55,WX.dark*.5));
 if(rainGain)rainGain.gain.setTargetAtTime(muted||paused||finished?0:WX.rain*.22,audio.currentTime,.3);
 return wx;
}
// ---- Painel elétrico: circuito em trabalho e zona do jogador ----
const fmtM=v=>v.toFixed(2).replace('.',',');
const fmtKV=c=>c.kv>=1?String(c.kv).replace('.',',')+' kV':Math.round(c.kv*1000)+' V'+(c.dc?' cc':'');
const hud={};let zoneNow='livre';
function setText(id,v){if(hud[id]!==v){hud[id]=v;$(id).textContent=v;}}
function updateEpHud(wx){
 const c=circuit(state);setText('ep-clock',wx.clock);setText('ep-kv',fmtKV(c));setText('ep-name',c.name);setText('ep-state',c.state);if(hud.tone!==c.tone){hud.tone=c.tone;$('ep-state').className=c.tone;$('ep').style.borderTopColor={perigo:'#e5583c',atencao:'#f0c23f',seguro:'#57c48f'}[c.tone];}
 // Parte energizada mais crítica para o jogador (menor folga até a zona controlada).
 let best=null;for(const h of hazards(state)){const d=distanceTo(h,player.position),{rr,rc}=radii(h.kv),margin=d-rc;if(!best||margin<best.margin)best={h,d,rr,rc,margin};}
 const z=best?zoneOf(best.h.kv,best.d):'livre';zoneNow=z;
 if(hud.zone!==z){hud.zone=z;$('ep-zone').className=z;$('zone-vignette').className=z==='risco'?'risco':'';$('zone-vignette').style.opacity=z==='livre'?'0':'1';}
 setText('ep-zone-label',ZONE_LABEL[z]);if(best){setText('ep-zone-dist',`${fmtM(best.d)} m de: ${best.h.label}`);setText('ep-radii',`Anexo II • ${best.h.kv<1?'até 1 kV':'10 a 15 kV'}: Rr ${fmtM(best.rr)} m • Rc ${fmtM(best.rc)} m`);}
 const th=$('ep-thunder');const showThunder=wx.thunderDelay!=null&&thunder;th.hidden=!showThunder;
 if(showThunder){const counting=time<thunder.t0+thunder.delay;const sec=counting?Math.floor(time-thunder.t0):thunder.delay;setText('ep-sec',counting?`${sec} s…`:`${sec} s`);setText('ep-dist',counting?'contando o trovão':`≈ ${(thunderDistance(thunder.delay)/1000).toFixed(1).replace('.',',')} km${inDangerRange(thunder.delay)?' • PERIGO':''}`);}
 // Zonas visíveis: partes energizadas do momento.
 const active=new Set(hazards(state).map(h=>liveKey.get(h)));for(const [k,g] of zoneMeshes){g.visible=active.has(k)&&!finished;}
}
// ---- Alvos, painel e diálogos ----
function anchorOf(o){if(!o)return null;if(o.who){const w=byName(o.who);if(w.mounted)return {x:w.rig.position.x,z:w.rig.position.z};return w.rig.position;}return {x:o.x,z:o.z};}
const reachOf=o=>o.r??(o.who?(byName(o.who).mounted?2.6:2):1.6);
const nearTarget=o=>{const a=anchorOf(o);return Math.hypot(player.position.x-a.x,player.position.z-a.z)<=reachOf(o);};
function unstick(){const p=player.position;if(canMove(p.x,p.z,obstacles))return;for(let r=.2;r<5;r+=.2)for(let a=0;a<24;a++){const x=p.x+Math.cos(a/24*Math.PI*2)*r,z=p.z+Math.sin(a/24*Math.PI*2)*r;if(canMove(x,z,obstacles)){p.x=x;p.z=z;return;}}}
const labelBounds={min:80,max:innerWidth-80};let camShiftX=0;
function updateLabelBounds(){const panel=document.querySelector('.mission').getBoundingClientRect();const ppu=innerHeight/(2*camOffset.length()*Math.tan(camera.fov*Math.PI/360));camShiftX=innerWidth<850||!panel.width?0:panel.left<innerWidth/2?-(panel.right+16)/2/ppu:(innerWidth-panel.left+16)/2/ppu;labelBounds.min=80;labelBounds.max=innerWidth-80;if(innerWidth>=700&&panel.width){if(panel.left<innerWidth/2)labelBounds.min=Math.min(innerWidth/2,panel.right+110);else labelBounds.max=Math.max(innerWidth/2,panel.left-110);}}
function updateMissionPanel(){const panel=document.querySelector('.mission');panel.classList.toggle('compact',missionCollapsed);$('mission-toggle').textContent=missionCollapsed?'+':'−';$('mission-toggle').setAttribute('aria-expanded',String(!missionCollapsed));$('mission-toggle').setAttribute('aria-label',missionCollapsed?'Expandir painel de missão':'Recolher painel de missão');requestAnimationFrame(updateLabelBounds);}
$('mission-toggle').onclick=()=>{missionCollapsed=!missionCollapsed;updateMissionPanel();};
function escapeHTML(s){return s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);}
const chips=o=>refSummary(o).map(r=>`<span class="chip ${r.kind}${r.check?' check':''}">${escapeHTML(r.label)}<small>${r.status}</small></span>`).join('');
function notify(s){$('toast').textContent=s;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),5000);}
const moduleEyebrow=()=>{const M=MODULES[state.module];return `NR 10 • ${M.name.toUpperCase()} • ${M.course.toUpperCase()}`;};
function applyModuleChrome(){const M=MODULES[state.module];$('module-badge').textContent=SINGLE?'DEMO 3D':M.name.toUpperCase();if(SINGLE){$('brand-sub').textContent=`${M.name} • ${M.course}`.toUpperCase();$('modules').hidden=true;$('restart').textContent='Reiniciar fase';}$('role').textContent='SIMULAÇÃO / '+M.role.toUpperCase();$('place').textContent=M.place;document.title=`NR 10 • ${M.name}`;
 document.querySelector('.progress').innerHTML=objectives().map(()=>'<i></i>').join('');$('eyebrow').textContent=`NR 10 • ${M.name.toUpperCase()} • ${M.course.toUpperCase()}`;}
function updateHUD(){
 updateMissionPanel();const o=currentTarget(state),list=objectives();$('count').textContent=`${state.completed.length}/${list.length}`;$('number').textContent=String(Math.min(state.step+1,list.length)).padStart(2,'0');
 document.querySelectorAll('.progress i').forEach((e,i)=>{e.className=state.completed.includes(list[i].id)?'done':i===state.step?'active':'';});
 if(o){$('objective').textContent=o.title;$('description').textContent=o.description;$('tip').textContent=o.tip;$('refs').innerHTML=chips(o);$('target-label').textContent=o.title.toUpperCase();}
 const show=!!o&&!finished;marker.visible=show;targetRing.visible=show;$('target-label').hidden=!show;
 const M=MODULES[state.module],c=circuit(state),wx=weather(state.module,state.step);
 SC.board.draw({module:M.name,course:M.course,clock:wx.clock,title:o?o.title:'Módulo concluído',circuit:c.name+' • '+fmtKV(c),state:c.state});
}
let dialogMode='';
function openDialog(title,content,opts={}){const d=document.querySelector('.dialog');d.classList.remove('choice-dialog','menu-dialog');if(opts.cls)d.classList.add(opts.cls);dialogMode=opts.cls||'';paused=true;keys.clear();$('dialog-title').textContent=title;$('eyebrow').textContent=opts.eyebrow||moduleEyebrow();$('dialog-content').innerHTML=content;$('resume').hidden=!!opts.noResume;$('restart').hidden=!!opts.noRestart;$('overlay').hidden=false;d.scrollTop=0;}
function closeDialog(){paused=false;$('overlay').hidden=true;dialogMode='';}
function best(m){try{return JSON.parse(localStorage.getItem('nr10-resultados')||'{}')[m]||null;}catch{return null;}}
function saveBest(m,r){try{const all=JSON.parse(localStorage.getItem('nr10-resultados')||'{}');const prev=all[m];if(!prev||r.errors<prev.errors||(r.errors===prev.errors&&r.time<prev.time))all[m]=r;localStorage.setItem('nr10-resultados',JSON.stringify(all));}catch{}}
function moduleMenu(first=false){
 const cards=MODULE_IDS.map(id=>{const M=MODULES[id],b=best(id);return `<button class="module-card" data-module="${id}"><span class="mc-top"><span>${M.course.toUpperCase()}</span><span>${M.objectives.length} etapas</span></span><h3>NR 10 • ${M.name}</h3><p>${M.intro}</p>${b?`<span class="mc-done">✓ Concluído • ${b.errors} decisões corrigidas</span>`:''}<span class="mc-go">${id===state.module&&!first&&state.step>0&&!finished?'Continuar':'Começar'} →</span></button>`;}).join('');
 openDialog(first?'Escolha o módulo':'Módulos da NR 10',`${first?'':'<button class="catalog-close" id="catalog-close">Voltar ao jogo ×</button>'}<p>Três cursos em um só jogo, na mesma fábrica. Cada etapa mostra se o conteúdo é <b>Em vigor</b>, da <b>nova NR 10</b> (Portaria MTE 737/2026, vigora em 01/06/2027) ou <b>boa prática</b>.</p><div class="module-grid">${cards}</div>`,{cls:'menu-dialog',noResume:true,noRestart:true,eyebrow:'NR 10 • FORMAÇÃO • RECICLAGEM • SEP'});
 if(!first)$('catalog-close').onclick=closeDialog;
 document.querySelectorAll('[data-module]').forEach(b=>b.onclick=()=>{const id=b.dataset.module;if(id===state.module&&state.step>0&&!finished&&!first){closeDialog();return;}startModule(id);});
}
function startModule(id){
 state=initialState(id);if(!SINGLE)history.replaceState(null,'','#'+id);finished=false;elapsed=0;camDist=1;playerAction=null;clearTimeout(toastTimer);$('toast').classList.remove('show');
 player.position.set(playerStart.x,0,playerStart.z);player.rotation.y=Math.PI;look.set(playerStart.x,0,playerStart.z);thunder=null;lastStep=-1;missionCollapsed=innerWidth<600;
 placeWorkers();applyModuleChrome();updateHUD();closeDialog();
 const M=MODULES[id];notify(`${M.name}: ${M.intro.split('.')[0]}.`);
}
function applyState(next){state=next;updateHUD();if(state.feedback)notify(state.feedback);
 if(state.finished){finished=true;const M=MODULES[state.module],i=MODULE_IDS.indexOf(state.module),nextId=MODULE_IDS[(i+1)%MODULE_IDS.length];saveBest(state.module,{errors:state.errors,time:Math.round(elapsed)});
  openDialog(SINGLE?'Fase concluída.':`Módulo ${M.name} concluído.`,`<div class="success-number">${state.completed.length} / ${objectives().length}</div><p>${M.summary}</p><p>Tempo: <strong>${Math.floor(elapsed/60)}min ${Math.floor(elapsed%60)}s</strong>. Decisões corrigidas: <strong>${state.errors}</strong>.</p><p>Lembre: até 31/05/2027 vale a NR 10 atual. Itens marcados como <em>Nova NR 10</em> são da Portaria MTE 737/2026 e só valem a partir de 01/06/2027; os de <em>Boa prática</em> não são item de NR. A simulação não substitui o treinamento prático, com carga horária e avaliação, nem a autorização da empresa.</p>${SINGLE?'':`<div class="next-row"><button id="next-module">Próximo: ${MODULES[nextId].name} <span>→</span></button></div><button id="pick-module" class="secondary">Escolher módulo</button>`}`,{noResume:true});
  if(!SINGLE){$('next-module').onclick=()=>startModule(nextId);$('pick-module').onclick=()=>moduleMenu();}}}
function openChoice(){const o=currentTarget(state);if(!o?.choices)return;const order=[...o.choices].sort((a,b)=>((a.id.charCodeAt(0)*7+state.step*3+state.errors)%5)-((b.id.charCodeAt(0)*7+state.step*3+state.errors)%5));
 openDialog(o.title,`<button class="catalog-close" id="catalog-close">Voltar ao jogo ×</button><div class="refs">${chips(o)}</div><p>${o.description}</p><div class="choice-list">${order.map(c=>`<button class="choice" data-choice="${c.id}">${escapeHTML(c.label)}</button>`).join('')}</div><p class="feedback" id="choice-feedback" aria-live="polite"></p>`,{cls:'choice-dialog',noResume:true,noRestart:true});
 $('catalog-close').onclick=closeDialog;
 document.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const next=answer(state,b.dataset.choice);if(next.step===state.step){state=next;b.classList.add('wrong');b.disabled=true;$('choice-feedback').textContent=next.feedback;return;}closeDialog();applyState(next);});}
$('rules-info').onclick=()=>{openDialog('Fontes e origem do conteúdo',`<button class="catalog-close" id="catalog-close">Voltar ao jogo ×</button><p>Cada etapa mostra de onde vem o que está sendo cobrado:</p><ul class="rules-list"><li><b><span class="chip vigente" style="display:inline-block">${KINDS.vigente}</span></b>NR 10 aprovada pela Portaria MTE 598/2004, alterada pelas Portarias MTPS 508/2016 e SEPRT 915/2019. No texto em vigor, o Anexo II traz as zonas de risco e controlada e o Anexo III, os cursos básico e complementar (SEP). Também NR 1, NR 6, NR 7, NR 23 e NR 35 quando citadas.</li><li><b><span class="chip nova" style="display:inline-block">${KINDS.nova}</span></b>Nova redação da NR 10 (${NOVA_NR10.portaria}, DOU de ${NOVA_NR10.publicacao}). Só entra em vigor em ${NOVA_NR10.vigencia}. O jogo cita apenas mudanças divulgadas, sem número de item.</li><li><b><span class="chip pratica" style="display:inline-block">${KINDS.pratica}</span></b>Procedimentos técnicos úteis, como testar o detector antes e depois, a regra dos 30 s / 30 min para raios e o estudo de energia incidente (NFPA 70E / IEEE 1584). Não são exigência de NR.</li></ul><p>Etiquetas com “conferir subitem” indicam número que deve ser conferido no texto consolidado antes do uso em sala de aula.</p>`,{cls:'choice-dialog',noResume:true,noRestart:true});$('catalog-close').onclick=closeDialog;};
function act(){if(paused||finished)return;const o=currentTarget(state);if(!o)return;
 if(!nearTarget(o)){notify('Aproxime-se do círculo azul para interagir.');return;}
 if(o.choices){openChoice();return;}
 const next=interact(state,o.id);
 if(next.step>state.step){playerAction={pose:'inspect',until:time+1.3};keys.clear();}
 applyState(next);}
function help(){const M=MODULES[state.module];openDialog(SINGLE?`NR 10 • ${M.name}`:'Como jogar',`<p>${SINGLE?M.intro+' Siga o círculo azul.':'Escolha um dos três módulos da NR 10 e siga o círculo azul.'} Cada etapa traz uma decisão com três opções, só uma correta, e mostra a origem do conteúdo.</p><ul><li><strong>WASD / setas</strong>: mover. <strong>Shift</strong>: correr.</li><li><strong>E / AÇÃO</strong>: interagir no marcador.</li><li><strong>Losango verde</strong>: você. <strong>Losango azul e alvo luminoso</strong>: destino. As setas no chão mostram o caminho.</li><li><strong>Painel elétrico</strong> (canto superior direito): circuito em trabalho, tensão, estado e a sua <strong>zona</strong> (livre, controlada ou de risco) em relação à parte energizada mais próxima, com os raios do Anexo II.</li><li><strong>Anéis no piso</strong>: vermelho = zona de risco; amarelo = zona controlada. No alto, as esferas e os tubos mostram as zonas da rede de 13,8 kV.</li>${SINGLE?'':'<li><strong>Módulos</strong>: troca de curso a qualquer momento.</li>'}<li><strong>Fontes</strong>: de onde vem cada conteúdo (em vigor, nova NR 10 ou boa prática).</li></ul>`,{noRestart:false});}
$('action').addEventListener('click',act);$('help').onclick=help;$('modules').onclick=()=>moduleMenu();
$('pause').onclick=()=>{if(paused&&!finished&&!$('overlay').hidden&&dialogMode!=='menu-dialog')closeDialog();else if(!finished&&$('overlay').hidden)openDialog('Missão pausada','<p>Continue quando estiver pronto.</p>');};
$('resume').onclick=closeDialog;$('restart').onclick=()=>startModule(state.module);
function ensureAudio(){if(audio)return;audio=new AudioContext();const len=audio.sampleRate*2,b=audio.createBuffer(1,len,audio.sampleRate),dd=b.getChannelData(0);for(let i=0;i<len;i++)dd[i]=Math.random()*2-1;const s=audio.createBufferSource();s.buffer=b;s.loop=true;const f=audio.createBiquadFilter();f.type='bandpass';f.frequency.value=1800;f.Q.value=.5;rainGain=audio.createGain();rainGain.gain.value=0;s.connect(f).connect(rainGain).connect(audio.destination);s.start();}
$('sound').onclick=()=>{muted=!muted;ensureAudio();audio.resume();$('sound').textContent=muted?'Som: desligado':'Som: ligado';$('sound').setAttribute('aria-label',muted?'Ativar som':'Desativar som');};
addEventListener('keydown',e=>{if(e.target instanceof HTMLButtonElement&&['Enter',' '].includes(e.key))return;const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift','e',' '].includes(k))e.preventDefault();if(k==='e'&&!e.repeat)act();if(k==='escape'&&!finished){if(!$('overlay').hidden&&dialogMode==='choice-dialog')closeDialog();else if(dialogMode!=='menu-dialog'||state.step>0)$('pause').click();}if(!paused)keys.add(k);});addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{keys.clear();if(!paused&&!finished)openDialog('Missão pausada','<p>Continue quando estiver pronto.</p>');});document.addEventListener('visibilitychange',()=>{keys.clear();if(document.hidden&&!paused&&!finished)openDialog('Missão pausada','<p>Continue quando estiver pronto.</p>');});
document.querySelectorAll('[data-key]').forEach(b=>{b.onpointerdown=e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(b.dataset.key.toLowerCase());};b.onpointerup=b.onpointercancel=b.onlostpointercapture=()=>keys.delete(b.dataset.key.toLowerCase());});
const hw=detectHardware(renderer);const gfx=createRenderPipeline(renderer,scene,camera,sun);let qualityMode=savedQuality();
gfx.setLevel(qualityMode==='auto'?hw.level:qualityMode,false);
if(hw.mobile)renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));
function syncQualityButton(){$('quality').textContent='Gráficos: '+(qualityMode==='auto'?'Auto · ':'')+QUALITY[gfx.level].label;}syncQualityButton();
$('quality').onclick=()=>{const order=['auto','baixa','media','alta'];qualityMode=order[(order.indexOf(qualityMode)+1)%4];try{localStorage.setItem('nr10-qualidade',qualityMode);}catch{}if(qualityMode==='auto'){gfx.setLevel(hw.level,false);fpsStable=0;}else gfx.setLevel(qualityMode);if(hw.mobile)renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));syncQualityButton();notify(qualityMode==='auto'?'Gráficos automáticos: o jogo ajusta a qualidade conforme o desempenho.':'Qualidade gráfica: '+QUALITY[gfx.level].label+'.');};
let fpsTime=0,fpsFrames=0,fpsStable=0,fpsStart=performance.now();
function resize(){camera.aspect=innerWidth/innerHeight;camera.fov=innerWidth<650?60:52;camera.updateProjectionMatrix();gfx?.resize();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));}addEventListener('resize',()=>{resize();updateLabelBounds();});resize();
// Setas no chão: mostram o caminho até o destino, contornando obstáculos, e somem ao chegar perto.
const guideMat=new T.MeshBasicMaterial({color:'#7dfcff',transparent:true,opacity:.9,depthTest:false,depthWrite:false,toneMapped:false,side:T.DoubleSide});
const guideGeo=(()=>{const s=new T.Shape();s.moveTo(0,.5);s.lineTo(.42,-.08);s.lineTo(.22,-.08);s.lineTo(0,.2);s.lineTo(-.22,-.08);s.lineTo(-.42,-.08);s.closePath();return new T.ShapeGeometry(s);})();
const GUIDE_STEP=1.8,guideArrows=[];for(let i=0;i<48;i++){const m=new T.Mesh(guideGeo,guideMat);m.rotation.x=-Math.PI/2;m.renderOrder=8;m.visible=false;scene.add(m);guideArrows.push(m);}
let guidePath=[],guideLen=[],guideTimer=0;const yAxis=new T.Vector3(0,1,0);
function refreshGuide(a){const r=findRoute(player.position,a,obstacles,grid);guidePath=r;guideLen=[0];for(let i=1;i<r.length;i++)guideLen.push(guideLen[i-1]+Math.hypot(r[i].x-r[i-1].x,r[i].z-r[i-1].z));}
function updateGuide(dt,a,reach){
 guideTimer-=dt;if(a&&guideTimer<=0){guideTimer=.35;refreshGuide(a);}
 const total=guideLen.at(-1)||0,stop=Math.max(0,total-reach*.75);let k=0;
 if(a&&guidePath.length>2&&!finished){const flow=(time*1.6)%GUIDE_STEP;let j=1;
  for(let s=flow+2.2;s<stop&&k<guideArrows.length;s+=GUIDE_STEP){while(j<guidePath.length-1&&guideLen[j]<s)j++;const p0=guidePath[j-1],p1=guidePath[j],seg=Math.max(1e-6,guideLen[j]-guideLen[j-1]),t=Math.min(1,Math.max(0,(s-guideLen[j-1])/seg));
   const x=p0.x+(p1.x-p0.x)*t,z=p0.z+(p1.z-p0.z)*t;let dx=p1.x-p0.x,dz=p1.z-p0.z;if(Math.hypot(dx,dz)<1e-4){const q=guidePath[Math.min(j+1,guidePath.length-1)];dx=q.x-p0.x;dz=q.z-p0.z;}
   const m=guideArrows[k++];m.visible=true;m.position.set(x,.09,z);m.rotation.set(-Math.PI/2,0,0);m.rotateOnWorldAxis(yAxis,Math.atan2(-dx,-dz));m.scale.setScalar(.85+.15*Math.sin(time*5-s));}}
 for(;k<guideArrows.length;k++)guideArrows[k].visible=false;
}
let last=performance.now(),settleNext=false;const v=new T.Vector3();
// Usado só pela verificação automática: leva câmera, equipe, cesto e clima direto ao estado final da transição.
function settle(desired,zoom){look.copy(desired);camDist=zoom;for(const w of workers)if(w.route.length){const p=w.route.at(-1);w.rig.position.set(p.x,0,p.z);w.route=[];}SC.bucket.k=SC.bucket.target;const wx=weather(state.module,state.step);for(const k of ['dark','rain','wind'])WX[k]=wx[k];WX.wet=Math.min(1,wx.rain*1.3);}
function frame(now){requestAnimationFrame(frame);const dt=Math.min((now-last)/1000,.05);last=now;
 if(!paused){time+=dt;elapsed+=dt;let sx=(keys.has('d')||keys.has('arrowright')?1:0)-(keys.has('a')||keys.has('arrowleft')?1:0),sy=(keys.has('s')||keys.has('arrowdown')?1:0)-(keys.has('w')||keys.has('arrowup')?1:0);
  const n=(playerAction&&time<playerAction.until)?0:Math.hypot(sx,sy);
  if(n){sx/=n;sy/=n;const speed=keys.has('shift')?8.5:5.2;const dx=sx*speed*dt,dz=sy*speed*dt;if(canMove(player.position.x+dx,player.position.z,obstacles))player.position.x+=dx;if(canMove(player.position.x,player.position.z+dz,obstacles))player.position.z+=dz;const a=Math.atan2(dx,dz);const d=Math.atan2(Math.sin(a-player.rotation.y),Math.cos(a-player.rotation.y))*.22;player.rotation.y+=d;playerMove={speed,turn:d/Math.max(dt,.001)};}else playerMove={speed:0,turn:0};}
 else time+=dt*.25;
 unstick();const mobile=innerWidth<850;const tgt=currentTarget(state),tgtA=tgt&&!finished?anchorOf(tgt):null;
 const desired=new T.Vector3(player.position.x+(mobile?0:camShiftX*.6),0,player.position.z);
 if(tgtA){const dist=Math.hypot(tgtA.x-player.position.x,tgtA.z-player.position.z);const k=Math.min(.32,.12+Math.max(0,dist-5)*.028);desired.x+=(tgtA.x-desired.x)*k;desired.z+=(tgtA.z-desired.z)*k;}
 const high=tgt?.cam==='alto'&&!finished;desired.y=high?3:0;camDist+=((window.__nr10?.zoom||(high?1.45:1))-camDist)*Math.min(1,dt*2);look.lerp(desired,Math.min(1,dt*7));if(settleNext){settleNext=false;settle(desired,high?1.45:1);}camera.position.copy(look).addScaledVector(camOffset,camDist);camera.lookAt(look.x,look.y+.6,look.z);
 const seeThrough=[{x:player.position.x,y:1.4,z:player.position.z},{x:player.position.x,y:.45,z:player.position.z}];if(tgtA)seeThrough.push({x:tgtA.x,y:.9,z:tgtA.z});updateSeeThrough(dt,seeThrough);
 const wx=updateWeather(paused?0:dt);
 const fx=updateItems();
 updateWorkers(paused?0:dt);
 SC.items.fire.update(time,fx.fire);SC.items.sparks.update(time,fx.sparks);
 updateGuide(dt,tgtA,tgt?reachOf(tgt):1.6);
 updateEpHud(wx);
 const o=currentTarget(state);if(o&&!finished){const an=anchorOf(o);const personal=!!o.who;const high=personal&&byName(o.who).mounted;targetRing.position.set(an.x,.06,an.z);targetRing.scale.setScalar(personal?.85:Math.min(1.6,Math.max(1,reachOf(o)/1.6)));marker.position.set(an.x,(high?9.4:personal?2.95:2.7)+Math.sin(time*3)*.14,an.z);diamond.rotation.y=time*.7;const pulse=(time*.65)%1;targetPulse.scale.setScalar(1+pulse*.42);targetPulse.material.opacity=.28*(1-pulse);playerDiamond.position.y=2.3+Math.sin(time*2.7)*.06;playerDiamond.rotation.y=time*.6;v.copy(marker.position);v.y+=.7;v.project(camera);let ly=Math.max(innerWidth<600?330:110,Math.min(innerHeight-135,(-v.y*.5+.5)*innerHeight));const lx=Math.max(labelBounds.min,Math.min(labelBounds.max,(v.x*.5+.5)*innerWidth));const wr=$('ep').getBoundingClientRect(),lw=$('target-label').offsetWidth/2;if(lx+lw>wr.left-6&&lx-lw<wr.right+6&&ly>wr.top-10&&ly<wr.bottom+46)ly=wr.bottom+46;$('target-label').style.left=`${lx}px`;$('target-label').style.top=`${ly}px`;const near=nearTarget(o);$('action').classList.toggle('near',near);$('action-hint').textContent=near?'PRESSIONE PARA INTERAGIR':'SIGA O MARCADOR';}
 if(!paused){const la=tgtA&&playerMove.speed<.1?tgtA:null;const pose=(playerAction&&time<playerAction.until)?playerAction.pose:'none';playerChar.setPose(pose);playerChar.update(dt,playerMove.speed,{turn:playerMove.turn,lookAt:la});}
 fpsTime+=dt;fpsFrames++;if(fpsTime>4&&performance.now()-fpsStart>8000){const fps=fpsFrames/fpsTime;fpsTime=0;fpsFrames=0;
  if(qualityMode==='auto'&&!document.hidden){const order=['baixa','media','alta'],i=order.indexOf(gfx.level);
   if(fps<28&&i>0){gfx.setLevel(order[i-1],false);fpsStable=0;if(hw.mobile)renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));syncQualityButton();notify('Gráficos ajustados para '+QUALITY[gfx.level].label+' para manter o jogo fluido.');}
   else if(fps>56&&i<2&&!hw.mobile&&++fpsStable>=4){gfx.setLevel(order[i+1],false);fpsStable=0;syncQualityButton();}
   else if(fps<=56)fpsStable=0;}}
 gfx.setHeat(0);gfx.render(time);}
placeWorkers();applyModuleChrome();updateHUD();
requestAnimationFrame(frame);
if(SINGLE){startModule(moduleId);help();}else if(location.hash.slice(1)&&MODULE_IDS.includes(location.hash.slice(1)))startModule(moduleId);else moduleMenu(true);
// Gancho de teste (leitura do estado e avanço da etapa) usado pela verificação automática no navegador.
window.__nr10={get state(){return state;},get player(){return player.position;},get zone(){return zoneNow;},zoom:0,settle(){settleNext=true;},stepId:()=>currentTarget(state)?.id??null,start:startModule,get render(){return {...renderer.info.render,tex:renderer.info.memory.textures,geo:renderer.info.memory.geometries};},get weather(){return {...WX};},canMove:(x,z)=>canMove(x,z,obstacles),teleport:(x,z)=>player.position.set(x,0,z),anchor:()=>{const o=currentTarget(state);const a=o&&anchorOf(o);return a&&{x:a.x,z:a.z,r:reachOf(o)};},workers:()=>workers.map(w=>({name:w.name,phase:w.phase,x:+w.rig.position.x.toFixed(2),y:+w.rig.position.y.toFixed(2),z:+w.rig.position.z.toFixed(2),arrived:w.arrived,mounted:w.mounted})),bucket:()=>SC.bucket.k,
 advance(){const o=currentTarget(state);if(!o||finished)return false;if(o.choices){const c=o.choices.find(x=>x.correct);applyState(answer(state,c.id));return true;}applyState(interact(state,o.id));return true;},act,closeDialog};
