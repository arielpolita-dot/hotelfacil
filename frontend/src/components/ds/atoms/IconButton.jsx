import { cn } from '@/lib/utils';

const variants = {
  ghost:   'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
  brand:   'text-blue-600 hover:bg-blue-50',
  danger:  'text-red-500 hover:bg-red-50',
  success: 'text-emerald-600 hover:bg-emerald-50',
};

const sizes = {
  sm: 'w-7 h-7',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
};

const iconSizes = {
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

export function IconButton({
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  label,
  className,
  ...props
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center rounded-lg transition',
        'disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </button>
  );
}
