import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

// Decorateur personnalisé pour extraire l'utilisateur de la requête
export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.user;
  },
);
