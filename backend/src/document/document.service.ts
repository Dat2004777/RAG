import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentDocument } from './document.schema';
import { EmbeddingService } from '../embedding/embedding.service';

// eslint-disable-next-line @typescript-eslint/no-require-imports
import pdfParse = require('pdf-parse');

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    private embeddingService: EmbeddingService,
  ) {}

  async processAndUploadDocument(
    file: UploadedFile,
  ): Promise<DocumentDocument> {
    if (!file) {
      throw new BadRequestException('Không tìm thấy tệp tải lên');
    }

    let extractedText = '';
    try {
      if (
        file.mimetype === 'application/pdf' ||
        file.originalname.endsWith('.pdf')
      ) {
        const pdfData = await (
          pdfParse as unknown as (buf: Buffer) => Promise<{ text: string }>
        )(file.buffer);
        extractedText = pdfData.text;
      } else {
        extractedText = file.buffer.toString('utf-8');
      }
    } catch (err) {
      console.error('Lỗi khi đọc file:', err);
      throw new BadRequestException(
        'Không thể phân tích nội dung tệp. Đảm bảo định dạng chính xác.',
      );
    }

    const textChunks = this.embeddingService.chunkText(extractedText);
    const processedChunks: Array<{
      text: string;
      embedding: number[];
      metadata: { source: string };
    }> = [];

    for (const text of textChunks) {
      if (!text.trim()) continue;
      const embedding = await this.embeddingService.generateEmbedding(text);
      processedChunks.push({
        text,
        embedding,
        metadata: { source: file.originalname },
      });
    }

    if (processedChunks.length === 0) {
      throw new BadRequestException('Tài liệu rỗng hoặc không thể tạo chunks.');
    }

    const newDoc = new this.documentModel({
      filename: file.originalname,
      chunks: processedChunks,
    });

    return await newDoc.save();
  }
}
