import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  const port = configService.get<number>('port', 3001);
  await app.listen(port);
  console.log(`Application running on port ${port}`);
}
bootstrap();
