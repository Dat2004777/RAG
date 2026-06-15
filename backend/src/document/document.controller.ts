import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import type { UploadedFile as DocUploadedFile } from './document.service';

@Controller('api/documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    const doc = await this.documentService.processAndUploadDocument(
      file as DocUploadedFile,
    );
    return {
      message: 'Xử lý tài liệu và chuyển hóa vector thành công',
      docId: doc._id,
    };
  }
}
