import { AbstractControl, ValidationErrors } from '@angular/forms';

export function expiryFormatValidator(
  control: AbstractControl
): ValidationErrors | null {
  const value = control.value;

  if (value === null || value === undefined) {
    return null;
  }

  const rawValue = typeof value === 'string' ? value : String(value);

  if (rawValue.trim().length === 0) {
    return null;
  }

  const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;

  return expiryRegex.test(rawValue) ? null : { invalidExpiryFormat: true };
}
