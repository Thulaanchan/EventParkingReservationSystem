import { AbstractControl, ValidationErrors } from '@angular/forms';

export function expiryInFutureValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;

  if (value === null || value === undefined) {
    return null;
  }

  const rawValue = typeof value === 'string' ? value : String(value);
  const trimmed = rawValue.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const match = trimmed.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) {
    return { expiryInPast: true };
  }

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);

  // Expiry is valid until the end of the selected month.
  const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);

  return expiryDate.getTime() >= Date.now() ? null : { expiryInPast: true };
}
