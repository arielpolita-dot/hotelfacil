import React from 'react';
import { Modal, Input, Select, Textarea, FormField, Button } from '../../components/ds';
import { tiposContrato, periodicidades, statusOptions } from './useFaturaForm';

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
            <FormField label="Nome da Empresa" required>
              <Input type="text" name="empresaCliente" value={formData.empresaCliente} onChange={handleInputChange} required />
            </FormField>
            <FormField label="CNPJ" required>
              <Input type="text" name="cnpj" value={formData.cnpj} onChange={handleInputChange} required placeholder="00.000.000/0000-00" />
            </FormField>
            <FormField label="Pessoa de Contato" required>
              <Input type="text" name="contato" value={formData.contato} onChange={handleInputChange} required />
            </FormField>
            <FormField label="E-mail" required>
              <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </FormField>
            <FormField label="Telefone">
              <Input type="tel" name="telefone" value={formData.telefone} onChange={handleInputChange} />
            </FormField>
            <FormField label="Endereco">
              <Input type="text" name="endereco" value={formData.endereco} onChange={handleInputChange} />
            </FormField>
          </div>
        </div>

        {/* Dados do Contrato */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">Dados do Contrato</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Tipo de Contrato" required>
              <Select name="tipoContrato" value={formData.tipoContrato} onChange={handleInputChange} required>
                {tiposContrato.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
              </Select>
            </FormField>
            <FormField label="Periodicidade da Fatura" required>
              <Select name="periodicidadeFatura" value={formData.periodicidadeFatura} onChange={handleInputChange} required>
                {periodicidades.map(p => <option key={p} value={p}>{p}</option>)}
              </Select>
            </FormField>
            <FormField label="Data de Inicio" required>
              <Input type="date" name="dataInicio" value={formData.dataInicio} onChange={handleInputChange} required />
            </FormField>
            <FormField label="Data de Fim" required>
              <Input type="date" name="dataFim" value={formData.dataFim} onChange={handleInputChange} required />
            </FormField>
            <FormField label="Valor Mensal (R$)" required>
              <Input type="number" name="valorMensal" value={formData.valorMensal} onChange={handleInputChange} step="0.01" min="0" required />
            </FormField>
            <FormField label="Status" required>
              <Select name="status" value={formData.status} onChange={handleInputChange} required>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormField>
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
        <FormField label="Observacoes">
          <Textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={3}
            placeholder="Informacoes adicionais sobre o contrato..." />
        </FormField>

        {/* Botoes */}
        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            {editingFatura ? 'Atualizar' : 'Criar'} Contrato
          </Button>
        </div>
      </form>
    </Modal>
  );
}
