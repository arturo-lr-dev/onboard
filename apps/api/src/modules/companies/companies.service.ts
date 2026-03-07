import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, and, count } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE } from '../../database/database.module.js';
import * as schema from '../../database/schema.js';

@Injectable()
export class CompaniesService {
  constructor(
    @Inject(DATABASE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async getCompany(companyId: string) {
    const [company] = await this.db
      .select()
      .from(schema.companies)
      .where(eq(schema.companies.id, companyId))
      .limit(1);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async updateCompany(companyId: string, dto: { name?: string }) {
    const updateData: Record<string, any> = { updatedAt: new Date() };

    if (dto.name) {
      updateData.name = dto.name;
    }

    const [company] = await this.db
      .update(schema.companies)
      .set(updateData)
      .where(eq(schema.companies.id, companyId))
      .returning();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async getStats(companyId: string) {
    const [agentCountResult] = await this.db
      .select({ value: count() })
      .from(schema.agents)
      .where(eq(schema.agents.companyId, companyId));

    const [documentCountResult] = await this.db
      .select({ value: count() })
      .from(schema.knowledgeBaseDocuments)
      .where(eq(schema.knowledgeBaseDocuments.companyId, companyId));

    const [activeAgentsResult] = await this.db
      .select({ value: count() })
      .from(schema.agents)
      .where(
        and(
          eq(schema.agents.companyId, companyId),
          eq(schema.agents.status, 'active'),
        ),
      );

    return {
      agentCount: agentCountResult.value,
      documentCount: documentCountResult.value,
      activeAgents: activeAgentsResult.value,
    };
  }
}
