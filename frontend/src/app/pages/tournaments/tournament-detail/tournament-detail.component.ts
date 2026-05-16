import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TournamentService, Tournament } from '../../../core/services/tournament.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-tournament-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatSnackBarModule],
  template: `
    <div class="page-container" *ngIf="tournament">
      <a routerLink="/tournaments" class="back-link">
        <mat-icon>arrow_back</mat-icon> Back to Tournaments
      </a>

      <div class="detail-card">
        <div class="card-badge" [class]="'status-' + tournament.status.toLowerCase()">
          {{ tournament.status }}
        </div>

        <div class="detail-header">
          <div class="sport-icon-lg">
            <mat-icon>emoji_events</mat-icon>
          </div>
          <h1>{{ tournament.title }}</h1>
          <span class="admin-label">Organized by {{ tournament.adminName }}</span>
        </div>

        <p class="description">{{ tournament.description }}</p>

        <div class="info-grid">
          <div class="info-item">
            <mat-icon>sports_cricket</mat-icon>
            <div>
              <span class="info-label">Sport</span>
              <span class="info-value">{{ tournament.sport }}</span>
            </div>
          </div>
          <div class="info-item">
            <mat-icon>calendar_today</mat-icon>
            <div>
              <span class="info-label">Date & Time</span>
              <span class="info-value">{{ formatDate(tournament.dateTime) }}</span>
            </div>
          </div>
          <div class="info-item">
            <mat-icon>location_on</mat-icon>
            <div>
              <span class="info-label">Venue</span>
              <span class="info-value">{{ tournament.location }}</span>
            </div>
          </div>
          <div class="info-item">
            <mat-icon>groups</mat-icon>
            <div>
              <span class="info-label">Participants</span>
              <span class="info-value">{{ tournament.joinedPlayers.length }} / {{ tournament.maxTeams }}</span>
            </div>
          </div>
        </div>

        <!-- Prize & Fee Section -->
        <div class="prize-section">
          <div class="prize-box">
            <span class="prize-label">Entry Fee</span>
            <span class="prize-value" [class.free]="tournament.entryFee === 0">
              {{ tournament.entryFee === 0 ? 'FREE' : '₹' + tournament.entryFee }}
            </span>
          </div>
          <div class="prize-box highlight" *ngIf="tournament.prizePool > 0">
            <span class="prize-label">🏆 Prize Pool</span>
            <span class="prize-value gold">₹{{ tournament.prizePool }}</span>
          </div>
        </div>

        <!-- Capacity Bar -->
        <div class="capacity-bar-wrapper">
          <div class="capacity-label">
            <span>Slots Filled</span>
            <span>{{ tournament.joinedPlayers.length }} / {{ tournament.maxTeams }}</span>
          </div>
          <div class="capacity-bar">
            <div class="capacity-fill" [style.width.%]="(tournament.joinedPlayers.length / tournament.maxTeams) * 100"></div>
          </div>
        </div>

        <!-- Actions -->
        <div class="actions">
          <button *ngIf="tournament.status === 'OPEN' && !hasJoined()" class="join-action-btn" (click)="join()">
            <mat-icon>bolt</mat-icon>
            {{ joining ? 'Joining...' : 'Join Tournament' }}
          </button>
          <div *ngIf="hasJoined()" class="joined-notice">
            <mat-icon>check_circle</mat-icon>
            You're registered for this tournament!
          </div>
        </div>
      </div>
    </div>

    <div *ngIf="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading tournament...</p>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 700px;
      margin: 0 auto;
      padding-bottom: 100px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 20px;
      transition: color 0.2s;
    }
    .back-link:hover { color: var(--primary); }
    .back-link mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .detail-card {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 24px;
      padding: 36px;
      position: relative;
    }

    .card-badge {
      position: absolute;
      top: 20px; right: 20px;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .status-open { background: rgba(74,222,128,0.15); color: #4ADE80; }
    .status-ongoing { background: rgba(251,191,36,0.15); color: #FBBF24; }
    .status-completed { background: rgba(96,165,250,0.15); color: #60A5FA; }
    .status-cancelled { background: rgba(248,113,113,0.15); color: #F87171; }

    .detail-header { text-align: center; margin-bottom: 24px; }

    .sport-icon-lg {
      width: 72px; height: 72px;
      background: linear-gradient(135deg, rgba(74,222,128,0.2), rgba(96,165,250,0.15));
      border-radius: 20px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 16px;
    }
    .sport-icon-lg mat-icon { font-size: 36px; width: 36px; height: 36px; color: var(--primary); }

    h1 {
      font-size: 28px;
      font-weight: 800;
      color: white;
      margin: 0 0 4px;
    }
    .admin-label {
      font-size: 13px;
      color: var(--text-muted);
    }

    .description {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.6;
      text-align: center;
      margin-bottom: 28px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background: rgba(255,255,255,0.03);
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.04);
    }
    .info-item mat-icon {
      color: var(--primary);
      font-size: 22px; width: 22px; height: 22px;
    }
    .info-label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: block; }
    .info-value { font-size: 14px; color: white; font-weight: 600; display: block; }

    .prize-section {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    .prize-box {
      flex: 1;
      text-align: center;
      padding: 20px;
      background: rgba(255,255,255,0.03);
      border-radius: 16px;
      border: 1px solid rgba(255,255,255,0.04);
    }
    .prize-box.highlight {
      background: rgba(251,191,36,0.05);
      border-color: rgba(251,191,36,0.15);
    }
    .prize-label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 8px;
      font-weight: 700;
    }
    .prize-value {
      font-size: 28px;
      font-weight: 800;
      color: white;
    }
    .prize-value.free { color: var(--primary); }
    .prize-value.gold { color: #FBBF24; }

    .capacity-bar-wrapper { margin-bottom: 28px; }
    .capacity-label {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 8px;
      font-weight: 600;
    }
    .capacity-bar {
      height: 8px;
      background: rgba(255,255,255,0.06);
      border-radius: 4px;
      overflow: hidden;
    }
    .capacity-fill {
      height: 100%;
      background: var(--gradient-primary);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .actions { text-align: center; }

    .join-action-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 16px 48px;
      background: var(--primary);
      color: #0F172A;
      border: none;
      border-radius: 16px;
      font-weight: 800;
      font-size: 16px;
      cursor: pointer;
      box-shadow: 0 10px 30px rgba(74,222,128,0.3);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .join-action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(74,222,128,0.4);
    }

    .joined-notice {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 16px 32px;
      background: rgba(74,222,128,0.1);
      color: var(--primary);
      border-radius: 16px;
      font-weight: 700;
      font-size: 15px;
      border: 1px solid rgba(74,222,128,0.2);
    }

    .loading-container {
      text-align: center;
      padding: 100px 20px;
      color: var(--text-muted);
    }
    .spinner {
      width: 40px; height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: var(--primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 600px) {
      .info-grid { grid-template-columns: 1fr; }
      .prize-section { flex-direction: column; }
      .detail-card { padding: 24px; }
    }
  `]
})
export class TournamentDetailComponent implements OnInit {
  tournament: Tournament | null = null;
  loading = true;
  joining = false;
  private userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private tournamentService: TournamentService,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.userId = this.authService.getUserId();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tournamentService.getById(id).subscribe({
        next: (t) => {
          this.tournament = t;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.snackBar.open('Tournament not found', 'Close', { duration: 3000 });
        }
      });
    }
  }

  hasJoined(): boolean {
    return this.userId && this.tournament ? this.tournament.joinedPlayers.includes(this.userId) : false;
  }

  join() {
    if (!this.tournament) return;
    this.joining = true;
    this.tournamentService.join(this.tournament.id).subscribe({
      next: (updated) => {
        this.tournament = updated;
        this.joining = false;
        this.snackBar.open('🎉 You\'re in! See you at the tournament!', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.joining = false;
        this.snackBar.open(err.error?.message || 'Failed to join', 'Close', { duration: 3000 });
      }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
