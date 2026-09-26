import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class CourseRoadmapStageDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  band?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  modules!: string[];
}

export class CourseRoadmapDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CourseRoadmapStageDto)
  stages!: CourseRoadmapStageDto[];
}
