// Calendário: reuniões, dias de gravação e prazos de entrega. Geral ou Minhas tarefas; mês, semana ou dia.
(() => {
  const A = window.App;
  const { html, raw, icon, avatar } = A;
  const K = { scope: 'geral', view: 'mes', anchor: null };
  const KIND = { meeting: 'Reunião', shoot: 'Gravação', deadline: 'Prazo de entrega' };

  function items() {
    const out = [], today = A.isoDate(new Date());
    for (const d of A.S.deals) {
      if (d.stage === 'cancelado') continue;
      const c = A.S.clients.find((x) => x.id === d.clientId), cl = A.clientLabel(c);
      if (d.meeting && (d.meeting.eventId || d.meeting.at.slice(0, 10) < today)) out.push({ kind: 'meeting', date: d.meeting.at.slice(0, 10), start: A.time(d.meeting.at), end: '', title: cl, sub: d.title, people: d.meeting.participants, deal: d.id });
      for (const s of d.shoots) out.push({ kind: 'shoot', date: s.date, start: s.start, end: s.end, title: cl, sub: s.place, people: s.responsible, deal: d.id });
      if (d.deadline && d.stage !== 'concluido') out.push({ kind: 'deadline', date: d.deadline, start: '', end: '', title: cl, sub: d.title, people: null, deal: d.id });
    }
    // prazos não têm editor responsável: aparecem em "Minhas tarefas" para todo mundo
    const mine = (it) => it.kind === 'deadline' || it.people.includes(A.S.userId);
    return out.filter((it) => K.scope === 'geral' || mine(it)).sort((a, b) => (a.date + (a.start || '00:00')).localeCompare(b.date + (b.start || '00:00')) || (a.kind === 'deadline' ? -1 : 1));
  }
  const anchor = () => A.parse(K.anchor || A.isoDate(new Date()));
  const weekStart = (x) => { const s = new Date(x); s.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return s; };
  function shift(dir) {
    const a = anchor();
    if (K.view === 'mes') a.setMonth(a.getMonth() + dir, 1); else a.setDate(a.getDate() + (K.view === 'semana' ? 7 : 1) * dir);
    K.anchor = A.isoDate(a);
  }
  function label() {
    const a = anchor();
    if (K.view === 'mes') return `${A.MESES[a.getMonth()]} de ${a.getFullYear()}`;
    if (K.view === 'dia') return `${A.dateLong(A.isoDate(a))} de ${a.getFullYear()}`;
    const s = weekStart(a), e = new Date(s); e.setDate(s.getDate() + 6);
    return `${s.getDate()} ${A.MES[s.getMonth()]} – ${e.getDate()} ${A.MES[e.getMonth()]}`;
  }
  const evTitle = (it) => `${KIND[it.kind]}${it.start ? ` ${it.start}` : ''} · ${it.title}`;

  function month(all) {
    const a = anchor(), first = new Date(a.getFullYear(), a.getMonth(), 1), start = weekStart(first), today = A.isoDate(new Date());
    const last = new Date(a.getFullYear(), a.getMonth() + 1, 0);
    const days = Math.ceil((A.daysBetween(A.isoDate(start), A.isoDate(last)) + 1) / 7) * 7;
    const cells = [];
    for (let i = 0; i < days; i++) {
      const x = new Date(start); x.setDate(start.getDate() + i);
      const iso = A.isoDate(x), its = all.filter((it) => it.date === iso);
      const cls = [x.getMonth() !== a.getMonth() ? 'out' : '', iso === today ? 'today' : '', x.getDay() === 0 || x.getDay() === 6 ? 'weekend' : ''].join(' ');
      cells.push(html`<div class="day ${cls}"><button class="text-btn dnum" data-day="${iso}" aria-label="Ver ${A.dateLong(iso)}">${x.getDate()}</button>
        ${its.slice(0, 3).map((it) => html`<button class="ev ${it.kind}" data-deal="${it.deal}" title="${evTitle(it)}" aria-label="${evTitle(it)}"><span class="lbl">${it.start ? `${it.start} ` : ''}${it.title}</span></button>`)}
        ${its.length > 3 ? html`<button class="text-btn small muted" data-day="${iso}" style="text-align:left;font-weight:400">+${its.length - 3} mais</button>` : ''}</div>`);
    }
    return html`<div class="month" role="grid" aria-label="${label()}">${['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map((d) => html`<div class="dow">${d}</div>`)}${cells}</div>`;
  }
  function week(all) {
    const s = weekStart(anchor()), today = A.isoDate(new Date());
    return html`<div class="week">${Array.from({ length: 7 }, (_, i) => {
      const x = new Date(s); x.setDate(s.getDate() + i); const iso = A.isoDate(x); const its = all.filter((it) => it.date === iso);
      return html`<div class="wcol ${its.length ? '' : 'emptyday'}"><div class="whead ${iso === today ? 'today' : ''}"><span class="small muted">${A.DOW[x.getDay()]}</span><strong>${x.getDate()}</strong></div>
        <div class="witems">${its.map((it) => html`<button class="wev ${it.kind}" data-deal="${it.deal}"><span class="t">${it.kind === 'deadline' ? 'Prazo de entrega' : `${it.start}${it.end ? `–${it.end}` : ''} · ${KIND[it.kind]}`}</span><span class="n">${it.title}</span></button>`)}</div></div>`;
    })}</div>`;
  }
  function day(all) {
    const iso = A.isoDate(anchor()), its = all.filter((it) => it.date === iso);
    return html`<section class="panel">${its.length ? html`<ul class="agenda">${its.map((it) => html`<li>
        <div><strong class="num">${it.kind === 'deadline' ? 'Dia todo' : it.start}</strong>${it.end ? html`<div class="small muted">até ${it.end}</div>` : ''}</div>
        <div><span class="pill ${it.kind === 'shoot' ? 'neg' : it.kind === 'deadline' ? '' : 'outline'}">${KIND[it.kind]}</span><div style="font-weight:600;margin-top:6px"><a href="#/negocios/${it.deal}">${it.title}</a></div><div class="small muted">${it.sub}</div></div>
        <div class="avatars">${(it.people || []).map((p) => avatar(A.user(p), 24))}${it.people ? '' : html`<span class="small muted">Toda a equipe</span>`}</div></li>`)}</ul>`
      : html`<div class="empty">Nada marcado para este dia${K.scope === 'minhas' ? ' para você' : ''}.</div>`}</section>`;
  }

  A.views.calendario = {
    title: 'Calendário',
    render() {
      const all = items();
      const today = A.isoDate(new Date()), wk = new Date(); wk.setDate(wk.getDate() + 7);
      const soon = all.filter((it) => it.date >= today && it.date <= A.isoDate(wk));
      const n = (k) => soon.filter((x) => x.kind === k).length;
      return html`
        <div class="title-row"><div><h1>Calendário</h1><p class="sub">Próximos 7 dias${K.scope === 'minhas' ? ' para você' : ''}: ${A.plural(n('meeting'), 'reunião', 'reuniões')}, ${A.plural(n('shoot'), 'dia de gravação', 'dias de gravação')} e ${A.plural(n('deadline'), 'prazo de entrega', 'prazos de entrega')}.</p></div>
          <div class="actions"><div class="segmented" role="group" aria-label="Escopo"><button data-scope="geral" aria-pressed="${String(K.scope === 'geral')}">Geral</button><button data-scope="minhas" aria-pressed="${String(K.scope === 'minhas')}">Minhas tarefas</button></div></div></div>
        <div class="filters">
          <button class="btn" data-today>Hoje</button>
          <button class="btn icon" data-shift="-1" aria-label="Anterior">${icon('back')}</button><button class="btn icon" data-shift="1" aria-label="Próximo" style="transform:scaleX(-1)">${icon('back')}</button>
          <strong style="font-size:16px;font-weight:800">${label()}</strong>
          <span class="spacer"></span>
          <div class="legend" aria-label="Legenda"><span><i class="meeting"></i>Reunião</span><span><i class="shoot"></i>Gravação</span><span><i class="deadline"></i>Prazo de entrega</span></div>
          <div class="segmented" role="group" aria-label="Visão"><button data-view="dia" aria-pressed="${String(K.view === 'dia')}">Dia</button><button data-view="semana" aria-pressed="${String(K.view === 'semana')}">Semana</button><button data-view="mes" aria-pressed="${String(K.view === 'mes')}">Mês</button></div>
        </div>
        ${K.view === 'mes' ? month(all) : K.view === 'semana' ? week(all) : day(all)}`;
    },
    mount(root) {
      root.querySelectorAll('[data-scope]').forEach((b) => b.addEventListener('click', () => { K.scope = b.dataset.scope; A.render(); }));
      root.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { K.view = b.dataset.view; A.render(); }));
      root.querySelectorAll('[data-shift]').forEach((b) => b.addEventListener('click', () => { shift(Number(b.dataset.shift)); A.render(); }));
      root.querySelector('[data-today]').addEventListener('click', () => { K.anchor = null; A.render(); });
      root.querySelectorAll('[data-day]').forEach((b) => b.addEventListener('click', () => { K.anchor = b.dataset.day; K.view = 'dia'; A.render(); }));
      root.querySelectorAll('[data-deal]').forEach((b) => b.addEventListener('click', () => A.go(`negocios/${b.dataset.deal}`)));
    },
  };
})();
