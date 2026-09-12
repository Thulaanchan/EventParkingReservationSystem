import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  iconType: 'ticket' | 'calendar' | 'parking' | 'payment' | 'user';
  link: string;
}

@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './quick-actions.component.html',
  styleUrl: './quick-actions.component.css'
})
export class QuickActionsComponent {
  readonly actions: QuickActionItem[] = [
    {
      id: 'browse-events',
      title: 'Browse Events',
      description: "Find events you'll love",
      iconType: 'ticket',
      link: '/events'
    },
    {
      id: 'my-bookings',
      title: 'My Bookings',
      description: 'View & manage bookings',
      iconType: 'calendar',
      link: '/bookings'
    },
    {
      id: 'my-parking',
      title: 'My Parking',
      description: 'View parking reservations',
      iconType: 'parking',
      link: '/parking'
    },
    {
      id: 'payment-history',
      title: 'Payment History',
      description: 'View all your payments',
      iconType: 'payment',
      link: '/payments'
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your account',
      iconType: 'user',
      link: '/profile'
    }
  ];
}
