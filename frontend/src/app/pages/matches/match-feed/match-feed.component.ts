import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Match } from '../../../core/models/match.model';
import { MatchService } from '../../../core/services/match.service';
import { LocationService } from '../../../core/services/location.service';
import { AuthService } from '../../../core/auth/auth.service';
import { MatchCardComponent } from '../../../shared/components/match-card/match-card.component';
import { Subject } from 'rxjs';

import { SUPPORTED_SPORTS, Sport } from '../../../core/models/sport.model';

@Component({
  selector: 'app-match-feed',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MatButtonModule, MatchCardComponent
  ],
  template: `
    <div class="feed-page">
      <!-- Header -->
      <header class="feed-header animate-fade-in-up">
        <div class="header-row">
          <div class="location-block">
            <mat-icon class="loc-icon">near_me</mat-icon>
            <div class="loc-text">
              <span class="loc-label">Playing at</span>
              <span class="loc-name">{{ locationName || 'Detecting...' }}</span>
            </div>
          </div>
        </div>

        <!-- Sport Scroller -->
        <div class="sport-strip">
          <button
            *ngFor="let sport of sports; trackBy: trackSport"
            class="sport-chip"
            [class.selected]="selectedSport === sport.name"
            (click)="selectSport(sport.name)">
            <span class="chip-emoji">{{ getEmoji(sport.name) }}</span>
            <span class="chip-name">{{ sport.name }}</span>
          </button>
        </div>
      </header>

      <!-- Filters & Main Area -->
      <div class="content-area">
        <div class="filter-row animate-fade-in-up" [style.animation-delay]="'100ms'">
          <div class="search-input">
            <mat-icon>search</mat-icon>
            <input type="text" placeholder="Search venues or matches..." [(ngModel)]="searchQuery">
          </div>
          <div class="type-pills">
            <button class="pill" [class.active]="selectedType === 'all'" (click)="setType('all')">All</button>
            <button class="pill" [class.active]="selectedType === 'CHALLENGE'" (click)="setType('CHALLENGE')">
              <mat-icon>emoji_events</mat-icon> Challenges
            </button>
            <button class="pill" [class.active]="selectedType === 'CASUAL'" (click)="setType('CASUAL')">Casual</button>
          </div>
        </div>

        <div class="proximity-filter animate-fade-in-up" [style.animation-delay]="'200ms'">
          <div class="filter-header">
            <span class="label">Finding within <span class="highlight">{{ radius }}km</span></span>
            <mat-icon>radar</mat-icon>
          </div>
          <input 
            type="range" 
            min="2" 
            max="50" 
            step="1" 
            [(ngModel)]="radius" 
            (change)="loadMatches()"
            class="radius-slider">
          <div class="slider-labels">
            <span>2km</span>
            <span>25km</span>
            <span>50km</span>
          </div>
        </div>

        <!-- Result Section -->
        <div class="match-list-container" *ngIf="!loading; else skeleton">
          <div class="match-grid" *ngIf="filteredMatches().length > 0">
            <app-match-card
              *ngFor="let match of filteredMatches(); trackBy: trackMatch"
              [match]="match"
              [isJoined]="isUserJoined(match)"
              (joinMatch)="joinMatch($event)"
              (leaveMatch)="leaveMatch($event)"
              (cardClick)="goToDetail($event.id)">
            </app-match-card>
          </div>

          <!-- Empty State (Exactly matches Challenges component layout) -->
          <div class="empty-state animate-fade-in" *ngIf="filteredMatches().length === 0">
            <div class="empty-icon-box">
              <mat-icon>sports_cricket</mat-icon>
            </div>
            <h3>No {{ selectedSport === 'All' ? 'matches' : selectedSport + ' matches' }} nearby</h3>
            <p>Be the first to host an exciting match in your area!</p>
            <button class="cta-reg-btn mt-4" (click)="createMatch()">
              <mat-icon>add</mat-icon> Host Match
            </button>
          </div>
        </div>
      </div>

      <!-- Skeleton -->
      <ng-template #skeleton>
        <div class="skeleton-grid">
          <div class="skeleton-card" *ngFor="let i of [1,2,3]"></div>
        </div>
      </ng-template>

      <!-- Expandable FAB Menu -->
      <div class="fab-wrapper" [class.active]="fabActive">
        <div class="fab-options">
          <button class="fab-mini" (click)="issueChallenge(); $event.stopPropagation()">
            <span class="fab-label">Issue Challenge</span>
            <mat-icon>emoji_events</mat-icon>
          </button>
          <button class="fab-mini" (click)="hostMatch(); $event.stopPropagation()">
            <span class="fab-label">Host Match</span>
            <mat-icon>sports_cricket</mat-icon>
          </button>
        </div>
        <button class="fab-main" (click)="toggleFab()">
          <mat-icon [class.rotate]="fabActive">{{ fabActive ? 'close' : 'add' }}</mat-icon>
          <span *ngIf="!fabActive">Host</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .feed-page {
      min-height: 100vh;
      background: var(--bg-primary);
      color: white;
      padding-bottom: 100px;
    }

    /* Header */
    .feed-header {
      padding: 24px 24px 0;
      border-bottom: 1px solid rgba(255,255,255,0.04);
    }

    .header-row {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 20px;
    }

    .location-block {
      display: flex; align-items: center; gap: 10px;
    }
    .loc-icon { color: var(--primary); font-size: 22px; width: 22px; height: 22px; }
    .loc-text { display: flex; flex-direction: column; }
    .loc-label { font-size: 11px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
    .loc-name { font-size: 16px; font-weight: 700; }

    /* Sport Strip */
    .sport-strip {
      display: flex; gap: 8px; overflow-x: auto; padding-bottom: 16px;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }
    .sport-strip::-webkit-scrollbar { display: none; }

    .sport-chip {
      flex-shrink: 0;
      display: flex; align-items: center; gap: 6px;
      padding: 8px 16px; border-radius: 100px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      color: var(--text-muted);
      font-size: 13px; font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
      white-space: nowrap;
    }
    .sport-chip:hover { background: rgba(255,255,255,0.06); color: white; }
    .sport-chip.selected {
      background: rgba(74,222,128,0.12);
      border-color: rgba(74,222,128,0.3);
      color: var(--primary);
    }
    .chip-emoji { font-size: 16px; }
    .chip-name { font-size: 13px; }

    /* Content */
    .content-area { padding: 24px; }

    .filter-row {
      display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px;
    }

    .search-input {
      display: flex; align-items: center; gap: 10px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 12px;
      padding: 0 16px; height: 48px;
    }
    .search-input mat-icon { color: var(--text-muted); font-size: 20px; width: 20px; height: 20px; }
    .search-input input {
      background: none; border: none; color: white; outline: none; flex: 1;
      font-size: 14px; font-family: inherit;
    }
    .search-input input::placeholder { color: var(--text-muted); }

    .type-pills { display: flex; gap: 8px; }
    .pill {
      display: flex; align-items: center; gap: 4px;
      padding: 6px 14px; border-radius: 100px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      color: var(--text-muted); font-size: 12px; font-weight: 600;
      cursor: pointer;
      transition: background 0.15s ease, color 0.15s ease;
    }
    .pill mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .pill.active { background: var(--primary); color: #0F172A; border-color: var(--primary); }

    /* Grid */
    .match-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }

    /* Empty State */
    .empty-state { text-align: center; padding: 100px 20px; }
    .empty-icon-box {
      width: 84px; height: 84px; margin: 0 auto 20px;
      background: rgba(74,222,128,0.06); border-radius: 24px;
      display: flex; align-items: center; justify-content: center;
      transform: rotate(-12deg);
      border: 1px solid rgba(74,222,128,0.1);
    }
    .empty-icon-box mat-icon { font-size: 42px; width: 42px; height: 42px; color: var(--primary); }
    .empty-state h2 { font-size: 20px; font-weight: 800; margin-bottom: 8px; }
    .empty-state p { color: var(--text-muted); font-size: 15px; margin-bottom: 24px; }
    .cta-reg-btn {
      display: inline-flex; align-items: center; gap: 10px;
      background: var(--primary); color: #0F172A; border: none;
      padding: 14px 28px; border-radius: 14px;
      font-weight: 800; font-size: 15px; cursor: pointer;
      box-shadow: 0 10px 25px rgba(74,222,128,0.25);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .cta-reg-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 30px rgba(74,222,128,0.35); }
    .mt-4 { margin-top: 24px; }

    /* Skeleton */
    .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(360px, 1fr)); gap: 20px; padding: 24px; }
    .skeleton-card {
      height: 180px; border-radius: 16px;
      background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.2s ease infinite;
    }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    /* Expandable FAB */
    .fab-wrapper {
      position: fixed; bottom: 88px; right: 24px; z-index: 999;
      display: flex; flex-direction: column; align-items: flex-end; gap: 12px;
    }
    .fab-options {
      display: flex; flex-direction: column; align-items: flex-end; gap: 12px;
      opacity: 0; pointer-events: none; transform: translateY(20px);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .fab-wrapper.active .fab-options { opacity: 1; pointer-events: auto; transform: translateY(0); }
    
    .fab-mini {
      display: flex; align-items: center; gap: 10px;
      background: #1E293B; color: white; border: 1px solid rgba(255,255,255,0.1);
      padding: 10px 16px; border-radius: 12px; font-weight: 600; font-size: 13px;
      cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.2s;
    }
    .fab-mini:hover { background: #334155; transform: scale(1.05); }
    .fab-mini mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--primary); }
    
    .fab-main {
      display: flex; align-items: center; gap: 8px;
      background: var(--primary); color: #0F172A; border: none;
      padding: 14px 22px; border-radius: 16px;
      font-weight: 800; font-size: 15px;
      box-shadow: 0 8px 24px rgba(74,222,128,0.3);
      cursor: pointer; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .fab-main mat-icon { font-size: 24px; width: 24px; height: 24px; transition: transform 0.3s; }
    .fab-main mat-icon.rotate { transform: rotate(45deg); }
    .fab-main:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(74,222,128,0.4); }

    /* Proximity Slider */
    .proximity-filter {
      margin-bottom: 32px;
      background: rgba(255,255,255,0.03);
      padding: 16px; border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .filter-header .label { font-size: 13px; color: var(--text-muted); font-weight: 600; }
    .filter-header .highlight { color: var(--primary); font-size: 15px; }
    .filter-header mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--text-muted); opacity: 0.5; }
    
    .radius-slider {
      width: 100%; height: 6px; -webkit-appearance: none;
      background: rgba(255,255,255,0.1); border-radius: 3px; outline: none;
    }
    .radius-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 20px; height: 20px;
      background: var(--primary); border-radius: 50%; cursor: pointer;
      box-shadow: 0 0 10px rgba(74, 222, 128, 0.4);
    }
    .slider-labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 10px; color: var(--text-muted); font-weight: 700; }

    /* Desktop */
    @media (min-width: 1024px) {
      .feed-header { padding: 32px 48px 0; }
      .content-area { padding: 24px 48px; }
      .filter-row { flex-direction: row; align-items: center; justify-content: space-between; }
      .search-input { max-width: 400px; }
      .fab { bottom: 32px; right: 32px; }
      .skeleton-grid { padding: 24px 48px; }
    }
    @media (max-width: 480px) {
      .match-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class MatchFeedComponent implements OnInit, OnDestroy {
  matches: Match[] = [];
  radius = 15;
  selectedType = 'all';
  selectedSport = 'All';
  searchQuery = '';
  loading = true;
  locationName = 'Detecting...';
  userId = '';
  sports: Sport[] = SUPPORTED_SPORTS;
  
  private destroy$ = new Subject<void>();
  private currentLat = 19.076;
  private currentLng = 72.8777;

  constructor(
    private matchService: MatchService,
    private locationService: LocationService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userId = this.authService.getUserId() || '';
  }

  ngOnInit() {
    // Start loading immediately with default location
    this.loadMatches();

    this.locationService.getCurrentLocation().then(loc => {
      this.currentLat = loc.latitude;
      this.currentLng = loc.longitude;
      this.locationName = loc.locationName || 'Detecting...';
      this.loadMatches();
    }).catch(() => {
      this.locationName = 'Mumbai';
      this.loadMatches();
    });
  }

  filteredMatches(): Match[] {
    if (!this.searchQuery) return this.matches;
    const q = this.searchQuery.toLowerCase();
    return this.matches.filter(m => 
      m.locationName?.toLowerCase().includes(q) || 
      m.creatorName?.toLowerCase().includes(q) ||
      m.sport?.toLowerCase().includes(q)
    );
  }

  trackSport(index: number, sport: Sport): string {
    return sport.name;
  }

  trackMatch(index: number, match: Match): string {
    return match.id;
  }

  getEmoji(sport: string): string {
    const emojis: { [key: string]: string } = {
      'All': '🏠', 'Cricket': '🏏', 'Football': '⚽', 'Tennis': '🎾',
      'Basketball': '🏀', 'Table Tennis': '🏓', 'Badminton': '🏸', 'Pickleball': '🥒'
    };
    return emojis[sport] || '🏆';
  }

  loadMatches() {
    this.loading = true;
    this.matchService.getNearbyMatches(
      this.currentLng, this.currentLat, this.radius,
      undefined, this.selectedType === 'all' ? undefined : this.selectedType,
      undefined, this.selectedSport !== 'All' ? this.selectedSport : undefined
    ).subscribe({
      next: (data) => {
        this.matches = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load matches', 'Close', { duration: 3000 });
      }
    });
  }

  isUserJoined(match: Match): boolean {
    return match.playersJoined?.includes(this.userId) || false;
  }

  selectSport(name: string) {
    this.selectedSport = name;
    this.loadMatches();
  }

  setType(type: string) {
    this.selectedType = type;
    this.loadMatches();
  }

  joinMatch(id: string) {
    this.matchService.joinMatch(id).subscribe({
      next: (m) => {
        this.snackBar.open('Joined! ⚡', 'Close', { duration: 2000 });
        const idx = this.matches.findIndex(x => x.id === id);
        if (idx !== -1) this.matches[idx] = m;
      },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed to join', 'Close', { duration: 3000 })
    });
  }

  leaveMatch(id: string) {
    this.matchService.leaveMatch(id).subscribe({
      next: (m) => {
        this.snackBar.open('Left match', 'Close', { duration: 2000 });
        const idx = this.matches.findIndex(x => x.id === id);
        if (idx !== -1) this.matches[idx] = m;
      },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed', 'Close', { duration: 3000 })
    });
  }

  fabActive = false;
  toggleFab() { this.fabActive = !this.fabActive; }
  hostMatch() { this.router.navigate(['/matches/create']); this.fabActive = false; }
  issueChallenge() { this.router.navigate(['/challenges/create']); this.fabActive = false; }

  createMatch() { this.hostMatch(); }
  goToProfile() { this.router.navigate(['/profile']); }
  goToDetail(id: string) { this.router.navigate(['/matches', id]); }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
