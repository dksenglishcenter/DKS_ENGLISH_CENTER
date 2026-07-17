import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { BlogSectionDto } from './blog-section.dto';

export class UpdateBlogPostDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug chỉ gồm chữ thường, số và dấu gạch ngang',
  })
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  category?: string;

  @IsOptional()
  @IsDateString()
  publishedAt?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readTimeMinutes?: number;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true })
  coverImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  intro?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BlogSectionDto)
  sections?: BlogSectionDto[];

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  takeaway?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
