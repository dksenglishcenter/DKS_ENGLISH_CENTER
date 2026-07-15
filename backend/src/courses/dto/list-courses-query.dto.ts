import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';
import { TransformOptionalBoolean } from '../../common/dto/to-optional-boolean';
import { ListPublishedOnlyQueryDto } from '../../common/dto/list-published-only-query.dto';

export class ListCoursesQueryDto extends ListPublishedOnlyQueryDto {
  @IsOptional()
  @TransformOptionalBoolean()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  category?: string;
}
