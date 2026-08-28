import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiConflictResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { UserService } from './user.service';
import { userRegisterDto } from './dto/user-register.dto';
import { UserEntity } from './entities/user.entity/user.entity';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@ApiTags('user')
@ApiTooManyRequestsResponse({ description: 'Plus de 5 tentatives par minute' })
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  // Limite stricte : ces deux routes sont les cibles naturelles d'un bruteforce.
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  @ApiOperation({ summary: 'Créer un compte' })
  @ApiConflictResponse({ description: 'Username ou email déjà utilisé' })
  async register(@Body() userData: userRegisterDto): Promise<Partial<UserEntity>> {
    return await this.userService.register(userData);
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('login')
  @ApiOperation({ summary: 'Se connecter et obtenir un token JWT' })
  @ApiUnauthorizedResponse({ description: 'Identifiants invalides' })
  async login(@Body() crendentials: LoginCredentialsDto): Promise<{ access_token: string }> {
    return await this.userService.login(crendentials);
  }
}
