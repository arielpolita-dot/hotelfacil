import { Check, Column, Entity, Index, OneToMany } from 'typeorm';

import { BaseEntity } from '../../../common/entities/base.entity';
import {
  RoleUsuario,
  StatusUsuario,
} from '../../../common/enums';
import { EmpresaUsuario } from '../../empresas/entities/empresa-usuario.entity';

@Entity('usuarios')
@Check(`"role" IN ('Admin', 'Gerente', 'Recepcionista', 'Financeiro', 'Manutencao')`)
@Check(`"status" IN ('Ativo', 'Inativo', 'Suspenso')`)
export class Usuario extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  nome: string;

  @Index('idx_usuarios_email', { unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'senha_hash', type: 'varchar', length: 255 })
  senhaHash: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  telefone: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: RoleUsuario.RECEPCIONISTA,
  })
  role: RoleUsuario;

  @Column({
    type: 'varchar',
    length: 20,
    default: StatusUsuario.ATIVO,
  })
  status: StatusUsuario;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @Column({
    name: 'is_super_admin',
    type: 'boolean',
    default: false,
  })
  isSuperAdmin: boolean;

  @OneToMany(() => EmpresaUsuario, (eu) => eu.usuario)
  empresaUsuarios: EmpresaUsuario[];
}
