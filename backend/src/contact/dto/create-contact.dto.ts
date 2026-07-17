import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export const CONTACT_COURSE_OPTIONS = [
  'IELTS Preparation',
  '9-to-10 Prep',
  'Communicative English',
  '1-on-1 Tutoring',
] as const;

export type ContactCourseOption = (typeof CONTACT_COURSE_OPTIONS)[number];

const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’-]*$/u;
const PHONE_PATTERN = /^(?=(?:\D*\d){8,15}\D*$)[+\d][\d\s().-]*$/;

const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

const TrimOptional = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    return trimmed || undefined;
  });

export class CreateContactDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(100)
  @Matches(NAME_PATTERN, {
    message:
      'Họ và tên chỉ được chứa chữ cái, khoảng trắng, dấu chấm, dấu nháy hoặc dấu gạch nối.',
  })
  fullName!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Matches(PHONE_PATTERN, {
    message: 'Số điện thoại phải có từ 8 đến 15 chữ số và đúng định dạng.',
  })
  phone!: string;

  @TrimOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @IsIn(CONTACT_COURSE_OPTIONS)
  courseInterest!: ContactCourseOption;

  @TrimOptional()
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  learningNeeds?: string;
}
