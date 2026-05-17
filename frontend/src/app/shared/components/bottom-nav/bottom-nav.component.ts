import { Component, inject, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { EsportsService } from '../../../core/services/esports.service';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="nav-container" [class.esports-active-nav]="activeMode() === 'esports'">
      <div class="nav-bg"></div>
      
      <!-- Brand Logo (Sidebar only) -->
      <div class="brand">
        <div class="logo-box">P<span>b</span></div>
        <span class="logo-text">Playb</span>
      </div>

      <!-- Mode Switcher (Sidebar only) -->
      <div class="mode-switch-container">
        <div class="mode-switch" (click)="toggleMode()">
          <div class="mode-slider" [class.esports-active]="activeMode() === 'esports'"></div>
          <span class="mode-label" [class.active]="activeMode() === 'sports'">Sports</span>
          <span class="mode-label" [class.active]="activeMode() === 'esports'">Esports</span>
        </div>
      </div>

      <!-- Nav Items -->
      <div class="items-wrapper">
        <!-- ESPORTS NAVIGATION (Shown when activeMode is esports) -->
        <ng-container *ngIf="activeMode() === 'esports'">
          <a routerLink="/esports/arena" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">explore</mat-icon>
            <span class="label">Arena</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/esports/challenges" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">emoji_events</mat-icon>
            <span class="label">Challenges</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/esports/tournaments" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">military_tech</mat-icon>
            <span class="label">Tourneys</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/esports/squads" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">groups</mat-icon>
            <span class="label">Squads</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/esports/chat" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">chat</mat-icon>
            <span class="label">Chat</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/esports/profile" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">person</mat-icon>
            <span class="label">Profile</span>
            <div class="active-indicator"></div>
          </a>
        </ng-container>

        <!-- STANDARD SPORTS PLAYER NAV -->
        <ng-container *ngIf="activeMode() === 'sports' && !isAdmin()">
          <a routerLink="/matches" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-item">
            <mat-icon class="m-icon">explore</mat-icon>
            <span class="label">Browse</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/challenges" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">emoji_events</mat-icon>
            <span class="label">Challenges</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/tournaments" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">military_tech</mat-icon>
            <span class="label">Tourneys</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/marketplace" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">stadium</mat-icon>
            <span class="label">Book</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/players" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">groups</mat-icon>
            <span class="label">Players</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/messages" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">chat</mat-icon>
            <span class="label">Chat</span>
            <div class="active-indicator"></div>
          </a>
        </ng-container>

        <!-- STANDARD SPORTS ADMIN NAV -->
        <ng-container *ngIf="activeMode() === 'sports' && isAdmin() && !isSuperAdmin()">
          <a routerLink="/admin/turf" [queryParams]="{tab: 'dashboard'}" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-item">
            <mat-icon class="m-icon">dashboard</mat-icon>
            <span class="label">Dashboard</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/admin/turf" [queryParams]="{tab: 'my-venues'}" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-item">
            <mat-icon class="m-icon">stadium</mat-icon>
            <span class="label">Venues</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/admin/turf" [queryParams]="{tab: 'register'}" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-item">
            <mat-icon class="m-icon">add_business</mat-icon>
            <span class="label">Add Venue</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/admin/turf" [queryParams]="{tab: 'events'}" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-item">
            <mat-icon class="m-icon">military_tech</mat-icon>
            <span class="label">Events</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/messages" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">chat</mat-icon>
            <span class="label">Chat</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/profile" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">person</mat-icon>
            <span class="label">Profile</span>
            <div class="active-indicator"></div>
          </a>
        </ng-container>

        <!-- STANDARD SPORTS SUPER ADMIN NAV -->
        <ng-container *ngIf="activeMode() === 'sports' && isSuperAdmin()">
          <a routerLink="/matches" routerLinkActive="active" [routerLinkActiveOptions]="{exact: false}" class="nav-item">
            <mat-icon class="m-icon">explore</mat-icon>
            <span class="label">Browse</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/challenges" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">emoji_events</mat-icon>
            <span class="label">Challenges</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/tournaments" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">military_tech</mat-icon>
            <span class="label">Tourneys</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/marketplace" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">stadium</mat-icon>
            <span class="label">Book</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/players" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">groups</mat-icon>
            <span class="label">Players</span>
            <div class="active-indicator"></div>
          </a>
          <a routerLink="/messages" routerLinkActive="active" class="nav-item">
            <mat-icon class="m-icon">chat</mat-icon>
            <span class="label">Chat</span>
            <div class="active-indicator"></div>
          </a>
        </ng-container>

        <!-- Profile (shared for non-admin in sports mode) -->
        <a *ngIf="activeMode() === 'sports' && !isAdmin()" routerLink="/profile" routerLinkActive="active" class="nav-item">
          <mat-icon class="m-icon">person</mat-icon>
          <span class="label">Profile</span>
          <div class="active-indicator"></div>
        </a>
      </div>

      <!-- Admin Links (Sidebar only, sports mode only) -->
      <div class="admin-links" *ngIf="activeMode() === 'sports' && isSuperAdmin()">
        <div class="section-label">Admin</div>
        <a routerLink="/admin/super" routerLinkActive="active" class="nav-item">
          <mat-icon class="m-icon">shield</mat-icon>
          <span class="label">Super Admin</span>
          <div class="active-indicator"></div>
        </a>
        <a routerLink="/admin/turf" routerLinkActive="active" class="nav-item">
          <mat-icon class="m-icon">stadium</mat-icon>
          <span class="label">Turf Admin</span>
          <div class="active-indicator"></div>
        </a>
      </div>

      <!-- Footer (Sidebar only) -->
      <div class="nav-footer">
        <button class="logout-btn" (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Sign Out</span>
        </button>
      </div>
    </nav>
  `,
  styles: [`
    :host { display: block; }

    .nav-container {
      position: fixed;
      bottom: 0; left: 0; right: 0;
      height: 72px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      z-index: 1000;
    }

    .nav-bg {
      position: absolute;
      inset: 0;
      background: rgba(5, 7, 10, 0.92);
      border-top: 1px solid rgba(255,255,255,0.06);
      z-index: -1;
    }

    .brand, .nav-footer, .admin-links, .section-label { display: none; }
    .items-wrapper {
      display: flex;
      width: 100%;
      align-items: center;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: none;
      padding: 0 4px;
    }
    .items-wrapper::-webkit-scrollbar { display: none; }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      text-decoration: none;
      color: var(--text-muted);
      padding: 8px 10px;
      position: relative;
      transition: color 0.2s ease;
      -webkit-tap-highlight-color: transparent;
      flex-shrink: 0;
      min-width: 60px;
    }

    .m-icon { font-size: 24px; width: 24px; height: 24px; }
    .label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }

    .nav-item.active { color: var(--primary); }

    .active-indicator {
      position: absolute; top: 0; left: 50%; transform: translateX(-50%) scaleX(0);
      width: 24px; height: 3px; border-radius: 0 0 3px 3px;
      background: var(--primary);
      transition: transform 0.25s ease;
    }
    .nav-item.active .active-indicator { transform: translateX(-50%) scaleX(1); }

    /* DESKTOP: Sidebar */
    @media (min-width: 1024px) {
      .nav-container {
        top: 0; bottom: 0; left: 0; right: auto;
        width: var(--sidebar-width);
        height: 100vh;
        flex-direction: column;
        justify-content: flex-start;
        padding: 32px 16px;
        gap: 0;
      }

      .nav-bg {
        border-top: none;
        border-right: 1px solid rgba(255,255,255,0.06);
        background: var(--bg-secondary);
      }

      .brand {
        display: flex; align-items: center; gap: 12px; width: 100%;
        padding: 0 16px; margin-bottom: 48px;
      }
      .logo-box {
        width: 36px; height: 36px; background: var(--gradient-primary); border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        font-weight: 900; color: #0F172A; font-size: 16px; flex-shrink: 0;
      }
      .logo-box span { color: white; opacity: 0.8; }
      .logo-text { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; color: white; }

      .items-wrapper { flex-direction: column; gap: 4px; width: 100%; overflow-x: visible; }

      .nav-item {
        flex-direction: row; gap: 14px; width: 100%; padding: 12px 16px;
        border-radius: 12px; font-size: 14px;
      }
      .nav-item:hover { background: rgba(255,255,255,0.04); color: var(--text-secondary); }
      .nav-item.active { background: rgba(74, 222, 128, 0.08); color: var(--primary); }
      .label { font-size: 14px; text-transform: none; letter-spacing: 0; font-weight: 500; }

      .active-indicator {
        top: auto; left: 0; bottom: auto;
        width: 3px; height: 60%; border-radius: 0 3px 3px 0;
        transform: translateX(0) scaleY(0);
      }
      .nav-item.active .active-indicator { transform: translateX(0) scaleY(1); }

      .admin-links {
        display: flex; flex-direction: column; width: 100%;
        margin-top: 24px; padding-top: 24px;
        border-top: 1px solid rgba(255,255,255,0.06);
        gap: 4px;
      }
      .section-label {
        display: block; font-size: 11px; font-weight: 700; color: var(--text-muted);
        text-transform: uppercase; letter-spacing: 1px; padding: 0 16px; margin-bottom: 8px;
      }

      .nav-footer {
        display: flex; margin-top: auto; width: 100%; padding: 0 8px;
      }
      .logout-btn {
        width: 100%; height: 44px; background: transparent;
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 12px; color: var(--accent-red); display: flex;
        align-items: center; gap: 10px; padding: 0 16px;
        font-size: 14px; font-weight: 500; cursor: pointer;
        transition: background 0.2s ease, border-color 0.2s ease;
      }
      .logout-btn:hover { background: rgba(248,113,113,0.06); border-color: rgba(248,113,113,0.15); }
      .logout-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }

      /* SIDEBAR MODE SWITCHER STYLE */
      .mode-switch-container {
        display: flex;
        width: 100%;
        padding: 0 16px;
        margin-bottom: 24px;
        justify-content: center;
      }
      .mode-switch {
        display: flex;
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 30px;
        padding: 4px;
        position: relative;
        cursor: pointer;
        width: 100%;
        user-select: none;
      }
      .mode-slider {
        position: absolute;
        top: 4px;
        left: 4px;
        bottom: 4px;
        width: calc(50% - 4px);
        background: var(--gradient-primary);
        border-radius: 25px;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: var(--shadow-glow);
      }
      .mode-slider.esports-active {
        transform: translateX(100%);
      }
      .mode-label {
        flex: 1;
        text-align: center;
        font-size: 13px;
        font-weight: 700;
        color: rgba(255,255,255,0.4);
        padding: 6px 0;
        z-index: 2;
        transition: color 0.3s;
      }
      .mode-label.active {
        color: #0F172A !important;
      }

      /* Cyber cyberpunk active item background override */
      .nav-container.esports-active-nav .nav-item.active {
        background: rgba(6, 182, 212, 0.08) !important;
      }
    }
  `]
})
export class BottomNavComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private esportsService = inject(EsportsService);

  private user = this.authService.currentUser;
  
  activeMode = this.esportsService.activeMode;

  toggleMode() {
    this.esportsService.toggleMode();
  }

  isAdmin(): boolean {
    const role = this.user()?.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  }

  isSuperAdmin(): boolean {
    return this.user()?.role === 'SUPER_ADMIN';
  }

  logout() {
    this.authService.logout();
  }
}
