import { cn } from '@/lib/utils';

const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({ children, padding = 'none', className }) {
  return (
    <div
      className={cn(
        'bg-white rounded-xl border border-slate-200 shadow-xs',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('flex items-center justify-between p-5 border-b border-slate-100', className)}>
      {children}
    </div>
  );
}

export function CardBody({ children, className }) {
  return (
    <div className={cn('p-5', className)}>
      {children}
    </div>
  );
}
