import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Booking,
  BookingConflictPayload,
  BookingDto,
  CancelBookingResponse,
  CancelBookingResponseDto,
  ParkingConflictError,
  SeatConflictError,
  isParkingConflictError,
  isSeatConflictError
} from '../../models/bookings/booking.model';
import { BookingSummary, BookingSummaryDto } from '../../models/bookings/booking-summary.model';
import { CreateBookingRequest } from '../../models/bookings/create-booking-request.model';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/bookings';

  /**
   * Creates a new booking with selected seats and optional parking reservation.
   * Endpoint: POST /api/bookings
   * Role: Customer only.
   * Note: customerId is deliberately NOT sent in the request body;
   * authenticated customer identity is extracted from the JWT token server-side.
   */
  createBooking(request: CreateBookingRequest): Observable<Booking> {
    return this.http.post<Booking>(this.baseUrl, request);
  }

  /**
   * Convenience alias for createBooking.
   */
  create(request: CreateBookingRequest): Observable<Booking> {
    return this.createBooking(request);
  }

  /**
   * Retrieves full booking details by ID.
   * Endpoint: GET /api/bookings/{id}
   * Role: Customer (own booking only) or Administrator.
   */
  getBookingById(id: number): Observable<Booking> {
    return this.http.get<Booking>(`${this.baseUrl}/${id}`);
  }

  /**
   * Convenience alias for getBookingById.
   */
  getById(id: number): Observable<Booking> {
    return this.getBookingById(id);
  }

  /**
   * Retrieves booking history for a specific customer.
   * Endpoint: GET /api/bookings/customer/{customerId}
   * Role: Customer (own bookings only) or Administrator.
   */
  getCustomerBookings(customerId: number): Observable<BookingSummary[]> {
    return this.http.get<BookingSummary[]>(`${this.baseUrl}/customer/${customerId}`);
  }

  /**
   * Retrieves all bookings for a specific event.
   * Endpoint: GET /api/bookings?eventId={eventId}
   * Role: Administrator only.
   * Note: The backend strictly requires a valid eventId query parameter;
   * there is no parameterless global admin bookings endpoint.
   */
  getEventBookings(eventId: number): Observable<BookingSummary[]> {
    const params = new HttpParams().set('eventId', eventId.toString());
    return this.http.get<BookingSummary[]>(this.baseUrl, { params });
  }

  /**
   * Cancels a booking owned by the authenticated customer.
   * Endpoint: DELETE /api/bookings/{id}
   * Role: Customer only.
   * Returns CancelBookingResponseDto contract directly from backend.
   */
  cancelBooking(id: number): Observable<CancelBookingResponse> {
    return this.http.delete<CancelBookingResponse>(`${this.baseUrl}/${id}`);
  }

  /**
   * Convenience alias for cancelBooking.
   */
  cancel(id: number): Observable<CancelBookingResponse> {
    return this.cancelBooking(id);
  }

  /**
   * Exposes typed conflict details from 409 HTTP error responses without rewriting M3 logic.
   */
  parseConflictError(error: unknown): BookingConflictPayload | null {
    if (error instanceof HttpErrorResponse && error.status === 409) {
      if (error.error && typeof error.error === 'object') {
        return error.error as BookingConflictPayload;
      }
    }
    return null;
  }

  /**
   * Helper to check if a conflict payload is a seat conflict.
   */
  isSeatConflict(payload: unknown): payload is SeatConflictError {
    return isSeatConflictError(payload);
  }

  /**
   * Helper to check if a conflict payload is a parking conflict.
   */
  isParkingConflict(payload: unknown): payload is ParkingConflictError {
    return isParkingConflictError(payload);
  }
}
