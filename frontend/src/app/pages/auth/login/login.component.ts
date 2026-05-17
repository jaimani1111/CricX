import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="auth-container luxury-bg min-h-screen">
      <div class="glass-card animate-fade-in-up">
        <div class="auth-header">
          <mat-icon class="logo-icon">sports_cricket</mat-icon>
          <h1>Welcome Back</h1>
          <p>Login to continue your sports journey</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="premium-field">
            <mat-label>Username</mat-label>
            <input matInput type="text" formControlName="username" placeholder="Enter your username">
            <mat-icon matSuffix>alternate_email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="premium-field">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password">
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
          </mat-form-field>

          <button mat-flat-button class="submit-action-btn" type="submit" [disabled]="loginForm.invalid || isLoading">
            {{ isLoading ? 'Checking credentials...' : 'Login' }}
          </button>

        <div class="auth-footer">
          <p>New here? <a routerLink="/auth/signup">Create player account</a></p>
          <div class="divider"><span>OR</span></div>
          <p>Are you a Partner? <a routerLink="/auth/partner-signup">Register as Partner</a></p>
        </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .luxury-bg {
      background: radial-gradient(circle at bottom left, #1E293B, #0F172A);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .glass-card {
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 32px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .auth-header { text-align: center; margin-bottom: 32px; }
    .logo-icon { font-size: 40px; width: 40px; height: 40px; color: var(--primary); margin-bottom: 12px; }
    h1 { font-size: 28px; font-weight: 800; color: white; margin-bottom: 4px; letter-spacing: -0.5px; }
    p { color: rgba(255, 255, 255, 0.5); font-size: 14px; }

    .auth-form { display: flex; flex-direction: column; gap: 20px; }

    .premium-field ::ng-deep .mdc-text-field--outlined {
      background: rgba(255, 255, 255, 0.02) !important;
      border-radius: 14px !important;
    }

    .submit-action-btn {
      height: 56px !important;
      background: var(--primary) !important;
      color: #0F172A !important;
      border-radius: 16px !important;
      font-weight: 800 !important;
      font-size: 16px !important;
      box-shadow: 0 10px 20px -5px rgba(74, 222, 128, 0.4);
      margin-top: 10px;
    }

    .auth-footer { text-align: center; margin-top: 24px; color: rgba(255, 255, 255, 0.4); font-size: 14px; }
    .auth-footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
    
    .divider {
      margin: 16px 0;
      height: 1px;
      background: rgba(255,255,255,0.06);
      position: relative;
    }
    .divider span {
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      background: #0F172A;
      padding: 0 12px;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.4);
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const { username, password } = this.loginForm.value;
      this.authService.login(username, password).subscribe({
        next: (res) => {
          if (res?.role === 'ADMIN' || res?.role === 'SUPER_ADMIN') {
            this.router.navigate(['/admin/turf'], { queryParams: { tab: 'dashboard' } });
          } else {
            this.router.navigate(['/matches']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          const errorMsg = err.error?.error || '';
          this.snackBar.open(errorMsg || 'Login failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
