import { IsOptional, IsString } from 'class-validator';

export class SetAudioDto {
  /** Cloudinary URL, or empty to clear. */
  @IsOptional()
  @IsString()
  audioUrl?: string;
}
