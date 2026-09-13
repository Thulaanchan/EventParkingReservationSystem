import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod } from '../../../../core/models/payments/payment-method.model';

export interface PaymentMethodCard {
  id: PaymentMethod;
  name: string;
  description: string;
  iconType: 'card' | 'wallet' | 'bank' | 'qr';
}

@Component({
  selector: 'app-payment-method-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-method-selector.component.html',
  styleUrl: './payment-method-selector.component.css'
})
export class PaymentMethodSelectorComponent {
  @Input() selectedMethod: PaymentMethod | null = null;
  @Output() methodSelected = new EventEmitter<PaymentMethod>();

  readonly PaymentMethod = PaymentMethod;

  readonly methods: PaymentMethodCard[] = [
    {
      id: PaymentMethod.Card,
      name: 'Credit/Debit Card',
      description: 'Visa, Master card, Amex',
      iconType: 'card'
    },
    {
      id: PaymentMethod.MobileWallet,
      name: 'Mobile Wallet',
      description: 'eZ Cash, mCash',
      iconType: 'wallet'
    },
    {
      id: PaymentMethod.NetBanking,
      name: 'Net Banking',
      description: 'All major banks',
      iconType: 'bank'
    },
    {
      id: PaymentMethod.LankaQr,
      name: 'LankaQR',
      description: 'QR Payment',
      iconType: 'qr'
    }
  ];

  select(method: PaymentMethod): void {
    this.methodSelected.emit(method);
  }
}
