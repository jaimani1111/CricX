import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { MessageService, ChatMessage, InboxEntry } from '../../core/services/message.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule],
  template: `
    <div class="page-container luxury-bg min-h-screen">
      <!-- INBOX VIEW -->
      <div *ngIf="!activeChat" class="inbox-view animate-fade-in-up">
        <div class="glass-header-compact">
          <h1>Messages</h1>
          <p>Your conversations</p>
        </div>

        <div class="inbox-list" *ngIf="!inboxLoading">
          <div class="chat-item glass-card"
               *ngFor="let c of inbox"
               (click)="openChat(c.userId, c.userName)">
            <div class="avatar">{{ getInitial(c.userName) }}</div>
            <div class="chat-meta">
              <div class="chat-name">
                {{ c.userName }}
                <span class="unread-badge" *ngIf="c.unreadCount > 0">{{ c.unreadCount }}</span>
              </div>
              <div class="chat-preview">{{ c.lastMessage }}</div>
            </div>
            <div class="chat-time">{{ formatTime(c.lastMessageTime) }}</div>
          </div>

          <!-- Empty State -->
          <div class="empty-state glass-card" *ngIf="inbox.length === 0">
            <mat-icon>forum</mat-icon>
            <h3>No conversations yet</h3>
            <p>Go to the Players page and tap on a player to start chatting!</p>
          </div>
        </div>

        <div class="skeleton-list" *ngIf="inboxLoading">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4]"></div>
        </div>
      </div>

      <!-- CHAT VIEW -->
      <div *ngIf="activeChat" class="chat-view animate-fade-in">
        <div class="chat-header glass-card">
          <button class="back-btn" (click)="closeChat()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <div class="avatar sm">{{ getInitial(activeChatName) }}</div>
          <div class="chat-header-info">
            <div class="chat-header-name">{{ activeChatName }}</div>
            <div class="chat-header-status">Online</div>
          </div>
        </div>

        <div class="messages-area" #messagesArea>
          <div class="msg-bubble"
               *ngFor="let m of messages"
               [class.sent]="m.senderId === myUserId"
               [class.received]="m.senderId !== myUserId">
            <div class="msg-content">{{ m.content }}</div>
            <div class="msg-time">{{ formatMessageTime(m.createdAt) }}</div>
          </div>

          <div class="empty-chat" *ngIf="messages.length === 0 && !chatLoading">
            <mat-icon>waving_hand</mat-icon>
            <p>Say hello! 👋</p>
          </div>
        </div>

        <div class="compose-area">
          <div class="compose-box glass-card">
            <input type="text"
                   [(ngModel)]="newMessage"
                   (keyup.enter)="send()"
                   placeholder="Type a message..."
                   autofocus>
            <button class="send-btn" (click)="send()" [disabled]="!newMessage.trim()">
              <mat-icon>send</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .luxury-bg { background: #0F172A; color: white; }

    .glass-header-compact {
      padding: 50px 24px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .glass-header-compact h1 { font-size: 32px; font-weight: 800; letter-spacing: -1px; margin: 0; }
    .glass-header-compact p { color: var(--text-muted); font-size: 14px; margin-top: 4px; }

    .inbox-list { padding: 16px; display: flex; flex-direction: column; gap: 8px; padding-bottom: 120px; }

    .chat-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px 20px !important;
      cursor: pointer;
      transition: all 0.2s ease;
      border-radius: 20px !important;
    }
    .chat-item:hover { background: rgba(255,255,255,0.05); transform: translateX(4px); }

    .avatar {
      width: 48px; height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--primary), #059669);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 18px; color: #0F172A;
      flex-shrink: 0;
    }
    .avatar.sm { width: 38px; height: 38px; font-size: 14px; }

    .chat-meta { flex: 1; min-width: 0; }
    .chat-name { font-weight: 700; font-size: 15px; display: flex; align-items: center; gap: 8px; }
    .chat-preview { font-size: 13px; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 2px; }

    .unread-badge {
      background: var(--primary); color: #0F172A;
      font-size: 10px; font-weight: 800;
      min-width: 20px; height: 20px;
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      padding: 0 6px;
    }

    .chat-time { font-size: 11px; color: var(--text-muted); flex-shrink: 0; }

    /* CHAT VIEW */
    .chat-view { display: flex; flex-direction: column; height: 100vh; }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px !important;
      border-radius: 0 !important;
      border-bottom: 1px solid rgba(255,255,255,0.06);
      position: sticky; top: 0; z-index: 10;
      background: rgba(12, 15, 22, 0.95) !important;
      backdrop-filter: blur(20px);
    }
    .back-btn { background: none; border: none; color: white; cursor: pointer; padding: 8px; display: flex; }
    .chat-header-name { font-weight: 700; font-size: 15px; }
    .chat-header-status { font-size: 11px; color: var(--primary); }

    .messages-area {
      flex: 1;
      padding: 20px 16px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding-bottom: 100px;
    }

    .msg-bubble {
      max-width: 75%;
      padding: 12px 16px;
      border-radius: 18px;
      position: relative;
      animation: fadeInUp 0.2s ease;
    }
    .msg-bubble.sent {
      align-self: flex-end;
      background: var(--primary);
      color: #0F172A;
      border-bottom-right-radius: 4px;
    }
    .msg-bubble.received {
      align-self: flex-start;
      background: rgba(255,255,255,0.06);
      border-bottom-left-radius: 4px;
    }
    .msg-content { font-size: 14px; line-height: 1.4; word-wrap: break-word; }
    .msg-time { font-size: 10px; opacity: 0.6; margin-top: 4px; text-align: right; }

    .compose-area {
      position: fixed;
      bottom: 80px; left: 0; right: 0;
      padding: 12px 16px;
      z-index: 10;
    }
    .compose-box {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 12px 8px 20px !important;
      border-radius: 28px !important;
      background: rgba(30, 41, 59, 0.9) !important;
      border: 1px solid rgba(255,255,255,0.1) !important;
    }
    .compose-box input {
      flex: 1;
      background: transparent;
      border: none;
      color: white;
      font-size: 14px;
      outline: none;
      font-family: inherit;
    }
    .send-btn {
      width: 40px; height: 40px;
      border-radius: 50%;
      background: var(--primary);
      color: #0F172A;
      border: none;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .send-btn:hover:not(:disabled) { transform: scale(1.1); }
    .send-btn:disabled { opacity: 0.4; }
    .send-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .empty-state, .empty-chat {
      text-align: center; padding: 60px 30px !important; margin-top: 20px;
    }
    .empty-state mat-icon, .empty-chat mat-icon {
      font-size: 56px; width: 56px; height: 56px;
      color: var(--primary); opacity: 0.3; margin-bottom: 16px;
    }
    .empty-state h3, .empty-chat h3 { font-size: 18px; font-weight: 700; margin-bottom: 8px; }
    .empty-state p, .empty-chat p { color: var(--text-muted); font-size: 14px; }

    .skeleton-card {
      height: 72px; border-radius: 20px;
      background: rgba(255,255,255,0.03);
      margin: 8px 16px;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (min-width: 1024px) {
      .compose-area { bottom: 16px; left: var(--sidebar-width); }
      .glass-header-compact { padding: 40px 48px 20px; }
      .inbox-list { padding: 24px 48px; }
    }
  `]
})
export class MessagesComponent implements OnInit {
  @ViewChild('messagesArea') messagesArea!: ElementRef;

  inbox: InboxEntry[] = [];
  messages: ChatMessage[] = [];
  inboxLoading = true;
  chatLoading = false;

  activeChat: string | null = null;
  activeChatName = '';
  newMessage = '';
  myUserId = '';

  private pollInterval: any;

  constructor(
    private messageService: MessageService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.myUserId = this.authService.getUserId() || '';
    this.loadInbox();

    // Check if opened with a specific user (from player card click)
    this.route.queryParams.subscribe(params => {
      if (params['userId'] && params['userName']) {
        this.openChat(params['userId'], params['userName']);
      }
    });
  }

  loadInbox() {
    this.inboxLoading = true;
    this.messageService.getInbox().subscribe({
      next: (data) => {
        this.inbox = data;
        this.inboxLoading = false;
      },
      error: () => this.inboxLoading = false
    });
  }

  openChat(userId: string, userName: string) {
    this.activeChat = userId;
    this.activeChatName = userName;
    this.chatLoading = true;
    this.loadMessages();

    // Poll for new messages every 3 seconds
    this.pollInterval = setInterval(() => this.loadMessages(), 3000);
  }

  closeChat() {
    this.activeChat = null;
    this.messages = [];
    if (this.pollInterval) clearInterval(this.pollInterval);
    this.loadInbox();
  }

  loadMessages() {
    if (!this.activeChat) return;
    this.messageService.getConversation(this.activeChat).subscribe({
      next: (msgs) => {
        this.messages = msgs;
        this.chatLoading = false;
        setTimeout(() => this.scrollToBottom(), 50);
      },
      error: () => this.chatLoading = false
    });
  }

  send() {
    if (!this.newMessage.trim() || !this.activeChat) return;
    const content = this.newMessage.trim();
    this.newMessage = '';

    this.messageService.sendMessage(this.activeChat, content).subscribe({
      next: (msg) => {
        this.messages.push(msg);
        setTimeout(() => this.scrollToBottom(), 50);
      }
    });
  }

  scrollToBottom() {
    if (this.messagesArea?.nativeElement) {
      this.messagesArea.nativeElement.scrollTop = this.messagesArea.nativeElement.scrollHeight;
    }
  }

  getInitial(name: string): string {
    return name ? name.charAt(0).toUpperCase() : '?';
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diffH = (now.getTime() - d.getTime()) / 3600000;
    if (diffH < 24) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffH < 168) return d.toLocaleDateString([], { weekday: 'short' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  formatMessageTime(dateStr: string): string {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }
}
