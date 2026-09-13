import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-checkout-shell',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './checkout-shell.component.html',
  styleUrl: './checkout-shell.component.css'
})
export class CheckoutShellComponent {}
