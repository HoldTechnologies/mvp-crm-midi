// Pomodoro (tela inicial) e relatório de foco.
(() => {
  const A = window.App;
  const { html, raw, val, icon, avatar } = A;
  const MODES = { focus: 'Foco', short: 'Pausa curta', long: 'Pausa longa' };

  // ---------- o relógio vive fora da tela, para seguir contando ao navegar ----------
  const T = { mode: 'focus', running: false, remaining: null, total: null, startedAt: null, done: 0, timer: null };
  const cfg = () => A.S.pomo;
  const secsFor = (mode) => cfg()[mode] * 60;
  function reset(mode = T.mode) { T.mode = mode; T.total = secsFor(mode); T.remaining = T.total; T.running = false; T.startedAt = null; stopTick(); }
  const stopTick = () => { clearInterval(T.timer); T.timer = null; };
  function start() {
    if (T.remaining == null) reset('focus');
    if (T.mode === 'focus' && !T.startedAt) T.startedAt = new Date().toISOString();
    T.running = true; stopTick();
    T.timer = setInterval(tick, 1000);
    paint();
  }
  function pause() { T.running = false; stopTick(); paint(); }
  function tick() {
    T.remaining = Math.max(0, T.remaining - (cfg().fast ? 60 : 1));
    if (T.remaining === 0) finish(); else paint();
  }
  function record(status) {
    const start = new Date(T.startedAt);
    const secs = T.total - T.remaining;
    const minutes = status === 'concluida' ? cfg().focus : Math.max(1, Math.round(secs / 60));
    const s = { id: A.uid('p'), uid: A.S.userId, start: start.toISOString(), end: new Date(start.getTime() + minutes * 60000).toISOString(), minutes, rating: null, status };
    A.S.sessions.push(s); A.save();
    return s;
  }
  function finish() {
    stopTick(); T.running = false;
    if (T.mode === 'focus') {
      const s = record('concluida');
      T.done++;
      reset(T.done % cfg().every === 0 ? 'long' : 'short');
      paint();
      askRating(s);
    } else {
      reset('focus'); paint();
      A.toast('Pausa encerrada', ['Hora de voltar ao foco.']);
    }
  }
  function interrupt() {
    if (T.mode !== 'focus' || !T.startedAt) return;
    const s = record('interrompida');
    reset('focus'); paint();
    A.toast('Sessão interrompida registrada', [`${s.minutes} min de foco entram no relatório.`]);
  }
  function askRating(s) {
    A.dialog({
      title: 'Como foi a concentração?', submit: 'Salvar nota', cancel: 'Pular',
      body: html`<p>Foco de ${s.minutes} min encerrado às ${A.time(toLocal(s.end))}. Dê uma nota de 1 a 10 para o quanto você se concentrou. A nota é opcional.</p>
        <fieldset style="border:0;padding:0;margin:0"><legend class="sr">Nota de 1 a 10</legend>
          <div class="rating">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => html`<label><input type="radio" name="r" value="${n}"><span>${n}</span></label>`)}</div>
        </fieldset>
        <div class="rating-ends"><span>Disperso</span><span>Totalmente focado</span></div>`,
      onSubmit: (fd) => {
        const r = Number(fd.get('r'));
        if (!r) return 'Escolha uma nota ou toque em Pular.';
        s.rating = r; A.save(); A.toast(`Nota ${r} registrada`); paint();
      },
    });
  }
  const toLocal = (isoStr) => { const x = new Date(isoStr); return `${A.isoDate(x)}T${A.pad(x.getHours())}:${A.pad(x.getMinutes())}`; };
  const mmss = (s) => `${A.pad(Math.floor(s / 60))}:${A.pad(s % 60)}`;

  // atualiza só o que muda a cada segundo, sem redesenhar a tela
  function paint() {
    const root = document.querySelector('[data-pomo]');
    if (!root) return;
    if (root.dataset.mode !== T.mode || root.dataset.running !== String(T.running)) return A.render();
    root.querySelector('.timer').textContent = mmss(T.remaining);
    root.querySelector('.timer-track > i').style.width = `${(100 * (T.total - T.remaining)) / T.total}%`;
    document.title = `${mmss(T.remaining)} · ${MODES[T.mode]} — Paleta CRM`;
  }

  // ---------- dados de sessões ----------
  const sessionsOf = (uid) => A.S.sessions.filter((s) => s.uid === uid);
  const localDate = (isoStr) => A.isoDate(new Date(isoStr));
  const avg = (rows) => { const r = rows.filter((s) => s.rating != null); return r.length ? r.reduce((a, s) => a + s.rating, 0) / r.length : null; };
  const hm = (min) => (min >= 60 ? `${Math.floor(min / 60)} h ${A.pad(min % 60)} min` : `${min} min`);

  A.views.pomodoro = {
    title: 'Pomodoro',
    render() {
      if (T.remaining == null) reset('focus');
      const c = cfg();
      const today = A.isoDate(new Date());
      const mine = sessionsOf(A.S.userId).filter((s) => localDate(s.start) === today).sort((a, b) => b.start.localeCompare(a.start));
      const done = mine.filter((s) => s.status === 'concluida');
      const mins = mine.reduce((a, s) => a + s.minutes, 0);
      const m = avg(mine);
      const inCycle = T.done % c.every;
      const cycleNow = T.mode === 'focus' ? inCycle : -1;
      const idle = !T.running;
      return html`
        <div class="title-row"><div><h1>Pomodoro</h1>
          <p class="sub">${T.mode === 'focus' ? `Foco ${inCycle + 1} de ${c.every} do ciclo. A pausa longa vem depois do ${c.every}º foco.` : `${MODES[T.mode]}: levante, beba água, olhe para longe da tela.`}</p></div>
          <div class="actions"><a class="btn" href="#/pomodoro/relatorio">${icon('report')}Relatório de foco</a></div></div>
        <div class="pomo">
          <div class="stack">
            <section class="timer-panel" data-pomo data-mode="${T.mode}" data-running="${String(T.running)}" aria-label="Timer">
              <div class="mode-row">
                <div class="segmented" role="group" aria-label="Tipo de sessão">
                  ${Object.entries(MODES).map(([k, l]) => html`<button type="button" data-mode-pick="${k}" aria-pressed="${String(T.mode === k)}" ${!idle || T.startedAt ? raw('disabled') : ''}>${l}</button>`)}
                </div>
                <div class="cycle" aria-label="${inCycle} de ${c.every} focos concluídos no ciclo">${Array.from({ length: c.every }, (_, i) => html`<i class="${i < inCycle ? 'done' : i === cycleNow ? 'now' : ''}"></i>`)}</div>
              </div>
              <div class="timer" role="timer" aria-live="off">${mmss(T.remaining)}</div>
              <div class="timer-track"><i style="width:${(100 * (T.total - T.remaining)) / T.total}%"></i></div>
              <div class="timer-actions">
                ${T.running ? html`<button class="btn primary" data-pause>Pausar</button>` : html`<button class="btn primary" data-start>${T.startedAt || T.remaining < T.total ? 'Continuar' : T.mode === 'focus' ? 'Iniciar foco' : 'Iniciar pausa'}</button>`}
                ${T.mode === 'focus' ? html`<button class="btn" data-interrupt ${T.startedAt ? '' : raw('disabled')}>Interromper</button>` : html`<button class="btn" data-skip>Pular pausa</button>`}
              </div>
            </section>
            <section class="panel" aria-labelledby="dur-h">
              <header><h2 id="dur-h">Durações</h2><span class="meta">em minutos</span></header>
              <form class="settings-grid" data-settings>
                <div class="field"><label for="f-focus">Foco</label><input class="input" id="f-focus" name="focus" type="number" min="1" max="120" value="${c.focus}"></div>
                <div class="field"><label for="f-short">Pausa curta</label><input class="input" id="f-short" name="short" type="number" min="1" max="60" value="${c.short}"></div>
                <div class="field"><label for="f-long">Pausa longa</label><input class="input" id="f-long" name="long" type="number" min="1" max="90" value="${c.long}"></div>
                <div class="field"><label for="f-every">Pausa longa após</label><input class="input" id="f-every" name="every" type="number" min="2" max="8" value="${c.every}"></div>
              </form>
              <label class="check" style="margin-top:14px"><input type="checkbox" data-fast ${c.fast ? raw('checked') : ''}>Modo demonstração: cada minuto passa em 1 segundo</label>
            </section>
          </div>
          <section class="panel" aria-labelledby="today-h">
            <header><h2 id="today-h">Hoje</h2><a class="card-link" href="#/pomodoro/relatorio">Ver relatório</a></header>
            <div class="kpis" style="background:transparent;margin:0 calc(var(--card-pad) * -1) 8px">
              <div class="kpi"><div class="kpi-label">Focos concluídos</div><div class="kpi-value">${done.length}</div></div>
              <div class="kpi"><div class="kpi-label">Tempo em foco</div><div class="kpi-value">${hm(mins)}</div></div>
              <div class="kpi"><div class="kpi-label">Nota média</div><div class="kpi-value">${m == null ? raw('<span class="faint">—</span>') : A.dec1(m)}${m == null ? '' : html`<small>/10</small>`}</div></div>
            </div>
            ${mine.length ? html`<ul>${mine.map((s) => html`<li class="session-row">
                <span class="num">${A.time(toLocal(s.start))}</span>
                <span>${s.minutes} min ${s.status === 'interrompida' ? html`<span class="pill warn" style="margin-left:6px">Interrompida</span>` : ''}</span>
                <span class="score">${s.rating == null ? raw('<span class="faint">—</span>') : html`${s.rating}<small>/10</small>`}</span></li>`)}</ul>`
              : html`<div class="empty">Nenhuma sessão hoje. O primeiro foco aparece aqui assim que terminar.</div>`}
          </section>
        </div>`;
    },
    mount(root) {
      const q = (s) => root.querySelector(s);
      q('[data-start]')?.addEventListener('click', start);
      q('[data-pause]')?.addEventListener('click', pause);
      q('[data-interrupt]')?.addEventListener('click', interrupt);
      q('[data-skip]')?.addEventListener('click', () => { reset('focus'); A.render(); });
      root.querySelectorAll('[data-mode-pick]').forEach((b) => b.addEventListener('click', () => { reset(b.dataset.modePick); A.render(); }));
      q('[data-settings]').addEventListener('change', (e) => {
        const v = Math.round(Number(e.target.value));
        if (!v || v < Number(e.target.min) || v > Number(e.target.max)) { e.target.value = cfg()[e.target.name]; return; }
        cfg()[e.target.name] = v; A.save();
        if (!T.running && !T.startedAt) reset(T.mode);
        A.toast('Duração salva', [`${e.target.labels[0].textContent}: ${v} min`]);
        A.render();
      });
      q('[data-fast]').addEventListener('change', (e) => { cfg().fast = e.target.checked; A.save(); });
      if (T.running) document.title = `${mmss(T.remaining)} · ${MODES[T.mode]} — Paleta CRM`;
    },
  };

  // ---------- relatório ----------
  const R = { period: 'semana', anchor: null, from: null, to: null, who: null };
  function range() {
    const a = A.parse(R.anchor || A.isoDate(new Date()));
    if (R.period === 'dia') return [A.isoDate(a), A.isoDate(a)];
    if (R.period === 'semana') { const s = new Date(a); s.setDate(a.getDate() - ((a.getDay() + 6) % 7)); const e = new Date(s); e.setDate(s.getDate() + 6); return [A.isoDate(s), A.isoDate(e)]; }
    if (R.period === 'mes') return [A.isoDate(new Date(a.getFullYear(), a.getMonth(), 1)), A.isoDate(new Date(a.getFullYear(), a.getMonth() + 1, 0))];
    return [R.from, R.to];
  }
  function rangeLabel([f, t]) {
    const a = A.parse(f), b = A.parse(t);
    if (R.period === 'dia') return A.dateLong(f);
    if (R.period === 'mes') return `${A.MESES[a.getMonth()]} de ${a.getFullYear()}`;
    return `${a.getDate()} ${A.MES[a.getMonth()]} – ${b.getDate()} ${A.MES[b.getMonth()]}`;
  }
  function shift(dir) {
    const a = A.parse(R.anchor || A.isoDate(new Date()));
    if (R.period === 'dia') a.setDate(a.getDate() + dir);
    if (R.period === 'semana') a.setDate(a.getDate() + 7 * dir);
    if (R.period === 'mes') a.setMonth(a.getMonth() + dir, 1);
    R.anchor = A.isoDate(a);
  }

  A.views.relatorio = {
    title: 'Relatório de foco',
    render() {
      const others = A.can('pomodoro.others');
      if (!R.who || !others) R.who = A.S.userId;
      if (R.period === 'periodo' && !R.from) { const t = new Date(); const f = new Date(t); f.setDate(t.getDate() - 13); R.from = A.isoDate(f); R.to = A.isoDate(t); }
      const [f, t] = range();
      const rows = sessionsOf(R.who).filter((s) => { const d = localDate(s.start); return d >= f && d <= t; }).sort((a, b) => b.start.localeCompare(a.start));
      const done = rows.filter((s) => s.status === 'concluida').length;
      const mins = rows.reduce((a, s) => a + s.minutes, 0);
      const m = avg(rows);
      // nota média por hora de início (sessões sem nota ficam de fora)
      const byHour = Array.from({ length: 24 }, (_, h) => avg(rows.filter((s) => new Date(s.start).getHours() === h)));
      const rated = byHour.map((v, h) => ({ v, h })).filter((x) => x.v != null);
      const best = rated.length ? rated.reduce((a, b) => (b.v > a.v ? b : a)) : null;
      const worst = rated.length > 1 ? rated.reduce((a, b) => (b.v < a.v ? b : a)) : null;
      const who = A.user(R.who);
      const self = R.who === A.S.userId;
      const finding = best ? `${self ? 'Sua' : `A de ${who.name.split(' ')[0]}:`} melhor hora é ${best.h}h, com nota média ${A.dec1(best.v)}${worst && worst.h !== best.h ? `; a pior é ${worst.h}h (${A.dec1(worst.v)})` : ''}.` : 'Nenhuma sessão com nota neste período.';
      return html`
        <div class="title-row"><div><div class="crumb"><a href="#/pomodoro">Pomodoro</a><span>/</span></div><h1>Relatório de foco</h1><p class="sub">${finding}</p></div>
          <div class="actions"><a class="btn primary" href="#/pomodoro">${icon('timer')}Iniciar foco</a></div></div>
        <div class="filters">
          <div class="segmented" role="group" aria-label="Período">${[['dia', 'Dia'], ['semana', 'Semana'], ['mes', 'Mês'], ['periodo', 'Período']].map(([k, l]) => html`<button data-period="${k}" aria-pressed="${String(R.period === k)}">${l}</button>`)}</div>
          ${R.period === 'periodo'
            ? html`<label class="sr" for="r-from">De</label><input class="input sm" style="width:auto" type="date" id="r-from" value="${R.from}"><span class="muted">até</span><label class="sr" for="r-to">Até</label><input class="input sm" style="width:auto" type="date" id="r-to" value="${R.to}">`
            : html`<button class="btn icon" data-shift="-1" aria-label="Período anterior">${icon('back')}</button><strong class="nowrap" style="min-width:150px;text-align:center">${rangeLabel([f, t])}</strong><button class="btn icon" data-shift="1" aria-label="Próximo período" style="transform:scaleX(-1)">${icon('back')}</button>`}
          <span class="spacer"></span>
          ${others ? html`<label class="sr" for="r-who">Pessoa</label><select class="input sm" id="r-who" style="width:auto">${A.S.users.map((u) => html`<option value="${u.id}" ${u.id === R.who ? raw('selected') : ''}>${u.id === A.S.userId ? `${u.name} (você)` : u.name}</option>`)}</select>` : ''}
        </div>
        <div class="kpis lead-first" style="margin-bottom:var(--gap)">
          <div class="kpi"><div class="kpi-label">Nota média</div><div class="kpi-value lead">${m == null ? raw('<span class="faint">—</span>') : A.dec1(m)}${m == null ? '' : html`<small>/10</small>`}</div><div class="kpi-sub">${rows.filter((s) => s.rating != null).length} de ${rows.length} sessões com nota</div></div>
          <div class="kpi"><div class="kpi-label">Sessões</div><div class="kpi-value">${rows.length}</div><div class="kpi-sub">${done} concluídas · ${rows.length - done} interrompidas</div></div>
          <div class="kpi"><div class="kpi-label">Tempo em foco</div><div class="kpi-value">${hm(mins)}</div><div class="kpi-sub">inclui o tempo real das interrompidas</div></div>
          <div class="kpi"><div class="kpi-label">Melhor hora</div><div class="kpi-value">${best ? `${best.h}h` : raw('<span class="faint">—</span>')}</div><div class="kpi-sub">${best ? `nota média ${A.dec1(best.v)}` : 'sem notas no período'}</div></div>
        </div>
        <section class="panel" style="margin-bottom:var(--gap)" aria-labelledby="h24">
          <header><h2 id="h24">Nota média por hora do dia</h2><span class="meta">A sessão conta para a hora em que começou · horas sem nota ficam vazias</span></header>
          <div class="chart" id="chart24"></div>
        </section>
        <section class="panel" aria-labelledby="hlist">
          <header><h2 id="hlist">Sessões</h2><span class="meta">${A.plural(rows.length, 'sessão', 'sessões')}</span></header>
          ${rows.length ? html`<div class="table-wrap"><table class="resp">
            <thead><tr><th>Data</th><th>Horário</th><th class="n">Duração</th><th class="n">Nota</th><th>Situação</th></tr></thead>
            <tbody>${rows.slice(0, 60).map((s) => { const a = toLocal(s.start), b = toLocal(s.end); return html`<tr>
              <td>${A.dateLong(a)}</td><td class="num n-m">${A.time(a)}–${A.time(b)}</td><td class="n">${s.minutes} min</td>
              <td class="n score">${s.rating == null ? raw('<span class="faint">—</span>') : html`${s.rating}<small>/10</small>`}</td>
              <td class="m-2">${s.status === 'concluida' ? html`<span class="pill pos">Concluída</span>` : html`<span class="pill warn">Interrompida</span>`}</td></tr>`; })}</tbody></table></div>
            ${rows.length > 60 ? html`<p class="small muted" style="margin-top:12px">Mostrando as 60 mais recentes de ${rows.length}.</p>` : ''}`
            : html`<div class="empty">Nenhuma sessão neste período.</div>`}
        </section>`;
    },
    mount(root) {
      const [f, t] = range();
      const rows = sessionsOf(R.who).filter((s) => { const d = localDate(s.start); return d >= f && d <= t; });
      const byHour = Array.from({ length: 24 }, (_, h) => avg(rows.filter((s) => new Date(s.start).getHours() === h)));
      const vals = byHour.map((v) => (v == null ? 0 : Math.round(v * 10) / 10));
      const best = vals.indexOf(Math.max(...vals));
      window.Charts.bars(root.querySelector('#chart24'), { labels: vals.map((_, h) => `${h}h`), values: vals, highlight: vals[best] > 0 ? best : null, format: (v) => A.dec1(v), tickFormat: (v) => String(v).replace('.', ','), height: 220, xAt: [0, 3, 6, 9, 12, 15, 18, 21] });
      root.querySelectorAll('[data-period]').forEach((b) => b.addEventListener('click', () => { R.period = b.dataset.period; A.render(); }));
      root.querySelectorAll('[data-shift]').forEach((b) => b.addEventListener('click', () => { shift(Number(b.dataset.shift)); A.render(); }));
      root.querySelector('#r-who')?.addEventListener('change', (e) => { R.who = e.target.value; A.render(); });
      const fr = root.querySelector('#r-from'), to = root.querySelector('#r-to');
      if (fr) [fr, to].forEach((i) => i.addEventListener('change', () => { if (fr.value && to.value && fr.value <= to.value) { R.from = fr.value; R.to = to.value; A.render(); } }));
    },
  };
})();
