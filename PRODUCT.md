# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

A equipe interna da **Midi**, uma produtora de vídeo. Cada pessoa entra com a própria conta e pode acumular perfis; as permissões efetivas são a soma dos perfis:

- **Administrador:** gerencia usuários, perfis e categorias do caixa.
- **Gestor:** acompanha pipeline, vendas e financeiro; aprova ou reprova a pós-produção.
- **Comercial:** cadastra clientes, conduz a conversa inicial e o orçamento.
- **Videomaker:** cuida dos dias de gravação e do roteiro; consulta suas tarefas.
- **Editor:** trabalha a pós-produção e marca a edição como pronta para aprovação.

O uso é **desktop e celular**. No escritório e na ilha de edição o uso é no desktop. Comercial e videomakers consultam agenda, tarefas e dados do negócio no celular, durante visitas e gravações.

## Product Purpose

Substituir o processo hoje manual da Midi de vendas, produção e controle financeiro por um CRM enxuto. O CRM leva cada negócio da conversa inicial até a entrega aprovada e lança as parcelas no fluxo de caixa sem retrabalho. Uma tela inicial de Pomodoro com nota de foco ajuda cada pessoa a enxergar quando rende melhor.

Sucesso: a equipe para de usar planilhas e controles paralelos. Agenda, pasta do cliente e caixa se atualizam sozinhos a partir do pipeline. O Gestor enxerga conversão, tempo de fechamento e caixa previsto × realizado sem montar relatório.

## Positioning

Um CRM feito para o ciclo de uma produtora de vídeo, não um CRM de vendas genérico. O mesmo negócio atravessa orçamento, gravação, roteiro e pós-produção com aprovação do Gestor. Esse avanço alimenta o caixa automaticamente. Um assistente de IA, via MCP, opera o sistema com exatamente as mesmas permissões de quem está logado.

## Operating Context

- Pipeline: Conversa inicial → Orçamento → Agendamento da gravação → Planejamento (roteiro) → Pós-produção → Concluído, além do estado Cancelado. Negócios podem voltar etapas, e toda mudança registra data e hora.
- Um cliente pode ter vários negócios abertos ao mesmo tempo.
- Ferramentas do dia a dia da empresa: Google Agenda (reuniões e gravações), um Drive central com uma pasta por cliente e roteiros em Google Docs.
- Ritual de aprovação da edição: o Editor marca como pronto e o Gestor aprova ou reprova com comentário. O ciclo se repete até a aprovação e tudo fica em log.
- Fonte da verdade das regras de negócio: [docs/intents/intent.md](docs/intents/intent.md).

## Capabilities and Constraints

- **Estado atual:** MVP navegável em [mvp/](mvp/): HTML, CSS e JS estáticos, sem build e sem dependências. O estado fica no `localStorage` e os dados de exemplo são fictícios. Detalhes em [mvp/README.md](mvp/README.md).
- **Objetivo do MVP:** validar o fluxo com a equipe da Midi antes de construir o sistema real.
- **Simulado no MVP:** login Google, Google Agenda, Google Drive e servidor MCP. Nesta fase a escolha de usuário substitui o login.
- **Previsto para o sistema real:** login Google (OAuth), eventos na Agenda do usuário com convidados, pasta do cliente no Drive central e servidor MCP. A IA herda as permissões do usuário, dispara as mesmas automações e deixa log marcado como ação da IA.
- **Regras que não podem se perder:** a soma das parcelas é igual ao valor aprovado, e as parcelas entram como previstas no caixa. Cancelar ou voltar para antes do Agendamento remove as parcelas previstas e os eventos futuros, mas mantém as realizadas. Toda edição de valor gera log com quem, quando e valor anterior → novo.
- **Terminologia:** negócio, etapa, parcela prevista/realizada, dias de gravação, briefing, prazo de entrega, "Minhas tarefas".
- **Fora do escopo:** nota fiscal e boletos, portal do cliente, gestão de equipamentos, envio automático de orçamento.
- **Em aberto:** a stack, a hospedagem e o banco de dados do sistema real ainda não foram decididos.

## Brand Commitments

- Interface em **português do Brasil**.
- O sistema de design é o **Modernist do projeto Paleta CRM**, definido como vinculante no intent (§10). A fonte da verdade é [docs/design/styles.css](docs/design/styles.css), com tema claro e escuro alternável pelo usuário.

## Evidence on Hand

- Especificação completa do produto: [docs/intents/intent.md](docs/intents/intent.md).
- Protótipo funcional com todas as telas: [mvp/](mvp/).
- **Não existem ainda:** dados reais da Midi (clientes, negócios, valores, equipe), logotipo ou ativos de marca da Midi, métricas de uso ou depoimentos. A empresa "Fotograma Filmes" e as pessoas em [mvp/js/data.js](mvp/js/data.js) são fictícias e não devem ser apresentadas como reais.

## Product Principles

1. **Uma tela, uma tarefa.** Nada de campos ou etapas "por via das dúvidas".
2. **O sistema faz o repetitivo.** Agenda, Drive e caixa se atualizam a partir do pipeline, não por digitação manual.
3. **Rastreabilidade onde importa.** Aprovações, mudanças de etapa e valores financeiros guardam quem fez e quando.
4. **Mesma regra para humano e IA.** O que o usuário não pode fazer na tela, a IA também não pode fazer via MCP.
5. **Mostrar a consequência antes de agir.** Ações destrutivas, como cancelar ou voltar etapa, explicam o que vai mudar no caixa e na agenda antes da confirmação.
