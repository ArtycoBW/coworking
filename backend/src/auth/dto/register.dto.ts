import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'test@dstu.ru' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Test123!' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ example: 'Иван' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  firstName: string;

  @ApiProperty({ example: 'Иванов' })
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  lastName: string;
}
