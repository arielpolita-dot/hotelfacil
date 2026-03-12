import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

export default function TrialExpired({ empresaNome, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Ícone */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
            <Clock className="w-10 h-10 text-orange-600" />
          </div>
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Período de Teste Expirado
        </h1>

        {/* Empresa */}
        <p className="text-center text-gray-600 mb-6">
          {empresaNome}
        </p>

        {/* Mensagem */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-gray-700">
                Seu período de teste gratuito de <strong>3 dias</strong> expirou.
              </p>
              <p className="text-sm text-gray-700 mt-2">
                Para continuar usando o sistema, realize o pagamento da assinatura mensal.
              </p>
            </div>
          </div>
        </div>

        {/* Plano */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Plano Mensal</h3>
          
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-bold text-blue-600">R$ 99,90</span>
            <span className="text-gray-600">/mês</span>
          </div>

          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Gestão completa de reservas</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Controle de quartos e disponibilidade</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Gestão financeira e relatórios</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Suporte técnico</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Atualizações automáticas</span>
            </li>
          </ul>
        </div>

        {/* Instruções de Pagamento */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3">Como Pagar:</h4>
          
          <ol className="space-y-2 text-sm text-gray-700">
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">1.</span>
              <span>Faça um PIX de <strong>R$ 99,90</strong> para:</span>
            </li>
            <li className="ml-5">
              <div className="bg-white border border-gray-300 rounded px-3 py-2 font-mono text-sm">
                arielpolita@gmail.com
              </div>
            </li>
            <li className="flex gap-2 mt-3">
              <span className="font-semibold text-blue-600">2.</span>
              <span>Envie o comprovante para o mesmo email</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">3.</span>
              <span>Aguarde a confirmação (geralmente em até 24h)</span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-blue-600">4.</span>
              <span>Após a confirmação, seu acesso será liberado automaticamente</span>
            </li>
          </ol>
        </div>

        {/* Informações Adicionais */}
        <div className="text-center text-xs text-gray-500 mb-6">
          <p>Dúvidas? Entre em contato:</p>
          <p className="font-semibold text-gray-700 mt-1">arielpolita@gmail.com</p>
        </div>

        {/* Botão de Logout */}
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
        >
          Sair
        </button>
      </div>
    </div>
  );
}

