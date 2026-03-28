import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Quarto } from '../quartos/entities/quarto.entity';
import { FluxoCaixa } from '../fluxo-caixa/entities/fluxo-caixa.entity';
import { Reserva } from '../reservas/entities/reserva.entity';

export interface DashboardStats {
  quartos: {
    total: number;
    ocupados: number;
    disponiveis: number;
    taxaOcupacao: number;
  };
  receita: { mes: number; ano: number };
  despesas: { mes: number };
  checkins: { hoje: number };
  checkouts: { hoje: number };
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Quarto)
    private readonly quartoRepo: Repository<Quarto>,
    @InjectRepository(FluxoCaixa)
    private readonly fluxoRepo: Repository<FluxoCaixa>,
    @InjectRepository(Reserva)
    private readonly reservaRepo: Repository<Reserva>,
  ) {}

  async getStats(empresaId: string): Promise<DashboardStats> {
    const [quartos, receita, despesas, checkins, checkouts] =
      await Promise.all([
        this.getQuartosStats(empresaId),
        this.getReceitaStats(empresaId),
        this.getDespesasStats(empresaId),
        this.getCheckinsHoje(empresaId),
        this.getCheckoutsHoje(empresaId),
      ]);

    return { quartos, receita, despesas, checkins, checkouts };
  }

  private async getQuartosStats(empresaId: string) {
    const quartos = await this.quartoRepo.find({
      where: { empresaId },
      select: ['id', 'status'],
    });

    const total = quartos.length;
    const ocupados = quartos.filter(
      (q) => q.status === 'ocupado',
    ).length;
    const disponiveis = quartos.filter(
      (q) => q.status === 'disponivel',
    ).length;
    const taxaOcupacao =
      total > 0 ? Math.round((ocupados / total) * 100) : 0;

    return { total, ocupados, disponiveis, taxaOcupacao };
  }

  private async getReceitaStats(empresaId: string) {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [mesResult, anoResult] = await Promise.all([
      this.fluxoRepo
        .createQueryBuilder('fc')
        .select('COALESCE(SUM(fc.valor), 0)', 'total')
        .where('fc.empresa_id = :empresaId', { empresaId })
        .andWhere('fc.tipo = :tipo', { tipo: 'entrada' })
        .andWhere('fc.data >= :start', { start: startOfMonth })
        .getRawOne(),
      this.fluxoRepo
        .createQueryBuilder('fc')
        .select('COALESCE(SUM(fc.valor), 0)', 'total')
        .where('fc.empresa_id = :empresaId', { empresaId })
        .andWhere('fc.tipo = :tipo', { tipo: 'entrada' })
        .andWhere('fc.data >= :start', { start: startOfYear })
        .getRawOne(),
    ]);

    return {
      mes: parseFloat(mesResult?.total ?? '0'),
      ano: parseFloat(anoResult?.total ?? '0'),
    };
  }

  private async getDespesasStats(empresaId: string) {
    const now = new Date();
    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );

    const result = await this.fluxoRepo
      .createQueryBuilder('fc')
      .select('COALESCE(SUM(fc.valor), 0)', 'total')
      .where('fc.empresa_id = :empresaId', { empresaId })
      .andWhere('fc.tipo = :tipo', { tipo: 'saida' })
      .andWhere('fc.data >= :start', { start: startOfMonth })
      .getRawOne();

    return { mes: parseFloat(result?.total ?? '0') };
  }

  private async getCheckinsHoje(empresaId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await this.reservaRepo
      .createQueryBuilder('r')
      .where('r.empresa_id = :empresaId', { empresaId })
      .andWhere('r.data_checkin >= :today', { today })
      .andWhere('r.data_checkin < :tomorrow', { tomorrow })
      .andWhere('r.status IN (:...statuses)', {
        statuses: ['confirmada', 'checkin'],
      })
      .getCount();

    return { hoje: count };
  }

  private async getCheckoutsHoje(empresaId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await this.reservaRepo
      .createQueryBuilder('r')
      .where('r.empresa_id = :empresaId', { empresaId })
      .andWhere('r.data_checkout >= :today', { today })
      .andWhere('r.data_checkout < :tomorrow', { tomorrow })
      .andWhere('r.status IN (:...statuses)', {
        statuses: ['checkin', 'checkout'],
      })
      .getCount();

    return { hoje: count };
  }
}
