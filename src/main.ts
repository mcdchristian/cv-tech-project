import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.enableCors({
    origin: configService.get<string>('frontendUrl'),
  });

  // Sans ces hooks, un SIGTERM (docker stop, redéploiement) tue le process au
  // milieu des requêtes en vol et laisse le pool MySQL se fermer brutalement.
  app.enableShutdownHooks();

  app.use(helmet());

  // Uniformise le corps des erreurs et journalise les 5xx avec leur stack.
  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('CV Tech API')
    .setDescription("Documentation de l'API CV Tech")
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/v1/api-docs', app, documentFactory);

  await app.listen(configService.getOrThrow<number>('port'));
}
void bootstrap();
