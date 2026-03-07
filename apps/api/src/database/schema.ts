import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  jsonb,
  timestamp,
  primaryKey,
} from 'drizzle-orm/pg-core';

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  plan: text('plan').notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  fullName: text('full_name').notNull(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  role: text('role').notNull().default('member'),
  emailVerified: boolean('email_verified').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const agents = pgTable('agents', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  role: text('role').notNull(),
  description: text('description'),
  status: text('status').notNull().default('draft'),
  permissions: jsonb('permissions'),
  constraints: jsonb('constraints'),
  systemPrompt: text('system_prompt'),
  config: jsonb('config'),
  apiKey: text('api_key').unique(),
  createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const knowledgeBaseDocuments = pgTable('knowledge_base_documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size').notNull(),
  storagePath: text('storage_path').notNull(),
  status: text('status').notNull().default('processing'),
  metadata: jsonb('metadata'),
  uploadedBy: uuid('uploaded_by').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const agentKnowledgeBase = pgTable(
  'agent_knowledge_base',
  {
    agentId: uuid('agent_id')
      .notNull()
      .references(() => agents.id, { onDelete: 'cascade' }),
    documentId: uuid('document_id')
      .notNull()
      .references(() => knowledgeBaseDocuments.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.agentId, table.documentId] })],
);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').references(() => agents.id, { onDelete: 'set null' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: text('action').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceId: uuid('resource_id'),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
