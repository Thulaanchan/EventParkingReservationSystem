import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-simulated-card-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './simulated-card-form.component.html',
  styleUrl: './simulated-card-form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SimulatedCardFormComponent {
  @Input({ required: true }) formGroup!: FormGroup;

  isFieldInvalid(name: string): boolean {
    const ctrl = this.formGroup.get(name);
    return !!(ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched));
  }
}
