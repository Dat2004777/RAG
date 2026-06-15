import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Document, DocumentSchema } from './document.schema';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { EmbeddingModule } from '../embedding/embedding.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Document.name, schema: DocumentSchema },
    ]),
    EmbeddingModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [MongooseModule, DocumentService],
})
export class DocumentModule {}
