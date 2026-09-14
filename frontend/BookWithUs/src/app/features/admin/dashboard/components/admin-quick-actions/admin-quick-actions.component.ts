import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type QuickActionId =
  | 'createEvent'
  | 'manageVenues'
  | 'manageCategories'
  | 'viewBookings';

export interface QuickActionItem {
  id: QuickActionId;
  title: string;
  description: string;
  icon: 'create-event' | 'manage-venues' | 'manage-categories' | 'view-bookings';
}

@Component({
  selector: 'app-admin-quick-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-quick-actions.component.html',
  styleUrl: './admin-quick-actions.component.css'
})
export class AdminQuickActionsComponent {
  @Output() createEvent = new EventEmitter<void>();
  @Output() manageVenues = new EventEmitter<void>();
  @Output() manageCategories = new EventEmitter<void>();
  @Output() viewBookings = new EventEmitter<void>();

  readonly actions: QuickActionItem[] = [
    {
      id: 'createEvent',
      title: 'Create Event',
      description: 'Add a new event',
      icon: 'create-event'
    },
    {
      id: 'manageVenues',
      title: 'Add Venue',
      description: 'Create a new venue',
      icon: 'manage-venues'
    },
    {
      id: 'manageCategories',
      title: 'Add Category',
      description: 'Create event category',
      icon: 'manage-categories'
    },
    {
      id: 'viewBookings',
      title: 'View Bookings',
      description: 'Manage customer bookings',
      icon: 'view-bookings'
    }
  ];

  onAction(id: QuickActionId): void {
    switch (id) {
      case 'createEvent':
        this.createEvent.emit();
        break;
      case 'manageVenues':
        this.manageVenues.emit();
        break;
      case 'manageCategories':
        this.manageCategories.emit();
        break;
      case 'viewBookings':
        this.viewBookings.emit();
        break;
    }
  }
}
