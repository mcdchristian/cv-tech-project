import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { userRegisterDto } from './dto/user-register.dto';
import { UserEntity } from './entities/user.entity/user.entity';
import { LoginCredentialsDto } from './dto/login-credentials.dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
  @Post()
  async register(
    @Body() userData: userRegisterDto,
  ): Promise<Partial<UserEntity>> {
    return await this.userService.register(userData);
  }
  @Post('login')
  async login(
    @Body() crendentials: LoginCredentialsDto,
  ) /*: Promise<Partial<UserEntity>>*/ {
    return await this.userService.login(crendentials);
  }
}
