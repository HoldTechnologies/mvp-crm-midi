// Dashboard de vendas: os quatro indicadores do intent §7, calculados a partir do histórico dos negócios.
(() => {
  const A = window.App;
  const { html, raw } = A;
  const V = { period: 'mes', from: null, to: null };
  const PERIODS = [['mes', 'Este mês'], ['anterior', 'Mês passado'], ['90', 'Últimos 90 dias'], ['ano', 'Este ano'], ['periodo', 'Período']];

  function range() {
    const t = new Date(), y = t.getFullYear(), m = t.getMonth();
    if (V.period === 'mes') return [A.isoDate(new Date(y, m, 1)), A.isoDate(new Date(y, m + 1, 0))];
    if (V.period === 'anterior') return [A.isoDate(new Date(y, m - 1, 1)), A.isoDate(new Date(y, m, 0))];
    if (V.period === '90') { const f = new Date(t); f.setDate(t.getDate() - 89); return [A.isoDate(f), A.isoDate(t)]; }
    if (V.period === 'ano') return [`${y}-01-01`, `${y}-12-31`];
    return [V.from, V.to];
  }
  const inR = (s, [f, t]) => s && s.slice(0, 10) >= f && s.slice(0, 10) <= t;
  const mean = (xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);

  // um negócio cancelado depois da aprovação conta como cancelado, nunca como venda
  function metrics(r) {
    const sold = A.S.deals.filter((d) => d.stage !== 'cancelado' && inR(A.approvedAt(d), r));
    const cancelled = A.S.deals.filter((d) => d.stage === 'cancelado' && inR(d.cancel.at, r));
    const done = A.S.deals.filter((d) => d.stage === 'concluido' && inR(A.enteredAt(d, 'concluido'), r));
    const total = A.sum(sold, (d) => d.approval.value);
    const close = sold.map((d) => A.daysBetween(d.meeting.at, A.approvedAt(d)));
    const cycle = done.map((d) => A.daysBetween(d.meeting.at, A.enteredAt(d, 'concluido')));
    const closed = sold.length + cancelled.length;
    return { sold, cancelled, done, total, close: mean(close), cycle: mean(cycle), rate: closed ? sold.length / closed : null };
  }

  A.views.vendas = {
    title: 'Dashboard de vendas',
    render() {
      if (V.period === 'periodo' && !V.from) { const t = new Date(), f = new Date(t); f.setDate(t.getDate() - 29); V.from = A.isoDate(f); V.to = A.isoDate(t); }
      const r = range(), M = metrics(r);
      const dash = raw('<span class="faint">—</span>');
      const plabel = PERIODS.find((p) => p[0] === V.period)[1].toLowerCase();
      const finding = M.sold.length || M.cancelled.length
        ? `${A.plural(M.sold.length, 'venda', 'vendas')} e ${A.plural(M.cancelled.length, 'cancelamento', 'cancelamentos')} ${V.period === 'periodo' ? 'no período' : plabel === 'este mês' ? 'neste mês' : plabel === 'este ano' ? 'neste ano' : `em ${plabel}`}.${M.cancelled.some((d) => d.approval) ? ' Um negócio já aprovado foi cancelado e saiu das vendas.' : ''}`
        : 'Nenhum negócio aprovado ou cancelado neste período.';
      const open = A.S.deals.filter((d) => !['concluido', 'cancelado'].includes(d.stage));
      const funnel = A.STAGES.slice(0, 5).map((s) => { const ds = open.filter((d) => d.stage === s.id); return { s, n: ds.length, v: A.sum(ds, (d) => A.dealValue(d)) }; });
      const maxN = Math.max(1, ...funnel.map((f) => f.n));
      const fmtDays = (v) => (v == null ? dash : html`${A.dec1(v)}<small>dias</small>`);
      return html`
        <div class="title-row"><div><h1>Dashboard de vendas</h1><p class="sub">${finding}</p></div></div>
        <div class="filters">
          <div class="segmented" role="group" aria-label="Período">${PERIODS.map(([k, l]) => html`<button data-period="${k}" aria-pressed="${String(V.period === k)}">${l}</button>`)}</div>
          ${V.period === 'periodo' ? html`<label class="sr" for="v-from">De</label><input class="input sm" style="width:auto" type="date" id="v-from" value="${V.from}"><span class="muted">até</span><label class="sr" for="v-to">Até</label><input class="input sm" style="width:auto" type="date" id="v-to" value="${V.to}">` : html`<span class="muted">${A.dateNum(r[0])} a ${A.dateNum(r[1])}</span>`}
        </div>
        <div class="kpis lead-first" style="margin-bottom:var(--gap)">
          <div class="kpi"><div class="kpi-label">Vendas no período</div><div class="kpi-value lead">${A.money0(M.total)}</div><div class="kpi-sub">${A.plural(M.sold.length, 'negócio aprovado', 'negócios aprovados')}</div></div>
          <div class="kpi"><div class="kpi-label">Tempo médio para fechamento</div><div class="kpi-value">${fmtDays(M.close)}</div><div class="kpi-sub">da conversa inicial à aprovação do orçamento</div></div>
          <div class="kpi"><div class="kpi-label">Taxa de conversão</div><div class="kpi-value">${M.rate == null ? dash : html`${Math.round(M.rate * 100)}<small>%</small>`}</div><div class="kpi-sub">${M.sold.length} aprovados de ${M.sold.length + M.cancelled.length} encerrados</div></div>
          <div class="kpi"><div class="kpi-label">Sales cycle length</div><div class="kpi-value">${fmtDays(M.cycle)}</div><div class="kpi-sub">da conversa inicial à pós aprovada · ${A.plural(M.done.length, 'concluído', 'concluídos')}</div></div>
        </div>
        <div class="grid">
          <section class="panel s8" aria-labelledby="v-chart"><header><h2 id="v-chart">Vendas aprovadas por mês</h2><span class="meta">últimos 6 meses · mês atual em destaque</span></header><div class="chart" id="sales-chart"></div></section>
          <section class="panel s4" aria-labelledby="v-fun"><header><h2 id="v-fun">Negócios abertos agora</h2><a class="card-link" href="#/pipeline">Pipeline</a></header>
            <ul class="ranks">${funnel.map((f) => html`<li><div class="rk"><span>${f.s.label}</span><span class="num"><strong>${f.n}</strong>${f.v ? html`<span class="muted small"> · ${A.money0(f.v)}</span>` : ''}</span></div>
              <div class="bar ${f.n === maxN ? 'top' : ''}" style="width:${(88 * f.n) / maxN}%"></div></li>`)}</ul>
            <p class="small muted" style="margin-top:12px">${A.plural(open.length, 'negócio', 'negócios')} · ${A.money0(A.sum(open, (d) => A.dealValue(d)))} entre orçados e aprovados</p></section>
          <section class="panel s12" aria-labelledby="v-list"><header><h2 id="v-list">Negócios encerrados no período</h2><span class="meta">${A.plural(M.sold.length + M.cancelled.length, 'negócio', 'negócios')}</span></header>
            ${M.sold.length + M.cancelled.length ? html`<div class="table-wrap"><table class="resp"><thead><tr><th>Negócio</th><th>Resultado</th><th class="n">Encerrado em</th><th class="n">Dias até fechar</th><th class="n">Valor aprovado</th></tr></thead>
              <tbody>${[...M.sold.map((d) => ({ d, at: A.approvedAt(d), ok: true })), ...M.cancelled.map((d) => ({ d, at: d.cancel.at, ok: false }))].sort((a, b) => b.at.localeCompare(a.at)).map(({ d, at, ok }) => { const c = A.S.clients.find((x) => x.id === d.clientId); return html`<tr class="clickable" data-go="negocios/${d.id}">
                <td class="id-col"><a href="#/negocios/${d.id}" style="font-weight:600">${d.title}</a><span class="sub">${A.clientLabel(c)}</span></td>
                <td class="m-2">${ok ? html`<span class="pill pos">Aprovado</span>` : html`<span class="pill outline">Cancelado${d.approval ? ' após aprovação' : ''}</span>`}</td>
                <td class="n hide-m">${A.dateNum(at)}</td><td class="n hide-m">${ok ? A.daysBetween(d.meeting.at, at) : dash}</td>
                <td class="n">${ok ? A.money(d.approval.value) : dash}</td></tr>`; })}</tbody>
              <tfoot><tr><td class="muted">Total vendido</td><td></td><td class="hide-m"></td><td class="hide-m"></td><td class="n"><strong>${A.money(M.total)}</strong></td></tr></tfoot></table></div>`
              : html`<div class="empty">Nenhum negócio aprovado ou cancelado neste período.</div>`}
          </section>
        </div>`;
    },
    mount(root) {
      const t = new Date(), labels = [], values = [];
      for (let i = 5; i >= 0; i--) {
        const f = new Date(t.getFullYear(), t.getMonth() - i, 1), e = new Date(t.getFullYear(), t.getMonth() - i + 1, 0);
        labels.push(`${A.MES[f.getMonth()]}`);
        values.push(A.sum(A.S.deals.filter((d) => d.stage !== 'cancelado' && inR(A.approvedAt(d), [A.isoDate(f), A.isoDate(e)])), (d) => d.approval.value));
      }
      // conferência: a soma do mês atual no gráfico é a mesma do indicador "Este mês"
      const cur = V.period === 'mes' ? metrics(range()).total : null;
      if (cur != null) console.assert(values.at(-1) === cur, 'Vendas do mês: gráfico e indicador divergem');
      window.Charts.bars(root.querySelector('#sales-chart'), { labels, values, highlight: 5, format: (v) => A.money0(v), tickFormat: (v) => (v >= 1000 ? `${A.int(v / 1000)} mil` : A.int(v)), height: 230 });
      root.querySelectorAll('[data-period]').forEach((b) => b.addEventListener('click', () => { V.period = b.dataset.period; A.render(); }));
      const fr = root.querySelector('#v-from'), to = root.querySelector('#v-to');
      if (fr) [fr, to].forEach((i) => i.addEventListener('change', () => { if (fr.value && to.value && fr.value <= to.value) { V.from = fr.value; V.to = to.value; A.render(); } }));
      root.querySelectorAll('[data-go]').forEach((tr) => tr.addEventListener('click', (e) => { if (!e.target.closest('a')) A.go(tr.dataset.go); }));
    },
  };
})();
