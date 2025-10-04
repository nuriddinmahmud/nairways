import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'winston';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get<Logger>(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('NAirways')
    .setDescription(
      'NAirways — samolyotlar uchun chiptalarni sotib olish va joy band qilish platformasi',
    )
    .setVersion('1.1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.getHttpAdapter().get('/', (_req, res) => res.redirect('/api/docs'));

  const port = Number(process.env.APP_PORT) || 3000;
  await app.listen(port);

  const appUrl = await app.getUrl();
  console.log(`🚀 Server ishlayapti: ${appUrl}/api`);
  console.log(`📘 Swagger hujjatlar: ${appUrl}/api/docs`);
}

bootstrap();
