import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ToastService } from '../../../core/services/toast/toast.service';
import { ToastType } from '../../../core/models/common/toast.model';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.css'
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);
  readonly ToastType = ToastType;
}
