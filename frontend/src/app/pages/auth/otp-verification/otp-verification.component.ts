import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="auth-container luxury-bg min-h-screen flex items-center justify-center">
      <div class="glass-card animate-fade-in">
        <div class="brand-header text-center mb-8">
          <div class="glow-icon">
            <mat-icon>mark_email_read</mat-icon>
          </div>
          <h1>Verify Identity</h1>
          <p>We've sent a 6-digit code to <br><strong>{{ email }}</strong></p>
        </div>

        <form [formGroup]="otpForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-6">
          <div class="otp-input-wrapper">
            <mat-form-field appearance="outline" class="premium-field">
              <mat-label>Verification Code</mat-label>
              <input matInput formControlName="otp" placeholder="123456" maxlength="6" 
                     class="text-center tracking-widest text-2xl font-bold">
              <mat-icon matSuffix>lock</mat-icon>
            </mat-form-field>
          </div>

          <button mat-flat-button class="verify-btn" type="submit" 
                  [disabled]="otpForm.invalid || loading">
            <span *ngIf="!loading">Confirm & Join</span>
            <span *ngIf="loading">Verifying...</span>
          </button>

          <div class="resend-section text-center">
            <p *ngIf="countdown > 0" class="text-sm text-gray-400">
              Resend code in <strong>{{ countdown }}s</strong>
            </p>
            <button mat-button *ngIf="countdown === 0" type="button" 
                    (click)="resendOtp()" class="resend-btn" [disabled]="loading">
              Didn't receive code? Resend
            </button>
          </div>
        </form>

        <button mat-button class="back-link mt-4" (click)="goBack()">
          <mat-icon>arrow_back</mat-icon> Use different email
        </button>
      </div>
    </div>
  `,
  styles: [`
    .luxury-bg {
      background: radial-gradient(circle at center, #1E293B, #0F172A);
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

    .glow-icon {
      width: 70px;
      height: 70px;
      background: rgba(74, 222, 128, 0.1);
      border: 1px solid var(--primary);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
      box-shadow: 0 0 20px rgba(74, 222, 128, 0.2);
    }

    .glow-icon mat-icon { color: var(--primary); font-size: 32px; width: 32px; height: 32px; }

    h1 { font-size: 28px; font-weight: 800; color: white; margin-bottom: 8px; letter-spacing: -0.5px; }
    p { color: rgba(255, 255, 255, 0.5); font-size: 15px; line-height: 1.5; }

    .premium-field ::ng-deep .mdc-text-field--outlined {
      background: rgba(255, 255, 255, 0.03);
      border-radius: 16px;
      height: 64px;
    }

    .text-center { text-align: center; }
    .tracking-widest { letter-spacing: 0.5em !important; }

    .verify-btn {
      height: 60px !important;
      background: var(--primary) !important;
      color: #0F172A !important;
      border-radius: 16px !important;
      font-weight: 800 !important;
      font-size: 16px !important;
      box-shadow: 0 10px 20px -5px rgba(74, 222, 128, 0.4);
    }

    .resend-btn { color: var(--primary); font-weight: 600; }
    .back-link { width: 100%; color: rgba(255, 255, 255, 0.3); font-size: 13px; }
  `]
})
export class OtpVerificationComponent implements OnInit {
  otpForm: FormGroup;
  email: string = '';
  loading = false;
  countdown = 60;
  timer: any;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'];
      if (!this.email) {
        this.router.navigate(['/auth/signup']);
      }
    });
    this.startCountdown();
  }

  startCountdown() {
    this.countdown = 60;
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (this.countdown > 0) this.countdown--;
      else clearInterval(this.timer);
    }, 1000);
  }

  resendOtp() {
    this.loading = true;
    this.authService.resendOtp(this.email).subscribe({
      next: () => {
        this.loading = false;
        this.snackBar.open('New OTP sent to your email! 📧', 'Close', { duration: 3000 });
        this.startCountdown();
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open(err.error?.error || 'Failed to resend OTP', 'Close', { duration: 3000 });
      }
    });
  }

  onSubmit() {
    if (this.otpForm.valid) {
      this.loading = true;
      this.authService.verifyEmailOtp(this.email, this.otpForm.value.otp).subscribe({
        next: () => {
          this.snackBar.open('Verification successful! Welcome to Playb! 🏏', 'Close', { duration: 4000 });
          this.router.navigate(['/matches']);
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(err.error?.error || 'Invalid or expired OTP', 'Close', { duration: 3000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/auth/signup']);
  }
}
