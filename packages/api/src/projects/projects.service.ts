import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createProjectDto: CreateProjectDto) {
    // Check if project code already exists for this tenant
    const existingProject = await this.prisma.project.findFirst({
      where: {
        tenantId,
        code: createProjectDto.code,
        active: true,
      },
    });

    if (existingProject) {
      throw new BadRequestException('Código do projeto já existe');
    }

    // Verify cost center exists if provided
    if (createProjectDto.costCenterId) {
      const costCenter = await this.prisma.costCenter.findFirst({
        where: {
          id: createProjectDto.costCenterId,
          tenantId,
          active: true,
        },
      });

      if (!costCenter) {
        throw new NotFoundException('Centro de custo não encontrado');
      }
    }

    return this.prisma.project.create({
      data: {
        tenantId,
        ...createProjectDto,
      },
      include: {
        costCenter: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.project.findMany({
      where: { tenantId, active: true },
      include: {
        costCenter: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        _count: {
          select: {
            budgets: true,
            trips: true,
            expenses: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const project = await this.prisma.project.findFirst({
      where: { id, tenantId },
      include: {
        costCenter: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        budgets: {
          where: { year: new Date().getFullYear() },
          orderBy: { period: 'asc' },
        },
        _count: {
          select: {
            trips: true,
            expenses: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Projeto não encontrado');
    }

    return project;
  }

  async update(tenantId: string, id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(tenantId, id);

    // Check if new code already exists for this tenant (if code is being updated)
    if (updateProjectDto.code && updateProjectDto.code !== project.code) {
      const existingProject = await this.prisma.project.findFirst({
        where: {
          tenantId,
          code: updateProjectDto.code,
          active: true,
          id: { not: id },
        },
      });

      if (existingProject) {
        throw new BadRequestException('Código do projeto já existe');
      }
    }

    // Verify cost center exists if provided
    if (updateProjectDto.costCenterId) {
      const costCenter = await this.prisma.costCenter.findFirst({
        where: {
          id: updateProjectDto.costCenterId,
          tenantId,
          active: true,
        },
      });

      if (!costCenter) {
        throw new NotFoundException('Centro de custo não encontrado');
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        costCenter: {
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

    // Check if project is being used
    const usage = await this.prisma.project.findFirst({
      where: { id },
      include: {
        _count: {
          select: {
            budgets: true,
            trips: true,
            expenses: true,
          },
        },
      },
    });

    const hasUsage = usage._count.budgets > 0 || usage._count.trips > 0 || usage._count.expenses > 0;

    if (hasUsage) {
      // Soft delete if project is being used
      await this.prisma.project.update({
        where: { id },
        data: { active: false },
      });
      return { message: 'Projeto desativado com sucesso (há registros vinculados)' };
    } else {
      // Hard delete if not being used
      await this.prisma.project.delete({ where: { id } });
      return { message: 'Projeto removido com sucesso' };
    }
  }
}