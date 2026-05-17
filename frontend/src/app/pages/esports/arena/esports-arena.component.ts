import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { EsportsService, EsportsMatch } from '../../../../app/core/services/esports.service';
import { AuthService } from '../../../../app/core/auth/auth.service';

@Component({
  selector: 'app-esports-arena',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  template: `
    <div class="page-container esports-arena-page">
      <div class="header-section glass-card">
        <div class="title-area">
          <h1>Esports Arena</h1>
          <p class="subtitle">Join and host multiplayer esports lobbies and connect with gamers around the globe.</p>
        </div>
        <button class="action-btn host-btn" (click)="showHostModal.set(true)">
          <mat-icon>add</mat-icon>
          <span>Host Lobbies</span>
        </button>
      </div>

      <!-- Disclaimer banner -->
      <div class="disclaimer-banner">
        <mat-icon class="warn-icon">info</mat-icon>
        <span><strong>Disclaimer:</strong> PlayB only connects players. Dynamic gameplay happens entirely on third-party platforms.</span>
      </div>

      <!-- Search and Filter Panel -->
      <div class="filters-row glass-card">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input type="text" [(ngModel)]="searchQuery" placeholder="Search by game name or title..." (ngModelChange)="applyFilters()" />
        </div>
        <div class="filter-controls">
          <select [(ngModel)]="selectedMode" (change)="applyFilters()">
            <option value="">All Modes</option>
            <option value="1v1">1v1</option>
            <option value="2v2">2v2</option>
            <option value="4v4">4v4</option>
            <option value="SQUAD">Squad</option>
            <option value="CUSTOM">Custom</option>
          </select>
          <select [(ngModel)]="selectedSkill" (change)="applyFilters()">
            <option value="">All Skills</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
            <option value="PRO">Pro</option>
          </select>
        </div>
      </div>

      <!-- Match Cards Grid -->
      <div class="matches-grid">
        <div class="no-matches glass-card" *ngIf="filteredMatches().length === 0">
          <mat-icon class="empty-icon">sports_esports</mat-icon>
          <h3>No esports lobbies found</h3>
          <p>Be the first to host a custom match in the arena!</p>
        </div>

        <div class="match-card glass-card" *ngFor="let match of filteredMatches()">
          <div class="match-badge">
            <span class="game-badge">{{ match.gameName }}</span>
            <span class="mode-badge">{{ match.mode }}</span>
          </div>

          <h3 class="match-title">{{ match.title }}</h3>
          
          <div class="host-row">
            <div class="host-avatar">{{ match.hostName?.charAt(0)?.toUpperCase() }}</div>
            <span class="host-name">Hosted by <strong>{{ match.hostName }}</strong></span>
          </div>

          <p class="description">{{ match.description }}</p>

          <div class="match-info-grid">
            <div class="info-item">
              <mat-icon>military_tech</mat-icon>
              <span>{{ match.skillLevel }}</span>
            </div>
            <div class="info-item">
              <mat-icon>public</mat-icon>
              <span>{{ match.region }}</span>
            </div>
            <div class="info-item">
              <mat-icon>forum</mat-icon>
              <span class="comm-platform">{{ match.voiceCommPlatform }}</span>
            </div>
            <div class="info-item">
              <mat-icon>schedule</mat-icon>
              <span>{{ match.startTime | date:'shortTime' }}</span>
            </div>
          </div>

          <div class="progress-bar-container">
            <div class="slots-text">
              <span>Slots Filled</span>
              <span><strong>{{ match.joinedUserIds?.length || 0 }}</strong> / {{ match.maxSlots }}</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="((match.joinedUserIds?.length || 0) / match.maxSlots) * 100"></div>
            </div>
          </div>

          <div class="card-actions">
            <!-- Join/Leave actions -->
            <button class="join-btn" *ngIf="!isJoined(match)" (click)="joinLobby(match)" [disabled]="isFull(match)">
              {{ isFull(match) ? 'Lobby Full' : 'Join Match' }}
            </button>
            <button class="leave-btn" *ngIf="isJoined(match) && match.hostId !== currentUserId" (click)="leaveLobby(match)">
              Leave Match
            </button>

            <!-- Private Lobby Group Chat launcher -->
            <a routerLink="/esports/chat" [queryParams]="{ matchId: match.id }" class="chat-lobby-btn" *ngIf="isJoined(match)">
              <mat-icon>chat</mat-icon>
              <span>Lobby Chat</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Host Modal Dialog -->
      <div class="modal-backdrop" *ngIf="showHostModal()">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h2>Host Esports Lobby</h2>
            <button class="close-btn" (click)="showHostModal.set(false)"><mat-icon>close</mat-icon></button>
          </div>
          <form (submit)="hostMatch($event)" class="modal-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Game Name (Custom/Dynamic)</label>
                <input type="text" [(ngModel)]="newMatch.gameName" name="gameName" required placeholder="e.g. Valorant, BGMI, COD Mobile" />
              </div>
              <div class="form-group">
                <label>Match Title</label>
                <input type="text" [(ngModel)]="newMatch.title" name="title" required placeholder="e.g. 5v5 Custom Room Scrims" />
              </div>
              <div class="form-group">
                <label>Match Mode</label>
                <select [(ngModel)]="newMatch.mode" name="mode">
                  <option value="1v1">1v1</option>
                  <option value="2v2">2v2</option>
                  <option value="4v4">4v4</option>
                  <option value="SQUAD">Squad</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              <div class="form-group">
                <label>Slots count</label>
                <input type="number" [(ngModel)]="newMatch.maxSlots" name="maxSlots" required min="2" max="100" />
              </div>
              <div class="form-group">
                <label>Skill Bracket</label>
                <select [(ngModel)]="newMatch.skillLevel" name="skillLevel">
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="PRO">Pro</option>
                </select>
              </div>
              <div class="form-group">
                <label>Region</label>
                <input type="text" [(ngModel)]="newMatch.region" name="region" required placeholder="e.g. South Asia, NA, Europe" />
              </div>
              <div class="form-group">
                <label>Voice Comm Platform</label>
                <select [(ngModel)]="newMatch.voiceCommPlatform" name="voiceCommPlatform">
                  <option value="DISCORD">Discord</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="TELEGRAM">Telegram</option>
                  <option value="IN_APP_CHAT">In-App Chat</option>
                  <option value="CUSTOM">Custom Link</option>
                </select>
              </div>
              <div class="form-group">
                <label>Voice/Invite Link</label>
                <input type="text" [(ngModel)]="newMatch.voiceCommLink" name="voiceCommLink" placeholder="e.g. Discord server link" />
              </div>
            </div>
            <div class="form-group full-width">
              <label>Description</label>
              <textarea [(ngModel)]="newMatch.description" name="description" required placeholder="Specify game details, strategy room, and team code guidelines..." rows="3"></textarea>
            </div>
            <div class="form-group full-width">
              <label>Custom Rules</label>
              <textarea [(ngModel)]="newMatch.rules" name="rules" placeholder="Define rules: e.g. No hacks, no toxic language, screenshots required..." rows="2"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="cancel-btn" (click)="showHostModal.set(false)">Cancel</button>
              <button type="submit" class="submit-btn">Publish Lobby</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .esports-arena-page {
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
      letter-spacing: -0.5px;
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

    /* Disclaimer styling */
    .disclaimer-banner {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      background: rgba(251, 146, 60, 0.1);
      border: 1px solid rgba(251, 146, 60, 0.2);
      border-radius: 12px;
      color: #FB923C;
      font-size: 13px;
      margin-bottom: 24px;
    }
    .warn-icon {
      color: #FB923C;
    }

    .filters-row {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      padding: 16px;
      margin-bottom: 24px;
      align-items: center;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 8px 16px;
      flex: 1;
    }
    .search-box input {
      background: transparent;
      border: none;
      color: white;
      outline: none;
      width: 100%;
      font-size: 14px;
    }

    .filter-controls {
      display: flex;
      gap: 12px;
    }
    .filter-controls select {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: white;
      padding: 8px 16px;
      border-radius: 12px;
      outline: none;
      font-size: 14px;
      cursor: pointer;
    }

    .matches-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 24px;
    }

    .match-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: var(--transition-base);
    }
    .match-card:hover {
      border-color: rgba(6, 182, 212, 0.3);
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.1);
      transform: translateY(-4px);
    }

    .match-badge {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    .game-badge {
      background: rgba(6, 182, 212, 0.15);
      color: #22D3EE;
      font-size: 11px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 20px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid rgba(6, 182, 212, 0.25);
    }
    .mode-badge {
      background: rgba(255, 255, 255, 0.05);
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 20px;
    }

    .match-title {
      font-size: 18px;
      font-weight: 700;
      color: white;
      margin-bottom: 12px;
    }

    .host-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .host-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--gradient-primary);
      color: #0F172A;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .host-name {
      font-size: 13px;
      color: var(--text-secondary);
    }

    .description {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .match-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
      padding: 14px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.04);
    }
    .info-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .info-item mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--primary);
    }
    .comm-platform {
      text-transform: uppercase;
      font-weight: 700;
    }

    .progress-bar-container {
      margin-bottom: 24px;
    }
    .slots-text {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: var(--text-secondary);
      margin-bottom: 6px;
    }
    .progress-bar {
      height: 6px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--gradient-primary);
      border-radius: 3px;
    }

    .card-actions {
      display: flex;
      gap: 10px;
      margin-top: auto;
    }
    .join-btn, .leave-btn {
      flex: 1;
      height: 40px;
      border: none;
      border-radius: 10px;
      font-weight: 700;
      font-size: 13px;
      cursor: pointer;
      transition: var(--transition-base);
    }
    .join-btn {
      background: var(--primary);
      color: #0F172A;
    }
    .join-btn:hover:not(:disabled) {
      box-shadow: 0 0 15px var(--primary-glow);
    }
    .leave-btn {
      background: rgba(248, 113, 113, 0.15);
      color: var(--accent-red);
      border: 1px solid rgba(248, 113, 113, 0.2);
    }
    .leave-btn:hover {
      background: rgba(248, 113, 113, 0.25);
    }

    .chat-lobby-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: rgba(6, 182, 212, 0.15);
      border: 1px solid rgba(6, 182, 212, 0.25);
      color: #22D3EE;
      border-radius: 10px;
      padding: 0 16px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 700;
      transition: var(--transition-base);
    }
    .chat-lobby-btn:hover {
      background: rgba(6, 182, 212, 0.25);
    }

    .no-matches {
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

    /* Modal dialog styling */
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
      max-width: 600px;
      padding: 32px;
      background: rgba(15, 23, 42, 0.95);
      border-color: rgba(6, 182, 212, 0.2);
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
    .form-group.full-width {
      grid-column: 1 / -1;
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
export class EsportsArenaComponent implements OnInit {
  private esportsService = inject(EsportsService);
  private authService = inject(AuthService);

  matches = signal<EsportsMatch[]>([]);
  filteredMatches = signal<EsportsMatch[]>([]);

  searchQuery = '';
  selectedMode = '';
  selectedSkill = '';

  showHostModal = signal(false);
  currentUserId = this.authService.currentUser()?.userId || '';

  newMatch: EsportsMatch = {
    gameName: '',
    title: '',
    mode: '1v1',
    maxSlots: 10,
    skillLevel: 'INTERMEDIATE',
    region: 'South Asia',
    voiceCommPlatform: 'DISCORD',
    voiceCommLink: '',
    description: '',
    rules: '',
    startTime: new Date().toISOString()
  };

  ngOnInit() {
    this.loadMatches();
  }

  loadMatches() {
    this.esportsService.getMatches().subscribe({
      next: (data) => {
        this.matches.set(data);
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    const query = this.searchQuery.toLowerCase();
    const mode = this.selectedMode;
    const skill = this.selectedSkill;

    const res = this.matches().filter(m => {
      const matchQuery = !query || 
        m.gameName?.toLowerCase().includes(query) || 
        m.title?.toLowerCase().includes(query);
      const matchMode = !mode || m.mode === mode;
      const matchSkill = !skill || m.skillLevel === skill;

      return matchQuery && matchMode && matchSkill;
    });

    this.filteredMatches.set(res);
  }

  isJoined(match: EsportsMatch): boolean {
    return !!match.joinedUserIds?.includes(this.currentUserId);
  }

  isFull(match: EsportsMatch): boolean {
    return (match.joinedUserIds?.length || 0) >= match.maxSlots;
  }

  joinLobby(match: EsportsMatch) {
    if (!match.id) return;
    this.esportsService.joinMatch(match.id).subscribe({
      next: (updated) => {
        const list = this.matches().map(m => m.id === updated.id ? updated : m);
        this.matches.set(list);
        this.applyFilters();
      }
    });
  }

  leaveLobby(match: EsportsMatch) {
    if (!match.id) return;
    this.esportsService.leaveMatch(match.id).subscribe({
      next: (updated) => {
        const list = this.matches().map(m => m.id === updated.id ? updated : m);
        this.matches.set(list);
        this.applyFilters();
      }
    });
  }

  hostMatch(event: Event) {
    event.preventDefault();
    this.newMatch.startTime = new Date().toISOString();
    
    this.esportsService.createMatch(this.newMatch).subscribe({
      next: (created) => {
        this.matches.set([created, ...this.matches()]);
        this.applyFilters();
        this.showHostModal.set(false);
        // reset form
        this.newMatch = {
          gameName: '',
          title: '',
          mode: '1v1',
          maxSlots: 10,
          skillLevel: 'INTERMEDIATE',
          region: 'South Asia',
          voiceCommPlatform: 'DISCORD',
          voiceCommLink: '',
          description: '',
          rules: '',
          startTime: new Date().toISOString()
        };
      }
    });
  }
}
