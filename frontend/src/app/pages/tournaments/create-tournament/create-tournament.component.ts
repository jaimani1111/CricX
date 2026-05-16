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
import { TournamentService } from '../../../core/services/tournament.service';
import { LocationService } from '../../../core/services/location.service';

@Component({
  selector: 'app-create-tournament',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatSnackBarModule
  ],
  template: `
    <div class="page-container">
      <div class="page-header">
        <a routerLink="/tournaments" class="back-link">
          <mat-icon>arrow_back</mat-icon>
          <span>Back to Tournaments</span>
        </a>
        <h1>🏆 Create Tournament</h1>
        <p class="subtitle">Set up a competitive event for players</p>
      </div>

      <div class="form-card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()">

          <mat-form-field appearance="outline" class="full-width premium-field">
            <mat-label>Tournament Name</mat-label>
            <input matInput formControlName="title" placeholder="e.g. Weekend Cricket Championship">
            <mat-icon matSuffix>emoji_events</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width premium-field">
            <mat-label>Description</mat-label>
            <textarea matInput formControlName="description" rows="3" placeholder="Describe the tournament format, rules, prizes..."></textarea>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="premium-field">
              <mat-label>Sport</mat-label>
              <mat-select formControlName="sport">
                <mat-option value="Cricket">Cricket</mat-option>
                <mat-option value="Football">Football</mat-option>
                <mat-option value="Badminton">Badminton</mat-option>
                <mat-option value="Basketball">Basketball</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="premium-field">
              <mat-label>Max Participants</mat-label>
              <input matInput type="number" formControlName="maxTeams" min="2" max="64">
              <mat-icon matSuffix>groups</mat-icon>
            </mat-form-field>
          </div>

          <mat-form-field appearance="outline" class="full-width premium-field">
            <mat-label>Location / Venue</mat-label>
            <input matInput formControlName="locationName" placeholder="e.g. Oval Maidan, Mumbai">
            <mat-icon matSuffix>location_on</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width premium-field">
            <mat-label>Date & Time</mat-label>
            <input matInput type="datetime-local" formControlName="dateTime">
            <mat-icon matSuffix>calendar_today</mat-icon>
          </mat-form-field>

          <div class="form-row">
            <mat-form-field appearance="outline" class="premium-field">
              <mat-label>Entry Fee (₹)</mat-label>
              <input matInput type="number" formControlName="entryFee" min="0" placeholder="0 for free">
              <mat-icon matSuffix>currency_rupee</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="premium-field">
              <mat-label>Prize Pool (₹)</mat-label>
              <input matInput type="number" formControlName="prizePool" min="0" placeholder="0">
              <mat-icon matSuffix>workspace_premium</mat-icon>
            </mat-form-field>
          </div>

          <button mat-flat-button class="submit-btn" type="submit" [disabled]="form.invalid || loading">
            <mat-icon>rocket_launch</mat-icon>
            {{ loading ? 'Creating...' : 'Launch Tournament' }}
          </button>

        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
      padding-bottom: 100px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-muted);
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 16px;
      transition: color 0.2s;
    }
    .back-link:hover { color: var(--primary); }
    .back-link mat-icon { font-size: 18px; width: 18px; height: 18px; }

    h1 {
      font-size: 28px;
      font-weight: 800;
      color: white;
      letter-spacing: -0.5px;
      margin: 0;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 14px;
      margin-top: 4px;
      margin-bottom: 24px;
    }

    .form-card {
      background: var(--bg-secondary);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 24px;
      padding: 32px;
    }

    .full-width { width: 100%; }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .premium-field ::ng-deep .mdc-text-field--outlined {
      background: rgba(255, 255, 255, 0.02) !important;
      border-radius: 14px !important;
    }

    .submit-btn {
      width: 100%;
      height: 56px !important;
      background: var(--gradient-primary) !important;
      color: #0F172A !important;
      border-radius: 16px !important;
      font-weight: 800 !important;
      font-size: 16px !important;
      box-shadow: 0 10px 30px rgba(74, 222, 128, 0.3);
      margin-top: 16px;
      display: flex !important;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .submit-btn:hover {
      box-shadow: 0 15px 40px rgba(74, 222, 128, 0.4);
    }

    @media (max-width: 600px) {
      .form-row { grid-template-columns: 1fr; }
      .form-card { padding: 20px; }
    }
  `]
})
export class CreateTournamentComponent {
  form: FormGroup;
  loading = false;
  lat = 0;
  lng = 0;

  constructor(
    private fb: FormBuilder,
    private tournamentService: TournamentService,
    private locationService: LocationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      sport: ['Cricket', Validators.required],
      locationName: ['', Validators.required],
      dateTime: ['', Validators.required],
      entryFee: [0],
      prizePool: [0],
      maxTeams: [8, [Validators.required, Validators.min(2)]]
    });

    this.locationService.getCurrentLocation().then(loc => {
      this.lat = loc.latitude;
      this.lng = loc.longitude;
      if (loc.locationName) {
        this.form.patchValue({ locationName: loc.locationName });
      }
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      const data = { 
        ...this.form.value,
        latitude: this.lat,
        longitude: this.lng,
        dateTime: new Date(this.form.value.dateTime).toISOString()
      };

      this.tournamentService.create(data).subscribe({
        next: () => {
          this.snackBar.open('🏆 Tournament created!', 'Close', { duration: 3000 });
          this.router.navigate(['/tournaments']);
        },
        error: (err) => {
          this.loading = false;
          this.snackBar.open(err.error?.message || 'Failed to create tournament', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
