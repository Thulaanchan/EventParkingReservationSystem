import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthRoles } from '../../../../core/models/auth/auth-role.model';
import { LoginRequest } from '../../../../core/models/auth/login-request.model';
import { AuthService } from '../../../../core/services/auth/auth.service';


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {


  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);



  credentials: LoginRequest = {

    email: '',

    password: '',

    rememberMe: false

  };



  readonly isSubmitting = signal(false);


  readonly showPassword = signal(false);


  readonly errorMessage =
    signal<string | null>(null);



  togglePasswordVisibility(): void {

    this.showPassword.update(
      value => !value
    );

  }




  onSubmit(form: NgForm): void {


    if (this.isSubmitting()) {

      return;

    }



    if (form.invalid) {


      form.control.markAllAsTouched();


      return;

    }



    this.isSubmitting.set(true);


    this.errorMessage.set(null);




    this.authService
      .login(this.credentials)
      .subscribe({



        next:(response)=>{


          this.isSubmitting.set(false);



          const returnUrl =
            this.route.snapshot.queryParamMap.get(
              'returnUrl'
            )
            ||
            this.route.snapshot.queryParamMap.get(
              'redirectUrl'
            );



          if(returnUrl){

            this.router.navigateByUrl(
              returnUrl
            );

            return;

          }




          if(response.role === AuthRoles.Administrator){


            this.router.navigate([
              '/admin/dashboard'
            ]);


          }
          else{


            this.router.navigate([
              '/customer/dashboard'
            ]);


          }


        },




        error:(error:unknown)=>{


          this.isSubmitting.set(false);


          this.handleLoginError(error);


        }



      });


  }





private handleLoginError(error:unknown):void{


  if(error instanceof HttpErrorResponse){



    if(error.status===401){


      this.errorMessage.set(
        'The email or password you entered is incorrect. Please try again.'
      );


      return;

    }




    if(error.status===403){


      const message =
        error.error?.message;



      this.errorMessage.set(

        typeof message === 'string' && message.trim()

        ? message

        :

        'Access denied. Please verify your email before signing in.'

      );


      return;

    }





    if(error.status===0){


      this.errorMessage.set(
        'Unable to reach authentication server.'
      );


      return;

    }


  }



  this.errorMessage.set(
    'An unexpected error occurred during sign in.'
  );


}



}