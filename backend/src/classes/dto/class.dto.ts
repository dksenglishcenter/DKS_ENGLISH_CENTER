import { Transform, Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
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
import { ClassStatus } from '../../../generated/prisma/client';
import { CUID_MESSAGE, CUID_PATTERN } from '../../common/validation/cuid';

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

const OptionalCuid = () =>
  Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    return typeof value === 'string' ? value.trim() : value;
  });

export class ListClassesQueryDto {
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
  @IsEnum(ClassStatus, { message: 'Trạng thái lớp không hợp lệ.' })
  status?: ClassStatus;
}

export class ClassParamsDto {
  @Matches(CUID_PATTERN, { message: CUID_MESSAGE })
  id!: string;
}

export class ClassStudentParamsDto {
  @Matches(CUID_PATTERN, { message: CUID_MESSAGE })
  id!: string;

  @Matches(CUID_PATTERN, { message: 'ID học viên không đúng định dạng CUID.' })
  studentId!: string;
}

export class EnrollStudentDto {
  @Matches(CUID_PATTERN, { message: 'ID học viên không đúng định dạng CUID.' })
  studentId!: string;
}

export class CreateClassDto {
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Tên lớp không được để trống.' })
  @MinLength(2, { message: 'Tên lớp cần ít nhất 2 ký tự.' })
  @MaxLength(100, { message: 'Tên lớp không được vượt quá 100 ký tự.' })
  name!: string;

  @IsOptional()
  @OptionalCuid()
  @Matches(CUID_PATTERN, { message: 'ID khóa học không đúng định dạng CUID.' })
  courseId?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @IsString()
  @MaxLength(50, { message: 'Trình độ không được vượt quá 50 ký tự.' })
  level?: string | null;

  @IsOptional()
  @OptionalCuid()
  @Matches(CUID_PATTERN, { message: 'ID giáo viên không đúng định dạng CUID.' })
  teacherId?: string | null;

  @IsOptional()
  @IsArray({ message: 'Lịch học không hợp lệ.' })
  @ArrayUnique({ message: 'Thứ trong tuần bị trùng.' })
  @IsInt({ each: true, message: 'Thứ trong tuần phải là số nguyên.' })
  @Min(0, { each: true, message: 'Thứ trong tuần phải từ 0 (CN) đến 6 (T7).' })
  @Max(6, { each: true, message: 'Thứ trong tuần phải từ 0 (CN) đến 6 (T7).' })
  scheduleDays?: number[];

  @IsOptional()
  @OptionalBlankToNull()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Giờ bắt đầu phải có định dạng HH:mm.' })
  startTime?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Giờ kết thúc phải có định dạng HH:mm.' })
  endTime?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @IsString()
  @MaxLength(50, { message: 'Phòng học không được vượt quá 50 ký tự.' })
  room?: string | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Sĩ số phải là số nguyên.' })
  @Min(1, { message: 'Sĩ số tối thiểu là 1.' })
  @Max(200, { message: 'Sĩ số tối đa là 200.' })
  capacity?: number | null;

  @IsOptional()
  @IsEnum(ClassStatus, { message: 'Trạng thái lớp không hợp lệ.' })
  status?: ClassStatus;
}

export class UpdateClassDto {
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: 'Tên lớp không được để trống.' })
  @MinLength(2, { message: 'Tên lớp cần ít nhất 2 ký tự.' })
  @MaxLength(100, { message: 'Tên lớp không được vượt quá 100 ký tự.' })
  name?: string;

  @IsOptional()
  @OptionalCuid()
  @Matches(CUID_PATTERN, { message: 'ID khóa học không đúng định dạng CUID.' })
  courseId?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @IsString()
  @MaxLength(50, { message: 'Trình độ không được vượt quá 50 ký tự.' })
  level?: string | null;

  @IsOptional()
  @OptionalCuid()
  @Matches(CUID_PATTERN, { message: 'ID giáo viên không đúng định dạng CUID.' })
  teacherId?: string | null;

  @IsOptional()
  @IsArray({ message: 'Lịch học không hợp lệ.' })
  @ArrayUnique({ message: 'Thứ trong tuần bị trùng.' })
  @IsInt({ each: true, message: 'Thứ trong tuần phải là số nguyên.' })
  @Min(0, { each: true, message: 'Thứ trong tuần phải từ 0 (CN) đến 6 (T7).' })
  @Max(6, { each: true, message: 'Thứ trong tuần phải từ 0 (CN) đến 6 (T7).' })
  scheduleDays?: number[];

  @IsOptional()
  @OptionalBlankToNull()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Giờ bắt đầu phải có định dạng HH:mm.' })
  startTime?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Giờ kết thúc phải có định dạng HH:mm.' })
  endTime?: string | null;

  @IsOptional()
  @OptionalBlankToNull()
  @IsString()
  @MaxLength(50, { message: 'Phòng học không được vượt quá 50 ký tự.' })
  room?: string | null;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === null || value === '' ? null : value,
  )
  @Type(() => Number)
  @IsInt({ message: 'Sĩ số phải là số nguyên.' })
  @Min(1, { message: 'Sĩ số tối thiểu là 1.' })
  @Max(200, { message: 'Sĩ số tối đa là 200.' })
  capacity?: number | null;

  @IsOptional()
  @IsEnum(ClassStatus, { message: 'Trạng thái lớp không hợp lệ.' })
  status?: ClassStatus;
}
