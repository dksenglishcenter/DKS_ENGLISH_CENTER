import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';

/**
 * Payload to import a whole test (teacher/admin). The nested sections/groups/
 * questions are validated in the service so teachers get clear, specific
 * errors about which question is malformed.
 */
export class ImportTestDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  skill!: string;

  @IsInt()
  @Min(1)
  durationMinutes!: number;

  @IsArray()
  sections!: unknown[];

  // Optional fields are read loosely in the service.
  [key: string]: unknown;
}
