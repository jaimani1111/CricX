import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';

import { User } from '../../../core/models/user.model';
import { PlayerService } from '../../../core/services/player.service';
import { LocationService } from '../../../core/services/location.service';
import { PlayerCardComponent } from '../../../shared/components/player-card/player-card.component';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatSlideToggleModule, PlayerCardComponent],
  template: `
    <div class="page-container luxury-bg min-h-screen">
      <!-- Premium Glass Header -->
      <div class="glass-header">
        <div class="header-content">
          <div class="text-content">
            <h1>Community</h1>
            <p>Connect with players & teams nearby</p>
          </div>
          <div class="availability-card glass-card">
            <span class="a-label">My Status</span>
            <div class="a-toggle">
              <span class="status-text" [class.active]="isAvailable">{{ isAvailable ? 'Visible' : 'Hidden' }}</span>
              <mat-slide-toggle 
                [checked]="isAvailable" 
                (change)="toggleAvailability($event.checked)"
                color="primary">
              </mat-slide-toggle>
            </div>
          </div>
        </div>
      </div>

      <div class="feed-content animate-fade-in-up">
        <!-- Search & Filters -->
        <div class="search-row glass-card">
          <mat-icon>search</mat-icon>
          <input type="text" placeholder="Search by name or skill..." [(ngModel)]="searchQuery">
        </div>

        <!-- Players List -->
        <div class="players-list" *ngIf="!loading; else skeleton">
          <app-player-card
            *ngFor="let p of filteredPlayers(); let i = index"
            [player]="p"
            [style.animation-delay]="i * 50 + 'ms'">
          </app-player-card>

          <!-- Empty State -->
          <div class="empty-state glass-card animate-fade-in" *ngIf="players.length === 0">
            <mat-icon>people_outline</mat-icon>
            <h3>Quiet neighborhood?</h3>
            <p>Be the first to show up! Toggle your availability and let others find you.</p>
          </div>
        </div>
      </div>

      <ng-template #skeleton>
        <div class="skeleton-list">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6]"></div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .luxury-bg { background: #0F172A; color: white; }

    .glass-header {
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(20px);
      padding: 60px 24px 30px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      position: sticky; top: 0; z-index: 100;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 { font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -1px; }
    p { color: var(--text-muted); font-size: 14px; margin-top: 4px; }

    .availability-card {
      padding: 10px 16px !important;
      display: flex; flex-direction: column; gap: 4px;
      min-width: 140px;
    }
    .a-label { font-size: 10px; font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 1px; }
    .a-toggle { display: flex; align-items: center; justify-content: space-between; }
    .status-text { font-size: 12px; font-weight: 700; color: #F87171; }
    .status-text.active { color: var(--primary); }

    .feed-content { padding: 24px; padding-bottom: 120px; }

    .players-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 20px;
    }

    /* Desktop Adjustments */
    @media (min-width: 1024px) {
      .glass-header {
        padding: 40px var(--spacing-xxl) 20px;
        position: static;
        background: transparent;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }
      .feed-content { padding: var(--spacing-xxl); }
      .search-row { max-width: 600px; }
    }

    @media (max-width: 480px) {
      .players-list { grid-template-columns: 1fr; }
      .header-content { flex-direction: column; align-items: flex-start; gap: 16px; }
      .availability-card { width: 100%; }
      h1 { font-size: 28px; }
      .glass-header { padding: 50px 16px 20px; }
    }

    .search-row {
      display: flex; align-items: center; gap: 12px;
      height: 56px; padding: 0 20px !important;
      margin-bottom: 24px;
    }
    .search-row mat-icon { color: var(--text-muted); }
    .search-row input { background: transparent; border: none; color: white; outline: none; flex: 1; font-size: 14px; }

    .empty-state {
      text-align: center; margin-top: 40px; padding: 60px 40px !important;
    }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--primary); margin-bottom: 20px; opacity: 0.2; }
    .empty-state h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .empty-state p { color: var(--text-muted); font-size: 14px; }

    .skeleton-card {
      height: 80px;
      border-radius: 20px;
      background: rgba(255,255,255,0.03);
      margin-bottom: 12px;
      position: relative; overflow: hidden;
    }
    .skeleton-card::after {
      content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.02), transparent);
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `]
})
export class PlayerListComponent implements OnInit {
  players: User[] = [];
  loading = true;
  isAvailable = false;
  searchQuery = '';
  
  private lat = 0;
  private lng = 0;
  private locName = '';

  constructor(
    private playerService: PlayerService,
    private locationService: LocationService,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.checkMyAvailability();
    try {
      const loc = await this.locationService.getCurrentLocation();
      this.lat = loc.latitude;
      this.lng = loc.longitude;
      this.locName = loc.locationName || '';
    } catch {}
    this.loadPlayers();
  }

  checkMyAvailability() {
    this.playerService.getMyProfile().subscribe(user => {
      this.isAvailable = user.available;
    });
  }

  loadPlayers() {
    this.loading = true;
    this.playerService.getNearbyPlayers(this.lng, this.lat, 20).subscribe({
      next: (data) => {
        this.players = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  filteredPlayers() {
    if (!this.searchQuery) return this.players;
    const q = this.searchQuery.toLowerCase();
    return this.players.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.skill && p.skill.toLowerCase().includes(q))
    );
  }

  toggleAvailability(checked: boolean) {
    this.isAvailable = checked;
    this.playerService.setAvailability(checked, this.lng, this.lat, this.locName).subscribe({
      next: () => {
        const msg = checked ? 'You are now visible to nearby players' : 'You are now hidden';
        this.snackBar.open(msg, 'Close', { duration: 3000 });
      },
      error: () => {
        this.isAvailable = !checked;
        this.snackBar.open('Failed to update availability', 'Close', { duration: 3000 });
      }
    });
  }
}
