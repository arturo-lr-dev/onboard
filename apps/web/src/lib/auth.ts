import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import type { AuthResponse } from "@onboard/shared";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (!res.ok) {
            return null;
          }

          const data: { data: AuthResponse } = await res.json();
          const { accessToken, user } = data.data;

          return {
            id: user.id,
            email: user.email,
            name: user.fullName,
            companyId: user.companyId,
            role: user.role,
            accessToken,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.userId = user.id;
        token.companyId = user.companyId;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId;
      session.user.companyId = token.companyId;
      session.user.role = token.role;
      session.user.accessToken = token.accessToken;
      return session;
    },
  },
});
