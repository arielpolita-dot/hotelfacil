import { cn } from '@/lib/utils';

const colors = {
  brand:   'bg-blue-500',
  success: 'bg-emerald-500',
  danger:  'bg-red-500',
  warning: 'bg-amber-500',
  info:    'bg-sky-500',
  accent:  'bg-violet-500',
};

const heights = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export function ProgressBar({
  value = 0,
  color = 'brand',
  size = 'md',
  className,
}) {
  const pct = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('w-full bg-slate-100 rounded-full overflow-hidden', heights[size], className)}>
      <div
        className={cn('h-full rounded-full transition-all duration-700', colors[color])}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
