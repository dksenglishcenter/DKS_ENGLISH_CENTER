import {
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

/** Relative site path (/courses) or absolute http(s) URL. */
const SECTION_LINK_PATTERN =
  /^(https?:\/\/[^\s]+|\/[a-zA-Z0-9/_#?&=.%-]*)$/;

export class BlogSectionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  heading!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  body!: string;

  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== undefined && value !== '')
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  imageUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  imageAlt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  linkLabel?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  @Matches(SECTION_LINK_PATTERN, {
    message: 'linkHref phải là đường dẫn nội bộ (/...) hoặc URL http(s)',
  })
  linkHref?: string;
}
