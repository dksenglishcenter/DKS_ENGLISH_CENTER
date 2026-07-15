import { IsString, IsUrl } from 'class-validator';

export class DeleteMediaDto {
  @IsString()
  @IsUrl({ require_protocol: true })
  url!: string;
}
