import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { VenueService } from '../../../../../core/services/venues/venue.service';
import { Venue } from '../../../../../core/models/venues/venue.model';
import {
  CapacityFilterOption,
  VenueFilterComponent
} from '../../components/venue-filter/venue-filter.component';
import { VenueStatsComponent } from '../../components/venue-stats/venue-stats.component';
import { VenueTableComponent } from '../../components/venue-table/venue-table.component';
import { VenueDetailPanelComponent } from '../../components/venue-detail-panel/venue-detail-panel.component';

@Component({
  selector: 'app-venue-management-page',
  standalone: true,
  imports: [
    CommonModule,
    VenueStatsComponent,
    VenueFilterComponent,
    VenueTableComponent,
    VenueDetailPanelComponent
  ],
  templateUrl: './venue-management-page.component.html',
  styleUrl: './venue-management-page.component.css'
})
export class VenueManagementPageComponent implements OnInit {
  private readonly venueService = inject(VenueService);
  private readonly router = inject(Router);

  // Raw data from backend
  venues: Venue[] = [];

  // Filtered venues displayed in table
  filteredVenues: Venue[] = [];

  // Component states
  loading = false;
  errorMessage: string | null = null;
  searchTerm = '';
  capacityFilter = '';

  // Detail panel state
  selectedVenue: Venue | null = null;
  deleting = false;
  deleteError: string | null = null;

  // Stats computed getters
  get totalVenues(): number {
    return this.venues.length;
  }

  get upcomingEvents(): number {
    return this.venues.reduce((sum, v) => sum + (v.upcomingEventCount || 0), 0);
  }

  get totalCapacity(): number {
    return this.venues.reduce((sum, v) => sum + (v.totalCapacity || 0), 0);
  }

  // Capacity filter options derived strictly from real loaded totalCapacity values
  get capacityOptions(): CapacityFilterOption[] {
    const unique = Array.from(
      new Set(this.venues.map(v => v.totalCapacity))
    ).sort((a, b) => a - b);

    return unique.map(cap => ({
      value: cap.toString(),
      label: `${cap.toLocaleString()} seats`
    }));
  }

  ngOnInit(): void {
    this.loadVenues();
  }

  loadVenues(): void {
    this.loading = true;
    this.errorMessage = null;

    this.venueService.getVenues().subscribe({
      next: (data: Venue[]) => {
        this.venues = data;
        this.applyFilter();
        this.loading = false;

        // If a venue was selected, refresh its reference with latest data
        if (this.selectedVenue) {
          const updated = this.venues.find(v => v.id === this.selectedVenue!.id);
          this.selectedVenue = updated ?? null;
        }
      },
      error: (err: unknown) => {
        this.loading = false;
        if (err instanceof HttpErrorResponse) {
          if (err.status >= 500 || err.status === 0) {
            this.errorMessage =
              'Unable to connect to the server. Please check your network connection and try again.';
          } else if (err.error?.detail && typeof err.error.detail === 'string') {
            this.errorMessage = err.error.detail;
          } else if (err.error?.message && typeof err.error.message === 'string') {
            this.errorMessage = err.error.message;
          } else {
            this.errorMessage = 'Failed to load venues. Please try again later.';
          }
        } else {
          this.errorMessage = 'Failed to load venues. Please try again later.';
        }
      }
    });
  }

  onSearchChange(term: string): void {
    this.searchTerm = term;
    this.applyFilter();
  }

  onCapacityChange(capacity: string): void {
    this.capacityFilter = capacity;
    this.applyFilter();
  }

  onClearFilters(): void {
    this.searchTerm = '';
    this.capacityFilter = '';
    this.applyFilter();
  }

  private applyFilter(): void {
    const trimmed = this.searchTerm.trim().toLowerCase();

    this.filteredVenues = this.venues.filter(venue => {
      const matchesSearch =
        !trimmed ||
        venue.name.toLowerCase().includes(trimmed) ||
        venue.address.toLowerCase().includes(trimmed);

      const matchesCapacity =
        !this.capacityFilter ||
        venue.totalCapacity.toString() === this.capacityFilter;

      return matchesSearch && matchesCapacity;
    });
  }

  onViewVenue(venue: Venue): void {
    this.selectedVenue = venue;
    this.deleteError = null;
  }

  onCloseDetail(): void {
    this.selectedVenue = null;
    this.deleteError = null;
  }

  onAddVenue(): void {
    this.router.navigate(['/admin/venues/new']);
  }

  onEditVenue(venue: Venue): void {
    this.router.navigate(['/admin/venues', venue.id, 'edit']);
  }

  onDeleteVenue(venue: Venue): void {
    if (venue.upcomingEventCount > 0) {
      this.deleteError =
        'This venue has upcoming events and cannot be deleted.';
      return;
    }

    if (this.deleting) {
      return;
    }

    this.deleting = true;
    this.deleteError = null;

    this.venueService.deleteVenue(venue.id).subscribe({
      next: () => {
        this.deleting = false;
        if (this.selectedVenue?.id === venue.id) {
          this.selectedVenue = null;
        }
        this.venues = this.venues.filter(v => v.id !== venue.id);
        this.applyFilter();
      },
      error: (err: unknown) => {
        this.deleting = false;
        if (err instanceof HttpErrorResponse) {
          if (err.status === 409) {
            this.deleteError =
              'This venue cannot be deleted because upcoming events are scheduled here.';
          } else if (err.status === 404) {
            this.deleteError = 'Venue not found. It may have already been deleted.';
            this.loadVenues();
          } else if (err.status >= 500 || err.status === 0) {
            this.deleteError =
              'Server or network error occurred while deleting the venue. Please try again.';
          } else if (err.error?.detail && typeof err.error.detail === 'string') {
            this.deleteError = err.error.detail;
          } else if (err.error?.message && typeof err.error.message === 'string') {
            this.deleteError = err.error.message;
          } else {
            this.deleteError = 'Failed to delete venue. Please try again.';
          }
        } else {
          this.deleteError = 'Failed to delete venue. Please try again.';
        }
      }
    });
  }
}
