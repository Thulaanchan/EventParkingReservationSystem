import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { Payment } from '../../../../core/models/payments/payment.model';
import { PaymentMethod } from '../../../../core/models/payments/payment-method.model';

@Component({
  selector: 'app-payment-confirmation-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-confirmation-page.component.html',
  styleUrl: './payment-confirmation-page.component.css'
})
export class PaymentConfirmationPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  bookingId!: number;
  payment: Payment | null = null;

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
  }

  viewReceipt(): void {
    if (this.payment?.paymentId) {
      this.router.navigate(['/payments/receipt', this.payment.paymentId]);
    }
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
