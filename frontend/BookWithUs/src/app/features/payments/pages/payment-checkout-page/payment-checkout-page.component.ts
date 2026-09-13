import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { PaymentService } from '../../../../core/services/payments/payment.service';
import { PaymentDue } from '../../../../core/models/payments/payment-due.model';
import { PaymentMethod } from '../../../../core/models/payments/payment-method.model';
import { ProcessPaymentRequest } from '../../../../core/models/payments/process-payment-request.model';
import { Payment } from '../../../../core/models/payments/payment.model';
import { cardChecksumValidator } from '../../../../shared/validators/card-checksum.validator';
import { expiryFormatValidator } from '../../../../shared/validators/expiry-format.validator';
import { expiryInFutureValidator } from '../../../../shared/validators/expiry-in-future.validator';

@Component({
  selector: 'app-payment-checkout-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './payment-checkout-page.component.html',
  styleUrl: './payment-checkout-page.component.css'
})
export class PaymentCheckoutPageComponent implements OnInit {
  private readonly paymentService = inject(PaymentService);
  private readonly route = inject(ActivatedRoute);

  bookingId!: number;
  paymentDue: PaymentDue | null = null;
  isLoading = false;
  errorMessage = '';
  paymentResult: Payment | null = null;

  paymentForm: FormGroup = new FormGroup({
    paymentMethod: new FormControl<PaymentMethod | null>(null, [
      Validators.required
    ]),
    cardholderName: new FormControl<string>(''),
    testCardNumber: new FormControl<string>('', [
      Validators.required,
      cardChecksumValidator
    ]),
    expiry: new FormControl<string>('', [
      Validators.required,
      expiryFormatValidator,
      expiryInFutureValidator
    ]),
    testCvv: new FormControl<string>('')
  });

  readonly PaymentMethod = PaymentMethod;

  readonly paymentMethodOptions = [
    { value: PaymentMethod.Card, label: 'Credit / Debit Card' },
    { value: PaymentMethod.MobileWallet, label: 'Mobile Wallet' },
    { value: PaymentMethod.NetBanking, label: 'Net Banking' },
    { value: PaymentMethod.LankaQr, label: 'LankaQR' }
  ];

  ngOnInit(): void {
    const snapshotParam =
      this.route.snapshot?.paramMap?.get('bookingId') ??
      this.route.snapshot?.paramMap?.get('id') ??
      this.route.snapshot?.params?.['bookingId'] ??
      this.route.snapshot?.params?.['id'];

    if (snapshotParam) {
      this.bookingId = Number(snapshotParam);
      this.loadPaymentDue(this.bookingId);
    } else if (this.route.paramMap) {
      this.route.paramMap.subscribe((params) => {
        const id = params.get('bookingId') ?? params.get('id');
        if (id) {
          this.bookingId = Number(id);
          this.loadPaymentDue(this.bookingId);
        }
      });
    } else if (this.route.params) {
      this.route.params.subscribe((params) => {
        const id = params['bookingId'] ?? params['id'];
        if (id) {
          this.bookingId = Number(id);
          this.loadPaymentDue(this.bookingId);
        }
      });
    }
  }

  loadPaymentDue(bookingId: number): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.getPaymentDue(bookingId).subscribe({
      next: (due) => {
        this.paymentDue = due;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ??
          err?.message ??
          'Failed to load payment details.';
      }
    });
  }

  submitPayment(): void {
    if (this.paymentForm.invalid || this.isLoading) {
      return;
    }

    const formValues = this.paymentForm.value;
    const request: ProcessPaymentRequest = {
      paymentMethod: formValues.paymentMethod,
      cardholderName: formValues.cardholderName || null,
      testCardNumber: formValues.testCardNumber || null,
      expiry: formValues.expiry || null,
      testCvv: formValues.testCvv || null
    };

    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.processPayment(this.bookingId, request).subscribe({
      next: (payment: Payment) => {
        this.isLoading = false;
        this.paymentResult = payment;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.message ??
          err?.message ??
          'Payment processing failed.';
      }
    });
  }
}
