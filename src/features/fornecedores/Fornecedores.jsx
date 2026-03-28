import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import {
  Plus, Search, Edit2, Trash2, X, Building2, Phone, Mail, MapPin, User, FileText
} from 'lucide-react';
import { maskCPF, maskCNPJ, maskPhone } from '../../utils/masks';

const EMPTY_FORM = {
  nome: '', tipo: 'juridica', cnpj: '', cpf: '', email: '', telefone: '',
  contato: '', endereco: '', cidade: '', estado: '', cep: '', observacoes: ''
};

export default function Fornecedores() {
  const { fornecedores, adicionarFornecedor, atualizarFornecedor, removerFornecedor } = useHotel();

  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [salvando, setSalvando] = useState(false);
  const [confirmarExcluir, setConfirmarExcluir] = useState(null);

  const lista = useMemo(() => {
    if (!busca.trim()) return fornecedores;
    const b = busca.toLowerCase();
    return fornecedores.filter(f =>
      f.nome?.toLowerCase().includes(b) ||
      f.cnpj?.includes(b) ||
      f.email?.toLowerCase().includes(b) ||
      f.contato?.toLowerCase().includes(b)
    );
  }, [fornecedores, busca]);

  function abrirNovo() {
    setEditando(null);
    setForm(EMPTY_FORM);
    setModalAberto(true);
  }

  function abrirEditar(f) {
    setEditando(f.id);
    setForm({ ...EMPTY_FORM, ...f });
    setModalAberto(true);
  }

  function fechar() {
    setModalAberto(false);
    setEditando(null);
    setForm(EMPTY_FORM);
  }

  function handleChange(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }

  async function salvar() {
    setSalvando(true);
    try {
      const dados = {
        ...form,
        nome: form.nome.toUpperCase(),
        contato: form.contato.toUpperCase(),
      };
      if (editando) {
        await atualizarFornecedor(editando, dados);
      } else {
        await adicionarFornecedor(dados);
      }
      fechar();
    } catch (e) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id) {
    try {
      await removerFornecedor(id);
      setConfirmarExcluir(null);
    } catch (e) {
      alert('Erro ao excluir: ' + e.message);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-sm text-gray-500 mt-1">{fornecedores.length} fornecedor{fornecedores.length !== 1 ? 'es' : ''} cadastrado{fornecedores.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={abrirNovo}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Novo Fornecedor
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar por nome, CNPJ, e-mail ou contato..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {lista.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhum fornecedor encontrado</p>
            <p className="text-sm mt-1">Clique em "Novo Fornecedor" para cadastrar</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase text-xs tracking-wide">Nome</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase text-xs tracking-wide hidden md:table-cell">CNPJ/CPF</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase text-xs tracking-wide hidden lg:table-cell">Contato</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase text-xs tracking-wide hidden lg:table-cell">Telefone</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 uppercase text-xs tracking-wide hidden xl:table-cell">E-mail</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600 uppercase text-xs tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {lista.map(f => (
                <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Building2 size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{f.nome}</p>
                        <p className="text-xs text-gray-400">{f.tipo === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{f.cnpj || f.cpf || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{f.contato || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">{f.telefone || '—'}</td>
                  <td className="px-4 py-3 text-gray-600 hidden xl:table-cell">{f.email || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => abrirEditar(f)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setConfirmarExcluir(f)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Cadastro/Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{editando ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
              <button onClick={fechar} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
              {/* Tipo */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Tipo de Pessoa</label>
                <div className="flex gap-3">
                  {[['juridica', 'Pessoa Jurídica'], ['fisica', 'Pessoa Física']].map(([v, l]) => (
                    <label key={v} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="tipo" value={v} checked={form.tipo === v} onChange={() => handleChange('tipo', v)} className="accent-blue-600" />
                      <span className="text-sm text-gray-700">{l}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Nome */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nome / Razão Social</label>
                <input
                  value={form.nome}
                  onChange={e => handleChange('nome', e.target.value.toUpperCase())}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do fornecedor"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* CNPJ ou CPF */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{form.tipo === 'juridica' ? 'CNPJ' : 'CPF'}</label>
                  <input
                    value={form.tipo === 'juridica' ? form.cnpj : form.cpf}
                    onChange={e => {
                      const v = form.tipo === 'juridica' ? maskCNPJ(e.target.value) : maskCPF(e.target.value);
                      handleChange(form.tipo === 'juridica' ? 'cnpj' : 'cpf', v);
                    }}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={form.tipo === 'juridica' ? '00.000.000/0001-00' : '000.000.000-00'}
                  />
                </div>
                {/* Telefone */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Telefone</label>
                  <input
                    value={form.telefone}
                    onChange={e => handleChange('telefone', maskPhone(e.target.value))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* E-mail */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">E-mail</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="email@empresa.com"
                  />
                </div>
                {/* Contato */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Nome do Contato</label>
                  <input
                    value={form.contato}
                    onChange={e => handleChange('contato', e.target.value.toUpperCase())}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Responsável"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Endereço</label>
                <input
                  value={form.endereco}
                  onChange={e => handleChange('endereco', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Cidade</label>
                  <input value={form.cidade} onChange={e => handleChange('cidade', e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Cidade" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Estado</label>
                  <input value={form.estado} onChange={e => handleChange('estado', e.target.value.toUpperCase().slice(0, 2))} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="UF" maxLength={2} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">CEP</label>
                  <input
                    value={form.cep}
                    onChange={e => handleChange('cep', e.target.value.replace(/\D/g, '').slice(0, 8).replace(/(\d{5})(\d)/, '$1-$2'))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="00000-000"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Observações</label>
                <textarea
                  value={form.observacoes}
                  onChange={e => handleChange('observacoes', e.target.value)}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Informações adicionais..."
                />
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={fechar} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Cadastrar Fornecedor'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar Exclusão */}
      {confirmarExcluir && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Excluir Fornecedor</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
              </div>
            </div>
            <p className="text-sm text-gray-700 mb-6">
              Tem certeza que deseja excluir <strong>{confirmarExcluir.nome}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmarExcluir(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={() => excluir(confirmarExcluir.id)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
