import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TournamentService, Tournament } from '../../../core/services/tournament.service';
import { AuthService } from '../../../core/auth/auth.service';
import { LocationService } from '../../../core/services/location.service';

@Component({
  selector: 'app-tournament-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="page-header">
        <div class="header-content">
          <h1>🏆 Tournaments</h1>
          <p class="subtitle">Compete, win prizes, and rise through the ranks</p>
        </div>
        <a *ngIf="isAdmin()" routerLink="/tournaments/create" class="create-btn">
          <mat-icon>add</mat-icon>
          <span>Create Tournament</span>
        </a>
      </div>

      <!-- Loading -->
      <div *ngIf="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading tournaments...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && tournaments.length === 0" class="empty-state">
        <mat-icon class="empty-icon">emoji_events</mat-icon>
        <h2>No Tournaments Yet</h2>
        <p>Be the first to create a competitive tournament!</p>
      </div>

      <!-- Tournament Cards -->
      <div *ngIf="!loading && tournaments.length > 0" class="tournament-grid">
        <div *ngFor="let t of tournaments" class="tournament-card" (click)="viewTournament(t.id)">
          <div class="card-badge" [class]="'status-' + t.status.toLowerCase()">
            {{ t.status }}
          </div>
          <div class="card-header">
            <div class="sport-icon">
              <mat-icon>{{ getSportIcon(t.sport) }}</mat-icon>
            </div>
            <div class="card-title-area">
              <h3>{{ t.title }}</h3>
              <span class="admin-tag">by {{ t.adminName }}</span>
            </div>
          </div>

          <p class="card-desc">{{ t.description }}</p>

          <div class="card-meta">
            <div class="meta-item">
              <mat-icon>calendar_today</mat-icon>
              <span>{{ formatDate(t.dateTime) }}</span>
            </div>
            <div class="meta-item">
              <mat-icon>location_on</mat-icon>
              <span>{{ t.locationName }}</span>
            </div>
            <div class="meta-item">
              <mat-icon>groups</mat-icon>
              <span>{{ t.joinedPlayers.length }} / {{ t.maxTeams }} joined</span>
            </div>
          </div>

          <div class="card-footer">
            <div class="fee-area">
              <span class="fee-label">Entry Fee</span>
              <span class="fee-amount" [class.free]="t.entryFee === 0">
                {{ t.entryFee === 0 ? 'FREE' : '₹' + t.entryFee }}
              </span>
            </div>
            <div class="prize-area" *ngIf="t.prizePool > 0">
              <span class="prize-label">Prize Pool</span>
              <span class="prize-amount">₹{{ t.prizePool }}</span>
            </div>
            <button class="join-btn" *ngIf="t.status === 'OPEN' && !hasJoined(t)" (click)="joinTournament($event, t)">
              <mat-icon>bolt</mat-icon> Join
            </button>
            <div class="joined-badge" *ngIf="hasJoined(t)">
              <mat-icon>check_circle</mat-icon> Joined
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
      padding-bottom: 100px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
    }

    h1 {
      font-size: 28px;
      font-weight: 800;
      color: white;
      letter-spacing: -0.5px;
      margin: 0;
    }

    .subtitle {
      color: var(--text-muted);
      font-size: 14px;
      margin-top: 4px;
    }

    .create-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: var(--gradient-primary);
      color: #0F172A;
      border-radius: 14px;
      font-weight: 700;
      font-size: 14px;
      text-decoration: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      box-shadow: 0 4px 15px rgba(74, 222, 128, 0.3);
    }
    .create-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(74, 222, 128, 0.4);
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: 80px 20px;
      color: var(--text-muted);
    }
    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(255,255,255,0.1);
      margin-bottom: 16px;
    }
    .empty-state h2 { color: white; margin-bottom: 8px; }

    .spinner {
      width: 40px; height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .tournament-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .tournament-card {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 20px;
      padding: 24px;
      cursor: pointer;
      position: relative;
      transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
    }
    .tournament-card:hover {
      transform: translateY(-4px);
      border-color: rgba(74, 222, 128, 0.2);
      box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    }

    .card-badge {
      position: absolute;
      top: 16px;
      right: 16px;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-open { background: rgba(74,222,128,0.15); color: #4ADE80; }
    .status-ongoing { background: rgba(251,191,36,0.15); color: #FBBF24; }
    .status-completed { background: rgba(96,165,250,0.15); color: #60A5FA; }
    .status-cancelled { background: rgba(248,113,113,0.15); color: #F87171; }

    .card-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 12px;
    }

    .sport-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, rgba(74,222,128,0.15), rgba(96,165,250,0.1));
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sport-icon mat-icon { color: var(--primary); font-size: 24px; }

    .card-title-area h3 {
      font-size: 18px;
      font-weight: 700;
      color: white;
      margin: 0;
      line-height: 1.3;
    }
    .admin-tag {
      font-size: 12px;
      color: var(--text-muted);
    }

    .card-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 16px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .card-meta {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 20px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .meta-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--text-muted);
    }

    .card-footer {
      display: flex;
      align-items: center;
      gap: 16px;
      padding-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    .fee-area, .prize-area {
      display: flex;
      flex-direction: column;
    }
    .fee-label, .prize-label {
      font-size: 10px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 700;
    }
    .fee-amount {
      font-size: 18px;
      font-weight: 800;
      color: white;
    }
    .fee-amount.free { color: var(--primary); }
    .prize-amount {
      font-size: 18px;
      font-weight: 800;
      color: #FBBF24;
    }

    .join-btn {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      background: var(--primary);
      color: #0F172A;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .join-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(74,222,128,0.4);
    }
    .join-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .joined-badge {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--primary);
      font-weight: 700;
      font-size: 14px;
    }
    .joined-badge mat-icon { font-size: 18px; width: 18px; height: 18px; }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; gap: 16px; }
      .tournament-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class TournamentFeedComponent implements OnInit {
  tournaments: Tournament[] = [];
  loading = true;
  private userId: string | null = null;

  constructor(
    private tournamentService: TournamentService,
    private authService: AuthService,
    private locationService: LocationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.userId = this.authService.getUserId();
  }

  ngOnInit() {
    this.loadTournaments();
  }

  loadTournaments() {
    this.loading = true;
    this.locationService.getCurrentLocation().then(loc => {
      this.tournamentService.getNearby(loc.longitude, loc.latitude).subscribe({
        next: (data) => {
          this.tournaments = data;
          this.loading = false;
        },
        error: () => {
          // Fallback to all if nearby fails
          this.tournamentService.getAll().subscribe(all => {
             this.tournaments = all;
             this.loading = false;
          });
        }
      });
    }).catch(() => {
       this.tournamentService.getAll().subscribe(all => {
          this.tournaments = all;
          this.loading = false;
       });
    });
  }

  isAdmin(): boolean {
    const role = this.authService.currentUser()?.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  hasJoined(t: Tournament): boolean {
    return this.userId ? t.joinedPlayers.includes(this.userId) : false;
  }

  joinTournament(event: Event, t: Tournament) {
    event.stopPropagation();
    this.tournamentService.join(t.id).subscribe({
      next: (updated) => {
        const idx = this.tournaments.findIndex(x => x.id === t.id);
        if (idx >= 0) this.tournaments[idx] = updated;
        this.snackBar.open('🎉 Joined tournament!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to join', 'Close', { duration: 3000 });
      }
    });
  }

  viewTournament(id: string) {
    this.router.navigate(['/tournaments', id]);
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    });
  }

  getSportIcon(sport: string): string {
    const map: Record<string, string> = {
      'cricket': 'sports_cricket',
      'football': 'sports_soccer',
      'badminton': 'sports_tennis',
      'basketball': 'sports_basketball'
    };
    return map[sport?.toLowerCase()] || 'emoji_events';
  }
}
