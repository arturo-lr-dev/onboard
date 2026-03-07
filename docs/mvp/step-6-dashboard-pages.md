# Step 6: Dashboard Pages (Dia 10-14)

## Objetivo
Construir todas las paginas del dashboard: overview, agents, knowledge base, audit logs y settings.

---

## Tareas

### 6.1 Dashboard Overview (`/dashboard`)

**`src/app/(dashboard)/dashboard/page.tsx`**

Pagina principal con:

- **Stats Cards** (fila de 4):
  - Total Agents (icono Bot)
  - Active Agents (icono Activity)
  - Documents (icono FileText)
  - Audit Events (icono ScrollText)
  - Cada card muestra numero grande + label
  - Datos de `GET /api/v1/company/stats`

- **Recent Activity** (lista):
  - Ultimos 10 audit logs
  - Cada item: icono + accion + recurso + timestamp relativo
  - Datos de `GET /api/v1/audit-logs?pageSize=10`

- **Quick Actions** (botones):
  - "Create Agent" -> `/agents/new`
  - "Upload Document" -> `/knowledge-base/upload`

### 6.2 Agents List (`/agents`)

**`src/app/(dashboard)/agents/page.tsx`**

- **Header**: Titulo "Agents" + boton "New Agent"
- **Search bar**: Filtrar por nombre
- **Data Table** (shadcn Table):
  - Columnas: Name, Role, Status, API Key (masked), Created, Actions
  - **Status Badge** (shadcn Badge):
    - draft: gris
    - configuring: amarillo
    - active: verde
    - paused: naranja
    - archived: rojo
  - **Actions dropdown**: View, Edit, Activate/Pause, Delete
- **Empty State**: Cuando no hay agentes, mostrar ilustracion + "Create your first agent"
- Datos de `GET /api/v1/agents`

### 6.3 Agent Create Wizard (`/agents/new`)

**`src/app/(dashboard)/agents/new/page.tsx`**

Multi-step wizard con 5 pasos:

**Step 1: Basic Info**
- Name (input text)
- Role (select con AGENT_ROLES)
- Description (textarea, opcional)

**Step 2: Permissions**
- Checkboxes agrupados por categoria (Knowledge Base, Tickets, Email, etc.)
- Usar constantes de `@onboard/shared`

**Step 3: Knowledge Base**
- Lista de documentos disponibles (de la company)
- Checkboxes para seleccionar cuales vincular
- Opcion "Upload new" que abre modal/link

**Step 4: System Prompt**
- Textarea grande para escribir instrucciones
- Placeholder con ejemplo segun el rol seleccionado
- Preview del prompt final

**Step 5: Review**
- Resumen de todo lo configurado
- Boton "Create Agent" que:
  1. `POST /api/v1/agents` (crear)
  2. Para cada doc seleccionado: `POST /api/v1/knowledge-base/:id/attach/:agentId`
  3. `POST /api/v1/agents/:id/generate-config` (generar config)
  4. Redirect a `/agents/:id`

**UI**: Progress bar arriba, botones Back/Next abajo, validacion por step.

### 6.4 Agent Detail (`/agents/[id]`)

**`src/app/(dashboard)/agents/[id]/page.tsx`**

- **Header**: Nombre del agente + Status Badge + botones (Edit, Activate/Pause)
- **Tabs** (shadcn Tabs):

  **Tab: Overview**
  - Info cards: Role, Created, Status, Description
  - API Key (mostrar masked `onb_live_****xxxx`, boton "Reveal" y "Copy")
  - Boton "Regenerate API Key" (con confirmacion)

  **Tab: Configuration**
  - JSON viewer del config generado (con syntax highlighting, font JetBrains Mono)
  - Boton "Regenerate Config"
  - Boton "Copy Config" (copiar al clipboard)

  **Tab: Knowledge Base**
  - Lista de documentos vinculados
  - Boton "Attach Document" (modal con documentos disponibles)
  - Boton "Detach" por cada documento

  **Tab: Activity**
  - Audit logs filtrados por este agente
  - `GET /api/v1/audit-logs?agentId=xxx`

### 6.5 Agent Edit (`/agents/[id]/edit`)

**`src/app/(dashboard)/agents/[id]/edit/page.tsx`**

- Mismo form que el wizard pero pre-llenado con datos actuales
- Boton "Save Changes" -> `PATCH /api/v1/agents/:id`
- Boton "Cancel" -> volver a detalle

### 6.6 Knowledge Base (`/knowledge-base`)

**`src/app/(dashboard)/knowledge-base/page.tsx`**

- **Header**: Titulo "Knowledge Base" + boton "Upload Document"
- **Document Grid/List** (toggle view):
  - Card por documento: icono segun tipo (PDF/MD/TXT), titulo, filename, size, status badge, fecha
  - Click -> dialog con detalles + preview link (signed URL)
  - Actions: Delete (con confirmacion)
- **Empty State**: "Upload your first document to build your knowledge base"
- Datos de `GET /api/v1/knowledge-base`

### 6.7 Upload Document (`/knowledge-base/upload`)

**`src/app/(dashboard)/knowledge-base/upload/page.tsx`**

- **Dropzone** (drag-and-drop area):
  - Acepta: PDF, MD, TXT
  - Max: 10MB
  - Muestra nombre del archivo seleccionado
  - Preview del filename + size antes de subir
- **Title input**: Nombre descriptivo del documento
- **Upload button**:
  1. Crear FormData con file + title
  2. `POST /api/v1/knowledge-base/upload`
  3. Mostrar progress (o spinner)
  4. Redirect a `/knowledge-base` tras exito
- **Error handling**: Mostrar toast si archivo invalido o upload falla

### 6.8 Audit Logs (`/audit-logs`)

**`src/app/(dashboard)/audit-logs/page.tsx`**

- **Header**: Titulo "Audit Logs" + boton "Export CSV"
- **Filters bar**:
  - Action type (select: all, agent.created, agent.activated, document.uploaded, etc.)
  - Agent (select con agentes de la company)
  - Date range (from/to)
- **Data Table**:
  - Columnas: Timestamp, Action, Resource, Agent, User, Details
  - Paginacion (20 per page)
  - Ordenado por fecha DESC
- Datos de `GET /api/v1/audit-logs?page=X&pageSize=20&action=X&agentId=X`

### 6.9 Settings (`/settings`)

**`src/app/(dashboard)/settings/page.tsx`**

- **Company Info**:
  - Name (editable)
  - Slug (read-only)
  - Plan (read-only, "Free")
  - Boton "Save" -> `PATCH /api/v1/company`
- **Account Info**:
  - Email (read-only)
  - Full Name (read-only por ahora)

### 6.10 Componentes Compartidos

```
src/components/shared/
├── page-header.tsx       # Titulo + descripcion + acciones
├── empty-state.tsx       # Icono + mensaje + CTA
├── loading-skeleton.tsx  # Skeletons para cada tipo de contenido
├── data-table.tsx        # Wrapper de shadcn Table con paginacion
├── status-badge.tsx      # Badge de status con colores
└── confirm-dialog.tsx    # Dialog de confirmacion para acciones destructivas
```

---

## Verificacion

- [ ] Dashboard muestra stats correctos del API
- [ ] Lista de agentes carga y muestra datos
- [ ] Wizard de crear agente funciona los 5 pasos
- [ ] Detalle de agente muestra tabs con info correcta
- [ ] API key se puede revelar y copiar
- [ ] Config JSON se muestra con syntax highlighting
- [ ] Upload de documentos funciona (drag-and-drop + click)
- [ ] Audit logs se filtran correctamente
- [ ] Settings permite cambiar nombre de company
- [ ] Empty states se muestran cuando no hay datos
- [ ] Loading skeletons aparecen mientras carga
- [ ] Todas las acciones destructivas piden confirmacion
