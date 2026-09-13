import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SeatAvailability } from '../../models/seats/seat-availability.model';
import { Seat } from '../../models/seats/seat.model';
import { SeatSection } from '../../models/seats/seat-section.model';
import { EventSeatCategory } from '../../models/seats/event-seat-category.model';
import { ReserveSeatsRequest } from '../../models/seats/reserve-seats-request.model';
import { CreateSeatRequest } from '../../models/seats/create-seat-request.model';
import { UpdateSeatRequest } from '../../models/seats/update-seat-request.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SeatService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // =========================================================================
  // CUSTOMER ENDPOINTS
  // =========================================================================

  /**
   * Retrieves current seat availability for a given event.
   * GET /api/events/{eventId}/seats
   */
  getEventSeats(eventId: number): Observable<SeatAvailability[]> {
    return this.http.get<SeatAvailability[]>(`${this.baseUrl}/events/${eventId}/seats`);
  }

  /**
   * Directly holds seats for a customer's pending booking.
   * POST /api/bookings/{bookingId}/seats
   */
  holdSeats(bookingId: number, request: ReserveSeatsRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/bookings/${bookingId}/seats`, request);
  }

  // =========================================================================
  // ADMIN ENDPOINTS (Consumed by Member 2 Admin Seat Management)
  // =========================================================================

  /**
   * Retrieves detailed seat information by ID.
   * GET /api/seats/{id}
   */
  getSeatById(id: number): Observable<Seat> {
    return this.http.get<Seat>(`${this.baseUrl}/seats/${id}`);
  }

  /**
   * Creates a new seat for an event.
   * POST /api/events/{eventId}/seats
   */
  createSeat(eventId: number, request: CreateSeatRequest): Observable<Seat> {
    return this.http.post<Seat>(`${this.baseUrl}/events/${eventId}/seats`, request);
  }

  /**
   * Updates an existing seat's configuration.
   * PUT /api/seats/{id}
   */
  updateSeat(id: number, request: UpdateSeatRequest): Observable<Seat> {
    return this.http.put<Seat>(`${this.baseUrl}/seats/${id}`, request);
  }

  /**
   * Deletes a seat by ID.
   * DELETE /api/seats/{id}
   */
  deleteSeat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/seats/${id}`);
  }

  /**
   * Retrieves seat categories defined for an event.
   * GET /api/events/{eventId}/seat-layout/categories
   */
  getEventSeatCategories(eventId: number): Observable<EventSeatCategory[]> {
    return this.http.get<EventSeatCategory[]>(`${this.baseUrl}/events/${eventId}/seat-layout/categories`);
  }

  /**
   * Retrieves seat sections defined for an event.
   * GET /api/events/{eventId}/seat-layout/sections
   */
  getEventSeatSections(eventId: number): Observable<SeatSection[]> {
    return this.http.get<SeatSection[]>(`${this.baseUrl}/events/${eventId}/seat-layout/sections`);
  }
}
