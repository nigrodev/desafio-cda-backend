import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';
import { BadgeModule } from './badge.module';

async function bootstrap() {
  const app = await NestFactory.create(BadgeModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Desafio Back-End Cidade Alta - Emblemas')
    .setDescription(
      'API para gerenciamento de emblemas de usuários da Cidade Alta.',
    )
    .setVersion('1.0')
    .addTag('Emblemas')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  app.use(
    '/reference',
    apiReference({
      spec: {
        content: document,
      },
    }),
  );

  await app.listen(3000);
}

bootstrap();
