import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Customer contact information contract passed from the parent checkout component.
 */
export interface CheckoutContactSummaryData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  isEmailVerified?: boolean;
}

@Component({
  selector: 'app-checkout-contact-summary',
  standalone: true,
  imports: [],
  templateUrl: './checkout-contact-summary.component.html',
  styleUrl: './checkout-contact-summary.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutContactSummaryComponent {
  /**
   * Customer contact details provided by parent.
   */
  @Input() contact: CheckoutContactSummaryData | null = null;

  /**
   * Optional event emitted if parent allows editing contact details.
   */
  @Output() readonly editRequested = new EventEmitter<void>();

  /**
   * Returns customer's combined full name.
   */
  get fullName(): string {
    if (!this.contact) {
      return '';
    }
    const name = `${this.contact.firstName || ''} ${this.contact.lastName || ''}`.trim();
    return name || 'Customer';
  }

  /**
   * Returns initials for avatar display.
   */
  get initials(): string {
    if (!this.contact) {
      return 'U';
    }
    const first = (this.contact.firstName || '').trim().charAt(0).toUpperCase();
    const last = (this.contact.lastName || '').trim().charAt(0).toUpperCase();
    return `${first}${last}`.trim() || 'U';
  }
}
