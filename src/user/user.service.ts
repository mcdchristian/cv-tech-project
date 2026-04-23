import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { userRegisterDto } from './dto/user-register.dto';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import bycrypt from 'bcrypt';
import { LoginCredentialsDto } from './dto/login-credentials.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}
  async register(userData: userRegisterDto): Promise<Partial<UserEntity>> {
    // const { username, email, password } = userData;
    const user = this.userRepository.create({
      ...userData,
    });
    user.salt = await bycrypt.genSalt();
    user.password = await bycrypt.hash(user.password, user.salt);
    try {
      await this.userRepository.save(user);
    } catch {
      throw new ConflictException('email ou username already exist');
    }
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };
  }

  async login(
    credentials: LoginCredentialsDto,
  ) /*: Promise<Partial<UserEntity>>*/ {
    //on recupere le username et le password de l'utilisateur
    const { username, password } = credentials;
    //on peut se logger soit avec le username soit avec l'email
    //verifier s'il un user avec ce username ou password existe
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username or user.email = :username', {
        username,
      })
      .getOne();
    // Si l'utilisateur n'existe pas, on retourne 401 (et non 404 pour ne pas révéler d'infos)
    if (!user) throw new UnauthorizedException('Identifiants invalides');
    // On vérifie le mot de passe
    const hashedPassword = await bycrypt.hash(password, user.salt);
    if (hashedPassword === user.password) {
      const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      const jwt = await this.jwtService.signAsync(payload);
      return { access_token: jwt };
    } else {
      throw new UnauthorizedException('Identifiants invalides');
    }
  }
}
