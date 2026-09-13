import { AbstractControl, ValidationErrors } from '@angular/forms';

export function cardChecksumValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;

  if (value === null || value === undefined) {
    return null;
  }

  const rawValue = typeof value === 'string' ? value : String(value);
  const normalized = rawValue.replace(/[\s-]/g, '');

  if (normalized.length === 0) {
    return null;
  }

  if (!/^\d+$/.test(normalized)) {
    return { invalidCardChecksum: true };
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = normalized.length - 1; i >= 0; i--) {
    let digit = Number(normalized[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0 ? null : { invalidCardChecksum: true };
}
