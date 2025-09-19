import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    // Check if CNPJ already exists
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { cnpj: createTenantDto.cnpj },
    });

    if (existingTenant) {
      throw new BadRequestException('CNPJ já está cadastrado');
    }

    return this.prisma.tenant.create({
      data: {
        ...createTenantDto,
        settings: createTenantDto.settings || {
          currency: 'BRL',
          timezone: 'America/Sao_Paulo',
          approvalLevels: 1,
          maxFileSize: 10485760, // 10MB
        },
      },
    });
  }

  async findAll() {
    return this.prisma.tenant.findMany({
      where: { active: true },
      include: {
        _count: {
          select: {
            userTenants: true,
            expenses: true,
            trips: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        userTenants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                active: true,
              },
            },
          },
        },
        costCenters: { where: { active: true } },
        projects: { where: { active: true } },
        policies: { where: { active: true } },
        _count: {
          select: {
            expenses: true,
            trips: true,
            budgets: true,
          },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    const tenant = await this.findOne(id);

    // If updating CNPJ, check if it's not already used
    if (updateTenantDto.cnpj && updateTenantDto.cnpj !== tenant.cnpj) {
      const existingTenant = await this.prisma.tenant.findUnique({
        where: { cnpj: updateTenantDto.cnpj },
      });

      if (existingTenant) {
        throw new BadRequestException('CNPJ já está cadastrado');
      }
    }

    return this.prisma.tenant.update({
      where: { id },
      data: {
        ...updateTenantDto,
        settings: updateTenantDto.settings
          ? { ...tenant.settings, ...updateTenantDto.settings }
          : tenant.settings,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    // Soft delete - just deactivate
    await this.prisma.tenant.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Tenant desativado com sucesso' };
  }

  async getSettings(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { settings: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return tenant.settings;
  }

  async updateSettings(tenantId: string, settings: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant não encontrado');
    }

    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        settings: { ...tenant.settings, ...settings },
      },
    });
  }
}