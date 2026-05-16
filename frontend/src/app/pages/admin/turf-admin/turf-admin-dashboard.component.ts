import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { AdminService } from '../../../core/services/admin.service';
import { Turf, BlockedSlot } from '../../../core/models/turf.model';
import { LocationService } from '../../../core/services/location.service';

@Component({
  selector: 'app-turf-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatIconModule, MatButtonModule, MatTabsModule],
  template: `
    <div class="dashboard-container luxury-bg min-h-screen">
      <div class="glass-header">
        <div class="header-content">
          <span class="badge">Partner Console</span>
          <h1>{{ activeTab === 'my-venues' ? 'Venue Analytics' : activeTab === 'register' ? 'List Your Venue' : 'Event Organiser' }}</h1>
          <p>{{ getTabSubtext() }}</p>
        </div>
        <div class="quick-stats" *ngIf="activeTab === 'my-venues'">
          <div class="q-stat glass-card">
            <span class="q-val">{{ myTurfs.length }}</span>
            <span class="q-lab">Active Venues</span>
          </div>
        </div>
      </div>

      <div class="tab-nav">
        <button [class.active]="activeTab === 'my-venues'" (click)="activeTab = 'my-venues'">
          <mat-icon>dashboard</mat-icon> My Venues
        </button>
        <button [class.active]="activeTab === 'register'" (click)="activeTab = 'register'">
          <mat-icon>add_business</mat-icon> Register Venue
        </button>
        <button [class.active]="activeTab === 'events'" (click)="activeTab = 'events'">
          <mat-icon>event</mat-icon> Host Events
        </button>
      </div>

      <div class="dashboard-content animate-fade-in-up">
        
        <!-- SECTION: MY VENUES -->
        <div *ngIf="activeTab === 'my-venues'">
          <div class="venue-list" *ngIf="myTurfs.length > 0; else noTurfs">
            <div class="venue-config-card glass-card" *ngFor="let turf of myTurfs">
              <div class="venue-header">
                <div class="v-meta">
                  <h2>{{ turf.name }}</h2>
                  <div class="v-addr"><mat-icon>location_on</mat-icon> {{ turf.address }}, {{ turf.district }}</div>
                </div>
                <div class="v-price-badge">₹{{ turf.basePricePerHour }}/hr</div>
              </div>

              <div class="venue-details-grid">
                <div class="detail-col">
                  <h4><mat-icon>sports</mat-icon> Sports</h4>
                  <div class="chip-row">
                    <span class="mini-chip" *ngFor="let s of turf.availableSports">{{ s }}</span>
                  </div>
                </div>
                <div class="detail-col">
                  <h4><mat-icon>auto_awesome</mat-icon> Facilities</h4>
                  <div class="chip-row">
                    <span class="mini-chip fac" *ngFor="let f of turf.facilities">{{ f }}</span>
                  </div>
                </div>
              </div>

              <div class="venue-grid mt-4">
                <div class="config-section">
                  <h3><mat-icon>payments</mat-icon> Price Management</h3>
                  <div class="price-editor-row">
                    <div class="input-glow">
                      <span>₹</span>
                      <input type="number" [(ngModel)]="turf.basePricePerHour">
                    </div>
                    <button class="update-btn" (click)="updatePricing(turf)">Save</button>
                  </div>
                </div>

                <div class="config-section">
                  <h3><mat-icon>event_busy</mat-icon> Block Slot</h3>
                  <div class="block-form">
                    <input type="date" [(ngModel)]="slotBuffer.date">
                    <input type="time" [(ngModel)]="slotBuffer.startTime">
                    <input type="time" [(ngModel)]="slotBuffer.endTime">
                    <button class="block-action-btn" (click)="blockSlot(turf)">Block</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ng-template #noTurfs>
            <div class="empty-state glass-card">
              <mat-icon>storefront</mat-icon>
              <h3>No Venues Yet</h3>
              <p>Ready to join the premium network? Register your first venue now.</p>
              <button class="cta-reg-btn" (click)="activeTab = 'register'">Start Onboarding</button>
            </div>
          </ng-template>
        </div>

        <!-- SECTION: REGISTER VENUE (Multi-step) -->
        <div *ngIf="activeTab === 'register'" class="registration-form-container glass-card">
          <div class="step-indicator">
            <div class="step" [class.active]="regStep >= 1" [class.done]="regStep > 1">1</div>
            <div class="line"></div>
            <div class="step" [class.active]="regStep >= 2" [class.done]="regStep > 2">2</div>
            <div class="line"></div>
            <div class="step" [class.active]="regStep >= 3" [class.done]="regStep > 3">3</div>
            <div class="line"></div>
            <div class="step" [class.active]="regStep >= 4">4</div>
          </div>

          <form [formGroup]="turfForm" class="mt-4">
            <!-- Step 1: Basic Info -->
            <div *ngIf="regStep === 1" class="form-step animate-fade-in">
              <h3>Basic Information</h3>
              <div class="form-row">
                <div class="f-group">
                  <label>Venue Name</label>
                  <input type="text" formControlName="name" placeholder="e.g. Lords Cricket Turf">
                </div>
              </div>
              <div class="form-row">
                <div class="f-group">
                  <label>Contact Phone</label>
                  <input type="text" formControlName="phone" placeholder="+91 98765 43210">
                </div>
                <div class="f-group">
                  <label>Website (Optional)</label>
                  <input type="text" formControlName="website" placeholder="www.yourvenue.com">
                </div>
              </div>
              <div class="f-group">
                <label>Brief Description</label>
                <textarea formControlName="description" rows="3" placeholder="Tell players about your premium facilities..."></textarea>
              </div>
            </div>

            <!-- Step 2: Location (Zomato-style Hierarchy) -->
            <div *ngIf="regStep === 2" class="form-step animate-fade-in">
              <h3>Location Details</h3>
              <button type="button" class="loc-detect-btn" (click)="autoDetectLocation()">
                <mat-icon>my_location</mat-icon> Auto-Detect Current Location
              </button>
              <div class="f-group mt-3">
                <label>Address Line</label>
                <input type="text" formControlName="address" placeholder="Street, Building No.">
              </div>
              <div class="form-row">
                <div class="f-group"><label>District</label><input type="text" formControlName="district"></div>
                <div class="f-group"><label>City</label><input type="text" formControlName="city"></div>
              </div>
              <div class="form-row">
                <div class="f-group"><label>State</label><input type="text" formControlName="state"></div>
                <div class="f-group"><label>Pincode</label><input type="text" formControlName="pincode"></div>
              </div>
            </div>

            <!-- Step 3: Facilities & Sports -->
            <div *ngIf="regStep === 3" class="form-step animate-fade-in">
              <h3>Facilities & Sports</h3>
              <label class="label-heading">Check available sports</label>
              <div class="selection-grid-mini">
                <div class="select-item" *ngFor="let s of allSportsList" 
                     [class.active]="isSportSelected(s)" (click)="toggleSport(s)">
                  {{ s }}
                </div>
              </div>

              <label class="label-heading mt-4">Premium Facilities</label>
              <div class="selection-grid-mini">
                <div class="select-item fac" *ngFor="let f of allFacilitiesList" 
                     [class.active]="isFacilitySelected(f)" (click)="toggleFacility(f)">
                  {{ f }}
                </div>
              </div>
            </div>

            <!-- Step 4: Schedule & Pricing -->
            <div *ngIf="regStep === 4" class="form-step animate-fade-in">
              <h3>Final Details</h3>
              <div class="form-row">
                <div class="f-group">
                  <label>Base Price (₹/hr)</label>
                  <input type="number" formControlName="basePricePerHour">
                </div>
                <div class="f-group">
                  <label>Pitch Type</label>
                  <select formControlName="pitchType">
                    <option value="TURF">Artificial Turf</option>
                    <option value="GRASS">Natural Grass</option>
                    <option value="CEMENT">Cemented</option>
                    <option value="BOX">Box/Multi-sport</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="f-group"><label>Opening Time</label><input type="time" formControlName="openingTime"></div>
                <div class="f-group"><label>Closing Time</label><input type="time" formControlName="closingTime"></div>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="form-footer mt-4">
              <button type="button" class="back-link" *ngIf="regStep > 1" (click)="regStep = regStep - 1">Back</button>
              <div class="spacer"></div>
              <button type="button" class="next-btn" *ngIf="regStep < 4" (click)="regStep = regStep + 1">Continue</button>
              <button type="button" class="submit-btn" *ngIf="regStep === 4" (click)="registerTurf()" [disabled]="isLoading">
                {{ isLoading ? 'Registering...' : 'Register Venue' }}
              </button>
            </div>
          </form>
        </div>

        <!-- SECTION: EVENTS -->
        <div *ngIf="activeTab === 'events'">
          <div class="event-creation glass-card">
            <div class="section-header">
              <h3>🏟️ Organise New Event</h3>
              <p>Host full-pack tournaments, leagues, camps & more</p>
            </div>
            
            <form [formGroup]="eventForm" class="event-form">
              <!-- Basic Info -->
              <div class="ev-section-label"><mat-icon>info</mat-icon> Basic Info</div>
              <div class="form-row">
                <div class="f-group"><label>Event Name</label>
                  <input type="text" formControlName="title" placeholder="e.g. Summer T20 Blast">
                </div>
                <div class="f-group"><label>Category</label>
                  <select formControlName="category">
                    <option value="T10_MATCH">T10 Match ⚡</option>
                    <option value="T20_MATCH">T20 Match 🏏</option>
                    <option value="ODI_MATCH">ODI Match 🏏</option>
                    <option value="TEST_MATCH">Test Match 🏏</option>
                    <option value="TOURNAMENT">Tournament 🏆</option>
                    <option value="LEAGUE">League 📊</option>
                    <option value="KNOCKOUT">Knockout 🥊</option>
                    <option value="STADIUM_EVENT">Stadium Event 🏟️</option>
                    <option value="TRAINING_CAMP">Training Camp 🎯</option>
                    <option value="COACHING_CLINIC">Coaching Clinic 📋</option>
                    <option value="KIDS_CAMP">Kids Camp 👦</option>
                    <option value="CORPORATE_EVENT">Corporate Event 🏢</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div class="f-group"><label>Description</label>
                <textarea formControlName="description" rows="3" placeholder="Describe your event in detail..."></textarea>
              </div>
              <div class="form-row">
                <div class="f-group"><label>Start Date & Time</label><input type="datetime-local" formControlName="dateTime"></div>
                <div class="f-group"><label>End Date & Time</label><input type="datetime-local" formControlName="endDateTime"></div>
              </div>
              <div class="form-row">
                <div class="f-group"><label>Ticket Price (₹)</label><input type="number" formControlName="ticketPrice"></div>
                <div class="f-group"><label>Total Capacity</label><input type="number" formControlName="totalTickets"></div>
                <div class="f-group"><label>Venue Address</label><input type="text" formControlName="address" placeholder="Ground location"></div>
              </div>

              <!-- Match Configuration -->
              <div class="ev-section-label" (click)="evSections.match = !evSections.match">
                <mat-icon>sports_cricket</mat-icon> Match Configuration
                <mat-icon class="toggle-icon">{{ evSections.match ? 'expand_less' : 'expand_more' }}</mat-icon>
              </div>
              <div class="ev-collapse" *ngIf="evSections.match">
                <div class="form-row">
                  <div class="f-group"><label>Match Format</label>
                    <select formControlName="matchFormat">
                      <option value="">Select Format</option>
                      <option value="T10">T10</option>
                      <option value="T20">T20</option>
                      <option value="ODI">ODI (50 Overs)</option>
                      <option value="Test">Test Match</option>
                      <option value="Custom">Custom</option>
                    </select>
                  </div>
                  <div class="f-group"><label>Overs</label><input type="number" formControlName="overs" placeholder="e.g. 20"></div>
                </div>
                <div class="form-row">
                  <div class="f-group"><label>Max Teams</label><input type="number" formControlName="maxTeams" placeholder="e.g. 8"></div>
                  <div class="f-group"><label>Players Per Team</label><input type="number" formControlName="playersPerTeam" placeholder="e.g. 11"></div>
                </div>
              </div>

              <!-- Officials & Production -->
              <div class="ev-section-label" (click)="evSections.officials = !evSections.officials">
                <mat-icon>gavel</mat-icon> Officials & Production
                <mat-icon class="toggle-icon">{{ evSections.officials ? 'expand_less' : 'expand_more' }}</mat-icon>
              </div>
              <div class="ev-collapse" *ngIf="evSections.officials">
                <div class="toggle-grid">
                  <div class="toggle-item" [class.on]="eventForm.get('hasUmpires')?.value" (click)="toggleFormBool('hasUmpires')">
                    <mat-icon>gavel</mat-icon><span>Umpires</span>
                  </div>
                  <div class="toggle-item" [class.on]="eventForm.get('hasScorer')?.value" (click)="toggleFormBool('hasScorer')">
                    <mat-icon>edit_note</mat-icon><span>Scorer</span>
                  </div>
                  <div class="toggle-item" [class.on]="eventForm.get('hasDrinkBreaks')?.value" (click)="toggleFormBool('hasDrinkBreaks')">
                    <mat-icon>local_drink</mat-icon><span>Drink Break</span>
                  </div>
                  <div class="toggle-item" [class.on]="eventForm.get('hasLunchBreak')?.value" (click)="toggleFormBool('hasLunchBreak')">
                    <mat-icon>restaurant</mat-icon><span>Lunch Break</span>
                  </div>
                  <div class="toggle-item" [class.on]="eventForm.get('hasCommentary')?.value" (click)="toggleFormBool('hasCommentary')">
                    <mat-icon>mic</mat-icon><span>Commentary</span>
                  </div>
                  <div class="toggle-item" [class.on]="eventForm.get('hasLiveTelecast')?.value" (click)="toggleFormBool('hasLiveTelecast')">
                    <mat-icon>videocam</mat-icon><span>Live Telecast</span>
                  </div>
                </div>
                <div class="form-row mt-3" *ngIf="eventForm.get('hasUmpires')?.value">
                  <div class="f-group"><label>Umpire Count</label><input type="number" formControlName="umpireCount" placeholder="2"></div>
                  <div class="f-group" *ngIf="eventForm.get('hasDrinkBreaks')?.value"><label>Drink Break Every (Overs)</label><input type="number" formControlName="drinkBreakIntervalOvers" placeholder="10"></div>
                </div>
                <div class="form-row mt-3" *ngIf="eventForm.get('hasLiveTelecast')?.value">
                  <div class="f-group"><label>Streaming Platform</label>
                    <select formControlName="streamingPlatform">
                      <option value="">Select</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Hotstar">Hotstar</option>
                      <option value="Facebook">Facebook Live</option>
                      <option value="Instagram">Instagram Live</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div class="f-group"><label>Stream / Telecast URL</label><input type="text" formControlName="liveTelecastUrl" placeholder="https://..."></div>
                </div>
              </div>

              <!-- Venue & Logistics -->
              <div class="ev-section-label" (click)="evSections.venue = !evSections.venue">
                <mat-icon>location_on</mat-icon> Venue & Logistics
                <mat-icon class="toggle-icon">{{ evSections.venue ? 'expand_less' : 'expand_more' }}</mat-icon>
              </div>
              <div class="ev-collapse" *ngIf="evSections.venue">
                <div class="form-row">
                  <div class="f-group"><label>Pitch Type</label>
                    <select formControlName="pitchType">
                      <option value="">Select</option>
                      <option value="Turf">Artificial Turf</option>
                      <option value="Grass">Natural Grass</option>
                      <option value="Cement">Cement</option>
                      <option value="Mat">Coir Mat</option>
                    </select>
                  </div>
                  <div class="f-group"><label>Food & Beverages</label><input type="text" formControlName="foodAndBeverages" placeholder="e.g. Water, snacks provided"></div>
                </div>
                <div class="toggle-grid">
                  <div class="toggle-item" [class.on]="eventForm.get('floodlightsAvailable')?.value" (click)="toggleFormBool('floodlightsAvailable')">
                    <mat-icon>flashlight_on</mat-icon><span>Floodlights</span>
                  </div>
                  <div class="toggle-item" [class.on]="eventForm.get('parkingAvailable')?.value" (click)="toggleFormBool('parkingAvailable')">
                    <mat-icon>local_parking</mat-icon><span>Parking</span>
                  </div>
                  <div class="toggle-item" [class.on]="eventForm.get('changingRoomAvailable')?.value" (click)="toggleFormBool('changingRoomAvailable')">
                    <mat-icon>checkroom</mat-icon><span>Changing Room</span>
                  </div>
                </div>
              </div>

              <!-- Prizes & Rules -->
              <div class="ev-section-label" (click)="evSections.prizes = !evSections.prizes">
                <mat-icon>emoji_events</mat-icon> Prizes & Rules
                <mat-icon class="toggle-icon">{{ evSections.prizes ? 'expand_less' : 'expand_more' }}</mat-icon>
              </div>
              <div class="ev-collapse" *ngIf="evSections.prizes">
                <div class="form-row">
                  <div class="f-group"><label>Prize Pool</label><input type="text" formControlName="prizes" placeholder="e.g. ₹50,000 Winner / ₹25,000 Runner-up"></div>
                  <div class="f-group"><label>Man of the Match Prize</label><input type="text" formControlName="manOfTheMatchPrize" placeholder="e.g. ₹5,000 + Trophy"></div>
                </div>
                <div class="f-group"><label>Rules</label>
                  <textarea formControlName="rules" rows="3" placeholder="Tournament rules, match regulations..."></textarea>
                </div>
                <div class="form-row">
                  <div class="f-group"><label>Entry Requirements</label><input type="text" formControlName="entryRequirements" placeholder="e.g. Age 16+, ID proof required"></div>
                  <div class="f-group"><label>Dress Code</label><input type="text" formControlName="dresscode" placeholder="e.g. Whites only / Team jerseys"></div>
                </div>
              </div>

              <!-- Custom Fields -->
              <div class="ev-section-label" (click)="evSections.custom = !evSections.custom">
                <mat-icon>tune</mat-icon> Custom Fields
                <mat-icon class="toggle-icon">{{ evSections.custom ? 'expand_less' : 'expand_more' }}</mat-icon>
              </div>
              <div class="ev-collapse" *ngIf="evSections.custom">
                <p class="hint-text">Add any extra information not covered above.</p>
                <div class="custom-field-row" *ngFor="let cf of customFieldsList; let i = index">
                  <input type="text" [(ngModel)]="cf.key" [ngModelOptions]="{standalone: true}" placeholder="Field name (e.g. Sponsor)">
                  <input type="text" [(ngModel)]="cf.value" [ngModelOptions]="{standalone: true}" placeholder="Value (e.g. Red Bull)">
                  <button class="cf-remove" (click)="removeCustomField(i)"><mat-icon>close</mat-icon></button>
                </div>
                <button type="button" class="add-cf-btn" (click)="addCustomField()">
                  <mat-icon>add</mat-icon> Add Custom Field
                </button>
              </div>

              <button type="button" class="event-submit-btn" (click)="createEvent()" [disabled]="isLoading">
                {{ isLoading ? 'Publishing...' : '🚀 Publish Event' }}
              </button>
            </form>
          </div>

          <div class="my-events-list mt-4" *ngIf="myEvents.length > 0">
            <h3>My Organised Events</h3>
            <div class="event-mini-card glass-card mt-2" *ngFor="let e of myEvents">
               <div class="e-meta">
                  <h4>{{ e.title }}</h4>
                  <span class="e-cat">{{ e.category }}</span>
                  <div class="e-tags-row">
                    <span class="e-tag" *ngIf="e.hasUmpires">👨‍⚖️ Umpires</span>
                    <span class="e-tag" *ngIf="e.hasLiveTelecast">📡 Live</span>
                    <span class="e-tag" *ngIf="e.hasDrinkBreaks">🥤 Breaks</span>
                    <span class="e-tag" *ngIf="e.prizes">🏆 Prizes</span>
                  </div>
               </div>
               <div class="e-stats">
                  <span>{{ e.registeredUserIds?.length || 0 }} registrations</span>
                  <span>₹{{ e.ticketPrice }} / ticket</span>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .luxury-bg { background: #0F172A; color: white; }
    .glass-header { background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(20px); padding: 80px 40px 30px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .badge { background: rgba(74, 222, 128, 0.1); color: var(--primary); padding: 4px 12px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
    h1 { font-size: 34px; font-weight: 800; margin: 12px 0 4px; letter-spacing: -1px; }
    p { color: rgba(255,255,255,0.5); font-size: 15px; }
    .q-stat { padding: 15px 30px !important; text-align: center; }
    .q-val { display: block; font-size: 28px; font-weight: 800; color: var(--primary); }
    .q-lab { font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.4); }

    .tab-nav { display: flex; gap: 20px; padding: 0 40px; margin-top: -20px; background: rgba(30, 41, 59, 0.3); backdrop-filter: blur(10px); height: 60px; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.05); }
    .tab-nav button { background: transparent; border: none; color: rgba(255,255,255,0.5); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; padding: 10px 0; border-bottom: 2px solid transparent; }
    .tab-nav button mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .tab-nav button.active { color: var(--primary); border-bottom-color: var(--primary); }

    .dashboard-content { padding: 40px; }
    .glass-card { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(20px); border-radius: 32px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 32px; }

    .venue-config-card { margin-bottom: 30px; }
    .venue-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; padding-bottom: 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .v-meta h2 { font-size: 26px; font-weight: 800; margin: 0; }
    .v-addr { display: flex; align-items: center; gap: 6px; font-size: 14px; color: rgba(255,255,255,0.5); margin-top: 6px; }
    .v-price-badge { background: var(--primary); color: #0F172A; padding: 10px 20px; border-radius: 16px; font-weight: 800; font-size: 18px; box-shadow: 0 8px 16px rgba(74, 222, 128, 0.3); }

    .chip-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
    .mini-chip { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.8); }
    .mini-chip.fac { color: var(--primary); background: rgba(74, 222, 128, 0.05); }

    .venue-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .detail-col h4 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 8px; }
    .detail-col h4 mat-icon { font-size: 14px; width: 14px; height: 14px; }

    .config-section h3 { font-size: 14px; text-transform: uppercase; color: rgba(255,255,255,0.3); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .price-editor-row { display: flex; gap: 12px; }
    .input-glow { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 14px; padding: 0 15px; display: flex; align-items: center; gap: 8px; flex: 1; }
    .input-glow input { background: transparent; border: none; color: white; height: 48px; outline: none; font-size: 18px; font-weight: 700; width: 100%; }
    .input-glow span { color: var(--primary); font-weight: 700; }
    .update-btn { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0 20px; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .update-btn:hover { background: var(--primary); color: #0F172A; }

    .block-form { display: grid; grid-template-columns: 1fr 0.8fr 0.8fr auto; gap: 10px; }
    .block-form input { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; height: 48px; padding: 0 12px; color: white; }
    .block-action-btn { background: #EF4444; color: white; border: none; border-radius: 12px; font-weight: 700; padding: 0 15px; cursor: pointer; }

    /* MULTI-STEP REGISTRATION */
    .step-indicator { display: flex; align-items: center; justify-content: center; gap: 20px; margin-bottom: 40px; }
    .step { width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; font-weight: 800; border: 2px solid rgba(255,255,255,0.1); color: rgba(255,255,255,0.4); }
    .step.active { background: var(--primary); color: #0F172A; border-color: var(--primary); box-shadow: 0 0 20px rgba(74, 222, 128, 0.4); }
    .step.done { background: #059669; color: white; border-color: #059669; }
    .line { flex: 1; height: 2px; background: rgba(255,255,255,0.1); max-width: 60px; }
    
    .form-step h3 { font-size: 24px; font-weight: 800; margin-bottom: 24px; color: var(--primary); }
    .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
    .f-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
    .f-group label { font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.4); font-weight: 700; }
    .f-group input, .f-group textarea, .f-group select { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px; color: white; font-family: inherit; font-size: 14px; outline: none; }
    .f-group input:focus { border-color: var(--primary); }

    .loc-detect-btn { background: rgba(74, 222, 128, 0.1); color: var(--primary); border: 1px dashed var(--primary); width: 100%; height: 50px; border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 10px; font-weight: 700; cursor: pointer; transition: 0.3s; }
    .loc-detect-btn:hover { background: rgba(74, 222, 128, 0.2); }

    .label-heading { font-size: 12px; text-transform: uppercase; color: rgba(255,255,255,0.4); font-weight: 800; display: block; margin-bottom: 12px; }
    .selection-grid-mini { display: flex; flex-wrap: wrap; gap: 10px; }
    .select-item { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 8px 18px; border-radius: 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.2s; }
    .select-item:hover { background: rgba(255,255,255,0.06); }
    .select-item.active { background: var(--primary); color: #0F172A; border-color: var(--primary); }
    .select-item.fac.active { background: #3B82F6; color: white; border-color: #3B82F6; }

    .form-footer { display: flex; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 30px; }
    .next-btn, .submit-btn { background: var(--primary); color: #0F172A; border: none; padding: 0 40px; height: 56px; border-radius: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(74, 222, 128, 0.3); }
    .back-link { background: transparent; border: none; color: rgba(255,255,255,0.5); font-weight: 700; cursor: pointer; }
    .spacer { flex: 1; }

    /* EVENTS */
    .event-creation { margin-bottom: 40px; }
    .event-form { display: flex; flex-direction: column; gap: 10px; }
    .event-submit-btn { background: linear-gradient(135deg, #F59E0B, #F97316); color: white; border: none; height: 56px; border-radius: 16px; font-weight: 800; font-size: 16px; cursor: pointer; margin-top: 15px; box-shadow: 0 8px 16px rgba(245, 158, 11, 0.3); transition: all 0.3s; }
    .event-submit-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(245, 158, 11, 0.4); }

    .ev-section-label { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: var(--primary); margin-top: 24px; padding: 14px 16px; background: rgba(74, 222, 128, 0.04); border: 1px solid rgba(74, 222, 128, 0.1); border-radius: 14px; cursor: pointer; transition: all 0.2s; }
    .ev-section-label:hover { background: rgba(74, 222, 128, 0.08); }
    .ev-section-label mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .toggle-icon { margin-left: auto !important; color: rgba(255,255,255,0.3) !important; }

    .ev-collapse { padding: 16px 0 8px; animation: fadeIn 0.2s ease; }

    .toggle-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .toggle-item { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 10px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; cursor: pointer; transition: all 0.2s; }
    .toggle-item mat-icon { font-size: 22px; width: 22px; height: 22px; color: rgba(255,255,255,0.3); }
    .toggle-item span { font-size: 11px; font-weight: 700; color: rgba(255,255,255,0.4); }
    .toggle-item:hover { background: rgba(255,255,255,0.04); }
    .toggle-item.on { background: rgba(74, 222, 128, 0.08); border-color: rgba(74, 222, 128, 0.25); }
    .toggle-item.on mat-icon { color: var(--primary); }
    .toggle-item.on span { color: var(--primary); }

    .custom-field-row { display: flex; gap: 10px; margin-bottom: 10px; }
    .custom-field-row input { flex: 1; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 12px; color: white; font-size: 13px; outline: none; }
    .custom-field-row input:focus { border-color: var(--primary); }
    .cf-remove { background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.2); color: #F87171; border-radius: 10px; width: 44px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }
    .cf-remove:hover { background: rgba(248,113,113,0.2); }
    .add-cf-btn { display: flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.03); border: 1px dashed rgba(255,255,255,0.1); color: rgba(255,255,255,0.5); padding: 12px 20px; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer; transition: 0.2s; width: 100%; justify-content: center; }
    .add-cf-btn:hover { background: rgba(255,255,255,0.06); color: var(--primary); border-color: rgba(74, 222, 128, 0.3); }
    .hint-text { font-size: 12px; color: rgba(255,255,255,0.3); margin-bottom: 12px; }

    .event-mini-card { display: flex; justify-content: space-between; align-items: center; padding: 20px !important; }
    .e-meta h4 { margin: 0; font-size: 16px; }
    .e-cat { font-size: 10px; text-transform: uppercase; color: #F59E0B; font-weight: 800; }
    .e-tags-row { display: flex; gap: 6px; margin-top: 8px; flex-wrap: wrap; }
    .e-tag { font-size: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 6px; font-weight: 600; }
    .e-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; font-size: 12px; color: rgba(255,255,255,0.5); }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    .empty-state { text-align: center; padding: 80px 40px !important; }
    .empty-state mat-icon { font-size: 64px; width: 64px; height: 64px; color: var(--primary); margin-bottom: 24px; opacity: 0.5; }
    .cta-reg-btn { background: var(--primary); color: #0F172A; border: none; padding: 14px 40px; border-radius: 16px; font-weight: 800; cursor: pointer; }
    
    .mt-4 { margin-top: 32px; }
    .mt-2 { margin-top: 16px; }
    .mt-3 { margin-top: 24px; }
    .mb-4 { margin-bottom: 32px; }
  `]
})
export class TurfAdminDashboardComponent implements OnInit {
  activeTab: 'my-venues' | 'register' | 'events' = 'my-venues';
  regStep = 1;
  isLoading = false;
  
  myTurfs: Turf[] = [];
  myEvents: any[] = [];
  slotBuffer: BlockedSlot = { date: '', startTime: '', endTime: '', reason: 'Local Booking' };

  regSports: string[] = [];
  regFacilities: string[] = [];
  
  turfForm: FormGroup;
  eventForm: FormGroup;

  // Collapsible sections state
  evSections = { match: false, officials: false, venue: false, prizes: false, custom: false };

  // Dynamic custom fields
  customFieldsList: { key: string; value: string }[] = [];

  allSportsList = ['Cricket', 'Football', 'Tennis', 'Basketball', 'Badminton', 'Pickleball'];
  allFacilitiesList = ['Floodlights', 'Parking', 'Washroom', 'Changing Room', 'Cafeteria', 'Water', 'Medical Kit'];

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private locationService: LocationService,
    private snackBar: MatSnackBar
  ) {
    this.turfForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      phone: ['', Validators.required],
      website: [''],
      address: ['', Validators.required],
      district: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      pincode: ['', Validators.required],
      basePricePerHour: [1000, Validators.required],
      pitchType: ['TURF'],
      openingTime: ['06:00'],
      closingTime: ['23:00'],
      courtCount: [1]
    });

    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      category: ['T20_MATCH'],
      dateTime: ['', Validators.required],
      endDateTime: [''],
      ticketPrice: [0],
      totalTickets: [100],
      address: [''],
      // Match Configuration
      matchFormat: [''],
      overs: [null],
      maxTeams: [null],
      playersPerTeam: [null],
      // Officials & Production
      hasUmpires: [false],
      umpireCount: [2],
      hasScorer: [false],
      hasDrinkBreaks: [false],
      drinkBreakIntervalOvers: [10],
      hasLunchBreak: [false],
      hasLiveTelecast: [false],
      liveTelecastUrl: [''],
      streamingPlatform: [''],
      hasCommentary: [false],
      // Venue & Logistics
      pitchType: [''],
      floodlightsAvailable: [false],
      parkingAvailable: [false],
      changingRoomAvailable: [false],
      foodAndBeverages: [''],
      // Prizes & Rules
      prizes: [''],
      manOfTheMatchPrize: [''],
      rules: [''],
      entryRequirements: [''],
      dresscode: ['']
    });
  }

  ngOnInit(): void {
    this.loadMyTurfs();
    this.loadMyEvents();
  }

  getTabSubtext() {
    switch(this.activeTab) {
      case 'my-venues': return 'Manage your premium turfs & availability';
      case 'register': return 'Join the elite CricX venue network';
      case 'events': return 'Organise professional matches and stadium events';
    }
  }

  loadMyTurfs() {
    this.adminService.getMyTurfs().subscribe(t => this.myTurfs = t);
  }

  loadMyEvents() {
    this.adminService.getMyEvents().subscribe(e => this.myEvents = e);
  }

  async autoDetectLocation() {
    try {
      const loc = await this.locationService.getCurrentLocation();
      this.turfForm.patchValue({
        address: loc.locationName || '',
        city: 'Detected'
      });
      this.snackBar.open('Location detected 📍', 'Close', { duration: 2000 });
    } catch {
      this.snackBar.open('Failed to detect location', 'Close', { duration: 2000 });
    }
  }

  toggleSport(s: string) {
    const idx = this.regSports.indexOf(s);
    if (idx > -1) this.regSports.splice(idx, 1);
    else this.regSports.push(s);
  }
  isSportSelected(s: string) { return this.regSports.includes(s); }

  toggleFacility(f: string) {
    const idx = this.regFacilities.indexOf(f);
    if (idx > -1) this.regFacilities.splice(idx, 1);
    else this.regFacilities.push(f);
  }
  isFacilitySelected(f: string) { return this.regFacilities.includes(f); }

  toggleFormBool(field: string) {
    const current = this.eventForm.get(field)?.value;
    this.eventForm.get(field)?.setValue(!current);
  }

  addCustomField() {
    this.customFieldsList.push({ key: '', value: '' });
  }

  removeCustomField(index: number) {
    this.customFieldsList.splice(index, 1);
  }

  registerTurf() {
    if (this.turfForm.invalid || this.regSports.length === 0) {
      this.snackBar.open('Please fill all required fields and select at least one sport', 'Close', { duration: 3000 });
      return;
    }

    this.isLoading = true;
    const payload = {
      ...this.turfForm.value,
      availableSports: this.regSports,
      facilities: this.regFacilities,
      isActive: true,
      location: { type: 'Point', coordinates: [72.8777, 19.076] } // Fallback coordinates
    };

    this.adminService.createTurf(payload).subscribe({
      next: (turf) => {
        this.isLoading = false;
        this.myTurfs.push(turf);
        this.snackBar.open('Venue Registered Successfully! 🎉', 'Close', { duration: 3000 });
        this.activeTab = 'my-venues';
        this.regStep = 1;
        this.turfForm.reset();
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open(err.error?.error || 'Registration failed', 'Close', { duration: 3000 });
      }
    });
  }

  createEvent() {
    if (this.eventForm.invalid) return;
    this.isLoading = true;

    // Build customFields map from the dynamic list
    const customFields: { [key: string]: string } = {};
    this.customFieldsList.forEach(cf => {
      if (cf.key && cf.value) customFields[cf.key] = cf.value;
    });

    const payload = { ...this.eventForm.value, customFields };

    this.adminService.createEvent(payload).subscribe({
      next: (ev) => {
        this.isLoading = false;
        this.myEvents.unshift(ev);
        this.snackBar.open('Event Published! 🏟️', 'Close', { duration: 3000 });
        this.eventForm.reset({ category: 'T20_MATCH', ticketPrice: 0, totalTickets: 100, umpireCount: 2, drinkBreakIntervalOvers: 10 });
        this.customFieldsList = [];
      },
      error: () => this.isLoading = false
    });
  }

  updatePricing(turf: Turf) {
    this.adminService.updateTurf(turf.id, { basePricePerHour: turf.basePricePerHour }).subscribe(() => {
      this.snackBar.open('Updated!', 'Close', { duration: 2000 });
    });
  }

  blockSlot(turf: Turf) {
    if (!this.slotBuffer.date) return;
    this.adminService.blockSlot(turf.id, this.slotBuffer).subscribe(t => {
      const i = this.myTurfs.findIndex(x => x.id === t.id);
      if (i > -1) this.myTurfs[i] = t;
      this.snackBar.open('Slot Blocked', 'Close', { duration: 3000 });
    });
  }
}

