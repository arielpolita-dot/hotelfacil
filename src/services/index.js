// Re-export all services from firestore adapters
// When migrating to Postgres, change these imports to ./api/ adapters

export { getQuartos, onQuartos, addQuarto, updateQuarto, deleteQuarto } from './firestore/quartos.firestore';
export { getReservas, onReservas, addReserva, updateReserva, checkoutReserva, cancelarReserva } from './firestore/reservas.firestore';
export { getDespesas, onDespesas, addDespesa, updateDespesa, deleteDespesa } from './firestore/despesas.firestore';
export { onFluxoCaixa, addFluxoCaixa, getFluxoCaixa } from './firestore/fluxoCaixa.firestore';
export { onFaturas, addFatura, updateFatura, deleteFatura } from './firestore/faturas.firestore';
export { getUsuarios, onUsuarios, addUsuario, updateUsuario, deleteUsuario } from './firestore/usuarios.firestore';
export { onFornecedores, addFornecedor, updateFornecedor, deleteFornecedor } from './firestore/fornecedores.firestore';
export { onBancos, addBanco, updateBanco, deleteBanco, seedBancosIniciais } from './firestore/bancos.firestore';
export { seedDadosIniciais } from './firestore/seed.firestore';
export { getEmpresa, updateEmpresa } from './firestore/empresa.firestore';
