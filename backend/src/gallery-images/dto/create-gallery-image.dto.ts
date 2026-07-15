import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGalleryImageDto {
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'imageUrl phải là URL https hợp lệ' })
  imageUrl!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  alt!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  objectPosition?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
