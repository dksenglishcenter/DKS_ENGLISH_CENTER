import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export const CONTACT_COURSE_OPTIONS = [
  'IELTS Preparation',
  '9-to-10 Prep',
  'Communicative English',
  '1-on-1 Tutoring',
] as const;

export type ContactCourseOption = (typeof CONTACT_COURSE_OPTIONS)[number];

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone!: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(CONTACT_COURSE_OPTIONS)
  courseInterest!: ContactCourseOption;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  learningNeeds?: string;
}
