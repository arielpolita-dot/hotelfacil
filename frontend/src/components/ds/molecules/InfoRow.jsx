import { cn } from '@/lib/utils';

export function InfoRow({ label, value, icon: Icon, className }) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      <span className="flex items-center gap-2 text-sm text-slate-500">
        {Icon && <Icon className="h-4 w-4" />}
        {label}
      </span>
      <span className="text-sm font-medium text-slate-900">{value}</span>
    </div>
  );
}
