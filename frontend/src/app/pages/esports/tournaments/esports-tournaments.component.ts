import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EsportsService, EsportsTournament, EsportsTeam } from '../../../../app/core/services/esports.service';
import { AuthService } from '../../../../app/core/auth/auth.service';

@Component({
  selector: 'app-esports-tournaments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="page-container esports-tourneys-page">
      <div class="header-section glass-card">
        <div class="title-area">
          <h1>Esports Tournaments</h1>
          <p class="subtitle">Assemble your squad, register for brackets, and compete for high prestige.</p>
        </div>
        <button class="action-btn host-btn" (click)="showHostModal.set(true)">
          <mat-icon>add</mat-icon>
          <span>Organize Tourney</span>
        </button>
      </div>

      <!-- Tournaments Grid -->
      <div class="tourneys-grid">
        <div class="no-tourneys glass-card" *ngIf="tournaments().length === 0">
          <mat-icon class="empty-icon">military_tech</mat-icon>
          <h3>No tournaments scheduled</h3>
          <p>Be the first to organize a custom bracket tournament!</p>
        </div>

        <div class="tourney-card glass-card" *ngFor="let t of tournaments()">
          <div class="tourney-header">
            <span class="game-badge">{{ t.gameName }}</span>
            <span class="teams-count">
              <mat-icon>groups</mat-icon>
              {{ t.registeredTeams?.length || 0 }} / {{ t.maxTeams }} Teams
            </span>
          </div>

          <h3 class="tourney-title">{{ t.title }}</h3>
          <p class="desc">{{ t.description }}</p>

          <div class="meta-row">
            <div class="meta-item">
              <mat-icon>calendar_today</mat-icon>
              <span>{{ t.startTime | date:'medium' }}</span>
            </div>
            <div class="meta-item">
              <mat-icon>person</mat-icon>
              <span>Format: <strong>{{ t.playersPerTeam }}v{{ t.playersPerTeam }}</strong></span>
            </div>
          </div>

          <!-- Rules preview -->
          <div class="rules-box" *ngIf="t.rules">
            <strong>Rules:</strong> {{ t.rules }}
          </div>

          <!-- Registered Teams list -->
          <div class="registered-teams-list" *ngIf="t.registeredTeams && t.registeredTeams.length > 0">
            <h4>Registered Competitors</h4>
            <div class="teams-chips">
              <div class="team-chip" *ngFor="let team of t.registeredTeams">
                <mat-icon>shield</mat-icon>
                <span>{{ team.teamName }}</span>
              </div>
            </div>
          </div>

          <div class="card-actions">
            <button class="register-btn" *ngIf="!isRegistered(t)" (click)="openRegisterModal(t)" [disabled]="isFull(t)">
              {{ isFull(t) ? 'Bracket Full' : 'Register Team' }}
            </button>
            <div class="registered-badge" *ngIf="isRegistered(t)">
              <mat-icon>check_circle</mat-icon>
              <span>Your Team is Registered</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Organise Modal -->
      <div class="modal-backdrop" *ngIf="showHostModal()">
        <div class="modal-content glass-card">
          <div class="modal-header">
            <h2>Organize Custom Tourney</h2>
            <button class="close-btn" (click)="showHostModal.set(false)"><mat-icon>close</mat-icon></button>
          </div>
          <form (submit)="createTournament($event)" class="modal-form">
            <div class="form-grid">
              <div class="form-group">
                <label>Dynamic Game Name</label>
                <input type="text" [(ngModel)]="newTourney.gameName" name="gameName" required placeholder="e.g. COD Mobile, Valorant" />
              </div>
              <div class="form-group">
                <label>Tournament Title</label>
                <input type="text" [(ngModel)]="newTourney.title" name="title" required placeholder="e.g. Asia Cyber Cup Spring" />
              </div>
              <div class="form-group">
                <label>Max Teams</label>
                <input type="number" [(ngModel)]="newTourney.maxTeams" name="maxTeams" required min="2" max="64" />
              </div>
              <div class="form-group">
                <label>Players Per Team</label>
                <input type="number" [(ngModel)]="newTourney.playersPerTeam" name="playersPerTeam" required min="1" max="10" />
              </div>
              <div class="form-group full-width">
                <label>Start Date & Time</label>
                <input type="datetime-local" [(ngModel)]="tourneyDateTimeStr" name="startTime" required />
              </div>
            </div>
            <div class="form-group full-width">
              <label>Description</label>
              <textarea [(ngModel)]="newTourney.description" name="description" required placeholder="Describe tournament structure, tournament brackets, matches..." rows="3"></textarea>
            </div>
            <div class="form-group full-width">
              <label>Tournament Rules</label>
              <textarea [(ngModel)]="newTourney.rules" name="rules" placeholder="e.g. Single elimination, no toxicity, check-ins 15m before match..." rows="2"></textarea>
            </div>
            <div class="modal-footer">
              <button type="button" class="cancel-btn" (click)="showHostModal.set(false)">Cancel</button>
              <button type="submit" class="submit-btn">Publish Bracket</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Team Registration Modal -->
      <div class="modal-backdrop" *ngIf="showRegisterModal()">
        <div class="modal-content glass-card reg-modal">
          <div class="modal-header">
            <h2>Register Team</h2>
            <button class="close-btn" (click)="showRegisterModal.set(false)"><mat-icon>close</mat-icon></button>
          </div>
          <form (submit)="registerTeam($event)" class="modal-form">
            <div class="form-group">
              <label>Your Team Name</label>
              <input type="text" [(ngModel)]="registeringTeamName" name="teamName" required placeholder="e.g. Clan Delta Esports" />
            </div>
            <div class="modal-footer">
              <button type="button" class="cancel-btn" (click)="showRegisterModal.set(false)">Cancel</button>
              <button type="submit" class="submit-btn">Confirm Registration</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .esports-tourneys-page {
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

    .tourneys-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 24px;
    }

    .tourney-card {
      padding: 24px;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      transition: var(--transition-base);
    }
    .tourney-card:hover {
      border-color: rgba(6, 182, 212, 0.3);
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.1);
      transform: translateY(-4px);
    }

    .tourney-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
    .teams-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .teams-count mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--primary);
    }

    .tourney-title {
      font-size: 18px;
      font-weight: 700;
      color: white;
      margin-bottom: 12px;
    }
    .desc {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 16px;
      line-height: 1.5;
    }

    .meta-row {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--text-secondary);
    }
    .meta-item mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--primary);
    }

    .rules-box {
      font-size: 12px;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      padding: 10px 14px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .registered-teams-list {
      margin-bottom: 20px;
      padding-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }
    .registered-teams-list h4 {
      font-size: 13px;
      font-weight: 700;
      color: white;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .teams-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .team-chip {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: white;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
    }
    .team-chip mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: var(--primary);
    }

    .card-actions {
      margin-top: auto;
    }
    .register-btn {
      width: 100%;
      height: 40px;
      border: none;
      background: var(--primary);
      color: #0F172A;
      font-weight: 700;
      border-radius: 10px;
      cursor: pointer;
      transition: var(--transition-base);
    }
    .register-btn:hover:not(:disabled) {
      box-shadow: 0 0 15px var(--primary-glow);
    }
    .registered-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: #4ADE80;
      font-size: 13px;
      font-weight: 700;
      padding: 10px;
      background: rgba(74, 222, 128, 0.1);
      border: 1px solid rgba(74, 222, 128, 0.2);
      border-radius: 10px;
    }
    .registered-badge mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .no-tourneys {
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

    /* Modal Styling */
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
      border-color: rgba(6, 182, 212, 0.2);
    }
    .reg-modal {
      max-width: 400px;
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
export class EsportsTournamentsComponent implements OnInit {
  private esportsService = inject(EsportsService);
  private authService = inject(AuthService);

  tournaments = signal<EsportsTournament[]>([]);
  showHostModal = signal(false);
  showRegisterModal = signal(false);

  selectedTournament: EsportsTournament | null = null;
  registeringTeamName = '';

  newTourney: EsportsTournament = {
    title: '',
    gameName: '',
    description: '',
    rules: '',
    startTime: '',
    maxTeams: 16,
    playersPerTeam: 5
  };

  tourneyDateTimeStr = '';
  currentUserId = this.authService.currentUser()?.userId || '';

  ngOnInit() {
    this.loadTournaments();
  }

  loadTournaments() {
    this.esportsService.getTournaments().subscribe({
      next: (data) => {
        this.tournaments.set(data);
      }
    });
  }

  isRegistered(t: EsportsTournament): boolean {
    return !!t.registeredTeams?.some(team => 
      team.captainUserId === this.currentUserId || 
      team.playerUserIds?.includes(this.currentUserId)
    );
  }

  isFull(t: EsportsTournament): boolean {
    return (t.registeredTeams?.length || 0) >= t.maxTeams;
  }

  openRegisterModal(t: EsportsTournament) {
    this.selectedTournament = t;
    this.registeringTeamName = '';
    this.showRegisterModal.set(true);
  }

  registerTeam(event: Event) {
    event.preventDefault();
    if (!this.selectedTournament?.id || !this.registeringTeamName) return;

    this.esportsService.registerTeam(this.selectedTournament.id, {
      teamName: this.registeringTeamName
    }).subscribe({
      next: (updated) => {
        const list = this.tournaments().map(t => t.id === updated.id ? updated : t);
        this.tournaments.set(list);
        this.showRegisterModal.set(false);
      }
    });
  }

  createTournament(event: Event) {
    event.preventDefault();
    this.newTourney.startTime = this.tourneyDateTimeStr ? new Date(this.tourneyDateTimeStr).toISOString() : new Date().toISOString();

    this.esportsService.createTournament(this.newTourney).subscribe({
      next: (created) => {
        this.tournaments.set([created, ...this.tournaments()]);
        this.showHostModal.set(false);
        // Reset form
        this.newTourney = {
          title: '',
          gameName: '',
          description: '',
          rules: '',
          startTime: '',
          maxTeams: 16,
          playersPerTeam: 5
        };
        this.tourneyDateTimeStr = '';
      }
    });
  }
}
