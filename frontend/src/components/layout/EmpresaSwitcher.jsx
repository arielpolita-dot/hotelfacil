import { useState, useRef, useEffect } from 'react';
import { useEmpresa } from '../../context/EmpresaContext';
import { Building2, ChevronDown, Check, Plus } from 'lucide-react';

function Initials({ name }) {
  const initials = (name || '')
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
      <span className="text-[10px] font-bold text-white">{initials || '?'}</span>
    </div>
  );
}

function EmpresaItem({ empresa, isActive, onSelect }) {
  return (
    <button
      onClick={() => !isActive && onSelect(empresa.id)}
      className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-left transition ${
        isActive
          ? 'bg-blue-500/10 text-white'
          : 'hover:bg-white/5 text-slate-300'
      }`}
    >
      <Initials name={empresa.name || empresa.nome} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold truncate">{empresa.name || empresa.nome}</div>
        {empresa.role && (
          <div className="text-[10px] text-slate-500 capitalize">{empresa.role}</div>
        )}
      </div>
      {isActive && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
    </button>
  );
}

export function EmpresaSwitcher() {
  const { activeEmpresa, companies, switchEmpresa, createEmpresa } = useEmpresa();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!activeEmpresa) return null;

  const empresaNome = activeEmpresa.name || activeEmpresa.nome || 'Hotel';
  const hasMultiple = companies.length > 1;

  return (
    <div className="relative px-3 mb-2" ref={ref}>
      <button
        onClick={() => hasMultiple && setOpen(!open)}
        className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border transition ${
          hasMultiple
            ? 'border-slate-700 hover:border-slate-500 hover:bg-white/5 cursor-pointer'
            : 'border-transparent cursor-default'
        }`}
      >
        <Initials name={empresaNome} />
        <span className="flex-1 text-xs font-semibold text-white text-left truncate">
          {empresaNome}
        </span>
        {hasMultiple && (
          <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-3 right-3 mt-1 py-1 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          {companies.map(c => (
            <EmpresaItem
              key={c.id}
              empresa={c}
              isActive={c.id === activeEmpresa.id}
              onSelect={(id) => { setOpen(false); switchEmpresa(id); }}
            />
          ))}
          <div className="border-t border-slate-700 mt-1 pt-1 px-1">
            <button
              onClick={() => { setOpen(false); window.location.href = '/app/novo-hotel'; }}
              className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            >
              <div className="w-7 h-7 rounded-lg border border-dashed border-slate-600 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium">Novo Hotel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
