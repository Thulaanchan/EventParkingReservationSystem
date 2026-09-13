import { BookingStatus } from './booking-status.model';

/**
 * Filter criteria for filtering and sorting bookings on My Bookings and Admin Event Bookings screens.
 */
export interface BookingFilter {
  status?: BookingStatus | 'All';
  searchTerm?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: 'createdAt' | 'eventDate' | 'totalAmount';
  sortDirection?: 'asc' | 'desc';
}
