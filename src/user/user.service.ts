import {
  ConflictException,
  Injectable,
  NotFoundException,
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
    //si l'utilisateur n'existe pas on retourne une exception
    if (!user) throw new NotFoundException('invalid credentials');
    //si l'utilisateur existe je verifie le password est correct ou pas
    const hashedPassword = await bycrypt.hash(password, user.salt);
    if (hashedPassword === user.password) {
      const paylod = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };
      const jwt = await this.jwtService.signAsync(paylod);
      return {
        access_token: jwt,
      };
      // return {
      //   id: user.id,
      //   username: user.username,
      //   email: user.email,
      //   role: user.role,
      // };
    } else {
      throw new NotFoundException('invalid credentials');
    }
  }
}
