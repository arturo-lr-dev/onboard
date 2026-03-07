import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { KnowledgeBaseService } from './knowledge-base.service.js';
import {
  CurrentUser,
  CurrentCompany,
} from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';
import { AuditLog } from '../../common/decorators/audit-log.decorator.js';

@Controller('knowledge-base')
export class KnowledgeBaseController {
  constructor(private readonly knowledgeBaseService: KnowledgeBaseService) {}

  @Get()
  async findAll(@CurrentCompany() companyId: string) {
    return this.knowledgeBaseService.findAll(companyId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  @AuditLog('upload', 'document')
  async upload(
    @CurrentUser() user: JwtPayload,
    @CurrentCompany() companyId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.knowledgeBaseService.upload(companyId, user.sub, file);
  }

  @Delete(':id')
  @AuditLog('delete', 'document')
  async remove(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.knowledgeBaseService.remove(id, companyId);
  }

  @Post(':id/attach/:agentId')
  @AuditLog('attach', 'document')
  async attach(
    @Param('id') id: string,
    @Param('agentId') agentId: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.knowledgeBaseService.attachToAgent(id, agentId, companyId);
  }

  @Delete(':id/detach/:agentId')
  @AuditLog('detach', 'document')
  async detach(
    @Param('id') id: string,
    @Param('agentId') agentId: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.knowledgeBaseService.detachFromAgent(id, agentId, companyId);
  }
}
