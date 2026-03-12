import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HybridHotelContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar, Filter } from 'lucide-react';
import { calcularTaxaOcupacao, coresStatus } from '../data/mockData';

function Disponibilidade() {
  const { quartos, disponibilidade, atualizarStatusQuarto } = useHotel();
  const [dataInicio, setDataInicio] = useState(new Date());
  const [filtroTipo, setFiltroTipo] = useState('todos');

  // Gerar array de datas para exibição (30 dias)
  const datas = useMemo(() => {
    const datasArray = [];
    for (let i = 0; i < 30; i++) {
      const data = new Date(dataInicio);
      data.setDate(dataInicio.getDate() + i);
      datasArray.push(data);
    }
    return datasArray;
  }, [dataInicio]);

  // Filtrar quartos por tipo
  const quartosFiltrados = useMemo(() => {
    if (filtroTipo === 'todos') return quartos;
    return quartos.filter(quarto => quarto.tipo === filtroTipo);
  }, [quartos, filtroTipo]);

  // Navegar entre períodos
  const navegarPeriodo = (direcao) => {
    const novaData = new Date(dataInicio);
    novaData.setDate(dataInicio.getDate() + (direcao * 7)); // Navegar por semanas
    setDataInicio(novaData);
  };

  // Obter status do quarto em uma data específica
  const obterStatusQuarto = (quartoId, data) => {
    const dataStr = data.toISOString().split('T')[0];
    return disponibilidade[dataStr]?.[quartoId] || 'disponivel';
  };

  // Alternar status do quarto (para demonstração)
  const alternarStatusQuarto = (quartoId, data) => {
    const dataStr = data.toISOString().split('T')[0];
    const statusAtual = obterStatusQuarto(quartoId, data);
    
    let novoStatus;
    switch (statusAtual) {
      case 'disponivel':
        novoStatus = 'ocupado';
        break;
      case 'ocupado':
        novoStatus = 'reserva_dupla';
        break;
      case 'reserva_dupla':
        novoStatus = 'disponivel';
        break;
      default:
        novoStatus = 'disponivel';
    }
    
    // Atualizar no contexto (simulação)
    console.log(`Alterando quarto ${quartoId} na data ${dataStr} para ${novoStatus}`);
  };

  // Calcular estatísticas do período
  const estatisticas = useMemo(() => {
    const totalCelulas = datas.length * quartosFiltrados.length;
    let ocupadas = 0;
    let reservasDuplas = 0;

    datas.forEach(data => {
      quartosFiltrados.forEach(quarto => {
        const status = obterStatusQuarto(quarto.id, data);
        if (status === 'ocupado') ocupadas++;
        if (status === 'reserva_dupla') reservasDuplas++;
      });
    });

    return {
      totalCelulas,
      ocupadas,
      reservasDuplas,
      disponiveis: totalCelulas - ocupadas - reservasDuplas,
      taxaOcupacao: Math.round(((ocupadas + reservasDuplas) / totalCelulas) * 100)
    };
  }, [datas, quartosFiltrados, disponibilidade]);

  return (
    <div className="space-y-6 fade-in">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Disponibilidade</h1>
          <p className="text-gray-600 mt-2">Visualização de disponibilidade dos quartos</p>
        </div>
        
        {/* Controles de navegação */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navegarPeriodo(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3">
              {dataInicio.toLocaleDateString('pt-BR')} - {datas[datas.length - 1]?.toLocaleDateString('pt-BR')}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navegarPeriodo(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="form-input w-32"
          >
            <option value="todos">Todos</option>
            <option value="standard">Standard</option>
            <option value="deluxe">Deluxe</option>
            <option value="triplo">Triplo</option>
          </select>
        </div>
      </div>

      {/* Estatísticas do período */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.taxaOcupacao}%</div>
            <p className="text-sm text-gray-600">Taxa de Ocupação</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{estatisticas.disponiveis}</div>
            <p className="text-sm text-gray-600">Disponíveis</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{estatisticas.ocupadas}</div>
            <p className="text-sm text-gray-600">Ocupados</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{estatisticas.reservasDuplas}</div>
            <p className="text-sm text-gray-600">Reservas Duplas</p>
          </CardContent>
        </Card>
      </div>

      {/* Legenda */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legenda</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: coresStatus.disponivel }}></div>
              <span className="text-sm">Disponível</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: coresStatus.ocupado }}></div>
              <span className="text-sm">Não disponível</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded" style={{ backgroundColor: coresStatus.reserva_dupla }}></div>
              <span className="text-sm">Reserva dupla</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de disponibilidade */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              {dataInicio.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })} - {' '}
              {datas[datas.length - 1]?.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
            </CardTitle>
            <div className="text-sm text-gray-600">
              Taxa de Ocupação: {estatisticas.taxaOcupacao}%
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            {/* Cabeçalho com datas */}
            <div className="availability-grid" style={{ gridTemplateColumns: `200px repeat(${datas.length}, minmax(40px, 1fr))` }}>
              {/* Célula vazia para alinhamento */}
              <div className="availability-cell bg-gray-100 font-semibold">
                TIPO DE SUÍTE
              </div>
              
              {/* Datas */}
              {datas.map((data, index) => {
                const taxaDia = calcularTaxaOcupacao(data, disponibilidade);
                return (
                  <div key={index} className="availability-cell bg-yellow-100 flex flex-col text-center">
                    <div className="text-xs font-semibold">
                      {data.toLocaleDateString('pt-BR', { weekday: 'short' })}
                    </div>
                    <div className="text-xs">
                      {data.getDate()}-{data.toLocaleDateString('pt-BR', { month: 'short' })}
                    </div>
                    <div className="text-xs font-bold">
                      {taxaDia}%
                    </div>
                  </div>
                );
              })}

              {/* Linhas de quartos */}
              {quartosFiltrados.map((quarto) => (
                <React.Fragment key={quarto.id}>
                  {/* Informações do quarto */}
                  <div className="availability-cell bg-gray-50 text-left p-2">
                    <div className="font-semibold text-sm">{quarto.numero}</div>
                    <div className="text-xs text-gray-600 capitalize">
                      {quarto.tipo} {quarto.caracteristicas.join(', ')}
                    </div>
                  </div>
                  
                  {/* Status por data */}
                  {datas.map((data, dateIndex) => {
                    const status = obterStatusQuarto(quarto.id, data);
                    return (
                      <div
                        key={`${quarto.id}-${dateIndex}`}
                        className="availability-cell cursor-pointer"
                        style={{ backgroundColor: coresStatus[status] }}
                        onClick={() => alternarStatusQuarto(quarto.id, data)}
                        title={`Quarto ${quarto.numero} - ${data.toLocaleDateString('pt-BR')} - ${status}`}
                      >
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Taxa de ocupação por data */}
      <Card>
        <CardHeader>
          <CardTitle>Taxa de Ocupação por Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {datas.slice(0, 14).map((data, index) => {
              const taxa = calcularTaxaOcupacao(data, disponibilidade);
              return (
                <div key={index} className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-xs text-gray-600">
                    {data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {taxa}%
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Disponibilidade;
