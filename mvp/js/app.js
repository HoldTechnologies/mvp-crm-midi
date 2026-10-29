// Shell, rotas (hash) e tema. Cada tela registra-se em App.views[nome] = { title, render(params), mount?(root, params) }.
(() => {
  const A = window.App;
  const { html, raw, val, icon, avatar, esc } = A;
  A.views = A.views || {};

  // ---------- tema ----------
  const THEME_KEY = 'paleta-crm-theme';
  function initialTheme() {
    try { const t = localStorage.getItem(THEME_KEY); if (t) return t; } catch {}
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function setTheme(t) {
    document.documentElement.dataset.theme = t;
    try { localStorage.setItem(THEME_KEY, t); } catch {}
  }

  // ---------- rotas ----------
  const ROUTES = [
    [/^pomodoro$/, 'pomodoro'],
    [/^pomodoro\/relatorio$/, 'relatorio'],
    [/^clientes$/, 'clientes'],
    [/^clientes\/(\w+)$/, 'cliente'],
    [/^pipeline$/, 'pipeline'],
    [/^negocios\/(\w+)$/, 'negocio'],
    [/^calendario$/, 'calendario'],
    [/^vendas$/, 'vendas'],
    [/^caixa$/, 'caixa'],
    [/^configuracoes$/, 'configuracoes'],
  ];
  const NAV = [
    { group: 'Foco' },
    { route: 'pomodoro', label: 'Pomodoro', icon: 'timer' },
    { route: 'pomodoro/relatorio', label: 'Relatório de foco', icon: 'report' },
    { group: 'Vendas e produção' },
    { route: 'pipeline', label: 'Pipeline', icon: 'board', also: ['negocio'] },
    { route: 'clientes', label: 'Clientes', icon: 'users', also: ['cliente'] },
    { route: 'calendario', label: 'Calendário', icon: 'calendar' },
    { group: 'Gestão', show: () => A.can('sales') || A.can('cash') || A.can('users') },
    { route: 'vendas', label: 'Dashboard de vendas', icon: 'chart', perm: 'sales' },
    { route: 'caixa', label: 'Fluxo de caixa', icon: 'wallet', perm: 'cash' },
    { route: 'configuracoes', label: 'Configurações', icon: 'gear', perm: 'users' },
  ];
  const VIEW_PERM = { vendas: 'sales', caixa: 'cash', configuracoes: 'users' };

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '').split('?')[0];
    for (const [re, name] of ROUTES) { const m = h.match(re); if (m) return { name, params: m.slice(1), path: h }; }
    return { name: null, params: [], path: h };
  }
  A.go = (path) => { location.hash = `#/${path}`; };
  A.query = () => new URLSearchParams(location.hash.split('?')[1] || '');

  // a marca: um quadro de filme recortado no vermelho do sistema
  const MARK = raw(`<svg class="brand-mark" viewBox="0 0 28 28" aria-hidden="true"><rect width="28" height="28" fill="var(--accent)"/><rect x="5" y="8" width="18" height="12" fill="var(--ground)"/><rect x="5" y="4" width="3" height="2" fill="var(--ground)"/><rect x="11" y="4" width="3" height="2" fill="var(--ground)"/><rect x="17" y="4" width="3" height="2" fill="var(--ground)"/><rect x="5" y="22" width="3" height="2" fill="var(--ground)"/><rect x="11" y="22" width="3" height="2" fill="var(--ground)"/><rect x="17" y="22" width="3" height="2" fill="var(--ground)"/><path d="M12 11v6l5-3z" fill="var(--accent)"/></svg>`);
  A.MARK = MARK;

  function sidebar(cur) {
    const me = A.me();
    const items = NAV.filter((n) => (n.group ? (!n.show || n.show()) : !n.perm || A.can(n.perm)));
    const dark = document.documentElement.dataset.theme === 'dark';
    return html`<nav class="sidebar" id="sidebar" aria-label="Navegação principal">
      <div class="brand">${MARK}<div><div class="brand-name">Paleta CRM</div><span class="brand-scope">Fotograma Filmes</span></div>
        <button class="btn icon ghost close-menu" data-menu-close aria-label="Fechar menu">${icon('close')}</button></div>
      ${items.map((n) => n.group ? html`<div class="group-label">${n.group}</div>` : html`<a class="nav-item" href="#/${n.route}" ${n.route === cur.path || (n.also || []).includes(cur.name) || (cur.name === n.route) ? raw('aria-current="page"') : ''}>${icon(n.icon)}<span>${n.label}</span>${n.count ? html`<span class="count">${n.count()}</span>` : ''}</a>`)}
      <div class="bottom">
        <button class="nav-btn" data-theme-toggle>${icon(dark ? 'sun' : 'moon')}<span>${dark ? 'Tema claro' : 'Tema escuro'}</span></button>
        <button class="nav-btn" data-reset>${icon('reset')}<span>Restaurar dados de exemplo</span></button>
        <div class="me">${avatar(me, 32)}<div style="min-width:0;flex:1"><div class="me-name">${me.name}</div><div class="me-roles">${me.roles.map((r) => A.ROLES[r]).join(' · ')}</div></div>
          <button class="btn icon ghost" data-logout aria-label="Trocar de usuário" title="Trocar de usuário">${icon('logout')}</button></div>
      </div>
    </nav>`;
  }

  // ---------- entrada: escolha um usuário de demonstração ----------
  function login() {
    const app = document.getElementById('app');
    document.title = 'Entrar — Paleta CRM';
    app.className = '';
    app.innerHTML = val(html`<main class="login">
      <section class="login-side">
        <div class="brand">${MARK}<div class="brand-name">Paleta CRM</div></div>
        <div>
          <ol class="login-strip" aria-label="Etapas de um negócio">
            ${A.STAGES.map((s, i) => html`<li class="${i === 3 ? 'on' : ''}">${s.label}<span>${['reunião na agenda', 'valor e condição', 'parcelas no caixa', 'link do roteiro', 'aprovação do gestor', 'negócio fechado'][i]}</span></li>`)}
          </ol>
        </div>
        <p class="small" style="opacity:.75">Fotograma Filmes · Drive central da empresa</p>
      </section>
      <section class="login-main">
        <h1>Entrar no Paleta CRM</h1>
        <p class="sub">Protótipo com dados de exemplo. Escolha uma pessoa da equipe para ver o sistema com as permissões dela.</p>
        <div class="user-pick">
          ${A.S.users.map((u) => html`<button data-user="${u.id}">${avatar(u, 36)}<span class="who"><strong>${u.name}</strong><span class="small muted">${u.roles.map((r) => A.ROLES[r]).join(' · ')}</span></span>${icon('back')}</button>`)}
        </div>
      </section>
    </main>`);
    app.querySelectorAll('.user-pick svg.ic').forEach((s) => (s.style.transform = 'scaleX(-1)'));
    app.querySelectorAll('[data-user]').forEach((b) => b.addEventListener('click', () => {
      A.S.userId = b.dataset.user; A.save();
      if (location.hash === '#/pomodoro') render(); else A.go('pomodoro');
    }));
  }

  // ---------- render ----------
  function render() {
    const app = document.getElementById('app');
    if (!A.me()) return login();
    let cur = parseHash();
    if (!cur.name) { A.go('pomodoro'); return; }
    const view = A.views[cur.name];
    const blocked = VIEW_PERM[cur.name] && !A.can(VIEW_PERM[cur.name]);
    const title = blocked ? 'Sem acesso' : typeof view.title === 'function' ? view.title(...cur.params) : view.title;
    document.title = `${title} — Paleta CRM`;
    app.className = 'app';
    const body = blocked
      ? html`<div class="title-row"><div><h1>Sem acesso</h1><p class="sub">Seu perfil não inclui esta área. Peça a um administrador para ajustar seus perfis.</p></div></div>`
      : view.render(...cur.params);
    app.innerHTML = val(html`${sidebar(cur)}
      <div style="min-width:0">
        <header class="topbar"><button class="btn icon ghost" data-menu aria-label="Abrir menu" aria-controls="sidebar">${icon('menu')}</button><span class="where">${title}</span>${MARK}</header>
        <main class="canvas" id="main">${body}</main>
      </div>`);
    bindShell(app);
    if (!blocked && view.mount) view.mount(document.getElementById('main'), ...cur.params);
  }
  A.render = render;

  function bindShell(app) {
    const sb = app.querySelector('#sidebar');
    app.querySelector('[data-menu]').addEventListener('click', () => { sb.classList.add('open'); sb.querySelector('a, button').focus(); });
    sb.querySelector('[data-menu-close]').addEventListener('click', () => sb.classList.remove('open'));
    sb.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => sb.classList.remove('open')));
    sb.querySelector('[data-theme-toggle]').addEventListener('click', () => { setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'); render(); });
    sb.querySelector('[data-logout]').addEventListener('click', () => { A.S.userId = null; A.save(); login(); });
    sb.querySelector('[data-reset]').addEventListener('click', () => A.dialog({
      title: 'Restaurar dados de exemplo?', submit: 'Restaurar', danger: true,
      body: html`<p>Clientes, negócios, lançamentos e sessões de foco voltam ao estado inicial. O que você criou nesta demonstração será apagado.</p>`,
      onSubmit: () => { A.reset(); A.toast('Dados de exemplo restaurados'); render(); },
    }));
  }

  setTheme(initialTheme());
  A.load();
  // atalho de demonstração: index.html?as=u3 entra direto como aquela pessoa
  const as = new URLSearchParams(location.search).get('as');
  if (as && A.user(as)) { A.S.userId = as; A.save(); }
  window.addEventListener('hashchange', () => { render(); window.scrollTo(0, 0); });
  document.addEventListener('DOMContentLoaded', render);
})();
