import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
// Les sondes de monitoring interrogent ces routes en continu : ne pas les limiter.
@SkipThrottle()
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  /**
   * Liveness : le process répond-il ? Volontairement sans dépendance externe.
   * Une base en panne ne doit pas déclencher un redémarrage — redémarrer
   * n'y changerait rien et produirait une boucle de crash.
   */
  @Get()
  @ApiOperation({ summary: 'Liveness — le process est vivant' })
  check() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Readiness : l'instance peut-elle réellement servir ? Sans cette route,
   * /health répondait 200 base arrêtée, et l'orchestrateur continuait à lui
   * envoyer du trafic qu'elle ne pouvait pas honorer.
   */
  @Get('ready')
  @ApiOperation({ summary: 'Readiness — les dépendances répondent' })
  @ApiOkResponse({ description: 'La base répond' })
  @ApiServiceUnavailableResponse({ description: 'La base est injoignable' })
  async ready() {
    const startedAt = Date.now();
    try {
      await this.dataSource.query('SELECT 1');
    } catch (error) {
      throw new ServiceUnavailableException({
        status: 'unavailable',
        database: 'unreachable',
        reason: error instanceof Error ? error.message : 'unknown',
      });
    }
    return {
      status: 'ok',
      database: 'reachable',
      latencyMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    };
  }
}
