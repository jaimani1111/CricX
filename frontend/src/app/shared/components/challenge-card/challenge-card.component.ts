import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Challenge } from '../../../core/models/challenge.model';
import { SUPPORTED_SPORTS } from '../../../core/models/sport.model';

@Component({
  selector: 'app-challenge-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="challenge-card card-stagger animate-fade-in-up">
      <div class="card-header">
        <div class="format-badge">⚔️ {{ formatLabel(challenge.format) }}</div>
        <div class="status-badge" [ngClass]="'status-' + challenge.status.toLowerCase()">
          {{ challenge.status }}
        </div>
      </div>

      <div class="teams-section">
        <div class="team team-a">
          <div class="team-icon">
             <mat-icon>{{ getSportIcon(challenge.sportId) }}</mat-icon>
          </div>
          <div class="team-name">{{ challenge.teamAName }}</div>
        </div>
        <div class="vs">VS</div>
        <div class="team team-b" [class.awaiting]="!challenge.teamBName">
          <div class="team-icon">
            <mat-icon>{{ getSportIcon(challenge.sportId) }}</mat-icon>
          </div>
          <div class="team-name">{{ challenge.teamBName || 'Awaiting...' }}</div>
        </div>
      </div>

      <div class="card-details">
        <div class="detail-item">
          <mat-icon>location_on</mat-icon>
          <span>{{ challenge.locationName }}</span>
        </div>
        <div class="detail-item">
          <mat-icon>schedule</mat-icon>
          <span>{{ formatDate(challenge.dateTime) }}</span>
        </div>
        <div class="detail-item" *ngIf="challenge.distance !== undefined && challenge.distance !== null">
          <mat-icon>near_me</mat-icon>
          <span>{{ challenge.distance }} km away</span>
        </div>
      </div>

      <div class="card-actions" *ngIf="challenge.status === 'OPEN' && !isOwner">
        <button mat-flat-button color="primary" class="accept-btn" (click)="accept.emit(challenge.id)">
          <mat-icon>handshake</mat-icon>
          Accept Challenge
        </button>
      </div>
    </div>
  `,
  styles: [`
    .challenge-card {
      background: var(--gradient-card);
      border: var(--border-subtle);
      border-radius: var(--border-radius-lg);
      padding: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      transition: all var(--transition-base);
    }

    .challenge-card:hover {
      border-color: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--spacing-md);
    }

    .format-badge {
      font-size: var(--font-size-xs);
      font-weight: 600;
      padding: 4px 10px;
      border-radius: 20px;
      background: rgba(139, 92, 246, 0.1);
      color: var(--accent-purple);
    }

    .status-badge {
      font-size: var(--font-size-xs);
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .status-open { background: rgba(0, 200, 83, 0.1); color: var(--status-open); }
    .status-accepted { background: rgba(59, 130, 246, 0.1); color: var(--status-accepted); }
    .status-completed { background: rgba(139, 92, 246, 0.1); color: var(--status-completed); }

    .teams-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-md);
      padding: var(--spacing-md) 0;
    }

    .team {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      flex: 1;
    }

    .team-icon {
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-elevated);
      border-radius: 50%;
      color: var(--accent-orange);
    }

    .team-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .team-name {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--text-primary);
      text-align: center;
    }

    .team.awaiting .team-name {
      color: var(--text-muted);
      font-style: italic;
    }

    .vs {
      font-size: var(--font-size-lg);
      font-weight: 800;
      color: var(--accent-orange);
      text-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
    }

    .card-details {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: var(--spacing-md);
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }

    .detail-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--text-muted);
    }

    .accept-btn {
      width: 100%;
      height: 40px !important;
      border-radius: 12px !important;
      font-weight: 600 !important;
      letter-spacing: 0.03em !important;
    }

    .accept-btn mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }
  `]
})
export class ChallengeCardComponent {
  @Input() challenge!: Challenge;
  @Input() isOwner = false;
  @Output() accept = new EventEmitter<string>();

  getSportIcon(sportId: string): string {
    const sport = SUPPORTED_SPORTS.find(s => s.id === sportId);
    return sport ? sport.icon : 'sports_cricket';
  }

  formatLabel(f: string): string {
    return f.replace(/_/g, ' ').replace('V', 'v');
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    if (d.toDateString() === now.toDateString()) return `Today, ${timeStr}`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + `, ${timeStr}`;
  }
}
