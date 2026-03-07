# Plan Maestro: Onboard MVP (Phase 1)

## Context

Onboard es una plataforma enterprise para onboarding de agentes IA. Actualmente existe un monorepo Turborepo con solo una landing page en Astro (`apps/landing/`). Construir el MVP (Phase 1 del roadmap) usando **Next.js** (frontend) y **NestJS** (backend). Todas las tecnologias deben ser **gratuitas** (free tiers o open source). Objetivo: onboardear 5 empresas piloto.

---

## Stack Tecnologico (100% Gratis)

| Componente | Tecnologia | Costo | Notas |
|------------|-----------|-------|-------|
| Frontend | Next.js 14 (App Router) | Gratis (OSS) | |
| Backend | NestJS | Gratis (OSS) | |
| Database | Supabase PostgreSQL | Free tier (500MB) | Suficiente para MVP |
| ORM | Drizzle | Gratis (OSS) | Ligero, buen TypeScript |
| Auth | NextAuth.js v5 | Gratis (OSS) | Credentials + OAuth providers |
| UI Components | shadcn/ui + Tailwind | Gratis (OSS) | |
| File Storage | Supabase Storage | Free tier (1GB) | S3-compatible |
| Deploy Frontend | Vercel | Free tier | Ya usado para landing |
| Deploy Backend | Render | Free tier | Auto-sleep tras 15min inactividad |
| Tipos compartidos | packages/shared | - | Monorepo workspace |

---

## Estructura del Proyecto

```
onboard/
├── apps/
│   ├── landing/                        # (existente) Astro
│   ├── web/                            # Next.js 14 - Dashboard
│   │   ├── src/app/
│   │   │   ├── layout.tsx              # Root layout + SessionProvider
│   │   │   ├── api/auth/[...nextauth]/ # NextAuth API route
│   │   │   ├── (auth)/sign-in/         # Custom sign-in page
│   │   │   ├── (auth)/sign-up/         # Custom sign-up page
│   │   │   ├── (dashboard)/layout.tsx  # Sidebar + nav
│   │   │   ├── (dashboard)/dashboard/  # Overview
│   │   │   ├── (dashboard)/agents/     # CRUD agentes
│   │   │   ├── (dashboard)/knowledge-base/  # Documentos
│   │   │   ├── (dashboard)/audit-logs/      # Logs
│   │   │   ├── (dashboard)/settings/        # Config empresa
│   │   │   └── onboarding/            # Wizard post-signup
│   │   ├── src/components/            # UI components
│   │   ├── src/lib/
│   │   │   ├── auth.ts               # NextAuth config
│   │   │   ├── api-client.ts         # Fetch wrapper con session token
│   │   │   └── utils.ts
│   │   ├── src/hooks/                 # React hooks
│   │   └── middleware.ts              # NextAuth middleware
│   │
│   └── api/                           # NestJS
│       ├── src/
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/
│       │   │   ├── guards/auth.guard.ts         # JWT validation
│       │   │   ├── decorators/current-user.decorator.ts
│       │   │   └── interceptors/audit-log.interceptor.ts
│       │   ├── database/
│       │   │   ├── database.module.ts           # Drizzle + PG
│       │   │   ├── schema.ts                    # Drizzle schema completo
│       │   │   └── migrations/
│       │   ├── modules/
│       │   │   ├── auth/                        # JWT issuing + validation
│       │   │   ├── agents/                      # CRUD + config generation
│       │   │   ├── knowledge-base/              # Upload + CRUD
│       │   │   ├── companies/                   # Tenant management
│       │   │   ├── audit-logs/                  # Read + export
│       │   │   └── storage/                     # Supabase Storage wrapper
│       │   └── config/configuration.ts
│       ├── Dockerfile
│       └── render.yaml                          # Render deployment config
│
├── packages/
│   └── shared/                        # Tipos y constantes compartidos
│       └── src/
│           ├── index.ts
│           ├── types/ (agent, company, document, audit-log, api-responses)
│           └── constants/ (agent-roles, permissions, status)
│
├── turbo.json
└── package.json
```

---

## Database Schema

```sql
-- Empresas (tenants)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usuarios (NextAuth managed)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name TEXT,
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Perfiles de agentes IA
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft',
  permissions JSONB DEFAULT '[]',
  constraints JSONB DEFAULT '{}',
  system_prompt TEXT,
  config JSONB,
  api_key TEXT UNIQUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Documentos del knowledge base
CREATE TABLE knowledge_base_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  status TEXT DEFAULT 'processing',
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Junction: agente <-> documentos
CREATE TABLE agent_knowledge_base (
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  document_id UUID REFERENCES knowledge_base_documents(id) ON DELETE CASCADE,
  PRIMARY KEY (agent_id, document_id)
);

-- Audit trail
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_agents_company ON agents(company_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_kb_docs_company ON knowledge_base_documents(company_id);
CREATE INDEX idx_audit_company ON audit_logs(company_id);
CREATE INDEX idx_audit_agent ON audit_logs(agent_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX idx_users_company ON users(company_id);
```

---

## API Endpoints (NestJS)

### Auth (`/api/v1/auth`)
- `POST /register` - Registro (crea user + company)
- `POST /login` - Login (devuelve JWT)
- `GET /me` - Usuario actual + company

### Agents (`/api/v1/agents`)
- `GET /` - Listar agentes de la company
- `GET /:id` - Detalle agente
- `POST /` - Crear agente
- `PATCH /:id` - Actualizar agente
- `DELETE /:id` - Eliminar agente
- `POST /:id/activate` - Activar
- `POST /:id/pause` - Pausar
- `POST /:id/generate-config` - Generar config JSON
- `POST /:id/regenerate-api-key` - Regenerar API key

### Knowledge Base (`/api/v1/knowledge-base`)
- `GET /` - Listar documentos
- `POST /upload` - Subir documento (multipart, max 10MB)
- `DELETE /:id` - Eliminar documento
- `POST /:id/attach/:agentId` - Vincular doc a agente
- `DELETE /:id/detach/:agentId` - Desvincular

### Audit Logs (`/api/v1/audit-logs`)
- `GET /` - Listar logs (paginados, filtrables por action, agent, fecha)
- `GET /export` - Exportar CSV

### Company (`/api/v1/company`)
- `GET /` - Company actual
- `PATCH /` - Actualizar settings
- `GET /stats` - Dashboard stats (agent count, doc count, active agents)

---

## Auth Flow (NextAuth.js + NestJS JWT)

1. Usuario visita `/sign-up` -> Form custom con NextAuth credentials provider
2. `POST /api/v1/auth/register` crea user + company en DB, devuelve JWT
3. NextAuth almacena session (JWT strategy, sin DB session)
4. Redirect a `/onboarding` (wizard: company name -> primer agente -> upload doc)
5. `middleware.ts` protege todas las rutas `/dashboard/*`
6. API calls: frontend envia JWT en header `Authorization: Bearer <token>`
7. NestJS `AuthGuard` valida JWT y extrae `userId` + `companyId`
8. Multi-tenancy: todas las queries filtradas por `company_id`

---

## Orden de Implementacion

### Step 1: Foundation (Dia 1-2)
- [x] Crear `packages/shared/` con tipos y constantes
- [ ] Crear proyecto Supabase (free tier)
- [ ] Ejecutar migrations SQL para crear todas las tablas
- [x] Actualizar `turbo.json` (agregar `.next/**` a outputs)

### Step 2: NestJS API Scaffold (Dia 2-4)
- [x] Scaffold `apps/api/` con NestJS CLI
- [x] Configurar Drizzle ORM con Supabase PostgreSQL
- [x] Modulo Auth: registro, login, JWT issuing/validation
- [x] `AuthGuard` global + decorators `@CurrentUser()` `@CurrentCompany()`
- [x] `CompaniesModule` basico
- [x] `AuditLogsModule` + `AuditLogInterceptor` global
- [x] CORS configurado para frontend

### Step 3: Agents Module (Dia 4-6)
- [x] CRUD completo de agentes
- [x] `ConfigGeneratorService` - ensambla JSON config desde agent + knowledge base
- [x] Generacion de API keys (`onb_live_` + crypto.randomBytes)
- [x] State machine de status (draft -> configuring -> active -> paused -> archived)

### Step 4: Knowledge Base Module (Dia 6-8)
- [x] `StorageService` wrapping Supabase Storage (bucket `knowledge-base`)
- [x] Upload, list, delete de documentos
- [x] Junction agent-document (attach/detach)
- [x] Validacion: solo PDF, MD, TXT; max 10MB
- [x] Metadata extraction basica (size, type, page count)

### Step 5: Next.js Frontend Scaffold (Dia 8-10)
- [x] Scaffold `apps/web/` con create-next-app (App Router, TS, Tailwind)
- [x] Instalar y configurar NextAuth.js v5 (credentials provider)
- [x] `middleware.ts` para proteccion de rutas
- [x] Custom auth pages (`/sign-in`, `/sign-up`) con branding Onboard
- [x] Dashboard layout: sidebar dark (#0A1128), header, nav items
- [x] Configurar shadcn/ui con palette Onboard
- [x] `api-client.ts` - fetch wrapper tipado con JWT automatico

### Step 6: Dashboard Pages (Dia 10-14)
- [x] Dashboard overview (stats cards, actividad reciente, quick actions)
- [x] Agents list (data table con shadcn, status badges, search)
- [x] Agent create wizard (multi-step: role -> permissions -> KB -> prompt -> review)
- [x] Agent detail page (config viewer JSON, status controls, API key reveal)
- [x] Knowledge base (document cards/list, upload dropzone con drag-and-drop)
- [x] Audit logs (tabla filtrable con paginacion)
- [x] Settings (company name, info)

### Step 7: Onboarding Flow (Dia 14-16)
- [x] Wizard post-signup en `/onboarding`
- [x] Step 1: Nombre de empresa
- [x] Step 2: Crear primer agente (seleccionar rol, nombre)
- [x] Step 3: Upload primer documento
- [x] Step 4: Generar config + pantalla de exito
- [x] Redirect a dashboard

### Step 8: Polish y Deploy (Dia 16-20)
- [x] Error handling (error boundaries, toast notifications)
- [x] Loading states (skeletons con shadcn)
- [x] Empty states (ilustraciones/mensajes cuando no hay datos)
- [ ] Responsive design pass
- [x] Render deploy: Dockerfile + render.yaml para NestJS
- [ ] Vercel deploy: Next.js (root: `apps/web`)
- [x] Environment variables en ambas plataformas
- [ ] Smoke test end-to-end completo

---

## Design System

- **Sidebar**: Midnight Blue `#0A1128`
- **Accent**: Electric Cyan `#00D9FF`
- **Text secondary**: Steel Gray `#7A8BA0`
- **Backgrounds**: Slate `#1E293B`, White
- **Success**: `#10B981` | **Warning**: `#F59E0B` | **Error**: `#EF4444`
- **Font UI**: Inter
- **Font Code**: JetBrains Mono
- **Components**: shadcn/ui customizado
- **Estetica**: Linear/Vercel/Stripe - dark sidebar, clean tables, minimal

---

## Variables de Entorno

### `apps/web/.env.local`
```
NEXTAUTH_SECRET=random-secret-here
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### `apps/api/.env`
```
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
JWT_SECRET=same-random-secret-here
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
PORT=3001
NODE_ENV=development
```

---

## Verificacion

1. **Registro**: Sign up -> Verificar user + company creados en DB
2. **CRUD Agentes**: Crear, editar, listar, eliminar agentes
3. **Upload**: Subir PDF/MD/TXT, verificar en Supabase Storage
4. **Config**: Generar config JSON, verificar estructura correcta
5. **Audit**: Verificar que cada accion genera un audit log
6. **Multi-tenant**: 2 cuentas distintas no ven datos cruzados
7. **Auth**: Rutas protegidas redirigen a sign-in, JWT expirado rechazado
8. **E2E**: Sign up -> Onboarding -> Crear agente -> Upload doc -> Generate config -> Dashboard
