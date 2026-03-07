import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      companyId: string;
      role: string;
      accessToken: string;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    companyId: string;
    role: string;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    userId: string;
    companyId: string;
    role: string;
  }
}
