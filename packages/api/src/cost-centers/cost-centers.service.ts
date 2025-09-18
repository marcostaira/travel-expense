import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCostCenterDto } from './dto/create-cost-center.dto';
import { UpdateCostCenterDto } from './dto/update-cost-center.dto';

@Injectable()
export class CostCentersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createCostCenterDto: CreateCostCenterDto) {
    return this.prisma.costCenter.create({
      data: {
        tenantId,
        ...createCostCenterDto,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.costCenter.findMany({
      where: { tenantId, active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const costCenter = await this.prisma.costCenter.findFirst({
      where: { id, tenantId },
      include: {
        projects: { where: { active: true } },
        budgets: true,
      },
    });

    if (!costCenter) {
      throw new NotFoundException('Centro de custo não encontrado');
    }

    return costCenter;
  }

  async update(tenantId: string, id: string, updateCostCenterDto: UpdateCostCenterDto) {
    await this.findOne(tenantId, id);

    return this.prisma.costCenter.update({
      where: { id },
      data: updateCostCenterDto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.costCenter.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Centro de custo removido com sucesso' };
  }
}