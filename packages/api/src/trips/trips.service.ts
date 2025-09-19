import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, userId: string, createTripDto: CreateTripDto) {
    // Verify cost center exists
    const costCenter = await this.prisma.costCenter.findFirst({
      where: {
        id: createTripDto.costCenterId,
        tenantId,
        active: true,
      },
    });

    if (!costCenter) {
      throw new NotFoundException('Centro de custo não encontrado');
    }

    // Verify project exists if provided
    if (createTripDto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: createTripDto.projectId,
          tenantId,
          active: true,
        },
      });

      if (!project) {
        throw new NotFoundException('Projeto não encontrado');
      }
    }

    // Validate dates
    const startDate = new Date(createTripDto.startDate);
    const endDate = new Date(createTripDto.endDate);

    if (startDate >= endDate) {
      throw new BadRequestException('Data de início deve ser anterior à data de fim');
    }

    if (startDate < new Date()) {
      throw new BadRequestException('Data de início deve ser futura');
    }

    const trip = await this.prisma.trip.create({
      data: {
        tenantId,
        requesterId: userId,
        ...createTripDto,
        startDate,
        endDate,
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        advances: true,
        expenses: true,
      },
    });

    return trip;
  }

  async findAll(
    tenantId: string,
    userId?: string,
    role?: string,
    page = 1,
    limit = 20,
    filters: {
      status?: string;
    } = {},
  ) {
    const skip = (page - 1) * limit;
    const where: Prisma.TripWhereInput = { tenantId };

    // Apply role-based filtering
    if (role === 'COLLABORATOR') {
      where.requesterId = userId;
    } else if (role === 'MANAGER') {
      // Managers can see trips they are assigned to manage or from their cost centers
      where.OR = [
        { managerId: userId },
        { requesterId: userId },
        {
          costCenter: {
            // This would need proper implementation based on manager-cost center relationship
          },
        },
      ];
    }

    // Apply filters
    if (filters.status) {
      where.status = filters.status as any;
    }

    const [trips, total] = await Promise.all([
      this.prisma.trip.findMany({
        where,
        include: {
          requester: { select: { id: true, name: true, email: true } },
          manager: { select: { id: true, name: true, email: true } },
          costCenter: { select: { id: true, name: true, code: true } },
          project: { select: { id: true, name: true, code: true } },
          _count: {
            select: {
              advances: true,
              expenses: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.trip.count({ where }),
    ]);

    return {
      data: trips,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(tenantId: string, id: string, userId?: string, role?: string) {
    const where: Prisma.TripWhereInput = { id, tenantId };

    // Apply role-based filtering
    if (role === 'COLLABORATOR') {
      where.requesterId = userId;
    }

    const trip = await this.prisma.trip.findFirst({
      where,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        advances: {
          include: {
            requester: { select: { id: true, name: true, email: true } },
            approver: { select: { id: true, name: true, email: true } },
          },
        },
        expenses: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            files: true,
          },
        },
      },
    });

    if (!trip) {
      throw new NotFoundException('Viagem não encontrada');
    }

    return trip;
  }

  async update(tenantId: string, id: string, userId: string, role: string, updateTripDto: UpdateTripDto) {
    const trip = await this.findOne(tenantId, id, role === 'COLLABORATOR' ? userId : undefined, role);

    // Only allow updates if trip is in draft status or user is admin
    if (trip.status !== 'DRAFT' && role !== 'ADMIN') {
      throw new BadRequestException('Apenas viagens em rascunho podem ser editadas');
    }

    // If user is collaborator, only allow updates to their own trips
    if (role === 'COLLABORATOR' && trip.requesterId !== userId) {
      throw new BadRequestException('Você só pode editar suas próprias viagens');
    }

    // Validate dates if provided
    if (updateTripDto.startDate || updateTripDto.endDate) {
      const startDate = updateTripDto.startDate ? new Date(updateTripDto.startDate) : trip.startDate;
      const endDate = updateTripDto.endDate ? new Date(updateTripDto.endDate) : trip.endDate;

      if (startDate >= endDate) {
        throw new BadRequestException('Data de início deve ser anterior à data de fim');
      }

      if (startDate < new Date() && trip.status === 'DRAFT') {
        throw new BadRequestException('Data de início deve ser futura');
      }
    }

    // Verify cost center exists if provided
    if (updateTripDto.costCenterId) {
      const costCenter = await this.prisma.costCenter.findFirst({
        where: {
          id: updateTripDto.costCenterId,
          tenantId,
          active: true,
        },
      });

      if (!costCenter) {
        throw new NotFoundException('Centro de custo não encontrado');
      }
    }

    // Verify project exists if provided
    if (updateTripDto.projectId) {
      const project = await this.prisma.project.findFirst({
        where: {
          id: updateTripDto.projectId,
          tenantId,
          active: true,
        },
      });

      if (!project) {
        throw new NotFoundException('Projeto não encontrado');
      }
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id },
      data: {
        ...updateTripDto,
        startDate: updateTripDto.startDate ? new Date(updateTripDto.startDate) : undefined,
        endDate: updateTripDto.endDate ? new Date(updateTripDto.endDate) : undefined,
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        advances: true,
        expenses: true,
      },
    });

    return updatedTrip;
  }

  async remove(tenantId: string, id: string, userId: string, role: string) {
    const trip = await this.findOne(tenantId, id, role === 'COLLABORATOR' ? userId : undefined, role);

    // Only allow deletion if trip is in draft status or user is admin
    if (trip.status !== 'DRAFT' && role !== 'ADMIN') {
      throw new BadRequestException('Apenas viagens em rascunho podem ser excluídas');
    }

    // If user is collaborator, only allow deletion of their own trips
    if (role === 'COLLABORATOR' && trip.requesterId !== userId) {
      throw new BadRequestException('Você só pode excluir suas próprias viagens');
    }

    await this.prisma.trip.delete({ where: { id } });

    return { message: 'Viagem excluída com sucesso' };
  }

  async submit(tenantId: string, id: string, userId: string, role: string) {
    const trip = await this.findOne(tenantId, id, role === 'COLLABORATOR' ? userId : undefined, role);

    if (trip.status !== 'DRAFT') {
      throw new BadRequestException('Apenas viagens em rascunho podem ser enviadas para aprovação');
    }

    // If user is collaborator, only allow submission of their own trips
    if (role === 'COLLABORATOR' && trip.requesterId !== userId) {
      throw new BadRequestException('Você só pode enviar suas próprias viagens');
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id },
      data: { status: 'PENDING_APPROVAL' },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        advances: true,
        expenses: true,
      },
    });

    // TODO: Send notification to manager

    return updatedTrip;
  }

  async approve(tenantId: string, id: string, userId: string, notes?: string) {
    const trip = await this.findOne(tenantId, id);

    if (trip.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Apenas viagens pendentes podem ser aprovadas');
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id },
      data: {
        status: 'APPROVED',
        managerId: userId,
        notes: notes ? `${trip.notes || ''}\n[Aprovação] ${notes}`.trim() : trip.notes,
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        advances: true,
        expenses: true,
      },
    });

    // TODO: Send notification to requester

    return updatedTrip;
  }

  async reject(tenantId: string, id: string, userId: string, reason: string) {
    const trip = await this.findOne(tenantId, id);

    if (trip.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Apenas viagens pendentes podem ser rejeitadas');
    }

    if (!reason || reason.trim().length === 0) {
      throw new BadRequestException('Motivo da rejeição é obrigatório');
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id },
      data: {
        status: 'REJECTED',
        managerId: userId,
        notes: `${trip.notes || ''}\n[Rejeição] ${reason}`.trim(),
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        advances: true,
        expenses: true,
      },
    });

    // TODO: Send notification to requester

    return updatedTrip;
  }

  async start(tenantId: string, id: string, userId: string, role: string) {
    const trip = await this.findOne(tenantId, id, role === 'COLLABORATOR' ? userId : undefined, role);

    if (trip.status !== 'APPROVED') {
      throw new BadRequestException('Apenas viagens aprovadas podem ser iniciadas');
    }

    // Check if it's the start date
    const today = new Date();
    const startDate = new Date(trip.startDate);
    
    if (today < startDate) {
      throw new BadRequestException('Viagem só pode ser iniciada na data prevista ou após');
    }

    // If user is collaborator, only allow starting their own trips
    if (role === 'COLLABORATOR' && trip.requesterId !== userId) {
      throw new BadRequestException('Você só pode iniciar suas próprias viagens');
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id },
      data: { status: 'IN_PROGRESS' },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        advances: true,
        expenses: true,
      },
    });

    return updatedTrip;
  }

  async complete(tenantId: string, id: string, userId: string, role: string) {
    const trip = await this.findOne(tenantId, id, role === 'COLLABORATOR' ? userId : undefined, role);

    if (trip.status !== 'IN_PROGRESS') {
      throw new BadRequestException('Apenas viagens em andamento podem ser concluídas');
    }

    // If user is collaborator, only allow completing their own trips
    if (role === 'COLLABORATOR' && trip.requesterId !== userId) {
      throw new BadRequestException('Você só pode concluir suas próprias viagens');
    }

    const updatedTrip = await this.prisma.trip.update({
      where: { id },
      data: { status: 'COMPLETED' },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        manager: { select: { id: true, name: true, email: true } },
        costCenter: { select: { id: true, name: true, code: true } },
        project: { select: { id: true, name: true, code: true } },
        advances: true,
        expenses: true,
      },
    });

    return updatedTrip;
  }
}