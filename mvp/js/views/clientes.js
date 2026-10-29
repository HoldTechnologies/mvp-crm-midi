// Clientes: lista, ficha e cadastro (rápido com Nome e Cidade, ou completo).
(() => {
  const A = window.App;
  const { html, raw, icon } = A;
  const C = { q: '', sort: 'name', dir: 1 };

  const dealsOf = (cid) => A.S.deals.filter((d) => d.clientId === cid);
  const isOpen = (d) => !['concluido', 'cancelado'].includes(d.stage);
  const label = (c) => c.fantasy || c.name;
  A.clientLabel = label;

  // diálogo de cadastro/edição. Só Nome e Cidade são obrigatórios.
  A.clientDialog = (client, after) => {
    const c = client || { name: '', fantasy: '', doc: '', address: '', city: '', contact: '', sector: '' };
    A.dialog({
      title: client ? 'Editar cliente' : 'Novo cliente', wide: true, submit: client ? 'Salvar' : 'Cadastrar cliente',
      body: html`<p class="muted">Só Nome e Cidade são obrigatórios. O resto pode ser completado depois.</p>
        <div class="form-grid">
          <div class="field"><label for="c-name">Nome (razão social) *</label><input class="input" id="c-name" name="name" value="${c.name}" required autocomplete="off"></div>
          <div class="field"><label for="c-city">Cidade *</label><input class="input" id="c-city" name="city" value="${c.city}" required></div>
          <div class="field"><label for="c-fantasy">Nome fantasia</label><input class="input" id="c-fantasy" name="fantasy" value="${c.fantasy}"></div>
          <div class="field"><label for="c-doc">CNPJ ou CPF</label><input class="input" id="c-doc" name="doc" value="${c.doc}" inputmode="numeric"></div>
          <div class="field full"><label for="c-address">Endereço</label><input class="input" id="c-address" name="address" value="${c.address}"></div>
          <div class="field"><label for="c-contact">Nome do contato</label><input class="input" id="c-contact" name="contact" value="${c.contact}"></div>
          <div class="field"><label for="c-sector">Setor</label><input class="input" id="c-sector" name="sector" value="${c.sector}"></div>
        </div>`,
      onSubmit: (fd) => {
        const v = Object.fromEntries([...fd.entries()].map(([k, x]) => [k, String(x).trim()]));
        if (!v.name || !v.city) return 'Preencha Nome e Cidade.';
        if (client) { Object.assign(client, v); A.save(); A.toast('Cliente atualizado'); after && after(client); return; }
        const nc = { id: A.uid('c'), ...v, drive: null };
        A.S.clients.push(nc); A.save();
        A.toast('Cliente cadastrado', [`${label(nc)} · ${nc.city}`, 'A pasta no Drive é criada na primeira conversa inicial.']);
        after && after(nc);
      },
    });
  };

  A.views.clientes = {
    title: 'Clientes',
    render() {
      const q = C.q.toLowerCase();
      const rows = A.S.clients.filter((c) => !q || [c.name, c.fantasy, c.city, c.contact, c.sector].join(' ').toLowerCase().includes(q)).map((c) => {
        const ds = dealsOf(c.id);
        const last = ds.map((d) => d.history[0].at).sort().at(-1) || '';
        const total = A.sum(ds.filter((d) => d.stage !== 'cancelado' && d.approval), (d) => d.approval.value);
        return { c, open: ds.filter(isOpen).length, count: ds.length, last, total };
      });
      const key = { name: (r) => label(r.c).toLowerCase(), city: (r) => r.c.city, open: (r) => r.open, total: (r) => r.total, last: (r) => r.last }[C.sort];
      rows.sort((a, b) => (key(a) > key(b) ? 1 : key(a) < key(b) ? -1 : 0) * C.dir);
      const th = (k, l, n) => html`<th class="${n ? 'n' : ''}" ${C.sort === k ? raw(`aria-sort="${C.dir > 0 ? 'ascending' : 'descending'}"`) : ''}><button data-sort="${k}">${l}${C.sort === k ? (C.dir > 0 ? ' ↑' : ' ↓') : ''}</button></th>`;
      const openTotal = rows.reduce((a, r) => a + r.open, 0);
      return html`
        <div class="title-row"><div><h1>Clientes</h1><p class="sub">${A.plural(A.S.clients.length, 'cliente', 'clientes')}, ${A.plural(openTotal, 'negócio aberto', 'negócios abertos')} entre eles.</p></div>
          <div class="actions">${A.can('clients.edit') ? html`<button class="btn primary" data-new>${icon('plus')}Novo cliente</button>` : ''}</div></div>
        <div class="filters"><label class="sr" for="c-q">Buscar clientes</label><input class="input sm search" id="c-q" type="search" placeholder="Buscar por nome, cidade, contato ou setor" value="${C.q}"><span class="spacer"></span><span class="muted small">${A.plural(rows.length, 'resultado', 'resultados')}</span></div>
        <section class="panel">
          ${rows.length ? html`<div class="table-wrap"><table class="resp">
            <thead><tr>${th('name', 'Cliente')}${th('city', 'Cidade')}<th>Contato</th>${th('open', 'Negócios abertos', true)}${th('total', 'Vendido', true)}${th('last', 'Último negócio', true)}</tr></thead>
            <tbody>${rows.map((r) => html`<tr class="clickable" data-go="clientes/${r.c.id}">
              <td class="id-col"><a href="#/clientes/${r.c.id}" style="font-weight:600">${label(r.c)}</a>${r.c.fantasy ? html`<span class="sub">${r.c.name}</span>` : r.c.sector ? html`<span class="sub">${r.c.sector}</span>` : ''}</td>
              <td class="m-2">${r.c.city}${r.c.contact ? html`<span class="hide-d"> · ${r.c.contact}</span>` : ''}</td>
              <td class="hide-m">${r.c.contact || raw('<span class="faint">—</span>')}</td>
              <td class="n">${r.open}<span class="faint"> / ${r.count}</span></td>
              <td class="n hide-m">${r.total ? A.money0(r.total) : raw('<span class="faint">—</span>')}</td>
              <td class="n hide-m">${r.last ? A.dateNum(r.last) : raw('<span class="faint">—</span>')}</td></tr>`)}</tbody></table></div>`
            : html`<div class="empty">Nenhum cliente encontrado para “${C.q}”.</div>`}
        </section>`;
    },
    mount(root) {
      const q = root.querySelector('#c-q');
      q.addEventListener('input', () => { C.q = q.value; A.render(); const n = document.getElementById('c-q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); });
      root.querySelector('[data-new]')?.addEventListener('click', () => A.clientDialog(null, (c) => A.go(`clientes/${c.id}`)));
      root.querySelectorAll('[data-sort]').forEach((b) => b.addEventListener('click', () => { const k = b.dataset.sort; C.dir = C.sort === k ? -C.dir : 1; C.sort = k; A.render(); }));
      root.querySelectorAll('[data-go]').forEach((tr) => tr.addEventListener('click', (e) => { if (!e.target.closest('a')) A.go(tr.dataset.go); }));
    },
  };

  A.views.cliente = {
    title: (id) => { const c = A.S.clients.find((x) => x.id === id); return c ? label(c) : 'Cliente'; },
    render(id) {
      const c = A.S.clients.find((x) => x.id === id);
      if (!c) return html`<div class="title-row"><div><h1>Cliente não encontrado</h1><p class="sub"><a class="link" href="#/clientes">Voltar para clientes</a></p></div></div>`;
      const ds = dealsOf(id).sort((a, b) => b.history[0].at.localeCompare(a.history[0].at));
      const open = ds.filter(isOpen);
      const sold = A.sum(ds.filter((d) => d.stage !== 'cancelado' && d.approval), (d) => d.approval.value);
      const dash = raw('<span class="faint">—</span>');
      return html`
        <div class="title-row"><div><div class="crumb"><a href="#/clientes">Clientes</a><span>/</span></div><h1>${label(c)}</h1>
          <p class="sub">${c.city}${c.sector ? ` · ${c.sector}` : ''} · ${A.plural(open.length, 'negócio aberto', 'negócios abertos')}, ${A.money0(sold)} vendidos no total</p></div>
          <div class="actions">${A.can('clients.edit') ? html`<button class="btn" data-edit>Editar cadastro</button>` : ''}${A.can('pipeline.edit') ? html`<button class="btn primary" data-deal>${icon('plus')}Nova conversa inicial</button>` : ''}</div></div>
        <div class="grid top">
          <section class="panel s8" aria-labelledby="h-deals">
            <header><h2 id="h-deals">Negócios</h2><span class="meta">${A.plural(ds.length, 'negócio', 'negócios')}</span></header>
            ${ds.length ? html`<div class="table-wrap"><table class="resp"><thead><tr><th>Negócio</th><th>Etapa</th><th class="n">Valor</th><th class="n">Início</th></tr></thead>
              <tbody>${ds.map((d) => html`<tr class="clickable" data-go="negocios/${d.id}"><td class="id-col"><a href="#/negocios/${d.id}" style="font-weight:600">${d.title}</a></td>
                <td class="m-2">${A.stagePill(d)}</td><td class="n">${A.dealValue(d) ? A.money0(A.dealValue(d)) : dash}</td><td class="n hide-m">${A.dateNum(d.history[0].at)}</td></tr>`)}</tbody></table></div>`
              : html`<div class="empty">Nenhum negócio ainda. Registre a conversa inicial para começar.</div>`}
          </section>
          <div class="s4 stack">
            <section class="panel" aria-labelledby="h-drive">
              <header><h2 id="h-drive">Pasta no Drive</h2></header>
              ${c.drive ? html`<p style="display:flex;gap:8px;align-items:center">${icon('folder')}<strong>${c.drive.name}</strong></p><p class="small muted" style="margin-top:4px">Drive central · criada em ${A.dateNum(c.drive.createdAt)}. Briefings, orçamentos, brutos e entregas ficam aqui.</p>`
                : html`<p class="muted">Ainda sem pasta. Ela é criada automaticamente quando a primeira conversa inicial for registrada.</p>`}
            </section>
            <section class="panel" aria-labelledby="h-data">
              <header><h2 id="h-data">Cadastro</h2></header>
              <dl class="kv">
                <dt>Razão social</dt><dd>${c.name}</dd>
                <dt>Nome fantasia</dt><dd>${c.fantasy || dash}</dd>
                <dt>CNPJ / CPF</dt><dd class="num">${c.doc || dash}</dd>
                <dt>Endereço</dt><dd>${c.address || dash}</dd>
                <dt>Cidade</dt><dd>${c.city}</dd>
                <dt>Contato</dt><dd>${c.contact || dash}</dd>
                <dt>Setor</dt><dd>${c.sector || dash}</dd>
              </dl>
            </section>
          </div>
        </div>`;
    },
    mount(root, id) {
      const c = A.S.clients.find((x) => x.id === id);
      if (!c) return;
      root.querySelector('[data-edit]')?.addEventListener('click', () => A.clientDialog(c, () => A.render()));
      root.querySelector('[data-deal]')?.addEventListener('click', () => A.newDealDialog(c.id));
      root.querySelectorAll('[data-go]').forEach((tr) => tr.addEventListener('click', (e) => { if (!e.target.closest('a')) A.go(tr.dataset.go); }));
    },
  };
})();
