import { Controller, Get, Patch, Body } from '@nestjs/common';
import { CompaniesService } from './companies.service.js';
import { CurrentCompany } from '../../common/decorators/current-user.decorator.js';
import { AuditLog } from '../../common/decorators/audit-log.decorator.js';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async getCompany(@CurrentCompany() companyId: string) {
    return this.companiesService.getCompany(companyId);
  }

  @Patch()
  @AuditLog('update', 'company')
  async updateCompany(
    @CurrentCompany() companyId: string,
    @Body() body: { name?: string },
  ) {
    return this.companiesService.updateCompany(companyId, body);
  }

  @Get('stats')
  async getStats(@CurrentCompany() companyId: string) {
    return this.companiesService.getStats(companyId);
  }
}
