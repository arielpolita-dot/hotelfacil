import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const severities = {
  info:    { bg: 'bg-sky-50 border-sky-200 text-sky-800',       icon: Info },
  success: { bg: 'bg-emerald-50 border-emerald-200 text-emerald-800', icon: CheckCircle },
  warning: { bg: 'bg-amber-50 border-amber-200 text-amber-800', icon: AlertTriangle },
  danger:  { bg: 'bg-red-50 border-red-200 text-red-800',       icon: AlertCircle },
};

export function AlertBox({
  severity = 'info',
  icon: CustomIcon,
  title,
  children,
  className,
}) {
  const cfg = severities[severity] || severities.info;
  const Icon = CustomIcon || cfg.icon;

  return (
    <div className={cn('flex gap-3 p-3 rounded-lg border', cfg.bg, className)}>
      <Icon className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold mb-0.5">{title}</p>}
        <div className="text-sm">{children}</div>
      </div>
    </div>
  );
}
