import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-payment-security-notice',
  standalone: true,
  imports: [],
  templateUrl: './payment-security-notice.component.html',
  styleUrl: './payment-security-notice.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaymentSecurityNoticeComponent {}
