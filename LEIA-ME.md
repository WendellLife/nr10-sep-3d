# NR 10 • SEP (jogo educativo 3D)

Jogo educativo da série de jogos de segurança do trabalho, correspondente à **curso complementar de 40 h — Sistema Elétrico de Potência (Anexo III, item 2)**.

Você é o encarregado de uma turma que vai **trocar os para-raios do poste de entrada, no ramal de 13,8 kV**, com a rede da distribuidora energizada ao lado. OS específica, equipe e comunicação, manobra confirmada, detector, **aterramento contra indução**, **zonas do Anexo II**, **resgate no cesto aéreo** e uma **tempestade** como condição impeditiva.

Os outros jogos da NR 10 da série usam a mesma fábrica e a mesma equipe: [NR 10 • Formação](https://github.com/WendellLife/nr10-formacao-3d) • [NR 10 • Reciclagem](https://github.com/WendellLife/nr10-reciclagem-3d).

> **Conteúdo educativo.** Não substitui o treinamento com carga horária, prática e avaliação, nem a autorização formal da empresa. Leia o [SAFETY-NOTES.md](SAFETY-NOTES.md).

## Como abrir

Requer Node.js 18 ou superior (ou Python 3).

- **Windows:** dê dois cliques em `INICIAR.cmd` e abra http://127.0.0.1:8765
- **Qualquer sistema:** `npm start` (ou `node server.mjs`) e abra http://127.0.0.1:8765
- **Hospedagem estática:** publique a pasta `dist/` como está. Não há build nem dependências npm. O Three.js 0.170.0 está em `dist/`.

## Controles

| Ação | Teclado | Celular |
|---|---|---|
| Mover | WASD ou setas | botões de seta na tela |
| Correr | Shift | — |
| Interagir | E | botão AÇÃO |
| Fontes e origem do conteúdo | botão **Fontes** | botão **Fontes** |
| Pausar | Esc ou botão Ⅱ | botão Ⅱ |

O losango verde é você. O losango azul, o alvo luminoso e as setas no chão marcam o destino.

**Painel elétrico** (canto superior direito): horário, tensão e nome do circuito em trabalho, o **estado** dele e a **zona em que você está** — livre, controlada ou de risco — em relação à parte energizada mais crítica, com a distância e os raios do Anexo II. Na tempestade, aparece a contagem entre o relâmpago e o trovão.

**Zonas no cenário:** em volta das partes energizadas, o disco vermelho é a zona de risco (Rr) e o anel amarelo, a zona controlada (Rc). Na rede de 13,8 kV, as zonas aparecem como tubos em volta dos condutores; no poste, como esferas. Quando uma parte é desenergizada e a ausência de tensão é constatada, a zona dela some.

## Origem do conteúdo (muito importante)

A **nova NR 10** foi aprovada pela **Portaria MTE 737/2026** (DOU de 01/06/2026), mas **só entra em vigor em 01/06/2027**. Até lá vale o texto atual. Cada etapa mostra:

| Etiqueta | Significa |
|---|---|
| **Em vigor** | NR 10 aprovada pela Portaria MTE 598/2004, alterada pelas Portarias MTPS 508/2016 e SEPRT 915/2019. No texto em vigor, as zonas estão no **Anexo II** e os cursos no **Anexo III**. Também NR 1, NR 6, NR 7, NR 23 e NR 35 quando citadas. |
| **Nova NR 10 publicada — vigora em 01/06/2027** | Mudanças já divulgadas da Portaria MTE 737/2026, citadas sem número de item. |
| **Boa prática — não é item de NR** | Procedimento técnico útil, que não é exigência de NR. |

## Sequência das 15 etapas

| # | Etapa | Origem |
|---|---|---|
| 1 | Confira quem pode atuar no SEP | 10.7.1 • 10.7.2 • NR 10 • Anexo III (treinamento) — item 2 (pré-requisito: curso básico) |
| 2 | Onde começa e termina o SEP | NR 10 • Glossário — Sistema Elétrico de Potência (SEP) • 10.2.5 |
| 3 | Confira a ordem de serviço | 10.7.4 • 10.11.2 |
| 4 | Planeje com a equipe | 10.11.7 • 10.11.1 • NR 10 • Anexo III (treinamento) — item 2, tópico 6 (análise de risco no SEP) |
| 5 | Nada de trabalho individual | 10.7.3 • 10.11.6 |
| 6 | Garanta a comunicação | 10.7.9 |
| 7 | Confira o material de alta tensão | 10.7.8 • 10.4.3.1 • luvas isolantes de classe compatível com a tensão (classe 2 até 17 kV, IEC 60903) (boa prática) |
| 8 | Sinalize e isole a área (ação no cenário) | 10.10.1 c), d) e e) • NR 10 • Anexo III (treinamento) — item 2, tópico 14 (sinalização e isolamento de áreas) |
| 9 | Peça o desligamento | 10.5.1 a) e b) • 10.7.9 • confirmar por rádio o número da manobra e o bloqueio da chave (boa prática) |
| 10 | Constate a ausência de tensão | 10.5.1 c) • detector de AT testado antes e depois, em todas as fases (boa prática) |
| 11 | Aterre o ramal | 10.5.1 d) • NR 10 • Anexo III (treinamento) — item 2, tópico 5 (indução) |
| 12 | Respeite as zonas da rede vizinha | NR 10 • Anexo II (zonas) — 10 a 15 kV: Rr 0,38 m • Rc 1,38 m • 10.5.1 e) • 10.6.2 |
| 13 | Resgate do cesto | 10.12.2 • 10.12.3 • NR 10 • Anexo III (treinamento) — item 2, tópico 16 (remoção e atendimento de acidentados) |
| 14 | Condição impeditiva: tempestade | NR 10 • Anexo III (treinamento) — item 2, tópico 4 (condições impeditivas) • 10.6.3 • intervalo entre o clarão e o trovão (boa prática) |
| 15 | Libere o ramal para operação | 10.5.2 • 10.7.9 |

Cada decisão tem três opções, uma única correta, e cada opção tem um feedback didático.

## Personagens

| Nome | Função | Papel no jogo |
|---|---|---|
| **Você** | Encarregado da turma | Jogador |
| **Helena** | Engenheira eletricista | Supervisora, com o procedimento |
| **Rogério** | Eletricista sênior | Quer ir sozinho; passa mal no cesto |
| **Lúcia** | Eletricista | Rádio com o centro de operação; assume o cesto |
| **Bruno** | Eletricista | Só tem o básico: fica no solo |
| **Paula** | Técnica de segurança | Isola a área e atende o resgate |
| **Jair** | Operador de produção | Segue na produção, fora do serviço |

## Cenário

Fábrica com **sala elétrica de baixa tensão** (QGBT, CCM-2, banco de capacitores, prontuário com o diagrama unifilar, caixa de bloqueio e extintor de CO₂), **galpão** aberto com a furadeira, **estacionamento com geração fotovoltaica**, área de treinamento, bancada de EPI, ferramentas isoladas e escadas, **cabine primária de 13,8 kV com a medição**, **poste de entrada** com para-raios, **rede da distribuidora** na via e **caminhão com cesto aéreo**.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `dist/index.html`, `dist/style.css` | Interface (mesma da série, com painel elétrico e etiquetas de origem) |
| `dist/rules.mjs` | Regras puras e testáveis: etapas, decisões, referências, tabela do Anexo II, estado do circuito, partes energizadas e clima |
| `dist/crew.mjs` | Fases de cada pessoa da equipe e busca de rotas |
| `dist/layout.mjs` | Planta da fábrica, posições da equipe e pontos energizados |
| `dist/scenery.mjs` | Cenário 3D |
| `dist/game.mjs` | Jogo: câmera, equipe, zonas, painel elétrico, clima e diálogos |
| `dist/graphics.mjs` | Qualidade, pós-processamento, texturas, chuva e raio |
| `dist/characters.mjs` | Personagens com esqueleto, animações e poses de ação |
| `dist/models/` | Modelos GLB dos personagens |
| `server.mjs`, `INICIAR.cmd` | Servidor local (127.0.0.1:8765) |
| `manifest.mjs` | Gera o `MANIFESTO-SHA256.json` (`npm run manifest`) |
| `test.mjs` | Testes em Node puro (`npm test`) |

## Testes

```
npm test
```

Cobrem: ordem das etapas; uma única resposta certa por decisão, com feedback; todo item da NR 10 citado existe no texto em vigor; zonas citadas como Anexo II e treinamento como Anexo III; a nova NR 10 sempre identificada pela Portaria 737/2026; tabela do Anexo II; estado do circuito e partes energizadas em cada etapa; fases da equipe; e acessibilidade de todos os destinos.
