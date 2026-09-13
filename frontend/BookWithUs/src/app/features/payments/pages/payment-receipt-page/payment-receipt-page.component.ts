import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { PaymentService } from '../../../../core/services/payments/payment.service';
import { PaymentReceipt } from '../../../../core/models/payments/receipt.model';
import { PaymentMethod } from '../../../../core/models/payments/payment-method.model';

@Component({
  selector: 'app-payment-receipt-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-receipt-page.component.html',
  styleUrl: './payment-receipt-page.component.css'
})
export class PaymentReceiptPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentService = inject(PaymentService);

  paymentId!: number;
  receipt: PaymentReceipt | null = null;
  isLoading = false;
  errorMessage = '';

  ngOnInit(): void {
    const snapshotParam =
      this.route.snapshot?.paramMap?.get('paymentId') ??
      this.route.snapshot?.params?.['paymentId'];

    if (snapshotParam) {
      this.paymentId = Number(snapshotParam);
      this.loadReceipt(this.paymentId);
    } else if (this.route.paramMap) {
      this.route.paramMap.subscribe((params) => {
        const id = params.get('paymentId');
        if (id) {
          this.paymentId = Number(id);
          this.loadReceipt(this.paymentId);
        }
      });
    }
  }

  loadReceipt(paymentId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.getReceipt(paymentId).subscribe({
      next: (receipt: PaymentReceipt) => {
        this.receipt = receipt;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ??
          err?.message ??
          'Unable to load receipt';
      }
    });
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
