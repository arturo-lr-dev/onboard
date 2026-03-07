# Step 3: Agents Module (Dia 4-6)

## Objetivo
CRUD completo de agentes IA con generacion de config JSON y API keys.

---

## Tareas

### 3.1 Estructura de archivos

```
modules/agents/
├── agents.module.ts
├── agents.controller.ts
├── agents.service.ts
├── config-generator.service.ts
└── dto/
    ├── create-agent.dto.ts
    └── update-agent.dto.ts
```

### 3.2 DTOs

**`create-agent.dto.ts`:**
```typescript
export class CreateAgentDto {
  @IsString() @MinLength(2)
  name: string;

  @IsIn(['customer_support', 'sales', 'engineering', 'operations', 'custom'])
  role: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  permissions?: string[];

  @IsOptional() @IsObject()
  constraints?: Record<string, unknown>;

  @IsOptional() @IsString()
  systemPrompt?: string;
}
```

**`update-agent.dto.ts`:** PartialType de CreateAgentDto.

### 3.3 Agents Service

**Metodos:**

- `findAll(companyId)` - listar agentes de la company
- `findOne(id, companyId)` - detalle (validar que pertenece a la company)
- `create(dto, userId, companyId)`:
  1. Insertar agente con status `draft`
  2. Generar API key: `onb_live_` + crypto.randomBytes(24).toString('hex')
  3. Crear audit log: `agent.created`
  4. Retornar agente creado

- `update(id, dto, companyId)`:
  1. Verificar que existe y pertenece a company
  2. Actualizar campos
  3. Audit log: `agent.updated`

- `remove(id, companyId)`:
  1. Verificar que existe
  2. Eliminar (o archivar)
  3. Audit log: `agent.deleted`

- `activate(id, companyId)`:
  1. Verificar status actual permite transicion (ver AGENT_STATUS_TRANSITIONS)
  2. Cambiar status a `active`
  3. Audit log: `agent.activated`

- `pause(id, companyId)`:
  1. Verificar transicion valida
  2. Cambiar a `paused`
  3. Audit log: `agent.paused`

- `regenerateApiKey(id, companyId)`:
  1. Generar nueva API key
  2. Actualizar en DB
  3. Audit log: `agent.api_key_regenerated`

### 3.4 Config Generator Service

Ensambla un JSON de configuracion desde el agente y sus documentos vinculados.

```typescript
@Injectable()
export class ConfigGeneratorService {
  async generate(agentId: string, companyId: string): Promise<AgentConfig> {
    // 1. Obtener agente con sus documentos vinculados
    // 2. Ensamblar config JSON
    // 3. Guardar config en agents.config
    // 4. Cambiar status a 'configuring' si estaba en 'draft'
    // 5. Audit log: agent.config_generated

    return {
      agent: {
        id: agent.id,
        name: agent.name,
        role: agent.role,
        company_id: companyId,
        permissions: agent.permissions,
        context: {
          knowledge_base_ids: documentIds,
          system_prompt: agent.systemPrompt,
        },
        constraints: agent.constraints,
      },
      api_key: agent.apiKey,
      created_at: new Date().toISOString(),
      version: '1.0',
    };
  }
}
```

### 3.5 Agents Controller

```typescript
@Controller('agents')
export class AgentsController {
  @Get()
  findAll(@CurrentCompany() companyId: string)

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string)

  @Post()
  create(@Body() dto: CreateAgentDto, @CurrentUser() user, @CurrentCompany() companyId: string)

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgentDto, @CurrentCompany() companyId: string)

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string)

  @Post(':id/activate')
  activate(@Param('id') id: string, @CurrentCompany() companyId: string)

  @Post(':id/pause')
  pause(@Param('id') id: string, @CurrentCompany() companyId: string)

  @Post(':id/generate-config')
  generateConfig(@Param('id') id: string, @CurrentCompany() companyId: string)

  @Post(':id/regenerate-api-key')
  regenerateApiKey(@Param('id') id: string, @CurrentCompany() companyId: string)
}
```

### 3.6 State Machine de Status

Validar transiciones antes de cambiar status:

```
draft -> configuring (al generar config)
configuring -> active (al activar) | draft (al volver atras)
active -> paused | archived
paused -> active | archived
archived -> (terminal, no transitions)
```

Si se intenta una transicion invalida, devolver 400 Bad Request.

---

## Verificacion

- [ ] `POST /api/v1/agents` crea agente con status `draft` y API key generada
- [ ] `GET /api/v1/agents` lista solo agentes de la company del usuario
- [ ] `GET /api/v1/agents/:id` devuelve detalle (404 si es de otra company)
- [ ] `PATCH /api/v1/agents/:id` actualiza campos
- [ ] `DELETE /api/v1/agents/:id` elimina agente
- [ ] `POST /api/v1/agents/:id/activate` cambia status (400 si transicion invalida)
- [ ] `POST /api/v1/agents/:id/generate-config` genera JSON config correcto
- [ ] `POST /api/v1/agents/:id/regenerate-api-key` genera nueva key
- [ ] Cada accion genera un audit log
- [ ] No se puede acceder a agentes de otra company
