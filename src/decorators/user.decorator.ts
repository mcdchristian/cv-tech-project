import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

/**
 * Ce que la stratégie JWT dépose sur la requête : l'entité utilisateur privée
 * de son mot de passe. Nommer cette forme évite que chaque contrôleur la
 * redéclare, et fait échouer la compilation si la stratégie change ce qu'elle
 * renvoie.
 */
export interface AuthenticatedUser {
  id: number;
  username: string;
  email: string;
  role: string;
}

/**
 * Extrait l'utilisateur authentifié de la requête.
 *
 * Le lève-tôt sur `undefined` est une sécurité de conception : sans guard, le
 * décorateur renverrait `undefined` et le service filtrerait sur
 * `user.id === undefined`, ce qui ne rejette rien de façon visible. Mieux vaut
 * un 401 franc qu'une requête silencieusement non filtrée.
 */
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  },
);
