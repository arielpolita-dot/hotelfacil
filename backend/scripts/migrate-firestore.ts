import * as admin from 'firebase-admin';
import { Client } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';

// Initialize Firebase Admin
// Service account key must be at backend/scripts/serviceAccountKey.json
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const firestore = admin.firestore();

// PostgreSQL connection
const pg = new Client({
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'hotelfacil',
  user: process.env.DATABASE_USER || 'hotelfacil',
  password: process.env.DATABASE_PASSWORD || 'hotelfacil_dev_2026',
});

// ID mapping: firestoreId -> postgresUUID
const idMap: Record<string, string> = {};

function mapId(firestoreId: string): string {
  if (!idMap[firestoreId]) {
    idMap[firestoreId] = uuidv4();
  }
  return idMap[firestoreId];
}

function toDate(val: any): Date | null {
  if (!val) return null;
  if (val.toDate) return val.toDate();
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

async function migrateUsuarios() {
  console.log('Migrating usuarios...');
  const snap = await firestore.collection('usuarios').get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const id = mapId(doc.id);
    const tempHash = await bcrypt.hash('TempPass2026!', 12);
    await pg.query(
      `INSERT INTO usuarios (id, nome, email, senha_hash, telefone, role, status, is_super_admin, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (email) DO NOTHING`,
      [
        id,
        d.nome || 'Usuario',
        d.email,
        tempHash,
        d.telefone || null,
        d.role || 'Recepcionista',
        d.status || 'Ativo',
        d.isAdmin || false,
        toDate(d.criadoEm) || new Date(),
      ],
    );
    count++;
  }
  console.log(`  -> ${count} usuarios migrated`);
}

async function migrateEmpresas() {
  console.log('Migrating empresas...');
  const snap = await firestore.collection('empresas').get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const id = mapId(doc.id);
    const proprietarioId = d.proprietario ? mapId(d.proprietario) : null;

    await pg.query(
      `INSERT INTO empresas (id, nome, cnpj, telefone, endereco, proprietario_id, ativo, status_pagamento, data_inicio, dias_trial, valor_mensal, data_pagamento, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (id) DO NOTHING`,
      [
        id,
        d.nome || 'Empresa',
        d.cnpj || null,
        d.telefone || null,
        d.endereco || null,
        proprietarioId,
        d.ativo !== false,
        d.statusPagamento || 'trial',
        toDate(d.dataInicio) || new Date(),
        d.diasTrial || 3,
        d.valorMensal || 99.9,
        toDate(d.dataPagamento),
        toDate(d.criadoEm) || new Date(),
      ],
    );

    // Create empresa_usuarios entries
    const usuarios = d.usuarios || [];
    for (const uid of usuarios) {
      const euId = uuidv4();
      const usuarioId = mapId(uid);
      await pg.query(
        `INSERT INTO empresa_usuarios (id, empresa_id, usuario_id, role, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (empresa_id, usuario_id) DO NOTHING`,
        [euId, id, usuarioId, 'Admin'],
      );

      // Create default permissions
      const permId = uuidv4();
      await pg.query(
        `INSERT INTO permissoes (id, empresa_usuario_id, dashboard, disponibilidade, quartos, vendas, faturas, despesas, fluxo_caixa, usuarios, configuracoes)
         VALUES ($1, $2, true, true, true, true, true, true, true, true, true)
         ON CONFLICT (empresa_usuario_id) DO NOTHING`,
        [permId, euId],
      );
    }
    count++;
  }
  console.log(`  -> ${count} empresas migrated`);
}

async function migrateSubcollection(
  empresaFirestoreId: string,
  empresaPgId: string,
  subcollection: string,
  tableName: string,
  mapFn: (data: any, id: string) => any[],
) {
  const snap = await firestore
    .collection('empresas')
    .doc(empresaFirestoreId)
    .collection(subcollection)
    .get();
  let count = 0;
  for (const doc of snap.docs) {
    const d = doc.data();
    const id = mapId(doc.id);
    const values = mapFn(d, id);
    if (values) {
      const placeholders = values
        .map((_, i) => `$${i + 1}`)
        .join(', ');
      try {
        await pg.query(
          `INSERT INTO ${tableName} VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`,
          values,
        );
        count++;
      } catch (err: any) {
        console.error(`  Error in ${tableName}: ${err.message}`, {
          docId: doc.id,
        });
      }
    }
  }
  return count;
}

async function migrateAllSubcollections() {
  const empresas = await firestore.collection('empresas').get();

  for (const empDoc of empresas.docs) {
    const empId = mapId(empDoc.id);
    console.log(
      `\nMigrating subcollections for empresa ${empDoc.data().nome}...`,
    );

    // Bancos
    let count = await migrateSubcollection(
      empDoc.id,
      empId,
      'bancos',
      'bancos',
      (d, id) => [
        id, empId, d.nome, d.codigo || null, d.agencia || null,
        d.conta || null, toDate(d.criadoEm) || new Date(),
        toDate(d.atualizadoEm) || new Date(),
      ],
    );
    console.log(`  -> ${count} bancos`);

    // Fornecedores
    count = await migrateSubcollection(
      empDoc.id,
      empId,
      'fornecedores',
      'fornecedores',
      (d, id) => [
        id, empId, d.nome || 'Fornecedor', d.cnpj || null,
        d.email || null, d.telefone || null,
        toDate(d.criadoEm) || new Date(),
        toDate(d.atualizadoEm) || new Date(),
      ],
    );
    console.log(`  -> ${count} fornecedores`);

    // Quartos
    count = await migrateSubcollection(
      empDoc.id,
      empId,
      'quartos',
      'quartos',
      (d, id) => [
        id, empId, d.numero || 0, d.tipo || 'standard',
        d.andar || null, d.capacidade || 2,
        d.precoDiaria || d.preco || 0, d.status || 'disponivel',
        d.descricao || null, d.caracteristicas || '{}',
        d.imagens || '{}', d.manutencaoInicio || null,
        d.manutencaoFim || null, toDate(d.criadoEm) || new Date(),
        toDate(d.atualizadoEm) || new Date(),
      ],
    );
    console.log(`  -> ${count} quartos`);

    // Reservas
    count = await migrateSubcollection(
      empDoc.id,
      empId,
      'reservas',
      'reservas',
      (d, id) => {
        const quartoId = d.quartoId ? mapId(d.quartoId) : null;
        const bancoId = d.bancoId ? mapId(d.bancoId) : null;
        return [
          id, empId, quartoId, d.numeroQuarto || null,
          d.nomeHospede || 'Hospede', d.email || null,
          d.telefone || null, d.cpf || null,
          d.adultos || 1, d.criancas || 0,
          toDate(d.dataCheckIn) || new Date(),
          toDate(d.dataCheckOut) || new Date(),
          d.valorTotal || 0, d.valorExtra || 0, d.desconto || 0,
          d.formaPagamento || 'a_definir', d.status || 'confirmada',
          d.dataPagamento || null, bancoId, d.observacoes || null,
          d.faturado?.cnpj || null, d.faturado?.empresa || null,
          d.faturado?.contato || null, d.faturado?.endereco || null,
          toDate(d.criadoEm) || new Date(),
          toDate(d.atualizadoEm) || new Date(),
        ];
      },
    );
    console.log(`  -> ${count} reservas`);

    // Despesas
    count = await migrateSubcollection(
      empDoc.id,
      empId,
      'despesas',
      'despesas',
      (d, id) => [
        id, empId, d.categoria || 'Outros', d.descricao || '',
        d.valor || 0, toDate(d.data) || new Date(),
        d.status || 'pendente', d.fornecedor || null,
        d.observacoes || null, toDate(d.criadoEm) || new Date(),
        toDate(d.atualizadoEm) || new Date(),
      ],
    );
    console.log(`  -> ${count} despesas`);

    // FluxoCaixa
    count = await migrateSubcollection(
      empDoc.id,
      empId,
      'fluxoCaixa',
      'fluxo_caixa',
      (d, id) => {
        const reservaId = d.reservaId ? mapId(d.reservaId) : null;
        const despesaId = d.despesaId ? mapId(d.despesaId) : null;
        return [
          id, empId, d.tipo || 'entrada', d.categoria || '',
          d.descricao || '', d.valor || 0,
          toDate(d.data) || new Date(), reservaId, despesaId,
          d.metodo_pagamento || null, d.status || null,
          toDate(d.criadoEm) || new Date(),
        ];
      },
    );
    console.log(`  -> ${count} fluxoCaixa`);

    // Faturas
    count = await migrateSubcollection(
      empDoc.id,
      empId,
      'faturas',
      'faturas',
      (d, id) => [
        id, empId, d.empresaCliente || '', d.cnpj || null,
        d.contato || null, d.email || null, d.telefone || null,
        d.endereco || null, d.tipoContrato || 'Mensal',
        toDate(d.dataInicio) || new Date(),
        toDate(d.dataFim) || new Date(),
        d.periodicidadeFatura || 'Mensal',
        d.valorMensal || 0, d.valorTotal || 0,
        d.quartosInclusos || '{}', d.status || 'Ativo',
        toDate(d.proximaFatura) || null,
        d.faturasPendentes || 0, d.observacoes || null,
        toDate(d.criadoEm) || new Date(),
        toDate(d.atualizadoEm) || new Date(),
      ],
    );
    console.log(`  -> ${count} faturas`);

    // Usuarios (subcollection under empresa)
    const usrSnap = await firestore
      .collection('empresas')
      .doc(empDoc.id)
      .collection('usuarios')
      .get();
    let usrCount = 0;
    for (const usrDoc of usrSnap.docs) {
      const d = usrDoc.data();
      const userId = mapId(usrDoc.id);
      const tempHash = await bcrypt.hash('TempPass2026!', 12);
      await pg.query(
        `INSERT INTO usuarios (id, nome, email, senha_hash, telefone, role, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (email) DO UPDATE SET nome = EXCLUDED.nome`,
        [
          userId,
          d.nome || 'Usuario',
          d.email || `user_${usrDoc.id}@temp.com`,
          tempHash,
          d.telefone || null,
          d.role || 'Recepcionista',
          d.status || 'Ativo',
          toDate(d.criadoEm) || new Date(),
        ],
      );

      // Create empresa_usuario link
      const euId = uuidv4();
      await pg.query(
        `INSERT INTO empresa_usuarios (id, empresa_id, usuario_id, role, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         ON CONFLICT (empresa_id, usuario_id) DO NOTHING`,
        [euId, empId, userId, d.role || d.acesso?.funcao || 'Recepcionista'],
      );

      // Create permissions
      const perms = d.permissoes || {};
      const permId = uuidv4();
      await pg.query(
        `INSERT INTO permissoes (id, empresa_usuario_id, dashboard, disponibilidade, quartos, vendas, faturas, despesas, fluxo_caixa, usuarios, configuracoes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (empresa_usuario_id) DO NOTHING`,
        [
          permId, euId,
          perms.dashboard !== false, perms.disponibilidade !== false,
          perms.quartos || false, perms.vendas || false,
          perms.faturas || false, perms.despesas || false,
          perms.fluxoCaixa || false, perms.usuarios || false,
          perms.configuracoes || false,
        ],
      );
      usrCount++;
    }
    console.log(`  -> ${usrCount} empresa usuarios`);
  }
}

async function validateCounts() {
  console.log('\n=== VALIDATION ===');
  const tables = [
    'usuarios', 'empresas', 'empresa_usuarios', 'permissoes',
    'quartos', 'reservas', 'despesas', 'fluxo_caixa', 'faturas',
    'fornecedores', 'bancos',
  ];
  for (const table of tables) {
    const result = await pg.query(`SELECT COUNT(*) FROM ${table}`);
    console.log(`  ${table}: ${result.rows[0].count} rows`);
  }

  // Check referential integrity
  const orphanReservas = await pg.query(
    `SELECT COUNT(*) FROM reservas r
     LEFT JOIN quartos q ON r.quarto_id = q.id
     WHERE r.quarto_id IS NOT NULL AND q.id IS NULL`,
  );
  console.log(
    `  Orphan reservas (no quarto): ${orphanReservas.rows[0].count}`,
  );

  const orphanFluxo = await pg.query(
    `SELECT COUNT(*) FROM fluxo_caixa fc
     LEFT JOIN reservas r ON fc.reserva_id = r.id
     WHERE fc.reserva_id IS NOT NULL AND r.id IS NULL`,
  );
  console.log(
    `  Orphan fluxo_caixa (no reserva): ${orphanFluxo.rows[0].count}`,
  );
}

async function main() {
  console.log('=== HotelFacil: Firestore -> PostgreSQL Migration ===\n');

  await pg.connect();
  console.log('Connected to PostgreSQL\n');

  try {
    await pg.query('BEGIN');

    await migrateUsuarios();
    await migrateEmpresas();
    await migrateAllSubcollections();

    await pg.query('COMMIT');
    console.log('\nMigration committed successfully!');

    await validateCounts();
  } catch (error) {
    await pg.query('ROLLBACK');
    console.error('\nMigration failed, rolled back:', error);
    throw error;
  } finally {
    await pg.end();
  }
}

main().catch(console.error);
