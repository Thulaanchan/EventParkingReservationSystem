import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthSessionService } from '../../../core/services/auth/auth-session.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.css'
})
export class AdminShellComponent {
  private readonly authSessionService = inject(AuthSessionService);
  private readonly router = inject(Router);

  isSidebarCollapsed = false;

  get adminName(): string {
    const user = this.authSessionService.getCurrentUser();
    return user?.displayName || 'Alex Morgan';
  }

  get adminInitials(): string {
    const user = this.authSessionService.getCurrentUser();
    if (user?.displayName) {
      const parts = user.displayName.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return user.displayName.substring(0, 2).toUpperCase();
    }
    return 'AD';
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  onLogout(): void {
    this.authSessionService.clearSession();
    this.router.navigate(['/auth/login']);
  }
}
