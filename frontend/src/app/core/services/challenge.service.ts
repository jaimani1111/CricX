import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Challenge, CreateChallengeRequest } from '../models/challenge.model';

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private readonly API = environment.apiUrl + '/challenges';

  constructor(private http: HttpClient) {}

  getNearbyChallenges(lng: number, lat: number, radius: number = 10): Observable<Challenge[]> {
    const params = new HttpParams()
      .set('lng', lng.toString())
      .set('lat', lat.toString())
      .set('radius', radius.toString());

    return this.http.get<Challenge[]>(`${this.API}/nearby`, { params });
  }

  getChallenge(id: string): Observable<Challenge> {
    return this.http.get<Challenge>(`${this.API}/${id}`);
  }

  createChallenge(data: CreateChallengeRequest): Observable<Challenge> {
    return this.http.post<Challenge>(this.API, data);
  }

  acceptChallenge(id: string, teamName: string): Observable<Challenge> {
    return this.http.post<Challenge>(`${this.API}/${id}/accept`, { teamName });
  }

  getMyChallenges(): Observable<Challenge[]> {
    return this.http.get<Challenge[]>(`${this.API}/my`);
  }
}
