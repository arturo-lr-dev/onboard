export type AgentRole = 'customer_support' | 'sales' | 'engineering' | 'ops' | 'custom';
export type AgentStatus = 'draft' | 'configuring' | 'active' | 'paused' | 'archived';

export interface Agent {
  id: string;
  companyId: string;
  name: string;
  role: AgentRole;
  description: string | null;
  status: AgentStatus;
  permissions: string[];
  constraints: Record<string, unknown>;
  systemPrompt: string | null;
  config: Record<string, unknown> | null;
  apiKey: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentDto {
  name: string;
  role: AgentRole;
  description?: string;
  permissions?: string[];
  constraints?: Record<string, unknown>;
  systemPrompt?: string;
}

export interface UpdateAgentDto {
  name?: string;
  role?: AgentRole;
  description?: string;
  permissions?: string[];
  constraints?: Record<string, unknown>;
  systemPrompt?: string;
}

export interface AgentConfig {
  agent: {
    id: string;
    name: string;
    role: AgentRole;
    version: string;
  };
  permissions: string[];
  constraints: Record<string, unknown>;
  systemPrompt: string;
  knowledgeBase: {
    documentIds: string[];
    documentCount: number;
  };
  generatedAt: string;
}
