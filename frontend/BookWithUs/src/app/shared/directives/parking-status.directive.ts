import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';
import { ParkingStatus, ParkingStatusName } from '../../core/models/parking/parking-status.model';

@Directive({
  selector: '[appParkingStatus]',
  standalone: true
})
export class ParkingStatusDirective implements OnChanges {
  @Input('appParkingStatus') status: ParkingStatus | ParkingStatusName | string | null | undefined;

  private readonly statusClasses = [
    'parking-status-available',
    'parking-status-held',
    'parking-status-occupied'
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
      this.renderer.removeAttribute(this.el.nativeElement, 'data-parking-status');
      return;
    }

    this.renderer.addClass(this.el.nativeElement, `parking-status-${normalized.toLowerCase()}`);
    this.renderer.setAttribute(this.el.nativeElement, 'data-parking-status', normalized.toLowerCase());
  }

  private normalizeStatus(status: ParkingStatus | ParkingStatusName | string | null | undefined): ParkingStatusName | null {
    if (status == null) {
      return null;
    }

    if (status === ParkingStatus.Available || status === 'Available' || status === '1') {
      return 'Available';
    }
    if (status === ParkingStatus.Held || status === 'Held' || status === '2') {
      return 'Held';
    }
    if (status === ParkingStatus.Occupied || status === 'Occupied' || status === '3') {
      return 'Occupied';
    }

    return null;
  }
}
