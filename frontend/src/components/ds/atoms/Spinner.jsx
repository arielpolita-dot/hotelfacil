import { cn } from '@/lib/utils';

const sizes = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

export function Spinner({ size = 'md', message, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)} role="status">
      <div
        className={cn(
          'border-blue-600 border-t-transparent rounded-full animate-spin',
          sizes[size]
        )}
      />
      {message && <p className="text-sm text-slate-500 mt-3">{message}</p>}
      <span className="sr-only">Carregando...</span>
    </div>
  );
}
