import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-account-security-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './account-security-card.component.html',
  styleUrl: './account-security-card.component.css'
})
export class AccountSecurityCardComponent {
  private readonly router = inject(Router);

  @Input() email: string | null = null;

  showMaskedPassword = true;

  togglePasswordVisibility(): void {
    this.showMaskedPassword = !this.showMaskedPassword;
  }

  onResetPassword(): void {
    if (this.email) {
      this.router.navigate(['/auth/forgot-password'], {
        queryParams: { email: this.email }
      });
    } else {
      this.router.navigate(['/auth/forgot-password']);
    }
  }
}
