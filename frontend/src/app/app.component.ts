import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, RouterLink } from '@angular/router';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { AuthService } from './core/auth/auth.service';
import { EsportsService } from './core/services/esports.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, BottomNavComponent],
  template: `
    <div class="app-shell" [class.with-nav]="showNav()">
      <!-- Mobile Sticky Top Header with Playb Brand Branding -->
      <header class="mobile-top-header" *ngIf="showNav()">
        <div class="brand-mobile" (click)="goToDashboard()">
          <div class="logo-box-m">P<span>b</span></div>
          <span class="logo-text-m">Playb</span>
        </div>

        <!-- Mobile Compact Mode Switcher -->
        <div class="compact-mode-switch" (click)="toggleMode()">
          <div class="compact-slider" [class.esports-active]="activeMode() === 'esports'"></div>
          <span class="compact-label" [class.active]="activeMode() === 'sports'">S</span>
          <span class="compact-label" [class.active]="activeMode() === 'esports'">E</span>
        </div>

        <div class="header-actions">
          <a routerLink="/profile" class="profile-avatar-m" *ngIf="currentUser()">
            <img *ngIf="currentUser()?.profilePicture" [src]="currentUser()?.profilePicture" alt="Profile" />
            <div *ngIf="!currentUser()?.profilePicture" class="avatar-fallback">
              {{ currentUser()?.name?.charAt(0)?.toUpperCase() }}
            </div>
          </a>
        </div>
      </header>

      <app-bottom-nav *ngIf="showNav()"></app-bottom-nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      width: 100%;
    }

    /* PREMIUM MOBILE STICKY TOP BRAND HEADER */
    .mobile-top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 64px;
      padding: 0 16px;
      background: rgba(15, 23, 42, 0.85);
      backdrop-filter: blur(16px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      position: sticky;
      top: 0;
      z-index: 999;
    }

    .brand-mobile {
      display: flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }

    .logo-box-m {
      width: 32px;
      height: 32px;
      background: var(--gradient-primary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      color: #0F172A;
      font-size: 14px;
    }

    .logo-box-m span {
      color: white;
      opacity: 0.8;
    }

    .logo-text-m {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: white;
    }

    /* COMPACT MOBILE SWITCH */
    .compact-mode-switch {
      display: flex;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 20px;
      padding: 2px;
      position: relative;
      cursor: pointer;
      width: 80px;
      user-select: none;
    }
    .compact-slider {
      position: absolute;
      top: 2px;
      left: 2px;
      bottom: 2px;
      width: calc(50% - 2px);
      background: var(--gradient-primary);
      border-radius: 18px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: var(--shadow-glow);
    }
    .compact-slider.esports-active {
      transform: translateX(100%);
    }
    .compact-label {
      flex: 1;
      text-align: center;
      font-size: 11px;
      font-weight: 800;
      color: rgba(255,255,255,0.4);
      padding: 4px 0;
      z-index: 2;
      transition: color 0.3s;
    }
    .compact-label.active {
      color: #0F172A !important;
    }

    .profile-avatar-m {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid rgba(255, 255, 255, 0.15);
      background: rgba(255, 255, 255, 0.05);
      text-decoration: none;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .profile-avatar-m:hover {
      border-color: var(--primary);
    }

    .profile-avatar-m img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .avatar-fallback {
      font-size: 14px;
      font-weight: 700;
      color: var(--primary);
    }

    @media (min-width: 1024px) {
      .mobile-top-header {
        display: none !important;
      }
      .app-shell.with-nav {
        flex-direction: row;
      }
      .app-shell.with-nav .main-content {
        padding-left: var(--sidebar-width);
      }
    }
  `]
})
export class AppComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private esportsService = inject(EsportsService);

  showNav = computed(() => this.authService.isLoggedIn());
  currentUser = this.authService.currentUser;

  activeMode = this.esportsService.activeMode;

  toggleMode() {
    this.esportsService.toggleMode();
  }

  goToDashboard() {
    const role = this.currentUser()?.role;
    if (role === 'ADMIN' || role === 'SUPER_ADMIN') {
      this.router.navigate(['/admin/turf'], { queryParams: { tab: 'dashboard' } });
    } else {
      this.router.navigate(['/matches']);
    }
  }
}
