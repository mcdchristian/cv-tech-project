import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class userRegisterDto {
  @ApiProperty({ example: 'johndoe', maxLength: 50 })
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ example: 'john@example.com', maxLength: 100 })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'S3cret!pass' })
  @IsNotEmpty()
  password!: string;
}
