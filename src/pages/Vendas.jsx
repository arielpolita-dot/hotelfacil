import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HybridHotelContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Phone, 
  Mail, 
  CreditCard,
  MapPin,
  Star
} from 'lucide-react';
import { coresQuartos } from '../data/mockData';

function Vendas() {
  const { quartos, reservas, adicionarReserva } = useHotel();
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [busca, setBusca] = useState('');
  const [modalReserva, setModalReserva] = useState(false);
  const [quartoSelecionado, setQuartoSelecionado] = useState(null);
  const [dadosReserva, setDadosReserva] = useState({
    hospede: {
      nome: '',
      email: '',
      telefone: '',
      documento: ''
    },
    dataCheckIn: '',
    dataCheckOut: '',
    observacoes: ''
  });

  // Filtrar quartos disponíveis
  const quartosDisponiveis = useMemo(() => {
    return quartos.filter(quarto => {
      const matchStatus = filtroStatus === 'todos' || quarto.status === filtroStatus;
      const matchTipo = filtroTipo === 'todos' || quarto.tipo === filtroTipo;
      const matchBusca = busca === '' || 
        quarto.numero.toLowerCase().includes(busca.toLowerCase()) ||
        quarto.tipo.toLowerCase().includes(busca.toLowerCase());
      
      return matchStatus && matchTipo && matchBusca;
    });
  }, [quartos, filtroStatus, filtroTipo, busca]);

  // Obter cor do card baseada no tipo de quarto
  const obterCorQuarto = (tipo) => {
    switch (tipo) {
      case 'standard':
        return 'from-green-500 to-green-600';
      case 'deluxe':
        return 'from-red-500 to-red-600';
      case 'triplo':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  // Obter badge de status
  const obterBadgeStatus = (status) => {
    const configs = {
      disponivel: { variant: 'default', label: 'Disponível', className: 'bg-green-100 text-green-800' },
      ocupado: { variant: 'destructive', label: 'Ocupado', className: 'bg-red-100 text-red-800' },
      manutencao: { variant: 'secondary', label: 'Manutenção', className: 'bg-gray-100 text-gray-800' },
      reserva_dupla: { variant: 'outline', label: 'Reserva Dupla', className: 'bg-yellow-100 text-yellow-800' }
    };
    
    return configs[status] || configs.disponivel;
  };

  // Abrir modal de reserva
  const abrirModalReserva = (quarto) => {
    setQuartoSelecionado(quarto);
    setModalReserva(true);
  };

  // Fechar modal e limpar dados
  const fecharModal = () => {
    setModalReserva(false);
    setQuartoSelecionado(null);
    setDadosReserva({
      hospede: { nome: '', email: '', telefone: '', documento: '' },
      dataCheckIn: '',
      dataCheckOut: '',
      observacoes: ''
    });
  };

  // Calcular valor da reserva
  const calcularValorReserva = () => {
    if (!quartoSelecionado || !dadosReserva.dataCheckIn || !dadosReserva.dataCheckOut) {
      return 0;
    }
    
    const checkIn = new Date(dadosReserva.dataCheckIn);
    const checkOut = new Date(dadosReserva.dataCheckOut);
    const diarias = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return diarias > 0 ? diarias * quartoSelecionado.preco : 0;
  };

  // Confirmar reserva
  const confirmarReserva = () => {
    if (!quartoSelecionado || !dadosReserva.hospede.nome || !dadosReserva.dataCheckIn || !dadosReserva.dataCheckOut) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const novaReserva = {
      id: `res${Date.now()}`,
      quartoId: quartoSelecionado.id,
      hospede: {
        id: `hosp${Date.now()}`,
        ...dadosReserva.hospede
      },
      dataCheckIn: new Date(dadosReserva.dataCheckIn),
      dataCheckOut: new Date(dadosReserva.dataCheckOut),
      status: 'confirmada',
      valor: calcularValorReserva(),
      dataCriacao: new Date(),
      observacoes: dadosReserva.observacoes
    };

    adicionarReserva(novaReserva);
    fecharModal();
    alert('Reserva criada com sucesso!');
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Cabeçalho */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vendas e Reservas</h1>
          <p className="text-gray-600 mt-2">Gestão de vendas e reservas de quartos</p>
        </div>
        
        <Button onClick={() => setModalReserva(true)} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nova Reserva
        </Button>
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
                  placeholder="Buscar por número ou tipo de quarto..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="form-input pl-10"
                />
              </div>
            </div>
            
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="form-input w-40"
            >
              <option value="todos">Todos Status</option>
              <option value="disponivel">Disponível</option>
              <option value="ocupado">Ocupado</option>
              <option value="manutencao">Manutenção</option>
            </select>
            
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="form-input w-32"
            >
              <option value="todos">Todos Tipos</option>
              <option value="standard">Standard</option>
              <option value="deluxe">Deluxe</option>
              <option value="triplo">Triplo</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Grid de quartos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {quartosDisponiveis.map((quarto) => {
          const badgeConfig = obterBadgeStatus(quarto.status);
          
          return (
            <Card key={quarto.id} className="room-card-container overflow-hidden card-hover">
              <div className={`h-32 bg-gradient-to-br ${obterCorQuarto(quarto.tipo)} flex items-center justify-center text-white relative`}>
                <div className="text-center">
                  <div className="text-3xl font-bold">QUARTO {quarto.numero}</div>
                  <div className="text-sm opacity-90 capitalize">{quarto.tipo}</div>
                </div>
                
                <div className="absolute top-3 right-3">
                  <Badge className={badgeConfig.className}>
                    {badgeConfig.label}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Características:</span>
                    <div className="flex items-center space-x-1">
                      {quarto.caracteristicas.map((carac, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {carac}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Preço por diária:</span>
                    <span className="text-lg font-bold text-green-600">
                      R$ {quarto.preco.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-yellow-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  
                  <Button 
                    className="w-full mt-4"
                    onClick={() => abrirModalReserva(quarto)}
                    disabled={quarto.status !== 'disponivel'}
                    variant={quarto.status === 'disponivel' ? 'default' : 'secondary'}
                  >
                    {quarto.status === 'disponivel' ? 'Reservar' : 'Indisponível'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Estatísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {quartos.filter(q => q.status === 'disponivel').length}
            </div>
            <p className="text-sm text-gray-600">Quartos Disponíveis</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {quartos.filter(q => q.status === 'ocupado').length}
            </div>
            <p className="text-sm text-gray-600">Quartos Ocupados</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {reservas.filter(r => r.status === 'confirmada').length}
            </div>
            <p className="text-sm text-gray-600">Reservas Confirmadas</p>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              R$ {reservas.reduce((total, r) => total + r.valor, 0).toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-gray-600">Receita Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Nova Reserva */}
      <Dialog open={modalReserva} onOpenChange={setModalReserva}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {quartoSelecionado ? `Nova Reserva - Quarto ${quartoSelecionado.numero}` : 'Nova Reserva'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Informações do quarto */}
            {quartoSelecionado && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Quarto {quartoSelecionado.numero}</h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {quartoSelecionado.tipo} - {quartoSelecionado.caracteristicas.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        R$ {quartoSelecionado.preco.toLocaleString('pt-BR')}/diária
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Dados do hóspede */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <User className="h-5 w-5 mr-2" />
                Dados do Hóspede
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Nome Completo *</label>
                  <input
                    type="text"
                    value={dadosReserva.hospede.nome}
                    onChange={(e) => setDadosReserva({
                      ...dadosReserva,
                      hospede: { ...dadosReserva.hospede, nome: e.target.value }
                    })}
                    className="form-input"
                    placeholder="Nome do hóspede"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    value={dadosReserva.hospede.email}
                    onChange={(e) => setDadosReserva({
                      ...dadosReserva,
                      hospede: { ...dadosReserva.hospede, email: e.target.value }
                    })}
                    className="form-input"
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Telefone</label>
                  <input
                    type="tel"
                    value={dadosReserva.hospede.telefone}
                    onChange={(e) => setDadosReserva({
                      ...dadosReserva,
                      hospede: { ...dadosReserva.hospede, telefone: e.target.value }
                    })}
                    className="form-input"
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Documento</label>
                  <input
                    type="text"
                    value={dadosReserva.hospede.documento}
                    onChange={(e) => setDadosReserva({
                      ...dadosReserva,
                      hospede: { ...dadosReserva.hospede, documento: e.target.value }
                    })}
                    className="form-input"
                    placeholder="CPF ou RG"
                  />
                </div>
              </div>
            </div>
            
            {/* Datas da reserva */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Período da Reserva
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Check-in *</label>
                  <input
                    type="date"
                    value={dadosReserva.dataCheckIn}
                    onChange={(e) => setDadosReserva({
                      ...dadosReserva,
                      dataCheckIn: e.target.value
                    })}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Check-out *</label>
                  <input
                    type="date"
                    value={dadosReserva.dataCheckOut}
                    onChange={(e) => setDadosReserva({
                      ...dadosReserva,
                      dataCheckOut: e.target.value
                    })}
                    className="form-input"
                    min={dadosReserva.dataCheckIn || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
            
            {/* Observações */}
            <div className="form-group">
              <label className="form-label">Observações</label>
              <textarea
                value={dadosReserva.observacoes}
                onChange={(e) => setDadosReserva({
                  ...dadosReserva,
                  observacoes: e.target.value
                })}
                className="form-input"
                rows="3"
                placeholder="Observações adicionais sobre a reserva..."
              />
            </div>
            
            {/* Resumo do valor */}
            {calcularValorReserva() > 0 && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Valor Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      R$ {calcularValorReserva().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Botões de ação */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={fecharModal}>
                Cancelar
              </Button>
              <Button onClick={confirmarReserva} className="bg-green-600 hover:bg-green-700">
                <CreditCard className="h-4 w-4 mr-2" />
                Confirmar Reserva
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Vendas;
