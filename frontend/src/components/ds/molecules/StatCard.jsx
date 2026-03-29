import { cn } from '@/lib/utils';

const iconColors = {
  brand:   'bg-blue-500',
  success: 'bg-emerald-500',
  danger:  'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-sky-500',
  accent:  'bg-violet-500',
};

export function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  color = 'brand',
  iconBg,
  className,
}) {
  const bg = iconBg || iconColors[color] || iconColors.brand;

  return (
    <div className={cn('bg-white rounded-xl shadow-xs border border-slate-200 p-5 flex items-start justify-between gap-3', className)}>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-1 truncate">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      {Icon && (
        <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0', bg)}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
}
