import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

import { CreateEmpresaDto } from '../../modules/empresas/dto/create-empresa.dto';
import { CreateReservaDto } from '../../modules/reservas/dto/create-reserva.dto';
import { CreateDespesaDto } from '../../modules/despesas/dto/create-despesa.dto';
import { CreateUsuarioDto } from '../../modules/usuarios/dto/create-usuario.dto';
import { AddMemberDto } from '../../modules/empresas/dto/add-member.dto';
import {
  CategoriaDespesa,
  FormaPagamento,
  RoleUsuario,
} from '../enums';

describe('DTO Validation', () => {
  describe('CreateEmpresaDto', () => {
    it('passes with valid data', async () => {
      const dto = plainToInstance(CreateEmpresaDto, {
        nome: 'Hotel Beira Mar',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('fails when nome is empty', async () => {
      const dto = plainToInstance(CreateEmpresaDto, { nome: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('fails when nome exceeds 255 chars', async () => {
      const dto = plainToInstance(CreateEmpresaDto, {
        nome: 'x'.repeat(256),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('passes with optional fields', async () => {
      const dto = plainToInstance(CreateEmpresaDto, {
        nome: 'Hotel',
        cnpj: '12.345.678/0001-90',
        telefone: '11999990000',
        endereco: 'Rua A, 100',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('CreateReservaDto', () => {
    const validReserva = {
      quartoId: '550e8400-e29b-41d4-a716-446655440000',
      nomeHospede: 'Joao Silva',
      adultos: 2,
      dataCheckin: '2026-04-01T14:00:00Z',
      dataCheckout: '2026-04-03T12:00:00Z',
      valorTotal: 300.0,
    };

    it('passes with valid required fields', async () => {
      const dto = plainToInstance(CreateReservaDto, validReserva);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('fails when quartoId is not UUID', async () => {
      const dto = plainToInstance(CreateReservaDto, {
        ...validReserva,
        quartoId: 'not-a-uuid',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('fails when adultos is less than 1', async () => {
      const dto = plainToInstance(CreateReservaDto, {
        ...validReserva,
        adultos: 0,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('fails when valorTotal is negative', async () => {
      const dto = plainToInstance(CreateReservaDto, {
        ...validReserva,
        valorTotal: -10,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('passes with optional fields', async () => {
      const dto = plainToInstance(CreateReservaDto, {
        ...validReserva,
        email: 'joao@test.com',
        telefone: '11999990000',
        formaPagamento: FormaPagamento.PIX,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('fails with invalid formaPagamento', async () => {
      const dto = plainToInstance(CreateReservaDto, {
        ...validReserva,
        formaPagamento: 'INVALID',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('CreateDespesaDto', () => {
    const validDespesa = {
      categoria: CategoriaDespesa.MANUTENCAO,
      descricao: 'Conserto do ar-condicionado',
      valor: 250.0,
      data: '2026-03-28',
    };

    it('passes with valid data', async () => {
      const dto = plainToInstance(CreateDespesaDto, validDespesa);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('fails when valor is zero', async () => {
      const dto = plainToInstance(CreateDespesaDto, {
        ...validDespesa,
        valor: 0,
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('fails with invalid categoria', async () => {
      const dto = plainToInstance(CreateDespesaDto, {
        ...validDespesa,
        categoria: 'INVALID',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('fails when descricao exceeds 500 chars', async () => {
      const dto = plainToInstance(CreateDespesaDto, {
        ...validDespesa,
        descricao: 'x'.repeat(501),
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  describe('CreateUsuarioDto', () => {
    const validUsuario = {
      nome: 'Maria Silva',
      email: 'maria@hotel.com',
      senha: 'senhaSegura123',
      role: RoleUsuario.RECEPCIONISTA,
    };

    it('passes with valid data', async () => {
      const dto = plainToInstance(CreateUsuarioDto, validUsuario);
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('fails when email is invalid', async () => {
      const dto = plainToInstance(CreateUsuarioDto, {
        ...validUsuario,
        email: 'not-an-email',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('fails when senha is too short', async () => {
      const dto = plainToInstance(CreateUsuarioDto, {
        ...validUsuario,
        senha: '12345',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('fails with invalid role', async () => {
      const dto = plainToInstance(CreateUsuarioDto, {
        ...validUsuario,
        role: 'INVALID',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('passes with optional boolean permissions', async () => {
      const dto = plainToInstance(CreateUsuarioDto, {
        ...validUsuario,
        dashboard: true,
        quartos: false,
        vendas: true,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('AddMemberDto', () => {
    it('passes with valid email', async () => {
      const dto = plainToInstance(AddMemberDto, {
        email: 'user@example.com',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('fails when email is empty', async () => {
      const dto = plainToInstance(AddMemberDto, { email: '' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('fails when email is invalid', async () => {
      const dto = plainToInstance(AddMemberDto, {
        email: 'invalid',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('passes with optional role', async () => {
      const dto = plainToInstance(AddMemberDto, {
        email: 'user@example.com',
        role: RoleUsuario.GERENTE,
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('fails with invalid role', async () => {
      const dto = plainToInstance(AddMemberDto, {
        email: 'user@example.com',
        role: 'INVALID',
      });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
