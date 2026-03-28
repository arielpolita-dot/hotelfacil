import {
  Check,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import { StatusPagamentoEmpresa } from '../../../common/enums';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { EmpresaUsuario } from './empresa-usuario.entity';

@Entity('empresas')
@Check(
  `"status_pagamento" IN ('trial', 'expirado', 'pago')`,
)
export class Empresa extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Column({ type: 'varchar', length: 18, nullable: true })
  cnpj: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string;

  @Column({ type: 'text', nullable: true })
  endereco: string;

  @Index('idx_empresas_proprietario')
  @Column({ name: 'proprietario_id', type: 'uuid' })
  proprietarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'proprietario_id' })
  proprietario: Usuario;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @Index('idx_empresas_status')
  @Column({
    name: 'status_pagamento',
    type: 'varchar',
    length: 20,
    default: StatusPagamentoEmpresa.TRIAL,
  })
  statusPagamento: StatusPagamentoEmpresa;

  @Column({
    name: 'data_inicio',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dataInicio: Date;

  @Column({
    name: 'dias_trial',
    type: 'integer',
    default: 3,
  })
  diasTrial: number;

  @Column({
    name: 'valor_mensal',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 99.9,
  })
  valorMensal: number;

  @Column({
    name: 'data_pagamento',
    type: 'timestamp',
    nullable: true,
  })
  dataPagamento: Date;

  @Column({ name: 'logo_url', type: 'text', nullable: true })
  logoUrl: string;

  @OneToMany(() => EmpresaUsuario, (eu) => eu.empresa)
  empresaUsuarios: EmpresaUsuario[];
}
