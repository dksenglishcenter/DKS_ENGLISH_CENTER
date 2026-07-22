import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { PHONE_PATTERN } from '../../common/validation/person';

const GOOGLE_MAPS_URL_PATTERN =
  /^https:\/\/(?:(?:www\.)?google\.com\/maps(?!\/embed(?:[/?#]|$))(?:[/?#].*)?|maps\.google\.com(?!\/embed(?:[/?#]|$))(?:[/?#].*)?|maps\.app\.goo\.gl\/[A-Za-z0-9_-]+(?:[/?#].*)?|goo\.gl\/maps\/[A-Za-z0-9_-]+(?:[/?#].*)?)$/i;
const GOOGLE_MAPS_EMBED_URL_PATTERN =
  /^https:\/\/(?:(?:www\.)?google\.com\/maps\/embed(?:[/?#]|$)|maps\.google\.com\/embed(?:[/?#]|$))/i;

const PHONE_VALIDATION_MESSAGE =
  'Số điện thoại phải có từ 8 đến 15 chữ số và chỉ chứa số, khoảng trắng, +, -, dấu chấm hoặc dấu ngoặc.';
const MAP_REQUIRED_MESSAGE = 'Google Maps URL là bắt buộc.';
const MAP_EMBED_VALIDATION_MESSAGE =
  'Không sử dụng link Nhúng. Hãy sao chép link từ mục Chia sẻ.';
const MAP_URL_VALIDATION_MESSAGE =
  'Chỉ chấp nhận URL HTTPS của Google Maps.';

@ValidatorConstraint({ name: 'isGoogleMapsShareUrl', async: false })
class IsGoogleMapsShareUrlConstraint implements ValidatorConstraintInterface {
  validate(value: unknown) {
    if (typeof value !== 'string' || value.length === 0) return true;

    return GOOGLE_MAPS_URL_PATTERN.test(value);
  }

  defaultMessage({ value }: ValidationArguments) {
    return typeof value === 'string' &&
      GOOGLE_MAPS_EMBED_URL_PATTERN.test(value)
      ? MAP_EMBED_VALIDATION_MESSAGE
      : MAP_URL_VALIDATION_MESSAGE;
  }
}

const Trim = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

export class ContactInformationDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @Matches(PHONE_PATTERN, { message: PHONE_VALIDATION_MESSAGE })
  @MaxLength(20)
  phone!: string;

  @Trim()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự.' })
  email!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address!: string;

  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  hours!: string;

  @Trim()
  @IsString()
  @IsNotEmpty({ message: MAP_REQUIRED_MESSAGE })
  @Validate(IsGoogleMapsShareUrlConstraint)
  @MaxLength(2048)
  mapUrl!: string;
}

export class UpdateContactInformationDto {
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @Matches(PHONE_PATTERN, { message: PHONE_VALIDATION_MESSAGE })
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @Trim()
  @IsEmail({}, { message: 'Email không đúng định dạng.' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự.' })
  email?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  hours?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty({ message: MAP_REQUIRED_MESSAGE })
  @Validate(IsGoogleMapsShareUrlConstraint)
  @MaxLength(2048)
  mapUrl?: string;
}
