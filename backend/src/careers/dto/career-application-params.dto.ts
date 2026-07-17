import { Matches } from 'class-validator';

export class CareerApplicationParamsDto {
  @Matches(/^c[a-z0-9]{24}$/, {
    message: 'ID đơn ứng tuyển không đúng định dạng CUID.',
  })
  id!: string;
}
