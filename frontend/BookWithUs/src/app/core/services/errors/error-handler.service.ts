import { Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ApiError } from '../../models/errors/api-error.model';
import { ToastService } from '../toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private readonly toastService = inject(ToastService);

  handleError(error: HttpErrorResponse): ApiError {
    const status = error.status;
    const message = this.getUserFriendlyMessage(error);

    this.toastService.showError(message);

    return {
      status,
      message,
      timestamp: new Date().toISOString()
    };
  }

  getUserFriendlyMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 401:
        return 'Your session has expired';
      case 403:
        return 'You do not have permission';
      case 404:
        return 'Requested resource was not found';
      case 500:
        return 'Server error. Please try again later';
      default:
        if (
          error.error &&
          typeof error.error === 'object' &&
          typeof error.error.message === 'string' &&
          error.error.message.trim().length > 0
        ) {
          return error.error.message;
        }

        if (
          typeof error.error === 'string' &&
          error.error.trim().length > 0
        ) {
          return error.error;
        }

        return error.message || 'An unexpected error occurred';
    }
  }
}
