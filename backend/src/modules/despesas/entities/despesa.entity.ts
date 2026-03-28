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
  CategoriaDespesa,
  StatusDespesa,
} from '../../../common/enums';
import { Empresa } from '../../empresas/entities/empresa.entity';

@Entity('despesas')
@Check(
  `"categoria" IN ('Alimentacao', 'Limpeza', 'Manutencao', 'Pessoal', 'Marketing', 'Utilidades', 'Administrativo', 'Outros')`,
)
@Check(`"valor" > 0`)
@Check(`"status" IN ('pendente', 'pago', 'cancelado')`)
export class Despesa extends BaseEntity {
  @Index('idx_despesas_empresa')
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Index('idx_despesas_categoria')
  @Column({ type: 'varchar', length: 50 })
  categoria: CategoriaDespesa;

  @Column({ type: 'varchar', length: 500 })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Index('idx_despesas_data')
  @Column({ type: 'date' })
  data: Date;

  @Index('idx_despesas_status')
  @Column({
    type: 'varchar',
    length: 20,
    default: StatusDespesa.PENDENTE,
  })
  status: StatusDespesa;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  fornecedor: string;

  @Column({ type: 'text', nullable: true })
  observacoes: string;
}
