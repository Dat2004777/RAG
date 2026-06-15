import { Controller, Post, Body } from '@nestjs/common';
import { RagService } from './rag.service';

@Controller('api/rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('query')
  async query(@Body('question') question: string) {
    return this.ragService.queryRAG(question);
  }
}
