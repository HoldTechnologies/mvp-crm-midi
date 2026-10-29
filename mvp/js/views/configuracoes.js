// Configurações (Administrador): usuários e perfis, categorias do fluxo de caixa.
(() => {
  const A = window.App;
  const { html, raw, icon, avatar } = A;
  const G = { tab: 'usuarios' };
  const HUES = [18, 210, 140, 280, 48, 330, 180, 95];

  const rolesField = (sel = []) => html`<div class="checks">${Object.entries(A.ROLES).map(([k, l]) => html`<label class="check"><input type="checkbox" name="roles" value="${k}" ${sel.includes(k) ? raw('checked') : ''}>${l}</label>`)}</div><span class="hint">As permissões somam as de todos os perfis marcados.</span>`;

  function userDialog(u) {
    A.dialog({
      title: u ? `Perfis de ${u.name}` : 'Novo usuário', submit: u ? 'Salvar perfis' : 'Adicionar usuário',
      body: html`${u ? '' : html`<div class="field"><label for="u-name">Nome *</label><input class="input" id="u-name" name="name"></div>
          <div class="field"><label for="u-mail">Conta Google *</label><input class="input" id="u-mail" name="email" type="email" placeholder="nome@empresa.com.br"><span class="hint">É com esta conta que a pessoa entra no sistema e no servidor MCP.</span></div>`}
        <div class="field"><span class="label">Perfis *</span>${rolesField(u ? u.roles : [])}</div>`,
      onSubmit: (fd) => {
        const roles = fd.getAll('roles');
        if (!roles.length) return 'Marque pelo menos um perfil.';
        if (u) {
          const admins = A.S.users.filter((x) => x.roles.includes('admin'));
          if (u.roles.includes('admin') && !roles.includes('admin') && admins.length === 1) return 'É preciso manter pelo menos um Administrador.';
          u.roles = roles; A.save(); A.toast('Perfis atualizados', [`${u.name}: ${roles.map((r) => A.ROLES[r]).join(', ')}`]);
        } else {
          const name = String(fd.get('name')).trim(), email = String(fd.get('email')).trim();
          if (!name || !/^\S+@\S+\.\S+$/.test(email)) return 'Informe nome e um e-mail válido.';
          if (A.S.users.some((x) => x.email === email)) return 'Já existe um usuário com essa conta.';
          A.S.users.push({ id: A.uid('u'), name, email, roles, hue: HUES[A.S.users.length % HUES.length] }); A.save();
          A.toast('Usuário adicionado', [`${name} entra com ${email}`]);
        }
        A.render();
      },
    });
  }

  function users() {
    return html`<section class="panel"><header><h2>Usuários</h2><button class="btn primary" data-new-user>${icon('plus')}Novo usuário</button></header>
      <div class="table-wrap"><table class="resp"><thead><tr><th>Pessoa</th><th>Conta Google</th><th>Perfis</th><th class="n"><span class="sr">Ações</span></th></tr></thead>
      <tbody>${A.S.users.map((u) => html`<tr><td class="id-col"><span style="display:inline-flex;gap:10px;align-items:center">${avatar(u, 28)}<strong>${u.name}</strong>${u.id === A.S.userId ? html`<span class="muted small">você</span>` : ''}</span></td>
        <td class="m-2">${u.email}</td><td class="m-2"><span style="display:inline-flex;gap:6px;flex-wrap:wrap">${u.roles.map((r) => html`<span class="pill">${A.ROLES[r]}</span>`)}</span></td>
        <td class="n"><button class="text-btn small" data-user="${u.id}">Editar perfis</button></td></tr>`)}</tbody></table></div></section>`;
  }

  function cats() {
    const used = (c) => A.S.cash.filter((e) => e.category === c).length;
    const block = (kind, title) => html`<section class="panel s6"><header><h2>${title}</h2><span class="meta">${A.plural(A.S.categories[kind].length, 'categoria', 'categorias')}</span></header>
      <ul>${A.S.categories[kind].map((c) => html`<li style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid var(--rule)">
        <span>${c}${c === 'Venda de projeto' ? html` <span class="small muted">· lançada automaticamente pelas vendas</span>` : html` <span class="small muted">· ${A.plural(used(c), 'lançamento', 'lançamentos')}</span>`}</span>
        ${c === 'Venda de projeto' ? '' : html`<span style="display:flex;gap:4px"><button class="text-btn small" data-ren="${kind}|${c}">Renomear</button>${used(c) ? '' : html`<button class="btn sm ghost" data-del="${kind}|${c}">Remover</button>`}</span>`}</li>`)}</ul>
      <form data-add="${kind}" style="display:flex;gap:8px;margin-top:12px"><label class="sr" for="add-${kind}">Nova categoria</label><input class="input sm" id="add-${kind}" name="c" placeholder="Nova categoria"><button class="btn sm">Adicionar</button></form></section>`;
    return html`<div class="grid top">${block('in', 'Entradas')}${block('out', 'Saídas')}</div>
      <p class="small muted" style="margin-top:12px">Categorias em uso não podem ser removidas; renomear atualiza os lançamentos existentes.</p>`;
  }

  A.views.configuracoes = {
    title: 'Configurações',
    render() {
      return html`<div class="title-row"><div><h1>Configurações</h1><p class="sub">${A.plural(A.S.users.length, 'pessoa', 'pessoas')} com acesso · ${A.S.users.filter((u) => u.roles.includes('admin')).length} administrador(es).</p></div></div>
        <div class="tabs" role="tablist">${[['usuarios', 'Usuários e perfis'], ['categorias', 'Categorias do caixa']].map(([k, l]) => html`<button role="tab" data-tab="${k}" aria-selected="${String(G.tab === k)}">${l}</button>`)}</div>
        ${G.tab === 'usuarios' ? users() : cats()}`;
    },
    mount(root) {
      root.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { G.tab = b.dataset.tab; A.render(); }));
      root.querySelector('[data-new-user]')?.addEventListener('click', () => userDialog());
      root.querySelectorAll('[data-user]').forEach((b) => b.addEventListener('click', () => userDialog(A.user(b.dataset.user))));
      root.querySelectorAll('[data-add]').forEach((f) => f.addEventListener('submit', (e) => {
        e.preventDefault(); const k = f.dataset.add, v = f.c.value.trim();
        if (!v || [...A.S.categories.in, ...A.S.categories.out].includes(v)) return;
        A.S.categories[k].push(v); A.save(); A.toast('Categoria adicionada', [v]); A.render();
      }));
      root.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => { const [k, c] = b.dataset.del.split('|'); A.S.categories[k] = A.S.categories[k].filter((x) => x !== c); A.save(); A.toast('Categoria removida', [c]); A.render(); }));
      root.querySelectorAll('[data-ren]').forEach((b) => b.addEventListener('click', () => {
        const [k, c] = b.dataset.ren.split('|');
        A.dialog({ title: 'Renomear categoria', submit: 'Renomear', body: html`<div class="field"><label for="rn">Nome</label><input class="input" id="rn" name="n" value="${c}"></div>`,
          onSubmit: (fd) => { const n = String(fd.get('n')).trim(); if (!n) return 'Informe um nome.'; if (n !== c && [...A.S.categories.in, ...A.S.categories.out].includes(n)) return 'Já existe uma categoria com esse nome.';
            A.S.categories[k] = A.S.categories[k].map((x) => (x === c ? n : x)); A.S.cash.forEach((e) => { if (e.category === c) e.category = n; }); A.save(); A.toast('Categoria renomeada', [`${c} → ${n}`]); A.render(); } });
      }));
    },
  };
})();
