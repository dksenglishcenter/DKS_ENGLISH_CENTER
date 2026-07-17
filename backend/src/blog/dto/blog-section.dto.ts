import { IsString, MaxLength, MinLength } from 'class-validator';

export class BlogSectionDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  heading!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  body!: string;
}
