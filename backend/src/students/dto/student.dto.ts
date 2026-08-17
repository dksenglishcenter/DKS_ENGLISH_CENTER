import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { StudentStatus } from '../../../generated/prisma/client';
import { CUID_MESSAGE, CUID_PATTERN } from '../../common/validation/cuid';
import {
  EMAIL_PATTERN,
  NAME_PATTERN,
  PHONE_PATTERN,
} from '../../common/validation/person';

const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

const OptionalBlankToNull = () =>
  Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed || null;
  });

export class ListStudentsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsEnum(StudentStatus, { message: 'Trạng thái học viên không hợp lệ.' })
  status?: StudentStatus;
}

export class StudentParamsDto {
  @Matches(CUID_PATTERN, { message: CUID_MESSAGE })
  id!: string;
}

export class StudentParentParamsDto {
  @Matches(CUID_PATTERN, { message: CUID_MESSAGE })
  id!: string;

  @Matches(CUID_PATTERN, { message: 'ID phụ huynh không đúng định dạng CUID.' })
  parentUserId!: string;
}

export class LinkParentDto {
  @Matches(CUID_PATTERN, { message: 'ID phụ huynh không đúng định dạng CUID.' })
  parentUserId!: string;
}

export class CreateStudentDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống.' })
  @MinLength(2, { message: 'Họ tên cần ít nhất 2 ký tự.' })
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự.' })
  @Matches(NAME_PATTERN, { message: 'Họ tên chứa ký tự không hợp lệ.' })
  fullName!: string;

  @IsOptional()
  @OptionalBlankToNull()
  @Matches(PHONE_PATTERN, {
    message: 'Số điện thoại phải có từ 8 đến 15 chữ số và đúng định dạng.',
  })
  @MaxLength(20)
  phone?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @Matches(EMAIL_PATTERN, { message: 'Email không đúng định dạng.' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự.' })
  email?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @IsString()
  @MaxLength(100, { message: 'Tên phụ huynh không được vượt quá 100 ký tự.' })
  parentName?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @Matches(PHONE_PATTERN, {
    message: 'SĐT phụ huynh phải có từ 8 đến 15 chữ số và đúng định dạng.',
  })
  @MaxLength(20)
  parentPhone?: string | null;

  @IsOptional()
  @IsEnum(StudentStatus, { message: 'Trạng thái học viên không hợp lệ.' })
  status?: StudentStatus;

  @IsOptional()
  @OptionalBlankToNull()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự.' })
  note?: string | null;

  @IsOptional()
  @IsArray({ message: 'Danh sách phụ huynh không hợp lệ.' })
  @ArrayUnique({ message: 'Tài khoản phụ huynh bị trùng.' })
  @Matches(CUID_PATTERN, {
    each: true,
    message: 'ID phụ huynh không đúng định dạng CUID.',
  })
  parentUserIds?: string[];
}

export class UpdateStudentDto {
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống.' })
  @MinLength(2, { message: 'Họ tên cần ít nhất 2 ký tự.' })
  @MaxLength(100, { message: 'Họ tên không được vượt quá 100 ký tự.' })
  @Matches(NAME_PATTERN, { message: 'Họ tên chứa ký tự không hợp lệ.' })
  fullName?: string;

  @IsOptional()
  @OptionalBlankToNull()
  @Matches(PHONE_PATTERN, {
    message: 'Số điện thoại phải có từ 8 đến 15 chữ số và đúng định dạng.',
  })
  @MaxLength(20)
  phone?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự.' })
  email?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @IsString()
  @MaxLength(100, { message: 'Tên phụ huynh không được vượt quá 100 ký tự.' })
  parentName?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @Matches(PHONE_PATTERN, {
    message: 'SĐT phụ huynh phải có từ 8 đến 15 chữ số và đúng định dạng.',
  })
  @MaxLength(20)
  parentPhone?: string | null;

  @IsOptional()
  @IsEnum(StudentStatus, { message: 'Trạng thái học viên không hợp lệ.' })
  status?: StudentStatus;

  @IsOptional()
  @OptionalBlankToNull()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự.' })
  note?: string | null;

  @IsOptional()
  @IsArray({ message: 'Danh sách phụ huynh không hợp lệ.' })
  @ArrayUnique({ message: 'Tài khoản phụ huynh bị trùng.' })
  @Matches(CUID_PATTERN, {
    each: true,
    message: 'ID phụ huynh không đúng định dạng CUID.',
  })
  parentUserIds?: string[];
}
