# Step 2: NestJS API Scaffold (Dia 2-4)

## Objetivo
Crear el backend NestJS con autenticacion, base de datos y audit logging.

---

## Tareas

### 2.1 Scaffold del proyecto

```bash
cd apps/
npx @nestjs/cli new api --package-manager npm --skip-git
```

**`apps/api/package.json`** - agregar dependencias:
```json
{
  "name": "onboard-api",
  "dependencies": {
    "@nestjs/common": "...",
    "@nestjs/core": "...",
    "@nestjs/config": "...",
    "@nestjs/jwt": "...",
    "@nestjs/passport": "...",
    "passport": "...",
    "passport-jwt": "...",
    "drizzle-orm": "...",
    "postgres": "...",
    "@supabase/supabase-js": "...",
    "bcrypt": "...",
    "class-validator": "...",
    "class-transformer": "...",
    "@onboard/shared": "workspace:*"
  }
}
```

### 2.2 Configuracion (`src/config/configuration.ts`)

```typescript
export default () => ({
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '7d',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
});
```

### 2.3 Database Module (`src/database/`)

**`schema.ts`** - Drizzle schema completo con las 6 tablas:
- Definir todas las tablas con `pgTable()`
- Relaciones con `relations()`
- Exportar tipos inferidos con `InferSelectModel` / `InferInsertModel`

**`database.module.ts`** - Provider global que inicializa Drizzle con `postgres` driver.

### 2.4 Auth Module (`src/modules/auth/`)

**Archivos:**
```
modules/auth/
├── auth.module.ts
├── auth.controller.ts
├── auth.service.ts
└── dto/
    ├── register.dto.ts    # email, password, fullName, companyName
    └── login.dto.ts       # email, password
```

**Endpoints:**
- `POST /api/v1/auth/register`:
  1. Validar email unico
  2. Hash password con bcrypt
  3. Crear company (generar slug desde companyName)
  4. Crear user con company_id y role='owner'
  5. Generar JWT con { userId, companyId, role }
  6. Crear audit log: `user.registered`

- `POST /api/v1/auth/login`:
  1. Buscar user por email
  2. Comparar password con bcrypt
  3. Generar JWT
  4. Crear audit log: `user.login`

- `GET /api/v1/auth/me`:
  1. Extraer user de JWT
  2. Devolver user + company

### 2.5 Auth Guard (`src/common/guards/auth.guard.ts`)

Guard global que:
1. Extrae Bearer token del header `Authorization`
2. Valida JWT con `@nestjs/jwt`
3. Busca user en DB por `userId` del payload
4. Adjunta `{ userId, companyId, role }` al request
5. Rutas excluidas: `/api/v1/auth/register`, `/api/v1/auth/login`, `/webhooks/*`

### 2.6 Decorators

**`@CurrentUser()`** - extrae userId del request
**`@CurrentCompany()`** - extrae companyId del request

```typescript
// current-user.decorator.ts
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

### 2.7 Companies Module (`src/modules/companies/`)

Basico por ahora:
- `GET /api/v1/company` - devolver company actual (por companyId del JWT)
- `PATCH /api/v1/company` - actualizar name
- `GET /api/v1/company/stats` - contar agents, documents, active agents

### 2.8 Audit Logs Module (`src/modules/audit-logs/`)

**Service:**
- `create(log)` - insertar audit log
- `findAll(companyId, filters, pagination)` - listar con paginacion

**Controller:**
- `GET /api/v1/audit-logs?page=1&pageSize=20&action=agent.created&agentId=xxx`
- `GET /api/v1/audit-logs/export` - devolver CSV

**Interceptor (`audit-log.interceptor.ts`):**
- Intercepta POST, PATCH, DELETE en rutas de agents y knowledge-base
- Auto-genera audit log con action, resource_type, resource_id
- Se aplica globalmente

### 2.9 CORS y main.ts

```typescript
// main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: ['http://localhost:3000'], // Next.js dev
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(process.env.PORT || 3001);
}
```

### 2.10 `.env.example`

```
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
JWT_SECRET=your-secret-here-min-32-chars
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
PORT=3001
NODE_ENV=development
```

---

## Verificacion

- [ ] `npm run start:dev` en `apps/api/` arranca sin errores
- [ ] `POST /api/v1/auth/register` crea user + company en Supabase
- [ ] `POST /api/v1/auth/login` devuelve JWT valido
- [ ] `GET /api/v1/auth/me` devuelve user + company con JWT
- [ ] Rutas sin JWT devuelven 401
- [ ] `GET /api/v1/audit-logs` muestra logs de register/login
- [ ] `GET /api/v1/company` devuelve la company del usuario
- [ ] CORS permite requests desde localhost:3000
