import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { SecurityInterceptor } from './security/interceptors/security.interceptor';
import { InputSanitizationPipe } from './security/pipes/input-sanitization.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // Rate limiting
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests from this IP, please try again later.',
        statusCode: 429,
      },
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // CORS with more restrictive settings
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  });

  // Enhanced validation pipeline
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Automatically transform payloads to DTO instances
      transformOptions: {
        enableImplicitConversion: false, // Disable implicit type conversion
      },
      disableErrorMessages: process.env.NODE_ENV === 'production', // Hide detailed error messages in production
    }),
  );

  // Security interceptor for logging and headers
  const securityInterceptor = app.get(SecurityInterceptor);
  app.useGlobalInterceptors(securityInterceptor);

  // Input sanitization pipe
  const inputSanitizationPipe = app.get(InputSanitizationPipe);
  app.useGlobalPipes(inputSanitizationPipe);

  const config = new DocumentBuilder()
    .setTitle('F1 Champions API')
    .setDescription('API for retrieving F1 championship data')
    .setVersion('1.0')
    .addTag('champions')
    .addTag('race-winners')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
