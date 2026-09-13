import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Customer } from '../../../../core/models/customers/customer.model';

@Component({
  selector: 'app-profile-summary-card',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './profile-summary-card.component.html',
  styleUrl: './profile-summary-card.component.css'
})
export class ProfileSummaryCardComponent {
  @Input() customer: Customer | null = null;
  @Input() isLoading = false;

  get initials(): string {
    if (!this.customer) {
      return '';
    }
    const first = this.customer.firstName?.trim().charAt(0) || '';
    const last = this.customer.lastName?.trim().charAt(0) || '';
    return (first + last).toUpperCase() || 'U';
  }

  get fullName(): string {
    if (!this.customer) {
      return '';
    }
    return `${this.customer.firstName} ${this.customer.lastName}`.trim() || 'Customer';
  }
}
