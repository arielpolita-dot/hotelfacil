/**
 * Demo seed generator — emits a single transactional SQL script to stdout.
 *
 * Usage (from project root):
 *   npx ts-node backend/scripts/seed-demo/main.ts \
 *     | ssh root@178.156.220.246 \
 *         'docker exec -i j10091rlz24bbq717necpte1 psql -U ohospedeiro -d ohospedeiro -v ON_ERROR_STOP=1'
 *
 * Idempotent: wipes existing data for the target empresa, then inserts fresh demo set.
 * Target: empresa "Efix Consultoria" (id 9246d614-...) owned by Ariel.
 */

import * as bcrypt from 'bcrypt';
import { buildFornecedores, buildQuartos, buildHospedes, buildReservas, buildDespesas, buildFaturas, buildUsuarios, buildFluxoCaixa, Ctx } from './builders';
import { setSeed, sql } from './utils';

const EMPRESA_ID = '9246d614-427c-47d5-8e89-e5772c944c2d';
const ARIEL_ID = 'ea6ae4e2-dded-41e3-97c2-322e703270c5';
const SENHA_DEMO = 'DemoHotel2026!';

const COUNTS = { hospedes: 60, reservas: 80, despesas: 50, faturas: 40 };

function emit(s: string) { process.stdout.write(s + '\n'); }

async function main() {
  setSeed(20260512);

  const senhaHashDemo = await bcrypt.hash(SENHA_DEMO, 12);

  // Header
  emit('-- Hotel Facil demo seed — generated ' + new Date().toISOString());
  emit('-- Target empresa: ' + EMPRESA_ID + ' (Efix Consultoria, owned by Ariel)');
  emit('SET search_path = public;');
  emit('SET client_min_messages = WARNING;');
  emit('BEGIN;');
  emit('');

  // 2. Wipe existing demo data for this empresa (in FK-safe order).
  emit('-- Wipe existing data for idempotency');
  emit(`DELETE FROM fluxo_caixa WHERE empresa_id = ${sql(EMPRESA_ID)};`);
  emit(`DELETE FROM reservas WHERE empresa_id = ${sql(EMPRESA_ID)};`);
  emit(`DELETE FROM despesas WHERE empresa_id = ${sql(EMPRESA_ID)};`);
  emit(`DELETE FROM faturas WHERE empresa_id = ${sql(EMPRESA_ID)};`);
  emit(`DELETE FROM hospedes WHERE empresa_id = ${sql(EMPRESA_ID)};`);
  emit(`DELETE FROM fornecedores WHERE empresa_id = ${sql(EMPRESA_ID)};`);
  emit(`DELETE FROM quartos WHERE empresa_id = ${sql(EMPRESA_ID)};`);
  emit(`DELETE FROM permissoes WHERE empresa_usuario_id IN (SELECT id FROM empresa_usuarios WHERE empresa_id = ${sql(EMPRESA_ID)} AND usuario_id != ${sql(ARIEL_ID)});`);
  emit(`DELETE FROM empresa_usuarios WHERE empresa_id = ${sql(EMPRESA_ID)} AND usuario_id != ${sql(ARIEL_ID)};`);
  emit(`DELETE FROM usuarios WHERE email LIKE '%@efixconsultoria.demo';`);
  emit('');

  // Build all data in-memory. All reservas.banco_id start NULL — a post-INSERT
  // UPDATE distributes real banco IDs round-robin across electronic-payment reservas.
  const ctx: Ctx = { empresaId: EMPRESA_ID, arielId: ARIEL_ID };

  const fornec = buildFornecedores(ctx);
  const quartos = buildQuartos(ctx);
  const hospedes = buildHospedes(ctx, COUNTS.hospedes);
  const reservas = buildReservas(ctx, quartos.ids, hospedes.ids, COUNTS.reservas);
  const despesas = buildDespesas(ctx, COUNTS.despesas);
  const faturas = buildFaturas(ctx, COUNTS.faturas);
  const usuarios = buildUsuarios(ctx, senhaHashDemo);
  const fluxo = buildFluxoCaixa(ctx, reservas.receitaPorReserva, despesas.pagamentos);

  // 4. Emit INSERTs.
  emitInsert('fornecedores', '(id, empresa_id, nome, cnpj, email, telefone, tipo, cpf, contato, endereco, cidade, estado, cep, observacoes, created_at, updated_at)', fornec.rows.map(r => r.values));
  emitInsert('quartos', '(id, empresa_id, numero, tipo, andar, capacidade, preco_diaria, status, descricao, caracteristicas, imagens, manutencao_inicio, manutencao_fim, created_at, updated_at)', quartos.rows.map(r => r.values));
  emitInsert('hospedes', '(id, empresa_id, codigo, nome, cpf, email, telefone, endereco, cidade, estado, cep, observacoes, total_reservas, created_at, updated_at)', hospedes.rows.map(r => r.values));
  emitInsert('reservas', '(id, empresa_id, quarto_id, numero_quarto, nome_hospede, email, telefone, cpf, adultos, criancas, data_checkin, data_checkout, valor_total, valor_extra, desconto, forma_pagamento, status, data_pagamento, banco_id, observacoes, faturado_cnpj, faturado_empresa, faturado_contato, faturado_endereco, hospede_id, created_at, updated_at)', reservas.rows.map(r => r.values));
  emitInsert('despesas', '(id, empresa_id, categoria, descricao, valor, data, status, fornecedor, observacoes, created_at, updated_at)', despesas.rows.map(r => r.values));
  emitInsert('faturas', '(id, empresa_id, empresa_cliente, cnpj, contato, email, telefone, endereco, tipo_contrato, data_inicio, data_fim, periodicidade_fatura, valor_mensal, valor_total, quartos_inclusos, status, proxima_fatura, faturas_pendentes, observacoes, created_at, updated_at)', faturas.rows.map(r => r.values));

  emitInsert('usuarios', '(id, created_at, updated_at, nome, email, senha_hash, telefone, role, status, observacoes, is_super_admin)', usuarios.usuariosRows.map(r => r.values));
  emitInsert('empresa_usuarios', '(id, empresa_id, usuario_id, role, created_at)', usuarios.empresaUsuariosRows.map(r => r.values));
  emitInsert('permissoes', '(id, empresa_usuario_id, dashboard, disponibilidade, quartos, vendas, faturas, despesas, fluxo_caixa, usuarios, configuracoes)', usuarios.permissoesRows.map(r => r.values));

  emitInsert('fluxo_caixa', '(id, empresa_id, tipo, categoria, descricao, valor, data, reserva_id, despesa_id, metodo_pagamento, status, created_at)', fluxo.map(r => r.values));

  // Distribute existing banco IDs round-robin across paid electronic-payment reservas.
  emit('');
  emit('-- Assign banco IDs round-robin to paid electronic-payment reservas');
  emit(`WITH eligible AS (`);
  emit(`  SELECT r.id, ROW_NUMBER() OVER (ORDER BY r.data_checkin) AS rn`);
  emit(`  FROM reservas r`);
  emit(`  WHERE r.empresa_id = ${sql(EMPRESA_ID)}`);
  emit(`    AND r.data_pagamento IS NOT NULL`);
  emit(`    AND r.forma_pagamento IN ('pix','cartao_credito','cartao_debito','transferencia')`);
  emit(`),`);
  emit(`bancos_emp AS (`);
  emit(`  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS idx,`);
  emit(`         (SELECT COUNT(*) FROM bancos WHERE empresa_id = ${sql(EMPRESA_ID)}) AS total`);
  emit(`  FROM bancos WHERE empresa_id = ${sql(EMPRESA_ID)}`);
  emit(`)`);
  emit(`UPDATE reservas r SET banco_id = b.id`);
  emit(`FROM eligible e, bancos_emp b`);
  emit(`WHERE r.id = e.id AND b.total > 0 AND b.idx = (e.rn - 1) % b.total;`);
  emit('');

  // 6. Refresh hospede totals.
  emit('-- Update total_reservas counter on hospedes');
  emit(`UPDATE hospedes h SET total_reservas = (SELECT COUNT(*) FROM reservas r WHERE r.hospede_id = h.id) WHERE empresa_id = ${sql(EMPRESA_ID)};`);
  emit('');

  emit('COMMIT;');
  emit('');
  emit('-- === Final counts (sanity check) ===');
  emit(`SELECT 'quartos' AS tabela, COUNT(*) AS qtd FROM quartos WHERE empresa_id = ${sql(EMPRESA_ID)}`);
  emit(`UNION ALL SELECT 'fornecedores', COUNT(*) FROM fornecedores WHERE empresa_id = ${sql(EMPRESA_ID)}`);
  emit(`UNION ALL SELECT 'hospedes', COUNT(*) FROM hospedes WHERE empresa_id = ${sql(EMPRESA_ID)}`);
  emit(`UNION ALL SELECT 'reservas', COUNT(*) FROM reservas WHERE empresa_id = ${sql(EMPRESA_ID)}`);
  emit(`UNION ALL SELECT 'despesas', COUNT(*) FROM despesas WHERE empresa_id = ${sql(EMPRESA_ID)}`);
  emit(`UNION ALL SELECT 'faturas', COUNT(*) FROM faturas WHERE empresa_id = ${sql(EMPRESA_ID)}`);
  emit(`UNION ALL SELECT 'fluxo_caixa', COUNT(*) FROM fluxo_caixa WHERE empresa_id = ${sql(EMPRESA_ID)}`);
  emit(`UNION ALL SELECT 'empresa_usuarios', COUNT(*) FROM empresa_usuarios WHERE empresa_id = ${sql(EMPRESA_ID)};`);
}

function emitInsert(table: string, columns: string, values: string[]) {
  if (values.length === 0) return;
  emit(`-- ${table}: ${values.length} rows`);
  emit(`INSERT INTO ${table} ${columns} VALUES`);
  values.forEach((v, i) => emit(v + (i === values.length - 1 ? ';' : ',')));
  emit('');
}

main().catch(e => { console.error(e); process.exit(1); });
