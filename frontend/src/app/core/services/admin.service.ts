import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { Sport } from '../models/sport.model';
import { Turf, BlockedSlot } from '../models/turf.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly SUPER_API = environment.apiUrl + '/super-admin';
  private readonly TURF_API = environment.apiUrl + '/admin/turfs';

  private readonly PUBLIC_TURF_API = environment.apiUrl + '/turfs';
  private readonly PUBLIC_EVENT_API = environment.apiUrl + '/events';
  private readonly ADMIN_EVENT_API = environment.apiUrl + '/admin/events';

  constructor(private http: HttpClient) {}

  // User Management
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.SUPER_API}/users`);
  }

  blockUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.SUPER_API}/users/${userId}/block`, {});
  }

  activateUser(userId: string): Observable<void> {
    return this.http.post<void>(`${this.SUPER_API}/users/${userId}/activate`, {});
  }

  // Sport Management
  getAllSports(): Observable<Sport[]> {
    return this.http.get<Sport[]>(`${this.SUPER_API}/sports`);
  }

  addSport(sport: Partial<Sport>): Observable<Sport> {
    return this.http.post<Sport>(`${this.SUPER_API}/sports`, sport);
  }

  // Turf Management (Admin)
  getMyTurfs(): Observable<Turf[]> {
    return this.http.get<Turf[]>(`${this.TURF_API}/my`);
  }

  createTurf(turf: Partial<Turf>): Observable<Turf> {
    return this.http.post<Turf>(this.TURF_API, turf);
  }

  updateTurf(turfId: string, turf: Partial<Turf>): Observable<Turf> {
    return this.http.put<Turf>(`${this.TURF_API}/${turfId}`, turf);
  }

  blockSlot(turfId: string, slot: BlockedSlot): Observable<Turf> {
    return this.http.post<Turf>(`${this.TURF_API}/${turfId}/block`, slot);
  }

  // Turf Discovery (Public)
  getTurfsNearby(lng: number, lat: number, radius: number = 15): Observable<Turf[]> {
    return this.http.get<Turf[]>(`${this.PUBLIC_TURF_API}/nearby`, {
      params: { lng: lng.toString(), lat: lat.toString(), radius: radius.toString() }
    });
  }

  getTurfById(id: string): Observable<Turf> {
    return this.http.get<Turf>(`${this.PUBLIC_TURF_API}/${id}`);
  }

  // Events Management (Admin)
  createEvent(event: any): Observable<any> {
    return this.http.post<any>(this.ADMIN_EVENT_API, event);
  }

  getMyEvents(): Observable<any[]> {
    return this.http.get<any[]>(`${this.ADMIN_EVENT_API}/my`);
  }

  // Events Discovery (Public)
  getAllEvents(): Observable<any[]> {
    return this.http.get<any[]>(this.PUBLIC_EVENT_API);
  }

  registerForEvent(eventId: string): Observable<any> {
    return this.http.post<any>(`${this.PUBLIC_EVENT_API}/${eventId}/register`, {});
  }

  promoteUser(email: string, role: string): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/auth/promote-role`, { email, role });
  }
}
