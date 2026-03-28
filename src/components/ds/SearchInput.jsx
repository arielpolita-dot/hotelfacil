import { Search } from 'lucide-react';

export function SearchInput({ value, onChange, placeholder = 'Buscar...' }) {
  return (
    <div className="relative max-w-xs">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      <input
        type="search"
        role="searchbox"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
      />
    </div>
  );
}
