import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type DocumentDocument = HydratedDocument<Document>;

@Schema()
export class DocumentChunk {
  @Prop({ required: true })
  text: string;

  @Prop({ type: [Number], required: true })
  embedding: number[];

  @Prop({
    type: {
      pageNumber: Number,
      source: String,
    },
    _id: false,
  })
  metadata?: {
    pageNumber?: number;
    source?: string;
  };
}

export const DocumentChunkSchema = SchemaFactory.createForClass(DocumentChunk);

@Schema()
export class Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ default: Date.now })
  uploadedAt: Date;

  @Prop({ type: [DocumentChunkSchema], default: [] })
  chunks: DocumentChunk[];
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
