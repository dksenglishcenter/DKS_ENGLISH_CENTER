import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AttendanceStatus } from '../../../generated/prisma/client';
import { CUID_MESSAGE, CUID_PATTERN } from '../../common/validation/cuid';
import { DATE_ONLY_PATTERN } from '../../common/validation/date-only';

export class SessionParamsDto {
  @Matches(CUID_PATTERN, { message: CUID_MESSAGE })
  id!: string;
}

export class OpenSessionDto {
  @Matches(DATE_ONLY_PATTERN, {
    message: 'Ngày buổi học phải có định dạng YYYY-MM-DD.',
  })
  date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự.' })
  note?: string;
}

export class AttendanceRecordItemDto {
  @Matches(CUID_PATTERN, { message: 'ID học viên không đúng định dạng CUID.' })
  studentId!: string;

  @IsEnum(AttendanceStatus, { message: 'Trạng thái điểm danh không hợp lệ.' })
  status!: AttendanceStatus;

  @IsOptional()
  @IsString()
  @MaxLength(300, { message: 'Ghi chú điểm danh không được vượt quá 300 ký tự.' })
  note?: string;
}

export class SaveAttendanceDto {
  @IsArray({ message: 'Danh sách điểm danh phải là mảng.' })
  @ArrayMinSize(1, { message: 'Cần ít nhất một học viên để lưu điểm danh.' })
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordItemDto)
  records!: AttendanceRecordItemDto[];
}

export class AttendanceRangeQueryDto {
  @IsOptional()
  @Matches(DATE_ONLY_PATTERN, {
    message: 'Ngày bắt đầu phải có định dạng YYYY-MM-DD.',
  })
  from?: string;

  @IsOptional()
  @Matches(DATE_ONLY_PATTERN, {
    message: 'Ngày kết thúc phải có định dạng YYYY-MM-DD.',
  })
  to?: string;
}
