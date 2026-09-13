import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ParkingAvailability } from '../../models/parking/parking-availability.model';
import { ParkingZone } from '../../models/parking/parking-zone.model';
import { ParkingSlot } from '../../models/parking/parking-slot.model';
import { ReserveParkingRequest } from '../../models/parking/reserve-parking-request.model';
import { CreateParkingSlotRequest } from '../../models/parking/create-parking-slot-request.model';
import { UpdateParkingSlotRequest } from '../../models/parking/update-parking-slot-request.model';
import { CreateParkingZoneRequest } from '../../models/parking/create-parking-zone-request.model';
import { UpdateParkingZoneRequest } from '../../models/parking/update-parking-zone-request.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ParkingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // =========================================================================
  // CUSTOMER ENDPOINTS (Public / Customer-Safe)
  // =========================================================================

  /**
   * Retrieves current parking availability for a given event.
   * [AllowAnonymous]
   * GET /api/events/{eventId}/parking-slots
   */
  getEventParkingSlots(eventId: number): Observable<ParkingAvailability[]> {
    return this.http.get<ParkingAvailability[]>(`${this.baseUrl}/events/${eventId}/parking-slots`);
  }

  /**
   * Retrieves parking zones and fees configured for a given event.
   * [AllowAnonymous]
   * GET /api/events/{eventId}/parking-zones
   */
  getEventParkingZones(eventId: number): Observable<ParkingZone[]> {
    return this.http.get<ParkingZone[]>(`${this.baseUrl}/events/${eventId}/parking-zones`);
  }

  /**
   * Reserves a parking slot for a customer's pending booking.
   * [Authorize(Roles = "Customer")]
   * POST /api/bookings/{bookingId}/parking
   * On 409 conflict, propagates Angular HttpErrorResponse normally.
   */
  reserveParking(bookingId: number, request: ReserveParkingRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/bookings/${bookingId}/parking`, request);
  }

  /**
   * Removes a previously reserved parking slot from a customer's pending booking.
   * [Authorize(Roles = "Customer")]
   * DELETE /api/bookings/{bookingId}/parking
   */
  removeParking(bookingId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/bookings/${bookingId}/parking`);
  }

  // =========================================================================
  // ADMIN ENDPOINTS (Consumed by Member 2 Admin Parking Management)
  // =========================================================================

  /**
   * Retrieves detailed parking slot information by ID.
   * [Authorize(Roles = "Administrator")]
   * GET /api/parking-slots/{id}
   */
  getParkingSlotById(id: number): Observable<ParkingSlot> {
    return this.http.get<ParkingSlot>(`${this.baseUrl}/parking-slots/${id}`);
  }

  /**
   * Creates a new parking slot for an event.
   * [Authorize(Roles = "Administrator")]
   * POST /api/events/{eventId}/parking-slots
   */
  createParkingSlot(eventId: number, request: CreateParkingSlotRequest): Observable<ParkingSlot> {
    return this.http.post<ParkingSlot>(`${this.baseUrl}/events/${eventId}/parking-slots`, request);
  }

  /**
   * Updates an existing parking slot's configuration.
   * [Authorize(Roles = "Administrator")]
   * PUT /api/parking-slots/{id}
   */
  updateParkingSlot(id: number, request: UpdateParkingSlotRequest): Observable<ParkingSlot> {
    return this.http.put<ParkingSlot>(`${this.baseUrl}/parking-slots/${id}`, request);
  }

  /**
   * Deletes a parking slot by ID.
   * [Authorize(Roles = "Administrator")]
   * DELETE /api/parking-slots/{id}
   */
  deleteParkingSlot(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/parking-slots/${id}`);
  }

  /**
   * Creates a new parking zone for an event.
   * [Authorize(Roles = "Administrator")]
   * POST /api/events/{eventId}/parking-zones
   */
  createParkingZone(eventId: number, request: CreateParkingZoneRequest): Observable<ParkingZone> {
    return this.http.post<ParkingZone>(`${this.baseUrl}/events/${eventId}/parking-zones`, request);
  }

  /**
   * Updates an existing parking zone's configuration.
   * [Authorize(Roles = "Administrator")]
   * PUT /api/parking-zones/{id}
   */
  updateParkingZone(id: number, request: UpdateParkingZoneRequest): Observable<ParkingZone> {
    return this.http.put<ParkingZone>(`${this.baseUrl}/parking-zones/${id}`, request);
  }
}
