import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HybridHotelContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Receipt,
  PieChart
} from 'lucide-react';

function Despesas() {
  const { despesas, adicionarDespesa, atualizarDespesa, removerDespesa } = useHotel();
  const [modalDespesa, setModalDespesa] = useState(false);
  const [despesaEditando, setDespesaEditando] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');
  const [dadosDespesa, setDadosDespesa] = useState({
    categoria: '',
    descricao: '',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    tipo: 'variavel',
    responsavel: ''
  });

  // Categorias de despesas
  const categorias = [
    'Limpeza', 'Energia', 'Água', 'Internet', 'Telefone', 'Manutenção',
    'Salários', 'Impostos', 'Marketing', 'Alimentação', 'Transporte', 'Outros'
  ];

  // Filtrar despesas
  const despesasFiltradas = useMemo(() => {
    return despesas.filter(despesa => {
      const matchCategoria = filtroCategoria === 'todas' || despesa.categoria === filtroCategoria;
      const matchTipo = filtroTipo === 'todos' || despesa.tipo === filtroTipo;
      const matchBusca = busca === '' || 
        despesa.descricao.toLowerCase().includes(busca.toLowerCase()) ||
        despesa.categoria.toLowerCase().includes(busca.toLowerCase()) ||
        despesa.responsavel.toLowerCase().includes(busca.toLowerCase());
      
      return matchCategoria && matchTipo && matchBusca;
    });
  }, [despesas, filtroCategoria, filtroTipo, busca]);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const total = despesas.reduce((sum, d) => sum + d.valor, 0);
    const fixas = despesas.filter(d => d.tipo === 'fixa').reduce((sum, d) => sum + d.valor, 0);
    const variaveis = despesas.filter(d => d.tipo === 'variavel').reduce((sum, d) => sum + d.valor, 0);
    
    // Despesas por categoria
    const porCategoria = {};
    despesas.forEach(d => {
      porCategoria[d.categoria] = (porCategoria[d.categoria] || 0) + d.valor;
    });
    
    // Despesas do mês atual
    const mesAtual = new Date().getMonth();
    const anoAtual = new Date().getFullYear();
    const despesasMes = despesas.filter(d => {
      const dataDespesa = new Date(d.data);
      return dataDespesa.getMonth() === mesAtual && dataDespesa.getFullYear() === anoAtual;
    }).reduce((sum, d) => sum + d.valor, 0);

    return {
      total,
      fixas,
      variaveis,
      porCategoria,
      despesasMes,
      quantidade: despesas.length
    };
  }, [despesas]);

  // Abrir modal para nova despesa
  const abrirModalNova = () => {
    setDespesaEditando(null);
    setDadosDespesa({
      categoria: '',
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      tipo: 'variavel',
      responsavel: ''
    });
    setModalDespesa(true);
  };

  // Abrir modal para editar despesa
  const abrirModalEdicao = (despesa) => {
    setDespesaEditando(despesa);
    setDadosDespesa({
      categoria: despesa.categoria,
      descricao: despesa.descricao,
      valor: despesa.valor.toString(),
      data: despesa.data.toISOString().split('T')[0],
      tipo: despesa.tipo,
      responsavel: despesa.responsavel
    });
    setModalDespesa(true);
  };

  // Fechar modal
  const fecharModal = () => {
    setModalDespesa(false);
    setDespesaEditando(null);
    setDadosDespesa({
      categoria: '',
      descricao: '',
      valor: '',
      data: new Date().toISOString().split('T')[0],
      tipo: 'variavel',
      responsavel: ''
    });
  };

  // Salvar despesa
  const salvarDespesa = () => {
    if (!dadosDespesa.categoria || !dadosDespesa.descricao || !dadosDespesa.valor) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const despesaData = {
      categoria: dadosDespesa.categoria,
      descricao: dadosDespesa.descricao,
      valor: parseFloat(dadosDespesa.valor),
      data: new Date(dadosDespesa.data),
      tipo: dadosDespesa.tipo,
      responsavel: dadosDespesa.responsavel || 'Não informado'
    };

    if (despesaEditando) {
      atualizarDespesa({ ...despesaData, id: despesaEditando.id });
    } else {
      adicionarDespesa({ ...despesaData, id: `desp${Date.now()}` });
    }

    fecharModal();
  };

  // Excluir despesa
  const excluirDespesa = (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta despesa?')) {
      removerDespesa(id);
    }
  };

  // Obter cor da categoria
  const obterCorCategoria = (categoria) => {
    const cores = {
      'Limpeza': 'bg-blue-100 text-blue-800',
      'Energia': 'bg-yellow-100 text-yellow-800',
      'Água': 'bg-cyan-100 text-cyan-800',
      'Internet': 'bg-purple-100 text-purple-800',
      'Telefone': 'bg-green-100 text-green-800',
      'Manutenção': 'bg-red-100 text-red-800',
      'Salários': 'bg-indigo-100 text-indigo-800',
      'Impostos': 'bg-gray-100 text-gray-800',
      'Marketing': 'bg-pink-100 text-pink-800',
      'Alimentação': 'bg-orange-100 text-orange-800',
      'Transporte': 'bg-teal-100 text-teal-800',
      'Outros': 'bg-slate-100 text-slate-800'
    };
    return cores[categoria] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Despesas</h1>
          <p className="text-gray-600 mt-2">Controle e gestão de despesas operacionais</p>
        </div>
        
        <Button onClick={abrirModalNova} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {estatisticas.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.quantidade} despesas registradas
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Fixas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {estatisticas.fixas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((estatisticas.fixas / estatisticas.total) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas Variáveis</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              R$ {estatisticas.variaveis.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((estatisticas.variaveis / estatisticas.total) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              R$ {estatisticas.despesasMes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Mês atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Buscar por descrição, categoria ou responsável..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="form-input w-40"
            >
              <option value="todas">Todas Categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="form-input w-32"
            >
              <option value="todos">Todos Tipos</option>
              <option value="fixa">Fixa</option>
              <option value="variavel">Variável</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Despesas por categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <PieChart className="h-5 w-5 mr-2" />
            Despesas por Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(estatisticas.porCategoria)
              .sort(([,a], [,b]) => b - a)
              .map(([categoria, valor]) => (
                <div key={categoria} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600">{categoria}</div>
                  <div className="text-lg font-bold text-red-600">
                    R$ {valor.toLocaleString('pt-BR')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round((valor / estatisticas.total) * 100)}%
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de despesas */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Tipo</th>
                  <th>Responsável</th>
                  <th>Valor</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {despesasFiltradas.map(despesa => (
                  <tr key={despesa.id}>
                    <td>{despesa.data.toLocaleDateString('pt-BR')}</td>
                    <td>
                      <Badge className={obterCorCategoria(despesa.categoria)}>
                        {despesa.categoria}
                      </Badge>
                    </td>
                    <td className="font-medium">{despesa.descricao}</td>
                    <td>
                      <Badge variant={despesa.tipo === 'fixa' ? 'default' : 'secondary'}>
                        {despesa.tipo === 'fixa' ? 'Fixa' : 'Variável'}
                      </Badge>
                    </td>
                    <td>{despesa.responsavel}</td>
                    <td className="font-bold text-red-600">
                      R$ {despesa.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => abrirModalEdicao(despesa)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => excluirDespesa(despesa.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Despesa */}
      <Dialog open={modalDespesa} onOpenChange={setModalDespesa}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {despesaEditando ? 'Editar Despesa' : 'Nova Despesa'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Categoria *</label>
                <select
                  value={dadosDespesa.categoria}
                  onChange={(e) => setDadosDespesa({
                    ...dadosDespesa,
                    categoria: e.target.value
                  })}
                  className="form-input"
                >
                  <option value="">Selecione uma categoria</option>
                  {categorias.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Tipo *</label>
                <select
                  value={dadosDespesa.tipo}
                  onChange={(e) => setDadosDespesa({
                    ...dadosDespesa,
                    tipo: e.target.value
                  })}
                  className="form-input"
                >
                  <option value="variavel">Variável</option>
                  <option value="fixa">Fixa</option>
                </select>
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Descrição *</label>
              <input
                type="text"
                value={dadosDespesa.descricao}
                onChange={(e) => setDadosDespesa({
                  ...dadosDespesa,
                  descricao: e.target.value
                })}
                className="form-input"
                placeholder="Descrição da despesa"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  value={dadosDespesa.valor}
                  onChange={(e) => setDadosDespesa({
                    ...dadosDespesa,
                    valor: e.target.value
                  })}
                  className="form-input"
                  placeholder="0,00"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Data *</label>
                <input
                  type="date"
                  value={dadosDespesa.data}
                  onChange={(e) => setDadosDespesa({
                    ...dadosDespesa,
                    data: e.target.value
                  })}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label className="form-label">Responsável</label>
              <input
                type="text"
                value={dadosDespesa.responsavel}
                onChange={(e) => setDadosDespesa({
                  ...dadosDespesa,
                  responsavel: e.target.value
                })}
                className="form-input"
                placeholder="Nome do responsável"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button onClick={salvarDespesa} className="bg-red-600 hover:bg-red-700">
                <Receipt className="h-4 w-4 mr-2" />
                {despesaEditando ? 'Atualizar' : 'Salvar'} Despesa
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Despesas;
