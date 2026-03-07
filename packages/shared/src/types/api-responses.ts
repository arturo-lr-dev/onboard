export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string | null;
    role: string;
    companyId: string;
  };
}

export interface RegisterDto {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
