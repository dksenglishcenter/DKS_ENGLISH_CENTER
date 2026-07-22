import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { NAME_PATTERN, PHONE_PATTERN } from '../../common/validation/person';

const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

const TrimOptional = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed || undefined;
  });

export class CreateContactDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(NAME_PATTERN, {
    message:
      'Họ và tên chỉ được chứa chữ cái, khoảng trắng, dấu chấm, dấu nháy hoặc dấu gạch nối.',
  })
  fullName!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(PHONE_PATTERN, {
    message: 'Số điện thoại phải có từ 8 đến 15 chữ số và đúng định dạng.',
  })
  phone!: string;

  @TrimOptional()
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự.' })
  email?: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  courseInterest!: string;

  @TrimOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  learningNeeds?: string;
}
