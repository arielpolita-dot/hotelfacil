import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { RoleUsuario } from '../../../common/enums';
import { Empresa } from './empresa.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Permissao } from '../../usuarios/entities/permissao.entity';

@Entity('empresa_usuarios')
@Unique(['empresaId', 'usuarioId'])
@Check(
  `"role" IN ('Admin', 'Gerente', 'Recepcionista', 'Financeiro', 'Manutencao')`,
)
export class EmpresaUsuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index('idx_eu_empresa')
  @Column({ name: 'empresa_id', type: 'uuid' })
  empresaId: string;

  @ManyToOne(() => Empresa, (e) => e.empresaUsuarios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'empresa_id' })
  empresa: Empresa;

  @Index('idx_eu_usuario')
  @Column({ name: 'usuario_id', type: 'uuid' })
  usuarioId: string;

  @ManyToOne(() => Usuario, (u) => u.empresaUsuarios, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario;

  @Column({
    type: 'varchar',
    length: 20,
    default: RoleUsuario.RECEPCIONISTA,
  })
  role: RoleUsuario;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToOne(() => Permissao, (p) => p.empresaUsuario)
  permissao: Permissao;
}
