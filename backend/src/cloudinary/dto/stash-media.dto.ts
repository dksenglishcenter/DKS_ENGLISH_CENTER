import { IsString, IsUrl, Matches, MinLength } from 'class-validator';

export class StashMediaDto {
  @IsString()
  @IsUrl({ require_protocol: true })
  url!: string;
}

const PUBLIC_ID_PATTERN =
  /^dks-english-center\/(courses|home\/gallery|about\/facilities|about\/vision|about\/teachers|blog|tuition\/proofs)(\/[\w.-]+)*$/;

export class RestoreMediaDto {
  @IsString()
  @MinLength(3)
  @Matches(PUBLIC_ID_PATTERN, { message: 'stashPublicId không hợp lệ' })
  stashPublicId!: string;

  @IsString()
  @MinLength(3)
  @Matches(PUBLIC_ID_PATTERN, { message: 'originalPublicId không hợp lệ' })
  originalPublicId!: string;
}
