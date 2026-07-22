import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

import {
  NAME_PATTERN,
  NO_HTML_BRACKETS,
  PHONE_PATTERN,
} from '../../common/validation/person';

const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

const NormalizeName = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value,
  );

const NormalizeEmail = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );

const TrimOptional = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed || undefined;
  });

export class CreateCareerApplicationDto {
  @Trim()
  @Matches(/^c[a-z0-9]{24}$/, {
    message: 'ID vị trí tuyển dụng không đúng định dạng CUID.',
  })
  jobId!: string;

  @NormalizeName()
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(100)
  @Matches(/\s/, {
    message: 'Vui lòng nhập đầy đủ họ và tên.',
  })
  @Matches(NAME_PATTERN, {
    message:
      'Họ và tên chỉ được chứa chữ cái, khoảng trắng, dấu chấm, dấu nháy hoặc dấu gạch nối.',
  })
  fullName!: string;

  @NormalizeEmail()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @IsNotEmpty({ message: 'Vui lòng nhập email.' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự.' })
  email!: string;

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
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  @Matches(NO_HTML_BRACKETS, {
    message: 'Giới thiệu bản thân không được chứa ký tự < hoặc >.',
  })
  introduction?: string;
}
