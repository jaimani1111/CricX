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

import { ChallengeService } from '../../../core/services/challenge.service';
import { LocationService } from '../../../core/services/location.service';
import { AdminService } from '../../../core/services/admin.service';
import { Turf } from '../../../core/models/turf.model';
import { SUPPORTED_SPORTS } from '../../../core/models/sport.model';

@Component({
  selector: 'app-create-challenge',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule
  ],
  template: `
    <div class="page-container luxury-bg min-h-screen">
      <div class="header glass-header">
        <button mat-icon-button (click)="goBack()" class="back-btn"><mat-icon>arrow_back_ios</mat-icon></button>
        <div class="header-text">
          <h1>Throw a Challenge</h1>
          <p>Find a worthy opponent for your team</p>
        </div>
      </div>

      <div class="create-content animate-fade-in-up">
        <form [formGroup]="challengeForm" (ngSubmit)="onSubmit()" class="luxury-form">
          <div class="form-section">
            <h3>1. Team Info</h3>
            <mat-form-field appearance="outline" class="full-width premium-field">
              <mat-label>Your Team Name</mat-label>
              <input matInput formControlName="teamName" placeholder="e.g. Mumbai Indians CC">
              <mat-icon matSuffix>groups</mat-icon>
            </mat-form-field>
          </div>

          <div class="form-section">
            <h3>2. Select Sport</h3>
            <div class="sport-grid">
              <div class="sport-item" *ngFor="let s of sports" 
                   [class.active]="challengeForm.get('sportId')?.value === s.id"
                   (click)="challengeForm.patchValue({sportId: s.id})">
                <div class="sport-icon-circle">
                  <mat-icon>{{ s.icon }}</mat-icon>
                </div>
                <span>{{ s.name }}</span>
              </div>
            </div>
          </div>

          <div class="form-section">
            <div class="flex-row">
               <h3>3. Venue & Time</h3>
               <div class="toggle-pill" (click)="toggleBooking()">
                  <span [class.active]="!bookTurf">Manual</span>
                  <span [class.active]="bookTurf">Book Venue</span>
               </div>
            </div>
            
            <div *ngIf="!bookTurf" class="animate-fade-in">
              <mat-form-field appearance="outline" class="full-width premium-field">
                <mat-label>Ground / Location</mat-label>
                <input matInput formControlName="locationName">
                <mat-icon matSuffix>place</mat-icon>
              </mat-form-field>
              <p class="helper-text" *ngIf="locating">Detecting accurate location...</p>
            </div>

            <div *ngIf="bookTurf" class="turf-picker animate-fade-in">
               <div class="turf-scroll">
                  <div class="turf-mini-card" *ngFor="let t of nearbyTurfs" 
                       [class.selected]="selectedTurf?.id === t.id"
                       (click)="selectTurf(t)">
                     <div class="t-img"><mat-icon>stadium</mat-icon></div>
                     <div class="t-info">
                        <span class="t-name">{{ t.name }}</span>
                        <span class="t-sub">₹{{ t.basePricePerHour }}/hr • {{ t.district }}</span>
                     </div>
                  </div>
               </div>
               <p class="empty-hint" *ngIf="nearbyTurfs.length === 0">Searching for turfs in your city...</p>
            </div>

            <mat-form-field appearance="outline" class="full-width premium-field mt-3">
              <mat-label>Date & Time</mat-label>
              <input matInput type="datetime-local" formControlName="dateTime">
            </mat-form-field>
          </div>

          <div class="form-section">
            <h3>4. Match Format</h3>
            <mat-form-field appearance="outline" class="full-width premium-field">
              <mat-label>Format</mat-label>
              <mat-select formControlName="format">
                <mat-option value="SIX_V_SIX">6v6 Box/Turf</mat-option>
                <mat-option value="EIGHT_V_EIGHT">8v8</mat-option>
                <mat-option value="ELEVEN_V_ELEVEN">11v11 Full Pitch</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-section">
            <h3>5. The Stakes</h3>
            <mat-form-field appearance="outline" class="full-width premium-field">
              <mat-label>Description / Stakes</mat-label>
              <textarea matInput formControlName="description" rows="2" placeholder="e.g. Loser pays for the pitch..."></textarea>
            </mat-form-field>
          </div>

          <button mat-flat-button class="submit-action-btn gradient-orange" type="submit" 
                  [disabled]="challengeForm.invalid || creating || locating">
            <div class="btn-content" *ngIf="!creating">
              <span>Post Challenge</span>
              <mat-icon>emoji_events</mat-icon>
            </div>
            <span *ngIf="creating">Publishing...</span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .luxury-bg {
      background: radial-gradient(circle at top right, #1E1B4B, #0F172A);
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

    .back-btn { color: #FF6B35; }

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
      gap: 28px;
    }

    .flex-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }

    .toggle-pill {
       background: rgba(255,255,255,0.05);
       border: 1px solid rgba(255,255,255,0.1);
       border-radius: 100px;
       padding: 4px;
       display: flex;
       cursor: pointer;
    }
    .toggle-pill span {
       padding: 4px 12px;
       border-radius: 100px;
       font-size: 10px;
       font-weight: 800;
       text-transform: uppercase;
       color: rgba(255,255,255,0.4);
       transition: 0.3s;
    }
    .toggle-pill span.active {
       background: var(--primary);
       color: #0F172A;
    }

    .turf-picker { margin-top: 10px; }
    .turf-scroll { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 15px; }
    .turf-scroll::-webkit-scrollbar { display: none; }
    
    .turf-mini-card {
       flex-shrink: 0;
       width: 200px;
       background: rgba(255,255,255,0.03);
       border: 1px solid rgba(255,255,255,0.08);
       border-radius: 16px;
       padding: 12px;
       display: flex;
       gap: 12px;
       align-items: center;
       cursor: pointer;
       transition: 0.3s;
    }
    .turf-mini-card.selected {
       background: rgba(74, 222, 128, 0.1);
       border-color: var(--primary);
    }
    .t-img {
       width: 40px; height: 40px; border-radius: 10px;
       background: rgba(0,0,0,0.3);
       display: flex; align-items: center; justify-content: center;
       color: var(--primary);
    }
    .t-info { display: flex; flex-direction: column; }
    .t-name { font-size: 13px; font-weight: 700; color: white; }
    .t-sub { font-size: 10px; color: rgba(255,255,255,0.4); }

    .empty-hint { font-size: 12px; color: rgba(255,255,255,0.3); text-align: center; }

    .mt-3 { margin-top: 16px; }

    .form-section h3 {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 16px;
      color: #FF6B35;
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
      border-color: #FF6B35 !important;
      border-width: 2px !important;
    }

    .helper-text {
      font-size: 12px;
      color: #FF6B35;
      margin-top: -12px;
      margin-bottom: var(--spacing-sm);
    }

    .submit-action-btn {
      margin-top: 20px;
      height: 56px !important;
      border-radius: 16px !important;
      font-weight: 800 !important;
      font-size: 16px !important;
      box-shadow: 0 10px 15px -3px rgba(255, 107, 53, 0.3);
    }

    .btn-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .gradient-orange {
      background: linear-gradient(135deg, #FF6B35 0%, #F59E0B 100%) !important;
      color: white !important;
    }

    .sport-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 12px;
      margin-bottom: 8px;
    }

    .sport-item {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px 8px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sport-item:hover {
      background: rgba(255, 255, 255, 0.06);
      border-color: rgba(255, 107, 53, 0.4);
      transform: translateY(-2px);
    }

    .sport-item.active {
      background: rgba(255, 107, 53, 0.1);
      border-color: #FF6B35;
      box-shadow: 0 0 15px rgba(255, 107, 53, 0.2);
    }

    .sport-icon-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.05);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text-muted);
      transition: all 0.3s ease;
    }

    .sport-item.active .sport-icon-circle {
      background: #FF6B35;
      color: white;
    }

    .sport-item span {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-secondary);
      text-align: center;
    }

    .sport-item.active span {
      color: white;
    }
  `]
})
export class CreateChallengeComponent implements OnInit {
  challengeForm: FormGroup;
  creating = false;
  locating = true;
  lat = 0;
  lng = 0;
  sports = SUPPORTED_SPORTS.filter(s => s.id !== 'all');

  bookTurf = false;
  nearbyTurfs: Turf[] = [];
  selectedTurf: Turf | null = null;

  constructor(
    private fb: FormBuilder,
    private challengeService: ChallengeService,
    private locationService: LocationService,
    private adminService: AdminService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const now = new Date();
    now.setHours(now.getHours() + 24); 
    const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

    this.challengeForm = this.fb.group({
      teamName: ['', Validators.required],
      sportId: ['cricket', Validators.required],
      locationName: ['', Validators.required],
      turfId: [null],
      dateTime: [localDateTime, Validators.required],
      format: ['ELEVEN_V_ELEVEN'],
      description: ['']
    });
  }

  async ngOnInit() {
    try {
      const loc = await this.locationService.getCurrentLocation();
      this.lat = loc.latitude;
      this.lng = loc.longitude;
      if (loc.locationName) {
        this.challengeForm.patchValue({ locationName: loc.locationName });
      }
    } catch {
      this.lat = 19.076;
      this.lng = 72.8777;
    }
    this.locating = false;
    this.loadNearbyTurfs();
  }

  loadNearbyTurfs() {
    this.adminService.getTurfsNearby(this.lng, this.lat).subscribe(t => {
      this.nearbyTurfs = t;
    });
  }

  toggleBooking() {
    this.bookTurf = !this.bookTurf;
    if (this.bookTurf && this.selectedTurf) {
      this.challengeForm.patchValue({ locationName: this.selectedTurf.name, turfId: this.selectedTurf.id });
    } else if (!this.bookTurf) {
      this.challengeForm.patchValue({ turfId: null });
    }
  }

  selectTurf(turf: Turf) {
    this.selectedTurf = turf;
    this.challengeForm.patchValue({
      locationName: turf.name,
      turfId: turf.id
    });
  }

  goBack() {
    this.router.navigate(['/challenges']);
  }

  onSubmit() {
    if (this.challengeForm.valid && !this.locating) {
      this.creating = true;
      const data = {
        ...this.challengeForm.value,
        latitude: this.lat,
        longitude: this.lng,
        dateTime: new Date(this.challengeForm.value.dateTime).toISOString()
      };

      this.challengeService.createChallenge(data).subscribe({
        next: () => {
          this.snackBar.open('Challenge posted!', 'Close', { duration: 3000 });
          this.router.navigate(['/challenges']);
        },
        error: (err) => {
          this.creating = false;
          this.snackBar.open(err.error?.error || 'Failed to post', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
