import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { StatusQuarto, TipoQuarto } from '../../../common/enums';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Reserva } from '../../reservas/entities/reserva.entity';

@Entity('quartos')
@Unique(['empresaId', 'numero'])
@Check(`"tipo" IN ('standard', 'deluxe', 'suite', 'triplo')`)
@Check(
  `"status" IN ('disponivel', 'ocupado', 'limpeza', 'manutencao')`,
)
export class Quarto extends BaseEntity {
  @Index('idx_quartos_empresa')
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'integer' })
  numero: number;

  @Column({
    type: 'varchar',
    length: 30,
    default: TipoQuarto.STANDARD,
  })
  tipo: TipoQuarto;

  @Column({ type: 'integer', nullable: true })
  andar: number;

  @Column({ type: 'integer', default: 2 })
  capacidade: number;

  @Column({
    name: 'preco_diaria',
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  precoDiaria: number;

  @Index('idx_quartos_status')
  @Column({
    type: 'varchar',
    length: 20,
    default: StatusQuarto.DISPONIVEL,
  })
  status: StatusQuarto;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  caracteristicas: string[];

  @Column({
    type: 'text',
    array: true,
    default: () => "'{}'",
  })
  imagens: string[];

  @Column({
    name: 'manutencao_inicio',
    type: 'date',
    nullable: true,
  })
  manutencaoInicio: Date;

  @Column({
    name: 'manutencao_fim',
    type: 'date',
    nullable: true,
  })
  manutencaoFim: Date;

  @OneToMany(() => Reserva, (r) => r.quarto)
  reservas: Reserva[];
}
