import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="player-premium-card glass-card card-stagger animate-fade-in-up">
      <div class="avatar-box">
        <div class="avatar-glow"></div>
        <div class="avatar-main">
          {{ player.name.charAt(0).toUpperCase() || '?' }}
        </div>
      </div>

      <div class="player-content">
        <div class="p-header">
          <span class="p-name">{{ player.name }}</span>
          <div class="p-rating">
            <mat-icon>star</mat-icon>
            {{ player.rating ? player.rating.toFixed(1) : 'NEW' }}
          </div>
        </div>

        <div class="p-badges">
          <span class="l-badge skill">{{ player.skill || 'ANY' }}</span>
          <span class="l-badge role" *ngIf="player.preferredRole">{{ formatRole(player.preferredRole) }}</span>
        </div>

        <div class="p-loc" *ngIf="player.distance !== undefined">
          <mat-icon>near_me</mat-icon>
          <span>{{ player.distance.toFixed(1) }} km away</span>
        </div>
      </div>

      <button class="connect-btn" (click)="messagePlayer($event)" title="Message this player">
        <mat-icon>chat_bubble</mat-icon>
      </button>
    </div>
  `,
  styles: [`
    .player-premium-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px 20px !important;
      margin-bottom: 12px;
      position: relative;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .player-premium-card:hover {
      background: rgba(255, 255, 255, 0.03);
      transform: translateX(8px);
      border-color: var(--primary) !important;
    }

    .avatar-box {
      position: relative;
      width: 56px; height: 56px;
      flex-shrink: 0;
    }

    .avatar-glow {
      position: absolute;
      top: -5px; left: -5px; right: -5px; bottom: -5px;
      background: var(--primary);
      filter: blur(15px);
      opacity: 0.15;
      border-radius: 50%;
    }

    .avatar-main {
      position: relative;
      width: 100%; height: 100%;
      background: #1E293B;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 20px; color: var(--primary);
      z-index: 2;
    }

    .player-content { flex: 1; display: flex; flex-direction: column; gap: 4px; min-width: 0; }

    .p-header { display: flex; justify-content: space-between; align-items: center; }
    .p-name { font-weight: 700; font-size: 16px; letter-spacing: -0.3px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    
    .p-rating {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; font-weight: 800; color: #F59E0B;
      background: rgba(245, 158, 11, 0.1);
      padding: 2px 8px; border-radius: 100px;
      flex-shrink: 0;
    }
    .p-rating mat-icon { font-size: 12px; width: 12px; height: 12px; }

    .p-badges { display: flex; gap: 8px; margin-top: 2px; flex-wrap: wrap; }
    .l-badge {
      font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 6px;
      text-transform: uppercase;
    }
    .l-badge.skill { background: rgba(74, 222, 128, 0.1); color: var(--primary); }
    .l-badge.role { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }

    .p-loc {
      display: flex; align-items: center; gap: 4px;
      font-size: 11px; color: var(--text-muted); margin-top: 4px;
    }
    .p-loc mat-icon { font-size: 14px; width: 14px; height: 14px; color: var(--primary); }

    .connect-btn {
      width: 40px; height: 40px;
      background: rgba(74, 222, 128, 0.08);
      border: 1px solid rgba(74, 222, 128, 0.15);
      border-radius: 12px;
      color: var(--primary);
      cursor: pointer;
      transition: all 0.3s;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .connect-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .connect-btn:hover {
      background: var(--primary);
      color: #0F172A;
      box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3);
      transform: scale(1.1);
    }
  `]
})
export class PlayerCardComponent {
  @Input() player!: User;

  constructor(private router: Router) {}

  formatRole(role: string): string {
    return role.replace(/_/g, ' ').toLowerCase();
  }

  messagePlayer(event: Event) {
    event.stopPropagation();
    this.router.navigate(['/messages'], {
      queryParams: {
        userId: this.player.id,
        userName: this.player.name
      }
    });
  }
}
