import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Match, CreateMatchRequest } from '../models/match.model';

@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly API = environment.apiUrl + '/matches';

  constructor(private http: HttpClient) {}

  getNearbyMatches(lng: number, lat: number, radius: number = 10,
                   skill?: string, type?: string, maxCost?: number, sport?: string): Observable<Match[]> {
    let params = new HttpParams()
      .set('lng', lng.toString())
      .set('lat', lat.toString())
      .set('radius', radius.toString());

    if (skill) params = params.set('skill', skill);
    if (type) params = params.set('type', type);
    if (maxCost !== undefined) params = params.set('maxCost', maxCost.toString());
    if (sport) params = params.set('sport', sport);

    return this.http.get<Match[]>(`${this.API}/nearby`, { params });
  }

  getMatch(id: string): Observable<Match> {
    return this.http.get<Match>(`${this.API}/${id}`);
  }

  createMatch(data: CreateMatchRequest): Observable<Match> {
    return this.http.post<Match>(this.API, data);
  }

  joinMatch(id: string): Observable<Match> {
    return this.http.post<Match>(`${this.API}/${id}/join`, {});
  }

  joinTeamByCode(matchId: string, team: 'A' | 'B', code: string): Observable<Match> {
    return this.http.post<Match>(`${this.API}/${matchId}/join-team`, { team, code });
  }

  leaveMatch(id: string): Observable<Match> {
    return this.http.post<Match>(`${this.API}/${id}/leave`, {});
  }

  getMyMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(`${this.API}/my`);
  }
}
