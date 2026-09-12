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
import { EventService } from '../../../../core/services/events/event.service';
import { VenueService } from '../../../../core/services/venues/venue.service';
import { CategoryService } from '../../../../core/services/categories/category.service';
import { EventSummary } from '../../../../core/models/events/event-summary.model';
import { EventFilter } from '../../../../core/models/events/event-filter.model';
import { PagedResult } from '../../../../core/models/common/paged-result.model';
import { Venue } from '../../../../core/models/venues/venue.model';
import { EventCategory } from '../../../../core/models/categories/event-category.model';
import { EventFilterComponent } from '../../components/event-filter/event-filter.component';
import { EventCardListComponent } from '../../components/event-card-list/event-card-list.component';

@Component({
  selector: 'app-event-list-page',
  standalone: true,
  imports: [
    CommonModule,
    EventFilterComponent,
    EventCardListComponent
  ],
  templateUrl: './event-list-page.component.html',
  styleUrl: './event-list-page.component.css'
})
export class EventListPageComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly venueService = inject(VenueService);
  private readonly categoryService = inject(CategoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly filterSubject = new Subject<EventFilter>();

  // Filter options state
  venues: Venue[] = [];
  categories: EventCategory[] = [];
  loadingOptions = false;
  optionsError: string | null = null;

  // Events & pagination state
  events: EventSummary[] = [];
  currentFilter: EventFilter = {};
  page = 1;
  pageSize = 12;
  totalCount = 0;
  totalPages = 0;

  // Page lifecycle states
  loading = false;
  errorMessage: string | null = null;

  ngOnInit(): void {
    this.loadFilterOptions();
    this.setupFilterDebounce();
    this.setupRouteListener();
  }

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
    }).subscribe({
      next: ({ venues, categories }) => {
        this.loadingOptions = false;
        this.venues = venues;
        this.categories = categories;

        if (venuesFailed && categoriesFailed) {
          this.optionsError =
            'Unable to load filter options. You can still search by name or date.';
        }
      }
    });
  }

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

  private setupRouteListener(): void {
    this.route.queryParamMap
      .pipe(
        switchMap((params: ParamMap) => {
          const filter = this.parseQueryParams(params);
          this.currentFilter = filter;
          this.page = filter.page ?? 1;
          this.pageSize = filter.pageSize ?? 12;

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

  onViewEvent(event: EventSummary): void {
    this.router.navigate(['/events', event.id]);
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

  private parseQueryParams(params: ParamMap): EventFilter {
    const filter: EventFilter = {};

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

    const time = params.get('time');
    if (time && time.trim()) {
      filter.time = time.trim();
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
      filter.pageSize = !isNaN(size) && size > 0 ? size : 12;
    } else {
      filter.pageSize = 12;
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
    if (filter.time && filter.time.trim()) {
      queryParams['time'] = filter.time.trim();
    }

    // Always reset to page 1 on filter changes
    queryParams['page'] = 1;

    if (this.pageSize && this.pageSize !== 12) {
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
