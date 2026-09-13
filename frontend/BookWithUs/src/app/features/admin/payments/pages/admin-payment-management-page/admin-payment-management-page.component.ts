import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { PaymentService } from '../../../../../core/services/payments/payment.service';
import { PaymentSummary } from '../../../../../core/models/payments/payment-summary.model';
import { PaymentMethod } from '../../../../../core/models/payments/payment-method.model';
import { PaymentStatus } from '../../../../../core/models/payments/payment-status.model';

@Component({
  selector: 'app-admin-payment-management-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-payment-management-page.component.html',
  styleUrl: './admin-payment-management-page.component.css'
})
export class AdminPaymentManagementPageComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly router = inject(Router);

  payments: PaymentSummary[] = [];
  isLoading = false;
  errorMessage = '';

  PaymentStatus = PaymentStatus;
  PaymentMethod = PaymentMethod;

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.getAllPayments().subscribe({
      next: (response: PaymentSummary[]) => {
        this.payments = response ?? [];
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        this.errorMessage = 'Unable to load payments';
        console.error('Failed to load payments:', err);
      }
    });
  }

  viewReceipt(paymentId: number): void {
    this.router.navigate(['/payments/receipt', paymentId]);
  }

  get totalTransactions(): number {
    return this.payments.length;
  }

  get totalRevenue(): number {
    return this.payments
      .filter((p) => p.status === PaymentStatus.Completed)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
  }

  get successfulPaymentsCount(): number {
    return this.payments.filter((p) => p.status === PaymentStatus.Completed).length;
  }

  get pendingPaymentsCount(): number {
    return this.payments.filter((p) => p.status === PaymentStatus.Pending).length;
  }

  getPaymentMethodName(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.Card:
        return 'Card';
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

  getPaymentStatusName(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Completed:
        return 'Completed';
      case PaymentStatus.Pending:
        return 'Pending';
      case PaymentStatus.Failed:
        return 'Failed';
      default:
        return String(status);
    }
  }

  getPaymentStatusBadgeClass(status: PaymentStatus): string {
    switch (status) {
      case PaymentStatus.Completed:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case PaymentStatus.Pending:
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case PaymentStatus.Failed:
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  }
}
