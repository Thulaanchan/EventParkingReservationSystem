import { Component, OnInit, inject, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PaymentService } from '../../../../core/services/payments/payment.service';
import { AuthSessionService } from '../../../../core/services/auth/auth-session.service';
import { PaymentSummary } from '../../../../core/models/payments/payment-summary.model';
import { PaymentMethod } from '../../../../core/models/payments/payment-method.model';

@Component({
  selector: 'app-payment-history-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-history-page.component.html',
  styleUrl: './payment-history-page.component.css'
})
export class PaymentHistoryPageComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly router = inject(Router);

  payments: PaymentSummary[] = [];
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const customerId = this.authSessionService.currentCustomerId;

    if (!customerId) {
      this.isLoading = false;
      this.errorMessage = 'Unable to load payment history';
      return;
    }

    this.loadPaymentHistory(customerId);
  }

  loadPaymentHistory(customerId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.getCustomerPaymentHistory(customerId).subscribe({
      next: (payments: PaymentSummary[]) => {
        this.payments = payments ?? [];
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ??
          err?.message ??
          'Unable to load payment history';
      }
    });
  }

  viewReceipt(paymentId: number): void {
    this.router.navigate(['/payments/receipt', paymentId]);
  }

  getPaymentMethodName(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.Card:
        return 'Credit / Debit Card';
      case PaymentMethod.MobileWallet:
        return 'Mobile Wallet';
      case PaymentMethod.NetBanking:
        return 'Net Banking';
      case PaymentMethod.LankaQr:
        return 'LankaQR';
      default:
        return String(method);
    }
  }
}
