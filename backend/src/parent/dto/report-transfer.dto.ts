import { Transform } from 'class-transformer';
import { IsOptional, IsUrl, ValidateIf } from 'class-validator';

/** JSON fallback (tests). UI phụ huynh gửi multipart field `file`. */
export class ReportTransferDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => {
    if (value === undefined || value === null || value === '') return undefined;
    return typeof value === 'string' ? value.trim() : value;
  })
  @ValidateIf((_, value) => value != null && value !== '')
  @IsUrl(
    { require_protocol: true },
    { message: 'Minh chứng chuyển khoản phải là URL ảnh hợp lệ.' },
  )
  paymentProofUrl?: string;
}
