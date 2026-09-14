import { IsOptional, IsString, MaxLength } from 'class-validator';

export class GradeWritingDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  band?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  feedback?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20000)
  sampleAnswer?: string;
}

export class GradeSpeakingDto {
  @IsOptional()
  @IsString()
  @MaxLength(10)
  band?: string;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  feedback?: string;
}
