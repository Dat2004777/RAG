import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EmbeddingModule } from './embedding/embedding.module';
import { DocumentModule } from './document/document.module';
import { RagModule } from './rag/rag.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const uri = configService.get<string>('MONGODB_URI');
        if (!uri) {
          console.warn('Cảnh báo: MONGODB_URI chưa được cấu hình trong .env');
        }
        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
    EmbeddingModule,
    DocumentModule,
    RagModule,
  ],
})
export class AppModule {}
