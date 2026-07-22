import { IsEmail, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự.' })
  email!: string;
}
