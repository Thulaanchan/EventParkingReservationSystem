import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentReceipt } from '../../models/payments/payment-details.model';
import { BookingPaymentDue } from '../../models/payments/payment-due.model';
import { PaymentHistoryItem } from '../../models/payments/payment-summary.model';
import { PaymentResult } from '../../models/payments/payment.model';
import { ProcessPaymentRequest } from '../../models/payments/process-payment-request.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = '/api';

  /**
   * Retrieves payment due and status for a specific booking.
   * Endpoint: GET /api/bookings/{bookingId}/payment
   * Role: Customer (own booking only) or Admin.
   */
  getBookingPayment(bookingId: number): Observable<BookingPaymentDue> {
    return this.http.get<BookingPaymentDue>(
      `${this.apiBase}/bookings/${bookingId}/payment`
    );
  }

  /**
   * Processes a simulated payment for a pending booking.
   * Endpoint: POST /api/bookings/{bookingId}/payment
   * Role: Customer (own booking only).
   */
  processPayment(
    bookingId: number,
    request: ProcessPaymentRequest
  ): Observable<PaymentResult> {
    return this.http.post<PaymentResult>(
      `${this.apiBase}/bookings/${bookingId}/payment`,
      request
    );
  }

  /**
   * Retrieves payment history for the authenticated customer.
   * Endpoint: GET /api/payments/history
   * Role: Customer only.
   */
  getPaymentHistory(): Observable<PaymentHistoryItem[]> {
    return this.http.get<PaymentHistoryItem[]>(
      `${this.apiBase}/payments/history`
    );
  }

  /**
   * Retrieves the printable receipt for a completed payment.
   * Endpoint: GET /api/payments/{paymentId}/receipt
   * Role: Customer only.
   */
  getPaymentReceipt(paymentId: number): Observable<PaymentReceipt> {
    return this.http.get<PaymentReceipt>(
      `${this.apiBase}/payments/${paymentId}/receipt`
    );
  }
}
