import { useMemo } from 'react';
import { toDate } from '../../utils/dateUtils';
import { format, getMonth, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const GRUPOS_DESPESA = {
  'Salários':           'Pessoal',
  'Benefícios':         'Pessoal',
  'Encargos':           'Pessoal',
  'Energia':            'Utilidades',
  'Água':               'Utilidades',
  'Internet':           'Utilidades',
  'Telefone':           'Utilidades',
  'Alimentação':        'Operacional',
  'Limpeza':            'Operacional',
  'Lavanderia':         'Operacional',
  'Manutenção':         'Operacional',
  'Produtos de Higiene':'Operacional',
  'Marketing':          'Comercial',
  'Publicidade':        'Comercial',
  'Aluguel':            'Infraestrutura',
  'Impostos':           'Fiscal',
  'Taxas':              'Fiscal',
};

export function getGrupo(categoria) {
  if (!categoria) return 'Outros';
  for (const [key, grupo] of Object.entries(GRUPOS_DESPESA)) {
    if (categoria.toLowerCase().includes(key.toLowerCase())) return grupo;
  }
  return 'Outros';
}

const ORDEM_GRUPOS = ['Pessoal', 'Operacional', 'Utilidades', 'Comercial', 'Infraestrutura', 'Fiscal', 'Outros'];

export function useDREData(reservas, despesas, fluxoCaixa, anoSel, mesSel) {
  return useMemo(() => {
    const filtrar = (d) => {
      if (!d) return false;
      if (getYear(d) !== anoSel) return false;
      if (mesSel !== null && getMonth(d) !== mesSel) return false;
      return true;
    };

    // Receitas do fluxo de caixa (tipo entrada)
    const entradasFluxo = fluxoCaixa.filter(f => {
      const d = toDate(f.data);
      return f.tipo === 'entrada' && filtrar(d);
    });
    const receitaFluxo = entradasFluxo.reduce((s, f) => s + (f.valor || 0), 0);

    // Receitas de reservas pagas
    const reservasPagas = reservas.filter(r => {
      const d = toDate(r.dataCheckOut || r.dataCheckIn || r.criadoEm);
      return filtrar(d) && r.formaPagamento && r.formaPagamento !== 'a_definir' && (r.valorTotal || r.valor || 0) > 0;
    });
    const receitaReservas = reservasPagas.reduce((s, r) => s + (r.valorFinal || r.valorTotal || r.valor || 0), 0);

    const receita = receitaFluxo > 0 ? receitaFluxo : receitaReservas;

    // Despesas
    const despesasFiltradas = despesas.filter(d => {
      const dt = toDate(d.data || d.criadoEm);
      return filtrar(dt) && d.status !== 'cancelado';
    });
    const despesaTotal = despesasFiltradas.reduce((s, d) => s + (d.valor || 0), 0);

    // Agrupar despesas
    const mapa = {};
    despesasFiltradas.forEach(d => {
      const grupo = getGrupo(d.categoria);
      if (!mapa[grupo]) mapa[grupo] = [];
      mapa[grupo].push({ descricao: d.descricao, categoria: d.categoria, valor: d.valor || 0 });
    });
    const grupos = ORDEM_GRUPOS
      .filter(g => mapa[g])
      .map(g => ({ grupo: g, itens: mapa[g] }));

    const lucro = receita - despesaTotal;
    const margem = receita > 0 ? (lucro / receita) * 100 : 0;

    // Dados mensais para grafico
    const dadosMensais = Array.from({ length: 12 }, (_, m) => {
      const nomeMes = format(new Date(anoSel, m, 1), 'MMM', { locale: ptBR });
      const recM = fluxoCaixa.filter(f => {
        const d = toDate(f.data);
        return d && f.tipo === 'entrada' && getYear(d) === anoSel && getMonth(d) === m;
      }).reduce((s, f) => s + (f.valor || 0), 0);
      const despM = despesas.filter(d => {
        const dt = toDate(d.data || d.criadoEm);
        return dt && getYear(dt) === anoSel && getMonth(dt) === m && d.status !== 'cancelado';
      }).reduce((s, d) => s + (d.valor || 0), 0);
      return { mes: nomeMes, receita: recM, despesa: despM, lucro: recM - despM };
    });

    // Tendencia vs mes anterior
    const mesAnterior = mesSel !== null ? mesSel - 1 : null;
    const calcTendencia = (tipo) => {
      if (mesSel === null || mesSel === 0) return undefined;
      const atual = tipo === 'receita'
        ? fluxoCaixa.filter(f => { const d = toDate(f.data); return d && f.tipo === 'entrada' && getYear(d) === anoSel && getMonth(d) === mesSel; }).reduce((s, f) => s + (f.valor || 0), 0)
        : despesas.filter(d => { const dt = toDate(d.data || d.criadoEm); return dt && getYear(dt) === anoSel && getMonth(dt) === mesSel; }).reduce((s, d) => s + (d.valor || 0), 0);
      const anterior = tipo === 'receita'
        ? fluxoCaixa.filter(f => { const d = toDate(f.data); return d && f.tipo === 'entrada' && getYear(d) === anoSel && getMonth(d) === mesAnterior; }).reduce((s, f) => s + (f.valor || 0), 0)
        : despesas.filter(d => { const dt = toDate(d.data || d.criadoEm); return dt && getYear(dt) === anoSel && getMonth(dt) === mesAnterior; }).reduce((s, d) => s + (d.valor || 0), 0);
      if (anterior === 0) return undefined;
      return ((atual - anterior) / anterior) * 100;
    };

    return {
      receita, despesaTotal, lucro, margem, grupos, dadosMensais,
      tendenciaReceita: calcTendencia('receita'),
      tendenciaDespesa: calcTendencia('despesa'),
    };
  }, [reservas, despesas, fluxoCaixa, anoSel, mesSel]);
}
