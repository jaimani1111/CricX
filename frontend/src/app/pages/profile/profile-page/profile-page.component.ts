import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/auth/auth.service';
import { User } from '../../../core/models/user.model';
import { PlayerService } from '../../../core/services/player.service';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule, MatSnackBarModule],
  template: `
    <div class="page-container luxury-bg min-h-screen" *ngIf="user">
      <!-- Premium Hero Header -->
      <div class="profile-hero animate-fade-in-up">
        <div class="hero-actions">
          <button mat-icon-button (click)="goBack()" class="back-btn"><mat-icon>arrow_back_ios</mat-icon></button>
          <button mat-icon-button class="edit-btn"><mat-icon>settings</mat-icon></button>
        </div>
        
        <div class="avatar-container" (click)="fileInput.click()">
          <div class="avatar-glow"></div>
          <div class="avatar-main" [style.background-image]="user.profilePicture ? 'url(' + user.profilePicture + ')' : ''" [class.has-photo]="!!user.profilePicture">
            <span *ngIf="!user.profilePicture">{{ user.name.charAt(0).toUpperCase() }}</span>
            <div class="photo-overlay">
              <mat-icon>photo_camera</mat-icon>
            </div>
          </div>
          <div class="role-badge" [class]="user.role.toLowerCase()">{{ user.role }}</div>
          
          <input #fileInput type="file" (change)="onFileSelected($event)" accept="image/*" style="display: none">
        </div>

        <div class="user-info">
          <h1>{{ user.name }}</h1>
          <p class="username-handle">@{{ user.username }}</p>
          <p class="email-text">{{ user.email }}</p>
        </div>

        <!-- Global Stats Row -->
        <div class="stats-row glass-card">
          <div class="stat-item">
            <span class="val">⭐ {{ user.rating ? user.rating.toFixed(1) : 'New' }}</span>
            <span class="lab">Community Rating</span>
          </div>
          <div class="divider"></div>
          <div class="stat-item">
            <span class="val">{{ user.skill || 'Beginner' }}</span>
            <span class="lab">Skill Level</span>
          </div>
        </div>
      </div>

      <!-- Quick Action Menu -->
      <div class="menu-content card-stagger animate-fade-in-up">
        
        <!-- Admin Entry (Dynamic) -->
        <div class="admin-section" *ngIf="user.role === 'SUPER_ADMIN' || user.role === 'ADMIN'">
          <h3>Administrative Controls</h3>
          <div class="glass-card menu-item admin-card" *ngIf="user.role === 'SUPER_ADMIN'" (click)="goTo('/admin/super')">
            <div class="m-icon super"><mat-icon>security</mat-icon></div>
            <div class="m-text">
              <span class="title">Super Admin Console</span>
              <span class="subtitle">Global moderation & sport management</span>
            </div>
            <mat-icon class="chevron">chevron_right</mat-icon>
          </div>

          <div class="glass-card menu-item admin-card" *ngIf="user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'" (click)="goTo('/admin/turf')">
            <div class="m-icon turf"><mat-icon>business</mat-icon></div>
            <div class="m-text">
              <span class="title">Venue Partner Dashboard</span>
              <span class="subtitle">Update turf pricing & availability</span>
            </div>
            <mat-icon class="chevron">chevron_right</mat-icon>
          </div>
        </div>

        <!-- Player Menu -->
        <div class="player-section">
          <h3>Your Activity</h3>
          <div class="glass-card menu-item" (click)="goTo('/matches')">
            <div class="m-icon blue"><mat-icon>history</mat-icon></div>
            <div class="m-text">
              <span class="title">My Joined Matches</span>
              <span class="subtitle">View upcoming fixtures & results</span>
            </div>
            <mat-icon class="chevron">chevron_right</mat-icon>
          </div>

          <div class="glass-card menu-item" (click)="goTo('/matches/create')">
            <div class="m-icon green"><mat-icon>bolt</mat-icon></div>
            <div class="m-text">
              <span class="title">Host New Activity</span>
              <span class="subtitle">Organize a match or team challenge</span>
            </div>
            <mat-icon class="chevron">chevron_right</mat-icon>
          </div>
        </div>

        <!-- Account Security -->
        <div class="account-section">
          <button class="logout-btn" (click)="logout()">
            <mat-icon>logout</mat-icon> Log Out
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .luxury-bg { background: #0F172A; color: white; }

    .profile-hero {
      background: linear-gradient(180deg, rgba(74, 222, 128, 0.1) 0%, rgba(15, 23, 42, 0) 100%);
      padding: 60px 24px 40px;
      text-align: center;
      position: relative;
    }

    .hero-actions {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    .back-btn, .edit-btn { color: white; background: rgba(255, 255, 255, 0.05); }

    .avatar-container {
      position: relative;
      width: 120px;
      height: 120px;
      margin: 0 auto 24px;
      flex-shrink: 0;
      aspect-ratio: 1 / 1;
      cursor: pointer;
    }

    .avatar-glow {
      position: absolute;
      top: -10px; left: -10px; right: -10px; bottom: -10px;
      background: var(--primary);
      filter: blur(25px);
      opacity: 0.2;
      border-radius: 50%;
    }

    .avatar-main {
      position: relative;
      width: 100%; height: 100%;
      background: #1E293B;
      border: 2px solid var(--primary);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 48px; font-weight: 800; color: var(--primary);
      z-index: 2;
      overflow: hidden;
    }
    .avatar-main.has-photo {
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    .photo-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.2s;
      z-index: 5;
      color: white;
    }
    .avatar-container:hover .photo-overlay {
      opacity: 1;
    }
    .photo-overlay mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .role-badge {
      position: absolute;
      bottom: 0; right: 0;
      background: var(--primary);
      color: #0F172A;
      font-size: 10px;
      font-weight: 800;
      padding: 4px 10px;
      border-radius: 100px;
      z-index: 3;
      text-transform: uppercase;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }
    .role-badge.super_admin { background: #F59E0B; }
    .role-badge.admin { background: #3B82F6; color: white; }

    .user-info h1 { font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -1px; }
    .user-info .username-handle { color: var(--primary); font-size: 16px; font-weight: 700; margin: 6px 0 2px; }
    .user-info .email-text { color: var(--text-muted); margin: 0; font-size: 13px; }

    .stats-row {
      display: flex;
      margin-top: 30px;
      padding: 20px !important;
      justify-content: space-around;
      align-items: center;
    }
    .stat-item { flex: 1; display: flex; flex-direction: column; }
    .stat-item .val { font-size: 18px; font-weight: 800; color: var(--primary); }
    .stat-item .lab { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; margin-top: 4px; }
    .divider { width: 1px; height: 30px; background: rgba(255,255,255,0.05); }

    .menu-content { padding: 40px 24px 100px; }

    /* Desktop Adjustments */
    @media (min-width: 1024px) {
      .profile-hero {
        padding: 80px var(--spacing-xxl) 40px;
        text-align: left;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 40px;
      }
      .avatar-container { margin: 0; }
      .user-info { text-align: left; flex: 1; }
      .stats-row { margin-left: auto; min-width: 400px; margin-top: 0; }
      
      .menu-content {
        padding: 40px var(--spacing-xxl);
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
      }
      .account-section { grid-column: span 2; max-width: 300px; }
    }

    h3 {
      font-size: 12px; font-weight: 800; color: var(--text-muted);
      text-transform: uppercase; letter-spacing: 1px;
      margin-bottom: 20px;
    }

    .admin-section, .player-section { margin-bottom: 40px; }

    .player-section { margin-bottom: 40px; }

    .glass-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      backdrop-filter: blur(12px);
    }

    .menu-item {
      display: flex; align-items: center; gap: 16px;
      padding: 20px;
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .menu-item:hover { background: rgba(255,255,255,0.03); transform: translateX(8px); border-color: var(--primary); }

    .m-icon {
      width: 44px; height: 44px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.03);
    }
    .m-icon.super { color: #F59E0B; background: rgba(245, 158, 11, 0.1); }
    .m-icon.turf { color: #3B82F6; background: rgba(59, 130, 246, 0.1); }
    .m-icon.blue { color: #3B82F6; }
    .m-icon.green { color: var(--primary); }

    .m-text { flex: 1; display: flex; flex-direction: column; }
    .m-text .title { font-weight: 700; font-size: 15px; }
    .m-text .subtitle { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

    .chevron { color: var(--text-muted); font-size: 20px; }

    .logout-btn {
      width: 100%; height: 56px;
      background: rgba(248, 113, 113, 0.1);
      color: #F87171;
      border: 1px solid rgba(248, 113, 113, 0.2);
      border-radius: 16px;
      font-weight: 700;
      display: flex; align-items: center; justify-content: center; gap: 10px;
      cursor: pointer;
    }
  `]
})
export class ProfilePageComponent implements OnInit {
  user: User | null = null;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private playerService: PlayerService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.user = this.authService.currentUser() as unknown as User;
    if (this.user && !this.user.skill) this.user.skill = 'INTERMEDIATE';
  }

  savePreferences() {
    if (!this.user) return;
    this.playerService.updateProfile({ 
      skill: this.user.skill, 
      preferredRole: this.user.preferredRole 
    }).subscribe({
      next: () => {
        this.authService.updateStoredUser({ 
          skill: this.user!.skill, 
          preferredRole: this.user!.preferredRole 
        });
        this.snackBar.open('Preferences saved', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Failed to save', 'Close', { duration: 2000 })
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      if (this.user) {
        // Optimistic UI updates
        this.user.profilePicture = base64String;
        
        // Save to backend database!
        this.playerService.updateProfile({ profilePicture: base64String }).subscribe({
          next: (updatedUser) => {
            // Update auth state so it is persistent across navigations
            this.authService.updateStoredUser({ profilePicture: base64String });
          },
          error: (err) => {
            console.error('Failed to update profile photo', err);
          }
        });
      }
    };
    reader.readAsDataURL(file);
  }

  goBack() {
    this.router.navigate(['/matches']);
  }

  goTo(path: string) {
    this.router.navigate([path]);
  }

  logout() {
    this.authService.logout();
  }
}
