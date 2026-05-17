import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly API = environment.apiUrl + '/players';

  constructor(private http: HttpClient) {}

  getNearbyPlayers(lng: number, lat: number, radius: number = 10): Observable<User[]> {
    const params = new HttpParams()
      .set('lng', lng.toString())
      .set('lat', lat.toString())
      .set('radius', radius.toString());

    return this.http.get<User[]>(`${this.API}/nearby`, { params });
  }

  setAvailability(available: boolean, lng?: number, lat?: number, locationName?: string): Observable<User> {
    return this.http.post<User>(`${this.API}/availability`, {
      available, longitude: lng, latitude: lat, locationName
    });
  }

  getMyProfile(): Observable<User> {
    return this.http.get<User>(`${this.API}/me`);
  }

  updateProfile(data: Partial<User>): Observable<User> {
    return this.http.put<User>(`${this.API}/me`, data);
  }

  getPlayersByIds(ids: string[]): Observable<User[]> {
    return this.http.post<User[]>(`${this.API}/list`, ids);
  }
}
