import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { BookingPaymentDue } from '../../../../core/models/payments/payment-due.model';
import { PaymentMethod } from '../../../../core/models/payments/payment-method.model';
import { PaymentResult } from '../../../../core/models/payments/payment.model';
import { ProcessPaymentRequest } from '../../../../core/models/payments/process-payment-request.model';
import { PaymentService } from '../../../../core/services/payments/payment.service';
import { PaymentBookingSummaryComponent } from '../../components/payment-booking-summary/payment-booking-summary.component';
import { PaymentMethodSelectorComponent } from '../../components/payment-method-selector/payment-method-selector.component';
import { PaymentSecurityNoticeComponent } from '../../components/payment-security-notice/payment-security-notice.component';
import { SimulatedCardFormComponent } from '../../components/simulated-card-form/simulated-card-form.component';

interface CardForm {
  cardholderName: FormControl<string>;
  testCardNumber: FormControl<string>;
  expiry: FormControl<string>;
  testCvv: FormControl<string>;
}

@Component({
  selector: 'app-payment-checkout-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    PaymentBookingSummaryComponent,
    PaymentMethodSelectorComponent,
    PaymentSecurityNoticeComponent,
    SimulatedCardFormComponent
  ],
  templateUrl: './payment-checkout-page.component.html',
  styleUrl: './payment-checkout-page.component.css'
})
export class PaymentCheckoutPageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly paymentService = inject(PaymentService);
  private readonly fb = inject(NonNullableFormBuilder);

  private sub?: Subscription;

  // Resolved booking ID from ?bookingId= query param
  readonly bookingId = signal<number | null>(null);

  // API state signals
  readonly isLoadingPaymentDue = signal<boolean>(false);
  readonly paymentDue = signal<BookingPaymentDue | null>(null);
  readonly loadError = signal<string | null>(null);

  readonly isSubmitting = signal<boolean>(false);
  readonly submissionError = signal<string | null>(null);
  readonly paymentResult = signal<PaymentResult | null>(null);

  // Selected payment method
  readonly selectedMethod = signal<PaymentMethod>(PaymentMethod.Card);

  // Computed — show card form only when Card method is selected
  readonly showCardForm = computed(() => this.selectedMethod() === PaymentMethod.Card);

  // Reactive form for card details
  readonly cardForm = this.fb.group<CardForm>({
    cardholderName: this.fb.control<string>('', {
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(100)]
    }),
    testCardNumber: this.fb.control<string>('', {
      validators: [
        Validators.required,
        Validators.pattern(/^[\d\s]{13,19}$/)
      ]
    }),
    expiry: this.fb.control<string>('', {
      validators: [
        Validators.required,
        Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)
      ]
    }),
    testCvv: this.fb.control<string>('', {
      validators: [Validators.required, Validators.pattern(/^\d{3}$/)]
    })
  });

  readonly PaymentMethod = PaymentMethod;

  constructor() {
    const idStr = this.route.snapshot.queryParamMap.get('bookingId');
    const id = idStr ? parseInt(idStr, 10) : null;

    if (!id || isNaN(id)) {
      this.loadError.set('No booking ID found. Please complete a booking first.');
      return;
    }

    this.bookingId.set(id);
    this.fetchPaymentDue(id);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  onMethodSelected(method: PaymentMethod): void {
    this.selectedMethod.set(method);
    // Clear card form errors when switching methods
    if (method !== PaymentMethod.Card) {
      this.cardForm.reset();
    }
  }

  onSubmitPayment(): void {
    if (this.isSubmitting()) return;

    const id = this.bookingId();
    if (!id) return;

    const due = this.paymentDue();
    if (!due || !due.canPay) {
      this.submissionError.set('This booking is not eligible for payment at this time.');
      return;
    }

    const method = this.selectedMethod();

    if (method === PaymentMethod.Card && this.cardForm.invalid) {
      this.cardForm.markAllAsTouched();
      return;
    }

    const request: ProcessPaymentRequest = { paymentMethod: method };

    if (method === PaymentMethod.Card) {
      const raw = this.cardForm.getRawValue();
      request.cardholderName = raw.cardholderName.trim();
      request.testCardNumber = raw.testCardNumber.replace(/\s+/g, '');
      request.expiry = raw.expiry.trim();
      request.testCvv = raw.testCvv.trim();
    }

    this.isSubmitting.set(true);
    this.submissionError.set(null);

    this.sub?.unsubscribe();
    this.sub = this.paymentService.processPayment(id, request).subscribe({
      next: (result) => {
        this.isSubmitting.set(false);
        this.paymentResult.set(result);
      },
      error: (err: unknown) => {
        this.isSubmitting.set(false);
        if (err instanceof HttpErrorResponse) {
          const msg =
            err.error?.message ||
            (typeof err.error === 'string' ? err.error : null) ||
            'Payment failed. Please check your details and try again.';
          this.submissionError.set(msg);
        } else {
          this.submissionError.set('An unexpected error occurred. Please try again.');
        }
      }
    });
  }

  onGoToDashboard(): void {
    this.router.navigate(['/customer-dashboard']);
  }

  formatCurrency(amount?: number | null, currency: string = 'LKR'): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `${currency} ${val.toLocaleString('en-US')}`;
  }

  private fetchPaymentDue(bookingId: number): void {
    this.isLoadingPaymentDue.set(true);
    this.loadError.set(null);

    this.sub?.unsubscribe();
    this.sub = this.paymentService.getBookingPayment(bookingId).subscribe({
      next: (due) => {
        this.isLoadingPaymentDue.set(false);
        this.paymentDue.set(due);
      },
      error: (err: unknown) => {
        this.isLoadingPaymentDue.set(false);
        if (err instanceof HttpErrorResponse && err.status === 404) {
          this.loadError.set('Booking payment information not found.');
        } else {
          this.loadError.set('Failed to load payment details. Please try again.');
        }
      }
    });
  }
}
