import {
  collection,
  doc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { validateId } from '../../utils/validators';
import { getQuartos } from './quartos.firestore';

export async function seedDadosIniciais(empresaId) {
  validateId(empresaId, 'empresaId');
  const quartosExistentes = await getQuartos(empresaId);
  if (quartosExistentes.length > 0) return; // Ja tem dados

  const batch = writeBatch(db);

  const quartosIniciais = [
    { numero: '101', tipo: 'standard', preco: 150, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '102', tipo: 'standard', preco: 150, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '103', tipo: 'standard', preco: 150, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '104', tipo: 'standard', preco: 150, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '105', tipo: 'standard', preco: 150, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '201', tipo: 'deluxe', preco: 250, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda'] },
    { numero: '202', tipo: 'deluxe', preco: 250, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda'] },
    { numero: '203', tipo: 'deluxe', preco: 250, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda'] },
    { numero: '204', tipo: 'deluxe', preco: 250, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda'] },
    { numero: '301', tipo: 'suite', preco: 400, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda', 'Banheira'] },
    { numero: '302', tipo: 'suite', preco: 400, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi', 'Frigobar', 'Varanda', 'Banheira'] },
    { numero: '401', tipo: 'triplo', preco: 300, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
    { numero: '402', tipo: 'triplo', preco: 300, status: 'disponivel', caracteristicas: ['Ar condicionado', 'TV', 'WiFi'] },
  ];

  quartosIniciais.forEach(q => {
    const ref = doc(collection(db, 'empresas', empresaId, 'quartos'));
    batch.set(ref, { ...q, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() });
  });

  await batch.commit();
}
