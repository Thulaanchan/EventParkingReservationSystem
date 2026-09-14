import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth/auth.service';
import { RegisterRequest } from '../../../../core/models/auth/register-request.model';


export const passwordComplexityValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const value = control.value ?? '';

  if (!value) {
    return null;
  }

  const errors: ValidationErrors = {};

  if (!/[A-Z]/.test(value)) {
    errors['missingUpperCase'] = true;
  }

  if (!/[a-z]/.test(value)) {
    errors['missingLowerCase'] = true;
  }

  if (!/\d/.test(value)) {
    errors['missingNumber'] = true;
  }

  if (!/[^A-Za-z0-9]/.test(value)) {
    errors['missingSpecialChar'] = true;
  }

  return Object.keys(errors).length ? errors : null;
};


export const passwordMatchValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {

  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword
    ? null
    : { passwordMismatch: true };
};



@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.css'
})
export class RegisterPageComponent {

  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);


  readonly isSubmitting = signal(false);

  readonly showPassword = signal(false);

  readonly showConfirmPassword = signal(false);

  readonly errorMessage = signal<string | null>(null);



  readonly registerForm: FormGroup =
    this.fb.group(
      {
        firstName: [
          '',
          [
            Validators.required,
            Validators.maxLength(50)
          ]
        ],

        lastName: [
          '',
          [
            Validators.required,
            Validators.maxLength(50)
          ]
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
          [
            Validators.maxLength(25)
          ]
        ],

        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            passwordComplexityValidator
          ]
        ],

        confirmPassword: [
          '',
          [
            Validators.required
          ]
        ],

        termsAccepted:[
          false,
          [
            Validators.requiredTrue
          ]
        ]

      },
      {
        validators:[
          passwordMatchValidator
        ]
      }
    );



  readonly canSubmit = computed(() =>
    !this.isSubmitting() &&
    this.registerForm.valid
  );



  togglePasswordVisibility():void{
    this.showPassword.update(v=>!v);
  }


  toggleConfirmPasswordVisibility():void{
    this.showConfirmPassword.update(v=>!v);
  }



  get firstNameControl(){
    return this.registerForm.get('firstName');
  }


  get lastNameControl(){
    return this.registerForm.get('lastName');
  }


  get emailControl(){
    return this.registerForm.get('email');
  }


  get phoneControl(){
    return this.registerForm.get('phone');
  }


  get passwordControl(){
    return this.registerForm.get('password');
  }


  get confirmPasswordControl(){
    return this.registerForm.get('confirmPassword');
  }


  get termsAcceptedControl(){
    return this.registerForm.get('termsAccepted');
  }



  isFieldInvalid(controlName:string):boolean{

    const control=this.registerForm.get(controlName);

    return !!control &&
      control.invalid &&
      (control.touched || control.dirty);
  }



  hasPasswordMismatch():boolean{

    const confirm=this.confirmPasswordControl;

    return !!this.registerForm.errors?.['passwordMismatch']
      &&
      !!confirm
      &&
      (confirm.touched || confirm.dirty);
  }




  onSubmit():void{


    if(this.isSubmitting()){
      return;
    }


    if(this.registerForm.invalid){

      this.registerForm.markAllAsTouched();

      return;
    }



    this.isSubmitting.set(true);

    this.errorMessage.set(null);



    const value=this.registerForm.value;



    const payload:RegisterRequest={

      firstName:value.firstName.trim(),

      lastName:value.lastName.trim(),

      email:value.email.trim(),

      phone:value.phone?.trim() || null,

      password:value.password,

      confirmPassword:value.confirmPassword

    };



    this.authService.register(payload)
    .subscribe({

      next:()=>{

        this.isSubmitting.set(false);


        this.router.navigate(
          [
            '/auth/verify-email-sent'
          ],
          {
            queryParams:{
              email:payload.email
            }
          }
        );

      },


      error:(error:unknown)=>{

        this.isSubmitting.set(false);

        this.handleRegisterError(error);

      }

    });


  }



  private handleRegisterError(error:unknown):void{


    if(error instanceof HttpErrorResponse){


      if(error.status===409){

        this.errorMessage.set(
          error.error?.message ??
          'Email already exists.'
        );

        return;
      }


      if(error.status===400){

        this.errorMessage.set(
          error.error?.message ??
          'Invalid registration details.'
        );

        return;
      }


      if(error.status===0){

        this.errorMessage.set(
          'Unable to connect to server.'
        );

        return;
      }

    }


    this.errorMessage.set(
      'Registration failed. Try again.'
    );

  }

}