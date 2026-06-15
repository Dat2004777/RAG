import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  const port = process.env.PORT || 5000;
  await app.listen(port);
  console.log(`🚀 Server đang chạy trên cổng: ${port}`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
