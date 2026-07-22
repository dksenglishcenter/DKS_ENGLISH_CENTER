import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  PASSWORD_MESSAGE,
  PASSWORD_PATTERN,
  PHONE_PATTERN,
} from '../../common/validation/person';

export class RegisterDto {
  @IsString({ message: 'Họ và tên phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Vui lòng nhập họ và tên.' })
  @MinLength(4, { message: 'Họ và tên phải có ít nhất 4 ký tự.' })
  @MaxLength(100, { message: 'Họ và tên không được vượt quá 100 ký tự.' })
  fullName!: string;

  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự.' })
  email!: string;

  @IsOptional()
  @IsString({ message: 'Số điện thoại phải là chuỗi ký tự.' })
  @MaxLength(20, {
    message: 'Số điện thoại không được vượt quá 20 ký tự.',
  })
  @Matches(PHONE_PATTERN, {
    message: 'Số điện thoại phải có từ 8 đến 15 chữ số và đúng định dạng.',
  })
  phone?: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự.' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
  @MaxLength(72, { message: 'Mật khẩu không được vượt quá 72 ký tự.' })
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_MESSAGE })
  password!: string;
}
