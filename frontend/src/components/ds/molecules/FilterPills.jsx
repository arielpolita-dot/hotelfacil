import { cn } from '@/lib/utils';

export function FilterPills({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => onChange(opt.key)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-semibold border transition',
            value === opt.key
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600'
          )}
        >
          {opt.label}{opt.count !== undefined ? ` (${opt.count})` : ''}
        </button>
      ))}
    </div>
  );
}
