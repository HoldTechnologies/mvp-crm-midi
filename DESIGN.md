---
name: Paleta CRM — Midi
description: CRM da produtora Midi no sistema Modernist, lido como uma ordem do dia de set.
colors:
  rec-red: "#ec3013"
  rec-red-press: "#dd2b0f"
  rec-red-deep: "#ae1800"
  rec-red-ink: "#7c1405"
  rec-tint: "#ffe0d9"
  rec-wash: "#fff2ef"
  paper: "#f3f2f2"
  panel: "#eae9e9"
  field: "#f8f4f4"
  raised: "#e0dede"
  ink: "#201e1d"
  ink-muted: "#575353"
  ink-faint: "#656161"
  divider: "color-mix(in srgb, #201e1d 40%, transparent)"
  control-line: "color-mix(in srgb, #201e1d 32%, transparent)"
  hairline: "color-mix(in srgb, #201e1d 14%, transparent)"
  rule: "color-mix(in srgb, #201e1d 10%, transparent)"
  chart-muted: "#bab6b6"
  positive: "#1d6b44"
  positive-bg: "#d7f2df"
  positive-ink: "#0b3a1c"
  warning-bg: "#fbecc8"
  warning-ink: "#6b4300"
  neutral-pill-bg: "#dcdada"
  neutral-pill-ink: "#2d2b2b"
  white: "#ffffff"
  dark-paper: "#201e1d"
  dark-panel: "#2d2b2b"
  dark-field: "#262423"
  dark-raised: "#3a3737"
  dark-ink: "#f3f2f2"
  dark-ink-muted: "#c4c0c0"
  dark-ink-faint: "#a39f9f"
  dark-rec-red: "#ff563c"
  dark-rec-red-hover: "#ff7a63"
  dark-rec-red-soft: "#ff9783"
  dark-rec-tint: "#4d170e"
  dark-rec-tint-ink: "#ffc4b8"
  dark-rec-wash: "#3a1a14"
  dark-divider: "color-mix(in srgb, #f3f2f2 40%, transparent)"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(64px, 11vw, 132px)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.045em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  kpi:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  dialog-title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 800
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
  label:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "16px"
rounded:
  none: "0px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  card: "20px"
  "6": "24px"
  "8": "32px"
components:
  button-primary:
    backgroundColor: "{colors.rec-red-press}"
    textColor: "{colors.white}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "34px"
  button-primary-hover:
    backgroundColor: "{colors.rec-red-deep}"
  button-primary-active:
    backgroundColor: "{colors.rec-red-ink}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "34px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 14px"
    height: "34px"
  input:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0 10px"
    height: "38px"
  panel:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.none}"
    padding: "{spacing.card}"
  deal-card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.3}"
  deal-card-hover:
    backgroundColor: "{colors.raised}"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    padding: "6px 8px"
    height: "32px"
  nav-item-active:
    backgroundColor: "{colors.rec-tint}"
    textColor: "{colors.rec-red-ink}"
  segmented-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  pill-neutral:
    backgroundColor: "{colors.neutral-pill-bg}"
    textColor: "{colors.neutral-pill-ink}"
    typography: "{typography.label}"
    padding: "0 8px"
    height: "22px"
  pill-positive:
    backgroundColor: "{colors.positive-bg}"
    textColor: "{colors.positive-ink}"
  pill-negative:
    backgroundColor: "{colors.rec-tint}"
    textColor: "{colors.rec-red-ink}"
  pill-warning:
    backgroundColor: "{colors.warning-bg}"
    textColor: "{colors.warning-ink}"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    padding: "12px 14px 12px 16px"
---

# Design System: Paleta CRM — Midi

## Overview

**Creative North Star: "A Ordem do Dia"**

Num set, a ordem do dia é a folha que diz quem está onde, a que horas e fazendo o quê. Ela é impressa em linhas, separada por réguas e lida em segundos por gente com as mãos ocupadas. O CRM da Midi segue essa folha: informação densa organizada por réguas e peso tipográfico, sem ornamento, para Comercial, Videomakers, Editores e Gestor acharem a próxima ação de relance, no desktop ou no celular durante uma gravação.

O sistema é o **Modernist** do Paleta CRM ([docs/design/styles.css](docs/design/styles.css)). Tem cantos retos em tudo, divisórias marcadas de 2px, títulos em Archivo 800 e um único vermelho, o **Vermelho REC**. Como a luz de gravação da câmera, ele acende só onde algo está acontecendo ou pede ação: o botão primário, a etapa atual do negócio, o item ativo do menu, a série principal dos gráficos e o foco do Pomodoro. O resto é papel, cinza e tinta.

Os controles são **firmes e táteis**: retângulos chapados que respondem ao clique com uma troca de tom e uma pressão de 1px. O sistema rejeita a cara de SaaS genérico (cantos arredondados, gradientes, ícones coloridos em círculos, cards com sombra suave) e a de painel "gamer" escuro (neon, brilho, muitos acentos, gráficos chamativos).

**Key Characteristics:**
- Raio zero em tudo. A única exceção são os avatares circulares.
- Hierarquia por réguas: 2px marcados para estrutura, 1px suave entre linhas.
- Um vermelho só, usado em marcas pequenas; as tintas claras dele preenchem áreas de seleção.
- Superfícies planas, separadas por tom. Sombra só no que flutua.
- Archivo em três pesos (400, 600, 800) e números tabulares em todo dado.
- Tema claro e escuro, derivados das mesmas escalas.

## Colors

Paleta de papel e tinta quentes, com um único sinal vermelho-alaranjado e uma escada de tintas dele para estados.

### Primary
- **Vermelho REC** (`rec-red`): a cor de destaque do sistema. Aparece no anel de foco, no cursor dos campos, na barra de progresso e no ciclo do Pomodoro em foco, no topo da etapa atual da faixa de produção, no ícone do item ativo do menu, no sublinhado da aba ativa e na série principal dos gráficos.
- **REC Pressionado** (`rec-red-press`): fundo do botão primário. Branco sobre ele tem 4.7:1; sobre o Vermelho REC teria só 4.2:1. Também marca o dia de hoje no calendário e a nota escolhida no Pomodoro.
- **REC Profundo** (`rec-red-deep`): hover do botão primário, texto em destaque sobre o papel (links, "próxima ação" atrasada no card) e a cor de valores negativos.
- **Tinta REC** (`rec-red-ink`): texto sobre as tintas claras do vermelho (item ativo, etapa atual, avisos) e o estado pressionado do botão primário.
- **Tinta Clara REC** (`rec-tint`): a área de seleção: item ativo do menu, etapa atual, eventos de gravação no calendário, faixa de aviso e pill negativa.
- **Véu REC** (`rec-wash`): o fundo mais leve, usado na caixa de consequências antes de cancelar ou voltar etapa.

### Neutral
- **Papel** (`paper`): fundo da página.
- **Painel** (`panel`): painéis, cards do kanban, faixa de KPIs, diálogos.
- **Campo** (`field`): fundo dos campos de formulário sobre o painel.
- **Elevado** (`raised`): hover de linhas, cards e itens do menu.
- **Tinta** (`ink`): texto principal. Invertida, vira o fundo do toast, o segmento ativo e os prazos de entrega no calendário.
- **Tinta Média** (`ink-muted`) e **Tinta Leve** (`ink-faint`): rótulos, metadados e cabeçalhos de tabela; etapas futuras e placeholders.
- **Divisória** (`divider`, tinta a 40%): as réguas estruturais de 2px. **Linha de Controle** (`control-line`, 32%): bordas de botões, campos e segmentos. **Fio** (`hairline`, 14%) e **Régua** (`rule`, 10%): separadores internos e linhas de tabela.

### Estados
- **Positivo** (`positive`, `positive-bg`, `positive-ink`): entradas no caixa, lançamento realizado, pill positiva.
- **Atenção** (`warning-bg`, `warning-ink`): pill de aviso. Nunca vira cor de destaque.
- **Neutro** (`neutral-pill-bg`, `neutral-pill-ink`): pill padrão e etapa atual de negócio cancelado.

### Tema escuro
Ele é derivado das mesmas escalas: o fundo vira a antiga tinta (`dark-paper`) e o painel vira o neutro 900 (`dark-panel`). O destaque sobe para o passo 500 (`dark-rec-red`) para manter contraste. Sobre ele, o texto do botão primário passa a ser tinta escura (`dark-paper`), não branco. Linhas e réguas usam o papel claro nas mesmas opacidades.

### Named Rules
**A Regra da Luz REC.** O vermelho cheio só vai em marcas pequenas: botão primário, anel de foco, barra de 4px, ícone ativo, uma série de gráfico. Áreas usam as tintas claras (`rec-tint`, `rec-wash`), nunca o vermelho cheio.

**A Regra do Sinal Único.** Não existe segunda cor de destaque. O `--color-accent-2` do Modernist não é usado no CRM. Verde e âmbar aparecem só como estado, dentro de pills e valores, nunca como decoração.

**A Regra do Dinheiro.** Na tela de caixa, entrada é sempre verde (`positive`) e saída sempre vermelha (`rec-red-deep`, o token negativo), sempre com sinal `+` ou `−`. Vale para valores, totais, barras e o card do gráfico. Valor zero fica em tinta média. Nessa tela, o Vermelho REC não pinta dado, para não ser lido como saída; ele fica só nos controles e no mês aberto do gráfico.

**A Regra do Tom sobre Tom.** Fundo tingido leva texto do mesmo matiz: verde claro com verde escuro, tinta clara REC com tinta REC. Nunca texto cinza sobre cor.

## Typography

**Fonte:** Archivo (Google Fonts), pesos 400, 600 e 800, com fallback `system-ui, sans-serif`.

**Caráter:** uma grotesca só, que faz toda a hierarquia por peso. O 800 é o carimbo da folha de produção (títulos, nomes de etapa, o timer), o 600 marca valores e o 400 carrega o resto.

### Hierarchy
- **Display** (800, `clamp(64px, 11vw, 132px)`, 0.9): só o timer do Pomodoro. É o maior elemento da interface, com tracking bem fechado.
- **Headline** (800, 28px; 24px abaixo de 760px): o título da página na linha de título.
- **KPI** (600, 26px): os números da faixa de indicadores. O número principal de cada tela sobe para 800 a 32px.
- **Dialog title** (800, 20px): título dos diálogos e dias da semana no calendário.
- **Title** (800, 16px): títulos de painel e seção. As colunas do kanban usam 800 a 14px.
- **Body** (400, 14px / 20px): todo o texto corrido, as células de tabela e os controles. A linha de subtítulo vai até 72ch.
- **Label** (400, 13px / 16px): rótulos de campo, cabeçalhos de tabela, metadados e pills (estas em 600). Sempre em caixa normal.

### Named Rules
**A Regra dos Números Tabulares.** Toda tabela, KPI, valor monetário, data e o timer usam `font-variant-numeric: tabular-nums`, para os números se alinharem como numa planilha impressa.

**A Regra da Caixa Normal.** O CRM não usa texto em caixa alta nem tracking aberto em rótulos e cabeçalhos de tabela. A hierarquia vem de cor (tinta média) e tamanho (13px), não de versalete.

## Layout

A shell é uma barra lateral fixa de 240px separada do conteúdo por uma divisória de 2px, com o canvas em padding de 32px. A 1440px o conteúdo mede 1136px, numa grade de 12 colunas com espaço de 16px entre elas (12 × 80 + 11 × 16). As divisões usadas são 8/4 (752 + 368) e 6/6 (560 + 560).

O espaçamento segue a escala de 4px do Modernist (4, 8, 12, 16, 24, 32), mais 20px para o padding interno dos painéis. A densidade é a de ferramenta: linhas de tabela de 46px, controles de 34px, campos de 38px e itens de menu de 32px.

Cada página abre com uma **linha de título**: o título em 800 à esquerda e as ações à direita, alinhadas pela base. Logo abaixo vem uma linha de filtros, e depois a grade de painéis.

**Responsivo:**
- **≤1100px:** a barra lateral vira uma gaveta em tela cheia e uma barra superior de 52px mostra onde o usuário está. A grade colapsa para uma coluna e o canvas cai para 16px de padding.
- **≤760px:** os KPIs viram pares, com o número principal na linha inteira. A faixa de produção passa para 2 colunas. O kanban mostra uma coluna por vez a 85% da largura, com scroll-snap, e a próxima aparece na borda. Tabelas marcadas como responsivas viram linhas de duas linhas. O calendário mensal reduz os eventos a marcas de 6px.
- **≤480px:** segmentados ocupam a largura toda com rolagem, e os botões do timer se dividem igualmente.

## Elevation & Depth

O sistema é plano por regra. Painéis, cards e faixas ficam no mesmo plano do papel e se distinguem só por tom (papel → painel → elevado). A profundidade de verdade é reservada às camadas que flutuam sobre a página: diálogo e toast.

### Shadow Vocabulary
- **Flutuante, tema claro** (`box-shadow: 0 12px 32px color-mix(in srgb, #2d2b2b 22%, transparent)`): diálogos e toasts.
- **Flutuante, tema escuro** (`box-shadow: 0 0 0 1px color-mix(in srgb, #f3f2f2 14%, transparent), 0 16px 40px rgba(0, 0, 0, 0.5)`): a mesma camada no escuro, com um fio claro que desenha a borda.
- **Fundo do diálogo** (`color-mix(in srgb, #2d2b2b 50%, transparent)`; 60% de preto no escuro).

### Named Rules
**A Regra do Papel Plano.** Nada que fica na página tem sombra. Card, painel, KPI e kanban se separam por tom e régua. Se um elemento precisa de sombra, ele deve estar flutuando sobre a página.

## Shapes

A forma é o retângulo: raio 0 em botões, campos, painéis, cards, pills, diálogos, segmentados e eventos do calendário. A única exceção são os avatares, círculos com cor derivada do matiz de cada pessoa.

As linhas carregam a estrutura em dois pesos:
- **2px** na divisória (tinta a 40%), sob cabeçalhos de tabela e colunas do kanban, na borda da barra lateral, na barra superior, no cabeçalho dos diálogos e sob as abas.
- **1px** suave entre linhas e células.

As marcas de estado também são geométricas:
- uma barra de 4px no topo da etapa atual e do painel do timer;
- um filete de 3px à esquerda dos eventos de gravação e de 4px à esquerda do toast;
- quadrados de 6 a 8px como marcadores de lista e de etapa concluída.

**A Regra do Cheio e do Vazado.** O que já aconteceu é cheio: painel com fundo, barra sólida, linha contínua, ponto quadrado cheio. O que ainda é pendente ou projetado é vazado: contorno tracejado de 1px sem fundo, barra hachurada, linha tracejada (5/4), ponto quadrado vazado. A hachura é padrão de listras, nunca degradê.

**A Regra da Régua no Topo.** Um painel em destaque ganha uma régua de 2px no topo: tinta para o total (a linha Caixa), negativo para Atrasados, Vermelho REC para a etapa atual. Componentes novos não usam barra colorida grossa só na lateral.

## Components

### Buttons
- **Shape:** retângulo reto (0px), 34px de altura, padding horizontal de 14px, texto em 600.
- **Primary:** fundo REC Pressionado com texto branco em 800. No hover passa a REC Profundo; pressionado, a Tinta REC. É um por tela, para a ação que avança o trabalho.
- **Secondary (padrão):** transparente, com borda de 1px na Linha de Controle e texto na tinta. No hover recebe um véu de tinta a 7%; pressionado, 14%.
- **Ghost:** como o padrão, mas sem borda.
- **Danger:** borda e texto em REC Profundo. No hover, fundo Tinta Clara REC.
- **Variações:** ícone (34 × 34), pequeno (28px, texto 13px) e, no Pomodoro, ações grandes de 44px.
- **Tátil:** todo botão desce 1px ao ser pressionado (120ms, `cubic-bezier(0.22, 1, 0.36, 1)`). Desabilitado fica com 55% de opacidade, sem resposta.

### Chips (pills)
- **Style:** 22px de altura, padding de 8px, texto 13px em 600, raio 0, sem borda.
- **Variantes:** neutra, positiva (verde), negativa (Tinta Clara REC com Tinta REC) e atenção (âmbar). A variante contorno é transparente, com fio interno na Linha de Controle e texto em tinta média.

### Cards / Containers
- **Corner Style:** 0px.
- **Background:** Painel sobre o Papel. Os cards do kanban passam a Elevado no hover e descem 1px quando pressionados.
- **Shadow Strategy:** nenhuma (ver Regra do Papel Plano).
- **Border:** nenhuma. Divisões internas usam fios de 1px.
- **Internal Padding:** 20px nos painéis e 12px nos cards do kanban.

### Inputs / Fields
- **Style:** 38px de altura, fundo Campo, borda de 1px na Linha de Controle, raio 0 e cursor de texto no Vermelho REC. O rótulo fica acima, em 13px na tinta média.
- **Hover:** a borda escurece para tinta a 55%.
- **Focus:** borda e contorno de 1px no Vermelho REC.
- **Error:** faixa abaixo do formulário com fundo Tinta Clara REC e texto Tinta REC. Na soma de parcelas, a linha de total fica em REC Profundo, em 600.
- **Segmentado:** grupo com borda de 1px e divisões internas. A opção ativa inverte para tinta cheia com texto papel.

### Navigation
- **Barra lateral:** marca da empresa no topo, grupos rotulados em 13px Tinta Leve e itens de 32px em tinta média.
- **Item:** no hover recebe fundo Elevado. O item ativo (`aria-current`) ganha fundo Tinta Clara REC, texto Tinta REC em 600 e ícone no Vermelho REC.
- **Rodapé:** contadores aparecem como pequenos blocos tingidos. O usuário logado fica no rodapé, separado por uma divisória de 2px.
- **Mobile:** abaixo de 1100px, uma barra superior de 52px com o nome da tela em 800 abre a lateral como gaveta de tela cheia.
- **Abas:** texto em tinta média. A aba ativa fica em 600 com sublinhado de 2px no Vermelho REC, sobre a régua de 2px.

### Faixa de produção (signature)
O cabeçalho de cada negócio é uma faixa de 6 células iguais sobre o Painel, separadas por fios de 1px, uma por etapa.
- **Etapas concluídas** levam um quadrado de 8px em tinta.
- **A etapa atual** recebe fundo Tinta Clara REC e uma barra de 4px no Vermelho REC no topo.
- **Etapas futuras** ficam em Tinta Leve.
- **Negócio cancelado:** a etapa atual fica neutra, com a barra em tinta.

Cada célula mostra a data e os dias na etapa.

### Timer do Pomodoro (signature)
O painel do timer tem uma barra de 4px no topo: Vermelho REC em foco, tinta nas pausas. O timer usa o Display. A barra de progresso tem 8px, e o ciclo é mostrado em segmentos de 28 × 8px. A nota de 1 a 10 é uma régua de 10 caixas de 44px; a nota escolhida preenche em REC Pressionado.

### Caixa de consequências (signature)
Fica dentro dos diálogos de cancelar e voltar etapa. É um bloco no Véu REC com uma lista de efeitos no caixa e na agenda, cada item marcado por um quadrado de 6px no Vermelho REC. Aparece antes do botão de confirmação.

### Eventos do calendário
Três tipos, distinguidos por forma e tom, nunca por cor nova:
- **reunião:** contorno de 1px;
- **gravação:** Tinta Clara REC com filete REC de 3px à esquerda;
- **prazo de entrega:** bloco de tinta cheia com texto papel.

O dia de hoje tem o número em bloco REC Pressionado.

### Faixa de KPIs
É uma barra única no Painel, dividida em células por fios de 1px. Cada célula tem o rótulo em tinta média acima e o número em KPI abaixo. O número que responde à pergunta da tela é o principal.

### Linhas de caixa (signature)
São faixas com o rótulo numa coluna de 200px à esquerda (título em 800 e subtítulo em tinta média) e três células separadas por fios de 1px, lidas da esquerda para a direita.
- **Caixa:** fundo Painel com régua de 2px em tinta no topo, como a linha de total de um documento impresso.
- **Realizado:** painel cheio.
- **Pendente:** sem fundo, com contorno e divisórias tracejadas, e valores um degrau menores.

O número em destaque de cada linha encolhe com a célula (`clamp(20px, 10.5cqi, 32px)`) e nunca quebra.
- **≤1100px:** o rótulo sobe para uma linha própria.
- **≤560px:** cada célula vira uma linha com rótulo à esquerda e valor à direita.

### Gráfico de caixa por mês
- **Barras:** um eixo único em reais, com passo redondo (1, 2, 2,5 ou 5 × 10ⁿ) e o zero mais forte. Entradas sobem em verde e saídas descem em vermelho, cada barra com o realizado encostado no zero e o previsto hachurado depois dele.
- **Linha do caixa:** em tinta, 2px, com pontos quadrados de 8px.
- **Destaques:** o mês atual tem uma faixa de fundo a 5%. O mês aberto tem o rótulo em REC Profundo 800 e um traço de 2px no Vermelho REC.
- **Card de detalhe:** é a única camada flutuante, com sombra flutuante e fundo Papel. Nunca sai da área do gráfico.

### Toast
É a tinta invertida: fundo tinta, texto papel, filete de 4px no Vermelho REC à esquerda e sombra flutuante. Entra subindo 8px em 200ms.

## Do's and Don'ts

### Do:
- **Do** manter raio 0 em todo componente novo. Só avatares são circulares.
- **Do** separar estrutura com a divisória de 2px (tinta a 40%) e linhas com fios de 1px (10–14%).
- **Do** reservar o Vermelho REC cheio para marcas pequenas e usar a Tinta Clara REC (#ffe0d9) e o Véu REC (#fff2ef) para áreas selecionadas.
- **Do** usar REC Pressionado (#dd2b0f) como fundo do botão primário, para o texto branco passar de 4.5:1.
- **Do** aplicar `tabular-nums` em todo número, valor, data e hora.
- **Do** dar a todo controle clicável uma troca de tom no hover e 1px de pressão no `:active`.
- **Do** mostrar as consequências (caixa, agenda) antes de confirmar ações destrutivas.
- **Do** derivar o tema escuro das mesmas escalas, subindo o destaque para #ff563c.

### Don't:
- **Don't** parecer SaaS genérico: nada de cantos arredondados, gradientes, ícones coloridos em círculos ou cards com sombra suave.
- **Don't** parecer painel "gamer" escuro: nada de neon, brilho, glow, vários acentos de cor ou gráficos chamativos.
- **Don't** pôr sombra em painel, card, KPI ou coluna do kanban. Sombra é só de diálogo e toast.
- **Don't** introduzir uma segunda cor de destaque nem usar verde e âmbar fora de estados.
- **Don't** pintar áreas grandes com o Vermelho REC cheio.
- **Don't** usar caixa alta com tracking aberto em rótulos ou cabeçalhos de tabela.
- **Don't** usar outra fonte além da Archivo, nem pesos fora de 400, 600 e 800.
- **Don't** pintar entrada ou saída com o Vermelho REC na tela de caixa. Dinheiro é verde (+) ou vermelho negativo (−).
- **Don't** pôr texto cinza sobre fundo tingido.
- **Don't** usar barra colorida grossa só na lateral de um card novo. Use régua de 2px no topo.
