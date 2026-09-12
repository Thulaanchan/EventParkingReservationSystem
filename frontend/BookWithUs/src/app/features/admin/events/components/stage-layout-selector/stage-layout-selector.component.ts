import {
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StageLayoutOption {
  value: string;
  label: string;
  description?: string;
}

/**
 * Presentational selector for Event Stage Layout metadata.
 * Displays accessible select dropdown and visual layout preview.
 * Adheres strictly to M2/M3 boundary: Does not generate or manage actual seats.
 */
@Component({
  selector: 'app-stage-layout-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './stage-layout-selector.component.html',
  styleUrl: './stage-layout-selector.component.css'
})
export class StageLayoutSelectorComponent {
  @Input() value: string | null = null;
  @Input() options: readonly StageLayoutOption[] = [];
  @Input() disabled = false;
  @Input() required = false;

  @Output() valueChange = new EventEmitter<string | null>();

  private readonly maxFieldLength = 100;

  get selectedOption(): StageLayoutOption | null {
    if (!this.value || !this.value.trim()) {
      return null;
    }

    const trimmed = this.value.trim();
    const match = this.options.find(
      opt => opt.value.toLowerCase() === trimmed.toLowerCase()
    );

    if (match) {
      return match;
    }

    // Preserve existing/unknown edit-mode values safely without crashing
    return {
      value: trimmed,
      label: trimmed,
      description: 'The selected layout will guide the Seat Map Builder.'
    };
  }

  get isCustomValue(): boolean {
    if (!this.value || !this.value.trim()) {
      return false;
    }
    const trimmed = this.value.trim();
    return !this.options.some(
      opt => opt.value.toLowerCase() === trimmed.toLowerCase()
    );
  }

  get previewLabel(): string | null {
    return this.selectedOption?.label ?? null;
  }

  get previewDescription(): string {
    if (this.selectedOption?.description && this.selectedOption.description.trim()) {
      return this.selectedOption.description.trim();
    }
    return 'The selected layout will guide the Seat Map Builder.';
  }

  onSelectChange(event: Event): void {
    if (this.disabled) {
      return;
    }

    const target = event.target as HTMLSelectElement;
    const raw = target.value;

    if (!raw || !raw.trim()) {
      this.valueChange.emit(null);
      return;
    }

    const trimmed = raw.trim();
    const safeValue =
      trimmed.length > this.maxFieldLength
        ? trimmed.substring(0, this.maxFieldLength)
        : trimmed;

    this.valueChange.emit(safeValue);
  }
}
