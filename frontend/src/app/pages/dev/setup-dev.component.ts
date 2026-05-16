import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../core/services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-setup-dev',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MatButtonModule, 
    MatFormFieldModule, MatInputModule, MatSelectModule, MatSnackBarModule
  ],
  template: `
    <div class="setup-container luxury-bg min-h-screen">
      <div class="setup-card glass-card animate-fade-in">
        <div class="header">
          <mat-icon class="dev-icon">terminal</mat-icon>
          <h1>CrickX Developer Setup</h1>
          <p>Bootstrap your administrative permissions</p>
        </div>

        <div class="form-content">
          <mat-form-field appearance="outline" class="full-width premium-field">
            <mat-label>User Email</mat-label>
            <input matInput [(ngModel)]="email" placeholder="e.g. boss424p@gmail.com" type="email">
            <mat-icon matSuffix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width premium-field">
            <mat-label>Elevate to Role</mat-label>
            <mat-select [(ngModel)]="role">
              <mat-option value="SUPER_ADMIN">⚡ Super Admin</mat-option>
              <mat-option value="ADMIN">🛡️ Turf Admin</mat-option>
              <mat-option value="PLAYER">👤 Player</mat-option>
            </mat-select>
          </mat-form-field>

          <button mat-flat-button class="promote-btn" (click)="promote()" [disabled]="!email || loading">
            <span *ngIf="!loading">Apply Permissions</span>
            <span *ngIf="loading">Promoting...</span>
            <mat-icon *ngIf="!loading">bolt</mat-icon>
          </button>
        </div>

        <div class="footer">
          <p>After promoting, please re-login to see the Admin Consoles.</p>
          <button mat-button color="primary" (click)="goHome()">Back to App</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .setup-container {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: radial-gradient(circle at center, #1E293B, #0F172A);
      color: white;
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 40px;
      width: 100%;
      max-width: 480px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .header { text-align: center; margin-bottom: 32px; }
    .dev-icon { font-size: 40px; width: 40px; height: 40px; color: var(--primary); margin-bottom: 16px; }
    .header h1 { font-size: 24px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
    .header p { color: var(--text-muted); font-size: 14px; margin-top: 8px; }

    .form-content { display: flex; flex-direction: column; gap: 20px; }
    .full-width { width: 100%; }

    .premium-field ::ng-deep .mdc-text-field--outlined {
      background: rgba(15, 23, 42, 0.4);
      border-radius: 12px;
    }

    .promote-btn {
      height: 54px !important;
      background: var(--primary) !important;
      color: #0F172A !important;
      border-radius: 12px !important;
      font-weight: 800 !important;
      font-size: 16px !important;
      margin-top: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .footer { text-align: center; margin-top: 32px; }
    .footer p { font-size: 12px; color: var(--text-muted); margin-bottom: 16px; }
  `]
})
export class SetupDevComponent {
  email = '';
  role = 'SUPER_ADMIN';
  loading = false;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  promote() {
    this.loading = true;
    this.adminService.promoteUser(this.email, this.role).subscribe({
      next: (res) => {
        this.loading = false;
        this.snackBar.open(res.message, 'Success', { duration: 5000 });
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.error || 'Promotion failed', 'Close', { duration: 5000 });
      }
    });
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
