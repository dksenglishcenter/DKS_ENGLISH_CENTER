import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { TransformOptionalBoolean } from '../../common/dto/to-optional-boolean';

export class ListJobsQueryDto {
  @IsOptional()
  @TransformOptionalBoolean()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
