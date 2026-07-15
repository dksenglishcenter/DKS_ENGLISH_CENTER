import { Type } from 'class-transformer';
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
} from 'class-validator';

import { COURSE_CATEGORIES } from './create-course.dto';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug chỉ gồm chữ thường, số và dấu gạch ngang',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  subtitle?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  level?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  target?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  tuition?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  duration?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  perks?: string[];

  @IsOptional()
  @IsString()
  @IsIn(COURSE_CATEGORIES, {
    message: `category phải là một trong: ${COURSE_CATEGORIES.join(', ')}`,
  })
  category?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  coverImageUrl?: string;

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
