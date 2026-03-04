import { IsEmail, IsNotEmpty } from 'class-validator';

export class userRegisterDto {
  @IsNotEmpty()
  username!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  password!: string;
}
