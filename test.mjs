import assert from 'node:assert/strict';
import * as r from './dist/rules.mjs';
import {phaseOf,findRoute,walkableGrid} from './dist/crew.mjs';
import {staticObstacles,playerStart,rosters,people,spots,live,structures,sala} from './dist/layout.mjs';
const IDS={
 formacao:['integracao','autorizacao','riscos','vestimenta','ferramentas','documentacao','os','seccionar','bloquear','testar','aterrar','proteger','sinalizar','choque','rcp','reenergizar'],
 reciclagem:['quando','motivo','mudancas','capacitor','gerador','arco','zona','recusa','incendio','acidente','altura','registro'],
 sep:['requisitos','limite','os','planejamento','equipe','comunicacao','ferramentas','sinalizacao','manobra','detector','aterramento','zonas','resgate','tempo','liberacao']
};
const ACTIONS=['sinalizar','sinalizacao'];
const correctOf=o=>o.choices.find(c=>c.correct).id;
const has=m=>r.MODULE_IDS.includes(m);

// 1. Módulos, ordem e quantidade das etapas
assert.ok(r.MODULE_IDS.length>=1&&r.MODULE_IDS.every(m=>IDS[m]),'Módulos conhecidos');
for(const m of r.MODULE_IDS){
 assert.deepEqual(r.objectivesOf(m).map(o=>o.id),IDS[m],`${m}: ordem das etapas`);
 assert.equal(new Set(IDS[m]).size,IDS[m].length,`${m}: ids únicos`);
 const M=r.MODULES[m];assert.ok(M.name&&M.course&&M.role&&M.intro&&M.summary&&M.place,`${m}: textos do módulo`);
}

// 2. Cada decisão: três opções, uma única correta, feedback didático em todas
for(const m of r.MODULE_IDS)for(const o of r.objectivesOf(m)){
 assert.ok(o.title&&o.description&&o.tip,`${m}/${o.id}: título, descrição e dica`);
 if(ACTIONS.includes(o.id)){assert.ok(!o.choices,`${o.id}: ação no cenário`);continue;}
 assert.equal(o.choices.length,3,`${m}/${o.id}: três opções`);
 assert.equal(o.choices.filter(c=>c.correct).length,1,`${m}/${o.id}: uma única correta`);
 assert.equal(new Set(o.choices.map(c=>c.id)).size,3,`${m}/${o.id}: ids das opções únicos`);
 for(const c of o.choices)assert.ok(c.label&&c.feedback&&c.feedback.length>25,`${m}/${o.id}/${c.id}: feedback didático`);
}

// 3. Referências: origem válida, itens da NR 10 vigente existentes, anexos com a numeração do texto em vigor
const VIGENTES=['10.2.3','10.2.4','10.2.5','10.2.8.2','10.2.9.1','10.2.9.2','10.2.9.3','10.4.3.1','10.5.1','10.5.2','10.5.3','10.5.4','10.6.2','10.6.3','10.6.4',
 '10.7.1','10.7.2','10.7.3','10.7.4','10.7.8','10.7.9','10.8.1','10.8.2','10.8.3','10.8.4','10.8.5','10.8.6','10.8.7','10.8.8.1','10.8.8.2','10.8.8.3','10.8.9','10.9.1',
 '10.10.1','10.11.1','10.11.2','10.11.6','10.11.7','10.12.1','10.12.2','10.12.3','10.12.4','10.13.4','10.14.1'];
for(const m of r.MODULE_IDS)for(const o of r.objectivesOf(m)){
 assert.ok(o.refs?.length>=1,`${m}/${o.id}: referência`);
 for(const ref of o.refs){assert.ok(ref.norm&&ref.item,`${o.id}: norma e item`);assert.ok(r.KINDS[ref.kind],`${o.id}: origem válida`);
  if(ref.norm==='NR 10'){const n=ref.item.match(/^10(\.\d+)+/);assert.ok(n&&VIGENTES.includes(n[0]),`${m}/${o.id}: item da NR 10 em vigor conferido (${ref.item})`);assert.equal(ref.kind,'vigente');}
  if(ref.kind==='nova')assert.match(ref.norm,/Portaria MTE 737\/2026/,'Nova NR 10 cita a Portaria 737/2026');
  if(/zonas/.test(ref.norm))assert.match(ref.norm,/Anexo II \(/,'Zonas são o Anexo II no texto em vigor');
  if(/treinamento/.test(ref.norm))assert.match(ref.norm,/Anexo III \(/,'Treinamento é o Anexo III no texto em vigor');}
 assert.ok(r.refSummary(o).every(x=>x.label&&x.status));
}
assert.equal(r.NOVA_NR10.vigencia,'01/06/2027');
// Reciclagem: os três gatilhos do 10.8.8.2 aparecem na resposta certa
if(has('reciclagem')){const o=r.objectivesOf('reciclagem')[r.indexOf('reciclagem','quando')];const t=o.choices.find(c=>c.correct).label;for(const w of ['dois anos','função','três meses','modificações'])assert.ok(t.includes(w),`Reciclagem cita: ${w}`);}

// 4. Fluxo completo com erros, em cada módulo
for(const m of r.MODULE_IDS){
 let s=r.initialState(m);
 for(const o of r.objectivesOf(m)){
  if(!o.choices){assert.equal(r.interact(s,'outro').step,s.step,'Ação fora da etapa não avança');s=r.interact(s,o.id);assert.ok(s.feedback.length>20);continue;}
  assert.equal(r.interact(s,o.id).step,s.step,'Decisão exige escolha');
  for(const c of o.choices.filter(c=>!c.correct)){const n=r.answer(s,c.id);assert.equal(n.step,s.step,'Erro não avança');assert.equal(n.errors,s.errors+1);assert.equal(n.feedback,c.feedback);s={...s,errors:n.errors};}
  const n=r.answer(s,correctOf(o));assert.equal(n.step,s.step+1);s=n;
 }
 assert.equal(s.finished,true,`${m}: termina`);assert.equal(s.completed.length,r.objectivesOf(m).length);
 assert.equal(s.errors,r.objectivesOf(m).filter(o=>o.choices).length*2,`${m}: dois erros por decisão`);
}
if(has('formacao'))assert.equal(r.answer(r.initialState('formacao'),'gaveta').step,0,'Fora de ordem não avança');

// 5. Sequências normativas
const pos=(m,id)=>r.indexOf(m,id);
if(has('formacao')){
const seq=['seccionar','bloquear','testar','aterrar','proteger','sinalizar'];
seq.forEach((id,i)=>{if(i)assert.ok(pos('formacao',id)>pos('formacao',seq[i-1]),`10.5.1: ${id} depois de ${seq[i-1]}`);});
assert.ok(pos('formacao','reenergizar')>pos('formacao','sinalizar'),'10.5.2 só depois da liberação');
assert.ok(pos('formacao','os')<pos('formacao','seccionar')&&pos('formacao','autorizacao')<pos('formacao','seccionar'),'OS e autorização antes de intervir');
assert.ok(r.objectivesOf('formacao')[pos('formacao','reenergizar')].choices.find(c=>c.correct).label.indexOf('religar')>r.objectivesOf('formacao')[pos('formacao','reenergizar')].choices.find(c=>c.correct).label.indexOf('aterramento'),'Aterramento sai antes de religar');
}
if(has('sep')){
for(const [a,b] of [['os','manobra'],['equipe','manobra'],['comunicacao','manobra'],['sinalizacao','manobra'],['manobra','detector'],['detector','aterramento'],['aterramento','zonas'],['zonas','resgate']])assert.ok(pos('sep',a)<pos('sep',b),`SEP: ${a} antes de ${b}`);
assert.equal(r.objectivesOf('sep').at(-1).id,'liberacao');assert.equal(pos('sep','requisitos'),0,'SEP começa pelos requisitos');
}

// 6. Anexo II: raios das zonas
assert.deepEqual(r.radii(.38),{rr:.2,rc:.7});assert.deepEqual(r.radii(.22),{rr:.2,rc:.7});assert.deepEqual(r.radii(.8),{rr:.2,rc:.7});
assert.deepEqual(r.radii(13.8),{rr:.38,rc:1.38});assert.deepEqual(r.radii(1),{rr:.22,rc:1.22});assert.deepEqual(r.radii(138),{rr:1.2,rc:3.2});assert.deepEqual(r.radii(500),{rr:5.2,rc:7.2});
assert.equal(r.zoneOf(13.8,.3),'risco');assert.equal(r.zoneOf(13.8,1),'controlada');assert.equal(r.zoneOf(13.8,1.5),'livre');assert.equal(r.zoneOf(.38,.5),'controlada');
assert.equal(r.ANEXO_II.length,19);
for(const m of r.MODULE_IDS)for(const o of r.objectivesOf(m))for(const ref of o.refs.filter(x=>/zonas/.test(x.norm))){const [,a,b]=ref.item.match(/Rr ([\d,]+) m • Rc ([\d,]+) m/);const kv=/13,8|10 a 15/.test(ref.item)?13.8:.38;assert.deepEqual(r.radii(kv),{rr:+a.replace(',','.'),rc:+b.replace(',','.')},`${o.id}: raios citados batem com a tabela`);}
if(has('sep')){const t=r.objectivesOf('sep')[pos('sep','zonas')];assert.ok(t.choices.find(c=>c.correct).label.includes('1,38 m'));assert.ok(t.choices.find(c=>c.id==='metro').feedback.includes('1,38'));}

// 7. Hora e clima: tempestade só no SEP, na etapa "tempo"
for(const m of r.MODULE_IDS){const clocks=r.objectivesOf(m).map((_,i)=>r.weather(m,i).clock);assert.deepEqual([...clocks].sort(),clocks,`${m}: horários crescentes`);}
for(const m of ['formacao','reciclagem'].filter(has))for(let i=0;i<r.objectivesOf(m).length;i++){const w=r.weather(m,i);assert.equal(w.rain,0);assert.equal(w.thunderDelay,null);}
if(has('sep')){const w=r.weather('sep',pos('sep','tempo'));assert.equal(w.thunderDelay,12,'Coerente com o texto (12 s)');assert.ok(r.inDangerRange(12));assert.equal(r.thunderDistance(12),4116);assert.ok(w.rain>.5&&w.dark>.8);
 assert.equal(r.weather('sep',pos('sep','liberacao')).rain,0,'A chuva passou na liberação');assert.ok(r.objectivesOf('sep')[pos('sep','tempo')].choices.find(c=>c.id==='terminar').feedback.includes('4 km'));}

// 8. Circuito em trabalho e partes energizadas
const upTo=(m,id)=>({...r.initialState(m),step:pos(m,id)+1,completed:r.objectivesOf(m).slice(0,pos(m,id)+1).map(o=>o.id)});
const atStep=(m,id)=>({...r.initialState(m),step:pos(m,id),completed:r.objectivesOf(m).slice(0,pos(m,id)).map(o=>o.id)});
if(has('formacao')){assert.equal(r.circuit(r.initialState('formacao')).tone,'perigo');}
if(has('formacao')){assert.equal(r.circuit(upTo('formacao','bloquear')).tone,'atencao','Bloqueado ainda não é seguro');}
if(has('formacao')){assert.equal(r.circuit(upTo('formacao','testar')).tone,'seguro','Seguro só depois de constatar');}
if(has('formacao')){assert.equal(r.circuit(upTo('formacao','reenergizar')).state,'Reenergizado');}
const hasLive=(s,k)=>r.hazards(s).includes(live[k]);
if(has('formacao')){assert.ok(hasLive(upTo('formacao','bloquear'),'ccm'),'CCM tratado como energizado até a constatação');assert.ok(!hasLive(upTo('formacao','testar'),'ccm'));}
if(has('formacao')){assert.ok(hasLive(upTo('formacao','reenergizar'),'ccm'));assert.ok(hasLive(upTo('formacao','sinalizar'),'qgbt'),'QGBT segue energizado');}
if(has('formacao')){assert.ok(hasLive(atStep('formacao','choque'),'maquina'));assert.ok(!hasLive(upTo('formacao','choque'),'maquina'),'Energia da furadeira cortada');}
if(has('reciclagem')){assert.ok(hasLive(upTo('reciclagem','incendio'),'stringBox'),'Lado CC fica energizado com sol');assert.ok(!hasLive(upTo('reciclagem','capacitor'),'capacitor'));}
if(has('sep')){assert.ok(hasLive(upTo('sep','manobra'),'ramal'),'Ramal tratado como energizado até o detector');assert.ok(!hasLive(upTo('sep','detector'),'ramal'));assert.ok(hasLive(upTo('sep','liberacao'),'ramal'));}
for(const m of r.MODULE_IDS)assert.ok(hasLive(r.initialState(m),'rede'),'Rede da distribuidora sempre energizada');

// 9. Fases da equipe
const ph=(m,n,s)=>phaseOf(m,n,s);
if(has('formacao')){assert.equal(ph('formacao','Jair',atStep('formacao','choque')).tone,'perigo');assert.equal(ph('formacao','Jair',atStep('formacao','rcp')).pose,'victim');assert.equal(ph('formacao','Jair',upTo('formacao','rcp')).tone,'ok');}
if(has('formacao')){assert.equal(ph('formacao','Lúcia',atStep('formacao','reenergizar')).key,'fora','10.5.2 b: fora da zona controlada');}
if(has('sep')){assert.ok(!ph('sep','Rogério',atStep('sep','manobra')).mount,'Ninguém sobe antes da manobra');assert.ok(ph('sep','Rogério',upTo('sep','manobra')).mount);}
if(has('sep')){assert.equal(ph('sep','Rogério',atStep('sep','resgate')).tone,'perigo');assert.ok(!ph('sep','Rogério',upTo('sep','resgate')).mount,'Rogério desce no resgate');}
if(has('sep')){assert.ok(ph('sep','Lúcia',upTo('sep','resgate')).mount&&!ph('sep','Lúcia',upTo('sep','liberacao')).mount);}
if(has('sep')){assert.ok(!ph('sep','Bruno',r.initialState('sep')).mount&&!ph('sep','Bruno',upTo('sep','zonas')).mount,'Bruno (sem SEP) nunca sobe');}
if(has('reciclagem')){assert.equal(ph('reciclagem','Jair',atStep('reciclagem','zona')).tone,'alerta');assert.equal(ph('reciclagem','Rogério',atStep('reciclagem','recusa')).tone,'alerta');}

// 10. Planta: acessibilidade de destinos, posições da equipe e da porta da sala elétrica
const grid=walkableGrid(staticObstacles);
assert.ok(r.canMove(playerStart.x,playerStart.z,staticObstacles),'Início livre');
const reach=(from,target,radius)=>{const route=findRoute(from,target,staticObstacles,grid);if(!route.length)return false;const end=route.at(-1);return Math.hypot(end.x-target.x,end.z-target.z)<=radius;};
for(const [k,p] of Object.entries(spots))assert.ok(r.canMove(p.x,p.z,staticObstacles),`Ponto ${k} livre`);
for(const m of r.MODULE_IDS){
 assert.ok(rosters[m],`${m}: equipe definida`);assert.deepEqual(Object.keys(rosters[m]).sort(),Object.keys(people).sort(),`${m}: equipe completa`);
 for(const [n,p] of Object.entries(rosters[m]))assert.ok(r.canMove(p.x,p.z,staticObstacles),`${m}/${n}: posição inicial livre`);
 for(const o of r.objectivesOf(m)){const a=o.who?rosters[m][o.who]:o;assert.ok(a,`${o.id}: âncora`);assert.ok(reach(playerStart,a,o.r??2),`${m}/${o.id}: destino acessível (${a.x}, ${a.z})`);}
 // Todas as posições de todas as fases são livres e alcançáveis a partir da posição inicial.
 let s=r.initialState(m);const states=[s];for(const o of r.objectivesOf(m)){s=o.choices?r.answer(s,correctOf(o)):r.interact(s,o.id);states.push(s);for(const st of [s,{...s,step:Math.max(0,s.step-1)}])states.push(st);}
 for(const st of states)for(const n of Object.keys(people)){const f=ph(m,n,st);if(f.mount)continue;assert.ok(r.canMove(f.at.x,f.at.z,staticObstacles),`${m}/${n}/${f.key}: destino livre`);assert.ok(reach(rosters[m][n],f.at,.5),`${m}/${n}/${f.key}: rota até o destino`);}
}
// A sala elétrica só se acessa pela porta.
{const toCCM=findRoute(playerStart,spots.ccm,staticObstacles,grid);assert.ok(toCCM.some(p=>Math.abs(p.x-sala.door.x)<.9&&Math.abs(p.z-sala.door.z)<.4),'Rota passa pela porta da sala');
 assert.equal(r.canMove(2,-5.4,staticObstacles),false,'Parede da frente bloqueia');assert.equal(r.canMove(5,-10.6,staticObstacles),false,'Parede dos fundos bloqueia');assert.ok(r.canMove(5,-5.4,staticObstacles),'Porta passável');}
// Quem trabalha diante do CCM-2 está na zona controlada de 380 V; o destino da etapa das zonas do SEP fica em zona livre.
{const d=(p,h)=>Math.max(0,Math.hypot(p.x-h.x,p.z-h.z,1-h.y)-.25);assert.equal(r.zoneOf(.38,d(spots.ccm,live.ccm)),'controlada');assert.equal(r.zoneOf(.38,d(spots.board,live.qgbt)),'livre');
 assert.ok(Math.hypot(spots.posteBase.z-(-14.9),1.75-9.52)>1.38,'Jogador no solo fica fora da zona controlada da rede');}
assert.equal(r.canMove(-30,0,[]),false,'Limite do pátio');
console.log(`PASS: ${r.MODULE_IDS.map(m=>r.MODULES[m].name+' ('+r.objectivesOf(m).length+' etapas)').join(', ')} — uma resposta certa por decisão, itens da NR 10 em vigor, Anexos II e III, sequências, zonas, clima, equipe e acessibilidade`);
