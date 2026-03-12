import React from 'react';
import { useHotel } from '../context/HybridHotelContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays, Users, DollarSign, TrendingUp } from 'lucide-react';

function Dashboard() {
  const { quartos, reservas, fluxoCaixa, disponibilidade } = useHotel();

  // Calcular estatísticas
  const quartosDisponiveis = quartos.filter(q => q.status === 'disponivel').length;
  const quartosOcupados = quartos.filter(q => q.status === 'ocupado').length;
  const taxaOcupacao = Math.round((quartosOcupados / quartos.length) * 100);
  
  const reservasAtivas = reservas.filter(r => r.status === 'em_andamento').length;
  
  const receitaTotal = fluxoCaixa
    .filter(f => f.tipo === 'entrada')
    .reduce((total, f) => total + f.valor, 0);
    
  const despesaTotal = fluxoCaixa
    .filter(f => f.tipo === 'saida')
    .reduce((total, f) => total + f.valor, 0);
    
  const lucroLiquido = receitaTotal - despesaTotal;

  return (
    <div className="space-y-4 lg:space-y-6 fade-in">
      {/* Cabeçalho */}
      <div className="pt-12 lg:pt-0">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base">Visão geral do sistema hoteleiro</p>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{taxaOcupacao}%</div>
            <p className="text-xs text-muted-foreground">
              {quartosOcupados} de {quartos.length} quartos ocupados
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quartos Disponíveis</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{quartosDisponiveis}</div>
            <p className="text-xs text-muted-foreground">
              Prontos para reserva
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{reservasAtivas}</div>
            <p className="text-xs text-muted-foreground">
              Hóspedes atualmente no hotel
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              Receitas - Despesas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Resumo Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Receitas Totais</span>
                <span className="text-green-600 font-bold">
                  R$ {receitaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Despesas Totais</span>
                <span className="text-red-600 font-bold">
                  R$ {despesaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <hr />
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold">Lucro Líquido</span>
                <span className={`font-bold text-lg ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Distribuição de Quartos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['standard', 'deluxe', 'triplo'].map(tipo => {
                const quartosDoTipo = quartos.filter(q => q.tipo === tipo);
                const ocupadosDoTipo = quartosDoTipo.filter(q => q.status === 'ocupado').length;
                const porcentagem = quartosDoTipo.length > 0 
                  ? Math.round((ocupadosDoTipo / quartosDoTipo.length) * 100) 
                  : 0;
                
                return (
                  <div key={tipo} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{tipo}</span>
                      <span>{ocupadosDoTipo}/{quartosDoTipo.length} ({porcentagem}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          tipo === 'standard' ? 'bg-green-500' :
                          tipo === 'deluxe' ? 'bg-red-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${porcentagem}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reservas recentes */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl">Reservas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Versão mobile - Cards */}
          <div className="block lg:hidden space-y-3">
            {reservas.slice(0, 5).map(reserva => (
              <div key={reserva.id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-sm">{reserva.hospede.nome}</div>
                  <span className={`badge text-xs ${
                    reserva.status === 'em_andamento' ? 'badge-success' :
                    reserva.status === 'confirmada' ? 'badge-info' :
                    reserva.status === 'cancelada' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {reserva.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Quarto: {reserva.quartoId}</div>
                  <div>Check-in: {reserva.dataCheckIn.toLocaleDateString('pt-BR')}</div>
                  <div>Check-out: {reserva.dataCheckOut.toLocaleDateString('pt-BR')}</div>
                  <div className="font-medium text-green-600">
                    R$ {reserva.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Versão desktop - Tabela */}
          <div className="hidden lg:block table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Hóspede</th>
                  <th>Quarto</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {reservas.slice(0, 5).map(reserva => (
                  <tr key={reserva.id}>
                    <td className="font-medium">{reserva.hospede.nome}</td>
                    <td>{reserva.quartoId}</td>
                    <td>{reserva.dataCheckIn.toLocaleDateString('pt-BR')}</td>
                    <td>{reserva.dataCheckOut.toLocaleDateString('pt-BR')}</td>
                    <td>
                      <span className={`badge ${
                        reserva.status === 'em_andamento' ? 'badge-success' :
                        reserva.status === 'confirmada' ? 'badge-info' :
                        reserva.status === 'cancelada' ? 'badge-danger' : 'badge-warning'
                      }`}>
                        {reserva.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="font-medium">
                      R$ {reserva.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Dashboard;
