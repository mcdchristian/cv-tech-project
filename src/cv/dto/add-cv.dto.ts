import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class AddcvDto {
  // maxLength alignés sur les colonnes de CvEntity (varchar 50).
  @ApiProperty({ example: 'Doe', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'John', maxLength: 50 })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  firstname: string;

  @ApiProperty({ example: 30, minimum: 15, maximum: 65 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(15)
  @Max(65)
  age: number;

  @ApiProperty({ example: 123456 })
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cin: number;

  @ApiProperty({ example: 'Software Engineer' })
  @IsNotEmpty()
  @IsString()
  job: string;

  // path est optionnel, mais s'il est fourni il doit être une chaîne non vide
  @ApiPropertyOptional({ example: 'uploads/john-doe.pdf' })
  @IsOptional()
  @IsString()
  path?: string;
}
