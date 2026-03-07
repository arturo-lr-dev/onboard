import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import configuration from './config/configuration.js';
import { DatabaseModule } from './database/database.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CompaniesModule } from './modules/companies/companies.module.js';
import { AgentsModule } from './modules/agents/agents.module.js';
import { KnowledgeBaseModule } from './modules/knowledge-base/knowledge-base.module.js';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module.js';
import { StorageModule } from './modules/storage/storage.module.js';
import { AuthGuard } from './common/guards/auth.guard.js';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    DatabaseModule,
    AuthModule,
    CompaniesModule,
    AgentsModule,
    KnowledgeBaseModule,
    AuditLogsModule,
    StorageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],
})
export class AppModule {}
