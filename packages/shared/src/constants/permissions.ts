export const AGENT_PERMISSIONS = [
  'read_data',
  'write_data',
  'delete_data',
  'send_emails',
  'access_api',
  'manage_users',
  'view_analytics',
  'export_data',
  'manage_integrations',
  'execute_workflows',
] as const;

export type AgentPermission = (typeof AGENT_PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<AgentPermission, string> = {
  read_data: 'Read Data',
  write_data: 'Write Data',
  delete_data: 'Delete Data',
  send_emails: 'Send Emails',
  access_api: 'Access External APIs',
  manage_users: 'Manage Users',
  view_analytics: 'View Analytics',
  export_data: 'Export Data',
  manage_integrations: 'Manage Integrations',
  execute_workflows: 'Execute Workflows',
};
