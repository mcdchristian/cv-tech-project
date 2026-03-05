import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CvModule } from './cv/cv.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    CvModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
