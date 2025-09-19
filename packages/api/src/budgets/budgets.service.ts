import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createBudgetDto: CreateBudgetDto) {
    // Check if budget already exists for the same period/cost center/project
    const existingBudget = await this.prisma.budget.findFirst({
      where: {
        tenantId,
        year: createBudgetDto.year,
        period: createBudgetDto.period,
        costCenterId: createBudgetDto.costCenterId,
        projectId: createBudgetDto.projectId || null,
      },
    });

    if (existingBudget) {
      throw new BadRequestException('Orçamento já existe para este período e centro de custo');
    }

    // Verify cost center exists
    const costCenter = await this.prisma.costCenter.findFirst({
      where: {
        id: createBudgetDto.costCenterId,
        tenantId,
        active: true,
      },
    });

    if (!costCenter) {
      throw new NotFoundException('Centro de custo não encontrado');
    }

    // Verify project exists if provided
    if (createBudgetDto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: createBudgetDto.projectId,
          tenantId,
          active: true,
        },
      });

      if (!project) {
        throw new NotFoundException('Projeto não encontrado');
      }
    }

    return this.prisma.budget.create({
      data: {
        tenantId,
        ...createBudgetDto,
      },
      include: {
        costCenter: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async findAll(
    tenantId: string,
    filters: {
      year?: number;
      period?: string;
      costCenterId?: string;
    } = {},
  ) {
    const where: any = { tenantId };

    if (filters.year) {
      where.year = filters.year;
    }
    if (filters.period) {
      where.period = filters.period;
    }
    if (filters.costCenterId) {
      where.costCenterId = filters.costCenterId;
    }

    return this.prisma.budget.findMany({
      where,
      include: {
        costCenter: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: [
        { year: 'desc' },
        { period: 'asc' },
        { costCenter: { name: 'asc' } },
      ],
    });
  }

  async findOne(tenantId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, tenantId },
      include: {
        costCenter: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException('Orçamento não encontrado');
    }

    return budget;
  }

  async update(tenantId: string, id: string, updateBudgetDto: UpdateBudgetDto) {
    const budget = await this.findOne(tenantId, id);

    // If updating key fields, check for conflicts
    if (
      updateBudgetDto.year !== undefined ||
      updateBudgetDto.period !== undefined ||
      updateBudgetDto.costCenterId !== undefined ||
      updateBudgetDto.projectId !== undefined
    ) {
      const conflictWhere = {
        tenantId,
        year: updateBudgetDto.year || budget.year,
        period: updateBudgetDto.period || budget.period,
        costCenterId: updateBudgetDto.costCenterId || budget.costCenterId,
        projectId: updateBudgetDto.projectId !== undefined ? updateBudgetDto.projectId : budget.projectId,
        id: { not: id },
      };

      const existingBudget = await this.prisma.budget.findFirst({
        where: conflictWhere,
      });

      if (existingBudget) {
        throw new BadRequestException('Orçamento já existe para este período e centro de custo');
      }
    }

    // Verify cost center exists if provided
    if (updateBudgetDto.costCenterId) {
      const costCenter = await this.prisma.costCenter.findFirst({
        where: {
          id: updateBudgetDto.costCenterId,
          tenantId,
          active: true,
        },
      });

      if (!costCenter) {
        throw new NotFoundException('Centro de custo não encontrado');
      }
    }

    // Verify project exists if provided
    if (updateBudgetDto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: updateBudgetDto.projectId,
          tenantId,
          active: true,
        },
      });

      if (!project) {
        throw new NotFoundException('Projeto não encontrado');
      }
    }

    return this.prisma.budget.update({
      where: { id },
      data: updateBudgetDto,
      include: {
        costCenter: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.budget.delete({ where: { id } });

    return { message: 'Orçamento removido com sucesso' };
  }

  async getBudgetSummary(tenantId: string, year: number) {
    const budgets = await this.prisma.budget.findMany({
      where: { tenantId, year },
      include: {
        costCenter: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Calculate actual spending for each budget
    const budgetSummary = await Promise.all(
      budgets.map(async (budget) => {
        const actualSpent = await this.calculateActualSpent(budget, year);
        
        return {
          ...budget,
          actualSpent,
          variance: actualSpent - budget.amount.toNumber(),
          variancePercentage: budget.amount.toNumber() > 0 
            ? ((actualSpent - budget.amount.toNumber()) / budget.amount.toNumber()) * 100 
            : 0,
        };
      })
    );

    const totalBudget = budgets.reduce((sum, b) => sum + b.amount.toNumber(), 0);
    const totalSpent = budgetSummary.reduce((sum, b) => sum + b.actualSpent, 0);

    return {
      budgets: budgetSummary,
      summary: {
        totalBudget,
        totalSpent,
        totalVariance: totalSpent - totalBudget,
        totalVariancePercentage: totalBudget > 0 ? ((totalSpent - totalBudget) / totalBudget) * 100 : 0,
      },
    };
  }

  private async calculateActualSpent(budget: any, year: number) {
    const startDate = new Date(year, 0, 1); // January 1st
    const endDate = new Date(year, 11, 31, 23, 59, 59); // December 31st

    // Adjust dates based on period
    if (budget.period === 'QUARTERLY') {
      // This is a simplified approach - in reality you'd need to determine which quarter
      // For now, we'll calculate for the whole year
    } else if (budget.period === 'MONTHLY') {
      // This is a simplified approach - in reality you'd need to determine which month
      // For now, we'll calculate for the whole year
    }

    const result = await this.prisma.expense.aggregate({
      where: {
        tenantId: budget.tenantId,
        costCenterId: budget.costCenterId,
        projectId: budget.projectId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          in: ['APPROVED', 'REIMBURSED'],
        },
      },
      _sum: {
        amountBrl: true,
      },
    });

    return result._sum.amountBrl?.toNumber() || 0;
  }

  async updateSpentAmount(budgetId: string, amount: number) {
    await this.prisma.budget.update({
      where: { id: budgetId },
      data: {
        spentAmount: {
          increment: amount,
        },
      },
    });
  }
}