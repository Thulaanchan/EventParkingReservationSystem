import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { BookingPaymentDue } from '../../../../core/models/payments/payment-due.model';

@Component({
  selector: 'app-payment-booking-summary',
  standalone: true,
  imports: [],
  templateUrl: './payment-booking-summary.component.html',
  styleUrl: './payment-booking-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentBookingSummaryComponent {
  @Input() paymentDue: BookingPaymentDue | null = null;

  formatCurrency(amount?: number | null, currency: string = 'LKR'): string {
    const val = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    return `${currency} ${val.toLocaleString('en-US')}`;
  }
}
