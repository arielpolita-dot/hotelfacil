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
  PeriodicidadeFatura,
  StatusFatura,
  TipoContrato,
} from '../../../common/enums';
import { Empresa } from '../../empresas/entities/empresa.entity';

@Entity('faturas')
@Check(
  `"tipo_contrato" IN ('Mensal', 'Trimestral', 'Semestral', 'Anual')`,
)
@Check(
  `"periodicidade_fatura" IN ('Quinzenal', 'Mensal', 'Bimestral', 'Trimestral')`,
)
@Check(
  `"status" IN ('Ativo', 'Suspenso', 'Cancelado', 'Vencido')`,
)
@Check(`"data_fim" >= "data_inicio"`)
export class Fatura extends BaseEntity {
  @Index('idx_faturas_empresa')
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({
    name: 'empresa_cliente',
    type: 'varchar',
    length: 255,
  })
  empresaCliente: string;

  @Column({ type: 'varchar', length: 18, nullable: true })
  cnpj: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  contato: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string;

  @Column({ type: 'text', nullable: true })
  endereco: string;

  @Column({
    name: 'tipo_contrato',
    type: 'varchar',
    length: 20,
    default: TipoContrato.MENSAL,
  })
  tipoContrato: TipoContrato;

  @Column({ name: 'data_inicio', type: 'date' })
  dataInicio: Date;

  @Column({ name: 'data_fim', type: 'date' })
  dataFim: Date;

  @Column({
    name: 'periodicidade_fatura',
    type: 'varchar',
    length: 20,
    default: PeriodicidadeFatura.MENSAL,
  })
  periodicidadeFatura: PeriodicidadeFatura;

  @Column({
    name: 'valor_mensal',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  valorMensal: number;

  @Column({
    name: 'valor_total',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  valorTotal: number;

  @Column({
    name: 'quartos_inclusos',
    type: 'integer',
    array: true,
    default: () => "'{}'",
  })
  quartosInclusos: number[];

  @Index('idx_faturas_status')
  @Column({
    type: 'varchar',
    length: 20,
    default: StatusFatura.ATIVO,
  })
  status: StatusFatura;

  @Column({
    name: 'proxima_fatura',
    type: 'date',
    nullable: true,
  })
  proximaFatura: Date;

  @Column({
    name: 'faturas_pendentes',
    type: 'integer',
    default: 0,
  })
  faturasPendentes: number;

  @Column({ type: 'text', nullable: true })
  observacoes: string;
}
