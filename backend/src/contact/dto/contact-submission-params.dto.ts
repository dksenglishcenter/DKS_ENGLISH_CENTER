import { Matches } from 'class-validator';

export class ContactSubmissionParamsDto {
  @Matches(/^c[a-z0-9]{24}$/, {
    message: 'ID yêu cầu tư vấn không đúng định dạng CUID.',
  })
  id!: string;
}
