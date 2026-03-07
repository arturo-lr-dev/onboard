import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AgentsService } from './agents.service.js';
import {
  CurrentUser,
  CurrentCompany,
} from '../../common/decorators/current-user.decorator.js';
import type { JwtPayload } from '../../common/decorators/current-user.decorator.js';
import { AuditLog } from '../../common/decorators/audit-log.decorator.js';

@Controller('agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Get()
  async findAll(@CurrentCompany() companyId: string) {
    return this.agentsService.findAll(companyId);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.agentsService.findOne(id, companyId);
  }

  @Post()
  @AuditLog('create', 'agent')
  async create(
    @CurrentUser() user: JwtPayload,
    @CurrentCompany() companyId: string,
    @Body()
    body: {
      name: string;
      role: string;
      description?: string;
      permissions?: any;
      constraints?: any;
      systemPrompt?: string;
      config?: any;
    },
  ) {
    return this.agentsService.create(companyId, user.sub, body);
  }

  @Patch(':id')
  @AuditLog('update', 'agent')
  async update(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
    @Body()
    body: {
      name?: string;
      role?: string;
      description?: string;
      permissions?: any;
      constraints?: any;
      systemPrompt?: string;
      config?: any;
    },
  ) {
    return this.agentsService.update(id, companyId, body);
  }

  @Delete(':id')
  @AuditLog('delete', 'agent')
  async remove(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.agentsService.remove(id, companyId);
  }

  @Post(':id/activate')
  @AuditLog('activate', 'agent')
  async activate(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.agentsService.activate(id, companyId);
  }

  @Post(':id/pause')
  @AuditLog('pause', 'agent')
  async pause(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.agentsService.pause(id, companyId);
  }

  @Post(':id/generate-config')
  async generateConfig(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.agentsService.generateConfig(id, companyId);
  }

  @Post(':id/regenerate-api-key')
  @AuditLog('regenerate-api-key', 'agent')
  async regenerateApiKey(
    @Param('id') id: string,
    @CurrentCompany() companyId: string,
  ) {
    return this.agentsService.regenerateApiKey(id, companyId);
  }
}
