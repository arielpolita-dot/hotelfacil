import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Modal } from '../../components/ds';
import { roles, statusOptions, permissoesDisponiveis } from './permissions';

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent";

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
          <h3 className="text-lg font-medium text-gray-800 mb-4">Dados Pessoais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleInputChange} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-mail *</label>
              <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
              <input type="tel" name="telefone" value={formData.telefone} onChange={handleInputChange} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
              <select name="status" value={formData.status} onChange={handleInputChange} required className={inputCls}>
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Dados de Acesso */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Dados de Acesso</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {editingUsuario ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} name="senha"
                  value={formData.senha} onChange={handleInputChange}
                  required={!editingUsuario} minLength="6"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirmar Senha {!editingUsuario && '*'}
              </label>
              <input type={showPassword ? 'text' : 'password'} name="confirmarSenha"
                value={formData.confirmarSenha} onChange={handleInputChange}
                required={!editingUsuario} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Funcao e Permissoes */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Funcao e Permissoes</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Funcao *</label>
            <select name="role" value={formData.role} onChange={handleInputChange} required className={inputCls}>
              {roles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Permissoes do Sistema</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
              {permissoesDisponiveis.map((p) => (
                <label key={p.key} className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name={`permissoes.${p.key}`}
                    checked={formData.permissoes[p.key]} onChange={handleInputChange}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <div>
                    <span className="text-sm font-medium text-gray-700">{p.label}</span>
                    <p className="text-xs text-gray-500">{p.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Observacoes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Observacoes</label>
          <textarea name="observacoes" value={formData.observacoes} onChange={handleInputChange} rows="3"
            className={inputCls} placeholder="Informacoes adicionais sobre o usuario..." />
        </div>

        {/* Botoes */}
        <div className="flex gap-3 pt-4 border-t">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit"
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            {editingUsuario ? 'Atualizar' : 'Cadastrar'} Usuario
          </button>
        </div>
      </form>
    </Modal>
  );
}
