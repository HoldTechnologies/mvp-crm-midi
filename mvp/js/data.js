// Dados de exemplo do MVP. Todas as datas são relativas a hoje, para que a demonstração esteja sempre "viva".
// Nenhum total é digitado: os indicadores são calculados a partir destas linhas (ver core.js).
(() => {
  const pad = (n) => String(n).padStart(2, '0');
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const base = new Date(); base.setHours(0, 0, 0, 0);
  // d(-3) → data de 3 dias atrás; dt(-3, '14:00') → data e hora
  const d = (off) => { const x = new Date(base); x.setDate(x.getDate() + off); return iso(x); };
  const dt = (off, hm = '09:00') => `${d(off)}T${hm}`;
  // dia N do mês corrente (ou de outro mês, com m = -1, +1…)
  const dm = (day, m = 0) => { const x = new Date(base.getFullYear(), base.getMonth() + m, day); return iso(x); };

  const users = [
    { id: 'u1', name: 'Marina Coelho', email: 'marina@fotograma.com.br', roles: ['admin', 'gestor'], hue: 18 },
    { id: 'u2', name: 'Rafael Duarte', email: 'rafael@fotograma.com.br', roles: ['comercial'], hue: 210 },
    { id: 'u3', name: 'Bianca Lopes', email: 'bianca@fotograma.com.br', roles: ['videomaker'], hue: 140 },
    { id: 'u4', name: 'Thiago Nunes', email: 'thiago@fotograma.com.br', roles: ['videomaker', 'editor'], hue: 280 },
    { id: 'u5', name: 'Camila Prado', email: 'camila@fotograma.com.br', roles: ['editor'], hue: 48 },
  ];

  const folder = (name, off) => ({ name, url: '#drive', createdAt: dt(off, '10:00') });
  const clients = [
    { id: 'c1', name: 'Padaria Trigo Fino Ltda.', fantasy: 'Trigo Fino', doc: '12.345.678/0001-90', address: 'Rua Sinimbu, 1820 — Centro, Caxias do Sul/RS', city: 'Caxias do Sul', contact: 'Helena', sector: 'Alimentação', drive: folder('Trigo Fino', -62) },
    { id: 'c2', name: 'Clínica Sorriso Pleno S/S', fantasy: 'Sorriso Pleno', doc: '23.456.789/0001-01', address: 'Av. Ipiranga, 6681 — Partenon, Porto Alegre/RS', city: 'Porto Alegre', contact: 'Dr. André', sector: 'Saúde', drive: folder('Sorriso Pleno', -95) },
    { id: 'c3', name: 'Construtora Alvorada Ltda.', fantasy: 'Alvorada', doc: '34.567.890/0001-12', address: 'Rua Bento Gonçalves, 2400 — Centro, Novo Hamburgo/RS', city: 'Novo Hamburgo', contact: 'Paulo', sector: 'Construção civil', drive: folder('Alvorada', -30) },
    { id: 'c4', name: 'Cervejaria Vale do Lúpulo Ltda.', fantasy: 'Vale do Lúpulo', doc: '45.678.901/0001-23', address: 'Estrada Linha Nova, km 4 — Gramado/RS', city: 'Gramado', contact: 'Lucas', sector: 'Bebidas', drive: folder('Vale do Lúpulo', -48) },
    { id: 'c5', name: 'Escola de Idiomas Ponte Ltda.', fantasy: 'Ponte Idiomas', doc: '56.789.012/0001-34', address: 'Rua Padre Chagas, 300 — Moinhos de Vento, Porto Alegre/RS', city: 'Porto Alegre', contact: 'Fernanda', sector: 'Educação', drive: folder('Ponte Idiomas', -3) },
    { id: 'c6', name: 'Academia Forma Viva', fantasy: '', doc: '', address: '', city: 'Canoas', contact: 'Jonas', sector: 'Fitness', drive: folder('Academia Forma Viva', -50) },
    { id: 'c7', name: 'Café Torra Clara', fantasy: '', doc: '', address: '', city: 'Porto Alegre', contact: 'Bruna', sector: 'Alimentação', drive: folder('Café Torra Clara', -2) },
    { id: 'c8', name: 'Hotel Serra Azul Ltda.', fantasy: 'Serra Azul', doc: '67.890.123/0001-45', address: 'Av. Osvaldo Oliveira, 455 — Canela/RS', city: 'Canela', contact: 'Rodrigo', sector: 'Turismo', drive: folder('Serra Azul', -9) },
    { id: 'c9', name: 'Imobiliária Casa Norte Ltda.', fantasy: 'Casa Norte', doc: '78.901.234/0001-56', address: 'Rua Independência, 800 — São Leopoldo/RS', city: 'São Leopoldo', contact: 'Simone', sector: 'Imóveis', drive: folder('Casa Norte', -70) },
    { id: 'c10', name: 'Studio Pilates Equilíbrio', fantasy: '', doc: '', address: '', city: 'Porto Alegre', contact: '', sector: '', drive: folder('Studio Pilates Equilíbrio', -33) },
    { id: 'c11', name: 'Vinícola Pedra Alta', fantasy: '', doc: '', address: '', city: 'Bento Gonçalves', contact: '', sector: 'Bebidas', drive: folder('Vinícola Pedra Alta', -1) },
    { id: 'c12', name: 'Ótica Visão Clara', fantasy: '', doc: '', address: '', city: 'Caxias do Sul', contact: '', sector: '', drive: folder('Ótica Visão Clara', -26) },
  ];

  // histórico de etapas: [etapa, dias atrás, quem, voltou?]
  const hist = (by, ...steps) => steps.map(([stage, off, back]) => ({ stage, at: dt(off, '11:00'), by, back: !!back }));
  // parcelas: [valor, dia relativo]
  const inst = (deal, ...rows) => rows.map(([value, off], i) => ({ id: `${deal}-p${i + 1}`, value, date: d(off) }));
  const shoot = (id, off, start, end, place, who) => ({ id, date: d(off), start, end, place, responsible: who, eventId: `gcal-${id}` });

  const deals = [
    { id: 'n1', clientId: 'c1', title: 'Vídeo institucional 2026', stage: 'concluido', createdBy: 'u2',
      meeting: { at: dt(-62, '10:00'), participants: ['u2', 'u1'], eventId: 'gcal-n1m' },
      budget: { status: 'enviado', value: 7200, payment: 'Parcelado em 2x' },
      approval: { value: 6800, installments: inst('n1', [3400, -50], [3400, -20]) },
      deadline: d(-31), shoots: [shoot('s1', -47, '07:30', '12:00', 'Padaria — Rua Sinimbu, 1820', ['u3', 'u4'])],
      script: { link: 'https://docs.google.com/document/d/roteiro-trigo-fino', owner: 'u3' },
      post: { briefing: 'Corte de 90s para o site e 3 cortes de 15s para stories. Trilha calma, luz da manhã.', log: [
        { by: 'u5', action: 'pronto', at: dt(-33, '17:20'), comment: '' },
        { by: 'u1', action: 'aprovado', at: dt(-30, '09:05'), comment: 'Ficou ótimo, pode enviar.' } ] },
      history: hist('u2', ['conversa', -62], ['orcamento', -58], ['agendamento', -50], ['planejamento', -45], ['pos', -38], ['concluido', -30]) },

    { id: 'n2', clientId: 'c4', title: 'Lançamento da cerveja sazonal', stage: 'pos', createdBy: 'u2',
      meeting: { at: dt(-40, '15:00'), participants: ['u2', 'u1'], eventId: 'gcal-n2m' },
      budget: { status: 'enviado', value: 9500, payment: 'Parcelado em 3x' },
      approval: { value: 9500, installments: inst('n2', [3200, -30], [3150, -2], [3150, 28]) },
      deadline: d(3), shoots: [shoot('s2', -24, '13:00', '19:00', 'Cervejaria — Estrada Linha Nova, km 4, Gramado', ['u3', 'u4']), shoot('s3', -23, '08:00', '12:00', 'Cervejaria — Estrada Linha Nova, km 4, Gramado', ['u4'])],
      script: { link: 'https://docs.google.com/document/d/roteiro-sazonal', owner: 'u1' },
      post: { briefing: 'Filme de 60s para o lançamento + versão vertical de 30s. Destacar a colheita do lúpulo e o rótulo novo no fim.', log: [
        { by: 'u5', action: 'pronto', at: dt(-3, '18:40'), comment: '' },
        { by: 'u1', action: 'reprovado', at: dt(-2, '10:15'), comment: 'O rótulo aparece pouco no fim. Segurar 2s a mais no último plano e subir a trilha.' },
        { by: 'u5', action: 'pronto', at: dt(0, '09:40'), comment: 'Último plano estendido e trilha ajustada.' } ] },
      history: hist('u2', ['conversa', -40], ['orcamento', -36], ['agendamento', -30], ['planejamento', -26], ['pos', -10]) },

    { id: 'n3', clientId: 'c2', title: 'Série de depoimentos de pacientes', stage: 'agendamento', createdBy: 'u2',
      meeting: { at: dt(-21, '14:00'), participants: ['u2'], eventId: 'gcal-n3m' },
      budget: { status: 'enviado', value: 7200, payment: '50% na aprovação, 50% na entrega' },
      approval: { value: 7200, installments: inst('n3', [3600, -5], [3600, 25]) },
      deadline: d(30), shoots: [shoot('s4', 2, '09:00', '12:00', 'Sorriso Pleno — Av. Ipiranga, 6681', ['u3']), shoot('s5', 9, '14:00', '17:30', 'Sorriso Pleno — Av. Ipiranga, 6681', ['u3', 'u4'])],
      script: { link: '', owner: null }, post: { briefing: '', log: [] },
      history: hist('u2', ['conversa', -21], ['orcamento', -18], ['agendamento', -6]) },

    { id: 'n4', clientId: 'c3', title: 'Drone da obra Residencial Ipê', stage: 'planejamento', createdBy: 'u2',
      meeting: { at: dt(-30, '09:30'), participants: ['u2', 'u3'], eventId: 'gcal-n4m' },
      budget: { status: 'enviado', value: 4800, payment: 'À vista' },
      approval: { value: 4800, installments: inst('n4', [4800, -14]) },
      deadline: d(12), shoots: [shoot('s6', -3, '06:30', '09:00', 'Obra Residencial Ipê — Rua Marcílio Dias, Novo Hamburgo', ['u3'])],
      script: { link: 'https://docs.google.com/document/d/roteiro-ipe', owner: 'u3' }, post: { briefing: '', log: [] },
      history: hist('u2', ['conversa', -30], ['orcamento', -25], ['agendamento', -15], ['planejamento', -4]) },

    { id: 'n5', clientId: 'c8', title: 'Tour do hotel para redes sociais', stage: 'orcamento', createdBy: 'u2',
      meeting: { at: dt(-9, '11:00'), participants: ['u2', 'u1'], eventId: 'gcal-n5m' },
      budget: { status: 'enviado', value: 5400, payment: 'Parcelado em 2x' },
      approval: null, deadline: null, shoots: [], script: { link: '', owner: null }, post: { briefing: '', log: [] },
      history: hist('u2', ['conversa', -9], ['orcamento', -7], ['agendamento', -6], ['orcamento', -5, true]) },

    { id: 'n6', clientId: 'c5', title: 'Campanha de matrículas 2027', stage: 'orcamento', createdBy: 'u2',
      meeting: { at: dt(-3, '16:00'), participants: ['u2'], eventId: 'gcal-n6m' },
      budget: { status: 'nao_enviado', value: null, payment: '' },
      approval: null, deadline: null, shoots: [], script: { link: '', owner: null }, post: { briefing: '', log: [] },
      history: hist('u2', ['conversa', -3], ['orcamento', -1]) },

    { id: 'n7', clientId: 'c7', title: 'Pacote de reels mensais', stage: 'conversa', createdBy: 'u2',
      meeting: { at: dt(1, '10:00'), participants: ['u2', 'u1'], eventId: 'gcal-n7m' },
      budget: { status: 'nao_enviado', value: null, payment: '' },
      approval: null, deadline: null, shoots: [], script: { link: '', owner: null }, post: { briefing: '', log: [] },
      history: hist('u2', ['conversa', -2]) },

    { id: 'n8', clientId: 'c11', title: 'Vídeo da vindima', stage: 'conversa', createdBy: 'u2',
      meeting: { at: dt(4, '15:30'), participants: ['u2', 'u3'], eventId: 'gcal-n8m' },
      budget: { status: 'nao_enviado', value: null, payment: '' },
      approval: null, deadline: null, shoots: [], script: { link: '', owner: null }, post: { briefing: '', log: [] },
      history: hist('u2', ['conversa', -1]) },

    { id: 'n9', clientId: 'c6', title: 'Aulas gravadas para o app', stage: 'cancelado', createdBy: 'u2',
      meeting: { at: dt(-50, '18:00'), participants: ['u2'], eventId: null },
      budget: { status: 'enviado', value: 8900, payment: 'Parcelado em 4x' },
      approval: null, deadline: null, shoots: [], script: { link: '', owner: null }, post: { briefing: '', log: [] },
      cancel: { reason: 'Orçamento acima do previsto pelo cliente.', at: dt(-30, '11:00'), by: 'u2', from: 'orcamento' },
      history: hist('u2', ['conversa', -50], ['orcamento', -44], ['cancelado', -30]) },

    { id: 'n10', clientId: 'c9', title: 'Tour virtual de imóveis', stage: 'cancelado', createdBy: 'u2',
      meeting: { at: dt(-70, '10:00'), participants: ['u2', 'u1'], eventId: null },
      budget: { status: 'enviado', value: 6000, payment: 'Parcelado em 4x' },
      approval: { value: 6000, installments: inst('n10', [1500, -60]) },
      deadline: null, shoots: [], script: { link: '', owner: null }, post: { briefing: '', log: [] },
      cancel: { reason: 'Cliente adiou o projeto para 2027.', at: dt(-55, '15:00'), by: 'u1', from: 'agendamento' },
      history: hist('u2', ['conversa', -70], ['orcamento', -66], ['agendamento', -60], ['cancelado', -55]) },

    { id: 'n11', clientId: 'c1', title: 'Campanha de Natal', stage: 'agendamento', createdBy: 'u2',
      meeting: { at: dt(-12, '09:00'), participants: ['u2'], eventId: 'gcal-n11m' },
      budget: { status: 'enviado', value: 3900, payment: 'Parcelado em 2x' },
      approval: { value: 3900, installments: inst('n11', [1950, 5], [1950, 35]) },
      deadline: d(20), shoots: [shoot('s7', 6, '07:00', '10:30', 'Padaria — Rua Sinimbu, 1820', ['u4'])],
      script: { link: '', owner: null }, post: { briefing: '', log: [] },
      history: hist('u2', ['conversa', -12], ['orcamento', -9], ['agendamento', -2]) },

    { id: 'n12', clientId: 'c2', title: 'Vídeo da fachada nova', stage: 'concluido', createdBy: 'u2',
      meeting: { at: dt(-95, '14:00'), participants: ['u2'], eventId: null },
      budget: { status: 'enviado', value: 2500, payment: 'À vista' },
      approval: { value: 2500, installments: inst('n12', [2500, -85]) },
      deadline: d(-72), shoots: [shoot('s8', -82, '17:00', '19:00', 'Sorriso Pleno — Av. Ipiranga, 6681', ['u3'])],
      script: { link: 'https://docs.google.com/document/d/roteiro-fachada', owner: null },
      post: { briefing: 'Timelapse do pôr do sol na fachada, 30s.', log: [
        { by: 'u4', action: 'pronto', at: dt(-72, '16:00'), comment: '' },
        { by: 'u1', action: 'aprovado', at: dt(-70, '10:00'), comment: '' } ] },
      history: hist('u2', ['conversa', -95], ['orcamento', -90], ['agendamento', -85], ['planejamento', -84], ['pos', -76], ['concluido', -70]) },

    { id: 'n13', clientId: 'c4', title: 'Aftermovie do festival de inverno', stage: 'concluido', createdBy: 'u2',
      meeting: { at: dt(-48, '11:00'), participants: ['u2', 'u1'], eventId: null },
      budget: { status: 'enviado', value: 12400, payment: 'Parcelado em 3x' },
      approval: { value: 12400, installments: inst('n13', [4200, -42], [4100, -12], [4100, 18]) },
      deadline: d(-19), shoots: [shoot('s9', -36, '14:00', '23:00', 'Festival — Rua Coberta, Gramado', ['u3', 'u4']), shoot('s10', -35, '14:00', '23:00', 'Festival — Rua Coberta, Gramado', ['u3', 'u4'])],
      script: { link: 'https://docs.google.com/document/d/roteiro-festival', owner: 'u4' },
      post: { briefing: 'Aftermovie de 2min + 5 cortes verticais.', log: [
        { by: 'u4', action: 'pronto', at: dt(-24, '19:00'), comment: '' },
        { by: 'u1', action: 'reprovado', at: dt(-23, '09:30'), comment: 'Faltou o show de encerramento.' },
        { by: 'u4', action: 'pronto', at: dt(-19, '18:10'), comment: 'Show incluído aos 1:42.' },
        { by: 'u1', action: 'aprovado', at: dt(-18, '08:50'), comment: '' } ] },
      history: hist('u2', ['conversa', -48], ['orcamento', -45], ['agendamento', -42], ['planejamento', -38], ['pos', -30], ['concluido', -18]) },

    { id: 'n14', clientId: 'c12', title: 'Vídeo para Instagram', stage: 'cancelado', createdBy: 'u2',
      meeting: { at: dt(-26, '17:00'), participants: ['u2'], eventId: null },
      budget: { status: 'enviado', value: 1800, payment: 'À vista' },
      approval: null, deadline: null, shoots: [], script: { link: '', owner: null }, post: { briefing: '', log: [] },
      cancel: { reason: '', at: dt(-15, '10:00'), by: 'u2', from: 'orcamento' },
      history: hist('u2', ['conversa', -26], ['orcamento', -22], ['cancelado', -15]) },

    { id: 'n15', clientId: 'c10', title: 'Apresentação do studio', stage: 'pos', createdBy: 'u2',
      meeting: { at: dt(-33, '08:30'), participants: ['u2'], eventId: 'gcal-n15m' },
      budget: { status: 'enviado', value: 3200, payment: 'Parcelado em 2x' },
      approval: { value: 3200, installments: inst('n15', [1600, -24], [1600, 6]) },
      deadline: d(5), shoots: [shoot('s11', -9, '07:00', '10:00', 'Studio Pilates Equilíbrio — Porto Alegre', ['u4'])],
      script: { link: 'https://docs.google.com/document/d/roteiro-pilates', owner: 'u4' },
      post: { briefing: 'Vídeo de 45s mostrando os aparelhos e uma aula. Sem locução, legendas curtas.', log: [] },
      history: hist('u2', ['conversa', -33], ['orcamento', -30], ['agendamento', -24], ['planejamento', -20], ['pos', -6]) },

    { id: 'n16', clientId: 'c3', title: 'Vídeo da entrega das chaves', stage: 'concluido', createdBy: 'u2',
      meeting: { at: dt(-28, '10:30'), participants: ['u2'], eventId: null },
      budget: { status: 'enviado', value: 5600, payment: 'Parcelado em 2x' },
      approval: { value: 5600, installments: inst('n16', [2800, -20], [2800, 10]) },
      deadline: d(-5), shoots: [shoot('s12', -14, '15:00', '18:00', 'Residencial Jacarandá — Novo Hamburgo', ['u3'])],
      script: { link: 'https://docs.google.com/document/d/roteiro-chaves', owner: 'u3' },
      post: { briefing: 'Depoimentos de 4 famílias, 2min.', log: [
        { by: 'u5', action: 'pronto', at: dt(-6, '17:00'), comment: '' },
        { by: 'u1', action: 'aprovado', at: dt(-4, '09:00'), comment: '' } ] },
      history: hist('u2', ['conversa', -28], ['orcamento', -24], ['agendamento', -20], ['planejamento', -16], ['pos', -12], ['concluido', -4]) },
  ];

  // Lançamentos manuais (as parcelas das vendas entram pelo core.syncCash, nunca daqui).
  const manual = [];
  let mid = 1;
  const add = (kind, desc, value, date, category) => manual.push({ id: `m${mid++}`, kind, desc, value, date, category, status: date <= d(0) ? 'realizado' : 'previsto' });
  for (const m of [-2, -1, 0, 1]) {
    add('out', 'Aluguel do estúdio', 2200, dm(5, m), 'Custos fixos');
    add('out', 'Pró-labore dos sócios', 6000, dm(5, m), 'Pró-labore e salários');
    add('out', 'Salário — editora', 3400, dm(5, m), 'Pró-labore e salários');
    add('out', 'Adobe Creative Cloud (3 licenças)', 375, dm(12, m), 'Softwares e assinaturas');
    add('out', 'Google Workspace', 168, dm(12, m), 'Softwares e assinaturas');
    add('out', 'Internet e energia', 520, dm(15, m), 'Custos fixos');
    add('out', 'Contador', 650, dm(18, m), 'Custos fixos');
    add('out', 'Simples Nacional', 1240, dm(20, m), 'Impostos e taxas');
  }
  add('out', 'Cinegrafista freelancer — festival (2 diárias)', 1600, d(-34), 'Freelancers e equipe');
  add('out', 'Combustível e pedágio — Gramado', 380, d(-35), 'Deslocamento');
  add('out', 'Hospedagem equipe — Gramado', 720, d(-36), 'Deslocamento');
  add('out', 'Alimentação — gravação festival', 310, d(-35), 'Alimentação');
  add('out', 'Aluguel de lente 24-70mm', 280, d(-24), 'Equipamentos');
  add('out', 'Combustível — cervejaria', 190, d(-24), 'Deslocamento');
  add('out', 'Bateria extra para drone', 890, d(-16), 'Equipamentos');
  add('out', 'Trilha licenciada — sazonal', 145, d(-8), 'Softwares e assinaturas');
  add('out', 'Assistente de produção — depoimentos', 450, d(2), 'Freelancers e equipe');
  add('out', 'Anúncio no Instagram', 300, d(-6), 'Marketing');
  add('in', 'Locação de equipamento para parceiro', 600, d(-11), 'Outras receitas');
  add('in', 'Oficina de vídeo para celular', 900, d(14), 'Outras receitas');
  // saldo de abertura, para o caixa não começar do zero, e dois pendentes vencidos para o painel Atrasados
  add('in', 'Saldo em conta na implantação do CRM', 48000, dm(1, -3), 'Outras receitas');
  manual.push({ id: `m${mid++}`, kind: 'out', desc: 'Manutenção da câmera principal', value: 640, date: d(-9), category: 'Equipamentos', status: 'previsto' });
  manual.push({ id: `m${mid++}`, kind: 'in', desc: 'Reembolso de diárias — parceiro', value: 1200, date: d(-40), category: 'Outras receitas', status: 'previsto' });

  const categories = {
    in: ['Venda de projeto', 'Outras receitas'],
    out: ['Freelancers e equipe', 'Equipamentos', 'Locação e cenário', 'Deslocamento', 'Alimentação', 'Softwares e assinaturas', 'Marketing', 'Custos fixos', 'Pró-labore e salários', 'Impostos e taxas', 'Outras despesas'],
  };

  // Sessões de Pomodoro: geradas por um gerador com semente, para que cada carga dê os mesmos números.
  let seed = 20261029;
  const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
  // cada pessoa tem um ritmo: horas em que costuma focar e uma curva de concentração ao longo do dia
  const rhythm = {
    u1: { hours: [8, 9, 10, 11, 14, 15, 16], peak: 9 },
    u2: { hours: [9, 10, 11, 13, 14, 15, 16, 17], peak: 10 },
    u3: { hours: [7, 8, 9, 13, 14, 15], peak: 8 },
    u4: { hours: [10, 11, 14, 15, 16, 17, 19, 20], peak: 15 },
    u5: { hours: [9, 10, 11, 13, 14, 15, 16], peak: 10 },
  };
  const sessions = [];
  let sid = 1;
  for (const u of users) {
    const r = rhythm[u.id];
    for (let off = -45; off <= 0; off++) {
      const day = new Date(base); day.setDate(day.getDate() + off);
      if (day.getDay() === 0 || day.getDay() === 6) continue;
      // hoje: só as horas que já passaram
      const pool = off === 0 ? r.hours.filter((h) => h < new Date().getHours()) : r.hours;
      const count = off === 0 ? 4 : 3 + Math.floor(rnd() * 5);
      const hours = [...pool].sort(() => rnd() - 0.5).slice(0, count).sort((a, b) => a - b);
      for (const h of hours) {
        const startMin = h * 60 + Math.floor(rnd() * 40);
        const interrupted = rnd() < 0.14;
        const dur = interrupted ? 6 + Math.floor(rnd() * 15) : 25;
        const start = new Date(day); start.setMinutes(startMin);
        const end = new Date(start.getTime() + dur * 60000);
        const dist = Math.abs(h - r.peak);
        let rating = Math.round(Math.max(3, Math.min(10, 9.2 - dist * 0.7 + (rnd() * 2.4 - 1.2))));
        if (interrupted || rnd() < 0.18) rating = null; // nota opcional: algumas foram puladas
        sessions.push({ id: `p${sid++}`, uid: u.id, start: start.toISOString(), end: end.toISOString(), minutes: dur, rating, status: interrupted ? 'interrompida' : 'concluida' });
      }
    }
  }

  window.SEED = { users, clients, deals, manual, categories, sessions, today: d(0) };
})();
