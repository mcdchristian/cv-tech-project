import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { jwtConstants } from './constants';
import { ConfigService } from '@nestjs/config';
import { PayloadInterface } from '../interfaces/payload.interface';
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

  async validate(payload: PayloadInterface) {
    // return { userId: payload.sub, username: payload.username };
    //on recupere le username de l'utilisateur a partir du payload
    const user = await this.userRepository.findOne({
      where: { username: payload.username },
    });
    //si l'utilisateur existe je le retourne et et ce que je retourne ici sera dispo dans le request (controller)
    if (user) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _password, salt: _salt, ...result } = user;
      return result;
    } else {
      throw new UnauthorizedException();
    }
  }
}
