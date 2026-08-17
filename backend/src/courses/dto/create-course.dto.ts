import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { DATE_ONLY_PATTERN } from '../../common/validation/date-only';

export const COURSE_CATEGORIES = [
  'grade-10',
  'thpt-university',
  'ielts',
  'global-success',
] as const;

export class CreateCourseDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug chỉ gồm chữ thường, số và dấu gạch ngang',
  })
  slug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  subtitle!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  level!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(160)
  target!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  tuition!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  duration!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    return typeof value === 'string' ? value.trim() : value;
  })
  @ValidateIf((_, value) => value != null)
  @Matches(DATE_ONLY_PATTERN, {
    message: 'Ngày bắt đầu khóa phải có định dạng YYYY-MM-DD.',
  })
  startDate?: string | null;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined) return undefined;
    if (value === null || value === '') return null;
    return typeof value === 'string' ? value.trim() : value;
  })
  @ValidateIf((_, value) => value != null)
  @Matches(DATE_ONLY_PATTERN, {
    message: 'Ngày kết thúc khóa phải có định dạng YYYY-MM-DD.',
  })
  endDate?: string | null;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  perks!: string[];

  @IsString()
  @IsIn(COURSE_CATEGORIES, {
    message: `category phải là một trong: ${COURSE_CATEGORIES.join(', ')}`,
  })
  category!: string;

  @IsString()
  @IsUrl({ require_protocol: true })
  coverImageUrl!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  accent?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  bg?: string;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  icon?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
