import {canMove,done,currentTarget} from './rules.mjs';
import {W,rosters,meetingPoint} from './layout.mjs';
// Fase de cada pessoa da equipe conforme o módulo e o andamento do jogo.
// Devolve {key,label,tone,pose,at,angle,mount}: "at" é para onde a pessoa caminha; "mount" põe a pessoa no cesto aéreo.
// tone: info (rotina), alerta (comportamento inseguro ou dúvida), perigo (vítima), ok (situação resolvida).
const POSE={inspect:'inspect',repair:'repair',push:'push',phone:'phone',cones:'cones',none:'none'};
export function phaseOf(module,name,s){
 const r=rosters[module][name],d=id=>done(s,id),cur=currentTarget(s)?.id,home={x:r.x,z:r.z};
 const base={key:'work',label:r.task,tone:'info',pose:POSE[r.kind]||'none',at:home,angle:r.angle};
 const P=(key,label,tone,pose,at=home,angle=r.angle,extra={})=>({key,label,tone,pose,at,angle,...extra});
 if(s.finished)return P('fim',module==='sep'?'Ramal liberado':'Dia encerrado','ok','none',meetingPointOf(name),0);
 if(module==='sep'){
 if(name==='Bruno'){
  if(!d('requisitos'))return P('sobe','“Tenho o básico. Posso subir no cesto?”','alerta','none');
  if(d('resgate'))return P('radio','No rádio com o centro de operação','ok','phone',{x:-6,z:-10.3},Math.PI);
  return P('apoio','Apoio no solo, fora das zonas','ok','inspect',{x:-4.2,z:-9.6},Math.PI);}
 if(name==='Rogério'){
  if(!d('equipe'))return P('sozinho','“Vou sozinho, é rapidinho”','alerta','inspect');
  if(cur==='resgate')return P('desacordado','Não responde no cesto!','perigo','slump',home,0,{mount:true});
  if(d('resgate'))return P('resgatado','Consciente • aguardando o SAMU','ok','seated',{x:-14.3,z:-11.4},Math.PI/2);
  if(d('manobra'))return P('cesto','No cesto • troca dos para-raios','info','inspect',home,0,{mount:true});
  return P('prepara','Preparando o material','info','inspect',{x:-9.8,z:-10.3},Math.PI);}
 if(name==='Lúcia'){
  if(d('liberacao'))return P('ok','Ramal liberado','ok','none',{x:-7.3,z:-10.3},Math.PI);
  if(d('tempo'))return P('cesto','Troca concluída • descendo','ok','inspect',home,0,{mount:true});
  if(cur==='tempo')return P('cesto','Céu fechando sobre o cesto','alerta','inspect',home,0,{mount:true});
  if(d('resgate'))return P('cesto','Assumiu a troca no cesto','info','inspect',home,0,{mount:true});
  if(cur==='manobra')return P('manobra','Confirmando a manobra pelo rádio','info','phone');
  return base;}
 if(name==='Paula'){
  if(cur==='resgate')return P('socorro','Pronta para receber o Rogério','alerta','none',{x:-13.5,z:-11.2},-Math.PI/2);
  if(d('resgate'))return P('socorro','Atendendo o Rogério','ok','crouch',{x:-13.5,z:-11.2},-Math.PI/2);
  if(d('sinalizacao'))return P('area','Área isolada e sinalizada','ok','inspect');
  return base;}
 }
 return base;
}
function meetingPointOf(name){const i=['Helena','Rogério','Lúcia','Bruno','Paula','Jair'].indexOf(name);return {x:meetingPoint.x-2.5+i*1.1,z:meetingPoint.z};}
// Busca em grade (BFS com diagonais) entre dois pontos do pátio, respeitando os obstáculos.
const SIZE=.4,COLS=Math.ceil((W.maxX-W.minX)/SIZE),ROWS=Math.ceil((W.maxZ-W.minZ)/SIZE);
const pointOf=i=>({x:W.minX+(i%COLS)*SIZE,z:W.minZ+Math.floor(i/COLS)*SIZE});
export function walkableGrid(obstacles){const a=new Uint8Array(COLS*ROWS);for(let i=0;i<a.length;i++){const p=pointOf(i);a[i]=canMove(p.x,p.z,obstacles)?1:0;}return a;}
export function findRoute(start,goal,obstacles,grid=walkableGrid(obstacles)){
 const key=(x,z)=>z*COLS+x;
 const nearest=p=>{let best=-1,dist=Infinity;for(let i=0;i<grid.length;i++){if(!grid[i])continue;const q=pointOf(i),d=(p.x-q.x)**2+(p.z-q.z)**2;if(d<dist){dist=d;best=i;}}return best;};
 const from=nearest(start),to=nearest(goal);if(from<0||to<0)return [];
 const previous=new Int32Array(grid.length).fill(-1),queue=[from];previous[from]=from;
 for(let head=0;head<queue.length&&previous[to]<0;head++){const id=queue[head],x=id%COLS,z=Math.floor(id/COLS);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const nx=x+dx,nz=z+dz;if(nx<0||nx>=COLS||nz<0||nz>=ROWS)continue;const next=key(nx,nz);if(!grid[next]||previous[next]>=0)continue;if(dx&&dz&&(!grid[key(x+dx,z)]||!grid[key(x,z+dz)]))continue;previous[next]=id;queue.push(next);}}
 if(previous[to]<0)return [];const route=[];for(let id=to;id!==from;id=previous[id])route.push(pointOf(id));route.push(pointOf(from));return route.reverse();
}
