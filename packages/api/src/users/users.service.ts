import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import * as bcrypt from "bcrypt";

import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createUserDto: CreateUserDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      // If user exists but not in this tenant, add to tenant
      const existingUserTenant = await this.prisma.userTenant.findUnique({
        where: {
          userId_tenantId: {
            userId: existingUser.id,
            tenantId,
          },
        },
      });

      if (existingUserTenant) {
        throw new BadRequestException("Usuário já existe neste tenant");
      }

      // Add existing user to tenant
      await this.prisma.userTenant.create({
        data: {
          userId: existingUser.id,
          tenantId,
          roleOverride: createUserDto.role,
        },
      });

      return this.findOne(tenantId, existingUser.id);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = await this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        passwordHash,
        role: createUserDto.role,
      },
    });

    // Add user to tenant
    await this.prisma.userTenant.create({
      data: {
        userId: user.id,
        tenantId,
      },
    });

    return this.findOne(tenantId, user.id);
  }

  async findAll(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          active: true,
          userTenants: {
            some: {
              tenantId,
              active: true,
            },
          },
        },
        include: {
          userTenants: {
            where: { tenantId },
            select: { roleOverride: true, active: true, createdAt: true },
          },
        },
        orderBy: { name: "asc" },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: {
          active: true,
          userTenants: {
            some: {
              tenantId,
              active: true,
            },
          },
        },
      }),
    ]);

    const formattedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.userTenants[0]?.roleOverride || user.role,
      active: user.active,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      joinedAt: user.userTenants[0]?.createdAt,
    }));

    return {
      data: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        active: true,
        userTenants: {
          some: {
            tenantId,
            active: true,
          },
        },
      },
      include: {
        userTenants: {
          where: { tenantId },
          select: { roleOverride: true, active: true, createdAt: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("Usuário não encontrado");
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.userTenants[0]?.roleOverride || user.role,
      active: user.active,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      joinedAt: user.userTenants[0]?.createdAt,
    };
  }

  async update(tenantId: string, id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(tenantId, id);

    const updateData: any = {};

    // Update user table fields
    if (updateUserDto.name) updateData.name = updateUserDto.name;
    if (updateUserDto.email) {
      // Check if email is already taken by another user
      const existingUser = await this.prisma.user.findFirst({
        where: {
          email: updateUserDto.email,
          id: { not: id },
        },
      });

      if (existingUser) {
        throw new BadRequestException("Email já está em uso");
      }
      updateData.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      updateData.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Update user
    if (Object.keys(updateData).length > 0) {
      await this.prisma.user.update({
        where: { id },
        data: updateData,
      });
    }

    // Update role if provided
    if (updateUserDto.role) {
      await this.prisma.userTenant.updateMany({
        where: {
          userId: id,
          tenantId,
        },
        data: {
          roleOverride: updateUserDto.role,
        },
      });
    }

    return this.findOne(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    // Check if user has dependencies
    const userUsage = await this.prisma.user.findFirst({
      where: { id },
      include: {
        _count: {
          select: {
            requestedTrips: true,
            managedTrips: true,
            expenses: true,
            reimbursements: true,
          },
        },
      },
    });

    const hasUsage =
      userUsage._count.requestedTrips > 0 ||
      userUsage._count.managedTrips > 0 ||
      userUsage._count.expenses > 0 ||
      userUsage._count.reimbursements > 0;

    if (hasUsage) {
      // Soft delete - remove from tenant but keep user data
      await this.prisma.userTenant.updateMany({
        where: {
          userId: id,
          tenantId,
        },
        data: {
          active: false,
        },
      });

      return {
        message: "Usuário desativado no tenant (há registros vinculados)",
      };
    } else {
      // Remove from tenant
      await this.prisma.userTenant.deleteMany({
        where: {
          userId: id,
          tenantId,
        },
      });

      // Check if user belongs to other tenants
      const otherTenants = await this.prisma.userTenant.findMany({
        where: { userId: id },
      });

      if (otherTenants.length === 0) {
        // If user doesn't belong to other tenants, deactivate user
        await this.prisma.user.update({
          where: { id },
          data: { active: false },
        });
      }

      return { message: "Usuário removido com sucesso" };
    }
  }

  async updateLastLogin(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        userTenants: {
          where: { active: true },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
                active: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserTenants(userId: string) {
    const userTenants = await this.prisma.userTenant.findMany({
      where: {
        userId,
        active: true,
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            cnpj: true,
            active: true,
          },
        },
      },
    });

    return userTenants.map((ut) => ({
      id: ut.tenant.id,
      name: ut.tenant.name,
      cnpj: ut.tenant.cnpj,
      role: ut.roleOverride,
      active: ut.tenant.active,
    }));
  }
}
