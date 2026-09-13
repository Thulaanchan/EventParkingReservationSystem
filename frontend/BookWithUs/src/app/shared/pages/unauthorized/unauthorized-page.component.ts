import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './unauthorized-page.component.html',
  styleUrl: './unauthorized-page.component.css'
})
export class UnauthorizedPageComponent {}
