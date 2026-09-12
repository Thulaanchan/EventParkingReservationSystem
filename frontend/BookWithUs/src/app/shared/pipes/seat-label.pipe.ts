import { Pipe, PipeTransform } from '@angular/core';

export interface SeatLabelSource {
  seatCode?: string | null;
  rowLabel?: string | null;
  number?: number | null;
}

@Pipe({
  name: 'seatLabel',
  standalone: true,
  pure: true
})
export class SeatLabelPipe implements PipeTransform {
  transform(seat: SeatLabelSource | string | null | undefined): string {
    if (!seat) {
      return '';
    }

    if (typeof seat === 'string') {
      return seat.trim();
    }

    if (seat.seatCode && seat.seatCode.trim().length > 0) {
      return seat.seatCode.trim();
    }

    if (seat.rowLabel && seat.number != null) {
      return `${seat.rowLabel.trim()}-${seat.number}`;
    }

    return '';
  }
}
