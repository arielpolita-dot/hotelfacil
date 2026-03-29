import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Modal, Input, Select, Textarea, FormField, Button } from '../../components/ds';
import { roles, statusOptions, permissoesDisponiveis } from './permissions';

export function UsuarioFormModal({ open, onClose, onSave, editingUsuario, formData, handleInputChange }) {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave();
  };

  return (
    <Modal open={open} onClose={onClose} title={editingUsuario ? 'Editar Usuario' : 'Novo Usuario'} maxWidth="4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dados Pessoais */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Nome Completo" required>
              <Input type="text" name="nome" value={formData.nome} onChange={handleInputChange} required />
            </FormField>
            <FormField label="E-mail" required>
              <Input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </FormField>
            <FormField label="Telefone">
              <Input type="tel" name="telefone" value={formData.telefone} onChange={handleInputChange} />
            </FormField>
            <FormField label="Status" required>
              <Select name="status" value={formData.status} onChange={handleInputChange} required>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FormField>
          </div>
        </div>

        {/* Dados de Acesso */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">Dados de Acesso</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={editingUsuario ? 'Nova Senha (deixe em branco para manter)' : 'Senha'} required={!editingUsuario}>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'} name="senha"
                  value={formData.senha} onChange={handleInputChange}
                  required={!editingUsuario} minLength="6"
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </FormField>
            <FormField label="Confirmar Senha" required={!editingUsuario}>
              <Input type={showPassword ? 'text' : 'password'} name="confirmarSenha"
                value={formData.confirmarSenha} onChange={handleInputChange}
                required={!editingUsuario} />
            </FormField>
          </div>
        </div>

        {/* Funcao e Permissoes */}
        <div>
          <h3 className="text-lg font-medium text-slate-800 mb-4">Funcao e Permissoes</h3>
          <FormField label="Funcao" required className="mb-4">
            <Select name="role" value={formData.role} onChange={handleInputChange} required>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          </FormField>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Permissoes do Sistema</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
              {permissoesDisponiveis.map((p) => (
                <label key={p.key} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name={`permissoes.${p.key}`}
                    checked={formData.permissoes[p.key]} onChange={handleInputChange}
                    className="mt-1 rounded border-slate-200 text-blue-600 focus:ring-blue-500" />
                  <div>
                    <span className="text-sm font-medium text-slate-700">{p.label}</span>
                    <p className="text-xs text-slate-500">{p.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Observacoes */}
        <FormField label="Observacoes">
          <Textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows={3}
            placeholder="Informacoes adicionais sobre o usuario..." />
        </FormField>

        {/* Botoes */}
        <div className="flex gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" fullWidth>
            {editingUsuario ? 'Atualizar' : 'Cadastrar'} Usuario
          </Button>
        </div>
      </form>
    </Modal>
  );
}
