import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { CustomLoggerService } from './config/custom-logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TraceService } from './common/services/trace.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// DATABASE_URLが未設定の場合はデフォルト値を設定
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://postgres:postgres@localhost:5433/app?schema=public';
  console.log(
    `DATABASE_URL環境変数を設定しました: ${process.env.DATABASE_URL}`,
  );
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(CustomLoggerService);
  const traceService = app.get(TraceService);

  app.enableCors();
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalInterceptors(new LoggingInterceptor(logger, traceService));

  // Swagger設定
  const config = new DocumentBuilder()
    .setTitle('ats API')
    .setDescription('ats API ドキュメント')
    .setVersion('1.0')
    .addTag('companies', '会社管理API')
    .addTag('users', 'ユーザー管理API')
    .addTag('recruit-years', '年度管理API')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  logger.log(`アプリケーションがポート ${port} で起動しました`, 'Bootstrap');
  logger.log(`Swagger UI: http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
