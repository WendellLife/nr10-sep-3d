// Regras do jogo NR 10 • SEP (curso complementar de 40 h — Sistema Elétrico de Potência (Anexo III, item 2)), no mesmo padrão dos demais jogos da série.
// Cada etapa traz as referências normativas em "refs". O campo "kind" diz de onde vem o conteúdo:
//  vigente → texto em vigor da NR 10 (Portaria MTE 598/2004, alterada pelas Portarias MTPS 508/2016 e SEPRT 915/2019)
//            e normas citadas por ela (NR 1, NR 6, NR 7, NR 23, NR 35). No texto em vigor, a zona controlada é o Anexo II
//            e o treinamento é o Anexo III.
//  nova    → nova redação da NR 10 aprovada pela Portaria MTE 737/2026 (DOU 01/06/2026). Só vigora a partir de 01/06/2027.
//  pratica → boa prática técnica, que não é item de NR.
// cam:"alto" afasta a câmera para mostrar o poste, o cesto e a rede.
// "check:true" marca número de subitem que deve ser conferido no texto consolidado antes de usar em treinamento.
import {spots,live} from './layout.mjs';
export const KINDS = {
 vigente:'Em vigor',
 nova:'Nova NR 10 publicada — vigora em 01/06/2027',
 pratica:'Boa prática — não é item de NR'
};
export const NOVA_NR10 = {portaria:'Portaria MTE 737/2026',publicacao:'01/06/2026',vigencia:'01/06/2027'};
const nr10=item=>({norm:'NR 10',item,kind:'vigente'});
const anexo2=item=>({norm:'NR 10 • Anexo II (zonas)',item,kind:'vigente'});
const anexo3=item=>({norm:'NR 10 • Anexo III (treinamento)',item,kind:'vigente'});
const glossario=item=>({norm:'NR 10 • Glossário',item,kind:'vigente'});
const nova=item=>({norm:'Nova NR 10 (Portaria MTE 737/2026)',item,kind:'nova'});
const pratica=(norm,item)=>({norm,item,kind:'pratica'});
const at=(p,r)=>({x:p.x,z:p.z,r});

// ---------------- SEP (curso complementar, 40 h) ----------------
const sep = [
 {id:'requisitos',who:'Bruno',refs:[nr10('10.7.1'),nr10('10.7.2'),anexo3('item 2 (pré-requisito: curso básico)')],
  title:'Confira quem pode atuar no SEP',description:'Bruno quer subir no cesto para ajudar. Ele tem o curso básico, mas não o complementar do SEP.',
  tip:'Quem atua no SEP e em suas proximidades precisa do curso complementar de 40 h, que tem o básico como pré-requisito (Anexo III, item 2), além da autorização da empresa (10.8.4).',
  choices:[
   {id:'solo',correct:true,label:'Bruno fica no solo, fora das zonas controladas, em apoio: sem o curso complementar do SEP, ele não intervém nem se aproxima da rede.',feedback:'Exato: o básico sem o complementar do SEP não autoriza atuar no SEP (10.7.2).'},
   {id:'basico',label:'O básico de 40 h já cobre alta tensão; ele pode subir.',feedback:'O básico é pré-requisito. Para o SEP, exige-se também o curso complementar (10.7.2 e Anexo III, item 2).'},
   {id:'junto',label:'Ele pode subir se for junto com o Rogério, que é experiente.',feedback:'Estar acompanhado não substitui o treinamento do SEP nem a autorização.'}
  ]},
 {id:'limite',refs:[glossario('Sistema Elétrico de Potência (SEP)'),nr10('10.2.5')],...at(spots.medicao,1.6),
  title:'Onde começa e termina o SEP',description:'Diante da medição da cabine primária, decida até onde vai o sistema elétrico de potência.',
  tip:'SEP é o conjunto de instalações e equipamentos de geração, transmissão e distribuição até a medição, inclusive (glossário). Quem opera no SEP acrescenta ao prontuário os procedimentos de emergência e as certificações dos EPC e EPI (10.2.5).',
  choices:[
   {id:'medicao',correct:true,label:'Vai da geração até a medição, inclusive: a rede, o ramal e esta medição são SEP. Daqui para dentro é instalação da fábrica, que também é de alta tensão.',feedback:'Limite certo: até a medição, inclusive. Depois dela, a cabine é instalação do consumidor em alta tensão.'},
   {id:'rua',label:'SEP é só a rede da rua; o ramal e a medição já são da fábrica.',feedback:'Pelo glossário da NR 10, o SEP vai até a medição, inclusive.'},
   {id:'tudo',label:'Tudo o que é alta tensão é SEP, inclusive os transformadores dentro da fábrica.',feedback:'Alta tensão e SEP são coisas diferentes. Depois da medição é instalação do consumidor, com as regras de AT (10.7).'}
  ]},
 {id:'os',refs:[nr10('10.7.4'),nr10('10.11.2')],...at(spots.sepTable,1.6),
  title:'Confira a ordem de serviço',description:'A turma vai trocar os para-raios do poste de entrada. Confira a OS na mesa de planejamento.',
  tip:'Trabalho em AT energizado, ou que interaja com o SEP, só com ordem de serviço específica para data e local, assinada por superior responsável pela área (10.7.4).',
  choices:[
   {id:'especifica',correct:true,label:'OS específica para hoje e para o poste de entrada da fábrica, assinada pelo superior responsável, com referência ao procedimento e ao número da manobra combinada com o centro de operação.',feedback:'OS específica para data e local, assinada pelo responsável (10.7.4).'},
   {id:'semana',label:'A OS da semana passada para a mesma rede serve.',feedback:'A OS é específica para data e local (10.7.4).'},
   {id:'mensagem',label:'Uma mensagem no celular do supervisor dizendo “pode fazer” resolve.',feedback:'Mensagem informal não é OS assinada pelo superior responsável (10.7.4).'}
  ]},
 {id:'planejamento',who:'Helena',refs:[nr10('10.11.7'),nr10('10.11.1'),anexo3('item 2, tópico 6 (análise de risco no SEP)')],
  title:'Planeje com a equipe',description:'Reúna a turma com a Helena, com o procedimento e a análise de risco em mãos.',
  tip:'Antes de trabalhar em equipe, os membros e o responsável pela execução fazem avaliação prévia, estudam e planejam as atividades (10.11.7). O procedimento é passo a passo e assinado (10.11.1).',
  choices:[
   {id:'equipe',correct:true,label:'Ler o procedimento passo a passo, fazer a análise de risco no local (rede vizinha energizada, indução, altura, trânsito, clima) e definir as funções e o plano de resgate.',feedback:'Planejamento em equipe, com os riscos do SEP identificados (10.11.7 e Anexo III, item 2).'},
   {id:'dispensa',label:'Todos já fizeram isso mil vezes; dispensar a reunião.',feedback:'Cada local tem riscos próprios. A avaliação prévia em equipe é exigida (10.11.7).'},
   {id:'chefe',label:'Só o encarregado lê o procedimento e vai dizendo o que fazer.',feedback:'O planejamento é feito pelos membros em conjunto com o responsável pela execução (10.11.7).'}
  ]},
 {id:'equipe',who:'Rogério',refs:[nr10('10.7.3'),nr10('10.11.6')],
  title:'Nada de trabalho individual',description:'Rogério diz que a troca é simples e que vai sozinho enquanto o resto organiza a sinalização.',
  tip:'Serviços no SEP não podem ser realizados individualmente (10.7.3), e toda equipe tem alguém indicado para supervisionar e conduzir os trabalhos (10.11.6).',
  choices:[
   {id:'junto',correct:true,label:'Ninguém vai sozinho: Rogério sobe com outro autorizado acompanhando do solo, e eu supervisiono a atividade sem acumular outra tarefa.',feedback:'Trabalho em equipe, com supervisão definida (10.7.3 e 10.11.6).'},
   {id:'sozinho',label:'Liberar, porque ele é o mais experiente da turma.',feedback:'Experiência não muda a regra: no SEP ninguém trabalha sozinho (10.7.3).'},
   {id:'celular',label:'Liberar, desde que ele leve o celular para pedir ajuda.',feedback:'Celular não substitui um colega que vê, ajuda e resgata. O serviço é em equipe.'}
  ]},
 {id:'comunicacao',who:'Lúcia',refs:[nr10('10.7.9')],
  title:'Garanta a comunicação',description:'Lúcia testa o rádio do caminhão com o centro de operação da distribuidora.',
  tip:'Quem atua no SEP dispõe de equipamento de comunicação permanente com a equipe ou com o centro de operação durante todo o serviço (10.7.9).',
  choices:[
   {id:'radio',correct:true,label:'Rádio testado com o centro de operação e entre a equipe, com canal combinado, palavras padronizadas e confirmação de cada manobra por repetição.',feedback:'Comunicação permanente e confirmada (10.7.9).'},
   {id:'grito',label:'No poste dá para conversar gritando; o rádio é dispensável.',feedback:'Ruído, distância e trânsito impedem a comunicação segura. O equipamento é exigido (10.7.9).'},
   {id:'texto',label:'Combinar a manobra por mensagem de texto e conferir de vez em quando.',feedback:'Manobra se confirma em tempo real, por voz e com repetição. Mensagem de vez em quando não é comunicação permanente.'}
  ]},
 {id:'ferramentas',refs:[nr10('10.7.8'),nr10('10.4.3.1'),pratica('Boa prática','luvas isolantes de classe compatível com a tensão (classe 2 até 17 kV, IEC 60903)')],...at(spots.toolbox,1.5),
  title:'Confira o material de alta tensão',description:'No caminhão, separe bastões, detector de AT, conjunto de aterramento e luvas isolantes.',
  tip:'Equipamentos e ferramentas isolantes para AT passam por ensaios elétricos periódicos, conforme o fabricante e os procedimentos da empresa; na falta deles, anualmente (10.7.8).',
  choices:[
   {id:'ensaiado',correct:true,label:'Bastões limpos e com ensaio em dia, detector de AT testado, conjunto de aterramento íntegro e luvas classe 2 ensaiadas e conferidas no teste de ar.',feedback:'Material conferido, ensaiado e adequado aos 13,8 kV (10.7.8).'},
   {id:'vencido',label:'O bastão está com o ensaio vencido há três meses, mas está inteiro: dá para usar hoje.',feedback:'Sem ensaio em dia não há garantia de isolação. O bastão sai de uso até ser ensaiado (10.7.8).'},
   {id:'classe0',label:'Usar as luvas classe 0 da baixa tensão, que são mais finas e dão mais tato.',feedback:'Luva classe 0 é para baixa tensão. Em 13,8 kV, a classe precisa ser compatível com a tensão.'}
  ]},
 {id:'sinalizacao',refs:[nr10('10.10.1 c), d) e e)'),anexo3('item 2, tópico 14 (sinalização e isolamento de áreas)')],...at(spots.cones,1.6),
  title:'Sinalize e isole a área',description:'Pressione AÇÃO junto à traseira do caminhão para posicionar cones, fita e placas em volta do poste e da calçada.',
  tip:'Sinalização de restrição de acesso, delimitação de áreas e de vias de circulação (10.10.1 c, d e e) protege a equipe e quem passa.'},
 {id:'manobra',who:'Lúcia',refs:[nr10('10.5.1 a) e b)'),nr10('10.7.9'),pratica('Boa prática','confirmar por rádio o número da manobra e o bloqueio da chave')],
  title:'Peça o desligamento',description:'Pelo rádio, o centro de operação vai abrir a chave da derivação que alimenta o ramal da fábrica.',
  tip:'Seccionamento e impedimento de reenergização valem também no SEP (10.5.1 a e b). A confirmação é por rádio, com número de manobra, e a chave aberta recebe bloqueio e sinalização.',
  choices:[
   {id:'confirmar',correct:true,label:'Confirmar pelo rádio a abertura da chave da derivação, o bloqueio dela e a sinalização, anotando o número da manobra e quem a executou.',feedback:'Seccionamento e impedimento confirmados e registrados.'},
   {id:'olhar',label:'Olhar de longe: se a chave parece aberta, já pode subir.',feedback:'Olhar de longe não confirma bloqueio nem ausência de tensão. Confirme pelo rádio e siga as próximas etapas.'},
   {id:'horario',label:'O desligamento estava marcado para as 9 h; às 9h05 já pode subir sem falar com ninguém.',feedback:'Horário programado não é confirmação. A manobra se confirma pelo rádio, com bloqueio.'}
  ]},
 {id:'detector',cam:'alto',refs:[nr10('10.5.1 c)'),pratica('Boa prática','detector de AT testado antes e depois, em todas as fases')],...at(spots.posteBase,1.8),
  title:'Constate a ausência de tensão',description:'Do cesto, Rogério vai testar as três fases do ramal com o detector de AT na ponta do bastão.',
  tip:'Constate a ausência de tensão com detector adequado à tensão, testado antes e depois, em todas as fases (10.5.1 c). Até lá, o ramal é tratado como energizado.',
  choices:[
   {id:'tres',correct:true,label:'Testar o detector no dispositivo de teste, aproximá-lo de cada uma das três fases com o bastão, respeitando as distâncias, e testar o detector de novo.',feedback:'Ausência de tensão constatada com o método completo.'},
   {id:'fusivel',label:'Ver se o elo fusível caiu na chave: se caiu, não há tensão.',feedback:'Elo caído não prova ausência de tensão: pode haver retorno ou indução. Use o detector.'},
   {id:'uma',label:'Testar só a fase do meio, que é a mais perto do cesto.',feedback:'Todas as fases precisam ser testadas. Uma delas pode continuar energizada.'}
  ]},
 {id:'aterramento',cam:'alto',refs:[nr10('10.5.1 d)'),anexo3('item 2, tópico 5 (indução)')],...at(spots.posteBase,1.8),
  title:'Aterre o ramal',description:'A rede da rua, energizada, corre em paralelo ao ramal e pode induzir tensão nele. Instale o aterramento temporário.',
  tip:'O aterramento temporário com equipotencialização protege contra energização acidental e contra tensões induzidas por linhas vizinhas. O grampo de terra vai primeiro, e o ponto de trabalho fica entre os aterramentos.',
  choices:[
   {id:'tres',correct:true,label:'Ligar o cabo do conjunto ao ponto de terra primeiro e, com o bastão, conectar as três fases, deixando o ponto de trabalho entre aterramentos e equipotencializado.',feedback:'Aterramento e equipotencialização corretos, inclusive contra indução (10.5.1 d).'},
   {id:'uma',label:'Aterrar só uma fase, porque as outras já estão desligadas.',feedback:'Todas as fases são aterradas e equipotencializadas. Fase sem aterramento pode receber tensão induzida.'},
   {id:'depois',label:'Aterrar só depois de trocar os para-raios, se sobrar tempo.',feedback:'O aterramento vem antes da intervenção, nunca depois (10.5.1 d).'}
  ]},
 {id:'zonas',cam:'alto',refs:[anexo2('10 a 15 kV: Rr 0,38 m • Rc 1,38 m'),nr10('10.5.1 e)'),nr10('10.6.2')],...at(spots.posteBase,1.8),
  title:'Respeite as zonas da rede vizinha',description:'A rede da rua segue energizada em 13,8 kV. Veja as zonas em volta dos condutores e decida como o cesto vai trabalhar.',
  tip:'Para 13,8 kV (faixa de 10 a 15 kV), o raio da zona de risco é 0,38 m e o da zona controlada, 1,38 m (Anexo II). Elementos energizados na zona controlada do serviço recebem proteção (10.5.1 e).',
  choices:[
   {id:'distancia',correct:true,label:'Posicionar o cesto para que ninguém, nem ferramenta, chegue a menos de 1,38 m da rede energizada e instalar coberturas isolantes nos condutores que ficarem na zona controlada do serviço.',feedback:'Distâncias do Anexo II respeitadas e partes energizadas protegidas.'},
   {id:'metro',label:'Um metro de distância já basta para 13,8 kV.',feedback:'Um metro fica dentro da zona controlada (1,38 m). Respeite o raio ou proteja os condutores.'},
   {id:'encostar',label:'Com luva classe 2, pode encostar na rede energizada para apoiar o bastão.',feedback:'O serviço é desenergizado. Encostar na rede viva seria trabalho energizado, com outro método e outra OS.'}
  ]},
 {id:'resgate',cam:'alto',who:'Rogério',refs:[nr10('10.12.2'),nr10('10.12.3'),anexo3('item 2, tópico 16 (remoção e atendimento de acidentados)')],
  title:'Resgate do cesto',description:'Rogério para de responder no cesto, a 7 m de altura. O ramal está desligado e aterrado.',
  tip:'A empresa tem métodos de resgate padronizados e os meios para aplicá-los (10.12.3). Com o circuito seguro, desça o cesto pelo comando de solo, avalie a vítima e acione o socorro.',
  choices:[
   {id:'descer',correct:true,label:'Acionar o socorro pelo rádio, descer o cesto pelo comando de emergência do solo, retirar o Rogério com apoio e avaliar a respiração; se preciso, iniciar a RCP.',feedback:'Resgate padronizado e seguro, com socorro acionado e avaliação imediata.'},
   {id:'escalar',label:'Subir pelo poste sem equipamento para chegar mais rápido.',feedback:'Subir sem equipamento cria a segunda vítima. Use o método padronizado: o comando de solo do cesto.'},
   {id:'esperar',label:'Esperar o Rogério acordar para descer sozinho.',feedback:'Vítima inconsciente em altura corre risco a cada minuto. O resgate começa imediatamente.'}
  ]},
 {id:'tempo',cam:'alto',refs:[anexo3('item 2, tópico 4 (condições impeditivas)'),nr10('10.6.3'),pratica('Regra dos 30 s / 30 min','intervalo entre o clarão e o trovão')],...at(spots.truckSide,1.8),
  title:'Condição impeditiva: tempestade',description:'Lúcia assumiu a troca no cesto. O céu fecha e o trovão vem 12 s depois do relâmpago.',
  tip:'Descargas atmosféricas são condição impeditiva no SEP. Serviços em instalações energizadas ou em suas proximidades são suspensos de imediato na iminência de perigo (10.6.3). Pela boa prática, aguarde 30 min depois do último trovão.',
  choices:[
   {id:'suspender',correct:true,label:'Suspender na hora: descer o cesto, recolher a equipe no caminhão fechado, longe do poste, e só retomar 30 minutos depois do último trovão, com nova verificação do local.',feedback:'Serviço suspenso a tempo e retomada segura.'},
   {id:'terminar',label:'Falta pouco: terminar a troca antes que a chuva aperte.',feedback:'Raio a cerca de 4 km já é perigo. Rede e cesto atraem descargas, mesmo desligados.'},
   {id:'aterrado',label:'Como o ramal está aterrado, não há risco de raio; pode continuar.',feedback:'O aterramento temporário não protege contra descarga atmosférica direta ou próxima. Suspenda.'}
  ]},
 {id:'liberacao',refs:[nr10('10.5.2'),nr10('10.7.9')],...at(spots.sepTable,1.6),
  title:'Libere o ramal para operação',description:'A chuva passou e a troca terminou. Faça a liberação para o centro de operação religar.',
  tip:'A reenergização segue o 10.5.2 e, no SEP, a liberação é comunicada formalmente ao centro de operação (10.7.9).',
  choices:[
   {id:'liberar',correct:true,label:'Recolher ferramentas, tirar todos da área, retirar os aterramentos (fases primeiro, terra por último), retirar a sinalização e comunicar ao centro de operação que o ramal está liberado, com o número da manobra.',feedback:'Liberação completa e comunicada: o centro de operação pode religar.'},
   {id:'religa',label:'Avisar o centro de operação para religar e depois retirar o aterramento com calma.',feedback:'Religar com o aterramento instalado provoca curto e arco. O aterramento sai antes da liberação.'},
   {id:'sumir',label:'Retirar tudo e ir embora; a distribuidora percebe que o serviço acabou.',feedback:'A liberação é comunicada ao centro de operação. Sem aviso, a manobra fica descontrolada.'}
  ]}
];

export const MODULES = {
 sep:{id:'sep',name:'SEP',course:'Curso complementar • 40 h',role:'Encarregado da turma (SEP)',place:'POSTE DE ENTRADA • RAMAL 13,8 KV',
  intro:'Troca dos para-raios do poste de entrada, no ramal de 13,8 kV, com a rede da distribuidora energizada ao lado. Planeje, desligue, aterre, resgate um colega e enfrente uma tempestade.',
  summary:'Você conduziu uma turma no SEP: OS específica, equipe e comunicação, manobra confirmada, aterramento contra indução, zonas do Anexo II, resgate em altura e condição impeditiva.',objectives:sep}
};
export const MODULE_IDS = Object.keys(MODULES);
export const objectivesOf = m => MODULES[m].objectives;
export const indexOf = (m,id) => objectivesOf(m).findIndex(o => o.id === id);
export const refLabel = r => `${r.norm} • ${/^\d/.test(r.item)?'item ':''}${r.item}`;
// Linha de referência mostrada no painel. A origem (em vigor, nova NR 10 ou boa prática) sempre aparece.
export const refSummary = o => o.refs.map(r => ({label:refLabel(r),kind:r.kind,status:KINDS[r.kind],check:!!r.check}));

// ---------------- Anexo II: zonas de risco e controlada ----------------
// Faixas de tensão nominal (kV) com os raios Rr (zona de risco) e Rc (zona controlada), em metros.
export const ANEXO_II = [
 [1,.20,.70],[3,.22,1.22],[6,.25,1.25],[10,.35,1.35],[15,.38,1.38],[20,.40,1.40],[30,.56,1.56],[36,.58,1.58],[45,.63,1.63],[60,.83,1.83],
 [70,.90,1.90],[110,1.00,2.00],[132,1.10,3.10],[150,1.20,3.20],[220,1.60,3.60],[275,1.80,3.80],[380,2.50,4.50],[480,3.20,5.20],[700,5.20,7.20]
];
export function radii(kv){const row=ANEXO_II.find(([max])=>kv<max)||ANEXO_II.at(-1);return {rr:row[1],rc:row[2]};}
export function zoneOf(kv,d){const {rr,rc}=radii(kv);return d<=rr?'risco':d<=rc?'controlada':'livre';}
export const ZONE_LABEL = {risco:'ZONA DE RISCO',controlada:'ZONA CONTROLADA',livre:'ZONA LIVRE'};

// ---------------- Estado do jogo ----------------
export const initialState = (module=MODULE_IDS[0]) => ({module,step:0,feedback:'',errors:0,completed:[],finished:false});
export const done = (s,id) => s.completed.includes(id);
export const currentTarget = s => objectivesOf(s.module)[s.step];
function advance(s,next,id){
 const list=objectivesOf(s.module);next.completed=[...s.completed,id];next.step=s.step+1;next.finished=next.step===list.length;
 return next;
}
export function answer(s,choiceId){
 const o=currentTarget(s);const c=o?.choices?.find(x=>x.id===choiceId);if(!c)return s;
 if(!c.correct)return {...s,errors:s.errors+1,feedback:c.feedback};
 return advance(s,{...s,feedback:c.feedback},o.id);
}
const ACTION_FEEDBACK = {
 sinalizar:'Circuito liberado para o serviço: seccionado, bloqueado, sem tensão, aterrado, protegido e sinalizado.',
 sinalizacao:'Área isolada e sinalizada: cones, fita zebrada e placas de homens trabalhando.'
};
export function interact(s,id){
 const o=currentTarget(s);if(!o||o.id!==id)return s;
 if(o.choices)return {...s,feedback:'Escolha uma das opções.'};
 return advance(s,{...s,feedback:ACTION_FEEDBACK[id]||''},id);
}

// ---------------- Circuito em trabalho (painel elétrico) ----------------
// tone: perigo (energizado), atencao (seccionado/bloqueado, ainda não constatado), seguro (sem tensão, aterrado).
export function circuit(s){
 const d=id=>done(s,id),o=currentTarget(s);
 if(s.module==='formacao'){
  const c={name:'CCM-2 • bomba de recalque',kv:.38};
  if(d('reenergizar'))return {...c,state:'Reenergizado',tone:'perigo'};
  if(d('sinalizar'))return {...c,state:'Liberado para serviço',tone:'seguro'};
  if(d('aterrar'))return {...c,state:d('proteger')?'Aterrado • QGBT protegido':'Aterrado',tone:'seguro'};
  if(d('testar'))return {...c,state:'Sem tensão (constatado)',tone:'seguro'};
  if(d('bloquear'))return {...c,state:'Seccionado e bloqueado',tone:'atencao'};
  if(d('seccionar'))return {...c,state:'Seccionado',tone:'atencao'};
  return {...c,state:'Energizado',tone:'perigo'};
 }
 if(s.module==='reciclagem'){
  if(o?.id==='capacitor')return {name:'Banco de capacitores',kv:.38,state:'Bloqueado • carga armazenada',tone:'atencao'};
  if(o?.id==='gerador')return {name:'String box fotovoltaica',kv:.8,dc:true,state:'Lado CC energizado (sol)',tone:'perigo'};
  if(o?.id==='incendio')return {name:'Banco de capacitores',kv:.38,state:'Fumaça e chama',tone:'perigo'};
  if(d('capacitor')&&!d('incendio'))return {name:'QGBT-2 (novo)',kv:.38,state:'Energizado',tone:'perigo'};
  return {name:'QGBT-2 (novo)',kv:.38,state:'Energizado',tone:'perigo'};
 }
 const c={name:'Ramal 13,8 kV • poste de entrada',kv:13.8};
 if(d('liberacao'))return {...c,state:'Liberado ao centro de operação',tone:'perigo'};
 if(d('aterramento'))return {...c,state:'Sem tensão e aterrado',tone:'seguro'};
 if(d('detector'))return {...c,state:'Sem tensão (constatado)',tone:'seguro'};
 if(d('manobra'))return {...c,state:'Chave aberta e bloqueada',tone:'atencao'};
 return {...c,state:'Energizado',tone:'perigo'};
}
// Partes energizadas expostas no momento (para as zonas no cenário e a distância no painel).
export function hazards(s){
 const d=id=>done(s,id),o=currentTarget(s),list=[live.rede];
 if(s.module==='sep'){if(!d('detector')||d('liberacao'))list.push(live.ramal);}
 else list.push(live.ramal);
 if(s.module==='formacao'){
  list.push(live.qgbt);
  if(!d('testar')||d('reenergizar'))list.push(live.ccm);
  if(o?.id==='choque')list.push(live.maquina);
 }
 if(s.module==='reciclagem'){
  list.push(live.qgbt,live.stringBox);
  if(!d('capacitor'))list.push(live.capacitor);
 }
 return list;
}

// ---------------- Hora e clima ----------------
// Só o módulo SEP tem tempestade, na etapa "tempo". Atraso do trovão em segundos; null = sem raios.
const CLOCK = {
 formacao:['07:30','07:45','08:00','08:15','08:25','08:35','08:45','09:00','09:05','09:10','09:15','09:20','09:25','10:10','10:15','11:30'],
 reciclagem:['08:00','08:20','08:40','09:10','09:40','10:10','10:40','11:00','13:30','14:10','15:00','16:00'],
 sep:['07:00','07:10','07:20','07:30','07:40','07:45','07:50','08:00','08:10','08:20','08:30','08:40','09:30','10:10','11:20']
};
export function weather(m,step){
 const list=objectivesOf(m),i=Math.max(0,Math.min(list.length-1,step)),clock=CLOCK[m][i];
 if(m!=='sep')return {clock,dark:0,rain:0,wind:.1,thunderDelay:null};
 const t=indexOf('sep','tempo');
 if(i===t)return {clock,dark:.85,rain:.7,wind:.7,thunderDelay:12};
 if(i===t+1)return {clock,dark:.12,rain:0,wind:.2,thunderDelay:null};
 if(i===t-1)return {clock,dark:.2,rain:0,wind:.3,thunderDelay:null};
 return {clock,dark:0,rain:0,wind:.15,thunderDelay:null};
}
export const thunderDistance = seconds => Math.round(343*seconds);
export const inDangerRange = seconds => seconds<=30;
// Áreas caminháveis: pátio da fábrica; estruturas entram como obstáculos {x,z,w,d}.
export function canMove(x,z,obstacles){
 const site=x>-21&&x<26&&z>-13.4&&z<12.4;
 return site&&!obstacles.some(o=>Math.abs(x-o.x)<o.w/2+.32&&Math.abs(z-o.z)<o.d/2+.32);
}
