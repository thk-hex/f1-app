import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { SanitizationPipe } from './shared/pipes/sanitization.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with specific options
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // Add enhanced validation pipe with sanitization
  app.useGlobalPipes(
    new SanitizationPipe(),
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Throw error for unknown properties
      transform: true, // Auto-transform payloads to DTO instances
      disableErrorMessages: process.env.NODE_ENV === 'production',
      validateCustomDecorators: true, // Enable custom validators
    })
  );

  // Setup Swagger
  const config = new DocumentBuilder()
    .setTitle('F1 Champions API')
    .setDescription('API for retrieving F1 championship data with enhanced security')
    .setVersion('1.0')
    .addTag('champions')
    .addTag('race-winners')
    .addBearerAuth() // Add if you plan to implement authentication
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
