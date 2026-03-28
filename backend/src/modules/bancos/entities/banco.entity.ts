import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';

@Entity('bancos')
export class Banco extends BaseEntity {
  @Index('idx_bancos_empresa')
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Column({ type: 'varchar', length: 100 })
  nome: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  codigo: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  agencia: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  conta: string;
}
