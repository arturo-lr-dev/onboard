import { Module } from '@nestjs/common';
import { KnowledgeBaseController } from './knowledge-base.controller.js';
import { KnowledgeBaseService } from './knowledge-base.service.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [StorageModule],
  controllers: [KnowledgeBaseController],
  providers: [KnowledgeBaseService],
  exports: [KnowledgeBaseService],
})
export class KnowledgeBaseModule {}
