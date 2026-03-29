// Service exports — API REST adapters (PostgreSQL backend)

export { getQuartos, onQuartos, addQuarto, updateQuarto, deleteQuarto } from './api/quartos.api';
export { getReservas, onReservas, addReserva, updateReserva, checkoutReserva, cancelarReserva } from './api/reservas.api';
export { getDespesas, onDespesas, addDespesa, updateDespesa, deleteDespesa } from './api/despesas.api';
export { onFluxoCaixa, addFluxoCaixa, getFluxoCaixa } from './api/fluxoCaixa.api';
export { onFaturas, addFatura, updateFatura, deleteFatura } from './api/faturas.api';
export { getUsuarios, onUsuarios, addUsuario, updateUsuario, deleteUsuario } from './api/usuarios.api';
export { onFornecedores, addFornecedor, updateFornecedor, deleteFornecedor } from './api/fornecedores.api';
export { onBancos, addBanco, updateBanco, deleteBanco, seedBancosIniciais } from './api/bancos.api';
export { seedDadosIniciais } from './api/seed.api';
export { getEmpresa, updateEmpresa } from './api/empresa.api';
