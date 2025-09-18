import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

interface JwtPayload {
  sub: string;
  email: string;
  tenantId: string;
  role: string;
  type: 'access' | 'refresh';
}

interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    tenants: Array<{
      id: string;
      name: string;
      role: string;
    }>;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

@Injectable()
export class AuthService {
  private refreshTokens = new Map<string, { userId: string; tenantId: string }>();

  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    // Get user tenants
    const userTenants = await this.prisma.userTenant.findMany({
      where: { userId: user.id, active: true },
      include: { tenant: true },
    });

    if (userTenants.length === 0) {
      throw new UnauthorizedException('Usuário não possui acesso a nenhum tenant');
    }

    // Use first tenant if not specified
    const selectedTenant = loginDto.tenantId 
      ? userTenants.find(ut => ut.tenantId === loginDto.tenantId)
      : userTenants[0];

    if (!selectedTenant) {
      throw new UnauthorizedException('Tenant não encontrado ou acesso negado');
    }

    const role = selectedTenant.roleOverride || user.role;
    
    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, selectedTenant.tenantId, role);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role,
        tenants: userTenants.map(ut => ({
          id: ut.tenant.id,
          name: ut.tenant.name,
          role: ut.roleOverride || user.role,
        })),
      },
      tokens,
    };
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email já está em uso');
    }

    // Hash password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user and tenant in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: registerDto.email,
          name: registerDto.name,
          passwordHash,
          role: 'ADMIN', // First user is always admin
        },
      });

      const tenant = await tx.tenant.create({
        data: {
          name: registerDto.companyName,
          cnpj: registerDto.cnpj,
        },
      });

      await tx.userTenant.create({
        data: {
          userId: user.id,
          tenantId: tenant.id,
          roleOverride: 'ADMIN',
        },
      });

      return { user, tenant };
    });

    const tokens = await this.generateTokens(
      result.user.id,
      result.user.email,
      result.tenant.id,
      'ADMIN',
    );

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        role: 'ADMIN',
        tenants: [{
          id: result.tenant.id,
          name: result.tenant.name,
          role: 'ADMIN',
        }],
      },
      tokens,
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string; expiresIn: number }> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      }) as JwtPayload;

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Token inválido');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.active) {
        throw new UnauthorizedException('Usuário não encontrado ou inativo');
      }

      const accessToken = await this.generateAccessToken(
        payload.sub,
        payload.email,
        payload.tenantId,
        payload.role,
      );

      return {
        accessToken,
        expiresIn: this.getTokenExpirationTime(),
      };
    } catch (error) {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // Don't reveal if email exists
      return;
    }

    // Here you would typically send an email with reset link
    // For now, just log the reset token
    const resetToken = uuidv4();
    console.log(`Reset token for ${forgotPasswordDto.email}: ${resetToken}`);
    
    // In a real implementation, store the reset token in database with expiration
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    // In a real implementation, verify the reset token
    // For now, just update password by email (this is not secure!)
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(resetPasswordDto.newPassword, saltRounds);

    await this.prisma.user.updateMany({
      where: { email: resetPasswordDto.email },
      data: { passwordHash },
    });
  }

  private async generateTokens(userId: string, email: string, tenantId: string, role: string) {
    const accessToken = await this.generateAccessToken(userId, email, tenantId, role);
    const refreshToken = await this.generateRefreshToken(userId, email, tenantId, role);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.getTokenExpirationTime(),
    };
  }

  private async generateAccessToken(userId: string, email: string, tenantId: string, role: string): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      tenantId,
      role,
      type: 'access',
    };

    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(userId: string, email: string, tenantId: string, role: string): Promise<string> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      tenantId,
      role,
      type: 'refresh',
    };

    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
  }

  private getTokenExpirationTime(): number {
    const expiresIn = this.configService.get('JWT_EXPIRES_IN', '15m');
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 900; // 15 minutes default

    const [, value, unit] = match;
    const multipliers = { s: 1, m: 60, h: 3600, d: 86400 };
    return parseInt(value) * (multipliers[unit] || 60);
  }
}