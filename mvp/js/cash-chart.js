// Gráfico "Caixa e movimento por mês": barras de entradas (acima) e saídas (abaixo), realizado sólido e previsto
// hachurado, e a linha do caixa no fim de cada mês. As cores vêm de classes CSS (tokens), então seguem o tema atual.
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const M = { top: 12, right: 12, bottom: 44, left: 72 };
  const NARROW_COL = 34;
  let showOpenAfterRender = false;

  function niceStep(span) {
    const raw = span / 5 || 1, mag = 10 ** Math.floor(Math.log10(raw));
    return [1, 2, 2.5, 5, 10].map((k) => k * mag).find((s) => s >= raw);
  }

  function scale(series) {
    let hi = 0, lo = 0;
    for (const s of series) {
      hi = Math.max(hi, s.entradasRealizadas + s.entradasPrevistas, s.caixaNoFim);
      lo = Math.min(lo, -(s.saidasRealizadas + s.saidasPrevistas), s.caixaNoFim);
    }
    const step = niceStep(hi - lo);
    return { step, hi: Math.ceil(hi / step) * step || step, lo: Math.floor(lo / step) * step };
  }

  function draw(el, o) {
    const { series, mesAtual, mesAberto } = o;
    const width = el.clientWidth;
    if (!width) return;
    const height = width < 560 ? 240 : 300;
    const pw = width - M.left - M.right, ph = height - M.top - M.bottom;
    const cw = pw / series.length, bw = Math.min(cw * 0.5, 28);
    const { step, hi, lo } = scale(series);
    const y = (v) => M.top + ((hi - v) / (hi - lo)) * ph;
    const cx = (i) => M.left + cw * i + cw / 2;
    const iOpen = series.findIndex((s) => s.mes === mesAberto);
    const narrow = cw < NARROW_COL;
    const rect = (x, y0, y1, cls) => (Math.abs(y1 - y0) > 0.5 ? `<rect class="${cls}" x="${x}" y="${Math.min(y0, y1)}" width="${bw}" height="${Math.abs(y1 - y0)}"/>` : '');

    let svg = `<defs>
      <pattern id="cc-hatch-in" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="cc-in-tint" width="5" height="5"/><rect class="cc-in" width="2" height="5"/></pattern>
      <pattern id="cc-hatch-out" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect class="cc-out-tint" width="5" height="5"/><rect class="cc-out" width="2" height="5"/></pattern></defs>`;
    series.forEach((s, i) => {
      if (s.mes === mesAtual) svg += `<rect class="cc-band" x="${M.left + cw * i}" y="${M.top}" width="${cw}" height="${ph}"/>`;
      svg += `<rect class="cc-hover" data-i="${i}" x="${M.left + cw * i}" y="${M.top}" width="${cw}" height="${ph}"/>`;
    });
    for (let v = lo; v <= hi + step / 2; v += step) {
      const zero = Math.abs(v) < step / 2;
      svg += `<line class="${zero ? 'cc-zero' : 'cc-grid'}" x1="${M.left}" x2="${width - M.right}" y1="${y(v)}" y2="${y(v)}"/>`;
      svg += `<text class="cc-tick" x="${M.left - 8}" y="${y(v)}" dy="0.32em" text-anchor="end">${o.short(zero ? 0 : v)}</text>`;
    }
    series.forEach((s, i) => {
      const x = cx(i) - bw / 2, er = s.entradasRealizadas, ep = s.entradasPrevistas, sr = s.saidasRealizadas, sp = s.saidasPrevistas;
      svg += rect(x, y(0), y(er), 'cc-in') + rect(x, y(er), y(er + ep), 'cc-in-prev');
      svg += rect(x, y(0), y(-sr), 'cc-out') + rect(x, y(-sr), y(-sr - sp), 'cc-out-prev');
    });
    for (let i = 1; i < series.length; i++) {
      svg += `<line class="cc-line${series[i].projetado ? ' proj' : ''}" x1="${cx(i - 1)}" y1="${y(series[i - 1].caixaNoFim)}" x2="${cx(i)}" y2="${y(series[i].caixaNoFim)}"/>`;
    }
    series.forEach((s, i) => { svg += `<rect class="cc-pt${s.projetado ? ' proj' : ''}" x="${cx(i) - 4}" y="${y(s.caixaNoFim) - 4}" width="8" height="8"/>`; });
    series.forEach((s, i) => {
      const [yy, mm] = s.mes.split('-').map(Number);
      const always = s.mes === mesAtual || i === iOpen;
      if (narrow && i % 2 && !always) return;
      const cls = `cc-month${s.mes === mesAtual ? ' now' : ''}${i === iOpen ? ' open' : ''}`;
      svg += `<text class="${cls}" x="${cx(i)}" y="${M.top + ph + 18}" text-anchor="middle">${o.months[mm - 1]}</text>`;
      if (i === iOpen) svg += `<rect class="cc-open-mark" x="${cx(i) - 12}" y="${M.top + ph + 24}" width="24" height="2"/>`;
      if (i === 0 || mm === 1) svg += `<text class="cc-year" x="${cx(i)}" y="${M.top + ph + 38}" text-anchor="middle">${yy}</text>`;
    });
    series.forEach((s, i) => { svg += `<rect class="cc-hit" data-i="${i}" x="${M.left + cw * i}" y="0" width="${cw}" height="${height}"/>`; });

    const svgEl = el.querySelector('svg') || el.appendChild(document.createElementNS(NS, 'svg'));
    svgEl.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svgEl.setAttribute('width', width);
    svgEl.setAttribute('height', height);
    svgEl.setAttribute('aria-hidden', 'true');
    svgEl.innerHTML = svg;
    return { cx, cw, width };
  }

  function cardHtml(s, o) {
    const [yy, mm] = s.mes.split('-').map(Number);
    const name = o.monthsLong[mm - 1];
    const state = s.mes < o.mesAtual ? 'fechado' : s.mes === o.mesAtual ? 'mês atual' : 'previsto';
    const ins = s.entradasRealizadas + s.entradasPrevistas, outs = s.saidasRealizadas + s.saidasPrevistas, res = ins - outs;
    return `<div class="cc-card-head"><strong>${name[0].toUpperCase()}${name.slice(1)} de ${yy}</strong><span>${state}</span></div>
      <dl>
        <dt>Entradas</dt><dd class="amount-in">${o.signed(ins)}</dd>
        <dd class="cc-detail">${o.money(s.entradasRealizadas)} realizado · ${o.money(s.entradasPrevistas)} previsto</dd>
        <dt>Saídas</dt><dd class="neg-text">${o.signed(-outs)}</dd>
        <dd class="cc-detail">${o.money(s.saidasRealizadas)} realizado · ${o.money(s.saidasPrevistas)} previsto</dd>
        <dt>Resultado do mês</dt><dd class="${res < 0 ? 'neg-text' : res > 0 ? 'amount-in' : ''}">${o.signed(res)}</dd>
        <dt class="cc-total">${s.projetado ? 'Caixa no fim (projetado)' : 'Caixa no fim do mês'}</dt><dd class="cc-total">${o.signed(s.caixaNoFim)}</dd>
      </dl>
      ${s.mes !== o.mesAberto ? '<p class="cc-foot">Clique para abrir o mês</p>' : ''}`;
  }

  function tableHtml(o) {
    const rows = o.series.map((s) => {
      const [yy, mm] = s.mes.split('-').map(Number);
      return `<tr><th scope="row">${o.monthsLong[mm - 1]} de ${yy}</th><td>${o.money(s.entradasRealizadas)}</td><td>${o.money(s.entradasPrevistas)}</td><td>${o.money(s.saidasRealizadas)}</td><td>${o.money(s.saidasPrevistas)}</td><td>${o.signed(s.caixaNoFim)}</td><td>${s.projetado ? 'sim' : 'não'}</td></tr>`;
    }).join('');
    return `<table><caption>Caixa e movimento por mês</caption><thead><tr><th>Mês</th><th>Entradas realizadas</th><th>Entradas previstas</th><th>Saídas realizadas</th><th>Saídas previstas</th><th>Caixa no fim</th><th>Projetado</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  /**
   * @param {HTMLElement} el
   * @param {{ series: object[], mesAtual: string, mesAberto: string, months: string[], monthsLong: string[],
   *   money: (c:number)=>string, signed: (c:number)=>string, short: (c:number)=>string, onOpen: (mes:string)=>void }} o
   */
  function render(el, o) {
    el.classList.add('cc');
    // a tabela oculta fica dentro de um contêiner .sr: a tabela sozinha não respeita 1px e gera rolagem no celular
    el.innerHTML = `<div class="cc-plot" tabindex="0" role="group" aria-label="Caixa e movimento por mês. Use as setas para percorrer os meses, Enter para abrir o mês e Esc para fechar o detalhe."></div>
      <div class="cc-card" role="status" aria-live="polite" hidden></div><div class="sr">${tableHtml(o)}</div>`;
    const plot = el.querySelector('.cc-plot'), card = el.querySelector('.cc-card');
    let geo = draw(plot, o), active = -1;

    function show(i) {
      active = i;
      plot.querySelectorAll('.cc-hover').forEach((r) => r.classList.toggle('on', Number(r.dataset.i) === i));
      if (i < 0 || !geo) { card.hidden = true; return; }
      card.innerHTML = cardHtml(o.series[i], o);
      card.hidden = false;
      card.style.maxWidth = `${geo.width}px`;
      const w = Math.min(card.offsetWidth, geo.width);
      let left = geo.cx(i) + geo.cw / 2 + 8;
      if (left + w > geo.width) left = geo.cx(i) - geo.cw / 2 - 8 - w;
      card.style.left = `${Math.max(0, Math.min(left, geo.width - w))}px`;
    }
    const open = (i) => { if (o.series[i].mes !== o.mesAberto) o.onOpen(o.series[i].mes); };
    const indexOf = (ev) => { const t = ev.target.closest('.cc-hit'); return t ? Number(t.dataset.i) : -1; };

    plot.addEventListener('pointermove', (ev) => { const i = indexOf(ev); if (i >= 0 && i !== active) show(i); });
    // levantar o dedo dispara pointerleave: só esconde o card quando o ponteiro é mouse
    plot.addEventListener('pointerleave', (ev) => { if (ev.pointerType === 'mouse') show(-1); });
    plot.addEventListener('click', (ev) => {
      const i = indexOf(ev);
      if (i < 0) return;
      show(i);
      if (ev.pointerType && ev.pointerType !== 'mouse') showOpenAfterRender = true;
      open(i);
    });
    plot.addEventListener('focus', () => show(o.series.findIndex((s) => s.mes === o.mesAberto)));
    plot.addEventListener('blur', () => show(-1));
    plot.addEventListener('keydown', (ev) => {
      const last = o.series.length - 1;
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') {
        ev.preventDefault();
        show(Math.max(0, Math.min(last, (active < 0 ? 0 : active) + (ev.key === 'ArrowRight' ? 1 : -1))));
      } else if ((ev.key === 'Enter' || ev.key === ' ') && active >= 0) { ev.preventDefault(); open(active); }
      else if (ev.key === 'Escape') show(-1);
    });

    let lastWidth = plot.clientWidth;
    const ro = new ResizeObserver(() => {
      if (!el.isConnected) { ro.disconnect(); return; }
      if (plot.clientWidth === lastWidth) return;
      lastWidth = plot.clientWidth;
      geo = draw(plot, o);
      if (active >= 0) show(active);
    });
    ro.observe(plot);

    if (showOpenAfterRender) { showOpenAfterRender = false; show(o.series.findIndex((s) => s.mes === o.mesAberto)); }
  }

  window.CashChart = { render };
})();
