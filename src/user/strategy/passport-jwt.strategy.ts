import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { jwtConstants } from './constants';
import { ConfigService } from '@nestjs/config';
import type { PayloadInterface } from '../interfaces/payload.interface';
import type { AuthenticatedUser } from '../../decorators/user.decorator';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('SECRET'),
    });
  }

  async validate(payload: PayloadInterface): Promise<AuthenticatedUser> {
    // Recherche par clé primaire : `username` est indexé mais modifiable, et le
    // token porte déjà l'id. Un renommage invaliderait sinon les tokens en cours.
    const user = await this.userRepository.findOne({
      where: { id: payload.id },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    // Projection explicite plutôt qu'un rest-spread : celui-ci laissait passer
    // createdAt, updatedAt, deletedAt et la relation cvs, alors que le type vu
    // par les contrôleurs n'annonce que ces quatre champs. Ce qui est retourné
    // ici devient `request.user`, donc la valeur de `@User()`.
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }
}
