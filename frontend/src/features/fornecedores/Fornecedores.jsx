import { useState, useMemo } from 'react';
import { useHotel } from '../../context/HotelContext';
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react';
import {
  Button, IconButton, Spinner,
  SearchInput,
  DataTable, TableHeader, TableHead, TableRow, TableCell,
  DeleteDialog, PageHeader, EmptyState,
} from '../../components/ds';
import { FornecedorFormModal } from './FornecedorFormModal';

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
      <PageHeader
        title="Fornecedores"
        subtitle={`${fornecedores.length} fornecedor${fornecedores.length !== 1 ? 'es' : ''} cadastrado${fornecedores.length !== 1 ? 's' : ''}`}
        actions={
          <Button variant="primary" icon={Plus} onClick={abrirNovo}>
            Novo Fornecedor
          </Button>
        }
      />

      {/* Busca */}
      <div className="mt-6 mb-6">
        <SearchInput
          value={busca}
          onChange={setBusca}
          placeholder="Buscar por nome, CNPJ, e-mail ou contato..."
        />
      </div>

      {/* Tabela */}
      <DataTable>
        {lista.length === 0 ? (
          <EmptyState
            icon={Building2}
            message="Nenhum fornecedor encontrado"
            subMessage='Clique em "Novo Fornecedor" para cadastrar'
          />
        ) : (
          <table className="w-full text-sm">
            <TableHeader>
              <TableHead>Nome</TableHead>
              <TableHead className="hidden md:table-cell">CNPJ/CPF</TableHead>
              <TableHead className="hidden lg:table-cell">Contato</TableHead>
              <TableHead className="hidden lg:table-cell">Telefone</TableHead>
              <TableHead className="hidden xl:table-cell">E-mail</TableHead>
              <TableHead align="right">Acoes</TableHead>
            </TableHeader>
            <tbody className="divide-y divide-slate-100">
              {lista.map(f => (
                <TableRow key={f.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Building2 size={14} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{f.nome}</p>
                        <p className="text-xs text-slate-400">{f.tipo === 'juridica' ? 'Pessoa Juridica' : 'Pessoa Fisica'}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{f.cnpj || f.cpf || '\u2014'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{f.contato || '\u2014'}</TableCell>
                  <TableCell className="hidden lg:table-cell">{f.telefone || '\u2014'}</TableCell>
                  <TableCell className="hidden xl:table-cell">{f.email || '\u2014'}</TableCell>
                  <TableCell align="right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton icon={Edit2} variant="brand" size="sm" label="Editar" onClick={() => abrirEditar(f)} />
                      <IconButton icon={Trash2} variant="danger" size="sm" label="Excluir" onClick={() => setConfirmarExcluir(f)} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </tbody>
          </table>
        )}
      </DataTable>

      {/* Modal Cadastro/Edicao */}
      <FornecedorFormModal
        open={modalAberto}
        onClose={fechar}
        onSave={salvar}
        editingFornecedor={editando}
        form={form}
        onChange={handleChange}
        saving={salvando}
      />

      {/* Confirmar Exclusao */}
      <DeleteDialog
        open={!!confirmarExcluir}
        onClose={() => setConfirmarExcluir(null)}
        onConfirm={() => excluir(confirmarExcluir?.id)}
        entityName="fornecedor"
      />
    </div>
  );
}
