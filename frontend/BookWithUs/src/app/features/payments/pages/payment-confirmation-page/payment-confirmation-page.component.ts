import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Payment } from '../../../../core/models/payments/payment.model';
import { PaymentMethod } from '../../../../core/models/payments/payment-method.model';
import { PaymentStatus } from '../../../../core/models/payments/payment-status.model';
import { Booking } from '../../../../core/models/bookings/booking.model';
import { BookingService } from '../../../../core/services/bookings/booking.service';
import { PaymentService } from '../../../../core/services/payments/payment.service';

import { AuthSessionService } from '../../../../core/services/auth/auth-session.service';

@Component({
  selector: 'app-payment-confirmation-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './payment-confirmation-page.component.html',
  styleUrl: './payment-confirmation-page.component.css'
})
export class PaymentConfirmationPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingService);
  private readonly paymentService = inject(PaymentService);
  readonly authSessionService = inject(AuthSessionService);

  bookingId!: number;
  payment: Payment | null = null;
  booking: Booking | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    const snapshotParam =
      this.route.snapshot?.paramMap?.get('bookingId') ??
      this.route.snapshot?.params?.['bookingId'];

    if (snapshotParam) {
      this.bookingId = Number(snapshotParam);
    } else if (this.route.paramMap) {
      this.route.paramMap.subscribe((params) => {
        const id = params.get('bookingId');
        if (id) {
          this.bookingId = Number(id);
        }
      });
    }

    const state = history.state;
    if (state && state.payment) {
      this.payment = state.payment as Payment;
      if (!this.bookingId && this.payment.bookingId) {
        this.bookingId = this.payment.bookingId;
      }
    }

    // If payment state is not in history (e.g. on direct browser refresh), restore via backend API
    if (!this.payment && this.bookingId) {
      this.restoreBookingAndPayment(this.bookingId);
    } else if (this.bookingId) {
      // Also fetch booking details in background to populate event & seats info if available
      this.bookingService.getBookingById(this.bookingId).pipe(
        catchError(() => of(null))
      ).subscribe(b => {
        if (b) this.booking = b;
      });
    }
  }

  restoreBookingAndPayment(bookingId: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    forkJoin({
      booking: this.bookingService.getBookingById(bookingId),
      paymentDue: this.paymentService.getBookingPayment(bookingId).pipe(
        catchError(() => of(null))
      )
    }).subscribe({
      next: ({ booking, paymentDue }) => {
        this.isLoading = false;
        this.booking = booking;
        if (booking) {
          this.payment = {
            paymentId: 0,
            bookingId: booking.bookingId,
            bookingNumber: booking.bookingNumber,
            amountPaid: booking.totalAmount,
            currency: paymentDue?.currency || 'LKR',
            paymentMethod: PaymentMethod.Card,
            paymentStatus: PaymentStatus.Completed,
            bookingStatus: booking.bookingStatus,
            paidAtUtc: booking.updatedAt || booking.createdAt,
            message: 'Your booking has been confirmed and payment recorded.'
          };
        }
      },
      error: (err: unknown) => {
        this.isLoading = false;
        if (err instanceof HttpErrorResponse) {
          if (err.status === 404) {
            this.errorMessage = 'Booking reservation was not found.';
          } else if (err.status === 403) {
            this.errorMessage = 'You do not have authorization to view this booking.';
          } else {
            this.errorMessage = 'Failed to load booking confirmation. Please try again.';
          }
        } else {
          this.errorMessage = 'Failed to load booking confirmation. Please try again.';
        }
      }
    });
  }

  viewReceipt(): void {
    if (this.payment?.paymentId) {
      this.router.navigate(['/payments/receipt', this.payment.paymentId]);
    } else {
      this.router.navigate(['/customer-dashboard']);
    }
  }

  getPaymentMethodName(method?: PaymentMethod | string): string {
    if (!method) return 'Credit / Debit Card';
    switch (method) {
      case PaymentMethod.Card:
      case 'Card':
        return 'Credit / Debit Card';
      case PaymentMethod.MobileWallet:
      case 'MobileWallet':
        return 'Mobile Wallet';
      case PaymentMethod.NetBanking:
      case 'NetBanking':
        return 'Net Banking';
      case PaymentMethod.LankaQr:
      case 'LankaQr':
        return 'LankaQR';
      default:
        return String(method);
    }
  }
}
