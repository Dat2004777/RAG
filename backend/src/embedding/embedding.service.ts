import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { TaskType } from '@google/generative-ai';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private embeddings: GoogleGenerativeAIEmbeddings;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey,
      modelName: 'gemini-embedding-001',
      taskType: TaskType.RETRIEVAL_DOCUMENT,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      return await this.embeddings.embedQuery(text);
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  chunkText(text: string, chunkSize = 500, chunkOverlap = 100): string[] {
    const words = text.trim().split(/\s+/);
    const chunks: string[] = [];
    let i = 0;

    if (words.length === 0 || words[0] === '') return [];

    while (i < words.length) {
      const chunk = words.slice(i, i + chunkSize).join(' ');
      chunks.push(chunk);
      i += chunkSize - chunkOverlap;
    }
    return chunks;
  }
}
