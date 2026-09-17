import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-welcome-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './welcome-banner.component.html',
  styleUrl: './welcome-banner.component.css'
})
export class WelcomeBannerComponent {
  @Input() displayName: string | null = null;

  get greetingName(): string {
    if (!this.displayName) {
      return 'Leo';
    }
    const trimmed = this.displayName.trim();
    const firstWord = trimmed.split(/\s+/)[0];
    return firstWord ? (firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase()) : 'Leo';
  }
}
