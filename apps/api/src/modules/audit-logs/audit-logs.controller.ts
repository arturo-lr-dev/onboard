import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuditLogsService } from './audit-logs.service.js';
import { CurrentCompany } from '../../common/decorators/current-user.decorator.js';

@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  async findAll(
    @CurrentCompany() companyId: string,
    @Query('action') action?: string,
    @Query('agentId') agentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.auditLogsService.findAll(companyId, {
      action,
      agentId,
      startDate,
      endDate,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get('export')
  async exportCsv(
    @CurrentCompany() companyId: string,
    @Res() res: Response,
  ) {
    const csv = await this.auditLogsService.exportCsv(companyId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
    res.send(csv);
  }
}
