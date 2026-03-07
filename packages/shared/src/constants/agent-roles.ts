import type { AgentRole } from '../types/agent';

export const AGENT_ROLES: Record<AgentRole, { label: string; description: string }> = {
  customer_support: {
    label: 'Customer Support',
    description: 'Handle customer inquiries, resolve issues, and provide assistance',
  },
  sales: {
    label: 'Sales',
    description: 'Manage sales pipeline, qualify leads, and assist with deals',
  },
  engineering: {
    label: 'Engineering',
    description: 'Assist with code reviews, documentation, and technical tasks',
  },
  ops: {
    label: 'Operations',
    description: 'Monitor systems, manage workflows, and handle operational tasks',
  },
  custom: {
    label: 'Custom',
    description: 'Custom role with user-defined capabilities',
  },
};
