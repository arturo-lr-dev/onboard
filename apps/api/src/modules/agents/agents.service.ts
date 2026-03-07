import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import * as crypto from 'crypto';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE } from '../../database/database.module.js';
import * as schema from '../../database/schema.js';

@Injectable()
export class AgentsService {
  constructor(
    @Inject(DATABASE) private readonly db: PostgresJsDatabase<typeof schema>,
  ) {}

  async findAll(companyId: string) {
    return this.db
      .select()
      .from(schema.agents)
      .where(eq(schema.agents.companyId, companyId));
  }

  async findOne(id: string, companyId: string) {
    const [agent] = await this.db
      .select()
      .from(schema.agents)
      .where(
        and(eq(schema.agents.id, id), eq(schema.agents.companyId, companyId)),
      );

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    return agent;
  }

  async create(
    companyId: string,
    userId: string,
    dto: {
      name: string;
      role: string;
      description?: string;
      permissions?: any;
      constraints?: any;
      systemPrompt?: string;
      config?: any;
    },
  ) {
    const apiKey = 'onb_live_' + crypto.randomBytes(24).toString('hex');

    const [agent] = await this.db
      .insert(schema.agents)
      .values({
        companyId,
        createdBy: userId,
        apiKey,
        ...dto,
      })
      .returning();

    return agent;
  }

  async update(
    id: string,
    companyId: string,
    dto: {
      name?: string;
      role?: string;
      description?: string;
      permissions?: any;
      constraints?: any;
      systemPrompt?: string;
      config?: any;
    },
  ) {
    await this.findOne(id, companyId);

    const [agent] = await this.db
      .update(schema.agents)
      .set({ ...dto, updatedAt: new Date() })
      .where(
        and(eq(schema.agents.id, id), eq(schema.agents.companyId, companyId)),
      )
      .returning();

    return agent;
  }

  async remove(id: string, companyId: string) {
    await this.findOne(id, companyId);

    await this.db
      .delete(schema.agents)
      .where(
        and(eq(schema.agents.id, id), eq(schema.agents.companyId, companyId)),
      );

    return { deleted: true };
  }

  async activate(id: string, companyId: string) {
    const agent = await this.findOne(id, companyId);

    if (agent.status !== 'draft' && agent.status !== 'paused') {
      throw new BadRequestException(
        `Cannot activate agent with status '${agent.status}'. Agent must be in 'draft' or 'paused' status.`,
      );
    }

    const [updated] = await this.db
      .update(schema.agents)
      .set({ status: 'active', updatedAt: new Date() })
      .where(
        and(eq(schema.agents.id, id), eq(schema.agents.companyId, companyId)),
      )
      .returning();

    return updated;
  }

  async pause(id: string, companyId: string) {
    const agent = await this.findOne(id, companyId);

    if (agent.status !== 'active') {
      throw new BadRequestException(
        `Cannot pause agent with status '${agent.status}'. Agent must be in 'active' status.`,
      );
    }

    const [updated] = await this.db
      .update(schema.agents)
      .set({ status: 'paused', updatedAt: new Date() })
      .where(
        and(eq(schema.agents.id, id), eq(schema.agents.companyId, companyId)),
      )
      .returning();

    return updated;
  }

  async regenerateApiKey(id: string, companyId: string) {
    await this.findOne(id, companyId);

    const newApiKey = 'onb_live_' + crypto.randomBytes(24).toString('hex');

    const [updated] = await this.db
      .update(schema.agents)
      .set({ apiKey: newApiKey, updatedAt: new Date() })
      .where(
        and(eq(schema.agents.id, id), eq(schema.agents.companyId, companyId)),
      )
      .returning();

    return { apiKey: updated.apiKey };
  }

  async generateConfig(id: string, companyId: string) {
    const agent = await this.findOne(id, companyId);

    const linkedDocs = await this.db
      .select({
        id: schema.knowledgeBaseDocuments.id,
        title: schema.knowledgeBaseDocuments.title,
        fileName: schema.knowledgeBaseDocuments.fileName,
        fileType: schema.knowledgeBaseDocuments.fileType,
        storagePath: schema.knowledgeBaseDocuments.storagePath,
        metadata: schema.knowledgeBaseDocuments.metadata,
      })
      .from(schema.agentKnowledgeBase)
      .innerJoin(
        schema.knowledgeBaseDocuments,
        eq(schema.agentKnowledgeBase.documentId, schema.knowledgeBaseDocuments.id),
      )
      .where(eq(schema.agentKnowledgeBase.agentId, id));

    const agentConfig = {
      agent: {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        description: agent.description,
        status: agent.status,
        systemPrompt: agent.systemPrompt,
        permissions: agent.permissions,
        constraints: agent.constraints,
        config: agent.config,
      },
      knowledgeBase: linkedDocs.map((doc) => ({
        id: doc.id,
        title: doc.title,
        fileName: doc.fileName,
        fileType: doc.fileType,
        storagePath: doc.storagePath,
        metadata: doc.metadata,
      })),
      apiKey: agent.apiKey,
      generatedAt: new Date().toISOString(),
    };

    return agentConfig;
  }
}
