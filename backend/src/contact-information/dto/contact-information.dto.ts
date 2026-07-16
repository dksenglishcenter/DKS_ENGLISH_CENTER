import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
} from 'class-validator';

const PHONE_PATTERN = /^(?=(?:\D*\d){7,15}\D*$)[+\d][\d\s().-]*$/;
const GOOGLE_MAPS_URL_PATTERN =
  /^https:\/\/(?:www\.)?google\.com\/maps(?:[/?]|$)/i;

const PHONE_VALIDATION_MESSAGE =
  'Số điện thoại phải có từ 7 đến 15 chữ số và chỉ chứa số, khoảng trắng, +, -, dấu chấm hoặc dấu ngoặc.';
const MAP_VALIDATION_MESSAGE =
  'Bản đồ phải là URL HTTPS hợp lệ của Google Maps.';

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
  @IsEmail()
  @MaxLength(255)
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
  @IsNotEmpty()
  @IsUrl(
    { protocols: ['https'], require_protocol: true },
    { message: MAP_VALIDATION_MESSAGE },
  )
  @Matches(GOOGLE_MAPS_URL_PATTERN, { message: MAP_VALIDATION_MESSAGE })
  @MaxLength(5000)
  mapEmbed!: string;
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
  @IsEmail()
  @MaxLength(255)
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
  @IsNotEmpty()
  @IsUrl(
    { protocols: ['https'], require_protocol: true },
    { message: MAP_VALIDATION_MESSAGE },
  )
  @Matches(GOOGLE_MAPS_URL_PATTERN, { message: MAP_VALIDATION_MESSAGE })
  @MaxLength(5000)
  mapEmbed?: string;
}
