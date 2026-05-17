import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription, interval, startWith, switchMap } from 'rxjs';
import { EsportsService, EsportsMatch, EsportsMessage } from '../../../../app/core/services/esports.service';
import { AuthService } from '../../../../app/core/auth/auth.service';

@Component({
  selector: 'app-esports-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatIconModule],
  template: `
    <div class="page-container esports-chat-page">
      <div class="chat-layout glass-card">
        
        <!-- SIDEBAR: List of joined lobbies -->
        <div class="lobbies-sidebar">
          <div class="sidebar-header">
            <h3>Joined Lobbies</h3>
          </div>
          <div class="joined-list">
            <div class="no-joined" *ngIf="joinedLobbies().length === 0">
              <mat-icon>chat_bubble_outline</mat-icon>
              <p>Join a match lobby in the Arena to start strategy chats.</p>
            </div>
            
            <div class="lobby-item" 
                 *ngFor="let lobby of joinedLobbies()" 
                 [class.active]="lobby.id === activeMatchId()"
                 (click)="selectLobby(lobby.id)">
              <div class="lobby-icon">{{ lobby.gameName?.charAt(0)?.toUpperCase() }}</div>
              <div class="lobby-meta">
                <span class="lobby-title">{{ lobby.title }}</span>
                <span class="lobby-game">{{ lobby.gameName }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- MAIN PANEL: Chat interface -->
        <div class="chat-main" *ngIf="activeMatchId(); else selectPrompt">
          <div class="chat-header">
            <div class="header-meta">
              <h2>{{ activeMatch()?.title }}</h2>
              <span class="game-tag">{{ activeMatch()?.gameName }}</span>
            </div>
            <div class="participants-pills">
              <span class="p-count"><mat-icon>person</mat-icon> {{ activeMatch()?.joinedUserIds?.length || 0 }} online</span>
            </div>
          </div>

          <!-- Message stream -->
          <div class="messages-container" #scrollMe>
            <div class="message-bubble" 
                 *ngFor="let msg of messages()"
                 [class.my-message]="msg.senderId === currentUserId"
                 [class.system]="msg.isSystem">
              
              <div class="sender-name" *ngIf="msg.senderId !== currentUserId && !msg.isSystem">
                {{ msg.senderName }}
              </div>
              
              <div class="bubble-content">
                <p>{{ msg.content }}</p>
                <span class="timestamp">{{ msg.timestamp | date:'shortTime' }}</span>
              </div>
            </div>
          </div>

          <!-- Typing inputs -->
          <form (submit)="sendMessage($event)" class="chat-input-row">
            <input type="text" 
                   [(ngModel)]="chatText" 
                   name="chatText" 
                   required 
                   placeholder="Type your strategic message here..." 
                   autocomplete="off" />
            <button type="submit" [disabled]="!chatText.trim()">
              <mat-icon>send</mat-icon>
            </button>
          </form>
        </div>

        <!-- Fallback prompt -->
        <ng-template #selectPrompt>
          <div class="chat-main empty-chat">
            <mat-icon class="empty-icon">forum</mat-icon>
            <h3>Select a tactical lobby chat</h3>
            <p>Coordinate strategy, share console tags, and finalize voice comm guidelines with team members.</p>
          </div>
        </ng-template>

      </div>
    </div>
  `,
  styles: [`
    .esports-chat-page {
      padding: 24px;
      max-width: var(--content-max-width);
      margin: 0 auto;
      height: calc(100vh - 110px);
      padding-bottom: 24px;
    }

    .chat-layout {
      display: flex;
      height: 100%;
      background: rgba(15, 23, 42, 0.45);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      overflow: hidden;
    }

    /* Sidebar list */
    .lobbies-sidebar {
      width: 280px;
      border-right: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      flex-direction: column;
      background: rgba(15, 23, 42, 0.2);
    }
    .sidebar-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }
    .sidebar-header h3 {
      font-size: 16px;
      font-weight: 800;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .joined-list {
      flex: 1;
      overflow-y: auto;
      padding: 10px;
    }
    .no-joined {
      padding: 24px;
      text-align: center;
      color: var(--text-muted);
    }
    .no-joined mat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      margin-bottom: 12px;
    }
    .no-joined p {
      font-size: 12px;
    }
    .lobby-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
      margin-bottom: 4px;
    }
    .lobby-item:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    .lobby-item.active {
      background: rgba(6, 182, 212, 0.08);
      border: 1px solid rgba(6, 182, 212, 0.15);
    }
    .lobby-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      background: var(--gradient-primary);
      color: #0F172A;
      font-weight: 900;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 15px;
    }
    .lobby-meta {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
    }
    .lobby-title {
      font-size: 13px;
      color: white;
      font-weight: 700;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .lobby-game {
      font-size: 11px;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* Chat main pane */
    .chat-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;
      background: rgba(15, 23, 42, 0.35);
    }
    .chat-header {
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(15, 23, 42, 0.25);
    }
    .header-meta h2 {
      font-size: 18px;
      font-weight: 800;
      color: white;
      margin-bottom: 4px;
    }
    .game-tag {
      font-size: 10px;
      font-weight: 900;
      color: #22D3EE;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .p-count {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: var(--text-secondary);
      background: rgba(255, 255, 255, 0.05);
      padding: 4px 10px;
      border-radius: 20px;
    }
    .p-count mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: var(--primary);
    }

    /* Message streams */
    .messages-container {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .message-bubble {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      max-width: 70%;
    }
    .sender-name {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 4px;
      margin-left: 4px;
    }
    .bubble-content {
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.06);
      padding: 10px 14px;
      border-radius: 0 16px 16px 16px;
      position: relative;
    }
    .bubble-content p {
      font-size: 14px;
      color: white;
      line-height: 1.4;
    }
    .timestamp {
      font-size: 9px;
      color: var(--text-muted);
      float: right;
      margin-top: 6px;
    }

    .message-bubble.my-message {
      align-self: flex-end;
      align-items: flex-end;
    }
    .message-bubble.my-message .bubble-content {
      background: rgba(6, 182, 212, 0.15);
      border-color: rgba(6, 182, 212, 0.25);
      border-radius: 16px 0 16px 16px;
    }

    .message-bubble.system {
      align-self: center;
      max-width: 90%;
    }
    .message-bubble.system .bubble-content {
      background: transparent;
      border: none;
      padding: 4px;
    }
    .message-bubble.system .bubble-content p {
      font-size: 12px;
      color: var(--text-muted);
      font-style: italic;
    }

    /* Input box */
    .chat-input-row {
      display: flex;
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      gap: 12px;
      background: rgba(15, 23, 42, 0.25);
    }
    .chat-input-row input {
      flex: 1;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      color: white;
      padding: 12px 18px;
      font-size: 14px;
      outline: none;
    }
    .chat-input-row input:focus {
      border-color: var(--primary);
    }
    .chat-input-row button {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      border: none;
      background: var(--gradient-primary);
      color: #0F172A;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: var(--transition-base);
    }
    .chat-input-row button:disabled {
      background: rgba(255, 255, 255, 0.1);
      color: var(--text-muted);
      cursor: not-allowed;
    }

    .empty-chat {
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 48px;
    }
    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: var(--text-muted);
      margin-bottom: 16px;
    }

    /* Mobile adjustments */
    @media (max-width: 768px) {
      .lobbies-sidebar {
        width: 80px;
      }
      .sidebar-header, .lobby-meta {
        display: none !important;
      }
      .lobby-item {
        justify-content: center;
        padding: 8px;
      }
    }
  `]
})
export class EsportsChatComponent implements OnInit, OnDestroy {
  private esportsService = inject(EsportsService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  joinedLobbies = signal<EsportsMatch[]>([]);
  activeMatchId = signal<string | null>(null);
  activeMatch = signal<EsportsMatch | null>(null);
  messages = signal<EsportsMessage[]>([]);

  chatText = '';
  currentUserId = this.authService.currentUser()?.userId || '';

  private chatPollSubscription?: Subscription;

  ngOnInit() {
    this.loadJoinedLobbies();
    
    // Check route query param
    this.route.queryParams.subscribe(params => {
      const matchId = params['matchId'];
      if (matchId) {
        this.selectLobby(matchId);
      }
    });
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  loadJoinedLobbies() {
    this.esportsService.getMatches().subscribe({
      next: (data) => {
        // Lobbies where the user has joined
        const joined = data.filter(m => m.joinedUserIds?.includes(this.currentUserId));
        this.joinedLobbies.set(joined);
      }
    });
  }

  selectLobby(matchId?: string) {
    if (!matchId) return;
    this.activeMatchId.set(matchId);
    this.stopPolling();

    // Fetch details
    this.esportsService.getMatch(matchId).subscribe({
      next: (m) => {
        this.activeMatch.set(m);
        this.startPolling(matchId);
      }
    });
  }

  startPolling(matchId: string) {
    this.chatPollSubscription = interval(3000)
      .pipe(
        startWith(0),
        switchMap(() => this.esportsService.getChatHistory(matchId))
      )
      .subscribe({
        next: (history) => {
          this.messages.set(history);
        }
      });
  }

  stopPolling() {
    if (this.chatPollSubscription) {
      this.chatPollSubscription.unsubscribe();
      this.chatPollSubscription = undefined;
    }
  }

  sendMessage(event: Event) {
    event.preventDefault();
    const matchId = this.activeMatchId();
    const content = this.chatText.trim();
    if (!matchId || !content) return;

    this.esportsService.sendChatMessage(matchId, content).subscribe({
      next: (msg) => {
        this.messages.set([...this.messages(), msg]);
        this.chatText = '';
      }
    });
  }
}
