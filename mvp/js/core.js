// Núcleo do MVP: estado, permissões, automações simuladas (Agenda, Drive, fluxo de caixa), formatação e UI.
(() => {
  const KEY = 'paleta-crm-mvp-v1';

  // ---------- etapas e perfis ----------
  const STAGES = [
    { id: 'conversa', label: 'Conversa inicial', short: 'Conversa' },
    { id: 'orcamento', label: 'Orçamento', short: 'Orçamento' },
    { id: 'agendamento', label: 'Agendamento da gravação', short: 'Agendamento' },
    { id: 'planejamento', label: 'Planejamento (roteiro)', short: 'Roteiro' },
    { id: 'pos', label: 'Pós-produção', short: 'Pós' },
    { id: 'concluido', label: 'Concluído', short: 'Concluído' },
  ];
  const stageIndex = (id) => STAGES.findIndex((s) => s.id === id);
  const stageLabel = (id) => (id === 'cancelado' ? 'Cancelado' : STAGES[stageIndex(id)].label);
  const ROLES = { admin: 'Administrador', gestor: 'Gestor', comercial: 'Comercial', videomaker: 'Videomaker', editor: 'Editor' };
  const PERMS = {
    'pomodoro.others': ['admin', 'gestor'],
    'clients.edit': ['admin', 'gestor', 'comercial'],
    'pipeline.edit': ['admin', 'gestor', 'comercial'],
    'pipeline.shoots': ['admin', 'gestor', 'comercial', 'videomaker'],
    'pipeline.script': ['admin', 'gestor', 'comercial', 'videomaker', 'editor'],
    'pipeline.briefing': ['admin', 'gestor', 'comercial', 'editor'],
    'post.ready': ['editor'],
    'post.approve': ['gestor'],
    'sales': ['admin', 'gestor', 'comercial'],
    'cash': ['admin', 'gestor'],
    'users': ['admin'],
  };

  // ---------- estado ----------
  let S;
  const clone = (o) => JSON.parse(JSON.stringify(o));
  function fresh() {
    const seed = clone(window.SEED);
    const st = { users: seed.users, clients: seed.clients, deals: seed.deals, cash: seed.manual, categories: seed.categories,
      sessions: seed.sessions, valueLog: [], userId: null, seq: 1000,
      pomo: { focus: 25, short: 5, long: 15, every: 4, fast: false } };
    S = st;
    for (const deal of st.deals) syncCash(deal, true);
    return st;
  }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) { S = JSON.parse(raw); return; } } catch {}
    fresh();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} }
  function reset() { const uid = S && S.userId; fresh(); S.userId = uid; save(); }
  const uid = (p) => `${p}${++S.seq}`;
  const now = () => { const x = new Date(); return `${isoDate(x)}T${pad(x.getHours())}:${pad(x.getMinutes())}`; };

  // ---------- usuário e permissões ----------
  const me = () => S.users.find((u) => u.id === S.userId);
  const user = (id) => S.users.find((u) => u.id === id);
  const can = (perm, u = me()) => !!u && u.roles.some((r) => PERMS[perm].includes(r));

  // ---------- automações simuladas ----------
  // Parcelas aprovadas viram entradas previstas; parcelas realizadas nunca são tocadas.
  function syncCash(deal, silent) {
    let insts = deal.approval && deal.stage !== 'cancelado' && stageIndex(deal.stage) >= 2 ? deal.approval.installments : null;
    // na carga inicial, um negócio cancelado depois de aprovado ainda traz as parcelas que já entraram
    if (silent && deal.stage === 'cancelado' && deal.approval) insts = deal.approval.installments.filter((i) => i.date <= isoDate(new Date()));
    const client = S.clients.find((c) => c.id === deal.clientId);
    const keep = [];
    let removed = 0, removedValue = 0;
    for (const e of S.cash) {
      if (e.dealId !== deal.id) { keep.push(e); continue; }
      if (e.status === 'realizado') { keep.push(e); continue; }
      const i = insts && insts.find((x) => x.id === e.instId);
      if (i) { e.value = i.value; e.date = i.date; keep.push(e); } else { removed++; removedValue += e.value; }
    }
    S.cash = keep;
    let created = 0;
    if (insts) {
      insts.forEach((i, n) => {
        if (S.cash.some((e) => e.instId === i.id)) return;
        S.cash.push({ id: `v-${i.id}`, kind: 'in', desc: `${client.fantasy || client.name} — ${deal.title} (${n + 1}/${insts.length})`, value: i.value, date: i.date, category: 'Venda de projeto', status: !silent ? 'previsto' : i.date <= isoDate(new Date()) ? 'realizado' : 'previsto', dealId: deal.id, instId: i.id });
        created++;
      });
    }
    return { created, removed, removedValue };
  }
  function ensureFolder(client) {
    if (client.drive) return false;
    client.drive = { name: client.fantasy || client.name, url: '#drive', createdAt: now() };
    return true;
  }
  const people = (ids) => ids.filter((id) => id !== S.userId).length;

  // ---------- regras do pipeline ----------
  function moveStage(deal, to, opts = {}) {
    const from = deal.stage;
    const back = to !== 'cancelado' && stageIndex(to) < stageIndex(from);
    deal.history.push({ stage: to, at: now(), by: S.userId, back });
    deal.stage = to;
    const notes = [];
    if (to === 'cancelado' || (back && stageIndex(to) < 2)) {
      // o orçamento deixa de estar aprovado: previstas saem, gravações e eventos futuros saem da agenda
      const r = syncCash(deal);
      if (r.removed) notes.push(`${r.removed} parcela${r.removed > 1 ? 's' : ''} prevista${r.removed > 1 ? 's' : ''} removida${r.removed > 1 ? 's' : ''} do fluxo de caixa (${money(r.removedValue)})`);
      const today = isoDate(new Date());
      const fut = deal.shoots.filter((s) => s.date >= today).length;
      if (back) { if (deal.shoots.length) notes.push(`${deal.shoots.length} dia${deal.shoots.length > 1 ? 's' : ''} de gravação e seus eventos removidos da Google Agenda`); deal.shoots = []; deal.approval = null; }
      else if (fut) { notes.push(`${fut} evento${fut > 1 ? 's' : ''} futuro${fut > 1 ? 's' : ''} de gravação removido${fut > 1 ? 's' : ''} da Google Agenda`); deal.shoots.forEach((s) => { if (s.date >= today) s.eventId = null; }); }
      // só o cancelamento tira a reunião da agenda; voltar etapa remove apenas as gravações (intent §5.6 e §5.7)
      if (to === 'cancelado' && deal.meeting && deal.meeting.eventId && deal.meeting.at.slice(0, 10) >= today) { deal.meeting.eventId = null; notes.push('Reunião futura removida da Google Agenda'); }
    }
    if (to === 'cancelado') deal.cancel = { reason: opts.reason || '', at: now(), by: S.userId, from };
    save();
    return notes;
  }
  // o que um cancelamento ou volta faria, para mostrar antes de confirmar
  function consequences(deal, to) {
    const out = [];
    const today = isoDate(new Date());
    const crosses = to === 'cancelado' || stageIndex(to) < 2;
    if (!crosses) return out;
    const prev = S.cash.filter((e) => e.dealId === deal.id && e.status === 'previsto');
    const real = S.cash.filter((e) => e.dealId === deal.id && e.status === 'realizado');
    if (prev.length) out.push(`${prev.length} parcela${prev.length > 1 ? 's' : ''} prevista${prev.length > 1 ? 's' : ''} sai${prev.length > 1 ? 'em' : ''} do fluxo de caixa (${money(sum(prev))})`);
    if (real.length) out.push(`${real.length} parcela${real.length > 1 ? 's' : ''} já realizada${real.length > 1 ? 's' : ''} permanece${real.length > 1 ? 'm' : ''} (${money(sum(real))})`);
    const shoots = to === 'cancelado' ? deal.shoots.filter((s) => s.date >= today) : deal.shoots;
    if (shoots.length) out.push(`${shoots.length} dia${shoots.length > 1 ? 's' : ''} de gravação ${to === 'cancelado' ? 'futuro' + (shoots.length > 1 ? 's' : '') + ' ' : ''}sai${shoots.length > 1 ? 'em' : ''} da Google Agenda`);
    if (to === 'cancelado' && deal.meeting && deal.meeting.eventId && deal.meeting.at.slice(0, 10) >= today) out.push('A reunião marcada sai da Google Agenda');
    return out;
  }
  const sum = (rows, f = (r) => r.value) => Math.round(rows.reduce((a, r) => a + (f(r) || 0), 0) * 100) / 100;
  const dealValue = (deal) => (deal.approval ? deal.approval.value : deal.budget && deal.budget.value) || null;
  // data da aprovação: a última entrada em Agendamento que não foi desfeita
  function approvedAt(deal) {
    if (!deal.approval) return null;
    const hits = deal.history.filter((h) => h.stage === 'agendamento' && !h.back);
    return hits.length ? hits.at(-1).at : null;
  }
  const enteredAt = (deal, stage) => { const h = deal.history.filter((x) => x.stage === stage).at(-1); return h ? h.at : null; };
  function logValue(entry) { S.valueLog.unshift({ at: now(), by: S.userId, ...entry }); }

  // ---------- formatação (pt-BR) ----------
  const pad = (n) => String(n).padStart(2, '0');
  const isoDate = (x) => `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
  const parse = (s) => { if (!s) return null; const [dd, tt] = s.split('T'); const [y, m, d] = dd.split('-').map(Number); const [hh, mm] = (tt || '00:00').split(':').map(Number); return new Date(y, m - 1, d, hh, mm); };
  const moneyF = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const money = (v) => (v == null ? '—' : moneyF.format(v));
  const money0 = (v) => (v == null ? '—' : new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v));
  const intF = new Intl.NumberFormat('pt-BR');
  const int = (v) => intF.format(v);
  const dec1 = (v) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(v);
  const MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const DOW = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const dateShort = (s) => { const x = parse(s); return x ? `${x.getDate()} ${MES[x.getMonth()]}` : '—'; };
  const dateLong = (s) => { const x = parse(s); return x ? `${DOW[x.getDay()]}, ${x.getDate()} ${MES[x.getMonth()]}` : '—'; };
  const dateNum = (s) => { const x = parse(s); return x ? `${pad(x.getDate())}/${pad(x.getMonth() + 1)}/${x.getFullYear()}` : '—'; };
  const time = (s) => (s && s.includes('T') ? s.slice(11, 16) : '');
  const daysBetween = (a, b) => Math.round((parse(b.slice(0, 10)) - parse(a.slice(0, 10))) / 86400000);
  function relDay(s) {
    const n = daysBetween(isoDate(new Date()), s);
    if (n === 0) return 'Hoje'; if (n === 1) return 'Amanhã'; if (n === -1) return 'Ontem';
    return n > 0 ? `Em ${n} dias` : `Há ${-n} dias`;
  }
  const initials = (name) => name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  const plural = (n, one, many) => `${int(n)} ${n === 1 ? one : many}`;

  // ---------- HTML ----------
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // html`...${x}` escapa tudo, exceto o que já vem de html`` (marcado como raw)
  class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
  const raw = (s) => new Raw(s);
  const val = (v) => (v instanceof Raw ? v.s : Array.isArray(v) ? v.map(val).join('') : v === false || v == null ? '' : esc(v));
  const html = (strings, ...vals) => raw(strings.reduce((a, s, i) => a + s + (i < vals.length ? val(vals[i]) : ''), ''));
  const avatar = (u, size = 24) => (u ? html`<span class="avatar" style="--h:${u.hue};--s:${size}px" title="${u.name}">${initials(u.name)}</span>` : '');

  const ICONS = {
    timer: '<circle cx="8" cy="9" r="5.5"/><path d="M8 6v3l2 1.5M6.5 1.5h3"/>',
    report: '<path d="M2.5 13.5h11M4.5 11V8M8 11V4.5M11.5 11V6.5"/>',
    users: '<circle cx="6" cy="5.5" r="2.5"/><path d="M1.5 13.5c.4-2.5 2.2-4 4.5-4s4.1 1.5 4.5 4M10.5 3.2a2.5 2.5 0 0 1 0 4.6M12.5 9.8c1.1.6 1.8 1.9 2 3.7"/>',
    board: '<rect x="2" y="2.5" width="3.5" height="11"/><rect x="6.25" y="2.5" width="3.5" height="7"/><rect x="10.5" y="2.5" width="3.5" height="9"/>',
    calendar: '<rect x="2" y="3" width="12" height="11"/><path d="M2 6.5h12M5 1.5v3M11 1.5v3"/>',
    chart: '<path d="M2 13.5h12M3 10.5l3.5-3.5 2.5 2 4.5-5"/>',
    wallet: '<rect x="1.5" y="4" width="13" height="9.5"/><path d="M1.5 6.5h13M3.5 4l7-2.5.8 2.5M11 9.5h1.5"/>',
    gear: '<circle cx="8" cy="8" r="2.2"/><path d="M8 1.5v2M8 12.5v2M1.5 8h2M12.5 8h2M3.4 3.4l1.4 1.4M11.2 11.2l1.4 1.4M3.4 12.6l1.4-1.4M11.2 4.8l1.4-1.4"/>',
    sun: '<circle cx="8" cy="8" r="3"/><path d="M8 1v1.5M8 13.5V15M1 8h1.5M13.5 8H15M3 3l1 1M12 12l1 1M3 13l1-1M12 4l1-1"/>',
    moon: '<path d="M13.5 9.5A5.5 5.5 0 0 1 6.5 2.5a5.5 5.5 0 1 0 7 7z"/>',
    menu: '<path d="M2 4h12M2 8h12M2 12h12"/>',
    close: '<path d="M3.5 3.5l9 9M12.5 3.5l-9 9"/>',
    plus: '<path d="M8 3v10M3 8h10"/>',
    folder: '<path d="M1.5 4V13h13V5.5H7.5L6 4z"/>',
    pin: '<path d="M8 14.5s-4.5-4.6-4.5-8a4.5 4.5 0 0 1 9 0c0 3.4-4.5 8-4.5 8z"/><circle cx="8" cy="6.5" r="1.5"/>',
    check: '<path d="M3 8.5l3 3 7-7"/>',
    link: '<path d="M6.5 9.5l3-3M7 4.5l1.2-1.2a2.8 2.8 0 0 1 4 4L11 8.5M9 11.5l-1.2 1.2a2.8 2.8 0 0 1-4-4L5 7.5"/>',
    back: '<path d="M10 3.5L5.5 8l4.5 4.5"/>',
    logout: '<path d="M6 2.5H2.5v11H6M10.5 5l3 3-3 3M13.5 8h-8"/>',
    list: '<path d="M5.5 4h8.5M5.5 8h8.5M5.5 12h8.5M2 4h1M2 8h1M2 12h1"/>',
    reset: '<path d="M2.5 8a5.5 5.5 0 1 0 1.6-3.9M2.5 2.5v3h3"/>',
  };
  const icon = (name, size = 16) => raw(`<svg class="ic" width="${size}" height="${size}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square" aria-hidden="true">${ICONS[name]}</svg>`);

  // ---------- toasts e diálogos ----------
  function toast(title, lines = [], kind = 'auto') {
    const box = document.getElementById('toasts');
    const t = document.createElement('div');
    t.className = `toast ${kind}`;
    t.setAttribute('role', 'status');
    t.innerHTML = val(html`<strong>${title}</strong>${lines.map((l) => html`<span>${l}</span>`)}`);
    box.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 240); }, 5200);
  }
  // abre um diálogo com corpo HTML; onSubmit recebe o FormData e devolve false para manter aberto
  function dialog({ title, body, submit = 'Salvar', cancel = 'Cancelar', danger = false, wide = false, onSubmit, onOpen }) {
    const d = document.createElement('dialog');
    d.className = `dlg${wide ? ' wide' : ''}`;
    d.innerHTML = val(html`<form method="dialog" novalidate>
      <header><h2>${title}</h2><button type="button" class="btn icon ghost" data-close aria-label="Fechar">${icon('close')}</button></header>
      <div class="dlg-body">${raw(String(body))}</div>
      <p class="form-error" role="alert" hidden></p>
      <footer>${cancel ? html`<button type="button" class="btn" data-close>${cancel}</button>` : ''}${submit ? html`<button type="submit" class="btn ${danger ? 'danger' : 'primary'}">${submit}</button>` : ''}</footer>
    </form>`);
    document.body.appendChild(d);
    const form = d.querySelector('form');
    const close = () => { d.close(); d.remove(); };
    d.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', close));
    d.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const err = form.querySelector('.form-error');
      const res = onSubmit ? onSubmit(new FormData(form), form) : true;
      if (typeof res === 'string') { err.textContent = res; err.hidden = false; return; }
      if (res !== false) close();
    });
    d.showModal();
    if (onOpen) onOpen(form, d);
    const first = form.querySelector('.dlg-body input:not([type=hidden]), .dlg-body select, .dlg-body textarea');
    if (first) first.focus();
    return { close, form };
  }

  window.App = window.App || {};
  Object.defineProperty(window.App, 'S', { get: () => S });
  Object.assign(window.App, {
    load, save, reset, uid, now, me, user, can, ROLES, STAGES, stageIndex, stageLabel,
    syncCash, ensureFolder, people, moveStage, consequences, sum, dealValue, approvedAt, enteredAt, logValue,
    pad, isoDate, parse, money, money0, int, dec1, MES, MESES, DOW, dateShort, dateLong, dateNum, time, daysBetween, relDay, initials, plural,
    esc, html, raw, val, avatar, icon, toast, dialog,
  });
})();
