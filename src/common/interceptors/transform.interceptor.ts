import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Enveloppe la réponse dans `{ data: ... }`.
 *
 * Volontairement NON enregistré globalement : le frontend (`frontend/src/api/api.ts`)
 * et le README consomment les payloads bruts (`Cv[]`, `{ access_token }`).
 * À activer par contrôleur avec `@UseInterceptors(TransformInterceptor)` si besoin.
 */
export interface Response<T> {
  data: T;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}
