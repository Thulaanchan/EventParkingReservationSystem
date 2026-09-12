import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { SeatStatus, SeatStatusName } from '../../core/models/seats/seat-status.model';

@Directive({
  selector: '[appSeatStatus]',
  standalone: true
})
export class SeatStatusDirective implements OnChanges {
  @Input('appSeatStatus') status: SeatStatus | SeatStatusName | string | null | undefined;

  private readonly statusClasses = [
    'seat-status-available',
    'seat-status-held',
    'seat-status-booked'
  ];

  constructor(
    private readonly el: ElementRef<HTMLElement>,
    private readonly renderer: Renderer2
  ) {}

  ngOnChanges(_changes: SimpleChanges): void {
    this.updateStatus();
  }

  private updateStatus(): void {
    for (const cls of this.statusClasses) {
      this.renderer.removeClass(this.el.nativeElement, cls);
    }

    const normalized = this.normalizeStatus(this.status);
    if (!normalized) {
      this.renderer.removeAttribute(this.el.nativeElement, 'data-seat-status');
      return;
    }

    this.renderer.addClass(this.el.nativeElement, `seat-status-${normalized.toLowerCase()}`);
    this.renderer.setAttribute(this.el.nativeElement, 'data-seat-status', normalized.toLowerCase());
  }

  private normalizeStatus(status: SeatStatus | SeatStatusName | string | null | undefined): SeatStatusName | null {
    if (status == null) {
      return null;
    }

    if (status === SeatStatus.Available || status === 'Available' || status === '1') {
      return 'Available';
    }
    if (status === SeatStatus.Held || status === 'Held' || status === '2') {
      return 'Held';
    }
    if (status === SeatStatus.Booked || status === 'Booked' || status === '3') {
      return 'Booked';
    }

    return null;
  }
}
