import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { EsportsService, EsportsProfile } from '../../../../app/core/services/esports.service';

@Component({
  selector: 'app-esports-squads',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="page-container esports-squads-page">
      <div class="header-section glass-card">
        <div class="title-area">
          <h1>Gamer Roster</h1>
          <p class="subtitle">Discover elite gamers, view competitive credentials, and scout players for your next roster team.</p>
        </div>
      </div>

      <!-- Filter control -->
      <div class="filter-bar glass-card">
        <div class="search-box">
          <mat-icon>search</mat-icon>
          <input type="text" [(ngModel)]="searchQuery" (ngModelChange)="applyFilters()" placeholder="Filter by preferred game (e.g. FIFA, COD, BGMI) or tag..." />
        </div>
        <select [(ngModel)]="selectedSkill" (change)="applyFilters()">
          <option value="">All Skill Levels</option>
          <option value="BEGINNER">Beginner</option>
          <option value="INTERMEDIATE">Intermediate</option>
          <option value="ADVANCED">Advanced</option>
          <option value="PRO">Pro</option>
        </select>
      </div>

      <!-- Roster Grid -->
      <div class="roster-grid">
        <div class="no-profiles glass-card" *ngIf="filteredProfiles().length === 0">
          <mat-icon class="empty-icon">groups</mat-icon>
          <h3>No gamer profiles found</h3>
          <p>Be the first to build and publish your esports credentials card!</p>
        </div>

        <div class="squad-card glass-card" *ngFor="let p of filteredProfiles()">
          <div class="card-glow"></div>
          <div class="card-header">
            <div class="avatar-circle">
              {{ p.gamerTag?.charAt(0)?.toUpperCase() }}
            </div>
            <div class="meta-desc">
              <strong class="gamertag">{{ p.gamerTag }}</strong>
              <span class="role-tag" *ngIf="p.role">{{ p.role }}</span>
            </div>
            <span class="skill-badge" [class]="p.skillLevel?.toLowerCase()">{{ p.skillLevel }}</span>
          </div>

          <div class="bio-section" *ngIf="p.bio">
            <p>{{ p.bio }}</p>
          </div>

          <!-- Ranks and verifications -->
          <div class="rank-row" *ngIf="p.rankTier">
            <span class="rank-label">COMPETITIVE RANK</span>
            <div class="rank-value">
              <mat-icon>military_tech</mat-icon>
              <span>{{ p.rankTier }}</span>
              <span class="verified-tick" *ngIf="p.screenshotProof" title="Rank proof verified by screenshot">
                <mat-icon>verified</mat-icon>
              </span>
            </div>
          </div>

          <!-- Preferred Games -->
          <div class="games-section" *ngIf="p.preferredGames && p.preferredGames.length > 0">
            <span class="label-heading">Preferred Titles</span>
            <div class="games-chips">
              <span class="game-chip" *ngFor="let g of p.preferredGames">{{ g }}</span>
            </div>
          </div>

          <!-- Custom Stats map -->
          <div class="stats-section" *ngIf="p.customStats && hasStats(p)">
            <span class="label-heading">Gamer Statistics</span>
            <div class="stats-grid">
              <div class="stat-box" *ngFor="let entry of getStatsArray(p)">
                <span class="stat-val">{{ entry.value }}</span>
                <span class="stat-name">{{ entry.key }}</span>
              </div>
            </div>
          </div>

          <!-- Socials and Contacts -->
          <div class="contacts-footer">
            <div class="discord-tag" *ngIf="p.discordUsername">
              <mat-icon>forum</mat-icon>
              <span>Discord: <strong>{{ p.discordUsername }}</strong></span>
            </div>
            <div class="socials" *ngIf="p.socialLinks">
              <mat-icon>link</mat-icon>
              <span class="link-txt">{{ p.socialLinks }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .esports-squads-page {
      padding: 24px;
      max-width: var(--content-max-width);
      margin: 0 auto;
      padding-bottom: 120px;
    }

    .header-section {
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

    .filter-bar {
      display: flex;
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

    .filter-bar select {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: white;
      padding: 8px 16px;
      border-radius: 12px;
      outline: none;
      font-size: 14px;
      cursor: pointer;
    }

    .roster-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 24px;
    }

    .squad-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      position: relative;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.06);
      transition: var(--transition-base);
      overflow: hidden;
    }
    .squad-card:hover {
      border-color: rgba(6, 182, 212, 0.3);
      box-shadow: 0 0 20px rgba(6, 182, 212, 0.1);
      transform: translateY(-4px);
    }
    
    .card-glow {
      position: absolute;
      top: -50px;
      right: -50px;
      width: 150px;
      height: 150px;
      background: radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%);
      pointer-events: none;
      z-index: 0;
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
      grid-template-columns: repeat(3, 1fr);
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
      text-align: center;
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

    .no-profiles {
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
  `]
})
export class EsportsSquadsComponent implements OnInit {
  private esportsService = inject(EsportsService);

  profiles = signal<EsportsProfile[]>([]);
  filteredProfiles = signal<EsportsProfile[]>([]);

  searchQuery = '';
  selectedSkill = '';

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles() {
    this.esportsService.getProfiles().subscribe({
      next: (data) => {
        this.profiles.set(data);
        this.applyFilters();
      }
    });
  }

  applyFilters() {
    const query = this.searchQuery.toLowerCase();
    const skill = this.selectedSkill;

    const res = this.profiles().filter(p => {
      const matchQuery = !query || 
        p.gamerTag?.toLowerCase().includes(query) || 
        p.preferredGames?.some(g => g.toLowerCase().includes(query));
      const matchSkill = !skill || p.skillLevel === skill;

      return matchQuery && matchSkill;
    });

    this.filteredProfiles.set(res);
  }

  hasStats(p: EsportsProfile): boolean {
    return !!p.customStats && Object.keys(p.customStats).length > 0;
  }

  getStatsArray(p: EsportsProfile): Array<{ key: string, value: string }> {
    if (!p.customStats) return [];
    return Object.entries(p.customStats).map(([key, value]) => ({ key, value }));
  }
}
