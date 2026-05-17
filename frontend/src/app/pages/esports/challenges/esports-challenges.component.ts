import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EsportsService, EsportsMatch } from '../../../../app/core/services/esports.service';
import { AuthService } from '../../../../app/core/auth/auth.service';

@Component({
  selector: 'app-esports-challenges',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  template: `
    <div class="page-container esports-challenges-page">
      <div class="header-section glass-card">
        <div class="title-area">
          <h1>Esports Matchmaking</h1>
          <p class="subtitle">Direct matchmaking, 1v1 duels, and scrims. Challenge others or accept dynamic open offers.</p>
        </div>
        <button class="action-btn offer-btn" (click)="showOfferModal.set(true)">
          <mat-icon>sports_kabaddi</mat-icon>
          <span>Post Challenge</span>
        </button>
      </div>

      <!-- Disclaimer banner -->
      <div class="disclaimer-banner">
        <mat-icon class="warn-icon">info</mat-icon>
        <span><strong>PlayB Esports Guarantee:</strong> No money handling. No winner verification. PlayB only connects players. Matches occur on steam, consoles, or mobile apps.</span>
      </div>

      <!-- Challenge Grid -->
      <div class="challenges-grid">
        <div class="no-challenges glass-card" *ngIf="duelMatches().length === 0">
          <mat-icon class="empty-icon">sports_kabaddi</mat-icon>
          <h3>No open duel offers</h3>
          <p>Post a custom challenge to summon players for dynamic matchmaking!</p>
        </div>

        <div class="duel-card glass-card" *ngFor="let m of duelMatches()">
          <div class="duel-header">
            <span class="game-name">{{ m.gameName }}</span>
            <span class="status-pill open" *ngIf="m.joinedUserIds && m.joinedUserIds.length < 2">OPEN CHALLENGE</span>
            <span class="status-pill active" *ngIf="m.joinedUserIds && m.joinedUserIds.length >= 2">DUEL IN PROGRESS</span>
          </div>

          <div class="vs-row">
            <div class="player-box">
              <div class="avatar">{{ m.hostName?.charAt(0)?.toUpperCase() }}</div>
              <div class="player-info">
                <span class="role-tag">CHALLENGER</span>
                <strong class="name">{{ m.hostName }}</strong>
              </div>
            </div>
            
            <div class="vs-divider">VS</div>

            <div class="player-box opponent-box">
              <ng-container *ngIf="m.joinedUserIds && m.joinedUserIds.length >= 2; else unaccepted">
                <div class="avatar opp-avatar">?</div>
                <div class="player-info">
                  <span class="role-tag">DEFENDER</span>
                  <strong class="name">Opponent</strong>
                </div>
              </ng-container>
              <ng-template #unaccepted>
                <div class="avatar unaccepted-avatar">?</div>
                <div class="player-info">
                  <span class="role-tag">DEFENDER</span>
                  <span class="name text-muted">Awaiting player...</span>
                </div>
              </ng-template>
            </div>
          </div>

          <div class="duel-details">
            <h4 class="duel-title">{{ m.title }}</h4>
            <p class="desc">{{ m.description }}</p>
            
            <div class="meta-pills">
              <span><mat-icon>sports_esports</mat-icon> {{ m.mode }}</span>
              <span><mat-icon>military_tech</mat-icon> {{ m.skillLevel }}</span>
              <span><mat-icon>voice_chat</mat-icon> {{ m.voiceCommPlatform }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="accept-btn" *ngIf="!isJoined(m)" (click)="joinChallenge(m)" [disabled]="isFull(m)">
              Accept Duel
            </button>
            <button class="leave-btn" *ngIf="isJoined(m) && m.hostId !== currentUserId" (click)="leaveChallenge(m)">
              Forfeit Duel
            </button>

            <!-- Chat shortcut -->
            <a routerLink="/esports/chat" [queryParams]="{ matchId: m.id }" class="chat-btn" *ngIf="isJoined(m)">
              <mat-icon>chat</mat-icon>
              <span>Match Lobby</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Challenge Modal -->
      <div class="modal-backdrop" *ngIf="showOfferModal()">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h2>Post Dynamic Challenge</h2>
            <button class="close-btn" (click)="showOfferModal.set(false)"><mat-icon>close</mat-icon></button>
          </div>
          <form (submit)="postChallenge($event)" class="modal-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Dynamic Game Name</label>
                <input type="text" [(ngModel)]="newDuel.gameName" name="gameName" required placeholder="e.g. FIFA 24, Chess, BGMI" />
              </div>
              <div class="form-group">
                <label>Match Type / Title</label>
                <input type="text" [(ngModel)]="newDuel.title" name="title" required placeholder="e.g. 1v1 Mid-lane Only No Hacking" />
              </div>
              <div class="form-group">
                <label>Skill Bracket</label>
                <select [(ngModel)]="newDuel.skillLevel" name="skillLevel">
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="PRO">Pro</option>
                </select>
              </div>
              <div class="form-group">
                <label>Voice Target</label>
                <select [(ngModel)]="newDuel.voiceCommPlatform" name="voiceCommPlatform">
                  <option value="DISCORD">Discord</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="IN_APP_CHAT">In-App Chat</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label>Match Terms & Conditions</label>
              <textarea [(ngModel)]="newDuel.description" name="description" required placeholder="Specify your console ID, region, connection parameters, and play format rules..." rows="3"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="cancel-btn" (click)="showOfferModal.set(false)">Cancel</button>
              <button type="submit" class="submit-btn">Issue Challenge</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .esports-challenges-page {
      padding: 24px;
      max-width: var(--content-max-width);
      margin: 0 auto;
      padding-bottom: 120px;
    }

    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 32px;
      margin-bottom: 24px;
      background: rgba(15, 23, 42, 0.45);
    }

    .title-area h1 {
      font-size: 32px;
      font-weight: 800;
      color: white;
      text-transform: uppercase;
      margin-bottom: 8px;
      text-shadow: 0 0 10px rgba(6, 182, 212, 0.3);
    }

    .subtitle {
      color: var(--text-secondary);
      font-size: 15px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--gradient-primary);
      border: none;
      color: #0F172A;
      font-weight: 700;
      padding: 12px 24px;
      border-radius: 12px;
      cursor: pointer;
      box-shadow: var(--shadow-glow);
      transition: var(--transition-base);
    }
    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 25px rgba(6, 182, 212, 0.4);
    }

    .disclaimer-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      background: rgba(6, 182, 212, 0.05);
      border: 1px solid rgba(6, 182, 212, 0.15);
      border-radius: 12px;
      color: #22D3EE;
      font-size: 13px;
      margin-bottom: 24px;
    }

    .challenges-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 24px;
    }

    .duel-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: var(--transition-base);
    }
    .duel-card:hover {
      border-color: rgba(217, 70, 239, 0.3);
      box-shadow: 0 0 20px rgba(217, 70, 239, 0.1);
      transform: translateY(-4px);
    }

    .duel-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .game-name {
      font-size: 12px;
      font-weight: 800;
      color: #D946EF;
      background: rgba(217, 70, 239, 0.1);
      border: 1px solid rgba(217, 70, 239, 0.2);
      padding: 4px 12px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .status-pill {
      font-size: 10px;
      font-weight: 900;
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 1px;
    }
    .status-pill.open {
      background: rgba(6, 182, 212, 0.15);
      color: #22D3EE;
    }
    .status-pill.active {
      background: rgba(244, 63, 94, 0.15);
      color: #FB7185;
    }

    .vs-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      padding: 16px;
      border-radius: 16px;
      margin-bottom: 20px;
    }
    .player-box {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
    }
    .player-info {
      display: flex;
      flex-direction: column;
    }
    .role-tag {
      font-size: 9px;
      font-weight: 800;
      color: var(--text-muted);
      text-transform: uppercase;
    }
    .name {
      font-size: 14px;
      color: white;
    }
    .avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--gradient-primary);
      color: #0F172A;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
    }
    .vs-divider {
      font-size: 14px;
      font-weight: 900;
      font-style: italic;
      color: var(--text-muted);
      padding: 0 12px;
    }
    .opponent-box {
      justify-content: flex-end;
      text-align: right;
    }
    .opp-avatar {
      background: #D946EF;
      color: white;
    }
    .unaccepted-avatar {
      background: rgba(255, 255, 255, 0.05);
      color: rgba(255, 255, 255, 0.2);
      border: 1px dashed rgba(255, 255, 255, 0.2);
    }

    .duel-details {
      margin-bottom: 20px;
    }
    .duel-title {
      font-size: 16px;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
    }
    .desc {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 12px;
    }
    .meta-pills {
      display: flex;
      gap: 12px;
    }
    .meta-pills span {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .meta-pills mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--primary);
    }

    .card-actions {
      display: flex;
      gap: 10px;
      margin-top: auto;
    }
    .accept-btn, .leave-btn {
      flex: 1;
      height: 40px;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: var(--transition-base);
    }
    .accept-btn {
      background: var(--primary);
      color: #0F172A;
    }
    .accept-btn:hover {
      box-shadow: 0 0 15px var(--primary-glow);
    }
    .leave-btn {
      background: rgba(244, 63, 94, 0.15);
      color: #FB7185;
      border: 1px solid rgba(244, 63, 94, 0.2);
    }
    .leave-btn:hover {
      background: rgba(244, 63, 94, 0.25);
    }
    .chat-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: white;
      border-radius: 10px;
      padding: 0 16px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
    }

    .no-challenges {
      grid-column: 1 / -1;
      padding: 48px;
      text-align: center;
    }
    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--text-muted);
      margin-bottom: 16px;
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(5, 7, 10, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      backdrop-filter: blur(12px);
      padding: 16px;
    }
    .modal-content {
      width: 100%;
      max-width: 500px;
      padding: 32px;
      background: rgba(15, 23, 42, 0.95);
      border-color: rgba(217, 70, 239, 0.2);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .modal-header h2 {
      font-size: 24px;
      color: white;
      text-transform: uppercase;
      font-weight: 800;
    }
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
    }
    .modal-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .form-group label {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-secondary);
      text-transform: uppercase;
    }
    .form-group input, .form-group select, .form-group textarea {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: white;
      padding: 10px 14px;
      font-size: 14px;
      outline: none;
    }
    .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
      border-color: var(--primary);
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 8px;
    }
    .cancel-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: white;
      padding: 10px 20px;
      cursor: pointer;
      font-weight: 600;
    }
    .submit-btn {
      background: var(--gradient-primary);
      border: none;
      color: #0F172A;
      font-weight: 700;
      padding: 10px 24px;
      border-radius: 10px;
      cursor: pointer;
    }
  `]
})
export class EsportsChallengesComponent implements OnInit {
  private esportsService = inject(EsportsService);
  private authService = inject(AuthService);

  challenges = signal<EsportsMatch[]>([]);
  duelMatches = signal<EsportsMatch[]>([]);

  showOfferModal = signal(false);
  currentUserId = this.authService.currentUser()?.userId || '';

  newDuel: EsportsMatch = {
    gameName: '',
    title: '',
    mode: '1v1',
    maxSlots: 2, // Duel limit
    skillLevel: 'INTERMEDIATE',
    region: 'South Asia',
    voiceCommPlatform: 'DISCORD',
    description: '',
    startTime: new Date().toISOString()
  };

  ngOnInit() {
    this.loadChallenges();
  }

  loadChallenges() {
    this.esportsService.getMatches().subscribe({
      next: (data) => {
        this.challenges.set(data);
        // Duels are matches where maxSlots = 2
        this.duelMatches.set(data.filter(m => m.maxSlots === 2));
      }
    });
  }

  isJoined(m: EsportsMatch): boolean {
    return !!m.joinedUserIds?.includes(this.currentUserId);
  }

  isFull(m: EsportsMatch): boolean {
    return (m.joinedUserIds?.length || 0) >= m.maxSlots;
  }

  joinChallenge(m: EsportsMatch) {
    if (!m.id) return;
    this.esportsService.joinMatch(m.id).subscribe({
      next: () => this.loadChallenges()
    });
  }

  leaveChallenge(m: EsportsMatch) {
    if (!m.id) return;
    this.esportsService.leaveMatch(m.id).subscribe({
      next: () => this.loadChallenges()
    });
  }

  postChallenge(event: Event) {
    event.preventDefault();
    this.newDuel.maxSlots = 2; // enforce duel size
    this.newDuel.startTime = new Date().toISOString();

    this.esportsService.createMatch(this.newDuel).subscribe({
      next: (created) => {
        this.duelMatches.set([created, ...this.duelMatches()]);
        this.showOfferModal.set(false);
        // reset form
        this.newDuel = {
          gameName: '',
          title: '',
          mode: '1v1',
          maxSlots: 2,
          skillLevel: 'INTERMEDIATE',
          region: 'South Asia',
          voiceCommPlatform: 'DISCORD',
          description: '',
          startTime: new Date().toISOString()
        };
      }
    });
  }
}
