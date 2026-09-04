import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ApiInfo {
  name: string;
  version: string;
  docs: string | null;
}

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Point d'entrée de l'API. Renvoie de quoi identifier l'instance interrogée
   * plutôt qu'un « Hello World! » de génération, qui ne dit ni quelle API
   * répond, ni où en trouver la documentation.
   */
  getApiInfo(): ApiInfo {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';
    return {
      name: 'CV Tech API',
      version: '1.0',
      // La documentation n'est pas montée en production : ne pas annoncer une
      // URL qui répond 404.
      docs: isProduction ? null : '/api/v1/api-docs',
    };
  }
}
