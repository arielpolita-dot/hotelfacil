import { Crown, ShieldCheck, UserCheck, Shield, Settings } from 'lucide-react';

export const roles = [
  { value: 'Admin', label: 'Administrador', icon: Crown, color: 'text-purple-600' },
  { value: 'Gerente', label: 'Gerente', icon: ShieldCheck, color: 'text-blue-600' },
  { value: 'Recepcionista', label: 'Recepcionista', icon: UserCheck, color: 'text-green-600' },
  { value: 'Financeiro', label: 'Financeiro', icon: Shield, color: 'text-orange-600' },
  { value: 'Manutencao', label: 'Manutencao', icon: Settings, color: 'text-gray-600' },
];

export const statusOptions = ['Ativo', 'Inativo', 'Suspenso'];

export const permissoesDisponiveis = [
  { key: 'dashboard', label: 'Dashboard', description: 'Visualizar painel principal' },
  { key: 'disponibilidade', label: 'Disponibilidade', description: 'Ver disponibilidade de quartos' },
  { key: 'quartos', label: 'Quartos', description: 'Cadastrar e gerenciar quartos' },
  { key: 'vendas', label: 'Vendas', description: 'Realizar reservas e vendas' },
  { key: 'faturas', label: 'Faturas', description: 'Gerenciar contratos corporativos' },
  { key: 'despesas', label: 'Despesas', description: 'Cadastrar e gerenciar despesas' },
  { key: 'fluxoCaixa', label: 'Fluxo de Caixa', description: 'Visualizar relatorios financeiros' },
  { key: 'usuarios', label: 'Usuarios', description: 'Gerenciar usuarios do sistema' },
  { key: 'configuracoes', label: 'Configuracoes', description: 'Alterar configuracoes do sistema' },
];

const PERMISSOES_POR_ROLE = {
  Admin: {
    dashboard: true, disponibilidade: true, quartos: true, vendas: true,
    faturas: true, despesas: true, fluxoCaixa: true, usuarios: true, configuracoes: true,
  },
  Gerente: {
    dashboard: true, disponibilidade: true, quartos: true, vendas: true,
    faturas: true, despesas: true, fluxoCaixa: true, usuarios: false, configuracoes: false,
  },
  Recepcionista: {
    dashboard: true, disponibilidade: true, quartos: false, vendas: true,
    faturas: false, despesas: false, fluxoCaixa: false, usuarios: false, configuracoes: false,
  },
  Financeiro: {
    dashboard: true, disponibilidade: false, quartos: false, vendas: false,
    faturas: true, despesas: true, fluxoCaixa: true, usuarios: false, configuracoes: false,
  },
  Manutencao: {
    dashboard: true, disponibilidade: true, quartos: true, vendas: false,
    faturas: false, despesas: true, fluxoCaixa: false, usuarios: false, configuracoes: false,
  },
};

export function getPermissoesPorRole(role) {
  return PERMISSOES_POR_ROLE[role] || PERMISSOES_POR_ROLE.Recepcionista;
}
