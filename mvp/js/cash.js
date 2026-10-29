// Regras do fluxo de caixa: funções puras, valores em centavos (inteiros), datas 'AAAA-MM-DD' e meses 'AAAA-MM'.
// A tela usa window.Cash; os testes (mvp/tests/cash.test.js) usam require.
(function (root) {
  const pad = (n) => String(n).padStart(2, '0');
  const cents = (v) => Math.round(Number(v || 0) * 100);
  const signedCents = (e) => (e.kind === 'in' ? 1 : -1) * cents(e.value);
  const isReal = (e) => e.status === 'realizado';
  const ymd = (s) => { const [y, m, d] = s.split('-').map(Number); return [y, m - 1, d]; };

  const addMonths = (m, n) => { const [y, mo] = m.split('-').map(Number); const t = y * 12 + (mo - 1) + n; return `${Math.floor(t / 12)}-${pad((t % 12) + 1)}`; };
  const monthStart = (m) => `${m}-01`;
  const monthEnd = (m) => { const [y, mo] = m.split('-').map(Number); return `${m}-${pad(new Date(y, mo, 0).getDate())}`; };
  /** 12 meses: 6 antes do mês aberto, ele e 5 depois. */
  const janela = (mes, antes = 6, depois = 5) => Array.from({ length: antes + depois + 1 }, (_, i) => addMonths(mes, i - antes));

  /** Totais do mês separados por tipo e situação, e os dois saldos do mês. */
  function resumoMes(entries, mes) {
    const r = { entradasRealizadas: 0, entradasPrevistas: 0, saidasRealizadas: 0, saidasPrevistas: 0 };
    for (const e of entries) {
      if (e.date.slice(0, 7) !== mes) continue;
      r[(e.kind === 'in' ? 'entradas' : 'saidas') + (isReal(e) ? 'Realizadas' : 'Previstas')] += cents(e.value);
    }
    r.saldoAtual = r.entradasRealizadas - r.saidasRealizadas;
    r.saldoPrevisto = r.saldoAtual + r.entradasPrevistas - r.saidasPrevistas;
    return r;
  }

  /** Dinheiro em caixa antes da data: só realizados, com data estritamente anterior. */
  function caixaAntes(entries, date) {
    let s = 0;
    for (const e of entries) if (isReal(e) && e.date < date) s += signedCents(e);
    return s;
  }

  /** Linha Caixa: início do mês, caixa hoje e previsto no fim (só pendentes do mês). */
  function linhaCaixa(entries, mes) {
    const resumo = resumoMes(entries, mes);
    const inicio = caixaAntes(entries, monthStart(mes));
    const hoje = inicio + resumo.saldoAtual;
    const fim = hoje + resumo.entradasPrevistas - resumo.saidasPrevistas;
    const atrasadosAnteriores = entries.filter((e) => !isReal(e) && e.date < monthStart(mes)).length;
    return { inicio, hoje, fim, resumo, atrasadosAnteriores };
  }

  /** Pendentes com data anterior a hoje, de qualquer mês, do mais antigo ao mais novo. */
  const atrasados = (entries, today) => entries.filter((e) => !isReal(e) && e.date < today).sort((a, b) => a.date.localeCompare(b.date));
  const diasAtraso = (date, today) => Math.round((Date.UTC(...ymd(today)) - Date.UTC(...ymd(date))) / 86400000);

  /** Série do gráfico: totais do mês e caixa no fim; do mês atual em diante soma os pendentes desde o início do mês atual. */
  function caixaMensal(entries, meses, mesAtual) {
    const ini = monthStart(mesAtual);
    return meses.map((mes) => {
      const projetado = mes >= mesAtual;
      let caixaNoFim = caixaAntes(entries, monthStart(addMonths(mes, 1)));
      if (projetado) {
        const fim = monthEnd(mes);
        for (const e of entries) if (!isReal(e) && e.date >= ini && e.date <= fim) caixaNoFim += signedCents(e);
      }
      return { mes, ...resumoMes(entries, mes), caixaNoFim, projetado };
    });
  }

  const api = { cents, signedCents, addMonths, monthStart, monthEnd, janela, resumoMes, caixaAntes, linhaCaixa, atrasados, diasAtraso, caixaMensal };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Cash = api;
})(this);
