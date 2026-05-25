import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Match } from '../../../core/models/match.model';

@Component({
  selector: 'app-match-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressBarModule],
  template: `
    <div class="match-card card-stagger animate-fade-in-up" (click)="cardClick.emit(match)">
      
      <!-- Top Timer Strip -->
      <div class="timer-strip" *ngIf="timeUntilStart">
        <mat-icon>timer</mat-icon>
        <span>{{ timeUntilStart }}</span>
      </div>

      <!-- Header with Sport & Type -->
      <div class="card-header">
        <div class="sport-chip">
          <span class="sport-icon">{{ getSportIcon(match.sport) }}</span>
          <span class="sport-name">{{ match.sport }}</span>
        </div>
        <div class="match-type-badge" [class]="match.isTeamChallenge ? 'badge-challenge' : 'badge-casual'">
          {{ match.isTeamChallenge ? '🏆 Team Challenge' : '🏏 Casual Match' }}
        </div>
      </div>

      <!-- Teams View (for Challenges) -->
      <div class="teams-container" *ngIf="match.isTeamChallenge">
        <div class="team-slot team-a">
          <div class="team-name">{{ match.teamAName || 'Team A' }}</div>
          <div class="player-stack">
            <span class="count">{{ match.teamAPlayers?.length || 0 }}</span>
            <span class="limit">/ {{ match.totalPlayers / 2 }}</span>
          </div>
        </div>
        <div class="vs-divider">VS</div>
        <div class="team-slot team-b">
          <div class="team-name">{{ match.teamBName || 'Team B' }}</div>
          <div class="player-stack">
            <span class="count">{{ match.teamBPlayers?.length || 0 }}</span>
            <span class="limit">/ {{ match.totalPlayers / 2 }}</span>
          </div>
        </div>
      </div>

      <!-- standard View (for Casual) -->
      <div class="casual-view" *ngIf="!match.isTeamChallenge">
        <div class="card-location">
          <mat-icon>location_on</mat-icon>
          <span>{{ match.locationName }}</span>
        </div>
        <div class="players-progress">
          <div class="progress-info">
            <span>{{ match.playersJoinedCount }} joined / {{ match.totalPlayers }} slots</span>
            <span class="slots-pill" [class.urgent]="match.playersNeeded <= 2">
              {{ match.playersNeeded }} left
            </span>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" [style.width.%]="(match.playersJoinedCount / match.totalPlayers) * 100"></div>
          </div>
        </div>
      </div>

      <!-- Bottom Info Row -->
      <div class="card-bottom">
        <div class="info-item">
          <mat-icon>schedule</mat-icon>
          <span>{{ formatDate(match.dateTime) }}</span>
        </div>
        <div class="info-item cost" *ngIf="match.costPerPlayer > 0">
          <span class="currency">₹</span>
          <span class="amount">{{ match.costPerPlayer }}</span>
        </div>
        <div class="info-item free" *ngIf="match.costPerPlayer === 0">FREE</div>
        
        <button class="join-action-btn" *ngIf="!isJoined && match.playersNeeded > 0" (click)="onJoin($event)">
          Join Now
        </button>
        <div class="joined-status" *ngIf="isJoined">
          <mat-icon>verified</mat-icon>
          <span>Joined</span>
        </div>
      </div>

      <!-- Distance Overlay -->
      <div class="distance-tag" *ngIf="match.distance">
        {{ match.distance }} km away
      </div>
    </div>
  `,
  styles: [`
    .match-card {
      background: rgba(20, 27, 40, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 20px;
      cursor: pointer;
      position: relative;
      transition: transform 0.2s ease, border-color 0.2s ease;
      overflow: hidden;
    }

    .match-card:hover {
      transform: translateY(-2px);
      border-color: rgba(74, 222, 128, 0.3);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .timer-strip {
      background: rgba(255, 107, 53, 0.1);
      color: #FF6B35;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .timer-strip mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .sport-chip {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.05);
      padding: 6px 12px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .sport-icon { font-size: 18px; }
    .sport-name {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-primary);
      text-transform: capitalize;
    }

    .match-type-badge {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 8px;
      letter-spacing: 0.5px;
    }

    .badge-casual { background: rgba(74, 222, 128, 0.15); color: #4ADE80; }
    .badge-challenge { background: rgba(248, 113, 113, 0.15); color: #F87171; }

    /* Teams View */
    .teams-container {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 15px 0;
      margin-bottom: 15px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: 12px;
    }

    .team-slot {
      flex: 1;
      text-align: center;
      padding: 0 10px;
    }

    .team-name {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .player-stack {
      display: flex;
      justify-content: center;
      align-items: baseline;
      gap: 3px;
    }

    .player-stack .count { font-size: 18px; font-weight: 800; color: var(--primary); }
    .player-stack .limit { font-size: 12px; color: var(--text-muted); }

    .vs-divider {
      font-style: italic;
      font-weight: 900;
      color: var(--text-muted);
      opacity: 0.5;
      padding: 0 15px;
    }

    /* Casual View */
    .card-location {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--text-primary);
      font-size: 15px;
      font-weight: 600;
      margin-bottom: 15px;
    }

    .card-location mat-icon { font-size: 18px; width: 18px; height: 18px; color: var(--primary); }

    .players-progress { margin-bottom: 20px; }
    .progress-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .slots-pill {
      background: rgba(74, 222, 128, 0.1);
      color: var(--primary);
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 700;
    }

    .slots-pill.urgent { background: rgba(248, 113, 113, 0.1); color: #F87171; }

    .progress-bar-bg {
      height: 6px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
      overflow: hidden;
    }

    .progress-bar-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--primary), #86EFAC);
      border-radius: 3px;
      transition: width 0.6s ease-out;
    }

    /* Bottom Info Row */
    .card-bottom {
      display: flex;
      align-items: center;
      gap: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.05);
      padding-top: 15px;
    }

    .info-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 12px;
      color: var(--text-muted);
    }

    .info-item mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .info-item.cost .currency { color: var(--primary); font-weight: 700; }
    .info-item.cost .amount { color: var(--text-primary); font-weight: 700; font-size: 14px; }
    .info-item.free { color: var(--primary); font-weight: 700; }

    .join-action-btn {
      margin-left: auto;
      background: var(--primary);
      color: #0F172A;
      border: none;
      padding: 8px 18px;
      border-radius: 30px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
    }

    .join-action-btn:hover { background: #86EFAC; transform: scale(1.05); }

    .joined-status {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--primary);
      font-weight: 700;
      font-size: 13px;
    }

    .distance-tag {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--bg-surface);
      border-bottom-left-radius: 12px;
      padding: 4px 10px;
      font-size: 10px;
      color: var(--text-muted);
      border-left: 1px solid rgba(255, 255, 255, 0.05);
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }
  `]
})
export class MatchCardComponent implements OnInit, OnDestroy {
  @Input() match!: Match;
  @Input() isJoined = false;
  @Output() joinMatch = new EventEmitter<string>();
  @Output() leaveMatch = new EventEmitter<string>();
  @Output() cardClick = new EventEmitter<Match>();

  timeUntilStart: string = '';
  private timerInterval: any;

  ngOnInit() {
    this.updateTimer();
    this.timerInterval = setInterval(() => this.updateTimer(), 60000); // update every min
  }

  ngOnDestroy() {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  updateTimer() {
    if (!this.match || !this.match.dateTime) return;
    const start = new Date(this.match.dateTime).getTime();
    const now = new Date().getTime();
    const diff = start - now;

    if (diff <= 0) {
      this.timeUntilStart = 'Started';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      this.timeUntilStart = `Starts in ${days}d ${hours}h`;
    } else if (hours > 0) {
      this.timeUntilStart = `Starts in ${hours}h ${mins}m`;
    } else {
      this.timeUntilStart = `Starts in ${mins}m`;
    }
  }

  getSportIcon(sport: string): string {
    const icons: { [key: string]: string } = {
      'Cricket': '🏏',
      'Football': '⚽',
      'Tennis': '🎾',
      'Basketball': '🏀',
      'Table Tennis': '🏓',
      'Badminton': '🏸',
      'Pickleball': '🥒'
    };
    return icons[sport] || '🏆';
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const timeStr = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    if (d.toDateString() === now.toDateString()) return `Today, ${timeStr}`;
    if (d.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${timeStr}`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + `, ${timeStr}`;
  }

  onJoin(e: Event): void {
    e.stopPropagation();
    this.joinMatch.emit(this.match.id);
  }

  onLeave(e: Event): void {
    e.stopPropagation();
    this.leaveMatch.emit(this.match.id);
  }
}
