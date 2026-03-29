import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Badge } from '../../components/ds';

const pct = (v, total) => total === 0 ? '0,0%' : `${((v / total) * 100).toFixed(1).replace('.', ',')}%`;

export { pct };

export function Card({ title, value, sub, color = 'blue', icon: Icon, trend }) {
  const colors = {
    blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: 'bg-blue-100 text-blue-600',   border: 'border-blue-100' },
    green:  { bg: 'bg-emerald-50',text: 'text-emerald-700',icon: 'bg-emerald-100 text-emerald-600', border: 'border-emerald-100' },
    red:    { bg: 'bg-red-50',    text: 'text-red-700',    icon: 'bg-red-100 text-red-600',     border: 'border-red-100' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-700', icon: 'bg-violet-100 text-violet-600', border: 'border-violet-100' },
    amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: 'bg-amber-100 text-amber-600', border: 'border-amber-100' },
  };
  const c = colors[color];
  return (
    <div className={`rounded-2xl border ${c.border} ${c.bg} p-5 flex items-start gap-4`}>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">{title}</p>
        <p className={`text-xl font-bold ${c.text} leading-tight`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
            {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trend >= 0 ? '+' : ''}{trend.toFixed(1).replace('.', ',')}% vs mês anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function LinhaGrupo({ grupo, itens, totalReceita }) {
  const [aberto, setAberto] = useState(false);
  const total = itens.reduce((s, i) => s + i.valor, 0);
  return (
    <>
      <tr
        className="cursor-pointer hover:bg-slate-50 transition border-b border-slate-100"
        onClick={() => setAberto(p => !p)}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 flex items-center justify-center text-slate-400">
              {aberto ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </span>
            <span className="text-sm font-semibold text-slate-700">{grupo}</span>
            <Badge variant="default">{itens.length}</Badge>
          </div>
        </td>
        <td className="py-3 px-4 text-right text-sm font-bold text-red-600">{formatCurrency(total)}</td>
        <td className="py-3 px-4 text-right text-xs text-slate-400">{pct(total, totalReceita)}</td>
      </tr>
      {aberto && itens.map((item, i) => (
        <tr key={i} className="bg-slate-50/50 border-b border-slate-50">
          <td className="py-2 px-4 pl-12 text-xs text-slate-500">{item.descricao || item.categoria || '—'}</td>
          <td className="py-2 px-4 text-right text-xs text-slate-600">{formatCurrency(item.valor)}</td>
          <td className="py-2 px-4 text-right text-xs text-slate-400">{pct(item.valor, totalReceita)}</td>
        </tr>
      ))}
    </>
  );
}
