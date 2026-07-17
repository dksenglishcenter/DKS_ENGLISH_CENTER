import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { TrimJobText, TrimJobTextItems } from './job-input.transform';
import {
  SALARY_CURRENCIES,
  SALARY_TYPES,
  type SalaryCurrency,
  type SalaryType,
} from '../job-salary';

export class CreateJobDto {
  @TrimJobText()
  @IsString()
  @Matches(/\S/, { message: 'title không được chỉ chứa khoảng trắng' })
  @MinLength(2)
  @MaxLength(150)
  title!: string;

  @TrimJobText()
  @IsString()
  @Matches(/\S/, { message: 'type không được chỉ chứa khoảng trắng' })
  @MinLength(2)
  @MaxLength(80)
  type!: string;

  @TrimJobText()
  @IsString()
  @Matches(/\S/, { message: 'location không được chỉ chứa khoảng trắng' })
  @MinLength(2)
  @MaxLength(120)
  location!: string;

  @IsIn(SALARY_TYPES)
  salaryType!: SalaryType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000000)
  salaryMin?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000000000)
  salaryMax?: number | null;

  @IsIn(SALARY_CURRENCIES)
  currency!: SalaryCurrency;

  @TrimJobTextItems()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(/\S/, {
    each: true,
    message: 'Mỗi nhiệm vụ phải có nội dung',
  })
  @MinLength(2, { each: true })
  @MaxLength(500, { each: true })
  duties!: string[];

  @TrimJobTextItems()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(30)
  @ArrayUnique()
  @IsString({ each: true })
  @Matches(/\S/, {
    each: true,
    message: 'Mỗi quyền lợi phải có nội dung',
  })
  @MinLength(2, { each: true })
  @MaxLength(500, { each: true })
  benefits!: string[];

  @TrimJobText()
  @IsString()
  @Matches(/\S/, { message: 'req không được chỉ chứa khoảng trắng' })
  @MinLength(2)
  @MaxLength(2000)
  req!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10000)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
