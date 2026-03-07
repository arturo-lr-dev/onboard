# Step 8: Polish y Deploy (Dia 16-20)

## Objetivo
Pulir la UX, manejar errores, y deployar en Vercel (frontend) y Render (backend).

---

## Tareas

### 8.1 Error Handling

**Error Boundary global:**
```
src/app/error.tsx         # Error boundary para errores inesperados
src/app/not-found.tsx     # Pagina 404 custom
```

**Toast notifications (shadcn Toast):**
- Exito: "Agent created successfully", "Document uploaded", etc.
- Error: "Failed to create agent", "Upload failed", etc.
- Usar en todas las acciones del dashboard

**API error handling en api-client.ts:**
- Parsear errores del API (status code + message)
- Mostrar mensaje descriptivo al usuario
- 401 -> redirect a sign-in
- 403 -> "You don't have permission"
- 404 -> "Resource not found"
- 500 -> "Something went wrong, please try again"

### 8.2 Loading States

**Skeletons para cada pagina:**
- Dashboard: 4 skeleton cards + skeleton list
- Agents list: skeleton table rows
- Agent detail: skeleton tabs
- Knowledge base: skeleton cards
- Audit logs: skeleton table

**Usar `loading.tsx` de Next.js:**
```
src/app/(dashboard)/dashboard/loading.tsx
src/app/(dashboard)/agents/loading.tsx
src/app/(dashboard)/agents/[id]/loading.tsx
src/app/(dashboard)/knowledge-base/loading.tsx
src/app/(dashboard)/audit-logs/loading.tsx
```

### 8.3 Empty States

Para cada seccion sin datos:

- **Agents**: Icono Bot + "No agents yet" + "Create your first AI agent to get started" + boton "Create Agent"
- **Knowledge Base**: Icono FileText + "No documents yet" + "Upload documents to build your knowledge base" + boton "Upload"
- **Audit Logs**: Icono ScrollText + "No activity yet" + "Actions will appear here as you use the platform"

### 8.4 Responsive Design

- **Sidebar**: Colapsable en mobile (hamburger menu)
- **Data tables**: Scroll horizontal en mobile
- **Cards**: Stack vertical en mobile
- **Forms**: Full-width inputs en mobile
- **Wizard**: Steps verticales en mobile

Breakpoints:
- Mobile: < 768px (sidebar hidden, hamburger)
- Tablet: 768px-1024px (sidebar collapsed)
- Desktop: > 1024px (sidebar expanded)

### 8.5 NestJS Dockerfile

**`apps/api/Dockerfile`:**
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# Copiar workspace root
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN npm ci

COPY packages/shared/ ./packages/shared/
COPY apps/api/ ./apps/api/

WORKDIR /app/apps/api
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/packages/shared/ ./packages/shared/
COPY --from=builder /app/apps/api/package.json ./apps/api/
COPY --from=builder /app/apps/api/dist/ ./apps/api/dist/

RUN npm ci --omit=dev

WORKDIR /app/apps/api
EXPOSE 3001
CMD ["node", "dist/main.js"]
```

### 8.6 Render Deploy (Backend)

**`apps/api/render.yaml`:**
```yaml
services:
  - type: web
    name: onboard-api
    runtime: docker
    dockerfilePath: ./apps/api/Dockerfile
    dockerContext: .
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_ROLE_KEY
        sync: false
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
```

**Pasos:**
1. Conectar repo en Render dashboard
2. Seleccionar "Docker" como runtime
3. Root directory: `.` (raiz del monorepo)
4. Dockerfile path: `apps/api/Dockerfile`
5. Configurar environment variables
6. Deploy

**Free tier nota:** El servicio se duerme tras 15 min de inactividad. Primera request tarda ~30s en despertar. Aceptable para MVP.

### 8.7 Vercel Deploy (Frontend)

**Pasos en Vercel:**
1. Import repo
2. Framework: Next.js
3. Root directory: `apps/web`
4. Build command: `cd ../.. && npx turbo build --filter=onboard-web`
5. Install command: `npm install`
6. Environment variables:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` = URL del dominio Vercel
   - `NEXT_PUBLIC_API_URL` = URL del Render deploy

### 8.8 CORS Update para Production

Actualizar `main.ts` del NestJS para incluir la URL de Vercel:

```typescript
app.enableCors({
  origin: [
    'http://localhost:3000',
    process.env.FRONTEND_URL, // URL de Vercel
  ].filter(Boolean),
  credentials: true,
});
```

Agregar `FRONTEND_URL` a las env vars de Render.

### 8.9 Smoke Test E2E

**Checklist manual completo:**

1. [ ] Abrir app en URL de Vercel
2. [ ] Sign up con email + password
3. [ ] Verificar redirect a onboarding
4. [ ] Completar onboarding wizard (company, agent, upload doc)
5. [ ] Verificar redirect a dashboard
6. [ ] Dashboard muestra stats (1 agent, 1 doc)
7. [ ] Ir a Agents -> ver el agente creado
8. [ ] Click en agente -> ver detalle con config JSON
9. [ ] Revelar API key -> copiar
10. [ ] Ir a Knowledge Base -> ver documento subido
11. [ ] Ir a Audit Logs -> ver todas las acciones
12. [ ] Ir a Settings -> cambiar nombre de company
13. [ ] Sign out -> verificar redirect a sign-in
14. [ ] Intentar acceder a /dashboard sin auth -> redirect a sign-in
15. [ ] Sign up con segunda cuenta -> verificar que no ve datos de la primera

### 8.10 Tareas Finales

- [ ] Revisar que no hay console.log en produccion
- [ ] Verificar que secrets no estan hardcodeados
- [ ] Agregar `apps/web/.env.local` y `apps/api/.env` a `.gitignore`
- [ ] Actualizar README.md con instrucciones de setup local
- [ ] Commit final y tag `v0.1.0-mvp`

---

## Verificacion

- [ ] App carga sin errores en Vercel URL
- [ ] API responde en Render URL
- [ ] Registro y login funcionan end-to-end
- [ ] Onboarding completo funciona
- [ ] CRUD de agentes funciona
- [ ] Upload de documentos funciona
- [ ] Audit logs registran todo
- [ ] Multi-tenancy: datos aislados entre cuentas
- [ ] Mobile responsive basico funciona
- [ ] Errores muestran toasts descriptivos
- [ ] Loading skeletons aparecen correctamente
- [ ] Empty states se muestran cuando corresponde
