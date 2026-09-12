import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  SimpleChanges,
  inject,
  signal
} from '@angular/core';
import { Subscription } from 'rxjs';
import { Booking } from '../../../../../core/models/bookings/booking.model';
import { BookingService } from '../../../../../core/services/bookings/booking.service';

export type BookingDetailPanelState = 'loading' | 'error' | 'data';

@Component({
  selector: 'app-booking-admin-detail-panel',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './booking-admin-detail-panel.component.html',
  styleUrl: './booking-admin-detail-panel.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookingAdminDetailPanelComponent implements OnChanges, OnDestroy {
  private readonly bookingService = inject(BookingService);
  private sub?: Subscription;

  @Input() bookingId: number | null = null;
  @Input() isOpen = false;

  @Output() readonly closePanel = new EventEmitter<void>();

  readonly state = signal<BookingDetailPanelState>('loading');
  readonly booking = signal<Booking | null>(null);
  readonly errorMessage = signal<string | null>(null);

  @HostListener('keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.onClose();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['bookingId'] || (changes['isOpen'] && this.isOpen)) {
      if (this.bookingId && this.isOpen) {
        this.fetchBookingDetails(this.bookingId);
      }
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onClose(): void {
    this.closePanel.emit();
  }

  onRetry(): void {
    if (this.bookingId) {
      this.fetchBookingDetails(this.bookingId);
    }
  }

  private fetchBookingDetails(id: number): void {
    this.state.set('loading');
    this.errorMessage.set(null);

    this.sub?.unsubscribe();
    this.sub = this.bookingService.getBookingById(id).subscribe({
      next: (data) => {
        this.booking.set(data);
        this.state.set('data');
      },
      error: (err: unknown) => {
        this.state.set('error');

        if (err instanceof HttpErrorResponse) {
          if (err.status === 401) {
            this.errorMessage.set('Your session has expired. Please sign in again.');
            return;
          }
          if (err.status === 403) {
            this.errorMessage.set('Administrator access is required to view booking details.');
            return;
          }
          if (err.status === 404) {
            this.errorMessage.set('Booking details could not be found.');
            return;
          }
        }

        this.errorMessage.set('Unable to load booking details. Please try again.');
      }
    });
  }
}
