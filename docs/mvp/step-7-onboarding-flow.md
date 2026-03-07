# Step 7: Onboarding Flow (Dia 14-16)

## Objetivo
Wizard post-signup que guia al usuario a configurar su empresa, crear su primer agente y subir su primer documento.

---

## Tareas

### 7.1 Onboarding Page

**`src/app/onboarding/page.tsx`**

Pagina full-screen (sin sidebar del dashboard) con un wizard de 4 pasos.

**Layout:**
- Fondo: gradiente sutil de Midnight Blue a Slate
- Card central blanca con el wizard
- Progress indicator arriba (4 dots/steps)
- Logo Onboard en la esquina superior

### 7.2 Step 1: Company Setup

- Titulo: "Welcome to Onboard"
- Subtitulo: "Let's set up your organization"
- Campos:
  - Company Name (pre-llenado si se puso en registro)
  - Industry (select: Technology, Healthcare, Finance, E-commerce, Other)
  - Team Size (select: 1-10, 11-50, 51-200, 200+)
- Boton "Continue"
- `PATCH /api/v1/company` para guardar

### 7.3 Step 2: Create First Agent

- Titulo: "Create your first AI agent"
- Subtitulo: "What role will your agent play?"
- Cards clickeables con los roles:
  - Customer Support (icono Headphones) - "Handle customer inquiries and tickets"
  - Sales (icono TrendingUp) - "Qualify leads and manage outreach"
  - Engineering (icono Code) - "Assist with code reviews and documentation"
  - Operations (icono Settings) - "Automate workflows and processes"
  - Custom (icono Sparkles) - "Define a custom role"
- Campos adicionales:
  - Agent Name (auto-sugerido segun rol, ej: "Support Agent Alpha")
  - Description (textarea, opcional)
- `POST /api/v1/agents` al continuar

### 7.4 Step 3: Upload First Document

- Titulo: "Give your agent some context"
- Subtitulo: "Upload a document your agent should know about"
- Dropzone para upload (mismo componente que knowledge-base/upload)
- Sugerencias: "Company handbook, FAQ, product docs, SOPs..."
- Boton "Skip for now" (opcional, no bloquea)
- Si se sube: `POST /api/v1/knowledge-base/upload` + attach al agente

### 7.5 Step 4: Ready!

- Titulo: "You're all set!"
- Animacion de confetti o checkmark
- Resumen:
  - Company: [nombre]
  - First Agent: [nombre] ([rol])
  - Document: [nombre] (o "None uploaded")
- Boton "Generate Config" -> `POST /api/v1/agents/:id/generate-config`
- Mostrar config JSON preview
- Boton "Go to Dashboard" -> redirect a `/dashboard`

### 7.6 Onboarding Guard

En el dashboard layout, verificar si el usuario ha completado onboarding:
- Si la company no tiene nombre o no tiene agentes -> redirect a `/onboarding`
- Una vez completado, no volver a mostrar

Alternativa simple: flag `onboarding_completed` en la tabla `companies`.

Agregar columna:
```sql
ALTER TABLE companies ADD COLUMN onboarding_completed BOOLEAN DEFAULT false;
```

Actualizar al completar Step 4.

---

## Verificacion

- [ ] Despues de sign-up, redirige a `/onboarding`
- [ ] Step 1 guarda nombre de empresa
- [ ] Step 2 crea un agente con el rol seleccionado
- [ ] Step 3 permite subir documento (y vincularlo al agente)
- [ ] Step 3 permite skip
- [ ] Step 4 muestra resumen y genera config
- [ ] "Go to Dashboard" lleva al dashboard
- [ ] Dashboard no redirige de vuelta a onboarding
- [ ] Si ya completo onboarding, `/onboarding` redirige a `/dashboard`
