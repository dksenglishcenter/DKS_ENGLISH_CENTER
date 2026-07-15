import { IsBoolean, IsOptional } from 'class-validator';
import { TransformOptionalBoolean } from './to-optional-boolean';

/** Dùng chung hầu hết list endpoints public/admin. */
export class ListPublishedOnlyQueryDto {
  /** Public mặc định true; admin truyền false để xem cả bản nháp. */
  @IsOptional()
  @TransformOptionalBoolean(true)
  @IsBoolean()
  publishedOnly?: boolean = true;
}
