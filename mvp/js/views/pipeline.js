// Pipeline: kanban e lista, e o registro de uma nova conversa inicial.
(() => {
  const A = window.App;
  const { html, raw, icon, avatar } = A;
  const P = { view: 'kanban', q: '', stage: 'abertos', sort: 'next', dir: 1 };
  try { P.view = localStorage.getItem('paleta-crm-pipeview') || 'kanban'; } catch {}

  const client = (d) => A.S.clients.find((c) => c.id === d.clientId);
  // situação da pós-produção, lida do log
  A.postState = (d) => {
    const last = d.post.log.at(-1);
    return !last ? 'edicao' : last.action === 'pronto' ? 'aguardando' : last.action === 'reprovado' ? 'ajustes' : 'aprovado';
  };
  A.stagePill = (d) => {
    if (d.stage === 'concluido') return html`<span class="pill pos">Concluído</span>`;
    if (d.stage === 'cancelado') return html`<span class="pill outline">Cancelado</span>`;
    return html`<span class="pill">${A.STAGES[A.stageIndex(d.stage)].short}</span>`;
  };
  // a próxima coisa que acontece no negócio: o que o card e a lista mostram
  A.nextUp = (d) => {
    const today = A.isoDate(new Date());
    if (d.stage === 'conversa') { const at = d.meeting.at; return at.slice(0, 10) >= today ? { text: `Reunião ${A.relDay(at).toLowerCase()}, ${A.time(at)}`, date: at } : { text: 'Reunião feita · registrar orçamento', date: at, attn: true }; }
    if (d.stage === 'orcamento') return d.budget.status === 'enviado' ? { text: `Orçamento enviado · ${A.money0(d.budget.value)}`, date: A.enteredAt(d, 'orcamento') } : { text: 'Orçamento não enviado', date: A.enteredAt(d, 'orcamento'), attn: true };
    if (d.stage === 'agendamento') { const s = d.shoots.filter((x) => x.date >= today).sort((a, b) => a.date.localeCompare(b.date))[0]; return s ? { text: `Gravação ${A.relDay(s.date).toLowerCase()}, ${s.start}`, date: s.date } : { text: d.shoots.length ? 'Gravações feitas' : 'Sem dia de gravação', date: null, attn: !d.shoots.length }; }
    if (d.stage === 'planejamento') return !d.script.link ? { text: 'Roteiro sem link', date: d.deadline, attn: true } : { text: d.deadline ? `Entrega ${A.relDay(d.deadline).toLowerCase()}` : 'Roteiro pronto', date: d.deadline };
    if (d.stage === 'pos') { const st = A.postState(d); const map = { edicao: 'Em edição', aguardando: 'Aguardando aprovação', ajustes: 'Reprovado · em ajustes' }; return { text: `${map[st]}${d.deadline ? ` · entrega ${A.dateShort(d.deadline)}` : ''}`, date: d.deadline, attn: st === 'aguardando' && A.can('post.approve') }; }
    if (d.stage === 'concluido') return { text: `Concluído ${A.relDay(A.enteredAt(d, 'concluido')).toLowerCase()}`, date: A.enteredAt(d, 'concluido') };
    return { text: d.cancel && d.cancel.reason ? d.cancel.reason : 'Cancelado', date: d.cancel && d.cancel.at };
  };
  const team = (d) => [...new Set([...(d.meeting.participants || []), ...d.shoots.flatMap((s) => s.responsible)])].map(A.user).filter(Boolean);

  function card(d) {
    const c = client(d), v = A.dealValue(d), n = A.nextUp(d), t = team(d);
    return html`<article class="deal-card" data-go="negocios/${d.id}" tabindex="0" role="link" aria-label="${d.title}, ${A.clientLabel(c)}">
      <div class="client">${A.clientLabel(c)}</div>
      <div class="title">${d.title}</div>
      <div class="next ${n.attn ? 'attn' : ''}">${n.text}</div>
      <div class="foot"><span class="val num">${v ? A.money0(v) : raw('<span class="faint">sem valor</span>')}</span><span class="avatars">${t.slice(0, 3).map((u) => avatar(u, 22))}</span></div>
    </article>`;
  }

  function kanban() {
    const cols = A.STAGES.map((s) => {
      let ds = A.S.deals.filter((d) => d.stage === s.id);
      if (P.q) ds = ds.filter(match);
      ds.sort((a, b) => (A.nextUp(a).date || '9').localeCompare(A.nextUp(b).date || '9'));
      let extra = 0;
      if (s.id === 'concluido') { ds.sort((a, b) => A.enteredAt(b, 'concluido').localeCompare(A.enteredAt(a, 'concluido'))); extra = Math.max(0, ds.length - 4); }
      const total = A.sum(ds, (d) => A.dealValue(d));
      return html`<section aria-label="${s.label}">
        <div class="col-head"><h2>${s.short}</h2><span class="tot num">${ds.length}${total ? html`<br>${A.money0(total)}` : ''}</span></div>
        <div class="col-list">${ds.length ? ds.slice(0, s.id === 'concluido' ? 4 : 99).map(card) : html`<div class="col-empty">Nenhum negócio nesta etapa.</div>`}
        ${extra ? html`<button class="text-btn small" data-all-done style="justify-self:start">Ver os ${extra} anteriores na lista</button>` : ''}</div>
      </section>`;
    });
    return html`<div class="board">${cols}</div>`;
  }
  const match = (d) => { const c = client(d); return [d.title, c.name, c.fantasy, c.city].join(' ').toLowerCase().includes(P.q.toLowerCase()); };

  function list() {
    let ds = A.S.deals.filter((d) => (P.stage === 'abertos' ? !['concluido', 'cancelado'].includes(d.stage) : P.stage === 'todos' ? true : d.stage === P.stage));
    if (P.q) ds = ds.filter(match);
    const key = {
      title: (d) => d.title.toLowerCase(), client: (d) => A.clientLabel(client(d)).toLowerCase(), stage: (d) => (d.stage === 'cancelado' ? 9 : A.stageIndex(d.stage)),
      value: (d) => A.dealValue(d) || 0, days: (d) => A.daysBetween(d.history.at(-1).at, A.now()), next: (d) => A.nextUp(d).date || '9', deadline: (d) => d.deadline || '9',
    }[P.sort];
    ds.sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * P.dir);
    const th = (k, l, n) => html`<th class="${n ? 'n' : ''}" ${P.sort === k ? raw(`aria-sort="${P.dir > 0 ? 'ascending' : 'descending'}"`) : ''}><button data-sort="${k}">${l}${P.sort === k ? (P.dir > 0 ? ' ↑' : ' ↓') : ''}</button></th>`;
    const dash = raw('<span class="faint">—</span>');
    return html`<section class="panel">${ds.length ? html`<div class="table-wrap"><table class="resp">
      <thead><tr>${th('title', 'Negócio')}${th('stage', 'Etapa')}${th('next', 'Próximo passo')}${th('value', 'Valor', true)}${th('days', 'Na etapa', true)}${th('deadline', 'Entrega', true)}</tr></thead>
      <tbody>${ds.map((d) => { const n = A.nextUp(d); const days = A.daysBetween(d.history.at(-1).at, A.now()); return html`<tr class="clickable" data-go="negocios/${d.id}">
        <td class="id-col"><a href="#/negocios/${d.id}" style="font-weight:600">${d.title}</a><span class="sub">${A.clientLabel(client(d))} · ${client(d).city}</span></td>
        <td class="hide-m">${A.stagePill(d)}</td>
        <td class="m-2"><span class="${n.attn ? 'link' : ''}" style="${n.attn ? 'text-decoration:none' : ''}">${n.text}</span></td>
        <td class="n">${A.dealValue(d) ? A.money0(A.dealValue(d)) : dash}</td>
        <td class="n hide-m">${['concluido', 'cancelado'].includes(d.stage) ? dash : A.plural(days, 'dia', 'dias')}</td>
        <td class="n hide-m">${d.deadline ? A.dateNum(d.deadline) : dash}</td></tr>`; })}</tbody></table></div>`
      : html`<div class="empty">Nenhum negócio com esses filtros.</div>`}</section>`;
  }

  A.views.pipeline = {
    title: 'Pipeline',
    render() {
      const open = A.S.deals.filter((d) => !['concluido', 'cancelado'].includes(d.stage));
      const waiting = A.S.deals.filter((d) => d.stage === 'pos' && A.postState(d) === 'aguardando');
      const pending = A.S.deals.filter((d) => d.stage === 'orcamento' && d.budget.status !== 'enviado');
      const lead = A.can('post.approve') && waiting.length ? `${A.plural(waiting.length, 'edição espera', 'edições esperam')} sua aprovação.` : pending.length ? `${A.plural(pending.length, 'orçamento ainda não foi enviado', 'orçamentos ainda não foram enviados')}.` : '';
      return html`
        <div class="title-row"><div><h1>Pipeline</h1><p class="sub">${A.plural(open.length, 'negócio aberto', 'negócios abertos')}, ${A.money0(A.sum(open, (d) => A.dealValue(d)))} em jogo. ${lead}</p></div>
          <div class="actions">${A.can('pipeline.edit') ? html`<button class="btn primary" data-new>${icon('plus')}Nova conversa inicial</button>` : ''}</div></div>
        <div class="filters">
          <div class="segmented" role="group" aria-label="Visualização"><button data-view="kanban" aria-pressed="${String(P.view === 'kanban')}">${icon('board')}Kanban</button><button data-view="lista" aria-pressed="${String(P.view === 'lista')}">${icon('list')}Lista</button></div>
          <label class="sr" for="p-q">Buscar negócios</label><input class="input sm search" id="p-q" type="search" placeholder="Buscar negócio, cliente ou cidade" value="${P.q}">
          ${P.view === 'lista' ? html`<label class="sr" for="p-stage">Etapa</label><select class="input sm" id="p-stage" style="width:auto">
            ${[['abertos', 'Abertos'], ...A.STAGES.map((s) => [s.id, s.label]), ['cancelado', 'Cancelados'], ['todos', 'Todos']].map(([k, l]) => html`<option value="${k}" ${P.stage === k ? raw('selected') : ''}>${l}</option>`)}</select>` : ''}
          <span class="spacer"></span>
          ${P.view === 'kanban' ? html`<span class="small muted">${A.plural(A.S.deals.filter((d) => d.stage === 'cancelado').length, 'cancelado', 'cancelados')} · <button class="text-btn small" data-cancelled>ver na lista</button></span>` : ''}
        </div>
        ${P.view === 'kanban' ? kanban() : list()}`;
    },
    mount(root) {
      root.querySelector('[data-new]')?.addEventListener('click', () => A.newDealDialog());
      root.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { P.view = b.dataset.view; try { localStorage.setItem('paleta-crm-pipeview', P.view); } catch {} A.render(); }));
      const q = root.querySelector('#p-q');
      q.addEventListener('input', () => { P.q = q.value; A.render(); const n = document.getElementById('p-q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
      root.querySelector('#p-stage')?.addEventListener('change', (e) => { P.stage = e.target.value; A.render(); });
      root.querySelector('[data-cancelled]')?.addEventListener('click', () => { P.view = 'lista'; P.stage = 'cancelado'; A.render(); });
      root.querySelector('[data-all-done]')?.addEventListener('click', () => { P.view = 'lista'; P.stage = 'concluido'; A.render(); });
      root.querySelectorAll('[data-sort]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.sort; P.dir = P.sort === k ? -P.dir : 1; P.sort = k; A.render(); }));
      root.querySelectorAll('[data-go]').forEach((el) => {
        el.addEventListener('click', (e) => { if (!e.target.closest('a')) A.go(el.dataset.go); });
        el.addEventListener('keydown', (e) => { if (e.key === 'Enter') A.go(el.dataset.go); });
      });
    },
  };

  // ---------- nova conversa inicial ----------
  A.participantsField = (selected = [], name = 'p') => html`<div class="checks">${A.S.users.map((u) => html`<label class="check"><input type="checkbox" name="${name}" value="${u.id}" ${selected.includes(u.id) ? raw('checked') : ''}>${avatar(u, 22)}${u.id === A.S.userId ? `${u.name} (você)` : u.name}</label>`)}</div>`;

  A.newDealDialog = (clientId) => {
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const cs = [...A.S.clients].sort((a, b) => A.clientLabel(a).localeCompare(A.clientLabel(b)));
    A.dialog({
      title: 'Nova conversa inicial', wide: true, submit: 'Registrar e agendar',
      body: html`<div class="form-grid">
          <div class="field full"><label for="d-client">Cliente</label><select class="input" id="d-client" name="client">
            <option value="__new">+ Cliente novo</option>
            ${cs.map((c) => html`<option value="${c.id}" ${c.id === clientId ? raw('selected') : ''}>${A.clientLabel(c)} · ${c.city}</option>`)}</select></div>
          <div class="field" data-new-client><label for="d-cname">Nome do cliente *</label><input class="input" id="d-cname" name="cname" autocomplete="off"></div>
          <div class="field" data-new-client><label for="d-ccity">Cidade *</label><input class="input" id="d-ccity" name="ccity"></div>
          <div class="field full" data-new-client><label for="d-csector">Setor <span class="faint">(opcional)</span></label><input class="input" id="d-csector" name="csector"></div>
          <div class="field full"><label for="d-title">O que o cliente quer</label><input class="input" id="d-title" name="title" placeholder="Ex.: Vídeo institucional para o site"></div>
          <div class="field"><label for="d-date">Data da reunião *</label><input class="input" id="d-date" type="date" name="date" value="${A.isoDate(tomorrow)}"></div>
          <div class="field"><label for="d-time">Horário *</label><input class="input" id="d-time" type="time" name="time" value="10:00"></div>
          <div class="field full"><span class="label">Participantes</span>${A.participantsField([A.S.userId])}<span class="hint">O evento é criado na sua Google Agenda e os demais recebem o convite.</span></div>
        </div>`,
      onOpen: (form) => {
        const sel = form.querySelector('#d-client');
        const sync = () => form.querySelectorAll('[data-new-client]').forEach((f) => (f.hidden = sel.value !== '__new'));
        if (!clientId) sel.value = '__new';
        sel.addEventListener('change', sync); sync();
      },
      onSubmit: (fd) => {
        let cid = fd.get('client');
        if (cid === '__new' && (!String(fd.get('cname')).trim() || !String(fd.get('ccity')).trim())) return 'Para cliente novo, preencha Nome e Cidade.';
        if (!fd.get('date') || !fd.get('time')) return 'Informe data e horário da reunião.';
        const parts = fd.getAll('p');
        if (!parts.includes(A.S.userId)) parts.unshift(A.S.userId);
        let c;
        if (cid === '__new') { c = { id: A.uid('c'), name: String(fd.get('cname')).trim(), fantasy: '', doc: '', address: '', city: String(fd.get('ccity')).trim(), contact: '', sector: String(fd.get('csector')).trim(), drive: null }; A.S.clients.push(c); cid = c.id; }
        else c = A.S.clients.find((x) => x.id === cid);
        const created = A.ensureFolder(c);
        const id = A.uid('n');
        const at = `${fd.get('date')}T${fd.get('time')}`;
        A.S.deals.push({ id, clientId: cid, title: String(fd.get('title')).trim() || `Novo projeto — ${A.clientLabel(c)}`, stage: 'conversa', createdBy: A.S.userId,
          meeting: { at, participants: parts, eventId: `gcal-${id}` }, budget: { status: 'nao_enviado', value: null, payment: '' }, approval: null, deadline: null, shoots: [],
          script: { link: '', owner: null }, post: { briefing: '', log: [] }, history: [{ stage: 'conversa', at: A.now(), by: A.S.userId, back: false }] });
        A.save();
        const guests = A.people(parts);
        A.toast('Conversa inicial registrada', [
          `Evento criado na sua Google Agenda para ${A.dateLong(at)}, ${A.time(at)}${guests ? ` · ${A.plural(guests, 'convidado', 'convidados')}` : ''}`,
          created ? `Pasta “${c.drive.name}” criada no Drive central` : `Pasta “${c.drive.name}” já existe no Drive central`,
        ]);
        A.go(`negocios/${id}`);
      },
    });
  };
})();
