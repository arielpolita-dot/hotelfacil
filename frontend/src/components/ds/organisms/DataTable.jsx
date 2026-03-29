import { cn } from '@/lib/utils';
import { Spinner } from '../atoms/Spinner';

export function DataTable({ children, className }) {
  return (
    <div className={cn('bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden', className)}>
      {children}
    </div>
  );
}

export function TableHeader({ children, className }) {
  return (
    <thead>
      <tr className={cn('border-b border-slate-100 bg-slate-50', className)}>
        {children}
      </tr>
    </thead>
  );
}

export function TableHead({ children, className, align = 'left' }) {
  return (
    <th
      className={cn(
        'py-3 px-4 text-xs font-semibold text-slate-500 tracking-wide',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </th>
  );
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr
      className={cn(
        'border-b border-slate-50 hover:bg-slate-50/50 transition',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function TableCell({ children, className, align = 'left' }) {
  return (
    <td
      className={cn(
        'py-3 px-4 text-sm text-slate-700',
        align === 'left' && 'text-left',
        align === 'center' && 'text-center',
        align === 'right' && 'text-right',
        className
      )}
    >
      {children}
    </td>
  );
}

export function TableLoading() {
  return (
    <div className="py-16">
      <Spinner size="md" />
    </div>
  );
}
