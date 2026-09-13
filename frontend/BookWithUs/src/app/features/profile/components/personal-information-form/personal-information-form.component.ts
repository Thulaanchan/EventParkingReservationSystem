import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Customer } from '../../../../core/models/customers/customer.model';
import { UpdateCustomerRequest } from '../../../../core/models/customers/update-customer-request.model';

@Component({
  selector: 'app-personal-information-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './personal-information-form.component.html',
  styleUrl: './personal-information-form.component.css'
})
export class PersonalInformationFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() customer: Customer | null = null;
  @Input() isSaving = false;
  @Input() errorMessage: string | null = null;

  @Output() update = new EventEmitter<UpdateCustomerRequest>();

  readonly profileForm: FormGroup = this.fb.group({
    firstName: [
      '',
      [Validators.required, Validators.maxLength(50)]
    ],
    lastName: [
      '',
      [Validators.required, Validators.maxLength(50)]
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(150)
      ]
    ],
    phone: [
      '',
      [Validators.maxLength(25)]
    ]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['customer'] && this.customer) {
      // Only populate if form hasn't been modified by user yet
      if (this.profileForm.pristine) {
        this.populateForm(this.customer);
      }
    }
  }

  populateForm(customer: Customer): void {
    this.profileForm.patchValue({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || ''
    });
    this.profileForm.markAsPristine();
  }

  get firstNameControl(): AbstractControl | null {
    return this.profileForm.get('firstName');
  }

  get lastNameControl(): AbstractControl | null {
    return this.profileForm.get('lastName');
  }

  get emailControl(): AbstractControl | null {
    return this.profileForm.get('email');
  }

  get phoneControl(): AbstractControl | null {
    return this.profileForm.get('phone');
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.profileForm.get(fieldName);
    return !!(control && control.invalid && (control.touched || control.dirty));
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    if (this.isSaving) {
      return;
    }

    const { firstName, lastName, email, phone } = this.profileForm.value;

    const request: UpdateCustomerRequest = {
      firstName: (firstName || '').trim(),
      lastName: (lastName || '').trim(),
      email: (email || '').trim(),
      phone: phone ? phone.trim() : null
    };

    this.update.emit(request);
  }

  discardChanges(): void {
    if (this.customer) {
      this.populateForm(this.customer);
    }
  }
}
