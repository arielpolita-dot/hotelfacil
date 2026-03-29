import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

const baseClasses = 'w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed';

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select
      ref={ref}
      className={cn(baseClasses, className)}
      {...props}
    >
      {children}
    </select>
  );
});
