import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type QuickActionId =
  | 'createEvent'
  | 'manageEvents'
  | 'manageVenues'
  | 'manageCategories';

export interface QuickActionItem {
  id: QuickActionId;
  title: string;
  description: string;
  icon: 'create-event' | 'manage-events' | 'manage-venues' | 'manage-categories';
}

/**
 * Presentational component for Admin Dashboard Quick Actions.
 * Emits typed events to the parent container for M2 administrative navigation.
 * Matches as-01.png visual styling.
 */
@Component({
  selector: 'app-admin-quick-actions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-quick-actions.component.html',
  styleUrl: './admin-quick-actions.component.css'
})
export class AdminQuickActionsComponent {
  @Output() createEvent = new EventEmitter<void>();
  @Output() manageEvents = new EventEmitter<void>();
  @Output() manageVenues = new EventEmitter<void>();
  @Output() manageCategories = new EventEmitter<void>();

  readonly actions: QuickActionItem[] = [
    {
      id: 'createEvent',
      title: 'Create Event',
      description: 'Add a new event',
      icon: 'create-event'
    },
    {
      id: 'manageEvents',
      title: 'Manage Events',
      description: 'View and manage events',
      icon: 'manage-events'
    },
    {
      id: 'manageVenues',
      title: 'Manage Venues',
      description: 'View and manage venues',
      icon: 'manage-venues'
    },
    {
      id: 'manageCategories',
      title: 'Manage Categories',
      description: 'View and manage event categories',
      icon: 'manage-categories'
    }
  ];

  onAction(id: QuickActionId): void {
    switch (id) {
      case 'createEvent':
        this.createEvent.emit();
        break;
      case 'manageEvents':
        this.manageEvents.emit();
        break;
      case 'manageVenues':
        this.manageVenues.emit();
        break;
      case 'manageCategories':
        this.manageCategories.emit();
        break;
    }
  }
}
