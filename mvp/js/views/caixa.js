// Fluxo de caixa: linha Caixa, realizado × pendente, atrasados, caixa e movimento por mês, lançamentos e log de valores.
// As contas ficam em js/cash.js (centavos, testadas); aqui só a interface.
(() => {
  const A = window.App;
  const C = window.Cash;
  const { html, raw, icon } = A;
  const F = { month: null, kind: 'todos', focus: null, focusChart: false };
  const parseMoney = (s) => { const v = Number(String(s).replace(/[^\d,.-]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return Number.isFinite(v) ? Math.round(v * 100) / 100 : NaN; };
  const STATUS_LABEL = { previsto: 'pendente', realizado: 'realizado' };

  // valores em centavos: entrada verde com "+", saída vermelha com "−", zero em cinza
  const m = (c) => A.money(c / 100);
  const sg = (c) => (c > 0 ? `+${m(c)}` : c < 0 ? `−${m(-c)}` : m(0));
  const tone = (c) => (c > 0 ? 'amount-in' : c < 0 ? 'neg-text' : 'muted');
  const fmt1 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format;
  const short = (c) => {
    const v = c / 100, a = Math.abs(v), s = v < 0 ? '−' : '';
    if (a >= 1e6) return `${s}R$ ${fmt1(a / 1e6)} mi`;
    return a >= 1000 ? `${s}R$ ${fmt1(a / 1000)} mil` : `${s}R$ ${A.int(Math.round(a))}`;
  };

  const today = () => A.isoDate(new Date());
  const mesAtual = () => today().slice(0, 7);
  const mesAberto = () => F.month || mesAtual();
  const monthName = (mes) => { const [y, mo] = mes.split('-').map(Number); return `${A.MESES[mo - 1]} de ${y}`; };
  const openMonth = (mes) => { F.month = mes === mesAtual() ? null : mes; A.render(); };

  function entryDialog(e) {
    const x = e || { kind: 'out', desc: '', value: null, date: today(), category: '', status: 'previsto' };
    const cats = A.S.categories;
    A.dialog({
      title: e ? 'Editar lançamento' : 'Novo lançamento', submit: e ? 'Salvar' : 'Lançar',
      body: html`<div class="field"><span class="label">Tipo</span><div class="segmented" role="group" aria-label="Tipo"><button type="button" data-k="in">Entrada</button><button type="button" data-k="out">Saída</button></div><input type="hidden" name="kind" value="${x.kind}"></div>
        <div class="field"><label for="e-desc">Descrição *</label><input class="input" id="e-desc" name="desc" value="${x.desc}"></div>
        <div class="form-grid"><div class="field"><label for="e-val">Valor (R$) *</label><input class="input num" id="e-val" name="value" inputmode="decimal" value="${x.value == null ? '' : x.value.toFixed(2).replace('.', ',')}"></div>
          <div class="field"><label for="e-date">Data *</label><input class="input" id="e-date" type="date" name="date" value="${x.date}"></div></div>
        <div class="form-grid"><div class="field"><label for="e-cat">Categoria *</label><select class="input" id="e-cat" name="category"></select></div>
          <div class="field"><label for="e-st">Situação</label><select class="input" id="e-st" name="status"><option value="previsto" ${x.status === 'previsto' ? raw('selected') : ''}>Pendente</option><option value="realizado" ${x.status === 'realizado' ? raw('selected') : ''}>Realizado</option></select></div></div>`,
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
        } else { A.S.cash.push({ id: A.uid('m'), ...v }); A.save(); A.toast(v.kind === 'in' ? 'Entrada lançada' : 'Saída lançada', [`${A.money(v.value)} · ${v.category} · ${STATUS_LABEL[v.status]}`]); }
        A.render();
      },
    });
  }

  // ---------- blocos da tela ----------
  const cell = (k, c, note, lead = false) => html`<div class="cr-cell"><div class="cr-k">${k}</div><div class="cr-v ${lead ? 'lead' : ''} ${tone(c)}">${sg(c)}</div>${note ? html`<div class="cr-n">${note}</div>` : ''}</div>`;
  const rowHead = (id, title, sub) => html`<div class="cr-head"><h2 id="${id}">${title}</h2><span>${sub}</span></div>`;

  function cashLine(L, mes) {
    const past = mes < mesAtual(), R = L.resumo;
    let note = R.entradasPrevistas || R.saidasPrevistas ? 'se os pendentes do mês se confirmarem' : 'sem pendentes no mês';
    if (L.atrasadosAnteriores) note += `; não conta ${A.plural(L.atrasadosAnteriores, 'atrasado', 'atrasados')} de meses anteriores (ver Atrasados)`;
    return html`<section class="cashrow total" aria-labelledby="cx-caixa">${rowHead('cx-caixa', 'Caixa', 'dinheiro da empresa')}
      ${cell('Início do mês', L.inicio, `em ${A.dateNum(C.monthStart(mes))}`)}
      ${cell(past ? 'Fim do mês' : 'Caixa hoje', L.hoje, `${sg(R.saldoAtual)} desde o início do mês`, true)}
      ${cell('Previsto no fim do mês', L.fim, note)}</section>`;
  }

  const realPend = (R) => html`<div class="cash-pair">
      <section class="cashrow real" aria-labelledby="cx-real">${rowHead('cx-real', 'Realizado', 'o que já entrou e saiu')}
        ${cell('Entradas', R.entradasRealizadas)}${cell('Saídas', -R.saidasRealizadas)}${cell('Saldo atual do mês', R.saldoAtual, '', true)}</section>
      <section class="cashrow pend" aria-labelledby="cx-pend">${rowHead('cx-pend', 'Pendente', 'ainda não confirmado')}
        ${cell('A receber', R.entradasPrevistas)}${cell('A pagar', -R.saidasPrevistas)}${cell('Saldo do mês previsto', R.saldoPrevisto, '', true)}</section></div>`;

  const sumOf = (xs, kind) => xs.filter((e) => e.kind === kind).reduce((a, e) => a + C.cents(e.value), 0);

  function entryRow(e) {
    const t = today(), late = e.status === 'previsto' && e.date < t, c = C.signedCents(e);
    const desc = e.dealId ? html`<a class="cx-deal" href="#/negocios/${e.dealId}">${e.desc}</a>` : e.desc;
    return html`<tr>
      <td class="num cx-date">${A.dateNum(e.date)}${late ? html`<span class="neg-text"> · atrasado há ${A.plural(C.diasAtraso(e.date, t), 'dia', 'dias')}</span>` : ''}</td>
      <td class="cx-desc"><span class="cx-title">${desc}</span><span class="sub">${e.category}</span></td>
      <td class="n num cx-val ${tone(c)}"><strong>${sg(c)}</strong></td>
      <td class="cx-act"><div><label class="check"><input type="checkbox" data-real="${e.id}" ${e.status === 'realizado' ? raw('checked') : ''}>Realizado</label>
        ${e.dealId ? html`<a class="text-btn small" href="#/negocios/${e.dealId}">Editar venda</a>` : html`<button class="text-btn small" data-edit="${e.id}">Editar</button>`}</div></td></tr>`;
  }
  const entryTable = (body, label) => html`<div class="table-wrap"><table class="cx-table" aria-label="${label}"><thead><tr><th>Data</th><th>Descrição</th><th class="n">Valor</th><th>Ações</th></tr></thead><tbody>${body}</tbody></table></div>`;

  function latePanel(late) {
    if (!late.length) return html`<p class="all-clear">Nada atrasado: toda conta e todo recebimento com data passada já está realizado.</p>`;
    return html`<section class="panel late" aria-labelledby="cx-late"><header><div class="head-left"><h2 id="cx-late">Atrasados</h2><span class="pill neg">${A.int(late.length)}</span></div>
        <span class="meta num">a receber ${sg(sumOf(late, 'in'))} · a pagar ${sg(-sumOf(late, 'out'))}</span></header>
      ${entryTable(late.map(entryRow), 'Lançamentos atrasados')}</section>`;
  }

  function chartPanel(meses) {
    const label = (mes) => { const [y, mo] = mes.split('-').map(Number); return `${A.MES[mo - 1]} ${y}`; };
    return html`<section class="panel" aria-labelledby="cx-chart"><header><h2 id="cx-chart">Caixa e movimento por mês</h2><span class="meta">${label(meses[0])} a ${label(meses[meses.length - 1])}</span></header>
      <p class="cc-legend"><span><i class="sw-in"></i>Entradas</span><span><i class="sw-out"></i>Saídas</span><span><i class="sw-prev"></i>previsto</span><span><i class="sw-line"></i>Caixa no fim do mês</span><span><i class="sw-proj"></i>projetado</span></p>
      <div id="cash-chart"></div></section>`;
  }

  function listPanel(mes) {
    let rows = A.S.cash.filter((e) => e.date.slice(0, 7) === mes);
    if (F.kind !== 'todos') rows = rows.filter((e) => e.kind === F.kind);
    rows = [...rows].sort((a, b) => a.date.localeCompare(b.date) || (a.kind === 'in' ? -1 : 1));
    const pend = rows.filter((e) => e.status === 'previsto'), real = rows.filter((e) => e.status === 'realizado');
    const group = (title, xs, inL, outL) => (xs.length ? html`<tr class="grp"><th colspan="4" scope="rowgroup">${title}<span class="num">${A.int(xs.length)} · ${inL} ${sg(sumOf(xs, 'in'))} · ${outL} ${sg(-sumOf(xs, 'out'))}</span></th></tr>${xs.map(entryRow)}` : '');
    return html`<section class="panel" aria-labelledby="cx-list"><header><div class="head-left"><h2 id="cx-list">Lançamentos de ${monthName(mes)}</h2><span class="meta num">${A.plural(rows.length, 'lançamento', 'lançamentos')}</span></div>
        <div class="segmented" role="group" aria-label="Tipo">${[['todos', 'Todos'], ['in', 'Entradas'], ['out', 'Saídas']].map(([k, l]) => html`<button data-kind="${k}" aria-pressed="${String(F.kind === k)}">${l}</button>`)}</div></header>
      ${rows.length ? entryTable([group('Pendentes', pend, 'a receber', 'a pagar'), group('Realizados', real, 'entrou', 'saiu')], `Lançamentos de ${monthName(mes)}`)
        : html`<div class="empty">Nenhum lançamento com este filtro em ${monthName(mes)}.</div>`}</section>`;
  }

  const logPanel = () => html`<section class="panel" aria-labelledby="cx-log"><header><h2 id="cx-log">Alterações de valor</h2></header>
    ${A.S.valueLog.length ? html`<div class="table-wrap"><table class="resp"><thead><tr><th>Quando</th><th>Quem</th><th>O que mudou</th><th>Antes</th><th>Depois</th></tr></thead>
      <tbody>${A.S.valueLog.slice(0, 12).map((l) => html`<tr><td class="num hide-m">${A.dateNum(l.at)} ${A.time(l.at)}</td><td class="hide-m">${A.user(l.by).name}</td>
        <td class="id-col">${l.dealId ? html`<a class="link" href="#/negocios/${l.dealId}">${l.what} · ${A.S.deals.find((d) => d.id === l.dealId).title}</a>` : l.what}<span class="sub">${A.user(l.by).name} · ${A.dateNum(l.at)}</span></td>
        <td class="m-2">${l.from}</td><td class="m-2">→ ${l.to}</td></tr>`)}</tbody></table></div>`
      : html`<div class="empty">Nenhuma alteração de valor ainda. Edite uma venda ou um lançamento e a mudança aparece aqui.</div>`}</section>`;

  A.views.caixa = {
    title: 'Fluxo de caixa',
    render() {
      const mes = mesAberto();
      const L = C.linhaCaixa(A.S.cash, mes);
      return html`
        <div class="title-row"><h1>Fluxo de caixa</h1>
          <div class="actions"><button class="btn primary" data-new>${icon('plus')}Novo lançamento</button></div></div>
        <div class="filters">
          <button class="btn icon" data-shift="-1" aria-label="Mês anterior">${icon('back')}</button><button class="btn icon" data-shift="1" aria-label="Próximo mês" style="transform:scaleX(-1)">${icon('back')}</button>
          <strong class="cx-month">${monthName(mes)}</strong>
          ${F.month ? html`<button class="btn sm" data-this>Mês atual</button>` : ''}
        </div>
        <div class="stack">${cashLine(L, mes)}${realPend(L.resumo)}${latePanel(C.atrasados(A.S.cash, today()))}${chartPanel(C.janela(mes))}${listPanel(mes)}${logPanel()}</div>`;
    },
    mount(root) {
      const mes = mesAberto(), cur = mesAtual();
      window.CashChart.render(root.querySelector('#cash-chart'), {
        series: C.caixaMensal(A.S.cash, C.janela(mes), cur), mesAtual: cur, mesAberto: mes, months: A.MES, monthsLong: A.MESES,
        money: m, signed: sg, short,
        onOpen: (x) => { F.focusChart = root.querySelector('.cc-plot') === document.activeElement; openMonth(x); },
      });
      if (F.focusChart) { F.focusChart = false; root.querySelector('.cc-plot').focus(); }
      root.querySelector('[data-new]').addEventListener('click', () => entryDialog());
      root.querySelectorAll('[data-shift]').forEach((b) => b.addEventListener('click', () => openMonth(C.addMonths(mes, Number(b.dataset.shift)))));
      root.querySelector('[data-this]')?.addEventListener('click', () => openMonth(cur));
      root.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => { F.kind = b.dataset.kind; A.render(); }));
      root.querySelectorAll('[data-edit]').forEach((b) => b.addEventListener('click', () => entryDialog(A.S.cash.find((e) => e.id === b.dataset.edit))));
      root.querySelectorAll('[data-real]').forEach((b) => b.addEventListener('change', () => {
        const e = A.S.cash.find((x) => x.id === b.dataset.real);
        e.status = b.checked ? 'realizado' : 'previsto'; A.save();
        A.toast(b.checked ? 'Marcado como realizado.' : 'Voltou para pendente.', [`${e.desc} · ${A.money(e.value)}`]);
        F.focus = e.id;
        A.render();
      }));
      if (F.focus) { root.querySelector(`[data-real="${F.focus}"]`)?.focus(); F.focus = null; }
    },
  };
})();
