import { Matches } from 'class-validator';

export class JobParamsDto {
  @Matches(/^c[a-z0-9]{24}$/, {
    message: 'ID vị trí tuyển dụng không đúng định dạng CUID.',
  })
  id!: string;
}
