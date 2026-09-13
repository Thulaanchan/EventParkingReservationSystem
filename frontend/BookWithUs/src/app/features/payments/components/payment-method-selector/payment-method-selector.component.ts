import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PaymentMethod } from '../../../../core/models/payments/payment-method.model';

export interface PaymentMethodOption {
  id: PaymentMethod;
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
}

@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [],
  templateUrl: './payment-method-selector.component.html',
  styleUrl: './payment-method-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentMethodSelectorComponent {
  @Input() selectedMethod: PaymentMethod = PaymentMethod.Card;
  @Output() readonly methodSelected = new EventEmitter<PaymentMethod>();

  readonly methods: PaymentMethodOption[] = [
    {
      id: PaymentMethod.Card,
      title: 'Credit / Debit Card',
      subtitle: 'Visa, Mastercard, AMEX',
      icon: 'card',
      badge: 'Popular'
    },
    {
      id: PaymentMethod.LankaQr,
      title: 'LankaQR',
      subtitle: 'Instant QR payment via banking app',
      icon: 'qr'
    },
    {
      id: PaymentMethod.MobileWallet,
      title: 'Mobile Wallet',
      subtitle: 'Genie, FriMi, eZ Cash, mcash',
      icon: 'wallet'
    },
    {
      id: PaymentMethod.NetBanking,
      title: 'Internet Banking',
      subtitle: 'Direct online bank transfer',
      icon: 'bank'
    }
  ];

  select(method: PaymentMethod): void {
    this.selectedMethod = method;
    this.methodSelected.emit(method);
  }
}
