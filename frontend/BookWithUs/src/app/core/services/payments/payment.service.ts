import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaymentReceipt } from '../../models/payments/payment-details.model';
import { BookingPaymentDue } from '../../models/payments/payment-due.model';
import { PaymentHistoryItem } from '../../models/payments/payment-summary.model';
import { PaymentResult } from '../../models/payments/payment.model';
import { ProcessPaymentRequest } from '../../models/payments/process-payment-request.model';
import { AuthSessionService } from '../auth/auth-session.service';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly http = inject(HttpClient);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly apiBase = environment.apiUrl;

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
   * Replaces invalid /api/payments/history with backend endpoint GET /api/payments/customer/{customerId}.
   * Role: Customer only.
   */
  getPaymentHistory(customerId?: number): Observable<PaymentHistoryItem[]> {
    const id = customerId ?? this.authSessionService.currentCustomerId;
    if (id) {
      return this.getCustomerPaymentHistory(id);
    }
    return this.getAllPayments();
  }

  /**
   * Retrieves payment history for a specific customer.
   * Endpoint: GET /api/payments/customer/{customerId}
   * Role: Customer only.
   */
  getCustomerPaymentHistory(customerId: number): Observable<PaymentHistoryItem[]> {
    return this.http.get<PaymentHistoryItem[]>(
      `${this.apiBase}/payments/customer/${customerId}`
    );
  }

  /**
   * Retrieves all payments for administrative review.
   * Endpoint: GET /api/payments
   * Role: Administrator only.
   */
  getAllPayments(): Observable<PaymentHistoryItem[]> {
    return this.http.get<PaymentHistoryItem[]>(
      `${this.apiBase}/payments`
    );
  }

  /**
   * Retrieves the printable receipt for a completed payment.
   * Endpoint: GET /api/payments/{paymentId}/receipt
   * Role: Customer only.
   */
  getReceipt(paymentId: number): Observable<PaymentReceipt> {
    return this.http.get<PaymentReceipt>(
      `${this.apiBase}/payments/${paymentId}/receipt`
    );
  }

  /**
   * Retrieves the printable receipt for a completed payment.
   * Alias for getReceipt.
   */
  getPaymentReceipt(paymentId: number): Observable<PaymentReceipt> {
    return this.getReceipt(paymentId);
  }
}
