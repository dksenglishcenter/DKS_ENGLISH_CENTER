import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

class AnswerItemDto {
  @IsString()
  questionId!: string;

  /** The typed/selected answer. Empty is allowed (clearing an answer). */
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  value?: string;
}

/** Autosave payload: one or more answers for the current attempt. */
export class SaveAnswersDto {
  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => AnswerItemDto)
  answers!: AnswerItemDto[];
}
