import { Pipe, PipeTransform } from '@angular/core';

export interface SlotCodeSource {
  slotCode?: string | null;
}

@Pipe({
  name: 'slotCode',
  standalone: true,
  pure: true
})
export class SlotCodePipe implements PipeTransform {
  /**
   * Transforms a parking slot code or slot object into a safe, trimmed display label.
   * Preserves backend slot code authoritatively without inventing custom numbering formats.
   */
  transform(value: SlotCodeSource | string | null | undefined, fallback = '—'): string {
    if (!value) {
      return fallback;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : fallback;
    }

    if (value.slotCode && typeof value.slotCode === 'string') {
      const trimmed = value.slotCode.trim();
      return trimmed.length > 0 ? trimmed : fallback;
    }

    return fallback;
  }
}
