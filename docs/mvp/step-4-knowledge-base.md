# Step 4: Knowledge Base Module (Dia 6-8)

## Objetivo
Upload de documentos a Supabase Storage, CRUD y vinculacion con agentes.

---

## Tareas

### 4.1 Estructura de archivos

```
modules/knowledge-base/
├── knowledge-base.module.ts
├── knowledge-base.controller.ts
├── knowledge-base.service.ts
└── dto/
    └── upload-document.dto.ts

modules/storage/
├── storage.module.ts
└── storage.service.ts
```

### 4.2 Storage Service (Supabase Storage wrapper)

```typescript
@Injectable()
export class StorageService {
  private supabase: SupabaseClient;

  constructor(private config: ConfigService) {
    this.supabase = createClient(
      config.get('supabase.url'),
      config.get('supabase.serviceRoleKey'),
    );
  }

  // Subir archivo al bucket 'knowledge-base'
  async upload(companyId: string, documentId: string, fileName: string, buffer: Buffer, mimeType: string): Promise<string> {
    const path = `${companyId}/${documentId}/${fileName}`;
    const { error } = await this.supabase.storage
      .from('knowledge-base')
      .upload(path, buffer, { contentType: mimeType });
    if (error) throw new InternalServerErrorException('Upload failed');
    return path;
  }

  // Generar URL firmada (expira en 1 hora)
  async getSignedUrl(path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('knowledge-base')
      .createSignedUrl(path, 3600);
    if (error) throw new InternalServerErrorException('URL generation failed');
    return data.signedUrl;
  }

  // Eliminar archivo
  async delete(path: string): Promise<void> {
    await this.supabase.storage.from('knowledge-base').remove([path]);
  }
}
```

**Setup previo en Supabase:**
- Crear bucket `knowledge-base` (privado, no publico)
- No habilitar RLS (acceso solo via service role key)

### 4.3 Knowledge Base Service

**Metodos:**

- `findAll(companyId)` - listar documentos de la company
- `findOne(id, companyId)` - detalle con signed URL para preview

- `upload(file, title, userId, companyId)`:
  1. Validar tipo: solo `pdf`, `md`, `txt`
  2. Validar tamano: max 10MB
  3. Crear record en DB con status `processing`
  4. Subir a Supabase Storage via StorageService
  5. Extraer metadata basica:
     - Tamano del archivo
     - Tipo MIME
     - Para TXT/MD: word count
  6. Actualizar status a `ready`
  7. Audit log: `document.uploaded`

- `remove(id, companyId)`:
  1. Obtener document de DB
  2. Eliminar de Supabase Storage
  3. Eliminar de DB (cascade elimina junction records)
  4. Audit log: `document.deleted`

- `attachToAgent(documentId, agentId, companyId)`:
  1. Verificar que ambos pertenecen a la company
  2. Insertar en `agent_knowledge_base`
  3. Audit log: `document.attached`

- `detachFromAgent(documentId, agentId, companyId)`:
  1. Eliminar de `agent_knowledge_base`
  2. Audit log: `document.detached`

- `getAgentDocuments(agentId, companyId)`:
  1. Listar documentos vinculados a un agente

### 4.4 Knowledge Base Controller

```typescript
@Controller('knowledge-base')
export class KnowledgeBaseController {
  @Get()
  findAll(@CurrentCompany() companyId: string)

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentCompany() companyId: string)

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @CurrentUser() user,
    @CurrentCompany() companyId: string,
  )

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentCompany() companyId: string)

  @Post(':id/attach/:agentId')
  attach(
    @Param('id') docId: string,
    @Param('agentId') agentId: string,
    @CurrentCompany() companyId: string,
  )

  @Delete(':id/detach/:agentId')
  detach(
    @Param('id') docId: string,
    @Param('agentId') agentId: string,
    @CurrentCompany() companyId: string,
  )
}
```

### 4.5 File Validation Pipe

```typescript
@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('File is required');

    const allowedTypes = ['application/pdf', 'text/markdown', 'text/plain'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF, MD, and TXT files are allowed');
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    return file;
  }
}
```

---

## Verificacion

- [ ] `POST /api/v1/knowledge-base/upload` sube PDF correctamente
- [ ] `POST /api/v1/knowledge-base/upload` sube MD y TXT
- [ ] Archivos mayores a 10MB son rechazados (400)
- [ ] Archivos .exe, .zip etc son rechazados (400)
- [ ] `GET /api/v1/knowledge-base` lista documentos de la company
- [ ] `GET /api/v1/knowledge-base/:id` devuelve detalle con signed URL
- [ ] `DELETE /api/v1/knowledge-base/:id` elimina de DB y Storage
- [ ] `POST /api/v1/knowledge-base/:id/attach/:agentId` vincula doc a agente
- [ ] `DELETE /api/v1/knowledge-base/:id/detach/:agentId` desvincula
- [ ] Verificar archivo existe en Supabase Storage dashboard
- [ ] Cada accion genera audit log
- [ ] No se puede acceder a documentos de otra company
