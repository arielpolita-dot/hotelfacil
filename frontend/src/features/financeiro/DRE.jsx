import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { toDate } from '../../utils/dateUtils';
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts';
import { format, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { formatCurrency } from '../../utils/formatters';
import { Card as DRECard, LinhaGrupo, pct } from './DRECard';
import { useDREData } from './useDREData';
import {
  Card, CardHeader, CardBody, Spinner, EmptyState, FilterPills,
  Select, ProgressBar,
  DataTable, TableHeader, TableHead,
  PageHeader,
} from '../../components/ds';

export default function DRE() {
  const { reservas, despesas, fluxoCaixa, loading } = useHotel();
  const [anoSel, setAnoSel] = useState(new Date().getFullYear());
  const [mesSel, setMesSel] = useState(null);

  const anos = useMemo(() => {
    const set = new Set();
    [...reservas, ...despesas, ...fluxoCaixa].forEach(r => {
      const d = toDate(r.dataCheckOut || r.data || r.criadoEm);
      if (d) set.add(getYear(d));
    });
    set.add(new Date().getFullYear());
    return [...set].sort((a, b) => b - a);
  }, [reservas, despesas, fluxoCaixa]);

  const { receita, despesaTotal, lucro, margem, grupos, dadosMensais, tendenciaReceita, tendenciaDespesa } = useDREData(reservas, despesas, fluxoCaixa, anoSel, mesSel);

  const periodoLabel = mesSel !== null
    ? format(new Date(anoSel, mesSel, 1), 'MMMM yyyy', { locale: ptBR })
    : `Ano ${anoSel}`;

  const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="md" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <PageHeader
        title="DRE — Demonstrativo de Resultado"
        subtitle={periodoLabel}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Select
              value={anoSel}
              onChange={e => setAnoSel(Number(e.target.value))}
              className="w-auto"
            >
              {anos.map(a => <option key={a} value={a}>{a}</option>)}
            </Select>
            <FilterPills
              options={[
                { key: 'anual', label: 'Anual' },
                ...MESES.map((m, i) => ({ key: String(i), label: m })),
              ]}
              value={mesSel === null ? 'anual' : String(mesSel)}
              onChange={k => setMesSel(k === 'anual' ? null : Number(k))}
            />
          </div>
        }
      />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <DRECard title="Receita Bruta" value={formatCurrency(receita)} color="green" icon={TrendingUp} trend={tendenciaReceita} sub="Hospedagens + entradas" />
        <DRECard title="Despesas Totais" value={formatCurrency(despesaTotal)} color="red" icon={TrendingDown} trend={tendenciaDespesa} sub="Todas as categorias" />
        <DRECard title="Resultado Líquido" value={formatCurrency(lucro)} color={lucro >= 0 ? 'blue' : 'red'} icon={DollarSign} sub={lucro >= 0 ? 'Lucro operacional' : 'Prejuízo operacional'} />
        <DRECard title="Margem Líquida" value={`${margem.toFixed(1).replace('.', ',')}%`} color={margem >= 20 ? 'green' : margem >= 0 ? 'amber' : 'red'} icon={BarChart2} sub={margem >= 20 ? 'Margem saudável' : margem >= 0 ? 'Margem apertada' : 'Resultado negativo'} />
      </div>

      {/* Grafico de barras */}
      <Card padding="md">
        <h3 className="text-sm font-bold text-slate-700 mb-4">Evolução Mensal — {anoSel}</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={dadosMensais} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={12}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `R$${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
            <Tooltip
              formatter={(v, name) => [formatCurrency(v), name === 'receita' ? 'Receita' : name === 'despesa' ? 'Despesas' : 'Resultado']}
              contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
            />
            <Legend formatter={v => v === 'receita' ? 'Receita' : v === 'despesa' ? 'Despesas' : 'Resultado'} wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="despesa" fill="#f87171" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lucro" radius={[4, 4, 0, 0]}>
              {dadosMensais.map((entry, i) => (
                <Cell key={i} fill={entry.lucro >= 0 ? '#3b82f6' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Tabela DRE */}
      <DataTable>
        <CardHeader>
          <div>
            <h3 className="text-sm font-bold text-slate-700">Demonstrativo Detalhado</h3>
            <p className="text-xs text-slate-400 mt-0.5">Clique nos grupos para expandir os lançamentos</p>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full">
            <TableHeader>
              <TableHead>Descrição</TableHead>
              <TableHead align="right">Valor</TableHead>
              <TableHead align="right">% Receita</TableHead>
            </TableHeader>
            <tbody>
              <tr className="bg-emerald-50 border-b border-emerald-100">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                    <span className="text-sm font-bold text-emerald-800">1. Receita Operacional Bruta</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-sm font-bold text-emerald-700">{formatCurrency(receita)}</td>
                <td className="py-3 px-4 text-right text-xs text-emerald-600 font-semibold">100%</td>
              </tr>
              <tr className="border-b border-slate-50">
                <td className="py-2.5 px-4 pl-10 text-xs text-slate-500">Hospedagens e serviços</td>
                <td className="py-2.5 px-4 text-right text-xs text-slate-600">{formatCurrency(receita)}</td>
                <td className="py-2.5 px-4 text-right text-xs text-slate-400">100%</td>
              </tr>

              <tr className="bg-red-50 border-b border-red-100">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                    <span className="text-sm font-bold text-red-800">2. Despesas Operacionais</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-right text-sm font-bold text-red-700">({formatCurrency(despesaTotal)})</td>
                <td className="py-3 px-4 text-right text-xs text-red-600 font-semibold">{pct(despesaTotal, receita)}</td>
              </tr>

              {grupos.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-sm text-slate-400">Nenhuma despesa registrada no período</td>
                </tr>
              ) : (
                grupos.map(({ grupo, itens }) => (
                  <LinhaGrupo key={grupo} grupo={grupo} itens={itens} totalReceita={receita} />
                ))
              )}

              <tr className={`border-t-2 ${lucro >= 0 ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'}`}>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full inline-block ${lucro >= 0 ? 'bg-blue-600' : 'bg-red-600'}`}></span>
                    <span className={`text-sm font-bold ${lucro >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
                      3. {lucro >= 0 ? 'Lucro' : 'Prejuízo'} Líquido do Período
                    </span>
                  </div>
                </td>
                <td className={`py-4 px-4 text-right text-base font-bold ${lucro >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
                  {lucro >= 0 ? '' : '('}{formatCurrency(Math.abs(lucro))}{lucro < 0 ? ')' : ''}
                </td>
                <td className={`py-4 px-4 text-right text-sm font-bold ${lucro >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  {margem.toFixed(1).replace('.', ',')}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </DataTable>

      {/* Analise rapida */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="md">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Composição das Despesas</p>
          <div className="space-y-2">
            {grupos.slice(0, 5).map(({ grupo, itens }) => {
              const total = itens.reduce((s, i) => s + i.valor, 0);
              const p = despesaTotal > 0 ? (total / despesaTotal) * 100 : 0;
              return (
                <div key={grupo}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600 font-medium">{grupo}</span>
                    <span className="text-slate-500">{p.toFixed(0)}%</span>
                  </div>
                  <ProgressBar value={p} color="danger" size="sm" />
                </div>
              );
            })}
            {grupos.length === 0 && <p className="text-xs text-slate-400">Sem dados</p>}
          </div>
        </Card>

        <Card padding="md">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Indicadores</p>
          <div className="space-y-3">
            {[
              { label: 'Receita Bruta', value: formatCurrency(receita), color: 'text-emerald-600' },
              { label: 'Total de Despesas', value: formatCurrency(despesaTotal), color: 'text-red-500' },
              { label: 'Resultado Líquido', value: formatCurrency(lucro), color: lucro >= 0 ? 'text-blue-600' : 'text-red-600' },
              { label: 'Margem Líquida', value: `${margem.toFixed(1).replace('.', ',')}%`, color: margem >= 20 ? 'text-emerald-600' : margem >= 0 ? 'text-amber-600' : 'text-red-600' },
              { label: 'Índice de Despesas', value: pct(despesaTotal, receita), color: 'text-slate-600' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                <span className="text-xs text-slate-500">{label}</span>
                <span className={`text-sm font-bold ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="md">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Análise de Saúde Financeira</p>
          <div className="space-y-3">
            {[
              {
                label: 'Margem Operacional',
                ok: margem >= 20,
                msg: margem >= 20 ? 'Excelente (≥ 20%)' : margem >= 10 ? 'Razoável (10–20%)' : margem >= 0 ? 'Baixa (< 10%)' : 'Negativa',
              },
              {
                label: 'Cobertura de Despesas',
                ok: receita >= despesaTotal,
                msg: receita >= despesaTotal ? 'Receita cobre despesas' : 'Receita insuficiente',
              },
              {
                label: 'Concentração de Custos',
                ok: grupos.length > 0 && (grupos[0]?.itens.reduce((s, i) => s + i.valor, 0) / despesaTotal) < 0.6,
                msg: grupos.length === 0 ? 'Sem despesas' : (grupos[0]?.itens.reduce((s, i) => s + i.valor, 0) / despesaTotal) < 0.6 ? 'Custos distribuídos' : `Concentrado em ${grupos[0]?.grupo}`,
              },
            ].map(({ label, ok, msg }) => (
              <div key={label} className="flex items-start gap-2.5">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${ok ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                  {ok ? '✓' : '!'}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-700">{label}</p>
                  <p className={`text-xs ${ok ? 'text-emerald-600' : 'text-red-500'}`}>{msg}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}
