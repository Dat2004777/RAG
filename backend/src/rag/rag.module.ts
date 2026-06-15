import { Module } from '@nestjs/common';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';
import { DocumentModule } from '../document/document.module';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [DocumentModule, EmbeddingModule],
  controllers: [RagController],
  providers: [RagService],
})
export class RagModule {}
