// Domain builders: generate rows for each table as SQL VALUES strings.
// Each builder returns the list of SQL VALUES tuples for one table.

import { NOMES_HOSPEDES, EMPRESAS_CORPORATIVAS, FORNECEDORES_HOTEL, QUARTOS_HOTEL, USUARIOS_EQUIPE, CATEGORIAS_DESPESA, DESCRICOES_DESPESA, METODOS_PAGAMENTO, FORMAS_PAGAMENTO_RESERVA } from './fixtures';
import { rand, randInt, pick, pickWeighted, uuid, daysAgo, daysFromNow, isoDate, isoTimestamp, sql, sqlArray, sqlBool, cpfFake, telefoneFake, emailFromName } from './utils';

export interface Ctx {
  empresaId: string;
  arielId: string;
}

export interface BuiltRow { values: string; }
export interface BuiltCollection { rows: BuiltRow[]; ids: string[]; }

export function buildFornecedores(ctx: Ctx): BuiltCollection {
  const rows: BuiltRow[] = [];
  const ids: string[] = [];
  for (const f of FORNECEDORES_HOTEL) {
    const id = uuid();
    ids.push(id);
    const isPF = f.tipo === 'PF';
    const cnpj = isPF ? null : (f as { cnpj: string }).cnpj;
    const cpf = isPF ? (f as { cpf: string }).cpf : null;
    const email = `contato@${f.nome.toLowerCase().replace(/[^a-z]/g, '').slice(0, 20)}.com.br`;
    rows.push({ values: `(${sql(id)}, ${sql(ctx.empresaId)}, ${sql(f.nome)}, ${sql(cnpj)}, ${sql(email)}, ${sql(telefoneFake())}, ${sql(f.tipo)}, ${sql(cpf)}, NULL, NULL, ${sql(f.cidade)}, ${sql(f.estado)}, NULL, NULL, NOW(), NOW())` });
  }
  return { rows, ids };
}

export function buildQuartos(ctx: Ctx): BuiltCollection {
  const rows: BuiltRow[] = [];
  const ids: string[] = [];
  for (const q of QUARTOS_HOTEL) {
    const id = uuid();
    ids.push(id);
    rows.push({ values: `(${sql(id)}, ${sql(ctx.empresaId)}, ${q.numero}, ${sql(q.tipo)}, ${q.andar}, ${q.capacidade}, ${q.preco}, ${sql(q.status)}, ${sql(q.descricao)}, ${sqlArray(q.caracteristicas)}, '{}', NULL, NULL, NOW(), NOW())` });
  }
  return { rows, ids };
}

export function buildHospedes(ctx: Ctx, count: number): BuiltCollection {
  const rows: BuiltRow[] = [];
  const ids: string[] = [];
  const seen = new Set<string>();
  while (ids.length < count) {
    const idx = ids.length;
    let nome = NOMES_HOSPEDES[idx % NOMES_HOSPEDES.length];
    if (idx >= NOMES_HOSPEDES.length) nome += ` ${randInt(2, 99)}`;
    if (seen.has(nome)) continue;
    seen.add(nome);
    const id = uuid();
    ids.push(id);
    const codigo = `H${String(idx + 1).padStart(4, '0')}`;
    const cidade = pick(['Porto Alegre', 'Caxias do Sul', 'Sao Paulo', 'Curitiba', 'Florianopolis', 'Pelotas', 'Rio de Janeiro', 'Canoas', 'Gramado', 'Bento Goncalves']);
    const estado = pick(['RS', 'SC', 'PR', 'SP', 'RJ', 'MG']);
    rows.push({ values: `(${sql(id)}, ${sql(ctx.empresaId)}, ${sql(codigo)}, ${sql(nome)}, ${sql(cpfFake())}, ${sql(emailFromName(nome))}, ${sql(telefoneFake())}, NULL, ${sql(cidade)}, ${sql(estado)}, NULL, NULL, 0, NOW(), NOW())` });
  }
  return { rows, ids };
}

export function buildReservas(ctx: Ctx, quartoIds: string[], hospedeIds: string[], count: number): { rows: BuiltRow[]; ids: string[]; receitaPorReserva: Map<string, { valor: number; data: Date; metodo: string; quartoId: string }> } {
  const rows: BuiltRow[] = [];
  const ids: string[] = [];
  const receita = new Map<string, { valor: number; data: Date; metodo: string; quartoId: string }>();

  for (let i = 0; i < count; i++) {
    const id = uuid();
    ids.push(id);
    const quartoIdx = randInt(0, quartoIds.length - 1);
    const quarto = QUARTOS_HOTEL[quartoIdx];
    const quartoId = quartoIds[quartoIdx];
    const hospedeIdx = i % hospedeIds.length;
    const hospedeId = hospedeIds[hospedeIdx];
    const nomeHospede = NOMES_HOSPEDES[hospedeIdx % NOMES_HOSPEDES.length];
    const offsetDias = randInt(-85, 25);
    const dataCheckin = daysAgo(-offsetDias);
    const noites = pickWeighted<number>([[1, 3], [2, 8], [3, 6], [4, 4], [5, 2], [7, 2], [10, 1]]);
    const dataCheckout = new Date(dataCheckin);
    dataCheckout.setDate(dataCheckout.getDate() + noites);
    dataCheckout.setHours(11, 0, 0, 0);
    const checkinTs = new Date(dataCheckin); checkinTs.setHours(14, 0, 0, 0);

    const adultos = randInt(1, Math.min(quarto.capacidade, 2));
    const criancas = quarto.capacidade > 2 && rand() < 0.3 ? randInt(1, quarto.capacidade - adultos) : 0;
    const valorBase = quarto.preco * noites;
    const extras = rand() < 0.3 ? Math.round(rand() * 200) : 0;
    const desconto = rand() < 0.15 ? Math.round(rand() * 100) : 0;
    const valorTotal = valorBase + extras - desconto;

    const status = offsetDias < -1 ? pickWeighted<string>([['concluida', 7], ['cancelada', 1], ['checkout', 1]])
                  : offsetDias < 1 ? pickWeighted<string>([['checkin', 4], ['confirmada', 1]])
                  : pickWeighted<string>([['confirmada', 8], ['cancelada', 1]]);

    const forma = pick(FORMAS_PAGAMENTO_RESERVA);
    const isPago = status === 'concluida' || status === 'checkout' || (status === 'checkin' && rand() < 0.7);
    const dataPagamento = isPago ? isoDate(dataCheckin) : null;
    // banco_id is left NULL here — a post-INSERT UPDATE in main.ts distributes
    // real banco IDs round-robin across electronic-payment reservas.
    const bancoId = null;

    const isFaturado = forma === 'faturado';
    const faturadoEmpresa = isFaturado ? pick(EMPRESAS_CORPORATIVAS) : null;

    rows.push({
      values: `(${sql(id)}, ${sql(ctx.empresaId)}, ${sql(quartoId)}, ${quarto.numero}, ${sql(nomeHospede)}, ${sql(emailFromName(nomeHospede))}, ${sql(telefoneFake())}, ${sql(cpfFake())}, ${adultos}, ${criancas}, ${sql(isoTimestamp(checkinTs))}::timestamp, ${sql(isoTimestamp(dataCheckout))}::timestamp, ${valorTotal}, ${extras}, ${desconto}, ${sql(forma)}, ${sql(status)}, ${sql(dataPagamento)}, ${sql(bancoId)}, NULL, ${sql(faturadoEmpresa?.cnpj || null)}, ${sql(faturadoEmpresa?.nome || null)}, NULL, NULL, ${sql(hospedeId)}, NOW(), NOW())`,
    });

    if (isPago) {
      receita.set(id, { valor: valorTotal, data: dataCheckin, metodo: forma, quartoId });
    }
  }
  return { rows, ids, receitaPorReserva: receita };
}

export function buildDespesas(ctx: Ctx, count: number): { rows: BuiltRow[]; ids: string[]; pagamentos: Map<string, { valor: number; data: Date; categoria: string }> } {
  const rows: BuiltRow[] = [];
  const ids: string[] = [];
  const pagamentos = new Map<string, { valor: number; data: Date; categoria: string }>();

  for (let i = 0; i < count; i++) {
    const id = uuid();
    ids.push(id);
    const categoria = pick(CATEGORIAS_DESPESA);
    const descricao = pick(DESCRICOES_DESPESA[categoria]);
    const valor = categoria === 'Pessoal' ? randInt(2000, 8500)
                : categoria === 'Utilidades' ? randInt(400, 2200)
                : categoria === 'Marketing' ? randInt(150, 1200)
                : randInt(80, 1500);
    const data = daysAgo(randInt(0, 88));
    const status = rand() < 0.85 ? 'pago' : 'pendente';
    const fornecedor = pick(FORNECEDORES_HOTEL).nome;

    rows.push({ values: `(${sql(id)}, ${sql(ctx.empresaId)}, ${sql(categoria)}, ${sql(descricao)}, ${valor}, ${sql(isoDate(data))}::date, ${sql(status)}, ${sql(fornecedor)}, NULL, NOW(), NOW())` });

    if (status === 'pago') pagamentos.set(id, { valor, data, categoria });
  }
  return { rows, ids, pagamentos };
}

export function buildFaturas(ctx: Ctx, count: number): BuiltCollection {
  const rows: BuiltRow[] = [];
  const ids: string[] = [];
  for (let i = 0; i < count; i++) {
    const id = uuid();
    ids.push(id);
    const empresa = EMPRESAS_CORPORATIVAS[i % EMPRESAS_CORPORATIVAS.length];
    const tipoContrato = pickWeighted<string>([['Mensal', 6], ['Trimestral', 2], ['Semestral', 1], ['Anual', 1]]);
    const periodicidade = pickWeighted<string>([['Mensal', 7], ['Quinzenal', 1], ['Bimestral', 1], ['Trimestral', 1]]);
    const dataInicio = daysAgo(randInt(30, 200));
    const dataFim = new Date(dataInicio); dataFim.setMonth(dataFim.getMonth() + (tipoContrato === 'Anual' ? 12 : tipoContrato === 'Semestral' ? 6 : tipoContrato === 'Trimestral' ? 3 : 1));
    const valorMensal = randInt(2500, 12000);
    const meses = (tipoContrato === 'Anual' ? 12 : tipoContrato === 'Semestral' ? 6 : tipoContrato === 'Trimestral' ? 3 : 1);
    const valorTotal = valorMensal * meses;
    const proximaFatura = daysFromNow(randInt(5, 25));
    const status = pickWeighted<string>([['Ativo', 7], ['Vencido', 1], ['Cancelado', 1], ['Suspenso', 1]]);
    const quartos = Array.from({ length: randInt(1, 4) }, () => pick(QUARTOS_HOTEL).numero);
    const pendentes = status === 'Vencido' ? randInt(1, 3) : 0;

    rows.push({ values: `(${sql(id)}, ${sql(ctx.empresaId)}, ${sql(empresa.nome)}, ${sql(empresa.cnpj)}, ${sql(`Contato ${empresa.nome.split(' ')[0]}`)}, ${sql(`contato@${empresa.nome.toLowerCase().replace(/[^a-z]/g, '').slice(0, 20)}.com.br`)}, ${sql(telefoneFake())}, NULL, ${sql(tipoContrato)}, ${sql(isoDate(dataInicio))}::date, ${sql(isoDate(dataFim))}::date, ${sql(periodicidade)}, ${valorMensal}, ${valorTotal}, ${sqlArray(quartos)}, ${sql(status)}, ${sql(isoDate(proximaFatura))}::date, ${pendentes}, NULL, NOW(), NOW())` });
  }
  return { rows, ids };
}

export function buildUsuarios(ctx: Ctx, senhaHashTemp: string): { usuariosRows: BuiltRow[]; empresaUsuariosRows: BuiltRow[]; permissoesRows: BuiltRow[]; usuarioIds: string[] } {
  const usuariosRows: BuiltRow[] = [];
  const empresaUsuariosRows: BuiltRow[] = [];
  const permissoesRows: BuiltRow[] = [];
  const usuarioIds: string[] = [];

  for (const u of USUARIOS_EQUIPE) {
    const uId = uuid();
    const euId = uuid();
    const pId = uuid();
    usuarioIds.push(uId);
    usuariosRows.push({ values: `(${sql(uId)}, NOW(), NOW(), ${sql(u.nome)}, ${sql(u.email)}, ${sql(senhaHashTemp)}, ${sql(u.telefone)}, ${sql(u.role)}, 'Ativo', ${sql('Usuario demo - senha temporaria')}, false)` });
    empresaUsuariosRows.push({ values: `(${sql(euId)}, ${sql(ctx.empresaId)}, ${sql(uId)}, ${sql(u.role)}, NOW())` });
    const p = u.perms;
    permissoesRows.push({ values: `(${sql(pId)}, ${sql(euId)}, ${sqlBool(p.dashboard)}, ${sqlBool(p.disponibilidade)}, ${sqlBool(p.quartos)}, ${sqlBool(p.vendas)}, ${sqlBool(p.faturas)}, ${sqlBool(p.despesas)}, ${sqlBool(p.fluxo_caixa)}, ${sqlBool(p.usuarios)}, ${sqlBool(p.configuracoes)})` });
  }
  return { usuariosRows, empresaUsuariosRows, permissoesRows, usuarioIds };
}

export function buildFluxoCaixa(ctx: Ctx, receitas: Map<string, { valor: number; data: Date; metodo: string; quartoId: string }>, despesas: Map<string, { valor: number; data: Date; categoria: string }>): BuiltRow[] {
  const rows: BuiltRow[] = [];
  for (const [reservaId, r] of receitas) {
    rows.push({ values: `(${sql(uuid())}, ${sql(ctx.empresaId)}, 'entrada', 'Hospedagem', ${sql(`Receita de diaria - reserva ${reservaId.slice(0, 8)}`)}, ${r.valor}, ${sql(isoDate(r.data))}::date, ${sql(reservaId)}, NULL, ${sql(r.metodo)}, 'recebido', NOW())` });
  }
  for (const [despesaId, d] of despesas) {
    rows.push({ values: `(${sql(uuid())}, ${sql(ctx.empresaId)}, 'saida', ${sql(d.categoria)}, ${sql(`Pagamento despesa - ${d.categoria}`)}, ${d.valor}, ${sql(isoDate(d.data))}::date, NULL, ${sql(despesaId)}, ${sql(pick(METODOS_PAGAMENTO))}, 'pago', NOW())` });
  }
  return rows;
}
