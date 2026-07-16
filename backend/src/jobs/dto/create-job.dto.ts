import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateJobDto {
  @IsString()
  @Matches(/\S/, { message: 'title không được chỉ chứa khoảng trắng' })
  @MinLength(2)
  @MaxLength(150)
  title!: string;

  @IsString()
  @Matches(/\S/, { message: 'type không được chỉ chứa khoảng trắng' })
  @MinLength(2)
  @MaxLength(80)
  type!: string;

  @IsString()
  @Matches(/\S/, { message: 'location không được chỉ chứa khoảng trắng' })
  @MinLength(2)
  @MaxLength(120)
  location!: string;

  @IsString()
  @Matches(/\S/, { message: 'salary không được chỉ chứa khoảng trắng' })
  @MinLength(2)
  @MaxLength(120)
  salary!: string;

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

  @IsString()
  @Matches(/\S/, { message: 'req không được chỉ chứa khoảng trắng' })
  @MinLength(2)
  @MaxLength(2000)
  req!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10000)
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}
