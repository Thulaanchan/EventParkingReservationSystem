import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Venue } from '../../../../../core/models/venues/venue.model';

/**
 * VenueTableComponent renders the admin venue listing with client pagination
 * and row actions. Upcoming event status indicates scheduled events, while
 * exact date/time schedule availability is verified via Venue Details.
 */
@Component({
  selector: 'app-venue-table',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './venue-table.component.html',
  styleUrl: './venue-table.component.css'
})
export class VenueTableComponent implements OnChanges {
  @Input() venues: Venue[] = [];
  @Input() loading = false;

  @Output() viewVenue = new EventEmitter<Venue>();
  @Output() editVenue = new EventEmitter<Venue>();
  @Output() deleteVenue = new EventEmitter<Venue>();

  activeMenuVenueId: number | null = null;
  currentPage = 1;
  readonly pageSize = 6;

  constructor(private readonly elementRef: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['venues']) {
      if (this.currentPage > this.totalPages) {
        this.currentPage = 1;
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.closeMenu();
    }
  }

  toggleMenu(venueId: number, event: MouseEvent): void {
    event.stopPropagation();
    if (this.activeMenuVenueId === venueId) {
      this.activeMenuVenueId = null;
    } else {
      this.activeMenuVenueId = venueId;
    }
  }

  closeMenu(): void {
    this.activeMenuVenueId = null;
  }

  onView(venue: Venue): void {
    this.closeMenu();
    this.viewVenue.emit(venue);
  }

  onEdit(venue: Venue): void {
    this.closeMenu();
    this.editVenue.emit(venue);
  }

  onDelete(venue: Venue): void {
    this.closeMenu();
    this.deleteVenue.emit(venue);
  }

  get totalPages(): number {
    return Math.ceil(this.venues.length / this.pageSize) || 1;
  }

  get pagedVenues(): Venue[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.venues.slice(start, start + this.pageSize);
  }

  get startIndex(): number {
    return this.venues.length === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.venues.length);
  }

  get pages(): number[] {
    const pageList: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pageList.push(i);
    }
    return pageList;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.closeMenu();
    }
  }
}
