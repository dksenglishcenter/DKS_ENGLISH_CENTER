import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  /** true = giữ phiên lâu trên browser; false = cookie phiên (đóng trình duyệt là hết). */
  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;
}
