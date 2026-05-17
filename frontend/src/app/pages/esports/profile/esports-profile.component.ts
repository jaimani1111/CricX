import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EsportsService, EsportsProfile } from '../../../../app/core/services/esports.service';

@Component({
  selector: 'app-esports-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="page-container esports-profile-setup">
      <div class="profile-layout glass-card">
        
        <!-- CARD PREVIEW (Left Column) -->
        <div class="card-preview-pane">
          <h3>Gamer Card Preview</h3>
          
          <div class="squad-card glass-card">
            <div class="card-glow"></div>
            <div class="card-header">
              <div class="avatar-circle">
                {{ profile().gamerTag?.charAt(0)?.toUpperCase() }}
              </div>
              <div class="meta-desc">
                <strong class="gamertag">{{ profile().gamerTag || 'GamerTag' }}</strong>
                <span class="role-tag" *ngIf="profile().role">{{ profile().role }}</span>
              </div>
              <span class="skill-badge" [class]="profile().skillLevel?.toLowerCase()">{{ profile().skillLevel }}</span>
            </div>

            <div class="bio-section" *ngIf="profile().bio">
              <p>{{ profile().bio }}</p>
            </div>

            <!-- Ranks and verifications -->
            <div class="rank-row" *ngIf="profile().rankTier">
              <span class="rank-label">COMPETITIVE RANK</span>
              <div class="rank-value">
                <mat-icon>military_tech</mat-icon>
                <span>{{ profile().rankTier }}</span>
                <span class="verified-tick" *ngIf="profile().screenshotProof" title="Rank proof verified by screenshot">
                  <mat-icon>verified</mat-icon>
                </span>
              </div>
            </div>

            <!-- Preferred Games -->
            <div class="games-section" *ngIf="profile().preferredGames && profile().preferredGames.length > 0">
              <span class="label-heading">Preferred Titles</span>
              <div class="games-chips">
                <span class="game-chip" *ngFor="let g of profile().preferredGames">{{ g }}</span>
              </div>
            </div>

            <!-- Custom Stats map -->
            <div class="stats-section" *ngIf="hasStats()">
              <span class="label-heading">Gamer Statistics</span>
              <div class="stats-grid">
                <div class="stat-box" *ngFor="let entry of getStatsArray()">
                  <span class="stat-val">{{ entry.value }}</span>
                  <span class="stat-name">{{ entry.key }}</span>
                </div>
              </div>
            </div>

            <!-- Socials and Contacts -->
            <div class="contacts-footer">
              <div class="discord-tag" *ngIf="profile().discordUsername">
                <mat-icon>forum</mat-icon>
                <span>Discord: <strong>{{ profile().discordUsername }}</strong></span>
              </div>
              <div class="socials" *ngIf="profile().socialLinks">
                <mat-icon>link</mat-icon>
                <span class="link-txt">{{ profile().socialLinks }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- FORM OPTIONS (Right Column) -->
        <div class="profile-form-pane">
          <h2>Configure Gamer Card</h2>
          <p class="desc">Define your gamer identity, stats, and rank screenshot verifications to rank high in search listings.</p>

          <form (submit)="saveProfile($event)" class="gamer-form">
            <div class="form-grid">
              <div class="form-group">
                <label>GamerTag IGN</label>
                <input type="text" [(ngModel)]="profile().gamerTag" name="gamerTag" required />
              </div>
              <div class="form-group">
                <label>Preferred Role</label>
                <select [(ngModel)]="profile().role" name="role">
                  <option value="SNIPER">Sniper</option>
                  <option value="RUSHER">Rusher</option>
                  <option value="SUPPORT">Support</option>
                  <option value="ENTRY_FRAGGER">Entry Fragger</option>
                  <option value="FLEX">Flex / Versatile</option>
                </select>
              </div>
              <div class="form-group">
                <label>Skill Tier</label>
                <select [(ngModel)]="profile().skillLevel" name="skillLevel">
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="PRO">Pro League</option>
                </select>
              </div>
              <div class="form-group">
                <label>Current Rank Title</label>
                <input type="text" [(ngModel)]="profile().rankTier" name="rankTier" placeholder="e.g. Diamond II, Conqueror" />
              </div>
              <div class="form-group full-width">
                <label>Preferred Games (Comma separated)</label>
                <input type="text" [ngModel]="gamesCsv" (ngModelChange)="onGamesCsvChange($event)" name="preferredGames" placeholder="e.g. Valorant, BGMI, FIFA, Apex Legends" />
              </div>
              
              <!-- Custom stats mapping inputs -->
              <div class="form-group">
                <label>Stat 1: K/D Ratio</label>
                <input type="text" [(ngModel)]="statKD" name="statKD" (ngModelChange)="updateStats()" placeholder="e.g. 2.45" />
              </div>
              <div class="form-group">
                <label>Stat 2: Win Rate</label>
                <input type="text" [(ngModel)]="statWR" name="statWR" (ngModelChange)="updateStats()" placeholder="e.g. 68%" />
              </div>
              <div class="form-group full-width">
                <label>Rank Screenshot Proof URL</label>
                <input type="text" [(ngModel)]="profile().screenshotProof" name="screenshotProof" placeholder="e.g. https://imagehost.com/my-rank.png" />
              </div>
              <div class="form-group">
                <label>Discord Username</label>
                <input type="text" [(ngModel)]="profile().discordUsername" name="discordUsername" placeholder="e.g. shadow_gamer#1337" />
              </div>
              <div class="form-group">
                <label>Streaming / Social Link</label>
                <input type="text" [(ngModel)]="profile().socialLinks" name="socialLinks" placeholder="e.g. youtube.com/c/shadow" />
              </div>
            </div>

            <div class="form-group full-width">
              <label>Gaming Biography</label>
              <textarea [(ngModel)]="profile().bio" name="bio" rows="3" placeholder="Tell other players about your clan history, tournament experience, and schedule..."></textarea>
            </div>

            <div class="form-actions">
              <span class="status-msg" *ngIf="statusMessage()">{{ statusMessage() }}</span>
              <button type="submit" class="submit-btn">Save Gamer Card</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .esports-profile-setup {
      padding: 24px;
      max-width: var(--content-max-width);
      margin: 0 auto;
      padding-bottom: 120px;
    }

    .profile-layout {
      display: flex;
      gap: 32px;
      padding: 32px;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* Preview pane */
    .card-preview-pane {
      width: 320px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .card-preview-pane h3 {
      font-size: 14px;
      font-weight: 800;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Form pane */
    .profile-form-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    .profile-form-pane h2 {
      font-size: 24px;
      font-weight: 800;
      color: white;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .desc {
      font-size: 14px;
      color: var(--text-secondary);
      margin-bottom: 24px;
    }

    .gamer-form {
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

    .form-actions {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 16px;
      margin-top: 12px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 16px;
    }
    .status-msg {
      font-size: 13px;
      color: #4ADE80;
      font-weight: 600;
    }
    .submit-btn {
      background: var(--gradient-primary);
      border: none;
      color: #0F172A;
      font-weight: 700;
      padding: 12px 28px;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: var(--shadow-glow);
    }

    /* SQUAD CARD PREVIEW */
    .squad-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      position: relative;
      background: rgba(15, 23, 42, 0.65);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      overflow: hidden;
    }
    .card-glow {
      position: absolute;
      top: -50px;
      right: -50px;
      width: 150px;
      height: 150px;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
      pointer-events: none;
    }
    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
      z-index: 1;
    }
    .avatar-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--gradient-primary);
      color: #0F172A;
      font-size: 18px;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .meta-desc {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .gamertag {
      font-size: 16px;
      color: white;
      font-weight: 800;
    }
    .role-tag {
      font-size: 10px;
      color: #D946EF;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .skill-badge {
      font-size: 9px;
      font-weight: 800;
      padding: 4px 8px;
      border-radius: 4px;
      letter-spacing: 0.5px;
    }
    .skill-badge.pro {
      background: rgba(217, 70, 239, 0.15);
      color: #D946EF;
    }
    .skill-badge.advanced {
      background: rgba(6, 182, 212, 0.15);
      color: #22D3EE;
    }
    .skill-badge.intermediate {
      background: rgba(74, 222, 128, 0.15);
      color: #4ADE80;
    }
    .skill-badge.beginner {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
    }
    .bio-section {
      font-size: 13px;
      color: var(--text-muted);
      line-height: 1.5;
      margin-bottom: 16px;
      z-index: 1;
    }
    .rank-row {
      display: flex;
      flex-direction: column;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      padding: 10px 14px;
      border-radius: 10px;
      margin-bottom: 16px;
    }
    .rank-label {
      font-size: 9px;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .rank-value {
      display: flex;
      align-items: center;
      gap: 6px;
      color: white;
      font-weight: 700;
      font-size: 14px;
    }
    .rank-value mat-icon {
      color: var(--primary);
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    .verified-tick mat-icon {
      color: #4ADE80 !important;
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    .label-heading {
      display: block;
      font-size: 10px;
      font-weight: 800;
      color: var(--text-muted);
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .games-section {
      margin-bottom: 16px;
    }
    .games-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .game-chip {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: white;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
    }
    .stats-section {
      margin-bottom: 16px;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .stat-box {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.04);
      padding: 8px;
      border-radius: 8px;
    }
    .stat-val {
      font-size: 15px;
      font-weight: 800;
      color: white;
    }
    .stat-name {
      font-size: 9px;
      color: var(--text-muted);
      text-transform: uppercase;
      margin-top: 2px;
    }
    .contacts-footer {
      margin-top: auto;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .discord-tag, .socials {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--text-secondary);
    }
    .discord-tag mat-icon, .socials mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: var(--primary);
    }

    @media (max-width: 768px) {
      .profile-layout {
        flex-direction: column-reverse;
      }
      .card-preview-pane {
        width: 100%;
      }
    }
  `]
})
export class EsportsProfileComponent implements OnInit {
  private esportsService = inject(EsportsService);

  profile = signal<EsportsProfile>({
    gamerTag: 'Player',
    preferredGames: [],
    role: 'FLEX',
    skillLevel: 'INTERMEDIATE',
    rankTier: '',
    customStats: {},
    screenshotProof: '',
    bio: '',
    discordUsername: '',
    socialLinks: ''
  });

  gamesCsv = '';
  statKD = '';
  statWR = '';

  statusMessage = signal('');

  ngOnInit() {
    this.esportsService.getMyProfile().subscribe({
      next: (p) => {
        this.profile.set(p);
        this.gamesCsv = p.preferredGames?.join(', ') || '';
        this.statKD = p.customStats?.['K/D'] || '';
        this.statWR = p.customStats?.['Win Rate'] || '';
      }
    });
  }

  onGamesCsvChange(val: string) {
    this.gamesCsv = val;
    const array = val.split(',')
      .map(s => s.trim())
      .filter(s => !!s);
    this.profile.update(p => ({ ...p, preferredGames: array }));
  }

  updateStats() {
    const stats: Record<string, string> = {};
    if (this.statKD) stats['K/D'] = this.statKD;
    if (this.statWR) stats['Win Rate'] = this.statWR;
    this.profile.update(p => ({ ...p, customStats: stats }));
  }

  hasStats(): boolean {
    const stats = this.profile().customStats;
    return !!stats && Object.keys(stats).length > 0;
  }

  getStatsArray(): Array<{ key: string, value: string }> {
    const stats = this.profile().customStats;
    if (!stats) return [];
    return Object.entries(stats).map(([key, value]) => ({ key, value }));
  }

  saveProfile(event: Event) {
    event.preventDefault();
    this.updateStats();

    this.esportsService.saveProfile(this.profile()).subscribe({
      next: (saved) => {
        this.profile.set(saved);
        this.statusMessage.set('Gamer Card Saved Successfully!');
        setTimeout(() => this.statusMessage.set(''), 3000);
      }
    });
  }
}
