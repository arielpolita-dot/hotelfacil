import React from 'react';
import { Clock, X } from 'lucide-react';

export default function TrialBanner({ diasRestantes, onClose }) {
  const isUrgent = diasRestantes <= 1;

  return (
    <div className={`${
      isUrgent ? 'bg-orange-500' : 'bg-blue-500'
    } text-white px-4 py-3 shadow-md relative`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <Clock className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">
              {diasRestantes === 1 
                ? 'Último dia de teste gratuito!' 
                : `${diasRestantes} dias restantes de teste gratuito`}
            </span>
            <span className="ml-2 opacity-90">
              Assine agora para continuar usando o sistema após o período de teste.
            </span>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

