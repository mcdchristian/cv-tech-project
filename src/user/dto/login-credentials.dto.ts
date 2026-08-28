import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class LoginCredentialsDto {
  @ApiProperty({ example: 'johndoe', description: 'Username ou email' })
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'S3cret!pass' })
  @IsNotEmpty()
  password!: string;
}
