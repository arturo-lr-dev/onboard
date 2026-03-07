export type UserRole = 'owner' | 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  fullName: string | null;
  companyId: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
