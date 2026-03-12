import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HybridHotelContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  PieChart,
  Filter,
  Download
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

function FluxoCaixa() {
  const { fluxoCaixa, reservas, despesas } = useHotel();
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [periodoFiltro, setPeriodoFiltro] = useState('mes');

  // Cores para o gráfico de pizza
  const CORES = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#06b6d4'];

  // Filtrar dados por período
  const dadosFiltrados = useMemo(() => {
    const hoje = new Date();
    let dataLimite;

    switch (periodoFiltro) {
      case 'semana':
        dataLimite = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'mes':
        dataLimite = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        break;
      case 'trimestre':
        dataLimite = new Date(hoje.getFullYear(), hoje.getMonth() - 3, 1);
        break;
      case 'ano':
        dataLimite = new Date(hoje.getFullYear(), 0, 1);
        break;
      default:
        dataLimite = new Date(0);
    }

    return fluxoCaixa.filter(item => {
      const itemData = new Date(item.data);
      const matchPeriodo = itemData >= dataLimite;
      const matchTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;
      return matchPeriodo && matchTipo;
    });
  }, [fluxoCaixa, filtroTipo, periodoFiltro]);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const entradas = dadosFiltrados.filter(item => item.tipo === 'entrada');
    const saidas = dadosFiltrados.filter(item => item.tipo === 'saida');
    
    const totalEntradas = entradas.reduce((sum, item) => sum + item.valor, 0);
    const totalSaidas = saidas.reduce((sum, item) => sum + item.valor, 0);
    const saldoLiquido = totalEntradas - totalSaidas;
    
    // Entradas por categoria
    const entradasPorCategoria = {};
    entradas.forEach(item => {
      entradasPorCategoria[item.categoria] = (entradasPorCategoria[item.categoria] || 0) + item.valor;
    });
    
    // Saídas por categoria
    const saidasPorCategoria = {};
    saidas.forEach(item => {
      saidasPorCategoria[item.categoria] = (saidasPorCategoria[item.categoria] || 0) + item.valor;
    });

    return {
      totalEntradas,
      totalSaidas,
      saldoLiquido,
      quantidadeEntradas: entradas.length,
      quantidadeSaidas: saidas.length,
      entradasPorCategoria,
      saidasPorCategoria
    };
  }, [dadosFiltrados]);

  // Dados para gráfico de linha (evolução diária)
  const dadosGraficoLinha = useMemo(() => {
    const dadosPorDia = {};
    
    dadosFiltrados.forEach(item => {
      const dia = item.data.toISOString().split('T')[0];
      if (!dadosPorDia[dia]) {
        dadosPorDia[dia] = { data: dia, entradas: 0, saidas: 0 };
      }
      
      if (item.tipo === 'entrada') {
        dadosPorDia[dia].entradas += item.valor;
      } else {
        dadosPorDia[dia].saidas += item.valor;
      }
    });
    
    return Object.values(dadosPorDia)
      .sort((a, b) => new Date(a.data) - new Date(b.data))
      .map(item => ({
        ...item,
        saldo: item.entradas - item.saidas,
        dataFormatada: new Date(item.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      }));
  }, [dadosFiltrados]);

  // Dados para gráfico de barras (comparativo mensal)
  const dadosGraficoBarras = useMemo(() => {
    const dadosPorMes = {};
    
    dadosFiltrados.forEach(item => {
      const mes = item.data.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
      if (!dadosPorMes[mes]) {
        dadosPorMes[mes] = { mes, entradas: 0, saidas: 0 };
      }
      
      if (item.tipo === 'entrada') {
        dadosPorMes[mes].entradas += item.valor;
      } else {
        dadosPorMes[mes].saidas += item.valor;
      }
    });
    
    return Object.values(dadosPorMes).map(item => ({
      ...item,
      saldo: item.entradas - item.saidas
    }));
  }, [dadosFiltrados]);

  // Dados para gráfico de pizza (categorias)
  const dadosGraficoPizza = useMemo(() => {
    const todasCategorias = { ...estatisticas.entradasPorCategoria };
    
    Object.entries(estatisticas.saidasPorCategoria).forEach(([categoria, valor]) => {
      todasCategorias[categoria] = (todasCategorias[categoria] || 0) + valor;
    });
    
    return Object.entries(todasCategorias)
      .map(([categoria, valor]) => ({ categoria, valor }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 6); // Top 6 categorias
  }, [estatisticas]);

  // Exportar relatório
  const exportarRelatorio = () => {
    const dados = dadosFiltrados.map(item => ({
      Data: item.data.toLocaleDateString('pt-BR'),
      Tipo: item.tipo === 'entrada' ? 'Entrada' : 'Saída',
      Categoria: item.categoria,
      Descrição: item.descricao,
      Valor: `R$ ${item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    }));
    
    console.log('Exportando relatório:', dados);
    alert('Funcionalidade de exportação será implementada em versão futura.');
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fluxo de Caixa</h1>
          <p className="text-gray-600 mt-2">Controle financeiro e fluxo de caixa</p>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={periodoFiltro}
            onChange={(e) => setPeriodoFiltro(e.target.value)}
            className="form-input w-32"
          >
            <option value="semana">Semana</option>
            <option value="mes">Mês</option>
            <option value="trimestre">Trimestre</option>
            <option value="ano">Ano</option>
          </select>
          
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="form-input w-32"
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="saida">Saídas</option>
          </select>
          
          <Button onClick={exportarRelatorio} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Entradas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {estatisticas.totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.quantidadeEntradas} transações
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Saídas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {estatisticas.totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.quantidadeSaidas} transações
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
            <DollarSign className={`h-4 w-4 ${estatisticas.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${estatisticas.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {estatisticas.saldoLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {estatisticas.saldoLiquido >= 0 ? 'Resultado positivo' : 'Resultado negativo'}
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margem Líquida</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${estatisticas.saldoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {estatisticas.totalEntradas > 0 
                ? Math.round((estatisticas.saldoLiquido / estatisticas.totalEntradas) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Margem sobre receitas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de linha - Evolução diária */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Evolução Diária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dadosGraficoLinha}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dataFormatada" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    name === 'entradas' ? 'Entradas' : name === 'saidas' ? 'Saídas' : 'Saldo'
                  ]}
                />
                <Line type="monotone" dataKey="entradas" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="saidas" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de barras - Comparativo mensal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Comparativo por Período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficoBarras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                    name === 'entradas' ? 'Entradas' : name === 'saidas' ? 'Saídas' : 'Saldo'
                  ]}
                />
                <Bar dataKey="entradas" fill="#10b981" />
                <Bar dataKey="saidas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Distribuição por categoria e lista de transações */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de pizza - Distribuição por categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={dadosGraficoPizza}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="valor"
                  label={({ categoria, percent }) => `${categoria} ${(percent * 100).toFixed(0)}%`}
                >
                  {dadosGraficoPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lista de transações recentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {dadosFiltrados
                .sort((a, b) => new Date(b.data) - new Date(a.data))
                .slice(0, 10)
                .map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {item.tipo === 'entrada' ? (
                        <ArrowUpCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowDownCircle className="h-5 w-5 text-red-600" />
                      )}
                      <div>
                        <div className="font-medium">{item.descricao}</div>
                        <div className="text-sm text-gray-600">
                          {item.categoria} • {item.data.toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${item.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}`}>
                        {item.tipo === 'entrada' ? '+' : '-'}R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                      <Badge variant={item.tipo === 'entrada' ? 'default' : 'destructive'}>
                        {item.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por categoria */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Entradas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(estatisticas.entradasPorCategoria)
                .sort(([,a], [,b]) => b - a)
                .map(([categoria, valor]) => (
                  <div key={categoria} className="flex justify-between items-center">
                    <span className="font-medium">{categoria}</span>
                    <span className="text-green-600 font-bold">
                      R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Saídas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(estatisticas.saidasPorCategoria)
                .sort(([,a], [,b]) => b - a)
                .map(([categoria, valor]) => (
                  <div key={categoria} className="flex justify-between items-center">
                    <span className="font-medium">{categoria}</span>
                    <span className="text-red-600 font-bold">
                      R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default FluxoCaixa;
