import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DashboardRecommendedEvent } from '../../../../core/models/dashboards/customer-dashboard.model';

@Component({
  selector: 'app-recommended-events',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe],
  templateUrl: './recommended-events.component.html',
  styleUrl: './recommended-events.component.css'
})
export class RecommendedEventsComponent implements OnInit {
  @Input() events: DashboardRecommendedEvent[] = [];
  @Input() isLoading = false;

  wishlistedIds = new Set<number>();

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    try {
      const saved = localStorage.getItem('eventflow_wishlist');
      if (saved) {
        const ids = JSON.parse(saved) as number[];
        this.wishlistedIds = new Set(ids);
      }
    } catch {
      this.wishlistedIds = new Set();
    }
  }

  isWishlisted(id: number): boolean {
    return this.wishlistedIds.has(id);
  }

  toggleWishlist(e: Event, id: number): void {
    e.stopPropagation();
    if (this.wishlistedIds.has(id)) {
      this.wishlistedIds.delete(id);
    } else {
      this.wishlistedIds.add(id);
    }
    try {
      localStorage.setItem('eventflow_wishlist', JSON.stringify(Array.from(this.wishlistedIds)));
    } catch {
      // Ignore storage restrictions
    }
  }
}

