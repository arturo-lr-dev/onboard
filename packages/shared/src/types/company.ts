export interface Company {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCompanyDto {
  name: string;
  slug: string;
}

export interface UpdateCompanyDto {
  name?: string;
}

export interface CompanyStats {
  agentCount: number;
  documentCount: number;
  activeAgents: number;
}
