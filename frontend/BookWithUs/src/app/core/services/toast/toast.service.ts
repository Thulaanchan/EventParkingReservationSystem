import { Injectable, signal } from '@angular/core';
import { Toast, ToastType } from '../../models/common/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 1;
  private readonly defaultDuration = 3000;

  showSuccess(message: string, duration = this.defaultDuration): void {
    this.addToast(ToastType.Success, message, duration);
  }

  showError(message: string, duration = this.defaultDuration): void {
    this.addToast(ToastType.Error, message, duration);
  }

  showWarning(message: string, duration = this.defaultDuration): void {
    this.addToast(ToastType.Warning, message, duration);
  }

  showInfo(message: string, duration = this.defaultDuration): void {
    this.addToast(ToastType.Info, message, duration);
  }

  remove(id: number): void {
    this.toasts.update((current) => current.filter((toast) => toast.id !== id));
  }

  private addToast(type: ToastType, message: string, duration: number): void {
    const id = this.nextId++;
    const newToast: Toast = {
      id,
      type,
      message,
      duration
    };

    this.toasts.update((current) => [...current, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }
}
