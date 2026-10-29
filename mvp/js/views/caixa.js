// Fluxo de caixa: entradas e saídas do mês, previsto e realizado, lançamentos manuais e log de valores.
(() => {
  const A = window.App;
  const { html, raw, icon } = A;
  const F = { month: null, kind: 'todos', cat: '' };
  const signed = (e) => (e.kind === 'in' ? e.value : -e.value);
  const parseMoney = (s) => { const v = Number(String(s).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return Number.isFinite(v) ? Math.round(v * 100) / 100 : NaN; };

  const monthRange = () => { const a = F.month ? A.parse(`${F.month}-01`) : new Date(); return [A.isoDate(new Date(a.getFullYear(), a.getMonth(), 1)), A.isoDate(new Date(a.getFullYear(), a.getMonth() + 1, 0))]; };
  const monthLabel = () => { const a = A.parse(monthRange()[0]); return `${A.MESES[a.getMonth()]} de ${a.getFullYear()}`; };
  function shift(dir) { const a = A.parse(monthRange()[0]); a.setMonth(a.getMonth() + dir); F.month = `${a.getFullYear()}-${A.pad(a.getMonth() + 1)}`; }

  function entryDialog(e) {
    const x = e || { kind: 'out', desc: '', value: null, date: A.isoDate(new Date()), category: '', status: 'previsto' };
    const cats = A.S.categories;
    A.dialog({
      title: e ? 'Editar lançamento' : 'Novo lançamento', submit: e ? 'Salvar' : 'Lançar',
      body: html`<div class="field"><span class="label">Tipo</span><div class="segmented" role="group" aria-label="Tipo"><button type="button" data-k="in">Entrada</button><button type="button" data-k="out">Saída</button></div><input type="hidden" name="kind" value="${x.kind}"></div>
        <div class="field"><label for="e-desc">Descrição *</label><input class="input" id="e-desc" name="desc" value="${x.desc}"></div>
        <div class="form-grid"><div class="field"><label for="e-val">Valor (R$) *</label><input class="input num" id="e-val" name="value" inputmode="decimal" value="${x.value == null ? '' : x.value.toFixed(2).replace('.', ',')}"></div>
          <div class="field"><label for="e-date">Data *</label><input class="input" id="e-date" type="date" name="date" value="${x.date}"></div></div>
        <div class="form-grid"><div class="field"><label for="e-cat">Categoria *</label><select class="input" id="e-cat" name="category"></select></div>
          <div class="field"><label for="e-st">Situação</label><select class="input" id="e-st" name="status"><option value="previsto" ${x.status === 'previsto' ? raw('selected') : ''}>Previsto</option><option value="realizado" ${x.status === 'realizado' ? raw('selected') : ''}>Realizado</option></select></div></div>`,
      onOpen: (form) => {
        const hid = form.querySelector('[name=kind]'), sel = form.querySelector('#e-cat');
        const paint = () => {
          form.querySelectorAll('[data-k]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === hid.value)));
          // "Venda de projeto" é só das parcelas automáticas
          const list = cats[hid.value].filter((c) => c !== 'Venda de projeto');
          sel.innerHTML = A.val(list.map((c) => html`<option ${c === x.category ? raw('selected') : ''}>${c}</option>`));
        };
        form.querySelectorAll('[data-k]').forEach((b) => b.addEventListener('click', () => { hid.value = b.dataset.k; paint(); }));
        paint();
      },
      onSubmit: (fd) => {
        const v = { kind: fd.get('kind'), desc: String(fd.get('desc')).trim(), value: parseMoney(fd.get('value')), date: fd.get('date'), category: fd.get('category'), status: fd.get('status') };
        if (!v.desc || !v.date || !v.category) return 'Preencha descrição, data e categoria.';
        if (!Number.isFinite(v.value) || v.value <= 0) return 'Informe um valor maior que zero.';
        if (e) {
          const changed = e.value !== v.value;
          if (changed) A.logValue({ entryId: e.id, what: `Lançamento “${v.desc}”`, from: A.money(e.value), to: A.money(v.value) });
          Object.assign(e, v); A.save(); A.toast('Lançamento atualizado', changed ? ['Alteração de valor registrada no log'] : []);
        } else { A.S.cash.push({ id: A.uid('m'), ...v }); A.save(); A.toast(v.kind === 'in' ? 'Entrada lançada' : 'Saída lançada', [`${A.money(v.value)} · ${v.category} · ${v.status}`]); }
        A.render();
      },
    });
  }

  A.views.caixa = {
    title: 'Fluxo de caixa',
    render() {
      const r = monthRange(), today = A.isoDate(new Date());
      const all = A.S.cash.filter((e) => e.date >= r[0] && e.date <= r[1]);
      const ins = all.filter((e) => e.kind === 'in'), outs = all.filter((e) => e.kind === 'out');
      const real = (xs) => xs.filter((e) => e.status === 'realizado');
      const prev = (xs) => xs.filter((e) => e.status === 'previsto');
      const tin = A.sum(ins), tout = A.sum(outs), bal = Math.round((tin - tout) * 100) / 100;
      const rbal = Math.round((A.sum(real(ins)) - A.sum(real(outs))) * 100) / 100;
      const late = all.filter((e) => e.status === 'previsto' && e.date < today);
      let rows = all;
      if (F.kind !== 'todos') rows = rows.filter((e) => e.kind === F.kind);
      if (F.cat) rows = rows.filter((e) => e.category === F.cat);
      rows = [...rows].sort((a, b) => a.date.localeCompare(b.date) || (a.kind === 'in' ? -1 : 1));
      const byCat = A.S.categories.out.map((c) => ({ c, v: A.sum(outs.filter((e) => e.category === c)) })).filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
      const maxCat = Math.max(1, ...byCat.map((x) => x.v));
      const finding = late.length ? `${A.plural(late.length, 'lançamento previsto já venceu', 'lançamentos previstos já venceram')} sem ser marcado como realizado (${A.money(A.sum(late, signed))}).` : `O mês fecha em ${A.money(bal)} se tudo o que está previsto se realizar.`;
      const dash = raw('<span class="faint">—</span>');
      return html`
        <div class="title-row"><div><h1>Fluxo de caixa</h1><p class="sub">${finding}</p></div>
          <div class="actions"><button class="btn primary" data-new>${icon('plus')}Novo lançamento</button></div></div>
        <div class="filters">
          <button class="btn icon" data-shift="-1" aria-label="Mês anterior">${icon('back')}</button><button class="btn icon" data-shift="1" aria-label="Próximo mês" style="transform:scaleX(-1)">${icon('back')}</button>
          <strong style="font-size:16px;font-weight:800">${monthLabel()}</strong>
          ${F.month ? html`<button class="btn sm" data-this>Mês atual</button>` : ''}
        </div>
        <div class="kpis lead-first" style="margin-bottom:var(--gap)">
          <div class="kpi"><div class="kpi-label">Saldo previsto do mês</div><div class="kpi-value lead ${bal < 0 ? 'neg-text' : ''}">${A.money(bal)}</div><div class="kpi-sub">entradas menos saídas, previstas e realizadas</div></div>
          <div class="kpi"><div class="kpi-label">Entradas</div><div class="kpi-value">${A.money(tin)}</div><div class="kpi-sub">${A.money(A.sum(real(ins)))} realizadas · ${A.money(A.sum(prev(ins)))} previstas</div></div>
          <div class="kpi"><div class="kpi-label">Saídas</div><div class="kpi-value">${A.money(tout)}</div><div class="kpi-sub">${A.money(A.sum(real(outs)))} realizadas · ${A.money(A.sum(prev(outs)))} previstas</div></div>
          <div class="kpi"><div class="kpi-label">Saldo realizado</div><div class="kpi-value">${A.money(rbal)}</div><div class="kpi-sub">só o que já entrou e saiu</div></div>
        </div>
        <div class="grid">
          <section class="panel s8" aria-labelledby="cx-chart"><header><h2 id="cx-chart">Entradas e saídas por dia</h2><span class="meta" id="cx-legend"></span></header><div class="chart" id="cash-chart"></div></section>
          <section class="panel s4" aria-labelledby="cx-cat"><header><h2 id="cx-cat">Saídas por categoria</h2><span class="meta">${A.money0(tout)}</span></header>
            ${byCat.length ? html`<ul class="ranks">${byCat.slice(0, 6).map((x) => html`<li><button class="text-btn rk" data-cat="${x.c}" style="font-weight:400;text-align:left"><span>${x.c}</span><span class="num">${A.money0(x.v)}</span></button>
              <div class="bar" style="width:${(88 * x.v) / maxCat}%"></div></li>`)}</ul>
              ${byCat.length > 6 ? html`<p class="small muted" style="margin-top:8px">Mais ${A.plural(byCat.length - 6, 'categoria', 'categorias')}: ${A.money0(A.sum(byCat.slice(6), (x) => x.v))}</p>` : ''}` : html`<div class="empty">Nenhuma saída neste mês.</div>`}
          </section>
          <section class="panel s12" aria-labelledby="cx-list">
            <header><h2 id="cx-list">Lançamentos</h2>
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                <div class="segmented" role="group" aria-label="Tipo">${[['todos', 'Todos'], ['in', 'Entradas'], ['out', 'Saídas']].map(([k, l]) => html`<button data-kind="${k}" aria-pressed="${String(F.kind === k)}">${l}</button>`)}</div>
                <label class="sr" for="cx-catf">Categoria</label><select class="input sm" id="cx-catf" style="width:auto"><option value="">Todas as categorias</option>${[...A.S.categories.in, ...A.S.categories.out].map((c) => html`<option ${F.cat === c ? raw('selected') : ''}>${c}</option>`)}</select>
              </div></header>
            ${rows.length ? html`<div class="table-wrap"><table class="resp"><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th class="n">Valor</th><th>Situação</th><th class="n"><span class="sr">Ações</span></th></tr></thead>
              <tbody>${rows.map((e) => html`<tr>
                <td class="num hide-m">${A.dateNum(e.date)}</td>
                <td class="id-col"><span style="font-weight:600">${e.desc}</span><span class="sub">${A.dateNum(e.date)}${e.status === 'previsto' && e.date < today ? ' · vencido' : ''}</span></td>
                <td class="hide-m">${e.category}</td>
                <td class="n ${e.kind === 'in' ? 'amount-in' : ''}"><strong>${e.kind === 'in' ? '+' : '−'}${A.money(e.value)}</strong></td>
                <td class="m-2"><button class="toggle-real ${e.status === 'realizado' ? 'on' : ''}" data-toggle="${e.id}" aria-pressed="${String(e.status === 'realizado')}" title="Alternar entre previsto e realizado">${e.status === 'realizado' ? html`${icon('check', 12)}Realizado` : 'Previsto · marcar realizado'}</button></td>
                <td class="n hide-m">${e.dealId ? html`<a class="text-btn small" href="#/negocios/${e.dealId}">Editar venda</a>` : html`<button class="text-btn small" data-edit="${e.id}">Editar</button>`}</td></tr>`)}</tbody>
              <tfoot><tr><td class="hide-m"></td><td class="muted">${A.plural(rows.length, 'lançamento', 'lançamentos')}</td><td class="hide-m"></td><td class="n"><strong>${A.sum(rows, signed) >= 0 ? '+' : '−'}${A.money(Math.abs(A.sum(rows, signed)))}</strong></td><td></td><td class="hide-m"></td></tr></tfoot></table></div>`
              : html`<div class="empty">Nenhum lançamento com esses filtros.</div>`}
          </section>
          <section class="panel s12" aria-labelledby="cx-log"><header><h2 id="cx-log">Log de alterações de valor</h2><span class="meta">quem, quando, valor anterior e novo</span></header>
            ${A.S.valueLog.length ? html`<div class="table-wrap"><table class="resp"><thead><tr><th>Quando</th><th>Quem</th><th>O que mudou</th><th>Antes</th><th>Depois</th></tr></thead>
              <tbody>${A.S.valueLog.slice(0, 12).map((l) => html`<tr><td class="num hide-m">${A.dateNum(l.at)} ${A.time(l.at)}</td><td class="hide-m">${A.user(l.by).name}</td>
                <td class="id-col">${l.dealId ? html`<a class="link" href="#/negocios/${l.dealId}">${l.what} · ${A.S.deals.find((d) => d.id === l.dealId).title}</a>` : l.what}<span class="sub">${A.user(l.by).name} · ${A.dateNum(l.at)}</span></td>
                <td class="m-2">${l.from}</td><td class="m-2">→ ${l.to}</td></tr>`)}</tbody></table></div>`
              : html`<div class="empty">Nenhuma alteração de valor ainda. Edite uma venda ou um lançamento e a mudança aparece aqui.</div>`}
          </section>
        </div>`;
    },
    mount(root) {
      const r = monthRange(), a = A.parse(r[0]), n = A.parse(r[1]).getDate();
      const all = A.S.cash.filter((e) => e.date >= r[0] && e.date <= r[1]);
      const up = [], down = [], labels = [];
      for (let i = 1; i <= n; i++) {
        const iso = `${r[0].slice(0, 8)}${A.pad(i)}`;
        labels.push(String(i));
        up.push(A.sum(all.filter((e) => e.date === iso && e.kind === 'in')));
        down.push(A.sum(all.filter((e) => e.date === iso && e.kind === 'out')));
      }
      const t = new Date(), ti = t.getFullYear() === a.getFullYear() && t.getMonth() === a.getMonth() ? t.getDate() - 1 : null;
      const ch = window.Charts.diverging(root.querySelector('#cash-chart'), { labels, up, down, above: 'Entradas', below: 'Saídas', format: (v) => A.money0(v), tickFormat: (v) => (v >= 1000 ? `${A.int(v / 1000)} mil` : A.int(v)), height: 300, annotations: ti != null ? [{ at: ti, label: 'Hoje' }] : undefined, xAt: [0, 4, 9, 14, 19, 24, 29].filter((i) => i < n) });
      if (ch && ch.legend) root.querySelector('#cx-legend').appendChild(ch.legend);
      root.querySelector('[data-new]').addEventListener('click', () => entryDialog());
      root.querySelectorAll('[data-shift]').forEach((b) => b.addEventListener('click', () => { shift(Number(b.dataset.shift)); A.render(); }));
      root.querySelector('[data-this]')?.addEventListener('click', () => { F.month = null; A.render(); });
      root.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => { F.kind = b.dataset.kind; A.render(); }));
      root.querySelector('#cx-catf').addEventListener('change', (e) => { F.cat = e.target.value; A.render(); });
      root.querySelectorAll('[data-cat]').forEach((b) => b.addEventListener('click', () => { F.cat = b.dataset.cat; F.kind = 'out'; A.render(); }));
      root.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => entryDialog(A.S.cash.find((e) => e.id === b.dataset.edit))));
      root.querySelectorAll('[data-toggle]').forEach((b) => b.addEventListener('click', () => {
        const e = A.S.cash.find((x) => x.id === b.dataset.toggle);
        e.status = e.status === 'realizado' ? 'previsto' : 'realizado'; A.save();
        A.toast(e.status === 'realizado' ? 'Marcado como realizado' : 'Voltou para previsto', [`${e.desc} · ${A.money(e.value)}`]);
        A.render();
      }));
    },
  };
})();
