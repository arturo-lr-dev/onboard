# Step 5: Next.js Frontend Scaffold (Dia 8-10)

## Objetivo
Crear el frontend Next.js con autenticacion, layout del dashboard y sistema de componentes.

---

## Tareas

### 5.1 Scaffold del proyecto

```bash
cd apps/
npx create-next-app@latest web --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

**Agregar dependencias:**
```bash
cd apps/web
npm install next-auth@beta
npm install @radix-ui/react-icons lucide-react
npm install clsx tailwind-merge
```

**Agregar `@onboard/shared` al package.json:**
```json
{
  "dependencies": {
    "@onboard/shared": "workspace:*"
  }
}
```

### 5.2 NextAuth.js v5 Config

**`src/lib/auth.ts`:**
```typescript
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        // POST al NestJS API /api/v1/auth/login
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });
        if (!res.ok) return null;
        const data = await res.json();
        return {
          id: data.user.id,
          email: data.user.email,
          name: data.user.fullName,
          accessToken: data.token,
          companyId: data.user.companyId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.companyId = user.companyId;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.companyId = token.companyId;
      return session;
    },
  },
  pages: {
    signIn: '/sign-in',
  },
  session: { strategy: 'jwt' },
});
```

**`src/app/api/auth/[...nextauth]/route.ts`:**
```typescript
import { handlers } from '@/lib/auth';
export const { GET, POST } = handlers;
```

### 5.3 Middleware

**`src/middleware.ts`:**
```typescript
export { auth as middleware } from '@/lib/auth';

export const config = {
  matcher: ['/(dashboard)(.*)', '/onboarding(.*)'],
};
```

Protege `/dashboard/*` y `/onboarding/*`. Redirige a `/sign-in` si no autenticado.

### 5.4 Auth Pages

**`src/app/(auth)/sign-in/page.tsx`:**
- Form con email + password
- Boton "Sign in"
- Link a "/sign-up"
- Estilizado con branding Onboard (fondo Midnight Blue, acento Electric Cyan)

**`src/app/(auth)/sign-up/page.tsx`:**
- Form con fullName, email, password, companyName
- Llama a `POST /api/v1/auth/register` directamente
- Despues hace signIn con NextAuth
- Redirect a `/onboarding`

### 5.5 Root Layout

**`src/app/layout.tsx`:**
```typescript
import { SessionProvider } from 'next-auth/react';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
```

### 5.6 Dashboard Layout

**`src/app/(dashboard)/layout.tsx`:**

Layout con sidebar fijo a la izquierda + area de contenido.

**Sidebar (src/components/layout/sidebar.tsx):**
- Fondo: Midnight Blue `#0A1128`
- Logo Onboard arriba
- Nav items con iconos (Lucide):
  - Dashboard (LayoutDashboard)
  - Agents (Bot)
  - Knowledge Base (FileText)
  - Audit Logs (ScrollText)
  - Settings (Settings)
- User info abajo (nombre, email, sign out)
- Ancho: 256px desktop, colapsable en mobile

**Header (src/components/layout/header.tsx):**
- Breadcrumbs
- Titulo de pagina
- Acciones contextuales (boton "New Agent", etc.)

### 5.7 shadcn/ui Setup

```bash
npx shadcn@latest init
```

Configurar con colores Onboard en `globals.css`:

```css
:root {
  --primary: 190 100% 50%;        /* Electric Cyan #00D9FF */
  --primary-foreground: 220 80% 10%; /* Midnight Blue */
  --secondary: 215 15% 55%;       /* Steel Gray */
  --background: 0 0% 100%;
  --foreground: 215 28% 17%;      /* Slate */
  --accent: 190 100% 50%;
  --destructive: 0 84% 60%;       /* Error red */
}

.dark {
  --background: 220 80% 10%;      /* Midnight Blue */
  --foreground: 210 40% 98%;
}
```

**Componentes a instalar:**
```bash
npx shadcn@latest add button card input label table badge
npx shadcn@latest add dialog dropdown-menu separator skeleton
npx shadcn@latest add toast tabs form select textarea
```

### 5.8 API Client

**`src/lib/api-client.ts`:**
```typescript
import { auth } from '@/lib/auth';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  }

  private async getHeaders(): Promise<HeadersInit> {
    const session = await auth();
    return {
      'Content-Type': 'application/json',
      ...(session?.accessToken && {
        Authorization: `Bearer ${session.accessToken}`,
      }),
    };
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: await this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: await this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PATCH',
      headers: await this.getHeaders(),
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  async delete(path: string): Promise<void> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: await this.getHeaders(),
    });
    if (!res.ok) throw new Error(await res.text());
  }

  // Para uploads multipart
  async upload<T>(path: string, formData: FormData): Promise<T> {
    const session = await auth();
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        ...(session?.accessToken && {
          Authorization: `Bearer ${session.accessToken}`,
        }),
      },
      body: formData,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
}

export const api = new ApiClient();
```

### 5.9 `.env.local.example`

```
NEXTAUTH_SECRET=generate-a-random-32-char-string
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Verificacion

- [ ] `npm run dev` en `apps/web/` arranca en localhost:3000
- [ ] `/sign-in` muestra form estilizado con branding Onboard
- [ ] `/sign-up` permite registrarse (llama al API)
- [ ] Despues de login, redirige a `/dashboard`
- [ ] `/dashboard` muestra sidebar con nav items
- [ ] Sidebar tiene fondo Midnight Blue, accent Electric Cyan
- [ ] Visitar `/dashboard` sin auth redirige a `/sign-in`
- [ ] shadcn/ui componentes renderizan con colores correctos
- [ ] Fonts Inter y JetBrains Mono cargadas
