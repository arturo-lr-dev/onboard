import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { AUDIT_LOG_KEY, AuditLogMetadata } from '../decorators/audit-log.decorator.js';
import { DATABASE } from '../../database/database.module.js';
import * as schema from '../../database/schema.js';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    @Inject(DATABASE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMeta = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );

    if (!auditMeta) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return next.handle().pipe(
      tap(async (responseBody) => {
        try {
          const resourceId =
            responseBody?.id ||
            request.params?.id ||
            undefined;

          await this.db.insert(schema.auditLogs).values({
            companyId: user?.companyId,
            agentId: auditMeta.resourceType === 'agent' ? resourceId : undefined,
            userId: user?.sub,
            action: auditMeta.action,
            resourceType: auditMeta.resourceType,
            resourceId: resourceId || undefined,
            details: responseBody ? { response: responseBody } : undefined,
            ipAddress: request.ip || request.connection?.remoteAddress,
          });
        } catch (error) {
          console.error('Failed to create audit log:', error);
        }
      }),
    );
  }
}
