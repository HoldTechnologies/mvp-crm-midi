# Intent — CRM para Produtora de Vídeo

> Documento de intenção: descreve **o quê** o sistema deve fazer e **por quê**, sem definir linguagens, frameworks ou arquitetura.
> Novas dúvidas, quando surgirem, ficam marcadas como **[DÚVIDA N]** e listadas na seção final.

---

## 1. Visão geral

CRM enxuto para uma empresa de videomaker, com o objetivo de **substituir um processo hoje manual** de vendas, produção e controle financeiro.

O sistema se integra com:

- **Google (OAuth)** — login no sistema e no servidor MCP, com a conta Google de cada usuário.
- **Google Agenda** — eventos de reuniões e gravações criados na agenda do próprio usuário.
- **Google Drive** — uma pasta por cliente, num **Drive central da empresa**.
- **IA via MCP** — um servidor MCP que permite a um assistente de IA operar o CRM em nome do usuário logado, com exatamente as mesmas permissões dele.

### Princípios

1. **Simplicidade máxima.** Cada tela resolve uma tarefa. Nada de campos ou etapas "por via das dúvidas".
2. **Automatizar o repetitivo.** Agenda, Drive e fluxo de caixa são atualizados pelo sistema, não pelo usuário.
3. **Rastreabilidade onde importa.** Aprovações e alterações financeiras guardam quem fez e quando.
4. **Mesma regra para humano e IA.** O que o usuário não pode fazer na tela, a IA também não pode fazer via MCP.

---

## 2. Autenticação e perfis

### 2.1 Login

- Cada usuário entra com a **sua própria conta Google**.
- O **mesmo login Google** autentica o usuário no servidor MCP. A conta do MCP precisa ser a mesma cadastrada no sistema, pois é ela que define as permissões da IA.
- Ao logar, o usuário autoriza o acesso à sua **Google Agenda**.
- As pastas de clientes ficam num **Drive central da empresa**. Os usuários precisam ter acesso a esse Drive, ou o sistema acessa por uma conta de serviço da empresa.

### 2.2 Perfis e permissões

| Perfil | Descrição |
|---|---|
| **Administrador** | Gerencia usuários, perfis e configurações. |
| **Gestor** | Visão total do pipeline, dashboards e financeiro; aprova ou reprova a pós-produção. |
| **Comercial / Vendedor** | Cadastra clientes, conduz conversas iniciais e orçamentos. |
| **Videomaker** | Responsável pelos dias de gravação; vê suas tarefas. |
| **Editor** | Responsável pela pós-produção; marca a edição como pronta. |

- Um usuário pode ter **mais de um perfil**. As permissões efetivas dele são a **soma** das permissões de todos os seus perfis.

| Área | Admin | Gestor | Comercial | Videomaker | Editor |
|---|:-:|:-:|:-:|:-:|:-:|
| Pomodoro (próprio) | ✔ | ✔ | ✔ | ✔ | ✔ |
| Relatório de Pomodoro de outros usuários | ✔ | ✔ | — | — | — |
| Clientes | ✔ | ✔ | ✔ | ver | ver |
| Pipeline — editar | ✔ | ✔ | ✔ | parcial | parcial |
| Marcar edição como pronta | — | — | — | — | ✔ |
| Aprovar / reprovar pós-produção | — | ✔ | — | — | — |
| Dashboard de vendas | ✔ | ✔ | ✔ | — | — |
| Fluxo de caixa | ✔ | ✔ | — | — | — |
| Gestão de usuários | ✔ | — | — | — | — |

---

## 3. Tela inicial — Pomodoro

A primeira tela após o login é um **timer Pomodoro**.

- Sessões de **foco** e **pausas** (curta e longa), todas com **duração personalizável** pelo usuário.
- Ciclo clássico: após N focos, pausa longa (N configurável).
- Ao fim de cada sessão de **foco**, o sistema pede uma **nota de 1 a 10** para o quanto o usuário se concentrou. A nota é **opcional**: o usuário pode pular.
- Cada sessão de foco registra: usuário, início, fim, duração real, nota (se houver) e se foi **concluída** ou **interrompida**.
- Sessões **interrompidas** também são registradas e entram no relatório, com a duração que de fato tiveram.

### 3.1 Relatório de Pomodoro

Tela para consultar as sessões do usuário:

- Lista das sessões com data, horário, duração, nota e situação (concluída / interrompida).
- **Gráfico de 24 horas**: eixo com as horas do dia (0h–23h) e, para cada hora, a **nota média** das sessões naquela hora. Sessões sem nota não entram no cálculo da média.
- A sessão conta para a **hora em que começou** (ex.: 10h50–11h15 conta para as 10h).
- Filtros: **dia, semana, mês ou período personalizado**.

---

## 4. Clientes

Cadastro de clientes.

- **Campos mínimos obrigatórios** (para cadastrar rápido, ex.: na conversa inicial): Nome e Cidade.
- **Cadastro completo:**
  - Nome (razão social);
  - Nome fantasia;
  - CNPJ ou CPF;
  - Endereço (inclui a cidade);
  - Nome do contato (ex.: "Lucas");
  - Setor — texto livre, opcional.
- Cada cliente tem **uma pasta no Drive central da empresa**, que guarda toda a "vida" dele (briefings, orçamentos, brutos, entregas…). O sistema não cria subpastas.
- Histórico do cliente: todos os negócios (projetos) dele no pipeline.

Um cliente pode ter **vários negócios**, inclusive **mais de um aberto ao mesmo tempo**. Cada negócio percorre o pipeline de forma independente.

---

## 5. Pipeline de vendas e produção

Cada **negócio** passa pelas etapas abaixo:

```
Conversa inicial → Orçamento → Agendamento da gravação → Planejamento (roteiro) → Pós-produção → Concluído
```

Além delas existe o estado **Cancelado**, para quando o cliente desiste ou o orçamento é recusado (necessário para a taxa de conversão).

### Visualização

O pipeline tem duas visualizações, e o usuário alterna entre elas:

- **Kanban**, com uma coluna por etapa;
- **Lista**, com filtros e ordenação.

### 5.1 Conversa inicial (reunião)

- Registra a reunião inicial com o cliente: **data/hora** e **participantes** (usuários do sistema).
- Ao salvar:
  1. É criado um **evento na Google Agenda do usuário** que cadastrou, e os participantes são convidados. Assim o evento aparece na agenda de cada um.
  2. O sistema **verifica se já existe a pasta do cliente no Drive central**; se não existir, **cria**.
- **Cliente novo:** é cadastrado direto daqui com Nome e Cidade (Setor opcional).
- **Remarcar** a reunião atualiza o evento na Google Agenda automaticamente (os convidados recebem a alteração).

### 5.2 Orçamento

- Status: **Não enviado** ou **Enviado**.
- Se **Enviado**:
  - **Valor do orçamento** — obrigatório.
  - **Condição de pagamento** acordada (à vista ou parcelado, com as datas), se já houver — opcional.

### 5.3 Agendamento da gravação

Chegar nesta etapa significa que **o orçamento foi aprovado**.

- **Valor aprovado** (pode diferir do orçado) — obrigatório.
- **Condição de pagamento** — obrigatória:
  - **À vista:** uma parcela com valor e data.
  - **Parcelado:** N parcelas, cada uma com valor e data. A soma das parcelas deve ser igual ao valor aprovado.
- Cada parcela entra **automaticamente no fluxo de caixa como entrada prevista**.
- **Prazo de entrega** do negócio — opcional, pode ser preenchido a partir daqui (ver 5.5).
- **N dias de gravação**, cada um com:
  - data;
  - horário (início e fim);
  - local;
  - um ou mais **usuários responsáveis**.
- Cada dia de gravação vira um **evento na Google Agenda**: ele é criado na agenda do usuário que cadastrou, e os responsáveis são convidados.
- **Remarcar** um dia de gravação atualiza o evento na Google Agenda automaticamente.

### 5.4 Planejamento da gravação (roteiro)

- Etapa intermediária entre o agendamento e a pós-produção.
- Campos:
  - **Link do roteiro** — normalmente um documento no Google Drive;
  - **Responsável** pelo roteiro — opcional, um usuário do sistema.

### 5.5 Pós-produção

- Contém o **briefing de edição**.
- **Não há editor responsável** definido por negócio: qualquer usuário com perfil Editor pode atuar.
- **Prazo de entrega:** campo do negócio, opcional, que pode ser preenchido desde a aprovação do orçamento (etapa 5.3) e editado depois.
- Fluxo de aprovação:
  1. O **Editor** marca a edição como pronta para aprovação.
  2. O **Gestor** **aprova** ou **reprova**, podendo deixar **comentários**.
  3. Se reprovar, o trabalho volta para o Editor com os comentários. O ciclo se repete até a aprovação.
- **Log** de cada ação: quem fez, o que fez (pronto / aprovado / reprovado), data, hora e comentário.
- Com a aprovação do Gestor, o negócio é **concluído**.

### 5.6 Cancelamento

- Um negócio pode ser **cancelado em qualquer etapa**.
- O usuário pode informar um **motivo** — opcional.
- Ao cancelar:
  - as parcelas **previstas saem** do fluxo de caixa;
  - as parcelas **realizadas permanecem** (o dinheiro já entrou);
  - os **eventos futuros** do negócio (reunião, gravações) são **removidos da Google Agenda**.

### 5.7 Regras gerais do pipeline

- Toda mudança de etapa registra **data/hora** (necessário para as métricas de tempo).
- Um negócio **pode voltar etapas** (ex.: de Agendamento para Orçamento). A volta também é registrada com data/hora.
- Se o negócio voltar para antes do Agendamento (o orçamento deixa de estar aprovado):
  - as parcelas **previstas saem** do fluxo de caixa (as realizadas permanecem, como no cancelamento);
  - os dias de gravação e seus **eventos na Google Agenda são removidos**.

---

## 6. Calendário

Visualização em formato de calendário com dois modos:

- **Geral:** todos os itens da empresa.
- **Minhas tarefas:** apenas o que está atribuído ao usuário logado.

Visões dia / semana / mês.

Itens exibidos:

- **Reuniões** (conversa inicial);
- **Dias de gravação**;
- **Prazos de entrega** dos negócios.

Como não há editor responsável por negócio, os **prazos de entrega aparecem em "Minhas tarefas" para todos os usuários**, independentemente do perfil.

---

## 7. Dashboard de vendas

Indicadores de desempenho, filtráveis por período:

| Indicador | Definição |
|---|---|
| **Vendas no mês** | Quantidade e valor total de negócios aprovados no mês. |
| **Tempo médio para fechamento** | Média de dias entre a conversa inicial e a aprovação do orçamento. |
| **Taxa de conversão** | Negócios aprovados ÷ negócios encerrados (aprovados + cancelados) no período. |
| **Sales Cycle Length** | Média de dias entre a conversa inicial e a conclusão do negócio (pós-produção aprovada pelo Gestor). |

Um negócio cancelado **depois** da aprovação do orçamento **conta como cancelado**: sai de "Vendas no mês" e entra como cancelado na taxa de conversão.

---

## 8. Dashboard financeiro (fluxo de caixa)

- Visão do **fluxo de caixa** da empresa: entradas, saídas e saldo por período.
- Cada lançamento é **previsto** ou **realizado**:
  - As parcelas das vendas entram automaticamente como **previstas**.
  - O usuário marca o lançamento como **realizado** quando o dinheiro de fato entra ou sai.
- **Lançar entradas e saídas** manualmente: descrição, valor, data e categoria.
- **Editar valores das vendas** (ajustar valor ou parcelas de um negócio aprovado). As parcelas previstas acompanham a alteração.
- Toda edição de valor guarda **log** (quem, quando, valor anterior → novo).

### 8.1 Categorias

Lista inicial, que o Administrador pode ajustar:

**Entradas**

| Categoria | Uso |
|---|---|
| Venda de projeto | Parcelas dos negócios (lançadas automaticamente). |
| Outras receitas | Qualquer entrada fora dos negócios. |

**Saídas**

| Categoria | Uso |
|---|---|
| Freelancers e equipe | Cinegrafistas, editores, assistentes e outros serviços avulsos. |
| Equipamentos | Compra, aluguel e manutenção de câmeras, lentes, luz, áudio. |
| Locação e cenário | Estúdio, espaço, objetos de cena, figurino. |
| Deslocamento | Combustível, transporte, hospedagem. |
| Alimentação | Refeições em gravações. |
| Softwares e assinaturas | Edição, armazenamento, trilhas, banco de imagens. |
| Marketing | Anúncios, divulgação. |
| Custos fixos | Aluguel, energia, internet, contador. |
| Pró-labore e salários | Remuneração de sócios e funcionários. |
| Impostos e taxas | Tributos, tarifas bancárias. |
| Outras despesas | Qualquer saída que não se encaixe acima. |

---

## 9. Integração com IA (MCP)

Um servidor MCP expõe o CRM para assistentes de IA.

- **Autenticação:** login via Google com a **mesma conta** que o usuário usa no sistema.
- **Permissões:** a IA atua **como o usuário** e herda exatamente as permissões dos perfis dele. Não existe permissão extra nem reduzida para a IA.
- **Capacidades:** **listar, incluir e modificar** tudo o que o sistema oferece, ou seja, todas as etapas e áreas:
  - clientes;
  - negócios e todas as etapas do pipeline (conversa inicial, orçamento, agendamento, planejamento, pós-produção, incluindo aprovar/reprovar se o usuário for Gestor, voltar etapas e cancelar);
  - calendário e tarefas;
  - sessões e relatório de Pomodoro;
  - indicadores de vendas;
  - fluxo de caixa (lançamentos e edição de valores).
- As ações feitas pela IA disparam as mesmas automações (Agenda, Drive, fluxo de caixa) e geram os mesmos logs. No log fica registrado que a ação veio da IA, em nome do usuário.

---

## 10. Identidade visual

- Tema **claro e escuro**, com alternância pelo usuário.
- Sistema de design **Modernist**, do projeto **Paleta CRM**. A fonte da verdade é [`docs/design/styles.css`](../design/styles.css), cópia do `_ds/modernist-.../styles.css` do projeto original:
  `https://claude.ai/design/p/1bfcb1af-109b-4ce2-bcf1-036d68c76894?file=Paleta+CRM.dc.html`
- Estilo: cantos retos (raio 0), divisórias marcadas, títulos em peso 800, um vermelho-alaranjado como cor de destaque.

### 10.1 Cores — tema claro

| Papel | Token | Valor |
|---|---|---|
| Fundo | `--color-bg` | `#f3f2f2` |
| Superfície (cards, inputs, diálogos) | `--color-surface` | `#eae9e9` |
| Texto | `--color-text` | `#201e1d` |
| Destaque (botão primário, links, foco) | `--color-accent` | `#ec3013` |
| Destaque secundário | `--color-accent-2` | `#e15b47` |
| Divisória | `--color-divider` | `#201e1d` a 40% |

Escalas tonais (100 → 900), usadas em estados de hover e pressionado, tags e sombras:

| Passo | Neutro | Destaque | Destaque 2 |
|---|---|---|---|
| 100 | `#f8f4f4` | `#fff2ef` | `#fff2ef` |
| 200 | `#eae7e7` | `#ffe0d9` | `#ffe0da` |
| 300 | `#d7d3d3` | `#ffc4b8` | `#ffc4b9` |
| 400 | `#bab6b6` | `#ff9783` | `#ff9784` |
| 500 | `#9b9797` | `#ff563c` | `#ef6853` |
| 600 | `#7d7979` | `#dd2b0f` | `#c94b39` |
| 700 | `#605d5d` | `#ae1800` | `#9e3526` |
| 800 | `#444141` | `#7c1405` | `#71261b` |
| 900 | `#2d2b2b` | `#4d170e` | `#471d16` |

### 10.2 Cores — tema escuro

O `styles.css` só define o tema claro. O tema escuro é derivado das mesmas escalas:

| Papel | Valor | Origem |
|---|---|---|
| Fundo | `#201e1d` | texto do tema claro |
| Superfície | `#2d2b2b` | neutro 900 |
| Texto | `#f3f2f2` | fundo do tema claro |
| Destaque | `#ff563c` | destaque 500 (mais claro, para contraste no fundo escuro) |
| Destaque secundário | `#ef6853` | destaque 2 · 500 |
| Divisória | `#f3f2f2` a 40% | — |
| Sombras | borda fina + escurecimento | conforme comentário do `styles.css` |

### 10.3 Tipografia e espaçamento

- **Fonte:** Archivo (Google Fonts), pesos 400, 600 e 800. Títulos em 800.
- **Tamanhos:** corpo 15px; h1 42 · h2 32 · h3 25 · h4 20 · h5 16 · h6 13px (caixa alta).
- **Espaçamento:** escala de 4px — 4, 8, 12, 16, 24, 32.
- **Raio de borda:** 0 em todos os tamanhos.
- **Componentes já definidos:** botões (primário, secundário, ghost, ícone), campos de formulário, radio, seletor segmentado, cards, tags, navegação, tabelas e diálogo.

---

## 11. Fora do escopo (por enquanto)

- Emissão de nota fiscal / boletos.
- Portal do cliente.
- Gestão de equipamentos.
- Envio automático de orçamento por e-mail/WhatsApp.

---

## 12. Dúvidas em aberto

Nenhuma no momento.
