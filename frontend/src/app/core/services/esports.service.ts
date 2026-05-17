import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface EsportsMatch {
  id?: string;
  gameName: string;
  gameIcon?: string;
  title: string;
  type?: string;
  mode: string;
  maxSlots: number;
  skillLevel: string;
  startTime: string;
  region: string;
  voiceCommPlatform: string;
  voiceCommLink?: string;
  streamLink?: string;
  description: string;
  rules?: string;
  tags?: string[];
  hostId?: string;
  hostName?: string;
  joinedUserIds?: string[];
  createdAt?: string;
}

export interface EsportsProfile {
  id?: string;
  gamerTag: string;
  preferredGames: string[];
  role?: string;
  skillLevel?: string;
  rankTier?: string;
  customStats?: Record<string, string>;
  screenshotProof?: string;
  bio?: string;
  discordUsername?: string;
  socialLinks?: string;
}

export interface EsportsTeam {
  teamName: string;
  captainUserId?: string;
  playerUserIds?: string[];
}

export interface EsportsTournament {
  id?: string;
  title: string;
  gameName: string;
  description: string;
  rules?: string;
  startTime: string;
  maxTeams: number;
  playersPerTeam: number;
  tags?: string[];
  hostId?: string;
  registeredTeams?: EsportsTeam[];
  createdAt?: string;
}

export interface EsportsMessage {
  id?: string;
  matchId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isSystem: boolean;
}

@Injectable({ providedIn: 'root' })
export class EsportsService {
  private readonly BASE_API = environment.apiUrl + '/esports';

  // Core mode state signal
  activeMode = signal<'sports' | 'esports'>('sports');

  constructor(private http: HttpClient, private router: Router) {
    // Load initial mode state
    const savedMode = localStorage.getItem('playb_mode');
    if (savedMode === 'esports') {
      this.setMode('esports');
    } else {
      this.setMode('sports');
    }
  }

  setMode(mode: 'sports' | 'esports') {
    this.activeMode.set(mode);
    localStorage.setItem('playb_mode', mode);

    const body = document.body;
    if (mode === 'esports') {
      body.classList.add('esports-theme');
    } else {
      body.classList.remove('esports-theme');
    }
  }

  toggleMode() {
    const nextMode = this.activeMode() === 'sports' ? 'esports' : 'sports';
    this.setMode(nextMode);

    if (nextMode === 'esports') {
      this.router.navigate(['/esports/arena']);
    } else {
      this.router.navigate(['/matches']);
    }
  }

  // --- MATCHES API ---
  getMatches(): Observable<EsportsMatch[]> {
    return this.http.get<EsportsMatch[]>(`${this.BASE_API}/matches`);
  }

  getMatch(id: string): Observable<EsportsMatch> {
    return this.http.get<EsportsMatch>(`${this.BASE_API}/matches/${id}`);
  }

  createMatch(match: EsportsMatch): Observable<EsportsMatch> {
    return this.http.post<EsportsMatch>(`${this.BASE_API}/matches`, match);
  }

  joinMatch(id: string): Observable<EsportsMatch> {
    return this.http.post<EsportsMatch>(`${this.BASE_API}/matches/${id}/join`, {});
  }

  leaveMatch(id: string): Observable<EsportsMatch> {
    return this.http.post<EsportsMatch>(`${this.BASE_API}/matches/${id}/leave`, {});
  }

  // --- PROFILES API ---
  getProfiles(): Observable<EsportsProfile[]> {
    return this.http.get<EsportsProfile[]>(`${this.BASE_API}/profiles`);
  }

  getMyProfile(): Observable<EsportsProfile> {
    return this.http.get<EsportsProfile>(`${this.BASE_API}/profiles/my`);
  }

  getProfile(userId: string): Observable<EsportsProfile> {
    return this.http.get<EsportsProfile>(`${this.BASE_API}/profiles/${userId}`);
  }

  saveProfile(profile: EsportsProfile): Observable<EsportsProfile> {
    return this.http.put<EsportsProfile>(`${this.BASE_API}/profiles`, profile);
  }

  // --- TOURNAMENTS API ---
  getTournaments(): Observable<EsportsTournament[]> {
    return this.http.get<EsportsTournament[]>(`${this.BASE_API}/tournaments`);
  }

  getTournament(id: string): Observable<EsportsTournament> {
    return this.http.get<EsportsTournament>(`${this.BASE_API}/tournaments/${id}`);
  }

  createTournament(t: EsportsTournament): Observable<EsportsTournament> {
    return this.http.post<EsportsTournament>(`${this.BASE_API}/tournaments`, t);
  }

  registerTeam(tournamentId: string, team: EsportsTeam): Observable<EsportsTournament> {
    return this.http.post<EsportsTournament>(`${this.BASE_API}/tournaments/${tournamentId}/register`, team);
  }

  // --- LOBBY CHAT API ---
  getChatHistory(matchId: string): Observable<EsportsMessage[]> {
    return this.http.get<EsportsMessage[]>(`${this.BASE_API}/chat/${matchId}`);
  }

  sendChatMessage(matchId: string, content: string): Observable<EsportsMessage> {
    return this.http.post<EsportsMessage>(`${this.BASE_API}/chat/${matchId}`, { content });
  }
}
