# Paleta CRM — MVP navegável

Protótipo do fluxo descrito em [`docs/intents/intent.md`](../docs/intents/intent.md), com dados de exemplo.
Sem backend, sem login Google e sem MCP: as integrações (Google Agenda, Drive) são **simuladas** e aparecem
como avisos na tela. O estado fica no `localStorage` do navegador.

## Como abrir

Abra `index.html` direto no navegador. Não há build nem dependências.

Atalhos de URL (úteis para demonstrar perfis):

| URL | Efeito |
|---|---|
| `index.html?as=u1` | entra como Marina (Administradora + Gestora) |
| `index.html?as=u2` | Rafael (Comercial) |
| `index.html?as=u3` | Bianca (Videomaker) |
| `index.html?as=u4` | Thiago (Videomaker + Editor) |
| `index.html?as=u5` | Camila (Editora) |
| `&theme=light` / `&theme=dark` | força o tema |

"Restaurar dados de exemplo", no rodapé do menu, volta tudo ao estado inicial.

## Telas

- **Pomodoro** (tela inicial): foco, pausas e ciclo configuráveis. Nota de 1 a 10 ao fim do foco (opcional). Interromper registra a duração real. O "Modo demonstração" faz cada minuto passar em 1 segundo.
- **Relatório de foco**: dia, semana, mês ou período. Mostra a nota média por hora de início (0h–23h) e a lista de sessões. Gestor e Administrador escolhem a pessoa.
- **Pipeline**: kanban e lista, com busca, filtro por etapa e ordenação.
- **Negócio**: faixa de produção com data e dias em cada etapa, e um painel por etapa:
  - **Conversa inicial:** remarcar a reunião.
  - **Orçamento:** enviado ou não, com valor.
  - **Aprovação:** parcelas que precisam somar o valor aprovado e entram no caixa como previstas.
  - **Dias de gravação:** com local e responsáveis.
  - **Roteiro:** link e responsável.
  - **Pós-produção:** briefing, e o ciclo pronto → aprovar/reprovar com log.

  Também é possível voltar etapa e cancelar, e o diálogo mostra as consequências antes de confirmar.
- **Clientes**: lista, ficha com pasta no Drive e histórico de negócios. Cadastro rápido (Nome + Cidade) ou completo.
- **Calendário**: Geral ou Minhas tarefas, em dia, semana ou mês, com reuniões, gravações e prazos.
- **Dashboard de vendas**: vendas, tempo médio para fechamento, taxa de conversão e sales cycle length, calculados a partir do histórico dos negócios.
- **Fluxo de caixa**: entradas e saídas por dia, previsto × realizado, lançamentos manuais, saídas por categoria e log de alterações de valor.
- **Configurações** (Administrador): usuários com vários perfis, e as categorias do caixa.

As permissões seguem a tabela do intent §2.2. O "pipeline parcial" foi interpretado assim:

- **Videomaker:** edita os dias de gravação e o roteiro.
- **Editor:** edita o roteiro e o briefing, e marca a edição como pronta.

## Arquivos

```
index.html            entrada
css/app.css           tokens Modernist (docs/design/styles.css) + componentes; tema claro e escuro
js/data.js            dados de exemplo (datas relativas a hoje)
js/core.js            estado, permissões, regras do pipeline, automações simuladas, formatação, diálogos
js/app.js             shell, rotas (hash), tema, escolha de usuário
js/charts.js          gráficos SVG (da skill design-taste-frontend)
js/views/*.js         uma tela por arquivo
```

## Dados de exemplo a substituir

A empresa "Fotograma Filmes", as 5 pessoas da equipe, os 12 clientes, os 16 negócios, os lançamentos fixos
mensais (aluguel, pró-labore, softwares, impostos…) e as sessões de Pomodoro são fictícios. Ficam todos em `js/data.js`.
