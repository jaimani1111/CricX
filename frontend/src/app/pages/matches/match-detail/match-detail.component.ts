import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Match } from '../../../core/models/match.model';
import { MatchService } from '../../../core/services/match.service';
import { AuthService } from '../../../core/auth/auth.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { PlayerService } from '../../../core/services/player.service';
import { MessageService, ChatMessage } from '../../../core/services/message.service';
import { User } from '../../../core/models/user.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MatProgressBarModule, MatChipsModule
  ],
  template: `
    <div class="page-container luxury-bg min-h-screen" *ngIf="match; else loadingTpl">
      
      <!-- Premium Sticky Header -->
      <div class="glass-header">
        <div class="header-top">
          <button mat-icon-button (click)="goBack()" class="back-btn">
            <mat-icon>arrow_back_ios</mat-icon>
          </button>
          
          <div class="tab-selectors">
            <button class="tab-btn" [class.active]="activeTab === 'details'" (click)="selectTab('details')">
              <mat-icon>info</mat-icon> Details
            </button>
            <button class="tab-btn" [class.active]="activeTab === 'chat'" (click)="selectTab('chat')">
              <mat-icon>chat_bubble</mat-icon> Group Chat
              <span class="chat-live-badge" *ngIf="isJoined">LIVE</span>
            </button>
          </div>

          <button mat-icon-button (click)="share()" class="action-btn">
            <mat-icon [class.text-primary]="match.sport === 'Cricket'">share</mat-icon>
          </button>
        </div>
      </div>

      <!-- MAIN TAB: DETAILS -->
      <div class="tab-content-wrapper" *ngIf="activeTab === 'details'">
        
        <!-- Glowing Stadium Pitch Card (Replaces broken map) -->
        <div class="pitch-card animate-fade-in-up">
          <div class="pitch-glow"></div>
          <div class="pitch-lines"></div>
          <div class="pitch-content">
            <div class="sport-badge">
              {{ getEmoji(match.sport) }} {{ match.sport }}
            </div>
            <div class="pitch-sport-icon">{{ getEmoji(match.sport) }}</div>
            <h1>{{ match.locationName }}</h1>
            <span class="status-pill" [class]="'status-' + match.status.toLowerCase()">{{ match.status }}</span>
          </div>
        </div>

        <!-- Detail Card -->
        <div class="detail-card glass-card card-stagger animate-fade-in-up">
          <div class="match-header">
            <p class="description" *ngIf="match.description">{{ match.description }}</p>
          </div>

          <!-- Venue & Time Grid -->
          <div class="info-grid">
            <div class="info-item">
              <div class="i-icon time"><mat-icon>event</mat-icon></div>
              <div class="i-val">
                <span class="lab">Date & Time</span>
                <span class="val">{{ formatDate(match.dateTime) }}</span>
              </div>
            </div>
            <div class="info-item">
              <div class="i-icon cost"><mat-icon>payments</mat-icon></div>
              <div class="i-val">
                <span class="lab">Entry Fee</span>
                <span class="val">{{ match.costPerPlayer === 0 ? 'FREE' : '₹' + match.costPerPlayer }}</span>
              </div>
            </div>
          </div>

          <!-- Team Challenge Section -->
          <div class="challenge-section" *ngIf="match.isTeamChallenge">
            <div class="vs-layout">
              <div class="team-side left">
                <div class="team-name">{{ match.teamAName }}</div>
                <div class="player-count">{{ match.teamAPlayers.length }} Players Joined</div>
                <div class="player-avatars">
                  <div class="avatar-mini" *ngFor="let p of match.teamAPlayers.slice(0, 4)">👤</div>
                </div>
                <button class="join-team-btn btn-a" *ngIf="!isJoined" (click)="joinWithCode('A', match.teamACode!)">
                  Join {{ match.teamAName }}
                </button>
              </div>

              <div class="vs-divider">
                <span class="vs-circle">VS</span>
              </div>

              <div class="team-side right">
                <div class="team-name">{{ match.teamBName }}</div>
                <div class="player-count">{{ match.teamBPlayers.length }} Players Joined</div>
                <div class="player-avatars">
                  <div class="avatar-mini" *ngFor="let p of match.teamBPlayers.slice(0, 4)">👤</div>
                </div>
                <button class="join-team-btn btn-b" *ngIf="!isJoined" (click)="joinWithCode('B', match.teamBCode!)">
                  Join {{ match.teamBName }}
                </button>
              </div>
            </div>
          </div>

          <!-- Casual Progress -->
          <div class="casual-progress" *ngIf="!match.isTeamChallenge">
            <div class="progress-meta">
              <span class="p-lab">Players Joined</span>
              <span class="p-count">{{ match.playersJoinedCount }} / {{ match.totalPlayers }}</span>
            </div>
            <mat-progress-bar mode="determinate" [value]="(match.playersJoinedCount / match.totalPlayers) * 100" class="premium-bar"></mat-progress-bar>
          </div>

          <!-- Host Info -->
          <div class="host-info">
            <div class="h-avatar">👤</div>
            <div class="h-text">
              <span class="h-name">{{ match.creatorName }}</span>
              <span class="h-label">Host & Organizer</span>
            </div>
            <div class="h-skill luxury-badge">{{ match.skillLevel }}</div>
          </div>

          <!-- Players Joined Roster List -->
          <div class="roster-section mt-6">
            <div class="roster-header">
              <h3>Joined Players ({{ joinedPlayersList.length }})</h3>
              <p class="roster-sub">Meet the squad registered for this activity</p>
            </div>
            
            <div class="empty-roster-tpl" *ngIf="joinedPlayersList.length === 0">
              <mat-icon>people_outline</mat-icon>
              <p>No players registered yet</p>
            </div>

            <div class="roster-list" *ngIf="joinedPlayersList.length > 0">
              <div class="roster-item animate-fade-in-up" *ngFor="let p of joinedPlayersList">
                <div class="r-avatar-container">
                  <!-- Base64 profile photo or name initials fallback -->
                  <div class="r-avatar" [style.background-image]="p.profilePicture ? 'url(' + p.profilePicture + ')' : ''" [class.has-photo]="!!p.profilePicture">
                    <span *ngIf="!p.profilePicture">{{ p.name.charAt(0).toUpperCase() }}</span>
                  </div>
                </div>
                <div class="r-info">
                  <span class="r-name">{{ p.name }}</span>
                  <span class="r-username">@{{ p.username }}</span>
                </div>
                <div class="r-meta">
                  <span class="r-badge skill">{{ p.skill || 'Beginner' }}</span>
                  <span class="r-badge role">{{ p.preferredRole || 'All-Rounder' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Actions -->
        <div class="bottom-actions" *ngIf="match.status === 'OPEN' || isJoined">
          <button class="primary-action-btn" *ngIf="!isJoined && !match.isTeamChallenge" (click)="joinMatch()">
            <mat-icon>bolt</mat-icon> Join Activity
          </button>

          <button class="leave-btn" *ngIf="isJoined && match.createdBy !== userId" (click)="leaveMatch()">
            <mat-icon>logout</mat-icon> Leave Match
          </button>

          <div class="creator-badge" *ngIf="isJoined && match.createdBy === userId">
            <mat-icon>emoji_events</mat-icon> YOU ARE THE HOST
          </div>
        </div>
      </div>

      <!-- MAIN TAB: GROUP CHAT -->
      <div class="tab-content-wrapper chat-tab" *ngIf="activeTab === 'chat'">
        <div class="group-chat-container">
          
          <!-- Not joined warning template -->
          <div class="not-joined-warning" *ngIf="!isJoined">
            <div class="warning-box glass-card">
              <mat-icon class="lock-icon">lock</mat-icon>
              <h2>Group Chat Locked</h2>
              <p>You must join this match activity to participate in the real-time group chat log and message other players.</p>
              <button class="join-chat-now-btn" *ngIf="!match.isTeamChallenge" (click)="joinMatch()">
                <mat-icon>bolt</mat-icon> Join Activity Now
              </button>
            </div>
          </div>

          <!-- Active chat feed -->
          <ng-container *ngIf="isJoined">
            <div class="chat-log" id="group-chat-log">
              <div class="chat-intro">
                <mat-icon>chat</mat-icon>
                <h3>Welcome to {{ match.locationName }} Group Chat</h3>
                <p>Discuss schedules, teams, coordination, and strategy here.</p>
              </div>

              <div class="chat-empty" *ngIf="groupMessages.length === 0">
                <p>No messages yet. Start the conversation!</p>
              </div>

              <div class="message-bubble-wrapper" *ngFor="let msg of groupMessages" [class.outgoing]="msg.senderId === userId">
                <div class="sender-info" *ngIf="msg.senderId !== userId">
                  <span class="sender-name">{{ msg.senderName }}</span>
                </div>
                <div class="bubble">
                  <div class="bubble-content">{{ msg.content }}</div>
                  <span class="bubble-time">{{ formatDate(msg.createdAt) }}</span>
                </div>
              </div>
            </div>

            <!-- Message Input bar -->
            <div class="chat-input-bar">
              <input type="text" [(ngModel)]="newGroupMessage" (keyup.enter)="sendGroupMessage()" placeholder="Type a group message...">
              <button class="send-message-btn" (click)="sendGroupMessage()" [disabled]="!newGroupMessage.trim()">
                <mat-icon>send</mat-icon>
              </button>
            </div>
          </ng-container>

        </div>
      </div>

    </div>

    <!-- Spinner -->
    <ng-template #loadingTpl>
      <div class="loading-container luxury-bg min-h-screen">
        <div class="loader-ripple"></div>
      </div>
    </ng-template>
  `,
  styles: [`
    .luxury-bg { background: #0F172A; color: white; }

    .glass-header {
      background: rgba(15, 23, 42, 0.9);
      backdrop-filter: blur(20px);
      padding: 16px 20px;
      position: fixed;
      top: 0; left: 0; right: 0;
      z-index: 100;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }
    .header-top { display: flex; justify-content: space-between; align-items: center; width: 100%; }
    .back-btn, .action-btn { color: white; background: rgba(255,255,255,0.03); }

    .tab-selectors {
      display: flex;
      background: rgba(0,0,0,0.25);
      border-radius: 12px;
      padding: 4px;
      border: 1px solid rgba(255,255,255,0.05);
    }
    .tab-btn {
      background: transparent;
      border: none;
      color: rgba(255,255,255,0.5);
      font-size: 13px;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .tab-btn mat-icon { font-size: 16px; width: 16px; height: 16px; }
    .tab-btn.active {
      background: var(--primary);
      color: #0F172A;
    }
    .chat-live-badge {
      background: #F87171;
      color: white;
      font-size: 8px;
      font-weight: 900;
      padding: 1px 4px;
      border-radius: 100px;
      animation: pulse 1.5s infinite;
    }

    .tab-content-wrapper {
      padding-top: 80px;
      display: flex;
      flex-direction: column;
    }

    /* Premium pitch visual card */
    .pitch-card {
      margin: 16px 24px;
      height: 240px;
      background: linear-gradient(135deg, #1E293B, #0F172A);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    }
    .pitch-glow {
      position: absolute;
      inset: -50px;
      background: radial-gradient(circle, rgba(74, 222, 128, 0.15) 0%, rgba(15, 23, 42, 0) 70%);
      filter: blur(40px);
    }
    .pitch-lines {
      position: absolute;
      inset: 20px;
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 16px;
      pointer-events: none;
    }
    .pitch-lines::before {
      content: '';
      position: absolute;
      top: 50%; left: 0; right: 0;
      height: 1px;
      background: rgba(255,255,255,0.04);
    }
    .pitch-content { position: relative; z-index: 2; padding: 20px; }
    .pitch-sport-icon { font-size: 64px; margin-bottom: 8px; }
    .pitch-card h1 { font-size: 24px; font-weight: 800; margin: 8px 0; color: white; letter-spacing: -0.5px; }

    .status-pill {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
    }
    .status-open { color: var(--primary); border-color: rgba(74, 222, 128, 0.3); background: rgba(74, 222, 128, 0.05); }

    .detail-card {
      margin: 0 24px 120px;
      background: rgba(30, 41, 59, 0.4) !important;
      backdrop-filter: blur(20px) !important;
      border-radius: 24px !important;
      padding: 24px !important;
    }
    @media (max-width: 1023px) {
      .detail-card { margin: 0 24px 180px !important; }
    }

    .sport-badge {
      display: inline-block;
      background: rgba(74, 222, 128, 0.1);
      color: var(--primary);
      padding: 4px 10px;
      border-radius: 100px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

    .description { color: var(--text-muted); font-size: 14px; line-height: 1.6; }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin: 24px 0;
    }

    .info-item { display: flex; align-items: center; gap: 12px; }
    .i-icon {
      width: 44px; height: 44px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      background: rgba(255,255,255,0.03);
    }
    .i-icon.time { color: #3B82F6; background: rgba(59, 130, 246, 0.08); }
    .i-icon.cost { color: #4ADE80; background: rgba(74, 222, 128, 0.08); }
    
    .i-val { display: flex; flex-direction: column; }
    .lab { font-size: 10px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; }
    .val { font-size: 13px; font-weight: 700; }

    /* Challenge */
    .challenge-section { margin-top: 24px; }
    .vs-layout { display: flex; align-items: center; gap: 12px; }
    .team-side {
      flex: 1;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 16px;
      padding: 16px 12px;
      text-align: center;
    }
    .team-name { font-weight: 800; font-size: 15px; margin-bottom: 4px; }
    .player-count { font-size: 11px; color: var(--text-muted); margin-bottom: 8px; }
    .player-avatars { display: flex; justify-content: center; gap: -4px; margin-bottom: 12px; }
    .avatar-mini { width: 20px; height: 20px; background: #334155; border-radius: 50%; border: 2px solid #0F172A; font-size: 10px; }

    .join-team-btn {
      width: 100%; height: 32px;
      border: none; border-radius: 8px;
      font-size: 11px; font-weight: 700; cursor: pointer;
    }
    .btn-a { background: var(--primary); color: #0F172A; }
    .btn-b { background: #3B82F6; color: white; }

    .vs-circle {
      width: 32px; height: 32px;
      background: #0F172A;
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 900; font-style: italic; color: var(--text-muted);
      font-size: 11px;
    }

    /* Casual Progress */
    .casual-progress { margin-top: 24px; }
    .progress-meta { display: flex; justify-content: space-between; margin-bottom: 8px; }
    .p-lab { font-weight: 700; font-size: 11px; text-transform: uppercase; color: var(--text-muted); }
    .p-count { color: var(--primary); font-weight: 800; }
    .premium-bar { height: 8px !important; border-radius: 4px; }

    /* Host info */
    .host-info {
       margin-top: 24px;
       display: flex; align-items: center; gap: 16px;
       background: rgba(255,255,255,0.02);
       padding: 12px 16px; border-radius: 16px;
       border: 1px solid rgba(255,255,255,0.04);
    }
    .h-avatar { width: 38px; height: 38px; background: #334155; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
    .h-text { flex: 1; display: flex; flex-direction: column; }
    .h-name { font-weight: 700; font-size: 14px; }
    .h-label { font-size: 10px; color: var(--text-muted); }
    .luxury-badge { background: rgba(74, 222, 128, 0.1); color: var(--primary); padding: 4px 10px; border-radius: 100px; font-size: 10px; font-weight: 800; }

    /* Players Joined Roster */
    .roster-section { margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 24px; }
    .roster-header h3 { font-size: 18px; font-weight: 800; margin: 0; }
    .roster-header p { font-size: 12px; color: var(--text-muted); margin: 4px 0 16px; }

    .empty-roster-tpl {
      text-align: center;
      padding: 30px;
      background: rgba(255,255,255,0.01);
      border-radius: 16px;
      border: 1px dashed rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.3);
    }
    .empty-roster-tpl mat-icon { font-size: 32px; width: 32px; height: 32px; }

    .roster-list { display: flex; flex-direction: column; gap: 10px; }
    .roster-item {
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.02);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 16px;
      padding: 12px 16px;
      transition: all 0.2s;
    }
    .roster-item:hover { background: rgba(255,255,255,0.04); border-color: var(--primary); }
    
    .r-avatar-container { margin-right: 12px; }
    .r-avatar {
      width: 40px; height: 40px;
      background: #1E293B;
      border: 1px solid var(--primary);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; color: var(--primary);
      background-size: cover;
      background-position: center;
    }

    .r-info { flex: 1; display: flex; flex-direction: column; }
    .r-name { font-weight: 700; font-size: 14px; }
    .r-username { font-size: 11px; color: var(--text-muted); margin-top: 2px; }

    .r-meta { display: flex; gap: 6px; }
    .r-badge {
      font-size: 9px;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 100px;
      text-transform: uppercase;
    }
    .r-badge.skill { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
    .r-badge.role { background: rgba(74, 222, 128, 0.1); color: var(--primary); }

    /* Actions */
    .bottom-actions { position: fixed; bottom: 30px; left: 24px; right: 24px; z-index: 99; }
    @media (max-width: 1023px) {
      .bottom-actions { bottom: 84px !important; }
    }
    .primary-action-btn {
      width: 100%; height: 54px;
      background: var(--primary); color: #0F172A;
      border: none; border-radius: 16px;
      font-weight: 800; font-size: 15px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      box-shadow: 0 10px 25px rgba(74, 222, 128, 0.3);
      cursor: pointer;
    }
    .leave-btn {
      width: 100%; height: 48px;
      background: rgba(248, 113, 113, 0.1); color: #F87171;
      border: 1px solid rgba(248, 113, 113, 0.2); border-radius: 14px;
      font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }
    .creator-badge {
      text-align: center; color: var(--primary); font-weight: 800; font-size: 12px; 
      display: flex; align-items: center; justify-content: center; gap: 6px;
    }

    /* GROUP CHAT WRAPPERS */
    .chat-tab { height: calc(100vh - 80px); display: flex; flex-direction: column; }
    .group-chat-container { flex: 1; display: flex; flex-direction: column; overflow: hidden; background: #0b0f19; }
    
    .not-joined-warning {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 30px;
    }
    .warning-box {
      text-align: center;
      padding: 40px 30px;
      max-width: 360px;
      border: 1px solid rgba(255,255,255,0.06);
    }
    .lock-icon { font-size: 48px; width: 48px; height: 48px; color: #F59E0B; margin-bottom: 16px; }
    .warning-box h2 { font-size: 20px; font-weight: 800; margin: 0 0 10px; }
    .warning-box p { font-size: 13px; color: var(--text-muted); line-height: 1.6; margin-bottom: 24px; }
    .join-chat-now-btn {
      background: var(--primary); color: #0F172A; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; margin: 0 auto;
    }

    .chat-log {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .chat-intro {
      text-align: center;
      background: rgba(255,255,255,0.02);
      border-radius: 16px;
      padding: 20px;
      border: 1px solid rgba(255,255,255,0.04);
      margin-bottom: 10px;
    }
    .chat-intro mat-icon { font-size: 32px; width: 32px; height: 32px; color: var(--primary); margin-bottom: 8px; }
    .chat-intro h3 { font-size: 15px; font-weight: 700; margin: 0; }
    .chat-intro p { font-size: 11px; color: var(--text-muted); margin: 4px 0 0; }

    .chat-empty { text-align: center; color: var(--text-muted); padding: 40px; font-size: 13px; }

    .message-bubble-wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      max-width: 75%;
    }
    .message-bubble-wrapper.outgoing {
      align-self: flex-end;
      align-items: flex-end;
    }

    .sender-info { margin-bottom: 4px; margin-left: 10px; }
    .sender-name { font-size: 10px; font-weight: 800; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; }

    .bubble {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.06);
      padding: 12px 16px;
      border-radius: 16px 16px 16px 4px;
      position: relative;
    }
    .message-bubble-wrapper.outgoing .bubble {
      background: var(--primary);
      border-color: var(--primary);
      color: #0F172A;
      border-radius: 16px 16px 4px 16px;
    }
    .bubble-content { font-size: 13px; line-height: 1.5; word-break: break-word; }
    .bubble-time { font-size: 9px; color: var(--text-muted); margin-top: 4px; display: block; text-align: right; }
    .message-bubble-wrapper.outgoing .bubble-time { color: rgba(15,23,42,0.6); }

    .chat-input-bar {
      padding: 16px 20px;
      background: rgba(15,23,42,0.9);
      border-top: 1px solid rgba(255,255,255,0.05);
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .chat-input-bar input {
      flex: 1;
      background: rgba(0,0,0,0.25);
      border: 1px solid rgba(255,255,255,0.08);
      height: 46px;
      border-radius: 12px;
      padding: 0 16px;
      color: white;
      outline: none;
      font-size: 13px;
    }
    .send-message-btn {
      width: 46px; height: 46px;
      background: var(--primary);
      color: #0F172A;
      border: none;
      border-radius: 12px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .send-message-btn:disabled { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.2); cursor: not-allowed; }

    @keyframes pulse {
      0% { opacity: 0.6; }
      50% { opacity: 1; }
      100% { opacity: 0.6; }
    }

    .loading-container { display: flex; align-items: center; justify-content: center; }
  `]
})
export class MatchDetailComponent implements OnInit, OnDestroy {
  match: Match | null = null;
  userId = '';
  isJoined = false;
  actionLoading = false;
  
  // Custom interactive navigation state
  activeTab: 'details' | 'chat' = 'details';

  // Joined players list
  joinedPlayersList: User[] = [];

  // Group chat logs
  groupMessages: ChatMessage[] = [];
  newGroupMessage = '';
  chatPollInterval: any;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private matchService: MatchService,
    private authService: AuthService,
    private wsService: WebSocketService,
    private playerService: PlayerService,
    private messageService: MessageService,
    private snackBar: MatSnackBar
  ) {
    this.userId = this.authService.getUserId() || '';
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadMatch(id);
      
      this.wsService.watchMatch(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe(update => {
          if (update.event === 'MATCH_JOINED' || update.event === 'MATCH_LEFT') {
            this.match = update.match;
            this.updateLocalState();
          }
      });
    }
  }

  loadMatch(id: string) {
    this.matchService.getMatch(id).subscribe({
      next: (data) => {
        this.match = data;
        this.updateLocalState();
      },
      error: () => {
        this.snackBar.open('Match not found', 'Close', { duration: 3000 });
        this.router.navigate(['/matches']);
      }
    });
  }

  updateLocalState() {
    if (!this.match) return;
    this.isJoined = this.match.playersJoined.includes(this.userId);
    this.loadJoinedPlayers();

    if (this.isJoined) {
      this.startChatPolling();
    } else {
      this.stopChatPolling();
    }
  }

  loadJoinedPlayers() {
    if (!this.match || !this.match.playersJoined || this.match.playersJoined.length === 0) {
      this.joinedPlayersList = [];
      return;
    }
    this.playerService.getPlayersByIds(this.match.playersJoined).subscribe({
      next: (players) => {
        this.joinedPlayersList = players;
      },
      error: (err) => {
        console.error('Failed to load joined players details', err);
      }
    });
  }

  selectTab(tab: 'details' | 'chat') {
    this.activeTab = tab;
    if (tab === 'chat' && this.isJoined) {
      this.loadGroupMessages();
      this.startChatPolling();
    } else {
      this.stopChatPolling();
    }
  }

  startChatPolling() {
    this.stopChatPolling();
    this.chatPollInterval = setInterval(() => {
      if (this.activeTab === 'chat' && this.isJoined) {
        this.loadGroupMessages();
      }
    }, 4000);
  }

  stopChatPolling() {
    if (this.chatPollInterval) {
      clearInterval(this.chatPollInterval);
      this.chatPollInterval = null;
    }
  }

  loadGroupMessages() {
    if (!this.match) return;
    const groupId = 'group_' + this.match.id;
    this.messageService.getGroupConversation(groupId).subscribe({
      next: (messages) => {
        this.groupMessages = messages;
        this.scrollToBottom();
      }
    });
  }

  sendGroupMessage() {
    if (!this.match || !this.newGroupMessage.trim()) return;
    const groupId = 'group_' + this.match.id;
    const content = this.newGroupMessage.trim();
    this.newGroupMessage = '';

    this.messageService.sendMessage(groupId, content).subscribe({
      next: (sent) => {
        this.loadGroupMessages();
      },
      error: (err) => {
        console.error('Failed to send group message', err);
      }
    });
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatLog = document.getElementById('group-chat-log');
      if (chatLog) {
        chatLog.scrollTop = chatLog.scrollHeight;
      }
    }, 100);
  }

  joinMatch() {
    if (!this.match) return;
    this.actionLoading = true;
    this.matchService.joinMatch(this.match.id).subscribe({
      next: (m) => {
        this.actionLoading = false;
        this.match = m;
        this.updateLocalState();
        this.snackBar.open('Joined match! ⚡', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.actionLoading = false;
        this.snackBar.open(err.error?.error || 'Failed to join', 'Close', { duration: 3000 });
      }
    });
  }

  joinWithCode(team: 'A' | 'B', code: string) {
    if (!this.match) return;
    this.matchService.joinTeamByCode(this.match.id, team, code).subscribe({
      next: (m) => {
        this.match = m;
        this.updateLocalState();
        this.snackBar.open('Joined team! 🏆', 'Close', { duration: 2000 });
      },
      error: (err) => this.snackBar.open(err.error?.error || 'Failed to join team', 'Close', { duration: 3000 })
    });
  }

  leaveMatch() {
    if (!this.match) return;
    this.actionLoading = true;
    this.matchService.leaveMatch(this.match.id).subscribe({
      next: (m) => {
        this.actionLoading = false;
        this.match = m;
        this.updateLocalState();
        this.snackBar.open('Left match', 'Close', { duration: 2000 });
      },
      error: (err) => {
        this.actionLoading = false;
        this.snackBar.open(err.error?.error || 'Failed to leave', 'Close', { duration: 3000 });
      }
    });
  }

  formatDate(dateStr: string | undefined): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  getEmoji(sport: string): string {
    const emojis: { [key: string]: string } = {
      'Cricket': '🏏', 'Football': '⚽', 'Tennis': '🎾',
      'Basketball': '🏀', 'Table Tennis': '🏓', 'Badminton': '🏸',
      'Pickleball': '🥒'
    };
    return emojis[sport] || '🏆';
  }

  goBack() { this.router.navigate(['/matches']); }

  share() {
    const text = `Join this ${this.match?.sport} match at ${this.match?.locationName}`;
    if (navigator.share) {
      navigator.share({ title: 'Playb Match', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.snackBar.open('Link copied!', 'Close', { duration: 2000 });
    }
  }

  ngOnDestroy() {
    this.stopChatPolling();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
