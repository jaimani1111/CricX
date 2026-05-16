import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './shared/components/bottom-nav/bottom-nav.component';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, BottomNavComponent],
  template: `
    <div class="app-shell" [class.with-nav]="showNav()">
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

    @media (min-width: 1024px) {
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
  showNav = computed(() => this.authService.isLoggedIn());

  constructor(private authService: AuthService) {}
}
