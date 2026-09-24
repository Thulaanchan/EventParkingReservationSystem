import {
  Component,
  DestroyRef,
  OnInit,
  inject
} from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, ParamMap, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Subject,
  catchError,
  debounceTime,
  forkJoin,
  of,
  switchMap,
  timeout
} from 'rxjs';
import { ThemeService } from '../../../../core/services/theme/theme.service';
import { EventService } from '../../../../core/services/events/event.service';
import { VenueService } from '../../../../core/services/venues/venue.service';
import { CategoryService } from '../../../../core/services/categories/category.service';
import { AuthService } from '../../../../core/services/auth/auth.service';
import { EventSummary } from '../../../../core/models/events/event-summary.model';
import { EventFilter } from '../../../../core/models/events/event-filter.model';
import { PagedResult } from '../../../../core/models/common/paged-result.model';
import { Venue } from '../../../../core/models/venues/venue.model';
import { EventCategory } from '../../../../core/models/categories/event-category.model';
import { environment } from '../../../../../environments/environment';

export interface HeroSlide {
  id: number;
  badge: string;
  artistTitle: string;
  subtitle: string;
  dateText: string;
  venueText: string;
  description: string;
  imageUrl: string;
  fallbackGradient: string;
  hasImageError?: boolean;
}

export interface ExploreEventItem {
  id: number;
  name: string;
  categoryName: string;
  venueName: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  ticketPrice: number;
  posterUrl: string | null;
  totalSeats: number;
  availableSeats: number;
  isWishlisted?: boolean;
  hasImageError?: boolean;
  fallbackGradient?: string;
}

@Component({
  selector: 'app-event-list-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './event-list-page.component.html',
  styleUrl: './event-list-page.component.css'
})
export class EventListPageComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly venueService = inject(VenueService);
  private readonly categoryService = inject(CategoryService);
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly filterSubject = new Subject<EventFilter>();

  // Filter options state
  venues: Venue[] = [];
  categories: EventCategory[] = [];
  loadingOptions = false;
  optionsError: string | null = null;

  // Filter form controls
  searchQuery = '';
  selectedVenue: number | null = null;
  selectedCategory: number | null = null;
  selectedDate = '';
  selectedTime = '';

  // Theme state
  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
  isUserMenuOpen = false;

  // Wishlist state (persisted in localStorage)
  wishlistIds = new Set<number>();

  // Page lifecycle states
  loading = false;
  errorMessage: string | null = null;
  hasBackendData = false;

  // Events & pagination state
  backendEvents: EventSummary[] = [];
  displayedEvents: ExploreEventItem[] = [];
  currentFilter: EventFilter = {};
  page = 1;
  pageSize = 12;
  totalCount = 0;
  totalPages = 0;
  visibleCardLimit = 4;

  // Hero carousel slides
  currentHeroIndex = 0;
  heroSlides: HeroSlide[] = [
    {
      id: 1,
      badge: 'LIVE IN CONCERT',
      artistTitle: 'Anirudh',
      subtitle: 'Live in Colombo',
      dateText: '12 Sep 2026 • 8:00 PM',
      venueText: 'Sugathadasa Indoor Stadium, Colombo',
      description: 'Experience an electrifying evening with chartbuster hits and a spectacular live production.',
      imageUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
      fallbackGradient: 'linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #4a044e 100%)'
    },
    {
      id: 2,
      badge: 'TECH CONFERENCE',
      artistTitle: 'Global Tech Summit',
      subtitle: '2024 Colombo Edition',
      dateText: '12 – 14 Oct 2024 • 9:00 AM',
      venueText: 'BMICH, Colombo',
      description: 'Connect with global tech leaders, keynote innovators, and developers shaping next-generation AI and cloud architecture.',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      fallbackGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1e1b4b 100%)'
    },
    {
      id: 3,
      badge: 'INDUSTRY EXPO',
      artistTitle: 'Sri Lanka Build Expo',
      subtitle: 'Architecture & Trade 2024',
      dateText: '8 – 10 Nov 2024 • 10:00 AM',
      venueText: 'BMICH Main Exhibition Center',
      description: 'The premier construction, architecture, and engineering exhibition showcasing innovative green technologies.',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
      fallbackGradient: 'linear-gradient(135deg, #134e4a 0%, #0f172a 50%, #111827 100%)'
    },
    {
      id: 4,
      badge: 'STAGE THEATRE',
      artistTitle: 'A Midsummer Night\'s Dream',
      subtitle: 'Classic Drama by William Shakespeare',
      dateText: '5 – 8 Dec 2024 • 7:30 PM',
      venueText: 'Nelum Pokuna Theatre, Colombo',
      description: 'An enchanting, visually stunning theatrical performance by renowned artists in a celebrated masterpiece.',
      imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80',
      fallbackGradient: 'linear-gradient(135deg, #3b0764 0%, #180326 60%, #000000 100%)'
    }
  ];


  ngOnInit(): void {
    this.initWishlist();
    this.loading = true;
    this.loadFilterOptions();
    this.setupFilterDebounce();
    this.setupRouteListener();
  }

  // --- Theme Management ---

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // --- Wishlist Management ---

  private initWishlist(): void {
    try {
      const saved = localStorage.getItem('eventflow_wishlist');
      if (saved) {
        const ids = JSON.parse(saved) as number[];
        this.wishlistIds = new Set(ids);
      }
    } catch {
      this.wishlistIds = new Set();
    }
  }

  toggleWishlist(eventId: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.wishlistIds.has(eventId)) {
      this.wishlistIds.delete(eventId);
    } else {
      this.wishlistIds.add(eventId);
    }

    try {
      localStorage.setItem('eventflow_wishlist', JSON.stringify(Array.from(this.wishlistIds)));
    } catch {
      // Ignore storage errors
    }

    // Update displayed items state
    this.displayedEvents = this.displayedEvents.map(item => ({
      ...item,
      isWishlisted: this.wishlistIds.has(item.id)
    }));
  }

  isWishlisted(eventId: number): boolean {
    return this.wishlistIds.has(eventId);
  }

  // --- Hero Carousel Controls ---

  nextHeroSlide(): void {
    this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroSlides.length;
  }

  prevHeroSlide(): void {
    this.currentHeroIndex =
      (this.currentHeroIndex - 1 + this.heroSlides.length) % this.heroSlides.length;
  }

  setHeroSlide(index: number): void {
    if (index >= 0 && index < this.heroSlides.length) {
      this.currentHeroIndex = index;
    }
  }

  onHeroImageError(slide: HeroSlide): void {
    slide.hasImageError = true;
  }

  onHeroCtaClick(slide: HeroSlide): void {
    this.router.navigate(['/events', slide.id]);
  }

  // --- Filter Options ---

  loadFilterOptions(): void {
    this.loadingOptions = true;
    this.optionsError = null;

    let venuesFailed = false;
    let categoriesFailed = false;

    forkJoin({
      venues: this.venueService.getVenues().pipe(
        timeout(15000),
        catchError(() => {
          venuesFailed = true;
          return of([] as Venue[]);
        })
      ),
      categories: this.categoryService.getCategories().pipe(
        timeout(15000),
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
          this.optionsError = 'Unable to load venue and category filter options from server.';
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

          this.searchQuery = filter.search ?? '';
          this.selectedVenue = filter.venue ?? null;
          this.selectedCategory = filter.category ?? null;
          this.selectedDate = filter.date ?? '';
          this.selectedTime = filter.time ?? '';

          // Only show full loading spinner if we don't already have displayed events
          if (this.displayedEvents.length === 0) {
            this.loading = true;
          }
          this.errorMessage = null;

          return this.eventService.getEvents(filter).pipe(
            timeout(15000),
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
        if (res && res.items && res.items.length > 0) {
          this.backendEvents = res.items;
          this.page = res.page;
          this.pageSize = res.pageSize;
          this.totalCount = res.totalCount;
          this.totalPages = res.totalPages;
          this.hasBackendData = true;
          this.mapBackendEventsToDisplay(res.items);
        } else if (res && res.items) {
          this.backendEvents = [];
          this.displayedEvents = [];
          this.totalCount = 0;
          this.totalPages = 1;
          this.hasBackendData = true;
        } else {
          this.backendEvents = [];
          this.displayedEvents = [];
          this.totalCount = 0;
          this.totalPages = 1;
          this.hasBackendData = false;
        }
      });
  }

  // --- Filter Actions ---

  onSearchSubmit(): void {
    const filter: EventFilter = {
      search: this.searchQuery?.trim() || null,
      venue: this.selectedVenue || null,
      category: this.selectedCategory || null,
      date: this.selectedDate || null,
      time: this.selectedTime || null
    };

    this.filterSubject.next(filter);
  }

  onClearFilters(): void {
    this.searchQuery = '';
    this.selectedVenue = null;
    this.selectedCategory = null;
    this.selectedDate = '';
    this.selectedTime = '';

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {}
    });
  }

  private mapBackendEventsToDisplay(items: EventSummary[]): void {
    this.displayedEvents = items.map(item => ({
      id: item.id,
      name: item.name,
      categoryName: item.categoryName,
      venueName: item.venueName,
      eventDate: item.eventDate,
      startTime: item.startTime,
      endTime: item.endTime,
      ticketPrice: item.ticketPrice,
      posterUrl: this.resolvePosterUrl(item.posterUrl),
      totalSeats: item.totalSeats,
      availableSeats: item.availableSeats,
      isWishlisted: this.wishlistIds.has(item.id),
      fallbackGradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'
    }));
  }

  resolvePosterUrl(posterUrl: string | null | undefined): string | null {
    if (!posterUrl || !posterUrl.trim()) {
      return null;
    }
    const trimmed = posterUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }
    try {
      return new URL(trimmed, environment.apiUrl).toString();
    } catch {
      return null;
    }
  }

  onCardImageError(item: ExploreEventItem): void {
    item.hasImageError = true;
  }

  onViewEvent(event: ExploreEventItem): void {
    this.router.navigate(['/events', event.id]);
  }

  onLoadMore(): void {
    if (this.visibleCardLimit < this.displayedEvents.length) {
      this.visibleCardLimit += 4;
    } else if (this.hasBackendData && this.page < this.totalPages) {
      this.goToPage(this.page + 1);
    }
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

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
  }

  onLogout(): void {
    this.authService.logout();
    this.isUserMenuOpen = false;
    this.router.navigate(['/events']);
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

    queryParams['page'] = 1;

    return queryParams;
  }

  private handleLoadError(err: unknown): void {
    this.hasBackendData = false;
    this.displayedEvents = [];
    this.backendEvents = [];
    this.totalCount = 0;
    this.totalPages = 1;
    if (err instanceof HttpErrorResponse) {
      if (err.status === 0) {
        this.errorMessage =
          'Unable to connect to the backend server. Please verify the API is running.';
      } else if (err.status >= 500) {
        this.errorMessage =
          'A server error occurred while retrieving events. Please try again.';
      } else {
        this.errorMessage =
          err.error?.message ||
          (typeof err.error === 'string' ? err.error : null) ||
          'Failed to load events. Please try again.';
      }
    } else {
      this.errorMessage =
        'Failed to load events. Please check your connection and try again.';
    }
  }
}
