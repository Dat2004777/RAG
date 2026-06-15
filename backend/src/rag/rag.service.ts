import { Injectable, OnModuleInit, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Document, DocumentDocument } from '../document/document.schema';
import { EmbeddingService } from '../embedding/embedding.service';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RagService implements OnModuleInit {
  private model: ChatGoogleGenerativeAI;

  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    private embeddingService: EmbeddingService,
    private configService: ConfigService,
  ) {}

  onModuleInit() {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    this.model = new ChatGoogleGenerativeAI({
      apiKey,
      model: 'gemma-4-31b-it',
      maxOutputTokens: 2048,
    });
  }

  private processRawAnswer(rawAnswer: unknown): string {
    let cleanText = '';

    if (Array.isArray(rawAnswer)) {
      const arr = rawAnswer as Array<{ type: string; text?: string }>;
      const textObj = arr.find((item) => item?.type === 'text');
      if (textObj && textObj.text) {
        cleanText = textObj.text;
      }
    } else if (typeof rawAnswer === 'string') {
      cleanText = rawAnswer;
    } else if (
      typeof rawAnswer === 'number' ||
      typeof rawAnswer === 'boolean'
    ) {
      cleanText = String(rawAnswer);
    } else if (rawAnswer) {
      cleanText = JSON.stringify(rawAnswer);
    }

    const lines = cleanText.split('\n');
    if (lines.length > 1) {
      return lines.slice(1).join('\n');
    }

    return cleanText;
  }

  async queryRAG(question: string) {
    if (!question) {
      throw new BadRequestException('Câu hỏi không được để trống');
    }

    const queryVector = await this.embeddingService.generateEmbedding(question);

    console.log(
      'Đang thực hiện Vector Search với vector độ dài:',
      queryVector.length,
    );

    // Sử dụng Vector Search Index của MongoDB Atlas
    const searchResult = (await this.documentModel.aggregate([
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'chunks.embedding',
          queryVector: queryVector,
          numCandidates: 100,
          limit: 5,
        },
      },
      {
        $unwind: '$chunks',
      },
      {
        $project: {
          _id: 0,
          filename: 1,
          text: '$chunks.text',
          score: { $meta: 'vectorSearchScore' },
        },
      },
      {
        $limit: 5,
      },
    ])) as Array<{ filename: string; text: string; score: number }>;

    console.log(
      'Kết quả truy vấn: tìm thấy',
      searchResult.length,
      'đoạn tiềm năng.',
    );

    const context = searchResult.map((item) => item.text).join('\n\n');

    const systemPrompt = `You are an advanced AI Assistant specialized in Document Q&A. 
                Use the following context to answer the user's question accurately. 
                If you don't know the answer or if it's not in the context, say "Tôi không tìm thấy thông tin này trong tài liệu được cung cấp." Don't make up information.

                Context:
                ${context}`;

    const response = await this.model.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(question),
    ]);

    const finalAnswer = this.processRawAnswer(response.content);

    return {
      answer: finalAnswer,
      sources: searchResult.map((d) => d.filename),
    };
  }
}
