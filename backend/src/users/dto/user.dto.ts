import { Transform, Type } from 'class-transformer';
import {
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
import { Role } from '../../../generated/prisma/client';

import { PHONE_PATTERN } from '../../common/validation/person';

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).+$/;

const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

const NormalizeEmail = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  );

const OptionalTrim = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed || undefined;
  });

export class ListUsersQueryDto {
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
  pageSize = 10;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export class UserParamsDto {
  @Matches(/^c[a-z0-9]{24}$/, {
    message: 'ID người dùng không đúng định dạng CUID.',
  })
  id!: string;
}

export class CreateUserDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName!: string;

  @NormalizeEmail()
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @OptionalTrim()
  @IsOptional()
  @Matches(PHONE_PATTERN, {
    message: 'Số điện thoại phải có từ 8 đến 15 chữ số và đúng định dạng.',
  })
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(PASSWORD_PATTERN, {
    message: 'Mật khẩu phải có ít nhất 1 chữ cái và 1 chữ số.',
  })
  password!: string;

  @IsEnum(Role)
  role!: Role;
}

export class UpdateUserDto {
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  fullName?: string;

  @IsOptional()
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || null : value,
  )
  @Matches(PHONE_PATTERN, {
    message: 'Số điện thoại phải có từ 8 đến 15 chữ số và đúng định dạng.',
  })
  @MaxLength(20)
  phone?: string | null;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(PASSWORD_PATTERN, {
    message: 'Mật khẩu phải có ít nhất 1 chữ cái và 1 chữ số.',
  })
  password?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
