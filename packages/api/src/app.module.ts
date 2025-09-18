import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TenantsModule } from './tenants/tenants.module';
import { CostCentersModule } from './cost-centers/cost-centers.module';
import { ProjectsModule } from './projects/projects.module';
import { PoliciesModule } from './policies/policies.module';
import { BudgetsModule } from './budgets/budgets.module';
import { TripsModule } from './trips/trips.module';
import { AdvancesModule } from './advances/advances.module';
import { ExpensesModule } from './expenses/expenses.module';
import { ReimbursementsModule } from './reimbursements/reimbursements.module';
import { ReportsModule } from './reports/reports.module';
import { FilesModule } from './files/files.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { FxModule } from './fx/fx.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuditModule } from './audit/audit.module';
import { HealthModule } from './health/health.module';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { TenantGuard } from './common/guards/tenant.guard';
import { ThrottlerBehindProxyGuard } from './common/guards/throttler.guard';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get('THROTTLE_TTL', 60000),
          limit: config.get('THROTTLE_LIMIT', 100),
        },
      ],
    }),

    // Core modules
    PrismaModule,
    AuthModule,
    UsersModule,
    TenantsModule,
    CostCentersModule,
    ProjectsModule,
    PoliciesModule,
    BudgetsModule,
    TripsModule,
    AdvancesModule,
    ExpensesModule,
    ReimbursementsModule,
    ReportsModule,
    FilesModule,
    WebhooksModule,
    FxModule,
    NotificationsModule,
    AuditModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: TenantGuard,
    },
  ],
})
export class AppModule {}