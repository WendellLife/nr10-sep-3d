// Planta da fábrica: estruturas sólidas, posições da equipe em cada módulo e pontos energizados.
// Usada pelo cenário 3D (scenery.mjs, game.mjs) e pelos testes, para garantir que todo destino é alcançável.
export const W = {minX:-21,maxX:26,minZ:-13.4,maxZ:12.4};
const wall = (x,z,w,d) => ({x,z,w,d});
// Sala elétrica de baixa tensão: paredes externas x 0..10 e z -10,6..-5,4; porta de 1,6 m na face sul (x 4,2..5,8).
export const sala = {x:5,z:-8,w:10,d:5.2,door:{x:5,w:1.6,z:-5.4}};
// Cabine primária (13,8 kV, abrigada), com a medição da distribuidora na fachada.
export const cabine = {x:-13,z:-8.6,w:5,d:4};
// Poste de entrada da fábrica, ramal aéreo e rede da distribuidora (fora da cerca, ao longo da via).
export const poste = {x:-17.6,z:-12.4,top:8.6};
export const rede = {z:-14.9,y:9.4,phases:[-15.35,-14.9,-14.45],poles:[-20,-8,4,16,24]};
export const derivacao = {x:-20,z:-14.9};
// Caminhão com cesto aéreo: base da lança na traseira (lado oeste), cabine a leste.
export const truck = {x:-9.6,z:-12.1,w:6.6,d:2.4,boomBase:{x:-12.2,y:2.1,z:-12.1},bucketUp:{x:-16.5,y:7.3,z:-12.4}};
export const structures = {
 salaBack:wall(5,-10.6,10,.2),salaLeft:wall(0,-8,.2,5.2),salaRight:wall(10,-8,.2,5.2),
 salaFrontL:wall(2.1,-5.4,4.2,.2),salaFrontR:wall(7.9,-5.4,4.2,.2),
 qgbt:wall(2.7,-10.15,3,.7),ccm:wall(6.7,-10.15,2.2,.7),capacitor:wall(9.35,-8.4,.9,1.6),
 prontuario:wall(.55,-8,.7,1.4),lotoBox:wall(8.9,-5.75,1.2,.3),extintor:wall(3.7,-5.75,.4,.35),
 cabine:wall(cabine.x,cabine.z,cabine.w,cabine.d),medicao:wall(-11.6,-6.35,1,.3),
 poste:wall(poste.x,poste.z,.6,.6),truck:wall(truck.x,truck.z,truck.w,truck.d),sepTable:wall(-6.6,-8.4,1.6,.8),
 inversor:wall(13.4,-7.2,1.6,.4),car:wall(19,-7.2,4.2,1.9),
 cpA:wall(15,-9.8,.4,.4),cpB:wall(23,-9.8,.4,.4),cpC:wall(15,-4.6,.4,.4),cpD:wall(23,-4.6,.4,.4),
 galA:wall(11,1.5,.4,.4),galB:wall(21,1.5,.4,.4),galC:wall(11,9.5,.4,.4),galD:wall(21,9.5,.4,.4),
 furadeira:wall(14,5,.9,.9),torno:wall(18,5,2.2,.9),qdGalpao:wall(12,2.2,.8,.3),
 bancada:wall(-4,1.4,3,.8),ferramentas:wall(-1.2,1.4,1.4,.8),escadas:wall(-7.4,1.4,1.6,.5),
 board:wall(-12,3.1,2.4,.3),didatico:wall(-9.4,3.1,1.4,.3),benchA:wall(-13,6,2,.5),benchB:wall(-10.6,6,2,.5),
 osDesk:wall(1.2,-2.4,1.8,.8),
 tree1:wall(-19.5,9.5,.9,.9),tree2:wall(24.5,10.5,.9,.9),tree3:wall(-19.5,-2,.9,.9)
};
export const staticObstacles = Object.values(structures);
export const playerStart = {x:1,z:7};
export const meetingPoint = {x:3.5,z:9.6};
// Pontos de destino fora da equipe (o restante usa a posição da pessoa).
export const spots = {
 board:{x:-12,z:4.4},didatico:{x:-9.4,z:4.2},bancada:{x:-4.4,z:2.5},ferramentas:{x:-1.2,z:2.5},
 prontuario:{x:1.5,z:-8},osDesk:{x:1.2,z:-1.4},ccm:{x:6.7,z:-9.1},qgbt:{x:3.8,z:-9.1},qgbtFront:{x:2.7,z:-9.1},
 capacitor:{x:8.3,z:-8.4},capacitorFire:{x:7.9,z:-7.5},inversor:{x:13.6,z:-6.3},
 medicao:{x:-11.6,z:-5.6},sepTable:{x:-5.1,z:-8.4},toolbox:{x:-9.6,z:-10.3},cones:{x:-5.3,z:-11.5},posteBase:{x:-16.3,z:-11.2},truckSide:{x:-8.4,z:-10.2}
};
// Pontos com partes energizadas expostas (centro da parte viva). kv é a tensão nominal; y é a altura.
export const live = {
 qgbt:{label:'Barramento do QGBT',x:2.7,y:1.3,z:-9.8,kv:.38},
 ccm:{label:'Gaveta da bomba • CCM-2',x:6.7,y:1.0,z:-9.8,kv:.38},
 maquina:{label:'Carcaça da furadeira',x:14,y:1.0,z:5,kv:.22},
 capacitor:{label:'Banco de capacitores',x:9.35,y:1.0,z:-8.4,kv:.38},
 stringBox:{label:'String box fotovoltaica (CC)',x:13,y:1.3,z:-7.0,kv:.8,dc:true},
 ramal:{label:'Ramal 13,8 kV • poste de entrada',x:poste.x,y:poste.top,z:poste.z,kv:13.8},
 rede:{label:'Rede da distribuidora 13,8 kV',x:-14,y:rede.y,z:rede.z,kv:13.8,line:true}
};
// Equipe: as mesmas seis pessoas dos outros jogos da NR 10 da série, com as posições iniciais deste jogo.
export const people = {
 Helena:{role:'Engenheira eletricista'},Rogério:{role:'Eletricista sênior'},Lúcia:{role:'Eletricista'},
 Bruno:{role:'Eletricista'},Paula:{role:'Técnica de segurança'},Jair:{role:'Operador de produção'}
};
export const rosters = {
 sep:{
  Helena:{x:-6.6,z:-7.6,angle:Math.PI,kind:'inspect',task:'Supervisora • procedimento em mãos'},
  Rogério:{x:-14.4,z:-11.6,angle:-Math.PI/2,kind:'inspect',task:'Olhando os para-raios'},
  Lúcia:{x:-6,z:-10.3,angle:Math.PI,kind:'phone',task:'No rádio com o centro de operação'},
  Bruno:{x:-8.4,z:-10.3,angle:-Math.PI/2,kind:'none',task:'Separando material'},
  Paula:{x:-5,z:-11.6,angle:Math.PI/2,kind:'cones',task:'Preparando a sinalização'},
  Jair:{x:14,z:6,angle:Math.PI,kind:'push',task:'Furando chapas na furadeira'}
 }
};
