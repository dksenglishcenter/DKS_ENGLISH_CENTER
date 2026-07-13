import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const CAREER_POSITION_OPTIONS = [
  'Giáo Viên Tiếng Anh IELTS',
  'Tư Vấn Tuyển Sinh',
  'Gia Sư 1-1 (Freelance)',
] as const;

export type CareerPositionOption = (typeof CAREER_POSITION_OPTIONS)[number];

export class CreateCareerApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(CAREER_POSITION_OPTIONS)
  position!: CareerPositionOption;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  introduction?: string;
}
