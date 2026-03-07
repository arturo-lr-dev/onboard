import type { AgentStatus } from '../types/agent';
import type { DocumentStatus } from '../types/document';

export const AGENT_STATUS_LABELS: Record<AgentStatus, string> = {
  draft: 'Draft',
  configuring: 'Configuring',
  active: 'Active',
  paused: 'Paused',
  archived: 'Archived',
};

export const AGENT_STATUS_TRANSITIONS: Record<AgentStatus, AgentStatus[]> = {
  draft: ['configuring'],
  configuring: ['active', 'draft'],
  active: ['paused', 'archived'],
  paused: ['active', 'archived'],
  archived: [],
};

export const DOCUMENT_STATUS_LABELS: Record<DocumentStatus, string> = {
  processing: 'Processing',
  ready: 'Ready',
  failed: 'Failed',
};
