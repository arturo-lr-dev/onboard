export type AuditAction =
  | 'agent.created'
  | 'agent.updated'
  | 'agent.deleted'
  | 'agent.activated'
  | 'agent.paused'
  | 'agent.config_generated'
  | 'agent.api_key_regenerated'
  | 'document.uploaded'
  | 'document.deleted'
  | 'document.attached'
  | 'document.detached'
  | 'company.updated'
  | 'user.login'
  | 'user.registered';

export type AuditResourceType = 'agent' | 'document' | 'company' | 'user';

export interface AuditLog {
  id: string;
  companyId: string;
  agentId: string | null;
  userId: string | null;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogFilter {
  action?: AuditAction;
  agentId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
