import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class userRegisterDto {
  // Alignés sur les colonnes de UserEntity : sans cela MySQL renvoie une 500
  // là où l'API doit répondre 400.
  @ApiProperty({ example: 'johndoe', maxLength: 50 })
  @IsNotEmpty()
  @MaxLength(50)
  username!: string;

  @ApiProperty({ example: 'john@example.com', maxLength: 100 })
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(100)
  email!: string;

  @ApiProperty({ example: 'S3cret!pass', minLength: 8 })
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}
