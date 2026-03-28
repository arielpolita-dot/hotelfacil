import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { TipoFluxoCaixa } from '../../../common/enums';
import { Empresa } from '../../empresas/entities/empresa.entity';
import { Reserva } from '../../reservas/entities/reserva.entity';
import { Despesa } from '../../despesas/entities/despesa.entity';

@Entity('fluxo_caixa')
@Check(`"tipo" IN ('entrada', 'saida')`)
@Check(`"valor" > 0`)
export class FluxoCaixa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_fluxo_empresa')
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Index('idx_fluxo_tipo')
  @Column({ type: 'varchar', length: 10 })
  tipo: TipoFluxoCaixa;

  @Column({ type: 'varchar', length: 50 })
  categoria: string;

  @Column({ type: 'varchar', length: 500 })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Index('idx_fluxo_data')
  @Column({ type: 'date' })
  data: Date;

  @Index('idx_fluxo_reserva')
  @Column({ name: 'reserva_id', type: 'uuid', nullable: true })
  reservaId: string;

  @ManyToOne(() => Reserva, { nullable: true })
  @JoinColumn({ name: 'reserva_id' })
  reserva: Reserva;

  @Index('idx_fluxo_despesa')
  @Column({ name: 'despesa_id', type: 'uuid', nullable: true })
  despesaId: string;

  @ManyToOne(() => Despesa, { nullable: true })
  @JoinColumn({ name: 'despesa_id' })
  despesa: Despesa;

  @Column({
    name: 'metodo_pagamento',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  metodoPagamento: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  status: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
}
