import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const startedAt = Date.now();

    res.on('finish', () => {
      const { method, originalUrl } = req;
      const { statusCode } = res;
      this.logger.log(`${method} ${originalUrl} ${statusCode} - ${Date.now() - startedAt}ms`);
    });

    next();
  }
}
