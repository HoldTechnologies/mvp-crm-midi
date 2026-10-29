// Ficha do negócio: a faixa de produção, um painel por etapa e as ações de cada perfil.
(() => {
  const A = window.App;
  const { html, raw, icon, avatar } = A;
  const dash = () => raw('<span class="faint">—</span>');
  const find = (id) => A.S.deals.find((d) => d.id === id);
  const clientOf = (d) => A.S.clients.find((c) => c.id === d.clientId);
  const names = (ids) => ids.map(A.user).filter(Boolean);
  const peopleLine = (ids) => html`<span style="display:inline-flex;flex-wrap:wrap;gap:6px 12px">${names(ids).map((u) => html`<span style="display:inline-flex;gap:6px;align-items:center">${avatar(u, 20)}${u.name}</span>`)}</span>`;
  const parseMoney = (s) => { const v = Number(String(s).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return Number.isFinite(v) ? Math.round(v * 100) / 100 : NaN; };
  const moneyInput = (v) => (v == null ? '' : String(v.toFixed(2)).replace('.', ','));
  function done(title, lines) { A.save(); A.toast(title, lines); A.render(); }

  // ---------- faixa de produção ----------
  function strip(d) {
    const cancelled = d.stage === 'cancelado';
    const curIdx = cancelled ? A.stageIndex(d.cancel.from) : A.stageIndex(d.stage);
    const entries = A.STAGES.map((s) => A.enteredAt(d, s.id));
    return html`<ol class="strip ${cancelled ? 'cancelled' : ''}" aria-label="Etapas do negócio">${A.STAGES.map((s, i) => {
      const cls = i < curIdx ? 'done' : i === curIdx ? 'current' : 'todo';
      const at = entries[i];
      let when = '';
      if (cls === 'done' && at) { const next = entries.slice(i + 1).find(Boolean) || (cancelled ? d.cancel.at : A.now()); when = `${A.dateShort(at)} · ${A.plural(Math.max(0, A.daysBetween(at, next)), 'dia', 'dias')}`; }
      if (cls === 'current') when = cancelled ? `Cancelado em ${A.dateShort(d.cancel.at)}` : s.id === 'concluido' ? `em ${A.dateShort(at)}` : `desde ${A.dateShort(at)} · ${A.plural(A.daysBetween(at, A.now()), 'dia', 'dias')}`;
      return html`<li class="${cls}" ${cls === 'current' ? raw('aria-current="step"') : ''}><div class="st-name">${s.short}</div><div class="st-when">${when || (cls === 'done' ? 'pulada' : ' ')}</div></li>`;
    })}</ol>`;
  }

  // ---------- painéis ----------
  function pConversa(d) {
    const m = d.meeting;
    const past = m.at.slice(0, 10) < A.isoDate(new Date());
    return html`<section class="panel stage-panel" aria-labelledby="p-conv">
      <header><div class="head-left"><h2 id="p-conv">Conversa inicial</h2>${past ? html`<span class="pill">Realizada</span>` : html`<span class="pill neg">Agendada</span>`}</div>
        ${A.can('pipeline.edit') && d.stage !== 'cancelado' && !past ? html`<button class="btn sm" data-act="remarcar">Remarcar</button>` : ''}</header>
      <dl class="kv"><dt>Data e hora</dt><dd>${A.dateLong(m.at)}, ${A.time(m.at)} <span class="muted">· ${A.relDay(m.at)}</span></dd>
        <dt>Participantes</dt><dd>${peopleLine(m.participants)}</dd>
        <dt>Google Agenda</dt><dd>${m.eventId ? `Evento na agenda de ${A.user(d.createdBy).name.split(' ')[0]}${A.people(m.participants.filter((p) => p !== d.createdBy)) ? `, ${A.plural(m.participants.filter((p) => p !== d.createdBy).length, 'convidado', 'convidados')}` : ''}` : past ? 'Reunião passada' : 'Evento removido'}</dd></dl>
    </section>`;
  }
  function pOrcamento(d) {
    const b = d.budget;
    return html`<section class="panel stage-panel" aria-labelledby="p-orc">
      <header><div class="head-left"><h2 id="p-orc">Orçamento</h2>${b.status === 'enviado' ? html`<span class="pill">Enviado</span>` : html`<span class="pill neg">Não enviado</span>`}</div>
        ${A.can('pipeline.edit') && d.stage === 'orcamento' ? html`<button class="btn sm" data-act="orcamento">Editar orçamento</button>` : ''}</header>
      <dl class="kv"><dt>Valor orçado</dt><dd class="num">${b.value ? A.money(b.value) : dash()}</dd><dt>Condição de pagamento</dt><dd>${b.payment || dash()}</dd></dl>
    </section>`;
  }
  function pAgendamento(d) {
    const ap = d.approval, today = A.isoDate(new Date());
    const entries = A.S.cash.filter((e) => e.dealId === d.id);
    const shoots = [...d.shoots].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    const editable = d.stage !== 'cancelado';
    return html`<section class="panel stage-panel" aria-labelledby="p-ag">
      <header><div class="head-left"><h2 id="p-ag">Aprovação e pagamento</h2>${ap ? html`<span class="pill pos">Aprovado em ${A.dateShort(A.approvedAt(d))}</span>` : ''}</div>
        ${A.can('pipeline.edit') && ap && editable ? html`<button class="btn sm" data-act="aprovacao">Editar valores</button>` : ''}</header>
      ${ap ? html`<dl class="kv" style="margin-bottom:12px"><dt>Valor aprovado</dt><dd class="num"><strong>${A.money(ap.value)}</strong>${d.budget.value && d.budget.value !== ap.value ? html` <span class="muted">· orçado ${A.money(d.budget.value)}</span>` : ''}</dd>
          <dt>Prazo de entrega</dt><dd>${d.deadline ? html`${A.dateLong(d.deadline)} <span class="muted">· ${A.relDay(d.deadline)}</span>` : dash()}</dd></dl>
        <table class="inst-table"><thead><tr><th>Parcela</th><th class="n">Data</th><th class="n">Valor</th><th class="n">No caixa</th></tr></thead>
          <tbody>${ap.installments.map((i, n) => { const e = entries.find((x) => x.instId === i.id); return html`<tr><td>${n + 1} de ${ap.installments.length}</td><td class="n">${A.dateNum(i.date)}</td><td class="n">${A.money(i.value)}</td><td class="n">${e ? (e.status === 'realizado' ? html`<span class="pill pos">Realizada</span>` : html`<span class="pill">Prevista</span>`) : html`<span class="pill outline">Fora do caixa</span>`}</td></tr>`; })}</tbody>
          <tfoot><tr><td class="muted">Soma</td><td></td><td class="n"><strong>${A.money(A.sum(ap.installments))}</strong></td><td></td></tr></tfoot></table>`
        : html`<div class="empty">Aprovação desfeita. As parcelas previstas saíram do fluxo de caixa.</div>`}
      <div class="section-head" style="margin-top:24px"><h3 class="h2">Dias de gravação</h3>${A.can('pipeline.shoots') && editable ? html`<button class="btn sm" data-act="add-shoot">${icon('plus', 14)}Adicionar dia</button>` : ''}</div>
      ${shoots.length ? html`<ul>${shoots.map((s) => html`<li class="shoot-row">
          <div><div class="shoot-date">${A.dateShort(s.date)}</div><div class="small muted">${s.start}–${s.end}</div></div>
          <div><div style="display:flex;gap:6px;align-items:baseline">${icon('pin', 14)}<span>${s.place}</span></div><div style="margin-top:6px">${peopleLine(s.responsible)}</div>
            <div class="small muted" style="margin-top:4px">${s.eventId ? (s.date < today ? 'Gravado' : `Evento na Google Agenda ${A.relDay(s.date).toLowerCase()}`) : 'Evento removido da agenda'}</div></div>
          ${A.can('pipeline.shoots') && editable && s.date >= today ? html`<div style="display:flex;gap:6px"><button class="btn sm" data-shoot="${s.id}">Remarcar</button><button class="btn sm ghost" data-rm-shoot="${s.id}">Remover</button></div>` : html`<span></span>`}
        </li>`)}</ul>`
        : html`<div class="empty">Nenhum dia de gravação marcado.</div>`}
    </section>`;
  }
  function pRoteiro(d) {
    const s = d.script;
    return html`<section class="panel stage-panel" aria-labelledby="p-rot">
      <header><div class="head-left"><h2 id="p-rot">Planejamento (roteiro)</h2>${s.link ? '' : html`<span class="pill neg">Sem link</span>`}</div>
        ${A.can('pipeline.script') && d.stage !== 'cancelado' ? html`<button class="btn sm" data-act="roteiro">Editar</button>` : ''}</header>
      <dl class="kv"><dt>Roteiro</dt><dd>${s.link ? html`<a class="link" href="${s.link}" target="_blank" rel="noopener" style="display:inline-flex;gap:6px;align-items:center">${icon('link', 14)}Abrir documento</a>` : dash()}</dd>
        <dt>Responsável</dt><dd>${s.owner ? peopleLine([s.owner]) : dash()}</dd></dl>
    </section>`;
  }
  const ACTION = { pronto: 'Marcou como pronta para aprovação', aprovado: 'Aprovou a edição', reprovado: 'Reprovou a edição' };
  function pPos(d) {
    const st = A.postState(d);
    const pill = { edicao: html`<span class="pill">Em edição</span>`, aguardando: html`<span class="pill warn">Aguardando aprovação</span>`, ajustes: html`<span class="pill neg">Reprovada · em ajustes</span>`, aprovado: html`<span class="pill pos">Aprovada</span>` }[st];
    const active = d.stage === 'pos';
    return html`<section class="panel stage-panel" aria-labelledby="p-pos">
      <header><div class="head-left"><h2 id="p-pos">Pós-produção</h2>${pill}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          ${active && A.can('pipeline.briefing') ? html`<button class="btn sm" data-act="briefing">Editar briefing</button>` : ''}
          ${active && (st === 'edicao' || st === 'ajustes') && A.can('post.ready') ? html`<button class="btn sm primary" data-act="pronto">${icon('check', 14)}Marcar edição como pronta</button>` : ''}
        </div></header>
      <dl class="kv" style="margin-bottom:16px"><dt>Briefing de edição</dt><dd style="white-space:pre-wrap">${d.post.briefing || dash()}</dd>
        <dt>Prazo de entrega</dt><dd>${d.deadline ? html`${A.dateLong(d.deadline)} <span class="muted">· ${A.relDay(d.deadline)}</span>` : dash()}</dd>
        <dt>Editor</dt><dd class="muted">Qualquer pessoa com perfil Editor</dd></dl>
      ${active && st === 'edicao' && !A.can('post.ready') ? html`<p class="small muted">Quem tem perfil Editor marca a edição como pronta; então o Gestor aprova ou reprova.</p>` : ''}
      <div class="section-head" style="margin-top:8px"><h3 class="h2">Log de aprovação</h3><span class="meta small muted">${A.plural(d.post.log.length, 'registro', 'registros')}</span></div>
      ${d.post.log.length ? html`<ol class="log">${[...d.post.log].reverse().map((l) => html`<li>${avatar(A.user(l.by), 24)}<div><div class="what">${A.user(l.by).name} · ${ACTION[l.action]}</div><div class="when">${A.dateLong(l.at)}, ${A.time(l.at)}</div>${l.comment ? html`<p class="comment">${l.comment}</p>` : ''}</div></li>`)}</ol>`
        : html`<div class="empty">Nada registrado ainda. O primeiro registro é a edição marcada como pronta.</div>`}
    </section>`;
  }

  // ---------- ações ----------
  function approvalDialog(d, advance) {
    const ap = d.approval;
    const startValue = ap ? ap.value : d.budget.value;
    const realized = new Set(A.S.cash.filter((e) => e.dealId === d.id && e.status === 'realizado').map((e) => e.instId));
    let rows = ap ? ap.installments.map((i) => ({ ...i, locked: realized.has(i.id) })) : [{ id: null, value: startValue || 0, date: A.isoDate(new Date()), locked: false }];
    let type = rows.length > 1 ? 'parc' : 'vista';
    A.dialog({
      title: advance ? 'Orçamento aprovado' : 'Editar valores da venda', wide: true, submit: advance ? 'Aprovar e ir para agendamento' : 'Salvar valores',
      body: html`${advance ? html`<p class="muted">Cada parcela entra no fluxo de caixa como entrada prevista.</p>` : html`<p class="muted">As parcelas previstas acompanham a alteração. Parcelas já realizadas ficam travadas. Toda mudança de valor fica no log.</p>`}
        <div class="form-grid">
          <div class="field"><label for="a-value">Valor aprovado (R$) *</label><input class="input num" id="a-value" name="value" inputmode="decimal" value="${moneyInput(startValue)}"></div>
          <div class="field"><label for="a-dead">Prazo de entrega <span class="faint">(opcional)</span></label><input class="input" id="a-dead" type="date" name="deadline" value="${d.deadline || ''}"></div>
          <div class="field full"><span class="label">Condição de pagamento *</span>
            <div class="segmented" role="group" aria-label="Condição de pagamento"><button type="button" data-type="vista">À vista</button><button type="button" data-type="parc">Parcelado</button></div></div>
          <div class="field full"><span class="label">Parcelas</span><div class="inst-edit" data-rows></div>
            <div style="display:flex;gap:8px;flex-wrap:wrap" data-parc-tools><button type="button" class="btn sm" data-add-row>${icon('plus', 14)}Parcela</button><button type="button" class="btn sm" data-split>Dividir igualmente</button></div>
            <div class="sumline" data-sum></div></div>
        </div>`,
      onOpen: (form) => {
        const box = form.querySelector('[data-rows]'), sumEl = form.querySelector('[data-sum]'), valueEl = form.querySelector('#a-value');
        const paint = () => {
          form.querySelectorAll('[data-type]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.type === type)));
          form.querySelector('[data-parc-tools]').hidden = type === 'vista';
          box.innerHTML = A.val(rows.map((r, i) => html`<div class="row"><span class="muted num">${i + 1}.</span>
            <label class="sr" for="r-v${i}">Valor da parcela ${i + 1}</label><input class="input num" id="r-v${i}" data-v="${i}" inputmode="decimal" value="${moneyInput(r.value)}" ${r.locked ? raw('disabled') : ''}>
            <label class="sr" for="r-d${i}">Data da parcela ${i + 1}</label><input class="input" id="r-d${i}" type="date" data-d="${i}" value="${r.date}" ${r.locked ? raw('disabled') : ''}>
            ${r.locked ? html`<span class="pill pos" title="Realizada">${icon('check', 12)}</span>` : rows.length > 1 && type === 'parc' ? html`<button type="button" class="btn icon ghost" data-rm="${i}" aria-label="Remover parcela ${i + 1}">${icon('close', 14)}</button>` : html`<span></span>`}</div>`));
          box.querySelectorAll('[data-v]').forEach((inp) => inp.addEventListener('input', () => { rows[inp.dataset.v].value = parseMoney(inp.value); sum(); }));
          box.querySelectorAll('[data-d]').forEach((inp) => inp.addEventListener('change', () => { rows[inp.dataset.d].date = inp.value; }));
          box.querySelectorAll('[data-rm]').forEach((b) => b.addEventListener('click', () => { rows.splice(Number(b.dataset.rm), 1); paint(); }));
          sum();
        };
        const sum = () => {
          const total = parseMoney(valueEl.value), s = A.sum(rows);
          const ok = Math.abs(s - total) < 0.005;
          sumEl.className = `sumline ${ok ? '' : 'bad'}`;
          sumEl.innerHTML = A.val(html`<span>Soma das parcelas</span><span class="num">${A.money(s)} de ${Number.isFinite(total) ? A.money(total) : '—'}${ok ? '' : ` · faltam ${A.money(Math.round((total - s) * 100) / 100)}`}</span>`);
        };
        form.querySelectorAll('[data-type]').forEach((b) => b.addEventListener('click', () => {
          type = b.dataset.type;
          if (type === 'vista') { const locked = rows.filter((r) => r.locked); rows = locked.length ? locked : [{ id: rows[0].id, value: parseMoney(valueEl.value) || 0, date: rows[0].date, locked: false }]; }
          else if (rows.length === 1 && !rows[0].locked) { const t = parseMoney(valueEl.value) || 0; const half = Math.floor((t / 2) * 100) / 100; const nx = new Date(A.parse(rows[0].date)); nx.setMonth(nx.getMonth() + 1); rows = [{ ...rows[0], value: half }, { id: null, value: Math.round((t - half) * 100) / 100, date: A.isoDate(nx), locked: false }]; }
          paint();
        }));
        form.querySelector('[data-add-row]').addEventListener('click', () => { const last = A.parse(rows.at(-1).date); last.setMonth(last.getMonth() + 1); rows.push({ id: null, value: 0, date: A.isoDate(last), locked: false }); paint(); });
        form.querySelector('[data-split]').addEventListener('click', () => {
          const total = parseMoney(valueEl.value); if (!Number.isFinite(total)) return;
          const free = rows.filter((r) => !r.locked), rest = Math.round((total - A.sum(rows.filter((r) => r.locked))) * 100) / 100;
          const each = Math.floor((rest / free.length) * 100) / 100;
          free.forEach((r, i) => (r.value = i === free.length - 1 ? Math.round((rest - each * (free.length - 1)) * 100) / 100 : each));
          paint();
        });
        valueEl.addEventListener('input', () => { if (type === 'vista' && rows.length === 1 && !rows[0].locked) { rows[0].value = parseMoney(valueEl.value); paint(); valueEl.focus(); } else sum(); });
        paint();
      },
      onSubmit: (fd) => {
        const value = parseMoney(fd.get('value'));
        if (!Number.isFinite(value) || value <= 0) return 'Informe o valor aprovado.';
        if (rows.some((r) => !Number.isFinite(r.value) || r.value <= 0 || !r.date)) return 'Cada parcela precisa de valor e data.';
        if (Math.abs(A.sum(rows) - value) >= 0.005) return `A soma das parcelas (${A.money(A.sum(rows))}) precisa ser igual ao valor aprovado (${A.money(value)}).`;
        const before = ap ? { value: ap.value, inst: ap.installments.map((i) => `${A.money(i.value)} em ${A.dateNum(i.date)}`).join('; ') } : null;
        const insts = rows.map((r, i) => ({ id: r.id || `${d.id}-p${A.uid('')}`, value: r.value, date: r.date }));
        d.approval = { value, installments: insts };
        d.deadline = fd.get('deadline') || null;
        const notes = [];
        if (advance) A.moveStage(d, 'agendamento');
        const r = A.syncCash(d);
        if (before) {
          const after = insts.map((i) => `${A.money(i.value)} em ${A.dateNum(i.date)}`).join('; ');
          if (before.value !== value) A.logValue({ dealId: d.id, what: 'Valor aprovado', from: A.money(before.value), to: A.money(value) });
          if (before.inst !== after) A.logValue({ dealId: d.id, what: 'Parcelas', from: before.inst, to: after });
          if (before.value !== value || before.inst !== after) notes.push('Alteração registrada no log de valores');
        }
        if (r.created) notes.unshift(`${A.plural(r.created, 'parcela prevista lançada', 'parcelas previstas lançadas')} no fluxo de caixa`);
        if (r.removed) notes.push(`${A.plural(r.removed, 'parcela prevista removida', 'parcelas previstas removidas')}`);
        if (!advance && !r.created && !r.removed) notes.push('Parcelas previstas atualizadas no fluxo de caixa');
        done(advance ? 'Orçamento aprovado' : 'Valores salvos', notes);
      },
    });
  }

  function shootDialog(d, s) {
    const x = s || { date: '', start: '08:00', end: '12:00', place: '', responsible: [] };
    A.dialog({
      title: s ? 'Remarcar dia de gravação' : 'Novo dia de gravação', wide: true, submit: s ? 'Salvar e atualizar agenda' : 'Adicionar e criar evento',
      body: html`<div class="form-grid">
        <div class="field"><label for="s-date">Data *</label><input class="input" id="s-date" type="date" name="date" value="${x.date}"></div>
        <div class="field" style="grid-template-columns:1fr 1fr;column-gap:8px"><label for="s-start">Início *</label><label for="s-end">Fim *</label><input class="input" id="s-start" type="time" name="start" value="${x.start}"><input class="input" id="s-end" type="time" name="end" value="${x.end}"></div>
        <div class="field full"><label for="s-place">Local *</label><input class="input" id="s-place" name="place" value="${x.place}" placeholder="Endereço ou nome do lugar"></div>
        <div class="field full"><span class="label">Responsáveis *</span>${A.participantsField(x.responsible, 'r')}<span class="hint">O evento é criado na sua Google Agenda e os responsáveis são convidados.</span></div></div>`,
      onSubmit: (fd) => {
        const v = { date: fd.get('date'), start: fd.get('start'), end: fd.get('end'), place: String(fd.get('place')).trim(), responsible: fd.getAll('r') };
        if (!v.date || !v.start || !v.end || !v.place) return 'Preencha data, horário e local.';
        if (v.end <= v.start) return 'O horário de fim precisa ser depois do início.';
        if (!v.responsible.length) return 'Escolha pelo menos um responsável.';
        const guests = A.people(v.responsible);
        if (s) { Object.assign(s, v); done('Dia de gravação remarcado', [`Evento atualizado na Google Agenda para ${A.dateLong(v.date)}, ${v.start}`, guests ? `${A.plural(guests, 'convidado recebe', 'convidados recebem')} a alteração` : 'Sem outros convidados']); }
        else { const id = A.uid('s'); d.shoots.push({ id, ...v, eventId: `gcal-${id}` }); done('Dia de gravação adicionado', [`Evento criado na sua Google Agenda para ${A.dateLong(v.date)}, ${v.start}`, guests ? `${A.plural(guests, 'responsável convidado', 'responsáveis convidados')}` : 'Sem outros convidados']); }
      },
    });
  }

  const ACTS = {
    remarcar(d) {
      const m = d.meeting;
      A.dialog({ title: 'Remarcar conversa inicial', wide: true, submit: 'Salvar e atualizar agenda',
        body: html`<div class="form-grid"><div class="field"><label for="m-date">Data</label><input class="input" id="m-date" type="date" name="date" value="${m.at.slice(0, 10)}"></div>
          <div class="field"><label for="m-time">Horário</label><input class="input" id="m-time" type="time" name="time" value="${A.time(m.at)}"></div>
          <div class="field full"><span class="label">Participantes</span>${A.participantsField(m.participants)}</div></div>`,
        onSubmit: (fd) => {
          if (!fd.get('date') || !fd.get('time')) return 'Informe data e horário.';
          m.at = `${fd.get('date')}T${fd.get('time')}`; m.participants = fd.getAll('p'); if (!m.participants.includes(d.createdBy)) m.participants.unshift(d.createdBy);
          m.eventId = m.eventId || `gcal-${A.uid('m')}`;
          const g = A.people(m.participants);
          done('Reunião remarcada', [`Evento atualizado na Google Agenda: ${A.dateLong(m.at)}, ${A.time(m.at)}`, g ? `${A.plural(g, 'convidado recebe', 'convidados recebem')} a alteração` : 'Sem outros convidados']);
        } });
    },
    orcamento(d) {
      const b = d.budget;
      A.dialog({ title: 'Orçamento', submit: 'Salvar',
        body: html`<div class="field"><span class="label">Situação</span><div class="segmented" role="group" aria-label="Situação do orçamento"><button type="button" data-st="nao_enviado">Não enviado</button><button type="button" data-st="enviado">Enviado</button></div><input type="hidden" name="status" value="${b.status}"></div>
          <div class="field" data-sent><label for="o-val">Valor do orçamento (R$) *</label><input class="input num" id="o-val" name="value" inputmode="decimal" value="${moneyInput(b.value)}"></div>
          <div class="field" data-sent><label for="o-pay">Condição de pagamento <span class="faint">(opcional)</span></label><input class="input" id="o-pay" name="payment" value="${b.payment}" placeholder="Ex.: 3x — 10/11, 10/12 e 10/01"></div>`,
        onOpen: (form) => {
          const hid = form.querySelector('[name=status]');
          const paint = () => { form.querySelectorAll('[data-st]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.st === hid.value))); form.querySelectorAll('[data-sent]').forEach((f) => (f.hidden = hid.value !== 'enviado')); };
          form.querySelectorAll('[data-st]').forEach((x) => x.addEventListener('click', () => { hid.value = x.dataset.st; paint(); }));
          paint();
        },
        onSubmit: (fd) => {
          const st = fd.get('status');
          if (st === 'enviado') { const v = parseMoney(fd.get('value')); if (!Number.isFinite(v) || v <= 0) return 'Orçamento enviado precisa de valor.'; b.value = v; b.payment = String(fd.get('payment')).trim(); }
          b.status = st;
          done(st === 'enviado' ? 'Orçamento marcado como enviado' : 'Orçamento salvo', st === 'enviado' ? [`${A.money(b.value)}${b.payment ? ` · ${b.payment}` : ''}`] : []);
        } });
    },
    aprovacao: (d) => approvalDialog(d, false),
    'add-shoot': (d) => shootDialog(d),
    roteiro(d) {
      A.dialog({ title: 'Planejamento (roteiro)', submit: 'Salvar',
        body: html`<div class="field"><label for="r-link">Link do roteiro</label><input class="input" id="r-link" name="link" type="url" value="${d.script.link}" placeholder="https://docs.google.com/…"></div>
          <div class="field"><label for="r-owner">Responsável <span class="faint">(opcional)</span></label><select class="input" id="r-owner" name="owner"><option value="">Ninguém</option>${A.S.users.map((u) => html`<option value="${u.id}" ${d.script.owner === u.id ? raw('selected') : ''}>${u.name}</option>`)}</select></div>`,
        onSubmit: (fd) => { const link = String(fd.get('link')).trim(); if (link && !/^https?:\/\//.test(link)) return 'O link precisa começar com http:// ou https://'; d.script.link = link; d.script.owner = fd.get('owner') || null; done('Roteiro salvo'); } });
    },
    briefing(d) {
      A.dialog({ title: 'Briefing de edição', wide: true, submit: 'Salvar',
        body: html`<div class="field"><label for="b-text">Briefing</label><textarea class="input" id="b-text" name="briefing" rows="6">${d.post.briefing}</textarea></div>
          <div class="field"><label for="b-dead">Prazo de entrega <span class="faint">(opcional)</span></label><input class="input" id="b-dead" type="date" name="deadline" value="${d.deadline || ''}"></div>`,
        onSubmit: (fd) => { d.post.briefing = String(fd.get('briefing')).trim(); if (A.can('pipeline.edit') || A.can('pipeline.briefing')) d.deadline = fd.get('deadline') || null; done('Briefing salvo'); } });
    },
    pronto(d) {
      A.dialog({ title: 'Edição pronta para aprovação', submit: 'Enviar para o Gestor',
        body: html`<div class="field"><label for="pr-c">Comentário <span class="faint">(opcional)</span></label><textarea class="input" id="pr-c" name="c" placeholder="O que mudou desde a última versão"></textarea></div>`,
        onSubmit: (fd) => { d.post.log.push({ by: A.S.userId, action: 'pronto', at: A.now(), comment: String(fd.get('c')).trim() }); done('Edição marcada como pronta', ['O Gestor pode aprovar ou reprovar.']); } });
    },
    aprovar(d) {
      A.dialog({ title: 'Aprovar pós-produção', submit: 'Aprovar e concluir',
        body: html`<p>Com a aprovação, “${d.title}” é concluído.</p><div class="field"><label for="ap-c">Comentário <span class="faint">(opcional)</span></label><textarea class="input" id="ap-c" name="c"></textarea></div>`,
        onSubmit: (fd) => { d.post.log.push({ by: A.S.userId, action: 'aprovado', at: A.now(), comment: String(fd.get('c')).trim() }); A.moveStage(d, 'concluido'); done('Negócio concluído', ['Pós-produção aprovada e registrada no log.']); } });
    },
    reprovar(d) {
      A.dialog({ title: 'Reprovar pós-produção', submit: 'Reprovar e devolver', danger: true,
        body: html`<p>O trabalho volta para a edição com seus comentários.</p><div class="field"><label for="rp-c">O que precisa mudar</label><textarea class="input" id="rp-c" name="c" rows="5"></textarea></div>`,
        onSubmit: (fd) => { d.post.log.push({ by: A.S.userId, action: 'reprovado', at: A.now(), comment: String(fd.get('c')).trim() }); done('Edição reprovada', ['Devolvida para a edição com seus comentários.']); } });
    },
    avancar(d) {
      const i = A.stageIndex(d.stage);
      if (d.stage === 'orcamento') { if (d.budget.status !== 'enviado') return A.toast('Envie o orçamento antes', ['Marque o orçamento como enviado, com valor, para registrar a aprovação.']); return approvalDialog(d, true); }
      const to = A.STAGES[i + 1];
      A.moveStage(d, to.id);
      done(`Negócio em ${to.label}`, [`Mudança registrada em ${A.dateNum(A.now())}, ${A.time(A.now())}`]);
    },
    voltar(d) {
      const cur = d.stage === 'cancelado' ? -1 : A.stageIndex(d.stage);
      const opts = A.STAGES.slice(0, cur);
      A.dialog({ title: 'Voltar etapa', submit: 'Voltar', danger: true,
        body: html`<div class="field"><label for="v-to">Voltar para</label><select class="input" id="v-to" name="to">${[...opts].reverse().map((s) => html`<option value="${s.id}">${s.label}</option>`)}</select></div><div data-cons></div>`,
        onOpen: (form) => {
          const sel = form.querySelector('#v-to'), box = form.querySelector('[data-cons]');
          const paint = () => { const c = A.consequences(d, sel.value); box.innerHTML = A.val(c.length ? html`<p class="small muted" style="margin-bottom:8px">O orçamento deixa de estar aprovado:</p><ul class="consequences">${c.map((x) => html`<li>${x}</li>`)}</ul>` : html`<p class="small muted">A volta fica registrada no histórico, com data e hora.</p>`); };
          sel.addEventListener('change', paint); paint();
        },
        onSubmit: (fd) => { const notes = A.moveStage(d, fd.get('to')); done(`Voltou para ${A.stageLabel(fd.get('to'))}`, notes.length ? notes : ['Registrado no histórico']); } });
    },
    cancelar(d) {
      const c = A.consequences(d, 'cancelado');
      A.dialog({ title: 'Cancelar negócio', submit: 'Cancelar negócio', cancel: 'Manter', danger: true,
        body: html`<p>“${d.title}” sai do pipeline e entra como cancelado na taxa de conversão.</p>
          ${c.length ? html`<ul class="consequences">${c.map((x) => html`<li>${x}</li>`)}</ul>` : ''}
          <div class="field"><label for="x-r">Motivo <span class="faint">(opcional)</span></label><textarea class="input" id="x-r" name="r" placeholder="Ex.: orçamento recusado, cliente desistiu"></textarea></div>`,
        onSubmit: (fd) => { const notes = A.moveStage(d, 'cancelado', { reason: String(fd.get('r')).trim() }); done('Negócio cancelado', notes.length ? notes : ['Registrado no histórico']); } });
    },
  };

  A.views.negocio = {
    title: (id) => (find(id) ? find(id).title : 'Negócio'),
    render(id) {
      const d = find(id);
      if (!d) return html`<div class="title-row"><div><h1>Negócio não encontrado</h1><p class="sub"><a class="link" href="#/pipeline">Voltar para o pipeline</a></p></div></div>`;
      const c = clientOf(d), i = A.stageIndex(d.stage), cancelled = d.stage === 'cancelado';
      const edit = A.can('pipeline.edit');
      const next = !cancelled && i < 4 ? A.STAGES[i + 1] : null;
      const nextLabel = { conversa: 'Ir para orçamento', orcamento: 'Orçamento aprovado', agendamento: 'Ir para roteiro', planejamento: 'Enviar para pós-produção' }[d.stage];
      const st = A.postState(d);
      const reach = cancelled ? A.stageIndex(d.cancel.from) : i;
      const panels = [pConversa, pOrcamento, pAgendamento, pRoteiro, pPos].slice(0, Math.min(reach, 4) + 1);
      if (cancelled && d.approval && reach < 2) panels.push(pAgendamento);
      const v = A.dealValue(d);
      const valLog = A.S.valueLog.filter((l) => l.dealId === d.id);
      return html`
        <div class="title-row"><div><div class="crumb"><a href="#/pipeline">Pipeline</a><span>/</span><a href="#/clientes/${c.id}">${A.clientLabel(c)}</a><span>/</span></div>
          <h1>${d.title}</h1><p class="sub">${A.clientLabel(c)} · ${c.city}${v ? ` · ${A.money(v)}${d.approval ? ' aprovados' : ' orçados'}` : ''}${d.deadline && !cancelled && d.stage !== 'concluido' ? ` · entrega ${A.relDay(d.deadline).toLowerCase()}` : ''}</p></div>
          <div class="actions">
            ${edit && i > 0 && !cancelled ? html`<button class="btn" data-act="voltar">Voltar etapa</button>` : ''}
            ${edit && !cancelled && d.stage !== 'concluido' ? html`<button class="btn" data-act="cancelar">Cancelar negócio</button>` : ''}
            ${edit && next ? html`<button class="btn primary" data-act="avancar">${nextLabel}</button>` : ''}
          </div></div>
        ${strip(d)}
        ${cancelled ? html`<div class="notice" style="background:var(--pill-neutral-bg);color:var(--text)"><span><strong>Cancelado</strong> em ${A.dateNum(d.cancel.at)} por ${A.user(d.cancel.by).name}, na etapa ${A.stageLabel(d.cancel.from)}. ${d.cancel.reason ? `Motivo: ${d.cancel.reason}` : 'Sem motivo informado.'}</span></div>` : ''}
        ${d.stage === 'pos' && st === 'aguardando' && A.can('post.approve') ? html`<div class="notice"><span><strong>Edição pronta para aprovação</strong> desde ${A.dateLong(d.post.log.at(-1).at)}, ${A.time(d.post.log.at(-1).at)}, por ${A.user(d.post.log.at(-1).by).name}.</span><span style="display:flex;gap:8px"><button class="btn" data-act="reprovar">Reprovar</button><button class="btn primary" data-act="aprovar">Aprovar</button></span></div>` : ''}
        <div class="grid top">
          <div class="s8 stack">${[...panels].reverse().map((p) => p(d))}</div>
          <div class="s4 stack rail">
            <section class="panel" aria-labelledby="r-cli"><header><h2 id="r-cli">Cliente</h2><a class="card-link" href="#/clientes/${c.id}">Ficha</a></header>
              <p style="font-weight:600">${c.name}</p><p class="small muted">${c.city}${c.contact ? ` · contato: ${c.contact}` : ''}</p>
              <p style="display:flex;gap:8px;align-items:center;margin-top:12px">${icon('folder')}${c.drive ? html`<span>Pasta “${c.drive.name}” no Drive central</span>` : html`<span class="muted">Sem pasta no Drive</span>`}</p></section>
            <section class="panel" aria-labelledby="r-hist"><header><h2 id="r-hist">Histórico de etapas</h2></header>
              <ol class="log">${[...d.history].reverse().map((h) => html`<li>${avatar(A.user(h.by), 24)}<div><div class="what">${h.stage === 'cancelado' ? 'Cancelado' : h.back ? `Voltou para ${A.stageLabel(h.stage)}` : h.stage === 'conversa' ? 'Negócio criado' : `Entrou em ${A.stageLabel(h.stage)}`}</div><div class="when">${A.user(h.by).name.split(' ')[0]} · ${A.dateNum(h.at)}, ${A.time(h.at)}</div></div></li>`)}</ol></section>
            ${valLog.length ? html`<section class="panel" aria-labelledby="r-val"><header><h2 id="r-val">Alterações de valor</h2></header>
              <ol class="log">${valLog.map((l) => html`<li>${avatar(A.user(l.by), 24)}<div><div class="what">${l.what}</div><div class="when">${A.user(l.by).name.split(' ')[0]} · ${A.dateNum(l.at)}, ${A.time(l.at)}</div><p class="comment small">${l.from} → ${l.to}</p></div></li>`)}</ol></section>` : ''}
          </div>
        </div>`;
    },
    mount(root, id) {
      const d = find(id);
      if (!d) return;
      root.querySelectorAll('[data-act]').forEach((b) => b.addEventListener('click', () => ACTS[b.dataset.act](d)));
      root.querySelectorAll('[data-shoot]').forEach((b) => b.addEventListener('click', () => shootDialog(d, d.shoots.find((s) => s.id === b.dataset.shoot))));
      root.querySelectorAll('[data-rm-shoot]').forEach((b) => b.addEventListener('click', () => {
        const s = d.shoots.find((x) => x.id === b.dataset.rmShoot);
        A.dialog({ title: 'Remover dia de gravação?', submit: 'Remover', danger: true, body: html`<p>${A.dateLong(s.date)}, ${s.start}–${s.end}, em ${s.place}. O evento sai da Google Agenda e os responsáveis são avisados.</p>`,
          onSubmit: () => { d.shoots = d.shoots.filter((x) => x !== s); done('Dia de gravação removido', ['Evento removido da Google Agenda']); } });
      }));
    },
  };
})();
