import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoogleMapsModule } from '@angular/google-maps';

import { Match } from '../../../core/models/match.model';
import { MatchService } from '../../../core/services/match.service';
import { AuthService } from '../../../core/auth/auth.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatProgressBarModule, MatChipsModule,
    GoogleMapsModule
  ],
  template: `
    <div class="page-container luxury-bg min-h-screen" *ngIf="match; else loadingTpl">
      
      <!-- Premium Sticky Header -->
      <div class="glass-header">
        <button mat-icon-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back_ios</mat-icon>
        </button>
        <div class="status-pill-container">
          <span class="status-pill" [class]="'status-' + match.status.toLowerCase()">{{ match.status }}</span>
        </div>
        <button mat-icon-button (click)="share()" class="action-btn">
          <mat-icon [class.text-primary]="match.sport === 'Cricket'">share</mat-icon>
        </button>
      </div>

      <!-- Map View (Glassy Overlap) -->
      <div class="map-section animate-fade-in-up">
        <google-map 
          height="100%" 
          width="100%" 
          [center]="{lat: match.latitude, lng: match.longitude}"
          [zoom]="15"
          [options]="mapOptions">
          <map-marker [position]="{lat: match.latitude, lng: match.longitude}"></map-marker>
        </google-map>
      </div>

      <!-- Detail Card -->
      <div class="detail-card glass-card card-stagger animate-fade-in-up">
        <div class="match-header">
          <div class="sport-badge">
            {{ getEmoji(match.sport) }} {{ match.sport }}
          </div>
          <h1>{{ match.locationName }}</h1>
          <p class="description" *ngIf="match.description">{{ match.description }}</p>
        </div>

        <!-- Venue & Time Grid -->
        <div class="info-grid">
          <div class="info-item">
            <div class="i-icon time"><mat-icon>event</mat-icon></div>
            <div class="i-val">
              <span class="lab">Date & Time</span>
              <span class="val">{{ formatDate(match.dateTime) }}</span>
            </div>
          </div>
          <div class="info-item">
            <div class="i-icon cost"><mat-icon>payments</mat-icon></div>
            <div class="i-val">
              <span class="lab">Entry Fee</span>
              <span class="val">{{ match.costPerPlayer === 0 ? 'FREE' : '₹' + match.costPerPlayer }}</span>
            </div>
          </div>
        </div>

        <!-- Team Challenge Section -->
        <div class="challenge-section" *ngIf="match.isTeamChallenge">
          <div class="vs-layout">
            <div class="team-side left">
              <div class="team-name">{{ match.teamAName }}</div>
              <div class="player-count">{{ match.teamAPlayers.length }} Players Joined</div>
              <div class="player-avatars">
                <div class="avatar-mini" *ngFor="let p of match.teamAPlayers.slice(0, 4)">👤</div>
              </div>
              <button class="join-team-btn btn-a" *ngIf="!isJoined" (click)="joinWithCode('A', match.teamACode!)">
                Join {{ match.teamAName }}
              </button>
            </div>

            <div class="vs-divider">
              <span class="vs-circle">VS</span>
            </div>

            <div class="team-side right">
              <div class="team-name">{{ match.teamBName }}</div>
              <div class="player-count">{{ match.teamBPlayers.length }} Players Joined</div>
              <div class="player-avatars">
                <div class="avatar-mini" *ngFor="let p of match.teamBPlayers.slice(0, 4)">👤</div>
              </div>
              <button class="join-team-btn btn-b" *ngIf="!isJoined" (click)="joinWithCode('B', match.teamBCode!)">
                Join {{ match.teamBName }}
              </button>
            </div>
          </div>
        </div>

        <!-- Casual Progress -->
        <div class="casual-progress" *ngIf="!match.isTeamChallenge">
          <div class="progress-meta">
            <span class="p-lab">Players Joined</span>
            <span class="p-count">{{ match.playersJoinedCount }} / {{ match.totalPlayers }}</span>
          </div>
          <mat-progress-bar mode="determinate" [value]="(match.playersJoinedCount / match.totalPlayers) * 100" class="premium-bar"></mat-progress-bar>
        </div>

        <!-- Host Info -->
        <div class="host-info">
          <div class="h-avatar">👤</div>
          <div class="h-text">
            <span class="h-name">{{ match.creatorName }}</span>
            <span class="h-label">Host & Organizer</span>
          </div>
          <div class="h-skill luxury-badge">{{ match.skillLevel }}</div>
        </div>
      </div>

      <!-- Bottom Actions -->
      <div class="bottom-actions" *ngIf="match.status === 'OPEN' || isJoined">
        <button class="primary-action-btn" *ngIf="!isJoined && !match.isTeamChallenge" (click)="joinMatch()">
          <mat-icon>bolt</mat-icon> Join Activity
        </button>

        <button class="leave-btn" *ngIf="isJoined && match.createdBy !== userId" (click)="leaveMatch()">
          <mat-icon>logout</mat-icon> Leave Match
        </button>

        <div class="creator-badge" *ngIf="isJoined && match.createdBy === userId">
          <mat-icon>emoji_events</mat-icon> YOU ARE THE HOST
        </div>
      </div>
    </div>

    <!-- Spinner -->
    <ng-template #loadingTpl>
      <div class="loading-container luxury-bg min-h-screen">
        <div class="loader-ripple"></div>
      </div>
    </ng-template>
  `,
  styles: [`
    .luxury-bg { background: #0F172A; color: white; }

    .glass-header {
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(20px);
      padding: 60px 20px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
    }

    .back-btn { color: white; }
    .status-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 6px 16px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .status-open { color: var(--primary); border-color: rgba(74, 222, 128, 0.3); }

    .map-section {
      height: 45vh;
      width: 100%;
    }

    .detail-card {
      margin-top: -60px;
      position: relative;
      background: rgba(15, 23, 42, 0.8) !important;
      backdrop-filter: blur(30px) !important;
      border-radius: 40px 40px 0 0 !important;
      padding: 40px 24px 120px !important;
      min-height: 55vh;
      border: 1px solid rgba(255, 255, 255, 0.05) !important;
    }

    .sport-badge {
      background: rgba(74, 222, 128, 0.1);
      color: var(--primary);
      padding: 6px 12px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 800;
      width: fit-content;
      margin-bottom: 20px;
    }

    h1 { font-size: 28px; font-weight: 800; margin: 0 0 10px; letter-spacing: -0.5px; }
    .description { color: var(--text-muted); font-size: 14px; line-height: 1.6; }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 30px 0;
    }

    .info-item { display: flex; align-items: center; gap: 12px; }
    .i-icon {
      width: 44px; height: 44px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.03);
    }
    .i-icon.time { color: #3B82F6; }
    .i-icon.cost { color: #4ADE80; }
    
    .i-val { display: flex; flex-direction: column; }
    .lab { font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
    .val { font-size: 13px; font-weight: 700; }

    /* Challenge Visuals */
    .challenge-section { margin-top: 30px; }
    .vs-layout { display: flex; align-items: center; gap: 12px; position: relative; }
    .team-side {
      flex: 1;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 20px 12px;
      text-align: center;
    }
    .team-name { font-weight: 800; font-size: 16px; margin-bottom: 4px; }
    .player-count { font-size: 11px; color: var(--text-muted); margin-bottom: 12px; }
    .player-avatars { display: flex; justify-content: center; gap: -5px; margin-bottom: 15px; }
    .avatar-mini { width: 20px; height: 20px; background: #334155; border-radius: 50%; border: 2px solid #0F172A; font-size: 10px; }

    .join-team-btn {
      width: 100%; height: 36px;
      border: none; border-radius: 12px;
      font-size: 12px; font-weight: 700; cursor: pointer;
    }
    .btn-a { background: var(--primary); color: #0F172A; }
    .btn-b { background: #3B82F6; color: white; }

    .vs-circle {
      width: 36px; height: 36px;
      background: #0F172A;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-style: italic; color: var(--text-muted);
      font-size: 12px;
    }

    /* Casual View */
    .casual-progress { margin-top: 30px; }
    .progress-meta { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .p-lab { font-weight: 700; font-size: 12px; text-transform: uppercase; color: var(--text-muted); }
    .p-count { color: var(--primary); font-weight: 800; }
    .premium-bar { height: 10px !important; border-radius: 5px; }

    /* Host info */
    .host-info {
       margin-top: 40px;
       display: flex; align-items: center; gap: 16px;
       background: rgba(255,255,255,0.02);
       padding: 16px; border-radius: 18px;
    }
    .h-avatar { width: 44px; height: 44px; background: #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .h-text { flex: 1; display: flex; flex-direction: column; }
    .h-name { font-weight: 700; font-size: 15px; }
    .h-label { font-size: 11px; color: var(--text-muted); }
    .luxury-badge { background: rgba(74, 222, 128, 0.1); color: var(--primary); padding: 4px 10px; border-radius: 100px; font-size: 10px; font-weight: 800; }

    /* Actions */
    .bottom-actions {
      position: fixed; bottom: 30px; left: 24px; right: 24px; z-index: 200;
    }
    .primary-action-btn {
      width: 100%; height: 60px;
      background: var(--primary); color: #0F172A;
      border: none; border-radius: 18px;
      font-weight: 800; font-size: 16px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 10px 25px -5px rgba(74, 222, 128, 0.4);
    }
    .leave-btn {
      width: 100%; height: 50px;
      background: rgba(248, 113, 113, 0.1); color: #F87171;
      border: 1px solid rgba(248, 113, 113, 0.2); border-radius: 14px;
      font-weight: 700; cursor: pointer;
    }
    .creator-badge {
      text-align: center; color: var(--primary); font-weight: 800; font-size: 12px; 
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }

    .loading-container { display: flex; align-items: center; justify-content: center; }
  `]
})
export class MatchDetailComponent implements OnInit, OnDestroy {
  match: Match | null = null;
  userId = '';
  isJoined = false;
  actionLoading = false;
  
  mapOptions: google.maps.MapOptions = {
    disableDefaultUI: true,
    styles: [
      { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
      { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
    ]
  };

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchService: MatchService,
    private authService: AuthService,
    private wsService: WebSocketService,
    private snackBar: MatSnackBar
  ) {
    this.userId = this.authService.getUserId() || '';
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMatch(id);
      
      this.wsService.watchMatch(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(update => {
          if (update.event === 'MATCH_JOINED' || update.event === 'MATCH_LEFT') {
            this.match = update.match;
            this.updateLocalState();
          }
      });
    }
  }

  loadMatch(id: string) {
    this.matchService.getMatch(id).subscribe({
      next: (data) => {
        this.match = data;
        this.updateLocalState();
      },
      error: () => {
        this.snackBar.open('Match not found', 'Close', { duration: 3000 });
        this.router.navigate(['/matches']);
      }
    });
  }

  updateLocalState() {
    if (!this.match) return;
    this.isJoined = this.match.playersJoined.includes(this.userId);
  }

  joinMatch() {
    if (!this.match) return;
    this.actionLoading = true;
    this.matchService.joinMatch(this.match.id).subscribe({
      next: (m) => {
        this.actionLoading = false;
        this.match = m;
        this.updateLocalState();
        this.snackBar.open('Joined match! ⚡', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.actionLoading = false;
        this.snackBar.open(err.error?.error || 'Failed to join', 'Close', { duration: 3000 });
      }
    });
  }

  joinWithCode(team: 'A' | 'B', code: string) {
    if (!this.match) return;
    this.matchService.joinTeamByCode(this.match.id, team, code).subscribe({
      next: (m) => {
        this.match = m;
        this.updateLocalState();
        this.snackBar.open('Joined team! 🏆', 'Close', { duration: 2000 });
      },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed to join team', 'Close', { duration: 3000 })
    });
  }

  leaveMatch() {
    if (!this.match) return;
    this.actionLoading = true;
    this.matchService.leaveMatch(this.match.id).subscribe({
      next: (m) => {
        this.actionLoading = false;
        this.match = m;
        this.updateLocalState();
        this.snackBar.open('Left match', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.actionLoading = false;
        this.snackBar.open(err.error?.error || 'Failed to leave', 'Close', { duration: 3000 });
      }
    });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getEmoji(sport: string): string {
    const emojis: { [key: string]: string } = {
      'Cricket': '🏏', 'Football': '⚽', 'Tennis': '🎾',
      'Basketball': '🏀', 'Table Tennis': '🏓', 'Badminton': '🏸',
      'Pickleball': '🥒'
    };
    return emojis[sport] || '🏆';
  }

  goBack() { this.router.navigate(['/matches']); }

  share() {
    const text = `Join this ${this.match?.sport} match at ${this.match?.locationName}`;
    if (navigator.share) {
      navigator.share({ title: 'CrickX Match', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Link copied!', 'Close', { duration: 2000 });
    }
  }

  ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
}
