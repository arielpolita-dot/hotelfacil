import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SearchInput({ value, onChange, placeholder = 'Buscar...', className }) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-white text-sm placeholder-slate-400 transition focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
      />
    </div>
  );
}
