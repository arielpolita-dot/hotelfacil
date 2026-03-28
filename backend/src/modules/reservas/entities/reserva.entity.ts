import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import {
  FormaPagamento,
  StatusReserva,
} from '../../../common/enums';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Quarto } from '../../quartos/entities/quarto.entity';
import { Banco } from '../../bancos/entities/banco.entity';

@Entity('reservas')
@Check(`"data_checkout" > "data_checkin"`)
@Check(
  `"forma_pagamento" IN ('a_definir', 'dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'transferencia', 'cheque', 'faturado')`,
)
@Check(
  `"status" IN ('confirmada', 'checkin', 'checkout', 'concluida', 'cancelada')`,
)
export class Reserva extends BaseEntity {
  @Index('idx_reservas_empresa')
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Index('idx_reservas_quarto')
  @Column({ name: 'quarto_id', type: 'uuid' })
  quartoId: string;

  @ManyToOne(() => Quarto, (q) => q.reservas)
  @JoinColumn({ name: 'quarto_id' })
  quarto: Quarto;

  @Column({
    name: 'numero_quarto',
    type: 'integer',
    nullable: true,
  })
  numeroQuarto: number;

  @Column({ name: 'nome_hospede', type: 'varchar', length: 255 })
  nomeHospede: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string;

  @Column({ type: 'varchar', length: 14, nullable: true })
  cpf: string;

  @Column({ type: 'integer', default: 1 })
  adultos: number;

  @Column({ type: 'integer', default: 0 })
  criancas: number;

  @Index('idx_reservas_checkin')
  @Column({ name: 'data_checkin', type: 'timestamp' })
  dataCheckin: Date;

  @Index('idx_reservas_checkout')
  @Column({ name: 'data_checkout', type: 'timestamp' })
  dataCheckout: Date;

  @Column({
    name: 'valor_total',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  valorTotal: number;

  @Column({
    name: 'valor_extra',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  valorExtra: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  desconto: number;

  @Column({
    name: 'forma_pagamento',
    type: 'varchar',
    length: 30,
    default: FormaPagamento.A_DEFINIR,
  })
  formaPagamento: FormaPagamento;

  @Index('idx_reservas_status')
  @Column({
    type: 'varchar',
    length: 20,
    default: StatusReserva.CONFIRMADA,
  })
  status: StatusReserva;

  @Column({
    name: 'data_pagamento',
    type: 'date',
    nullable: true,
  })
  dataPagamento: Date;

  @Column({ name: 'banco_id', type: 'uuid', nullable: true })
  bancoId: string;

  @ManyToOne(() => Banco, { nullable: true })
  @JoinColumn({ name: 'banco_id' })
  banco: Banco;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({
    name: 'faturado_cnpj',
    type: 'varchar',
    length: 18,
    nullable: true,
  })
  faturadoCnpj: string;

  @Column({
    name: 'faturado_empresa',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  faturadoEmpresa: string;

  @Column({
    name: 'faturado_contato',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  faturadoContato: string;

  @Column({
    name: 'faturado_endereco',
    type: 'text',
    nullable: true,
  })
  faturadoEndereco: string;
}
