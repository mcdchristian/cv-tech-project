import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: this.extractMessage(exception, status),
    });

    // Une 5xx est un bug côté serveur : on garde la stack, sinon elle est perdue.
    if (Number(status) >= 500) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }
  }

  /**
   * Conserve le corps produit par Nest (notamment le tableau `message` du
   * ValidationPipe, que le frontend affiche tel quel) sans jamais exposer le
   * détail interne d'une erreur non maîtrisée.
   */
  private extractMessage(exception: unknown, status: HttpStatus): string | string[] {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') return body;
      const message = (body as { message?: string | string[] }).message;
      if (message) return message;
      return exception.message;
    }
    return status === HttpStatus.INTERNAL_SERVER_ERROR
      ? 'Internal server error'
      : HttpStatus[status];
  }
}
