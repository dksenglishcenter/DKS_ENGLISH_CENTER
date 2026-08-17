import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { InvoiceStatus } from '../../../generated/prisma/client';
import { CUID_MESSAGE, CUID_PATTERN } from '../../common/validation/cuid';
import { DATE_ONLY_PATTERN, PERIOD_PATTERN } from '../../common/validation/date-only';

const OptionalBlankToNull = () =>
  Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed || null;
  });

export class ListInvoicesQueryDto {
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
  @IsEnum(InvoiceStatus, { message: 'Trạng thái học phí không hợp lệ.' })
  status?: InvoiceStatus;

  @IsOptional()
  @Matches(CUID_PATTERN, { message: 'ID học viên không đúng định dạng CUID.' })
  studentId?: string;
}

export class InvoiceParamsDto {
  @Matches(CUID_PATTERN, { message: CUID_MESSAGE })
  id!: string;
}

export class CreateInvoiceDto {
  @Matches(CUID_PATTERN, { message: 'ID học viên không đúng định dạng CUID.' })
  studentId!: string;

  @Matches(PERIOD_PATTERN, {
    message: 'Kỳ học phí phải có định dạng YYYY-MM.',
  })
  period!: string;

  @Type(() => Number)
  @IsInt({ message: 'Số tiền phải là số nguyên.' })
  @Min(0, { message: 'Số tiền không được âm.' })
  amount!: number;

  @Matches(DATE_ONLY_PATTERN, {
    message: 'Hạn đóng phải có định dạng YYYY-MM-DD.',
  })
  dueDate!: string;

  @IsOptional()
  @OptionalBlankToNull()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự.' })
  note?: string | null;
}

export class UpdateInvoiceDto {
  @IsOptional()
  @Matches(PERIOD_PATTERN, {
    message: 'Kỳ học phí phải có định dạng YYYY-MM.',
  })
  period?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Số tiền phải là số nguyên.' })
  @Min(0, { message: 'Số tiền không được âm.' })
  amount?: number;

  @IsOptional()
  @Matches(DATE_ONLY_PATTERN, {
    message: 'Hạn đóng phải có định dạng YYYY-MM-DD.',
  })
  dueDate?: string;

  @IsOptional()
  @IsEnum(InvoiceStatus, { message: 'Trạng thái học phí không hợp lệ.' })
  status?: InvoiceStatus;

  @IsOptional()
  @OptionalBlankToNull()
  @IsString()
  @MaxLength(500, { message: 'Ghi chú không được vượt quá 500 ký tự.' })
  note?: string | null;
}
