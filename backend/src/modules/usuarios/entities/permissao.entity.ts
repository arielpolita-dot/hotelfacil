import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

import { EmpresaUsuario } from '../../empresas/entities/empresa-usuario.entity';

@Entity('permissoes')
@Unique(['empresaUsuarioId'])
export class Permissao {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'empresa_usuario_id', type: 'uuid' })
  empresaUsuarioId: string;

  @OneToOne(() => EmpresaUsuario, (eu) => eu.permissao, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'empresa_usuario_id' })
  empresaUsuario: EmpresaUsuario;

  @Column({ type: 'boolean', default: true })
  dashboard: boolean;

  @Column({ type: 'boolean', default: true })
  disponibilidade: boolean;

  @Column({ type: 'boolean', default: false })
  quartos: boolean;

  @Column({ type: 'boolean', default: false })
  vendas: boolean;

  @Column({ type: 'boolean', default: false })
  faturas: boolean;

  @Column({ type: 'boolean', default: false })
  despesas: boolean;

  @Column({ name: 'fluxo_caixa', type: 'boolean', default: false })
  fluxoCaixa: boolean;

  @Column({ type: 'boolean', default: false })
  usuarios: boolean;

  @Column({ type: 'boolean', default: false })
  configuracoes: boolean;
}
