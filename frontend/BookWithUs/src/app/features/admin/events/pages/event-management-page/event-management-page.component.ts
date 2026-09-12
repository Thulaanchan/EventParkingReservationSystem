import {
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  catchError,
  debounceTime,
  forkJoin,
  of,
  switchMap
} from 'rxjs';

import { AdminEventFilterComponent } from '../../components/admin-event-filter/admin-event-filter.component';
import { EventAdminStatsComponent } from '../../components/event-admin-stats/event-admin-stats.component';
import { AdminEventTableComponent } from '../../components/admin-event-table/admin-event-table.component';
import { AdminEventDetailPanelComponent } from '../../components/admin-event-detail-panel/admin-event-detail-panel.component';

import { EventService } from '../../../../../core/services/events/event.service';
import { VenueService } from '../../../../../core/services/venues/venue.service';
import { CategoryService } from '../../../../../core/services/categories/category.service';
import { DashboardService } from '../../../../../core/services/dashboards/dashboard.service';

import { EventSummary } from '../../../../../core/models/events/event-summary.model';
import { EventDetails } from '../../../../../core/models/events/event-details.model';
import { EventFilter } from '../../../../../core/models/events/event-filter.model';
import { PagedResult } from '../../../../../core/models/common/paged-result.model';
import { Venue } from '../../../../../core/models/venues/venue.model';
import { EventCategory } from '../../../../../core/models/categories/event-category.model';

@Component({
  selector: 'app-event-management-page',
  standalone: true,
  imports: [
    CommonModule,
    EventAdminStatsComponent,
    AdminEventFilterComponent,
    AdminEventTableComponent,
    AdminEventDetailPanelComponent
  ],
  templateUrl: './event-management-page.component.html',
  styleUrl: './event-management-page.component.css'
})
export class EventManagementPageComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly venueService = inject(VenueService);
  private readonly categoryService = inject(CategoryService);
  private readonly dashboardService = inject(DashboardService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly filterSubject = new Subject<EventFilter>();

  // Real statistics
  totalEvents = 0;
  upcomingEvents = 0;
  totalBookings = 0;

  // Filter options state
  venues: Venue[] = [];
  categories: EventCategory[] = [];
  loadingOptions = false;
  optionsError: string | null = null;

  // Table and server-side pagination state
  events: EventSummary[] = [];
  currentFilter: EventFilter = { includePast: true };
  page = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Page lifecycle states
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  // Detail panel drawer state
  selectedEventDetails: EventDetails | null = null;
  detailLoading = false;
  detailError: string | null = null;

  // Delete confirmation state
  eventToDelete: EventSummary | EventDetails | null = null;
  showDeleteConfirm = false;
  deleting = false;
  deleteErrorMessage: string | null = null;

  ngOnInit(): void {
    this.loadStats();
    this.loadFilterOptions();
    this.setupFilterDebounce();
    this.setupRouteListener();
  }

  /**
   * Loads real backend statistics:
   * 1. Total Events: DashboardService.getSummary().totalEvents
   * 2. Total Bookings: DashboardService.getSummary().totalBookings
   * 3. Upcoming Events: EventService.getEvents({ includePast: false, page: 1, pageSize: 1 }).totalCount
   */
  loadStats(): void {
    forkJoin({
      summary: this.dashboardService.getSummary().pipe(
        catchError(() => of(null))
      ),
      upcoming: this.eventService
        .getEvents({ includePast: false, page: 1, pageSize: 1 })
        .pipe(catchError(() => of(null)))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ summary, upcoming }) => {
        if (summary) {
          this.totalEvents = summary.totalEvents ?? 0;
          this.totalBookings = summary.totalBookings ?? 0;
        }
        if (upcoming) {
          this.upcomingEvents = upcoming.totalCount ?? 0;
        }
      });
  }

  /**
   * Loads real venue and category filter options.
   * Handles failure gracefully with a non-blocking informational note.
   */
  loadFilterOptions(): void {
    this.loadingOptions = true;
    this.optionsError = null;

    let venuesFailed = false;
    let categoriesFailed = false;

    forkJoin({
      venues: this.venueService.getVenues().pipe(
        catchError(() => {
          venuesFailed = true;
          return of([] as Venue[]);
        })
      ),
      categories: this.categoryService.getCategories().pipe(
        catchError(() => {
          categoriesFailed = true;
          return of([] as EventCategory[]);
        })
      )
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ venues, categories }) => {
          this.loadingOptions = false;
          this.venues = venues;
          this.categories = categories;

          if (venuesFailed && categoriesFailed) {
            this.optionsError =
              'Unable to load venue and category filter options. You can still search by name or date.';
          } else if (venuesFailed) {
            this.optionsError =
              'Unable to load venue filter options. You can still search by category, name, or date.';
          } else if (categoriesFailed) {
            this.optionsError =
              'Unable to load category filter options. You can still search by venue, name, or date.';
          }
        }
      });
  }

  /**
   * Sets up debounced filter changes to avoid excessive router navigations.
   */
  private setupFilterDebounce(): void {
    this.filterSubject
      .pipe(
        debounceTime(300),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((filter) => {
        const queryParams = this.buildQueryParams(filter);
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams
        });
      });
  }

  /**
   * Listens to URL query param changes and drives data loading via switchMap.
   * Avoids duplicate direct calls.
   */
  private setupRouteListener(): void {
    this.route.queryParamMap
      .pipe(
        switchMap((params: ParamMap) => {
          const filter = this.parseQueryParams(params);
          this.currentFilter = filter;
          this.page = filter.page ?? 1;
          this.pageSize = filter.pageSize ?? 10;

          this.loading = true;
          this.errorMessage = null;

          return this.eventService.getEvents(filter).pipe(
            catchError((err: unknown) => {
              this.loading = false;
              this.handleLoadError(err);
              return of(null);
            })
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res: PagedResult<EventSummary> | null) => {
        this.loading = false;
        if (res) {
          this.events = res.items;
          this.page = res.page;
          this.pageSize = res.pageSize;
          this.totalCount = res.totalCount;
          this.totalPages = res.totalPages;

          // If current page is beyond total pages and we have items, redirect to last page
          if (this.events.length === 0 && this.totalCount > 0 && this.page > 1) {
            this.goToPage(Math.max(1, this.totalPages));
          }
        } else {
          this.events = [];
        }
      });
  }

  onFilterChange(filter: EventFilter): void {
    this.filterSubject.next(filter);
  }

  onClearFilters(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  goToPage(targetPage: number): void {
    if (
      targetPage < 1 ||
      targetPage > this.totalPages ||
      targetPage === this.page
    ) {
      return;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page: targetPage },
      queryParamsHandling: 'merge'
    });
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.goToPage(this.page + 1);
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.goToPage(this.page - 1);
    }
  }

  get paginationStart(): number {
    if (this.totalCount === 0) {
      return 0;
    }
    return (this.page - 1) * this.pageSize + 1;
  }

  get paginationEnd(): number {
    return Math.min(this.page * this.pageSize, this.totalCount);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxButtons = 5;
    let start = Math.max(1, this.page - Math.floor(maxButtons / 2));
    let end = Math.min(this.totalPages, start + maxButtons - 1);

    if (end - start + 1 < maxButtons) {
      start = Math.max(1, end - maxButtons + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  reloadEvents(): void {
    this.loading = true;
    this.errorMessage = null;

    this.eventService.getEvents(this.currentFilter).subscribe({
      next: (res: PagedResult<EventSummary>) => {
        this.loading = false;
        this.events = res.items;
        this.page = res.page;
        this.pageSize = res.pageSize;
        this.totalCount = res.totalCount;
        this.totalPages = res.totalPages;
      },
      error: (err: unknown) => {
        this.loading = false;
        this.handleLoadError(err);
      }
    });
  }

  // Navigation handlers
  onCreateEvent(): void {
    this.router.navigate(['/admin/events/new']);
  }

  onEditEvent(event: EventSummary | EventDetails): void {
    this.router.navigate(['/admin/events', event.id, 'edit']);
  }

  onManageSeats(event: EventSummary | EventDetails): void {
    this.router.navigate(['/admin/events', event.id, 'seats']);
  }

  onManageParking(event: EventSummary | EventDetails): void {
    this.router.navigate(['/admin/events', event.id, 'parking']);
  }

  // View / Detail Panel flow
  onViewEvent(event: EventSummary): void {
    this.detailLoading = true;
    this.detailError = null;

    this.eventService.getEvent(event.id).subscribe({
      next: (details: EventDetails) => {
        this.detailLoading = false;
        this.selectedEventDetails = details;
      },
      error: (err: unknown) => {
        this.detailLoading = false;
        if (err instanceof HttpErrorResponse) {
          if (err.status === 404) {
            this.detailError =
              'Event details not found. The event may have already been removed.';
          } else if (err.status >= 500 || err.status === 0) {
            this.detailError =
              'Unable to load event details due to a server or connection issue. Please try again.';
          } else {
            this.detailError = 'Failed to load event details.';
          }
        } else {
          this.detailError = 'Failed to load event details.';
        }
      }
    });
  }

  onCloseDetail(): void {
    this.selectedEventDetails = null;
    this.detailError = null;
  }

  // Delete Confirmation flow
  onPromptDelete(event: EventSummary | EventDetails): void {
    if (!event.canDelete) {
      return;
    }
    this.eventToDelete = event;
    this.deleteErrorMessage = null;
    this.showDeleteConfirm = true;
  }

  onCancelDelete(): void {
    if (this.deleting) {
      return;
    }
    this.showDeleteConfirm = false;
    this.eventToDelete = null;
    this.deleteErrorMessage = null;
  }

  onConfirmDelete(): void {
    if (!this.eventToDelete || this.deleting) {
      return;
    }

    const event = this.eventToDelete;
    this.deleting = true;
    this.deleteErrorMessage = null;

    this.eventService.deleteEvent(event.id).subscribe({
      next: () => {
        this.deleting = false;
        this.showDeleteConfirm = false;
        this.eventToDelete = null;

        // Close detail panel if same event
        if (this.selectedEventDetails?.id === event.id) {
          this.selectedEventDetails = null;
        }

        // Show brief success notice
        this.successMessage = `Event "${event.name}" was successfully deleted.`;
        setTimeout(() => {
          if (this.successMessage?.includes(event.name)) {
            this.successMessage = null;
          }
        }, 5000);

        // Refresh table & stats
        this.reloadEvents();
        this.loadStats();
      },
      error: (err: unknown) => {
        this.deleting = false;
        if (err instanceof HttpErrorResponse) {
          if (err.status === 409) {
            this.deleteErrorMessage =
              'This event cannot be deleted because active bookings now prevent deletion.';
          } else if (err.status === 404) {
            this.deleteErrorMessage =
              'Event not found. It may have already been deleted.';
            this.reloadEvents();
            this.loadStats();
          } else if (err.status >= 500 || err.status === 0) {
            this.deleteErrorMessage =
              'Server or network error occurred while deleting the event. Please try again.';
          } else if (err.error?.detail && typeof err.error.detail === 'string') {
            this.deleteErrorMessage = err.error.detail;
          } else if (err.error?.message && typeof err.error.message === 'string') {
            this.deleteErrorMessage = err.error.message;
          } else {
            this.deleteErrorMessage = 'Failed to delete event. Please try again.';
          }
        } else {
          this.deleteErrorMessage = 'Failed to delete event. Please try again.';
        }
      }
    });
  }

  private parseQueryParams(params: ParamMap): EventFilter {
    const filter: EventFilter = {
      includePast: true
    };

    const search = params.get('search');
    if (search && search.trim()) {
      filter.search = search.trim();
    }

    const venue = params.get('venue');
    if (venue) {
      const venueId = Number(venue);
      if (!isNaN(venueId) && venueId > 0) {
        filter.venue = venueId;
      }
    }

    const category = params.get('category');
    if (category) {
      const categoryId = Number(category);
      if (!isNaN(categoryId) && categoryId > 0) {
        filter.category = categoryId;
      }
    }

    const date = params.get('date');
    if (date && date.trim()) {
      filter.date = date.trim();
    }

    const page = params.get('page');
    if (page) {
      const pageNum = Number(page);
      filter.page = !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    } else {
      filter.page = 1;
    }

    const pageSize = params.get('pageSize');
    if (pageSize) {
      const size = Number(pageSize);
      filter.pageSize = !isNaN(size) && size > 0 ? size : 10;
    } else {
      filter.pageSize = 10;
    }

    return filter;
  }

  private buildQueryParams(filter: EventFilter): Record<string, string | number> {
    const queryParams: Record<string, string | number> = {};

    if (filter.search && filter.search.trim()) {
      queryParams['search'] = filter.search.trim();
    }
    if (filter.venue !== undefined && filter.venue !== null) {
      queryParams['venue'] = filter.venue;
    }
    if (filter.category !== undefined && filter.category !== null) {
      queryParams['category'] = filter.category;
    }
    if (filter.date && filter.date.trim()) {
      queryParams['date'] = filter.date.trim();
    }

    queryParams['page'] = 1;

    if (this.pageSize && this.pageSize !== 10) {
      queryParams['pageSize'] = this.pageSize;
    }

    return queryParams;
  }

  private handleLoadError(err: unknown): void {
    if (err instanceof HttpErrorResponse) {
      if (err.status >= 500 || err.status === 0) {
        this.errorMessage =
          'Unable to connect to the events server. Please check your connection and try again.';
      } else if (err.error?.detail && typeof err.error.detail === 'string') {
        this.errorMessage = err.error.detail;
      } else if (err.error?.message && typeof err.error.message === 'string') {
        this.errorMessage = err.error.message;
      } else {
        this.errorMessage = 'Failed to load events. Please try again later.';
      }
    } else {
      this.errorMessage = 'Failed to load events. Please try again later.';
    }
  }
}
