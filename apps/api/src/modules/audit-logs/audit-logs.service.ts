import { Injectable, Inject } from '@nestjs/common';
import { eq, and, gte, lte, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE } from '../../database/database.module.js';
import * as schema from '../../database/schema.js';

@Injectable()
export class AuditLogsService {
  constructor(
    @Inject(DATABASE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAll(
    companyId: string,
    filters: {
      action?: string;
      agentId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    },
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    const conditions = [eq(schema.auditLogs.companyId, companyId)];

    if (filters.action) {
      conditions.push(eq(schema.auditLogs.action, filters.action));
    }

    if (filters.agentId) {
      conditions.push(eq(schema.auditLogs.agentId, filters.agentId));
    }

    if (filters.startDate) {
      conditions.push(gte(schema.auditLogs.createdAt, new Date(filters.startDate)));
    }

    if (filters.endDate) {
      conditions.push(lte(schema.auditLogs.createdAt, new Date(filters.endDate)));
    }

    const logs = await this.db
      .select()
      .from(schema.auditLogs)
      .where(and(...conditions))
      .orderBy(desc(schema.auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      data: logs,
      page,
      limit,
    };
  }

  async exportCsv(companyId: string) {
    const logs = await this.db
      .select()
      .from(schema.auditLogs)
      .where(eq(schema.auditLogs.companyId, companyId))
      .orderBy(desc(schema.auditLogs.createdAt));

    const headers = [
      'id',
      'action',
      'resource_type',
      'resource_id',
      'user_id',
      'agent_id',
      'ip_address',
      'created_at',
    ];

    const rows = logs.map((log) =>
      [
        log.id,
        log.action,
        log.resourceType,
        log.resourceId || '',
        log.userId || '',
        log.agentId || '',
        log.ipAddress || '',
        log.createdAt.toISOString(),
      ].join(','),
    );

    return [headers.join(','), ...rows].join('\n');
  }
}
