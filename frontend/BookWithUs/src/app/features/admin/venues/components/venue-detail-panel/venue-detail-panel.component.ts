import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Venue } from '../../../../../core/models/venues/venue.model';
import { VenueAvailabilityCheckerComponent } from '../venue-availability-checker/venue-availability-checker.component';

@Component({
  selector: 'app-venue-detail-panel',
  standalone: true,
  imports: [CommonModule, DecimalPipe, VenueAvailabilityCheckerComponent],
  templateUrl: './venue-detail-panel.component.html',
  styleUrl: './venue-detail-panel.component.css'
})
export class VenueDetailPanelComponent {
  @Input() venue: Venue | null = null;
  @Input() deleting = false;
  @Input() serverError: string | null = null;

  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Venue>();
  @Output() delete = new EventEmitter<Venue>();

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.venue) {
      this.edit.emit(this.venue);
    }
  }

  onDelete(): void {
    if (this.venue && this.venue.upcomingEventCount === 0 && !this.deleting) {
      this.delete.emit(this.venue);
    }
  }
}
