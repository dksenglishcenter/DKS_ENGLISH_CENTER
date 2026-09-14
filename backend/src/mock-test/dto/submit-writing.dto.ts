import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class SubmitWritingDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20000)
  responseText!: string;
}
