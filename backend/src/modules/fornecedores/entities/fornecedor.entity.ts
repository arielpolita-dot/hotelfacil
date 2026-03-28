import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { Empresa } from '../../empresas/entities/empresa.entity';

@Entity('fornecedores')
export class Fornecedor extends BaseEntity {
  @Index('idx_fornecedores_empresa')
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Index('idx_fornecedores_nome')
  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 18, nullable: true })
  cnpj: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string;
}
