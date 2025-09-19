import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ConfigService } from "@nestjs/config";

import { PrismaService } from "../prisma/prisma.service";
import { Public } from "../common/decorators/public.decorator";

@ApiTags("Health Check")
@Controller("health")
export class HealthController {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: "Health check básico" })
  @ApiResponse({
    status: 200,
    description: "API funcionando corretamente",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        timestamp: { type: "string", format: "date-time" },
        uptime: { type: "number", example: 123.456 },
        environment: { type: "string", example: "development" },
        version: { type: "string", example: "1.0.0" },
      },
    },
  })
  getHealth() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get("NODE_ENV", "development"),
      version: process.env.npm_package_version || "1.0.0",
    };
  }

  @Public()
  @Get("detailed")
  @ApiOperation({ summary: "Health check detalhado" })
  @ApiResponse({
    status: 200,
    description: "Status detalhado dos serviços",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        timestamp: { type: "string", format: "date-time" },
        services: {
          type: "object",
          properties: {
            database: {
              type: "object",
              properties: {
                status: { type: "string", example: "ok" },
                responseTime: { type: "number", example: 15 },
              },
            },
            storage: {
              type: "object",
              properties: {
                status: { type: "string", example: "ok" },
                responseTime: { type: "number", example: 8 },
              },
            },
          },
        },
        system: {
          type: "object",
          properties: {
            uptime: { type: "number", example: 123.456 },
            memory: {
              type: "object",
              properties: {
                used: { type: "number" },
                total: { type: "number" },
                free: { type: "number" },
              },
            },
            cpu: {
              type: "object",
              properties: {
                usage: { type: "number", example: 45.2 },
              },
            },
          },
        },
      },
    },
  })
  async getDetailedHealth() {
    const startTime = Date.now();

    // Check database connection
    let databaseStatus = "ok";
    let databaseResponseTime = 0;
    try {
      const dbStart = Date.now();
      await this.prisma.$queryRaw`SELECT 1`;
      databaseResponseTime = Date.now() - dbStart;
    } catch (error) {
      databaseStatus = "error";
    }

    // Check storage (MinIO) - simple check
    let storageStatus = "ok";
    let storageResponseTime = 0;
    try {
      const storageStart = Date.now();
      // Simple ping to storage service would go here
      // For now, just simulate
      await new Promise((resolve) => setTimeout(resolve, 5));
      storageResponseTime = Date.now() - storageStart;
    } catch (error) {
      storageStatus = "error";
    }

    // System information
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const totalResponseTime = Date.now() - startTime;

    return {
      status:
        databaseStatus === "ok" && storageStatus === "ok" ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      responseTime: totalResponseTime,
      services: {
        database: {
          status: databaseStatus,
          responseTime: databaseResponseTime,
        },
        storage: {
          status: storageStatus,
          responseTime: storageResponseTime,
        },
      },
      system: {
        uptime: process.uptime(),
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          free: Math.round(
            (memoryUsage.heapTotal - memoryUsage.heapUsed) / 1024 / 1024
          ), // MB
        },
        cpu: {
          user: cpuUsage.user,
          system: cpuUsage.system,
        },
        environment: this.configService.get("NODE_ENV", "development"),
        version: process.env.npm_package_version || "1.0.0",
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
      },
    };
  }

  @Public()
  @Get("ready")
  @ApiOperation({ summary: "Readiness check para Kubernetes" })
  @ApiResponse({
    status: 200,
    description: "Aplicação pronta para receber requests",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "ready" },
        timestamp: { type: "string", format: "date-time" },
      },
    },
  })
  async getReadiness() {
    try {
      // Check if database is accessible
      await this.prisma.$queryRaw`SELECT 1`;

      return {
        status: "ready",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: "not-ready",
        timestamp: new Date().toISOString(),
        error: "Database connection failed",
      };
    }
  }

  @Public()
  @Get("live")
  @ApiOperation({ summary: "Liveness check para Kubernetes" })
  @ApiResponse({
    status: 200,
    description: "Aplicação está viva",
    schema: {
      type: "object",
      properties: {
        status: { type: "string", example: "alive" },
        timestamp: { type: "string", format: "date-time" },
        uptime: { type: "number", example: 123.456 },
      },
    },
  })
  getLiveness() {
    return {
      status: "alive",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
