import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatCheckboxModule
  ],
  template: `
    <div class="auth-container luxury-bg min-h-screen">
      <div class="glass-card animate-fade-in-up">
        <div class="auth-header">
          <mat-icon class="logo-icon">person_add</mat-icon>
          <h1>Create Account</h1>
          <p>Join the premium sports community</p>
        </div>

        <form [formGroup]="signupForm" (ngSubmit)="onSubmit()" class="auth-form">
          <mat-form-field appearance="outline" class="premium-field">
            <mat-label>Full Name</mat-label>
            <input matInput formControlName="name" placeholder="Enter your name">
            <mat-icon matSuffix>person</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="premium-field">
            <mat-label>Username</mat-label>
            <input matInput formControlName="username" placeholder="Choose a unique username">
            <mat-icon matSuffix>alternate_email</mat-icon>
            <mat-error *ngIf="signupForm.get('username')?.hasError('required')">Username is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="premium-field">
            <mat-label>Email</mat-label>
            <input matInput type="email" formControlName="email" placeholder="Enter your email">
            <mat-icon matSuffix>email</mat-icon>
            <mat-error *ngIf="signupForm.get('email')?.hasError('required')">Email is required</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="premium-field">
            <mat-label>Password</mat-label>
            <input matInput [type]="hidePassword ? 'password' : 'text'" formControlName="password" placeholder="Min. 6 characters">
            <button mat-icon-button matSuffix (click)="hidePassword = !hidePassword" type="button">
              <mat-icon>{{hidePassword ? 'visibility_off' : 'visibility'}}</mat-icon>
            </button>
            <mat-error *ngIf="signupForm.get('password')?.hasError('required')">Password is required</mat-error>
          </mat-form-field>

          <div class="selection-grid">
            <mat-form-field appearance="outline" class="premium-field">
              <mat-label>Skill Level</mat-label>
              <mat-select formControlName="skill">
                <mat-option value="BEGINNER">Beginner</mat-option>
                <mat-option value="INTERMEDIATE">Intermediate</mat-option>
                <mat-option value="ADVANCED">Advanced</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="premium-field">
              <mat-label>Preferred Role</mat-label>
              <mat-select formControlName="preferredRole">
                <mat-option value="BATSMAN">Batsman</mat-option>
                <mat-option value="BOWLER">Bowler</mat-option>
                <mat-option value="ALL_ROUNDER">All Rounder</mat-option>
                <mat-option value="WICKET_KEEPER">Wicket Keeper</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <button mat-flat-button class="submit-action-btn" type="submit" [disabled]="signupForm.invalid || isLoading">
            <span *ngIf="!isLoading">Create Account</span>
            <span *ngIf="isLoading">Creating account...</span>
            <mat-icon *ngIf="!isLoading">bolt</mat-icon>
          </button>
        </form>

        <div class="auth-footer">
          <p>Already have an account? <a routerLink="/auth/login">Login here</a></p>
          <div class="divider"><span>OR</span></div>
          <p>Are you a Turf Owner? <a routerLink="/auth/partner-signup">Register as Partner</a></p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .luxury-bg {
      background: radial-gradient(circle at top right, #1E293B, #0F172A);
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
      max-width: 480px;
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

    .selection-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .auth-footer { text-align: center; margin-top: 24px; color: var(--text-muted); font-size: 14px; }
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
      color: var(--text-muted);
    }

    .partner-toggle {
      margin: -8px 0 16px 4px;
      color: var(--text-secondary);
    }
    .partner-toggle ::ng-deep .mdc-label {
      font-size: 14px;
      font-weight: 600;
      color: white !important;
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

    .auth-footer { text-align: center; font-size: 14px; color: rgba(255, 255, 255, 0.4); }
    .auth-footer a { color: var(--primary); font-weight: 700; text-decoration: none; }
  `]
})
export class SignupComponent {
  signupForm: FormGroup;
  hidePassword = true;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      skill: ['INTERMEDIATE'],
      preferredRole: ['ALL_ROUNDER'],
      isPartner: [false]
    });
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.authService.signup(this.signupForm.value).subscribe({
        next: () => {
          this.snackBar.open('Account created successfully! 🎉', 'Close', { duration: 3000 });
          // In DEV MODE the backend auto-verifies and logs in, so we go directly to app
          this.router.navigate(['/matches']);
        },
        error: (err) => {
          this.isLoading = false;
          this.snackBar.open(err.error?.error || 'Signup failed', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
