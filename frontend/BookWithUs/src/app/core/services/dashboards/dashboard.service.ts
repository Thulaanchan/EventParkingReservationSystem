import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AdminDashboardSummary,
  UpcomingEvent,
  RecentBooking
} from '../../models/dashboards/admin-dashboard.model';

export interface AdminDashboardData {
  summary: AdminDashboardSummary;
  upcomingEvents: UpcomingEvent[];
  recentBookings: RecentBooking[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin/dashboard`;

  getSummary(): Observable<AdminDashboardSummary> {
    return this.http.get<AdminDashboardSummary>(`${this.baseUrl}/summary`);
  }

  getUpcomingEvents(): Observable<UpcomingEvent[]> {
    return this.http.get<UpcomingEvent[]>(`${this.baseUrl}/upcoming-events`);
  }

  getRecentBookings(): Observable<RecentBooking[]> {
    return this.http.get<RecentBooking[]>(`${this.baseUrl}/recent-bookings`);
  }

  getDashboardData(): Observable<AdminDashboardData> {
    return forkJoin({
      summary: this.getSummary(),
      upcomingEvents: this.getUpcomingEvents(),
      recentBookings: this.getRecentBookings()
    });
  }
}
