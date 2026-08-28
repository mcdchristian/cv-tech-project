import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CvModule } from './cv/cv.module';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './health/health.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // 10 req/min en global rendait le dashboard inutilisable (il enchaîne
    // plusieurs appels par écran) : la limite stricte est posée sur /user/login.
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [
        {
          ttl: Number(configService.get('THROTTLE_TTL') ?? 60000),
          limit: Number(configService.get('THROTTLE_LIMIT') ?? 100),
        },
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
        type: 'mysql',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get('DB_PORT') ?? 3306),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        // Les entités sont déjà déclarées par les `forFeature` de chaque module :
        // le glob sur `dist/` ne résolvait rien sous `npm run dev` (ts-node-dev).
        autoLoadEntities: true,
        // `synchronize` altère le schéma au démarrage. Par défaut il suit
        // NODE_ENV, mais il reste pilotable : l'image Docker tourne en
        // NODE_ENV=production et, faute de migrations dans ce projet, la stack
        // compose démarrerait sur une base sans tables.
        // Pour un vrai déploiement : laisser à false et introduire des migrations.
        synchronize:
          configService.get<string>('DB_SYNCHRONIZE') === 'true' ||
          (configService.get<string>('DB_SYNCHRONIZE') !== 'false' &&
            configService.get<string>('NODE_ENV') !== 'production'),
      }),
    }),
    CvModule,
    UserModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Sans ce guard, ThrottlerModule est configuré mais ne limite rien.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // '*' est refusé par path-to-regexp v8 (Express 5) : Nest le convertissait
    // en '{*path}' avec un avertissement à chaque démarrage.
    consumer.apply(LoggerMiddleware).forRoutes('{*path}');
  }
}
