import { Transform } from 'class-transformer';

/** Parse recognized query/body values and preserve invalid input for validation. */
export function toOptionalBoolean(value: unknown): unknown {
  if (value === undefined || value === null || value === '') return undefined;
  if (value === true || value === 'true' || value === '1') return true;
  if (value === false || value === 'false' || value === '0') return false;
  return value;
}

/** Decorator shorthand cho publishedOnly / featured flags. */
export function TransformOptionalBoolean(defaultWhenEmpty?: boolean) {
  return Transform(({ value }) => {
    const parsed = toOptionalBoolean(value);
    return parsed === undefined ? defaultWhenEmpty : parsed;
  });
}
