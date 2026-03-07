import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { DATABASE } from '../../database/database.module.js';
import * as schema from '../../database/schema.js';
import { StorageService } from '../storage/storage.service.js';

const ALLOWED_TYPES = ['application/pdf', 'text/markdown', 'text/plain'];
const ALLOWED_EXTENSIONS = ['.pdf', '.md', '.txt'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @Inject(DATABASE) private readonly db: PostgresJsDatabase<typeof schema>,
    private readonly storageService: StorageService,
  ) {}

  async findAll(companyId: string) {
    return this.db
      .select()
      .from(schema.knowledgeBaseDocuments)
      .where(eq(schema.knowledgeBaseDocuments.companyId, companyId));
  }

  async upload(
    companyId: string,
    userId: string,
    file: Express.Multer.File,
  ) {
    const ext = '.' + file.originalname.split('.').pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        `File type not allowed. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const storagePath = `${companyId}/${Date.now()}_${file.originalname}`;

    await this.storageService.upload(
      'knowledge-base',
      storagePath,
      file.buffer,
      file.mimetype,
    );

    const [document] = await this.db
      .insert(schema.knowledgeBaseDocuments)
      .values({
        companyId,
        title: file.originalname.replace(/\.[^/.]+$/, ''),
        fileName: file.originalname,
        fileType: ext.replace('.', ''),
        fileSize: file.size,
        storagePath,
        status: 'processing',
        uploadedBy: userId,
      })
      .returning();

    return document;
  }

  async remove(id: string, companyId: string) {
    const [document] = await this.db
      .select()
      .from(schema.knowledgeBaseDocuments)
      .where(
        and(
          eq(schema.knowledgeBaseDocuments.id, id),
          eq(schema.knowledgeBaseDocuments.companyId, companyId),
        ),
      );

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.storageService.delete('knowledge-base', document.storagePath);

    await this.db
      .delete(schema.knowledgeBaseDocuments)
      .where(eq(schema.knowledgeBaseDocuments.id, id));

    return { deleted: true };
  }

  async attachToAgent(documentId: string, agentId: string, companyId: string) {
    // Verify document belongs to company
    const [document] = await this.db
      .select()
      .from(schema.knowledgeBaseDocuments)
      .where(
        and(
          eq(schema.knowledgeBaseDocuments.id, documentId),
          eq(schema.knowledgeBaseDocuments.companyId, companyId),
        ),
      );

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Verify agent belongs to company
    const [agent] = await this.db
      .select()
      .from(schema.agents)
      .where(
        and(
          eq(schema.agents.id, agentId),
          eq(schema.agents.companyId, companyId),
        ),
      );

    if (!agent) {
      throw new NotFoundException('Agent not found');
    }

    await this.db
      .insert(schema.agentKnowledgeBase)
      .values({ agentId, documentId })
      .onConflictDoNothing();

    return { attached: true };
  }

  async detachFromAgent(documentId: string, agentId: string, companyId: string) {
    // Verify document belongs to company
    const [document] = await this.db
      .select()
      .from(schema.knowledgeBaseDocuments)
      .where(
        and(
          eq(schema.knowledgeBaseDocuments.id, documentId),
          eq(schema.knowledgeBaseDocuments.companyId, companyId),
        ),
      );

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    await this.db
      .delete(schema.agentKnowledgeBase)
      .where(
        and(
          eq(schema.agentKnowledgeBase.agentId, agentId),
          eq(schema.agentKnowledgeBase.documentId, documentId),
        ),
      );

    return { detached: true };
  }
}
