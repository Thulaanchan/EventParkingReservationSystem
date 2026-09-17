import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingIndicatorComponent } from './shared/components/loading-indicator/loading-indicator.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { InactivityService } from './core/services/auth/inactivity.service';
import { ThemeService } from './core/services/theme/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    LoadingIndicatorComponent,
    ToastContainerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  private readonly inactivityService = inject(InactivityService);
  private readonly themeService = inject(ThemeService);
}
