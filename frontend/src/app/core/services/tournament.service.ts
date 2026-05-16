import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface Tournament {
  id: string;
  adminId: string;
  adminName: string;
  title: string;
  description: string;
  sport: string;
  locationName: string;
  location?: { coordinates: number[] };
  dateTime: string;
  entryFee: number;
  prizePool: number;
  maxTeams: number;
  joinedPlayers: string[];
  status: 'OPEN' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
}

export interface TournamentRequest {
  title: string;
  description: string;
  sport: string;
  locationName: string;
  longitude: number;
  latitude: number;
  dateTime: string;
  entryFee: number;
  prizePool: number;
  maxTeams: number;
}

@Injectable({ providedIn: 'root' })
export class TournamentService {
  private readonly API = environment.apiUrl + '/tournaments';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ 'Authorization': `Bearer ${this.authService.getToken()}` });
  }

  getAll(): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(this.API);
  }

  getById(id: string): Observable<Tournament> {
    return this.http.get<Tournament>(`${this.API}/${id}`);
  }

  getNearby(lng: number, lat: number, radiusKm: number = 50): Observable<Tournament[]> {
    return this.http.get<Tournament[]>(`${this.API}/nearby?lng=${lng}&lat=${lat}&radius=${radiusKm}`);
  }

  create(data: TournamentRequest): Observable<Tournament> {
    return this.http.post<Tournament>(this.API, data, { headers: this.getHeaders() });
  }

  join(id: string): Observable<Tournament> {
    return this.http.post<Tournament>(`${this.API}/${id}/join`, {}, { headers: this.getHeaders() });
  }
}
