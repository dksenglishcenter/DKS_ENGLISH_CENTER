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

export class CreateTeacherDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(200)
  cred!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  exp!: string;

  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'imageUrl phải là URL https hợp lệ' })
  imageUrl!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  bio!: string;

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
