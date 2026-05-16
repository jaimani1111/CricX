import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdminService } from '../../core/services/admin.service';
import { Turf } from '../../core/models/turf.model';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule],
  template: `
    <div class="marketplace-container luxury-bg min-h-screen pb-24">
      <div class="glass-header">
        <div class="header-content">
          <h1>CricX Marketplace</h1>
          <p>Book premium venues & exclusive cricket events</p>
        </div>
      </div>

      <div class="market-tabs">
        <button [class.active]="activeTab === 'venues'" (click)="activeTab = 'venues'">
          <mat-icon>stadium</mat-icon> Venues
        </button>
        <button [class.active]="activeTab === 'events'" (click)="activeTab = 'events'">
          <mat-icon>confirmation_number</mat-icon> Events
        </button>
      </div>

      <div class="content p-6 animate-fade-in-up">
        <!-- TOP BANNER -->
        <div class="promo-banner glass-card mb-6" *ngIf="activeTab === 'venues'">
           <div class="promo-text">
              <h3>Book Matches? We handle it all!</h3>
              <p>Top rated turfs with floodlights & professional pitch maintenance.</p>
           </div>
           <mat-icon class="promo-icon text-primary">verified</mat-icon>
        </div>

        <!-- VENUES GRID -->
        <div *ngIf="activeTab === 'venues'" class="venue-grid">
           <div class="venue-card glass-card" *ngFor="let t of turfs">
              <div class="v-img-placeholder">
                  <mat-icon>image</mat-icon>
                  <span class="v-price-tag">₹{{ t.basePricePerHour }}/hr</span>
              </div>
              <div class="v-content">
                 <div class="v-top">
                    <h4>{{ t.name }}</h4>
                    <span class="v-rating"><mat-icon>star</mat-icon> 4.8</span>
                 </div>
                 <p class="v-loc"><mat-icon>place</mat-icon> {{ t.district }}, {{ t.city }}</p>
                 <div class="v-facs">
                    <span *ngFor="let f of t.facilities.slice(0,3)">{{ f }}</span>
                    <span *ngIf="t.facilities.length > 3">+{{ t.facilities.length - 3 }}</span>
                 </div>
                 <button class="book-cta" (click)="bookTurf(t)">Book Now</button>
              </div>
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
                       <mat-icon>groups</mat-icon> {{ e.registeredUserIds?.length || 0 }} / {{ e.totalTickets || '∞' }}
                    </div>
                    <button class="reg-btn" (click)="registerEvent(e)">Buy Tickets</button>
                 </div>
              </div>
           </div>
        </div>

        <div *ngIf="(activeTab === 'venues' && turfs.length === 0) || (activeTab === 'events' && events.length === 0)" class="empty-market text-center py-20">
           <mat-icon class="text-muted text-6xl">shopping_basket</mat-icon>
           <h3 class="mt-4 text-xl">Marketplace is growing!</h3>
           <p class="text-muted">New venues and events are being added every day.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .luxury-bg { background: #0F172A; color: white; }
    .glass-header { background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(20px); padding: 80px 24px 30px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); }
    h1 { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    p { color: rgba(255,255,255,0.5); font-size: 14px; }

    .market-tabs { display: flex; gap: 10px; padding: 0 24px; margin-top: 15px; }
    .market-tabs button { flex: 1; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: rgba(255,255,255,0.5); padding: 12px; border-radius: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.3s; }
    .market-tabs button.active { background: var(--primary); color: #0F172A; border-color: var(--primary); box-shadow: 0 8px 16px rgba(74, 222, 128, 0.2); }

    .glass-card { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 20px; }

    .promo-banner { display: flex; align-items: center; justify-content: space-between; background: linear-gradient(135deg, rgba(74, 222, 128, 0.1), rgba(59, 130, 246, 0.1)); border-color: rgba(74, 222, 128, 0.2); }
    .promo-text h3 { margin: 0; color: var(--primary); font-size: 16px; font-weight: 800; }
    .promo-text p { margin: 4px 0 0; font-size: 12px; }
    .promo-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.5; }

    /* VENUES */
    .venue-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
    .venue-card { padding: 0 !important; overflow: hidden; }
    .v-img-placeholder { height: 160px; background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; position: relative; }
    .v-img-placeholder mat-icon { font-size: 40px; width: 40px; height: 40px; opacity: 0.2; }
    .v-price-tag { position: absolute; bottom: 12px; right: 12px; background: var(--primary); color: #0F172A; padding: 4px 12px; border-radius: 100px; font-weight: 800; font-size: 12px; }
    .v-content { padding: 16px; }
    .v-top { display: flex; justify-content: space-between; align-items: center; }
    .v-top h4 { margin: 0; font-size: 18px; font-weight: 800; }
    .v-rating { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 700; color: #F59E0B; }
    .v-rating mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .v-loc { font-size: 12px; color: rgba(255,255,255,0.4); margin: 6px 0; display: flex; align-items: center; gap: 4px; }
    .v-facs { display: flex; gap: 6px; margin-top: 10px; }
    .v-facs span { font-size: 10px; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; color: rgba(255,255,255,0.6); }
    .book-cta { width: 100%; margin-top: 15px; height: 44px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); color: white; border-radius: 12px; font-weight: 800; cursor: pointer; transition: 0.3s; }
    .book-cta:hover { background: var(--primary); color: #0F172A; }

    /* EVENTS */
    .event-hero-card { padding: 0 !important; overflow: hidden; }
    .e-banner-placeholder { height: 140px; background: linear-gradient(45deg, #1E293B, #0F172A); position: relative; }
    .e-date-badge { position: absolute; top: 15px; left: 15px; background: rgba(255,255,255,0.9); color: #0F172A; border-radius: 12px; width: 50px; height: 55px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .e-date-badge .day { font-size: 18px; font-weight: 900; line-height: 1; }
    .e-date-badge .month { font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .e-price-overlay { position: absolute; bottom: 0; right: 0; padding: 8px 15px; background: #F59E0B; color: white; font-weight: 800; font-size: 12px; border-top-left-radius: 15px; }
    .e-body { padding: 20px; }
    .e-badge { display: inline-block; padding: 3px 8px; background: rgba(245, 158, 11, 0.1); color: #F59E0B; border-radius: 6px; font-size: 9px; font-weight: 800; text-transform: uppercase; margin-bottom: 8px; }
    .e-body h3 { margin: 0; font-size: 20px; font-weight: 800; }
    .e-desc { font-size: 13px; color: rgba(255,255,255,0.5); margin: 8px 0 15px; }
    .e-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.05); }
    .e-joined { font-size: 12px; color: rgba(255,255,255,0.4); display: flex; align-items: center; gap: 6px; }
    .reg-btn { background: linear-gradient(135deg, #F59E0B, #F97316); color: white; border: none; padding: 10px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; transition: all 0.3s; }
    .reg-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(245,158,11,0.3); }

    .e-features { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 15px; }
    .feat-tag { font-size: 10px; font-weight: 700; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 4px 10px; border-radius: 8px; color: rgba(255,255,255,0.7); }
    .feat-tag.prize { background: rgba(245,158,11,0.08); border-color: rgba(245,158,11,0.2); color: #F59E0B; }
    .e-format-tag { position: absolute; top: 15px; right: 15px; background: rgba(74,222,128,0.9); color: #0F172A; padding: 4px 12px; border-radius: 8px; font-size: 11px; font-weight: 800; text-transform: uppercase; }
  `]
})
export class MarketplaceComponent implements OnInit {
  activeTab: 'venues' | 'events' = 'venues';
  turfs : Turf[] = [];
  events: any[] = [];

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll() {
    // Using Mumbai default coords
    this.adminService.getTurfsNearby(72.8777, 19.076).subscribe(t => this.turfs = t);
    this.adminService.getAllEvents().subscribe(e => this.events = e);
  }

  bookTurf(turf: Turf) {
    this.snackBar.open('Venue booking opening soon!', 'Close', { duration: 3000 });
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
