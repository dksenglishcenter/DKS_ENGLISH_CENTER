import { IsIn, IsOptional, IsString, ValidateIf } from 'class-validator';

import {
  MEDIA_CATEGORIES,
  SOCIAL_PLATFORMS,
  type MediaCategory,
  type SocialPlatform,
} from '../cloudinary.constants';

export class UploadMediaDto {
  @IsString()
  @IsIn(MEDIA_CATEGORIES)
  category!: MediaCategory;

  @ValidateIf((dto: UploadMediaDto) => dto.category === 'social-icon')
  @IsString()
  @IsIn(SOCIAL_PLATFORMS)
  platform?: SocialPlatform;

  @IsOptional()
  @IsString()
  publicId?: string;
}
