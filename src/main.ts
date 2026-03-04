import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const corsOptions = {
    origin: ['http://localhost:4200'],
  };
  app.enableCors(corsOptions);
  app.use(helmet());
  app.use(morgan('dev'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
