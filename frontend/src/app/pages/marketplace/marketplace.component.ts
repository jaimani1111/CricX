import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../core/services/admin.service';
import { Turf, BlockedSlot } from '../../core/models/turf.model';
import { AuthService } from '../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="marketplace-container luxury-bg min-h-screen pb-24">
      <!-- HERO HEADER -->
      <div class="glass-header">
        <div class="header-content animate-fade-in">
          <div class="badge">Playb Venues</div>
          <h1>Playb Marketplace</h1>
          <p>Book premium venues & live match events instantly</p>
        </div>
      </div>

      <!-- TABS -->
      <div class="market-tabs">
        <button [class.active]="activeTab === 'venues'" (click)="activeTab = 'venues'">
          <mat-icon>stadium</mat-icon> Venues & Turfs
        </button>
        <button [class.active]="activeTab === 'events'" (click)="activeTab = 'events'">
          <mat-icon>confirmation_number</mat-icon> Organised Matches
        </button>
      </div>

      <div class="content p-6 animate-fade-in-up">
        <!-- ZOMATO-STYLE LOCATION FILTER & SEARCH -->
        <div class="filter-bar glass-card mb-6" *ngIf="activeTab === 'venues'">
          <div class="search-box">
            <mat-icon>search</mat-icon>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search by name, area, district, city...">
          </div>
          
          <div class="district-filters-wrapper">
            <span class="filter-label"><mat-icon>location_on</mat-icon> Districts:</span>
            <div class="district-chips">
              <button class="chip-btn" [class.active]="selectedDistrict === 'ALL'" (click)="selectedDistrict = 'ALL'">
                All Districts
              </button>
              <button class="chip-btn" 
                      *ngFor="let dist of districtsList" 
                      [class.active]="selectedDistrict === dist" 
                      (click)="selectedDistrict = dist">
                {{ dist }}
              </button>
            </div>
          </div>
        </div>

        <!-- VENUES GRID -->
        <div *ngIf="activeTab === 'venues'" class="venue-grid">
           <div class="venue-card glass-card" *ngFor="let t of filteredTurfs">
               <div class="v-img-placeholder">
                  <div class="pitch-tag" *ngIf="isMyVenue(t)">⭐ MY VENUE</div>
                  <div class="pitch-tag" *ngIf="!isMyVenue(t)">{{ t.pitchType }} PITCH</div>
                  <mat-icon class="stadium-bg-icon">stadium</mat-icon>
                  <span class="v-price-tag">₹{{ t.basePricePerHour }}/hr</span>
              </div>
              <div class="v-content">
                 <div class="v-top">
                    <h4>{{ t.name }}</h4>
                    <span class="v-rating"><mat-icon>star</mat-icon> 4.9</span>
                 </div>
                 <p class="v-loc">
                   <mat-icon>place</mat-icon> 
                   <strong>{{ t.district }}</strong>, {{ t.city }}
                 </p>
                 <div class="v-facs">
                    <span *ngFor="let f of t.facilities.slice(0,3)">{{ f }}</span>
                    <span class="more-badge" *ngIf="t.facilities.length > 3">+{{ t.facilities.length - 3 }}</span>
                 </div>
                 <button class="book-cta" *ngIf="!isMyVenue(t)" (click)="openBookingModal(t)">
                   <mat-icon>bolt</mat-icon> Book Slot Now
                 </button>
                 <button class="book-cta manage-btn" *ngIf="isMyVenue(t)" (click)="goToManageTurf()">
                   <mat-icon>settings</mat-icon> Manage Turf Slots
                 </button>
              </div>
           </div>

           <!-- Empty State Search -->
           <div class="empty-market text-center py-20 w-full" *ngIf="filteredTurfs.length === 0">
             <mat-icon class="text-muted text-6xl">travel_explore</mat-icon>
             <h3 class="mt-4 text-xl">No venues match your filters</h3>
             <p class="text-muted">Try changing the district chip or searching with a different keyword.</p>
           </div>
        </div>

        <!-- EVENTS LIST -->
        <div *ngIf="activeTab === 'events'" class="events-stack">
           <div class="event-hero-card glass-card mb-4" *ngFor="let e of events">
              <div class="e-banner-placeholder">
                 <div class="e-date-badge">
                    <span class="day">{{ formatDate(e.dateTime, 'day') }}</span>
                    <span class="month">{{ formatDate(e.dateTime, 'month') }}</span>
                 </div>
                 <div class="e-format-tag" *ngIf="e.matchFormat">{{ e.matchFormat }}</div>
                 <div class="e-price-overlay">₹{{ e.ticketPrice }} onwards</div>
              </div>
              <div class="e-body">
                 <div class="e-badge">{{ e.category }}</div>
                 <h3>{{ e.title }}</h3>
                 <p class="e-desc">{{ e.description }}</p>
                 <div class="e-features" *ngIf="e.hasUmpires || e.hasLiveTelecast || e.hasDrinkBreaks || e.prizes || e.hasCommentary">
                    <span class="feat-tag" *ngIf="e.hasUmpires">👨‍⚖️ Umpires</span>
                    <span class="feat-tag" *ngIf="e.hasLiveTelecast">📡 {{ e.streamingPlatform || 'Live' }}</span>
                    <span class="feat-tag" *ngIf="e.hasDrinkBreaks">🥤 Drink Break</span>
                    <span class="feat-tag" *ngIf="e.hasCommentary">🎙️ Commentary</span>
                    <span class="feat-tag prize" *ngIf="e.prizes">🏆 {{ e.prizes }}</span>
                 </div>
                 <div class="e-footer">
                    <div class="e-joined">
                       <mat-icon>groups</mat-icon> {{ e.registeredUserIds?.length || 0 }} / {{ e.totalTickets || '∞' }} joined
                    </div>
                    <button class="reg-btn" (click)="registerEvent(e)">Buy Tickets</button>
                 </div>
              </div>
           </div>
        </div>

        <!-- Empty State General -->
        <div *ngIf="(activeTab === 'venues' && turfs.length === 0) || (activeTab === 'events' && events.length === 0)" class="empty-market text-center py-20">
           <mat-icon class="text-muted text-6xl">shopping_basket</mat-icon>
           <h3 class="mt-4 text-xl">Marketplace is growing!</h3>
           <p class="text-muted">New venues and events are being added every day.</p>
        </div>
      </div>

      <!-- BOOKING MODAL (POPUP) -->
      <div class="booking-modal-overlay" *ngIf="selectedTurf" (click)="closeBookingModal()">
        <div class="booking-modal-card glass-card animate-scale-up" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>Confirm Turf Booking</h3>
            <button class="modal-close-btn" (click)="closeBookingModal()"><mat-icon>close</mat-icon></button>
          </div>
          
          <div class="modal-turf-info">
            <h4>{{ selectedTurf.name }}</h4>
            <p><mat-icon>place</mat-icon> {{ selectedTurf.district }}, {{ selectedTurf.city }}</p>
            <span class="pricing-label">Price: ₹{{ selectedTurf.basePricePerHour }}/hr</span>
          </div>

          <div class="modal-body mt-4">
            <!-- INPUTS -->
            <div class="input-grid">
              <div class="input-group">
                <label>Select Booking Date</label>
                <input type="date" [(ngModel)]="bookingDate" (change)="checkDateAvailability()" [min]="todayStr">
              </div>
              <div class="input-group">
                <label>Start Time (24h)</label>
                <select [(ngModel)]="bookingStartTime">
                  <option *ngFor="let h of hoursList" [value]="h">{{ h }}</option>
                </select>
              </div>
              <div class="input-group">
                <label>End Time (24h)</label>
                <select [(ngModel)]="bookingEndTime">
                  <option *ngFor="let h of hoursList" [value]="h">{{ h }}</option>
                </select>
              </div>
            </div>

            <!-- BOOKED SLOTS (SO THEY CAN SEE TAKEN SLOTS) -->
            <div class="booked-slots-warning mt-4">
              <h5>📅 Unavailable Slots (Already Booked):</h5>
              <div class="blocked-slots-chips-row mt-2" *ngIf="dayBookedSlots.length > 0; else allFree">
                <span class="blocked-slot-chip" *ngFor="let bs of dayBookedSlots">
                  <mat-icon>schedule</mat-icon>
                  {{ bs.startTime }} - {{ bs.endTime }} (Booked)
                </span>
              </div>
              <ng-template #allFree>
                <p class="all-free-msg"><mat-icon>check_circle</mat-icon> All slots are currently available for booking!</p>
              </ng-template>
            </div>
            
            <div class="input-group mt-4">
              <label>Special Instructions / Team Name</label>
              <input type="text" [(ngModel)]="bookingReason" placeholder="e.g. Warriors CC Match practice">
            </div>
          </div>

          <div class="modal-footer mt-4">
            <button class="cancel-modal-btn" (click)="closeBookingModal()">Cancel</button>
            <button class="confirm-booking-btn" (click)="confirmBooking()">
              <mat-icon>flash_on</mat-icon> Confirm & Book
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .luxury-bg { background: #0F172A; color: white; }
    .glass-header { background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(20px); padding: 30px 24px 20px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    .badge { display: inline-block; background: rgba(74, 222, 128, 0.1); color: var(--primary); padding: 4px 12px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; }
    h1 { font-size: 32px; font-weight: 800; margin: 12px 0 4px; letter-spacing: -1px; }
    p { color: rgba(255,255,255,0.5); font-size: 14px; }

    .market-tabs { display: flex; gap: 10px; padding: 0 24px; margin-top: 15px; }
    .market-tabs button { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); padding: 12px; border-radius: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.3s; }
    .market-tabs button.active { background: var(--primary); color: #0F172A; border-color: var(--primary); box-shadow: 0 8px 16px rgba(74, 222, 128, 0.2); }

    .glass-card { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 24px; }

    /* FILTER BAR */
    .filter-bar { display: flex; flex-direction: column; gap: 16px; }
    .search-box { display: flex; align-items: center; gap: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 0 16px; }
    .search-box mat-icon { color: rgba(255,255,255,0.3); }
    .search-box input { flex: 1; background: transparent; border: none; height: 48px; color: white; outline: none; font-size: 14px; font-family: inherit; }
    
    .district-filters-wrapper { display: flex; align-items: center; gap: 14px; overflow-x: auto; scrollbar-width: none; }
    .district-filters-wrapper::-webkit-scrollbar { display: none; }
    .filter-label { display: flex; align-items: center; gap: 4px; font-size: 12px; text-transform: uppercase; color: var(--primary); font-weight: 800; flex-shrink: 0; }
    .filter-label mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .district-chips { display: flex; gap: 8px; }
    .chip-btn { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); padding: 6px 14px; border-radius: 100px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
    .chip-btn:hover { background: rgba(255,255,255,0.08); color: white; }
    .chip-btn.active { background: var(--primary); color: #0F172A; border-color: var(--primary); }

    /* VENUES GRID */
    .venue-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .venue-card { padding: 0 !important; overflow: hidden; display: flex; flex-direction: column; transition: all 0.3s; }
    .venue-card:hover { transform: translateY(-4px); border-color: var(--primary); }
    
    .v-img-placeholder { height: 170px; background: linear-gradient(135deg, #1E293B, #0F172A); display: flex; align-items: center; justify-content: center; position: relative; overflow: hidden; }
    .stadium-bg-icon { font-size: 72px; width: 72px; height: 72px; color: rgba(255,255,255,0.03); position: absolute; transform: scale(1.5); }
    .pitch-tag { position: absolute; top: 12px; left: 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.15); padding: 4px 10px; border-radius: 6px; font-size: 9px; font-weight: 800; color: white; }
    .v-price-tag { position: absolute; bottom: 12px; right: 12px; background: var(--primary); color: #0F172A; padding: 4px 12px; border-radius: 100px; font-weight: 800; font-size: 13px; box-shadow: 0 4px 12px rgba(74, 222, 128, 0.3); }
    
    .v-content { padding: 20px; flex: 1; display: flex; flex-direction: column; }
    .v-top { display: flex; justify-content: space-between; align-items: center; }
    .v-top h4 { margin: 0; font-size: 18px; font-weight: 800; color: white; }
    .v-rating { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 800; color: #F59E0B; background: rgba(245,158,11,0.1); padding: 2px 8px; border-radius: 100px; }
    .v-rating mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .v-loc { font-size: 12px; color: rgba(255,255,255,0.5); margin: 8px 0; display: flex; align-items: center; gap: 4px; }
    .v-loc mat-icon { font-size: 14px; width: 14px; height: 14px; color: var(--primary); }
    .v-facs { display: flex; gap: 6px; margin-top: 10px; flex-wrap: wrap; margin-bottom: 20px; }
    .v-facs span { font-size: 10px; font-weight: 600; background: rgba(255,255,255,0.05); padding: 3px 8px; border-radius: 4px; color: rgba(255,255,255,0.7); }
    .more-badge { background: rgba(74, 222, 128, 0.08) !important; color: var(--primary) !important; }
    
    .book-cta { width: 100%; margin-top: auto; height: 46px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 14px; font-weight: 800; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; transition: all 0.3s; }
    .book-cta mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .book-cta:hover { background: var(--primary); color: #0F172A; box-shadow: 0 6px 16px rgba(74, 222, 128, 0.25); border-color: var(--primary); }

    /* EVENTS */
    .event-hero-card { padding: 0 !important; overflow: hidden; }
    .e-banner-placeholder { height: 150px; background: linear-gradient(135deg, #1E293B, #0F172A); position: relative; }
    .e-date-badge { position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.9); color: #0F172A; border-radius: 12px; width: 50px; height: 55px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .e-date-badge .day { font-size: 18px; font-weight: 900; line-height: 1; }
    .e-date-badge .month { font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .e-price-overlay { position: absolute; bottom: 0; right: 0; padding: 8px 15px; background: #F59E0B; color: white; font-weight: 800; font-size: 12px; border-top-left-radius: 15px; }
    .e-body { padding: 24px; }
    .e-badge { display: inline-block; padding: 3px 8px; background: rgba(245, 158, 11, 0.1); color: #F59E0B; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; }
    .e-body h3 { margin: 0; font-size: 22px; font-weight: 800; }
    .e-desc { font-size: 13px; color: rgba(255,255,255,0.5); margin: 8px 0 15px; line-height: 1.5; }
    .e-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); }
    .e-joined { font-size: 12px; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 6px; }
    .e-joined mat-icon { font-size: 16px; width: 16px; height: 16px; color: var(--primary); }
    .reg-btn { background: linear-gradient(135deg, #F59E0B, #F97316); color: white; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; transition: all 0.3s; }
    .reg-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(245,158,11,0.3); }
    
    .e-features { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 15px; }
    .feat-tag { font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 8px; color: rgba(255,255,255,0.7); }
    .feat-tag.prize { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); color: #F59E0B; }
    .e-format-tag { position: absolute; top: 15px; right: 15px; background: rgba(74,222,128,0.9); color: #0F172A; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }

    /* MODAL POPUP */
    .booking-modal-overlay { position: fixed; inset: 0; background: rgba(5,7,10,0.85); display: flex; align-items: center; justify-content: center; z-index: 10000; padding: 20px; backdrop-filter: blur(8px); }
    .booking-modal-card { width: 100%; max-width: 540px; background: rgba(15, 23, 42, 0.95) !important; border: 1px solid rgba(255,255,255,0.1) !important; display: flex; flex-direction: column; overflow: hidden; max-height: 90vh; }
    
    .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 16px; }
    .modal-header h3 { margin: 0; font-size: 20px; font-weight: 800; color: white; }
    .modal-close-btn { background: none; border: none; color: rgba(255,255,255,0.4); cursor: pointer; padding: 4px; display: flex; }
    .modal-close-btn:hover { color: white; }

    .modal-turf-info { margin-top: 16px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; padding: 16px; }
    .modal-turf-info h4 { margin: 0; font-size: 16px; font-weight: 800; color: var(--primary); }
    .modal-turf-info p { margin: 4px 0 8px; font-size: 12px; display: flex; align-items: center; gap: 4px; }
    .modal-turf-info p mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .pricing-label { font-size: 14px; font-weight: 700; color: white; }

    .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .input-grid .input-group:first-child { grid-column: span 2; }
    
    .input-group { display: flex; flex-direction: column; gap: 6px; }
    .input-group label { font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.4); font-weight: 800; }
    .input-group input, .input-group select { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; height: 44px; padding: 0 12px; color: white; outline: none; font-size: 13px; font-family: inherit; }
    .input-group input:focus, .input-group select:focus { border-color: var(--primary); }

    .booked-slots-warning { background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.15); border-radius: 14px; padding: 14px; }
    .booked-slots-warning h5 { margin: 0; font-size: 11px; font-weight: 800; text-transform: uppercase; color: #EF4444; }
    
    .blocked-slots-chips-row { display: flex; flex-wrap: wrap; gap: 6px; }
    .blocked-slot-chip { display: inline-flex; align-items: center; gap: 6px; background: rgba(239, 68, 68, 0.1); color: #EF4444; padding: 4px 10px; border-radius: 100px; font-size: 11px; font-weight: 700; }
    .blocked-slot-chip mat-icon { font-size: 12px; width: 12px; height: 12px; }
    
    .all-free-msg { margin: 6px 0 0; font-size: 12px; color: var(--primary); display: flex; align-items: center; gap: 4px; font-weight: 700; }
    .all-free-msg mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .modal-footer { display: flex; gap: 10px; justify-content: flex-end; }
    .cancel-modal-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: white; padding: 0 20px; height: 46px; border-radius: 12px; font-weight: 700; cursor: pointer; }
    .cancel-modal-btn:hover { background: rgba(255,255,255,0.05); }
    .confirm-booking-btn { background: var(--primary); color: #0F172A; border: none; padding: 0 24px; height: 46px; border-radius: 12px; font-weight: 800; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; transition: all 0.2s; }
    .confirm-booking-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .confirm-booking-btn:hover { box-shadow: 0 6px 16px rgba(74, 222, 128, 0.3); }

    .animate-scale-up { animation: scaleUp 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
    @keyframes scaleUp { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `]
})
export class MarketplaceComponent implements OnInit {
  activeTab: 'venues' | 'events' = 'venues';
  turfs : Turf[] = [];
  events: any[] = [];

  // Zomato style filter state
  searchQuery = '';
  selectedDistrict = 'ALL';
  districtsList: string[] = [];

  // Booking Modal State
  selectedTurf: Turf | null = null;
  bookingDate = '';
  bookingStartTime = '18:00';
  bookingEndTime = '19:00';
  bookingReason = '';
  dayBookedSlots: BlockedSlot[] = [];

  todayStr = '';
  hoursList = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', 
    '20:00', '21:00', '22:00', '23:00'
  ];

  constructor(
    private adminService: AdminService, 
    private snackBar: MatSnackBar,
    public authService: AuthService,
    private router: Router
  ) {
    const today = new Date();
    this.todayStr = today.toISOString().split('T')[0];
    this.bookingDate = this.todayStr;
  }

  isMyVenue(t: Turf): boolean {
    return t.ownerId === this.authService.getUserId();
  }

  goToManageTurf() {
    this.router.navigate(['/admin/turf']);
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    this.adminService.getTurfsNearby(72.8777, 19.076).subscribe(t => {
      this.turfs = t;
      // Build Zomato style unique districts list dynamically
      const districts = t.map(x => x.district).filter(x => x);
      this.districtsList = Array.from(new Set(districts));
    });
    this.adminService.getAllEvents().subscribe(e => this.events = e);
  }

  get filteredTurfs(): Turf[] {
    return this.turfs.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            t.city.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                            t.district.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesDistrict = this.selectedDistrict === 'ALL' || t.district === this.selectedDistrict;
      return matchesSearch && matchesDistrict;
    });
  }

  openBookingModal(turf: Turf) {
    this.selectedTurf = turf;
    this.bookingReason = '';
    this.checkDateAvailability();
  }

  closeBookingModal() {
    this.selectedTurf = null;
  }

  checkDateAvailability() {
    if (!this.selectedTurf) return;
    // Find all blocked slots for this date on the turf
    this.dayBookedSlots = (this.selectedTurf.manuallyBlockedSlots || [])
      .filter(slot => slot.date === this.bookingDate);
  }

  confirmBooking() {
    if (!this.selectedTurf) return;

    // Time overlap check
    const isOverlap = this.dayBookedSlots.some(s => s.startTime === this.bookingStartTime);
    if (isOverlap) {
      this.snackBar.open('This slot is already booked! Please select another time.', 'Close', { duration: 3000 });
      return;
    }

    const payload: BlockedSlot = {
      date: this.bookingDate,
      startTime: this.bookingStartTime,
      endTime: this.bookingEndTime,
      reason: this.bookingReason || 'Playb App Booking'
    };

    this.adminService.bookTurfSlot(this.selectedTurf.id, payload).subscribe({
      next: (updatedTurf) => {
        this.snackBar.open(`Successfully booked at ${this.selectedTurf?.name}! 🏟️`, 'Close', { duration: 4000 });
        
        // Update local state list
        const idx = this.turfs.findIndex(t => t.id === updatedTurf.id);
        if (idx > -1) {
          this.turfs[idx] = updatedTurf;
        }

        this.closeBookingModal();
        this.loadAll();
      },
      error: (err) => {
        this.snackBar.open(err.error?.message || 'Failed to book. Try another slot!', 'Close', { duration: 3000 });
      }
    });
  }

  registerEvent(event: any) {
    this.adminService.registerForEvent(event.id).subscribe(() => {
       this.snackBar.open(`Registered for ${event.title}! 🎉`, 'Close', { duration: 3000 });
       this.loadAll();
    });
  }

  formatDate(dateStr: string, type: 'day' | 'month') {
    const d = new Date(dateStr);
    if (type === 'day') return d.getDate();
    return d.toLocaleString('en-US', { month: 'short' });
  }
}
