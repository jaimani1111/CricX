import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/user.model';
import { Sport } from '../../../core/models/sport.model';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatTableModule, MatSnackBarModule, MatDialogModule, MatMenuModule],
  template: `
    <div class="dashboard-container luxury-bg min-h-screen">
      <!-- Header -->
      <div class="glass-header">
        <div class="header-content">
          <h1>Super Admin Console</h1>
          <p>Global moderation & platform configuration</p>
        </div>
        <div class="stats-row">
          <div class="stat-card">
            <span class="val">{{ users.length }}</span>
            <span class="lab">Total Users</span>
          </div>
          <div class="stat-card">
            <span class="val">{{ sports.length }}</span>
            <span class="lab">Sports</span>
          </div>
        </div>
      </div>

      <div class="dashboard-content animate-fade-in-up">
        <!-- Tabs / Sections -->
        <div class="admin-tabs">
          <button [class.active]="activeTab === 'users'" (click)="activeTab = 'users'">User Moderation</button>
          <button [class.active]="activeTab === 'sports'" (click)="activeTab = 'sports'">Sport Management</button>
        </div>

        <!-- Users Table -->
        <div class="section-card glass-card" *ngIf="activeTab === 'users'">
          <div class="section-header">
            <h3>Registered Players & Admins</h3>
            <div class="search-compact">
              <mat-icon>search</mat-icon>
              <input type="text" placeholder="Filter by email..." [(ngModel)]="userSearch">
            </div>
          </div>
          
          <table mat-table [dataSource]="filteredUsers()" class="premium-table">
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let u">{{ u.name }}</td>
            </ng-container>

            <ng-container matColumnDef="email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let u">{{ u.email }}</td>
            </ng-container>

            <ng-container matColumnDef="role">
              <th mat-header-cell *matHeaderCellDef>Role</th>
              <td mat-cell *matCellDef="let u">
                <span class="role-badge" [class]="u.role.toLowerCase()">{{ u.role }}</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let u">
                <span class="status-pill" [class.blocked]="u.isBlocked">
                  {{ u.isBlocked ? 'Blocked' : 'Active' }}
                </span>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let u">
                <button mat-icon-button color="warn" *ngIf="!u.isBlocked" (click)="toggleBlock(u)" title="Block User">
                  <mat-icon>block</mat-icon>
                </button>
                <button mat-icon-button class="activate-btn" *ngIf="u.isBlocked" (click)="toggleBlock(u)" title="Activate User">
                  <mat-icon>check_circle</mat-icon>
                </button>
                <button mat-icon-button [matMenuTriggerFor]="roleMenu" color="primary" title="Change Role">
                  <mat-icon>manage_accounts</mat-icon>
                </button>
                <mat-menu #roleMenu="matMenu">
                  <button mat-menu-item (click)="promote(u.email, 'SUPER_ADMIN')">Super Admin</button>
                  <button mat-menu-item (click)="promote(u.email, 'ADMIN')">Turf Admin</button>
                  <button mat-menu-item (click)="promote(u.email, 'PLAYER')">Player</button>
                </mat-menu>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: userColumns;"></tr>
          </table>
        </div>

        <!-- Sport Management -->
        <div class="section-card" *ngIf="activeTab === 'sports'">
          <div class="section-header">
            <h3>Platform Sports</h3>
            <button class="add-sport-btn" (click)="showAddSport = true">
              <mat-icon>add</mat-icon> Add New Sport
            </button>
          </div>

          <!-- Add Sport Form (Inline for simplicity) -->
          <div class="inline-form glass-card mb-4 animate-fade-in" *ngIf="showAddSport">
            <h4>New Sport Configuration</h4>
            <div class="form-row">
              <input type="text" placeholder="Sport Name (e.g. Rugby)" [(ngModel)]="newSport.name">
              <input type="text" placeholder="Icon (e.g. sports_rugby)" [(ngModel)]="newSport.icon">
              <button class="save-btn" (click)="saveSport()">Create Sport</button>
              <button class="cancel-btn" (click)="showAddSport = false">Cancel</button>
            </div>
          </div>

          <div class="sport-grid">
            <div class="sport-admin-card glass-card" *ngFor="let s of sports">
              <div class="s-icon">{{ getEmoji(s.name) }}</div>
              <div class="s-info">
                <div class="s-name">{{ s.name }}</div>
                <div class="s-status">{{ s.active ? 'Visible' : 'Hidden' }}</div>
              </div>
              <button mat-icon-button><mat-icon>settings</mat-icon></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .luxury-bg { background: #0F172A; color: white; }

    .glass-header {
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(20px);
      padding: 60px 40px 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    }

    .header-content h1 { font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -1px; }
    .header-content p { color: var(--text-muted); margin-top: 4px; }

    .stats-row { display: flex; gap: 20px; }
    .stat-card {
      background: rgba(255, 255, 255, 0.03);
      padding: 15px 25px;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .stat-card .val { font-size: 24px; font-weight: 800; color: var(--primary); }
    .stat-card .lab { font-size: 11px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }

    .dashboard-content { padding: 40px; }

    .admin-tabs { display: flex; gap: 10px; margin-bottom: 30px; }
    .admin-tabs button {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 16px;
      font-weight: 700;
      padding: 10px 20px;
      cursor: pointer;
      position: relative;
    }
    .admin-tabs button.active { color: var(--primary); }
    .admin-tabs button.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 20px;
      right: 20px;
      height: 3px;
      background: var(--primary);
      border-radius: 3px;
    }

    .glass-card {
      background: rgba(30, 41, 59, 0.5);
      backdrop-filter: blur(12px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      padding: 30px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .section-header h3 { margin: 0; font-size: 18px; font-weight: 700; }

    .search-compact {
      background: rgba(0,0,0,0.2);
      padding: 0 15px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 10px;
      height: 40px;
    }
    .search-compact input { background: transparent; border: none; color: white; outline: none; font-size: 13px; }
    .search-compact mat-icon { color: var(--text-muted); font-size: 18px; }

    .role-badge { font-size: 10px; font-weight: 800; padding: 3px 8px; border-radius: 6px; text-transform: uppercase; }
    .role-badge.super_admin { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
    .role-badge.admin { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
    .role-badge.player { background: rgba(148, 163, 184, 0.1); color: #94A3B8; }

    .status-pill { font-size: 11px; font-weight: 700; color: var(--primary); }
    .status-pill.blocked { color: #F87171; }

    .activate-btn { color: var(--primary); }

    .premium-table { background: transparent !important; width: 100%; }
    ::ng-deep .premium-table th { color: var(--text-muted) !important; font-size: 12px !important; text-transform: uppercase !important; font-weight: 700 !important; border-bottom: 1px solid rgba(255,255,255,0.05) !important; }
    ::ng-deep .premium-table td { color: white !important; font-size: 14px !important; border-bottom: 1px solid rgba(255,255,255,0.02) !important; padding: 15px 0 !important; }

    /* Sports Grid */
    .sport-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }
    .sport-admin-card {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 20px !important;
    }
    .s-icon { font-size: 32px; }
    .s-name { font-weight: 700; font-size: 16px; }
    .s-status { font-size: 11px; color: var(--text-muted); }

    .add-sport-btn {
      background: var(--primary);
      color: #0F172A;
      border: none;
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .inline-form h4 { margin: 0 0 15px; font-size: 14px; text-transform: uppercase; color: var(--primary); }
    .form-row { display: flex; gap: 15px; }
    .form-row input {
      flex: 1;
      background: rgba(0,0,0,0.3);
      border: 1px solid rgba(255,255,255,0.1);
      padding: 0 15px;
      border-radius: 10px;
      color: white;
      height: 44px;
    }
    .save-btn { background: var(--primary); color: #0F172A; border: none; padding: 0 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
    .cancel-btn { background: rgba(255,255,255,0.05); color: white; border: none; padding: 0 20px; border-radius: 10px; font-weight: 700; cursor: pointer; }
  `]
})
export class SuperAdminDashboardComponent implements OnInit {
  activeTab = 'users';
  users: User[] = [];
  sports: Sport[] = [];
  userColumns = ['name', 'email', 'role', 'status', 'actions'];
  userSearch = '';
  
  showAddSport = false;
  newSport = { name: '', icon: '' };

  constructor(private adminService: AdminService, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadUsers();
    this.loadSports();
  }

  loadUsers() {
    this.adminService.getAllUsers().subscribe(users => this.users = users);
  }

  loadSports() {
    this.adminService.getAllSports().subscribe(sports => this.sports = sports);
  }

  filteredUsers() {
    return this.users.filter(u => u.email.toLowerCase().includes(this.userSearch.toLowerCase()));
  }

  toggleBlock(user: User) {
    if (user.isBlocked) {
      this.adminService.activateUser(user.id).subscribe(() => {
        user.isBlocked = false;
        this.snackBar.open(`User ${user.name} activated.`, 'Close', { duration: 2000 });
      });
    } else {
      this.adminService.blockUser(user.id).subscribe(() => {
        user.isBlocked = true;
        this.snackBar.open(`User ${user.name} blocked.`, 'Close', { duration: 2000 });
      });
    }
  }

  saveSport() {
    if (!this.newSport.name) return;
    this.adminService.addSport(this.newSport).subscribe({
      next: (s) => {
        this.sports.push(s);
        this.newSport = { name: '', icon: '' };
        this.showAddSport = false;
        this.snackBar.open('Sport added successfully!', 'Close', { duration: 3000 });
      },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed to add sport', 'Close', { duration: 3000 })
    });
  }

  promote(email: string, role: string) {
    this.adminService.promoteUser(email, role).subscribe({
      next: (res) => {
        this.snackBar.open(res.message, 'Close', { duration: 3000 });
        this.loadUsers();
      },
      error: (err) => this.snackBar.open(err.error?.error || 'Promotion failed', 'Close', { duration: 3000 })
    });
  }

  getEmoji(sportName: string): string {
    const emojis: { [key: string]: string } = {
      'Cricket': '🏏',
      'Football': '⚽',
      'Tennis': '🎾',
      'Basketball': '🏀',
      'Table Tennis': '🏓',
      'Badminton': '🏸',
      'Pickleball': '🥒'
    };
    return emojis[sportName] || '🏆';
  }
}
