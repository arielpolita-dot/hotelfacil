// Service adapter factory
// Set VITE_USE_API=true in .env.local to switch from Firestore to Postgres backend

const USE_API = import.meta.env.VITE_USE_API === 'true';

// --- API adapters ---
import * as apiQuartos from './api/quartos.api';
import * as apiReservas from './api/reservas.api';
import * as apiDespesas from './api/despesas.api';
import * as apiFluxoCaixa from './api/fluxoCaixa.api';
import * as apiFaturas from './api/faturas.api';
import * as apiUsuarios from './api/usuarios.api';
import * as apiFornecedores from './api/fornecedores.api';
import * as apiBancos from './api/bancos.api';
import * as apiSeed from './api/seed.api';
import * as apiEmpresa from './api/empresa.api';

// --- Firestore adapters ---
import * as fsQuartos from './firestore/quartos.firestore';
import * as fsReservas from './firestore/reservas.firestore';
import * as fsDespesas from './firestore/despesas.firestore';
import * as fsFluxoCaixa from './firestore/fluxoCaixa.firestore';
import * as fsFaturas from './firestore/faturas.firestore';
import * as fsUsuarios from './firestore/usuarios.firestore';
import * as fsFornecedores from './firestore/fornecedores.firestore';
import * as fsBancos from './firestore/bancos.firestore';
import * as fsSeed from './firestore/seed.firestore';
import * as fsEmpresa from './firestore/empresa.firestore';

// Pick adapter based on env var
const q = USE_API ? apiQuartos : fsQuartos;
const r = USE_API ? apiReservas : fsReservas;
const d = USE_API ? apiDespesas : fsDespesas;
const fc = USE_API ? apiFluxoCaixa : fsFluxoCaixa;
const ft = USE_API ? apiFaturas : fsFaturas;
const u = USE_API ? apiUsuarios : fsUsuarios;
const fo = USE_API ? apiFornecedores : fsFornecedores;
const b = USE_API ? apiBancos : fsBancos;
const s = USE_API ? apiSeed : fsSeed;
const e = USE_API ? apiEmpresa : fsEmpresa;

// Quartos
export const getQuartos = q.getQuartos;
export const onQuartos = q.onQuartos;
export const addQuarto = q.addQuarto;
export const updateQuarto = q.updateQuarto;
export const deleteQuarto = q.deleteQuarto;

// Reservas
export const getReservas = r.getReservas;
export const onReservas = r.onReservas;
export const addReserva = r.addReserva;
export const updateReserva = r.updateReserva;
export const checkoutReserva = r.checkoutReserva;
export const cancelarReserva = r.cancelarReserva;

// Despesas
export const getDespesas = d.getDespesas;
export const onDespesas = d.onDespesas;
export const addDespesa = d.addDespesa;
export const updateDespesa = d.updateDespesa;
export const deleteDespesa = d.deleteDespesa;

// Fluxo de Caixa
export const onFluxoCaixa = fc.onFluxoCaixa;
export const addFluxoCaixa = fc.addFluxoCaixa;
export const getFluxoCaixa = fc.getFluxoCaixa;

// Faturas
export const onFaturas = ft.onFaturas;
export const addFatura = ft.addFatura;
export const updateFatura = ft.updateFatura;
export const deleteFatura = ft.deleteFatura;

// Usuarios
export const getUsuarios = u.getUsuarios;
export const onUsuarios = u.onUsuarios;
export const addUsuario = u.addUsuario;
export const updateUsuario = u.updateUsuario;
export const deleteUsuario = u.deleteUsuario;

// Fornecedores
export const onFornecedores = fo.onFornecedores;
export const addFornecedor = fo.addFornecedor;
export const updateFornecedor = fo.updateFornecedor;
export const deleteFornecedor = fo.deleteFornecedor;

// Bancos
export const onBancos = b.onBancos;
export const addBanco = b.addBanco;
export const updateBanco = b.updateBanco;
export const deleteBanco = b.deleteBanco;
export const seedBancosIniciais = b.seedBancosIniciais;

// Seed
export const seedDadosIniciais = s.seedDadosIniciais;

// Empresa
export const getEmpresa = e.getEmpresa;
export const updateEmpresa = e.updateEmpresa;
