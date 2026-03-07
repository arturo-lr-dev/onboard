# Step 1: Foundation (Dia 1-2)

## Objetivo
Preparar la infraestructura base: tipos compartidos, base de datos y configuracion del monorepo.

---

## Tareas

### 1.1 Crear `packages/shared/`

Paquete de tipos y constantes compartidos entre frontend y backend.

**Archivos a crear:**

```
packages/shared/
├── package.json
├── tsconfig.json
└── src/
    ├── index.ts
    ├── types/
    │   ├── agent.ts
    │   ├── company.ts
    │   ├── document.ts
    │   ├── audit-log.ts
    │   └── api-responses.ts
    └── constants/
        ├── agent-roles.ts
        ├── permissions.ts
        └── status.ts
```

**`package.json`:**
```json
{
  "name": "@onboard/shared",
  "version": "0.0.1",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "tsc --noEmit"
  },
  "devDependencies": {
    "typescript": "^5.7.0"
  }
}
```

**Tipos clave:**

```typescript
// types/agent.ts
export type AgentRole = 'customer_support' | 'sales' | 'engineering' | 'operations' | 'custom';
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

// types/company.ts
export interface Company {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'starter' | 'pro' | 'enterprise';
  createdAt: string;
  updatedAt: string;
}

// types/document.ts
export type DocumentStatus = 'processing' | 'ready' | 'failed';
export type DocumentType = 'pdf' | 'md' | 'txt';

export interface KnowledgeBaseDocument {
  id: string;
  companyId: string;
  title: string;
  fileName: string;
  fileType: DocumentType;
  fileSize: number;
  storagePath: string;
  status: DocumentStatus;
  metadata: Record<string, unknown>;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

// types/audit-log.ts
export interface AuditLog {
  id: string;
  companyId: string;
  agentId: string | null;
  userId: string | null;
  action: string;
  resourceType: 'agent' | 'document' | 'company' | 'config';
  resourceId: string | null;
  details: Record<string, unknown>;
  ipAddress: string | null;
  createdAt: string;
}

// types/api-responses.ts
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
}
```

**Constantes clave:**

```typescript
// constants/agent-roles.ts
export const AGENT_ROLES = [
  { value: 'customer_support', label: 'Customer Support' },
  { value: 'sales', label: 'Sales' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'operations', label: 'Operations' },
  { value: 'custom', label: 'Custom' },
] as const;

// constants/permissions.ts
export const PERMISSIONS = {
  KNOWLEDGE_BASE_READ: 'read:knowledge_base',
  KNOWLEDGE_BASE_WRITE: 'write:knowledge_base',
  TICKETS_READ: 'read:tickets',
  TICKETS_WRITE: 'write:tickets',
  TICKETS_CLOSE: 'close:tickets',
  EMAIL_SEND: 'send:email',
  EMAIL_READ: 'read:email',
  CALENDAR_READ: 'read:calendar',
  CALENDAR_WRITE: 'write:calendar',
  CODE_READ: 'read:code',
  CODE_WRITE: 'write:code',
  DATABASE_READ: 'read:database',
  DATABASE_WRITE: 'write:database',
} as const;

// constants/status.ts
export const AGENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['configuring'],
  configuring: ['active', 'draft'],
  active: ['paused', 'archived'],
  paused: ['active', 'archived'],
  archived: [],
};
```

### 1.2 Crear proyecto Supabase

1. Ir a supabase.com -> New Project (free tier)
2. Region: la mas cercana al usuario
3. Guardar:
   - `DATABASE_URL` (Settings > Database > Connection string > URI)
   - `SUPABASE_URL` (Settings > API > Project URL)
   - `SUPABASE_SERVICE_ROLE_KEY` (Settings > API > service_role key)

### 1.3 Ejecutar migrations SQL

Ejecutar el SQL completo del schema en Supabase SQL Editor (ver `docs/plan-maestro.md` seccion Database Schema).

Las 6 tablas: `companies`, `users`, `agents`, `knowledge_base_documents`, `agent_knowledge_base`, `audit_logs` + indexes.

### 1.4 Actualizar `turbo.json`

Agregar `.next/**` a los outputs del task `build`:

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".output/**", ".next/**"]
    },
    "dev": { "cache": false, "persistent": true },
    "lint": { "dependsOn": ["^build"] }
  }
}
```

---

## Verificacion

- [ ] `packages/shared/` existe y `npm install` desde root no da errores
- [ ] Tipos se exportan correctamente desde `@onboard/shared`
- [ ] Tablas creadas en Supabase (verificar en Table Editor)
- [ ] `turbo.json` actualizado
