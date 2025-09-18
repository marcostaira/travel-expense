import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePolicyDto } from './dto/create-policy.dto';
import { UpdatePolicyDto } from './dto/update-policy.dto';

@Injectable()
export class PoliciesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createPolicyDto: CreatePolicyDto) {
    return this.prisma.policy.create({
      data: {
        tenantId,
        ...createPolicyDto,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.policy.findMany({
      where: { tenantId, active: true },
      orderBy: { category: 'asc' },
    });
  }

  async findByCategory(tenantId: string, category: string) {
    return this.prisma.policy.findFirst({
      where: { tenantId, category: category as any, active: true },
    });
  }

  async findOne(tenantId: string, id: string) {
    const policy = await this.prisma.policy.findFirst({
      where: { id, tenantId },
    });

    if (!policy) {
      throw new NotFoundException('Política não encontrada');
    }

    return policy;
  }

  async update(tenantId: string, id: string, updatePolicyDto: UpdatePolicyDto) {
    await this.findOne(tenantId, id);

    return this.prisma.policy.update({
      where: { id },
      data: updatePolicyDto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.policy.update({
      where: { id },
      data: { active: false },
    });

    return { message: 'Política removida com sucesso' };
  }
}