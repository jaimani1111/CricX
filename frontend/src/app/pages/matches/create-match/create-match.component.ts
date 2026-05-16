import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { MatchService } from '../../../core/services/match.service';
import { LocationService } from '../../../core/services/location.service';

@Component({
  selector: 'app-create-match',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatSlideToggleModule, MatTooltipModule
  ],
  template: `
    <div class="page-container luxury-bg min-h-screen">
      <div class="glass-header">
        <button mat-icon-button (click)="goBack()" class="back-btn">
          <mat-icon>arrow_back_ios</mat-icon>
        </button>
        <div class="header-text">
          <h1>Host Casual Match</h1>
          <p>Organize a friendly pickup game nearby</p>
        </div>
      </div>

      <div class="create-content animate-fade-in-up">
        <form [formGroup]="matchForm" (ngSubmit)="onSubmit()" class="luxury-form">
          <!-- Sport Selection Chips/Select -->
          <div class="form-section">
            <h3>1. What are we playing?</h3>
            <mat-form-field appearance="outline" class="full-width premium-field">
              <mat-label>Select Sport</mat-label>
              <mat-select formControlName="sport">
                <mat-option *ngFor="let s of sports" [value]="s.name">
                  <span class="option-content">
                    <span class="opt-icon">{{ s.icon }}</span>
                    {{ s.name }}
                  </span>
                </mat-option>
              </mat-select>
              <mat-icon matSuffix>sports_cricket</mat-icon>
            </mat-form-field>
          </div>

          <!-- Location -->
          <div class="form-section">
            <h3>2. Where & When?</h3>
            <mat-form-field appearance="outline" class="full-width premium-field">
              <mat-label>Location / Turf Name</mat-label>
              <input matInput formControlName="locationName">
              <mat-icon matSuffix>my_location</mat-icon>
            </mat-form-field>
            
            <div class="datetime-row">
              <mat-form-field appearance="outline" class="premium-field">
                <mat-label>Date & Time</mat-label>
                <input matInput type="datetime-local" formControlName="dateTime">
              </mat-form-field>
            </div>
          </div>

          <!-- Players & Cost -->
          <div class="form-section">
            <h3>3. Capacity & Pricing</h3>
            <div class="fields-grid">
              <mat-form-field appearance="outline" class="premium-field">
                <mat-label>Total Slots</mat-label>
                <input matInput type="number" formControlName="totalPlayers">
                <mat-hint>Even number recommended for teams</mat-hint>
              </mat-form-field>

              <mat-form-field appearance="outline" class="premium-field">
                <mat-label>Cost per Player (₹)</mat-label>
                <input matInput type="number" formControlName="costPerPlayer">
                <mat-hint>0 for free friendly</mat-hint>
              </mat-form-field>
            </div>
          </div>

          <button mat-flat-button class="submit-action-btn" type="submit" 
                  [disabled]="matchForm.invalid || creating || locating">
            <div class="btn-content" *ngIf="!creating">
              <span>Create Match</span>
              <mat-icon>bolt</mat-icon>
            </div>
            <span *ngIf="creating">Publishing...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      padding-bottom: 40px;
    }

    .luxury-bg {
      background: radial-gradient(circle at top right, #1E293B, #0F172A);
      color: white;
    }

    .glass-header {
      background: rgba(15, 23, 42, 0.8);
      backdrop-filter: blur(20px);
      padding: 60px 24px 30px;
      display: flex;
      align-items: center;
      gap: 20px;
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .back-btn { color: var(--primary); }

    .header-text h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .header-text p {
      margin: 0;
      font-size: 14px;
      color: var(--text-muted);
    }

    .create-content {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }

    .luxury-form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .form-section h3 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 16px;
      color: var(--primary);
    }

    .full-width { width: 100%; }

    .premium-field ::ng-deep .mdc-text-field--outlined {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
    }

    .premium-field ::ng-deep .mdc-notched-outline__leading,
    .premium-field ::ng-deep .mdc-notched-outline__notch,
    .premium-field ::ng-deep .mdc-notched-outline__trailing {
      border-color: rgba(255, 255, 255, 0.1) !important;
    }

    .premium-field:focus-within ::ng-deep .mdc-notched-outline__leading,
    .premium-field:focus-within ::ng-deep .mdc-notched-outline__notch,
    .premium-field:focus-within ::ng-deep .mdc-notched-outline__trailing {
      border-color: var(--primary) !important;
      border-width: 2px !important;
    }

    .challenge-toggle-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(74, 222, 128, 0.05);
      padding: 20px;
      border-radius: 16px;
      border: 1px solid rgba(74, 222, 128, 0.1);
    }

    .toggle-info h3 { margin: 0; color: white !important; }
    .toggle-info p { margin: 4px 0 0; font-size: 12px; color: var(--text-muted); }

    .team-names-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .vs-text {
      font-weight: 900;
      font-style: italic;
      color: var(--text-muted);
      opacity: 0.4;
    }

    .fields-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .datetime-row { width: 100%; }

    .submit-action-btn {
      margin-top: 20px;
      height: 56px !important;
      background: var(--primary) !important;
      color: #0F172A !important;
      border-radius: 16px !important;
      font-weight: 800 !important;
      font-size: 16px !important;
      box-shadow: 0 10px 15px -3px rgba(74, 222, 128, 0.3);
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .option-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .opt-icon { font-size: 20px; }
  `]
})
export class CreateMatchComponent implements OnInit {
  matchForm: FormGroup;
  creating = false;
  locating = true;
  lat = 0;
  lng = 0;

  sports = [
    { name: 'Cricket', icon: '🏏' },
    { name: 'Football', icon: '⚽' },
    { name: 'Tennis', icon: '🎾' },
    { name: 'Basketball', icon: '🏀' },
    { name: 'Table Tennis', icon: '🏓' },
    { name: 'Badminton', icon: '🏸' },
    { name: 'Pickleball', icon: '🥒' }
  ];

  constructor(
    private fb: FormBuilder,
    private matchService: MatchService,
    private locationService: LocationService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const now = new Date();
    now.setHours(now.getHours() + 2);
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    this.matchForm = this.fb.group({
      sport: ['Cricket', Validators.required],
      isTeamChallenge: [false],
      teamAName: [''],
      teamBName: [''],
      locationName: ['', Validators.required],
      dateTime: [localDateTime, Validators.required],
      totalPlayers: [12, [Validators.required, Validators.min(2)]],
      costPerPlayer: [0, [Validators.required, Validators.min(0)]],
      matchType: ['CASUAL'],
      skillLevel: ['ANY'],
      description: ['']
    });
  }

  async ngOnInit() {
    try {
      const loc = await this.locationService.getCurrentLocation();
      this.lat = loc.latitude;
      this.lng = loc.longitude;
      if (loc.locationName) {
        this.matchForm.patchValue({ locationName: loc.locationName });
      }
    } catch {
      this.lat = 19.076;
      this.lng = 72.8777;
    }
    this.locating = false;
  }

  goBack() {
    this.router.navigate(['/matches']);
  }

  onSubmit() {
    if (this.matchForm.valid && !this.locating) {
      this.creating = true;
      const data = {
        ...this.matchForm.value,
        latitude: this.lat,
        longitude: this.lng,
        dateTime: new Date(this.matchForm.value.dateTime).toISOString()
      };

      this.matchService.createMatch(data).subscribe({
        next: (match) => {
          this.snackBar.open('Activity hosted successfully! ⚡', 'Close', { duration: 3000 });
          this.router.navigate(['/matches', match.id]);
        },
        error: (err) => {
          this.creating = false;
          this.snackBar.open(err.error?.error || 'Failed to host activity', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
