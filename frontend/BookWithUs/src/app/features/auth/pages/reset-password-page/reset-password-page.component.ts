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
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AuthService } from '../../../../core/services/auth/auth.service';


export const passwordComplexityValidator: ValidatorFn =
(control: AbstractControl): ValidationErrors | null => {

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

  return Object.keys(errors).length
    ? errors
    : null;
};



export const resetPasswordMatchValidator: ValidatorFn =
(control: AbstractControl): ValidationErrors | null => {

  const password =
    control.get('newPassword')?.value;

  const confirmPassword =
    control.get('confirmNewPassword')?.value;


  if (!password || !confirmPassword) {
    return null;
  }


  return password === confirmPassword
    ? null
    : {
        passwordMismatch:true
      };
};



@Component({
  selector:'app-reset-password-page',
  standalone:true,

  imports:[
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],

  templateUrl:'./reset-password-page.component.html',
  styleUrl:'./reset-password-page.component.css'
})
export class ResetPasswordPageComponent {


private readonly fb = inject(FormBuilder);
private readonly route = inject(ActivatedRoute);
private readonly authService = inject(AuthService);



readonly isSubmitting = signal(false);

readonly isSuccess = signal(false);

readonly showNewPassword = signal(false);

readonly showConfirmNewPassword = signal(false);



readonly hasEmailParam = signal(false);

readonly hasTokenParam = signal(false);



readonly errorMessage =
signal<string | null>(null);


readonly successMessage =
signal<string | null>(null);



readonly resetPasswordForm: FormGroup =
this.fb.group(

{
email:[
'',
[
Validators.required,
Validators.email
]
],


token:[
'',
[
Validators.required
]
],


newPassword:[
'',
[
Validators.required,
Validators.minLength(8),
passwordComplexityValidator
]
],


confirmNewPassword:[
'',
[
Validators.required
]
]

},

{
validators:[
resetPasswordMatchValidator
]
}

);



constructor(){

const email =
this.route.snapshot.queryParamMap.get('email')
||
this.route.snapshot.queryParamMap.get('Email')
||
'';


const token =
this.route.snapshot.queryParamMap.get('token')
||
this.route.snapshot.queryParamMap.get('Token')
||
'';



if(email){

this.resetPasswordForm.patchValue({
email:email.trim()
});

this.hasEmailParam.set(true);

}



if(token){

this.resetPasswordForm.patchValue({
token:token.trim().replace(/ /g, '+')
});

this.hasTokenParam.set(true);

}



if(!token){

this.errorMessage.set(
'Reset token is missing from the link. Please request a new password reset link.'
);

}

}




get emailControl(){
return this.resetPasswordForm.get('email');
}


get tokenControl(){
return this.resetPasswordForm.get('token');
}


get newPasswordControl(){
return this.resetPasswordForm.get('newPassword');
}


get confirmNewPasswordControl(){
return this.resetPasswordForm.get('confirmNewPassword');
}



get hasMinLength(){

return (
(this.newPasswordControl?.value ?? '')
.length >= 8
);

}



get hasUpperCase(){

return /[A-Z]/.test(
this.newPasswordControl?.value ?? ''
);

}



get hasLowerCase(){

return /[a-z]/.test(
this.newPasswordControl?.value ?? ''
);

}



get hasNumber(){

return /\d/.test(
this.newPasswordControl?.value ?? ''
);

}



get hasSpecialChar(){

return /[^A-Za-z0-9]/.test(
this.newPasswordControl?.value ?? ''
);

}



toggleNewPasswordVisibility(){

this.showNewPassword.update(
v=>!v
);

}



toggleConfirmNewPasswordVisibility(){

this.showConfirmNewPassword.update(
v=>!v
);

}




isFieldInvalid(name:string){

const control =
this.resetPasswordForm.get(name);


return !!control &&
control.invalid &&
(control.touched || control.dirty);

}



get isPasswordMismatch(){

return (

!!this.confirmNewPasswordControl &&
this.confirmNewPasswordControl.touched &&
this.resetPasswordForm.hasError(
'passwordMismatch'
)

);

}




onSubmit(){


if(this.resetPasswordForm.invalid){

this.resetPasswordForm.markAllAsTouched();

return;

}



this.isSubmitting.set(true);

this.errorMessage.set(null);

this.successMessage.set(null);



const value =
this.resetPasswordForm.value;



this.authService.resetPassword({

email:value.email.trim(),

token:(value.token || '').trim().replace(/ /g, '+'),

newPassword:value.newPassword,

confirmNewPassword:value.confirmNewPassword

})

.subscribe({

next:(res)=>{


this.isSubmitting.set(false);

this.isSuccess.set(true);


this.successMessage.set(

res.message ??
'Your password has been reset successfully! You can now log in.'

);


},



error:(error:unknown)=>{


this.isSubmitting.set(false);



if(error instanceof HttpErrorResponse){


if(error.status===400){

this.errorMessage.set(
error.error?.message ??
'Invalid or expired reset link.'
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
'Unable to reset password.'
);


}


});


}


}