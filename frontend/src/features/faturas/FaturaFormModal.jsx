import React from 'react';
import { Modal } from '../../components/ds';
import { tiposContrato, periodicidades, statusOptions } from './useFaturaForm';
import { inputCls, selectCls } from '../../styles/formClasses';

export function FaturaFormModal({
  open, onClose, onSave, editingFatura,
  formData, handleInputChange, valorTotal, proximaFatura, quartos,
}) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <Modal open={open} onClose={onClose} title={editingFatura ? 'Editar Contrato' : 'Novo Contrato Corporativo'} maxWidth="4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados da Empresa */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">Dados da Empresa Cliente</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Nome da Empresa *</label>
              <input type="text" name="empresaCliente" value={formData.empresaCliente} onChange={handleInputChange} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">CNPJ *</label>
              <input type="text" name="cnpj" value={formData.cnpj} onChange={handleInputChange} required placeholder="00.000.000/0000-00" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Pessoa de Contato *</label>
              <input type="text" name="contato" value={formData.contato} onChange={handleInputChange} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">E-mail *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Telefone</label>
              <input type="tel" name="telefone" value={formData.telefone} onChange={handleInputChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Endereco</label>
              <input type="text" name="endereco" value={formData.endereco} onChange={handleInputChange} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Dados do Contrato */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">Dados do Contrato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Contrato *</label>
              <select name="tipoContrato" value={formData.tipoContrato} onChange={handleInputChange} required className={inputCls}>
                {tiposContrato.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Periodicidade da Fatura *</label>
              <select name="periodicidadeFatura" value={formData.periodicidadeFatura} onChange={handleInputChange} required className={inputCls}>
                {periodicidades.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data de Inicio *</label>
              <input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleInputChange} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Data de Fim *</label>
              <input type="date" name="dataFim" value={formData.dataFim} onChange={handleInputChange} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Valor Mensal (R$) *</label>
              <input type="number" name="valorMensal" value={formData.valorMensal} onChange={handleInputChange} step="0.01" min="0" required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status *</label>
              <select name="status" value={formData.status} onChange={handleInputChange} required className={inputCls}>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Quartos Inclusos */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">Quartos Inclusos no Contrato</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-40 overflow-y-auto border rounded-lg p-4">
            {quartos.map((quarto) => (
              <label key={quarto.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" name="quartosInclusos" value={quarto.numero}
                  checked={formData.quartosInclusos.includes(quarto.numero)}
                  onChange={handleInputChange}
                  className="rounded border-slate-200 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700">Quarto {quarto.numero}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="bg-slate-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-slate-800 mb-3">Resumo Financeiro</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-slate-600">Valor Mensal</p>
              <p className="text-lg font-bold text-blue-600">R$ {parseFloat(formData.valorMensal || 0).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Valor Total do Contrato</p>
              <p className="text-lg font-bold text-green-600">R$ {(valorTotal || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Proxima Fatura</p>
              <p className="text-lg font-bold text-orange-600">
                {proximaFatura ? new Date(proximaFatura).toLocaleDateString('pt-BR') : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Observacoes */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Observacoes</label>
          <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows="3"
            className={inputCls} placeholder="Informacoes adicionais sobre o contrato..." />
        </div>

        {/* Botoes */}
        <div className="flex gap-3 pt-4 border-t">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {editingFatura ? 'Atualizar' : 'Criar'} Contrato
          </button>
        </div>
      </form>
    </Modal>
  );
}
