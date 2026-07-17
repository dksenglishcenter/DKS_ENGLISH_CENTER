import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { TransformOptionalBoolean } from '../../common/dto/to-optional-boolean';
import { ListPublishedOnlyQueryDto } from '../../common/dto/list-published-only-query.dto';

export class ListBlogPostsQueryDto extends ListPublishedOnlyQueryDto {
  @IsOptional()
  @TransformOptionalBoolean()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;
}
