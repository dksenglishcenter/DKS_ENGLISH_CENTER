import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import {
  PASSWORD_MESSAGE,
  PASSWORD_PATTERN,
} from '../../common/validation/person';

export class ResetPasswordDto {
  @IsString({ message: 'Mã xác nhận phải là chuỗi ký tự.' })
  @IsNotEmpty({ message: 'Thiếu mã xác nhận đặt lại mật khẩu.' })
  token!: string;

  @IsString({ message: 'Mật khẩu phải là chuỗi ký tự.' })
  @MinLength(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
  @MaxLength(72, { message: 'Mật khẩu không được vượt quá 72 ký tự.' })
  @Matches(PASSWORD_PATTERN, { message: PASSWORD_MESSAGE })
  password!: string;
}
