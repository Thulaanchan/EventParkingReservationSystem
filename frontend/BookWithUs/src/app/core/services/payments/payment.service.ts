import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { buildApiUrl } from '../../config/api.config';
import { API_ENDPOINTS } from '../../constants/api-endpoints.constants';
import { PaymentDue } from '../../models/payments/payment-due.model';
import { Payment } from '../../models/payments/payment.model';
import { PaymentSummary } from '../../models/payments/payment-summary.model';
import { PaymentReceipt } from '../../models/payments/receipt.model';
import { ProcessPaymentRequest } from '../../models/payments/process-payment-request.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private readonly http: HttpClient) {}

  getPaymentDue(bookingId: number): Observable<PaymentDue> {
    return this.http.get<PaymentDue>(
      buildApiUrl(API_ENDPOINTS.payments.forBooking(bookingId))
    );
  }

  processPayment(
    bookingId: number,
    request: ProcessPaymentRequest
  ): Observable<Payment> {
    return this.http.post<Payment>(
      buildApiUrl(API_ENDPOINTS.payments.forBooking(bookingId)),
      request
    );
  }

  getCustomerPaymentHistory(
    customerId: number
  ): Observable<PaymentSummary[]> {
    return this.http.get<PaymentSummary[]>(
      buildApiUrl(API_ENDPOINTS.payments.forCustomer(customerId))
    );
  }

  getReceipt(paymentId: number): Observable<PaymentReceipt> {
    return this.http.get<PaymentReceipt>(
      buildApiUrl(API_ENDPOINTS.payments.receipt(paymentId))
    );
  }

  getAllPayments(): Observable<PaymentSummary[]> {
    return this.http.get<PaymentSummary[]>(
      buildApiUrl(API_ENDPOINTS.payments.all)
    );
  }
}
