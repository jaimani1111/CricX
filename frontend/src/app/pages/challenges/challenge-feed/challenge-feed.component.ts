import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Challenge } from '../../../core/models/challenge.model';
import { ChallengeService } from '../../../core/services/challenge.service';
import { LocationService } from '../../../core/services/location.service';
import { AuthService } from '../../../core/auth/auth.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { ChallengeCardComponent } from '../../../shared/components/challenge-card/challenge-card.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-challenge-feed',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, ChallengeCardComponent],
  template: `
    <div class="page-container">
      <div class="feed-header animate-fade-in-up">
        <h1>Challenges</h1>
        <p>Find teams to play against or create your own challenge.</p>

        <div class="proximity-filter">
          <div class="filter-header">
            <span>Finding within <span class="highlight">{{ radius }}km</span></span>
            <mat-icon>radar</mat-icon>
          </div>
          <input 
            type="range" 
            min="2" 
            max="50" 
            step="1" 
            [(ngModel)]="radius" 
            (change)="loadChallenges()"
            class="radius-slider">
          <div class="slider-labels">
            <span>2km</span>
            <span>25km</span>
            <span>50km</span>
          </div>
        </div>
      </div>

      <div class="challenges-list" *ngIf="!loading; else skeleton">
        <app-challenge-card
          *ngFor="let c of challenges; let i = index"
          [challenge]="c"
          [isOwner]="c.createdBy === userId"
          (accept)="acceptChallenge($event)"
          [style.animation-delay]="i * 60 + 'ms'">
        </app-challenge-card>

        <div class="empty-state animate-fade-in" *ngIf="challenges.length === 0">
          <mat-icon>emoji_events</mat-icon>
          <h3>No open challenges</h3>
          <p>Be the first to challenge teams in your area!</p>
          <button mat-flat-button color="primary" (click)="createChallenge()">Create Challenge</button>
        </div>
      </div>

      <ng-template #skeleton>
        <div class="matches-list">
          <div class="skeleton match-card-skeleton" *ngFor="let i of [1,2,3]"></div>
        </div>
      </ng-template>

      <button mat-fab color="primary" class="fab-btn" (click)="createChallenge()">
        <mat-icon>add</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .feed-header {
      margin-bottom: var(--spacing-lg);
    }
    .feed-header h1 {
      font-size: var(--font-size-2xl);
      margin-bottom: 4px;
    }
    .feed-header p {
      color: var(--text-secondary);
      font-size: var(--font-size-sm);
    }

    .empty-state {
      text-align: center;
      padding: var(--spacing-2xl) 0;
      color: var(--text-muted);
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: var(--spacing-md);
      color: var(--accent-orange);
      opacity: 0.8;
    }
    .empty-state h3 {
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .match-card-skeleton {
      height: 180px;
      margin-bottom: var(--spacing-md);
    }

    .fab-btn {
      position: fixed;
      bottom: calc(var(--bottom-nav-height) + var(--spacing-md));
      right: var(--spacing-md);
      z-index: 99;
      background: linear-gradient(135deg, #FF6B35 0%, #F59E0B 100%) !important;
    }

    /* Proximity Slider */
    .proximity-filter {
      margin-top: 20px;
      background: rgba(255,107,53,0.06);
      padding: 16px; border-radius: 16px;
      border: 1px solid rgba(255,107,53,0.1);
    }
    .filter-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
    .filter-header span { font-size: 13px; color: var(--text-secondary); font-weight: 600; }
    .filter-header .highlight { color: #FF6B35; font-size: 15px; font-weight: 800; }
    .filter-header mat-icon { font-size: 18px; width: 18px; height: 18px; color: #FF6B35; opacity: 0.6; }
    
    .radius-slider {
      width: 100%; height: 6px; -webkit-appearance: none;
      background: rgba(255,255,255,0.1); border-radius: 3px; outline: none;
    }
    .radius-slider::-webkit-slider-thumb {
      -webkit-appearance: none; width: 22px; height: 22px;
      background: #FF6B35; border-radius: 50%; cursor: pointer;
      box-shadow: 0 0 15px rgba(255, 107, 53, 0.4);
    }
    .slider-labels { display: flex; justify-content: space-between; margin-top: 8px; font-size: 10px; color: var(--text-muted); font-weight: 700; }
  `]
})
export class ChallengeFeedComponent implements OnInit, OnDestroy {
  challenges: Challenge[] = [];
  loading = true;
  userId = '';
  radius = 30;
  
  private destroy$ = new Subject<void>();
  private currentLat = 19.076;
  private currentLng = 72.8777;

  constructor(
    private challengeService: ChallengeService,
    private locationService: LocationService,
    private authService: AuthService,
    private wsService: WebSocketService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userId = this.authService.getUserId() || '';
  }

  async ngOnInit() {
    try {
      const loc = await this.locationService.getCurrentLocation();
      this.currentLat = loc.latitude;
      this.currentLng = loc.longitude;
    } catch {}
    
    this.loadChallenges();

    // Listen for new challenges/accepts
    this.wsService.watchChallenges().pipe(takeUntil(this.destroy$)).subscribe(update => {
      if (update.event === 'CHALLENGE_ACCEPTED') {
        const idx = this.challenges.findIndex(c => c.id === update.challenge.id);
        if (idx !== -1) {
          this.challenges[idx] = update.challenge;
        }
      }
    });
  }

  loadChallenges() {
    this.loading = true;
    this.challengeService.getNearbyChallenges(this.currentLng, this.currentLat, this.radius).subscribe({
      next: (data) => {
        this.challenges = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.snackBar.open('Failed to load challenges', 'Close', { duration: 3000 });
      }
    });
  }

  acceptChallenge(id: string) {
    // In a real app, you might prompt for Team Name here
    const teamName = "Challenger Team";
    this.challengeService.acceptChallenge(id, teamName).subscribe({
      next: (c) => {
        this.snackBar.open('Challenge accepted!', 'Close', { duration: 2000 });
        const idx = this.challenges.findIndex(x => x.id === id);
        if (idx !== -1) this.challenges[idx] = c;
      },
      error: (err) => {
        this.snackBar.open(err.error?.error || 'Failed to accept', 'Close', { duration: 3000 });
      }
    });
  }

  createChallenge() {
    this.router.navigate(['/challenges/create']);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
