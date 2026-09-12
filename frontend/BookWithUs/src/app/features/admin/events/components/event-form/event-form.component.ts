import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { EventPosterUploadComponent } from '../event-poster-upload/event-poster-upload.component';
import {
  StageLayoutOption,
  StageLayoutSelectorComponent
} from '../stage-layout-selector/stage-layout-selector.component';
import { VenueCapacityInfoComponent } from '../venue-capacity-info/venue-capacity-info.component';
import { VenueAvailabilityStatusComponent } from '../venue-availability-status/venue-availability-status.component';

import { EventDetails } from '../../../../../../core/models/events/event-details.model';
import { Venue } from '../../../../../../core/models/venues/venue.model';
import { EventCategory } from '../../../../../../core/models/categories/event-category.model';
import { CreateEventRequest } from '../../../../../../core/models/events/create-event-request.model';
import { UpdateEventRequest } from '../../../../../../core/models/events/update-event-request.model';

interface EventFormControls {
  name: FormControl<string>;
  description: FormControl<string | null>;
  venueId: FormControl<number | null>;
  categoryId: FormControl<number | null>;
  eventDate: FormControl<string>;
  startTime: FormControl<string>;
  endTime: FormControl<string>;
  ticketPrice: FormControl<number | null>;
  capacity: FormControl<number | null>;
  stageLayout: FormControl<string | null>;
}

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EventPosterUploadComponent,
    StageLayoutSelectorComponent,
    VenueCapacityInfoComponent,
    VenueAvailabilityStatusComponent
  ],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css'
})
export class EventFormComponent implements OnInit, OnChanges {
  private readonly destroyRef = inject(DestroyRef);

  @Input() event: EventDetails | null = null;
  @Input() venues: Venue[] = [];
  @Input() categories: EventCategory[] = [];
  @Input() stageLayoutOptions: readonly StageLayoutOption[] = [];
  @Input() submitting = false;
  @Input() serverError: string | null = null;

  @Output() save = new EventEmitter<CreateEventRequest | UpdateEventRequest>();
  @Output() cancel = new EventEmitter<void>();

  selectedPosterFile: File | null = null;

  readonly form: FormGroup<EventFormControls> = new FormGroup<EventFormControls>(
    {
      name: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          this.notWhitespaceValidator,
          Validators.maxLength(180)
        ]
      }),
      description: new FormControl<string | null>('', [
        Validators.maxLength(3000)
      ]),
      venueId: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1)
      ]),
      categoryId: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1)
      ]),
      eventDate: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          this.futureDateValidator(() => !!this.event)
        ]
      }),
      startTime: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      endTime: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required]
      }),
      ticketPrice: new FormControl<number | null>(0, [
        Validators.required,
        Validators.min(0),
        Validators.max(999999999)
      ]),
      capacity: new FormControl<number | null>(null, [
        Validators.required,
        Validators.min(1),
        Validators.pattern(/^\d+$/),
        this.capacityMaxValidator(() => this.selectedVenue)
      ]),
      stageLayout: new FormControl<string | null>(null, [
        Validators.maxLength(100)
      ])
    },
    { validators: [this.timeRangeValidator] }
  );

  ngOnInit(): void {
    // Re-validate dynamic capacity boundary when venue changes
    this.form.controls.venueId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.form.controls.capacity.updateValueAndValidity();
      });

    if (this.event) {
      this.populateForm(this.event);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.event) {
      this.populateForm(this.event);
    }
    if (changes['venues']) {
      this.form.controls.capacity.updateValueAndValidity();
    }
  }

  get isEditMode(): boolean {
    return !!this.event;
  }

  get selectedVenue(): Venue | null {
    const vId = this.form.controls.venueId.value;
    if (!vId) {
      return null;
    }
    return this.venues.find(v => v.id === Number(vId)) ?? null;
  }

  get selectedCategory(): EventCategory | null {
    const cId = this.form.controls.categoryId.value;
    if (!cId) {
      return null;
    }
    return this.categories.find(c => c.id === Number(cId)) ?? null;
  }

  get isTimeRangeInvalid(): boolean {
    return (
      this.form.hasError('invalidTimeRange') &&
      this.form.controls.startTime.touched &&
      this.form.controls.endTime.touched
    );
  }

  onPosterChange(file: File | null): void {
    this.selectedPosterFile = file;
  }

  onStageLayoutChange(layout: string | null): void {
    this.form.controls.stageLayout.setValue(layout);
    this.form.controls.stageLayout.markAsDirty();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid || this.submitting) {
      return;
    }

    const raw = this.form.getRawValue();

    const request: CreateEventRequest | UpdateEventRequest = {
      name: raw.name.trim(),
      description: raw.description?.trim() ? raw.description.trim() : null,
      venueId: Number(raw.venueId),
      categoryId: Number(raw.categoryId),
      eventDate: raw.eventDate,
      startTime: this.normalizeTime(raw.startTime),
      endTime: this.normalizeTime(raw.endTime),
      ticketPrice: Number(raw.ticketPrice ?? 0),
      capacity: Number(raw.capacity),
      stageLayout: raw.stageLayout?.trim() ? raw.stageLayout.trim() : null,
      poster: this.selectedPosterFile ?? null
    };

    this.save.emit(request);
  }

  private populateForm(event: EventDetails): void {
    this.form.patchValue({
      name: event.name,
      description: event.description ?? '',
      venueId: event.venueId,
      categoryId: event.categoryId,
      eventDate: this.formatDateForInput(event.eventDate),
      startTime: this.formatTimeForInput(event.startTime),
      endTime: this.formatTimeForInput(event.endTime),
      ticketPrice: event.ticketPrice,
      capacity: event.capacity,
      stageLayout: event.stageLayout ?? null
    });

    // Edit-mode booking locks strictly bound to backend contract flags
    if (!event.canEditTicketPrice) {
      this.form.controls.ticketPrice.disable();
    } else {
      this.form.controls.ticketPrice.enable();
    }

    if (!event.canEditCapacity) {
      this.form.controls.capacity.disable();
    } else {
      this.form.controls.capacity.enable();
    }

    if (!event.canEditStageLayout) {
      this.form.controls.stageLayout.disable();
    } else {
      this.form.controls.stageLayout.enable();
    }

    this.form.controls.capacity.updateValueAndValidity();
  }

  private formatDateForInput(dateStr: string | null): string {
    if (!dateStr) {
      return '';
    }
    const trimmed = dateStr.trim();
    if (trimmed.includes('T')) {
      return trimmed.split('T')[0];
    }
    return trimmed;
  }

  private formatTimeForInput(timeStr: string | null): string {
    if (!timeStr) {
      return '';
    }
    const trimmed = timeStr.trim();
    if (trimmed.length >= 5) {
      return trimmed.substring(0, 5);
    }
    return trimmed;
  }

  private normalizeTime(timeStr: string): string {
    const trimmed = timeStr.trim();
    if (trimmed.length === 5) {
      return `${trimmed}:00`;
    }
    return trimmed;
  }

  private notWhitespaceValidator(
    control: AbstractControl
  ): ValidationErrors | null {
    if (!control.value) {
      return null;
    }
    if (typeof control.value === 'string' && control.value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  }

  private futureDateValidator(isEdit: () => boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }
      if (isEdit()) {
        return null; // Existing historical/current date in edit mode is preserved
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selected = new Date(`${control.value}T00:00:00`);
      if (isNaN(selected.getTime())) {
        return { invalidDate: true };
      }
      if (selected.getTime() < today.getTime()) {
        return { pastDate: true };
      }
      return null;
    };
  }

  private timeRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;
    if (!start || !end) {
      return null;
    }
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
      return null;
    }
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;
    if (endMin <= startMin) {
      return { invalidTimeRange: true };
    }
    return null;
  }

  private capacityMaxValidator(getVenue: () => Venue | null): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (
        control.value === null ||
        control.value === undefined ||
        control.value === ''
      ) {
        return null;
      }
      const venue = getVenue();
      if (!venue) {
        return null;
      }
      const val = Number(control.value);
      if (val > venue.totalCapacity) {
        return {
          exceedsVenueCapacity: {
            max: venue.totalCapacity,
            actual: val
          }
        };
      }
      return null;
    };
  }
}
