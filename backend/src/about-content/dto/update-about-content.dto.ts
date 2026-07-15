import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateAboutContentDto {
  @IsOptional()
  @IsString()
  @IsUrl({ require_protocol: true }, { message: 'visionImageUrl phải là URL https hợp lệ' })
  visionImageUrl?: string;
}
