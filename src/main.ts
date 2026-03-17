import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  // Environment validation
  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    logger.error('FATAL: JWT_SECRET must be set in production environment');
    process.exit(1);
  }

  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });

  // Security
  app.use(helmet());
  const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global prefix
  app.setGlobalPrefix('api/v1', { exclude: ['/api/v1/health'] });

  // Health check (used by Docker healthcheck)
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/api/v1/health', (_req: unknown, res: { json: (v: object) => void }) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Swagger / OpenAPI
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('BIS ERP API')
      .setDescription('BIS ERP REST API — v1')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger UI: http://localhost:3001/api/docs');
  }

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`API server listening on http://localhost:${port}`);
}

bootstrap();
