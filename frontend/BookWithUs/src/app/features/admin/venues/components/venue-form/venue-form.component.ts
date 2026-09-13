import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Venue } from '../../../../../core/models/venues/venue.model';
import { CreateVenueRequest } from '../../../../../core/models/venues/create-venue-request.model';
import { UpdateVenueRequest } from '../../../../../core/models/venues/update-venue-request.model';

@Component({
  selector: 'app-venue-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './venue-form.component.html',
  styleUrl: './venue-form.component.css'
})
export class VenueFormComponent implements OnChanges {
  @Input() venue: Venue | null = null;
  @Input() submitting = false;
  @Input() serverError: string | null = null;

  @Output() save = new EventEmitter<CreateVenueRequest | UpdateVenueRequest>();
  @Output() cancel = new EventEmitter<void>();

  venueName = '';
  address = '';
  totalCapacity: number | null = null;

  get isEditMode(): boolean {
    return !!this.venue && this.venue.id > 0;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['venue']) {
      if (this.venue) {
        this.venueName = this.venue.name ?? '';
        this.address = this.venue.address ?? '';
        this.totalCapacity = this.venue.totalCapacity ?? null;
      } else {
        this.venueName = '';
        this.address = '';
        this.totalCapacity = null;
      }
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.submitting) {
      return;
    }

    const trimmedName = this.venueName.trim();
    const trimmedAddress = this.address.trim();
    const capacity = Number(this.totalCapacity);

    if (!trimmedName || !trimmedAddress || isNaN(capacity) || capacity < 1) {
      return;
    }

    const request: CreateVenueRequest | UpdateVenueRequest = {
      name: trimmedName,
      address: trimmedAddress,
      totalCapacity: Math.floor(capacity)
    };

    this.save.emit(request);
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
