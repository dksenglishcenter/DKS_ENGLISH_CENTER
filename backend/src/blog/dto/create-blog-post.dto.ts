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

export class CreateBlogPostDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug chỉ gồm chữ thường, số và dấu gạch ngang',
  })
  slug!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(500)
  excerpt!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  category!: string;

  @IsDateString()
  publishedAt!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  readTimeMinutes!: number;

  @IsString()
  @IsUrl({ require_protocol: true })
  coverImageUrl!: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  intro!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BlogSectionDto)
  sections!: BlogSectionDto[];

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  takeaway!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
