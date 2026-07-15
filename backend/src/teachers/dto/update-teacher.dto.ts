import { Type } from 'class-transformer';
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

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  cred?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  exp?: string;

  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'imageUrl phải là URL https hợp lệ' })
  imageUrl?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  bio?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(50)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
