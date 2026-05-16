import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = environment.apiUrl + '/auth';
  private readonly TOKEN_KEY = 'crickx_token';
  private readonly USER_KEY = 'crickx_user';

  private _currentUser = signal<AuthResponse | null>(this.loadUser());
  currentUser = this._currentUser.asReadonly();
  isLoggedIn = computed(() => !!this._currentUser());

  constructor(private http: HttpClient, private router: Router) {}

  signup(data: { name: string; username: string; email: string; password: string; skill?: string; preferredRole?: string; isPartner?: boolean }): Observable<any> {
    return this.http.post<any>(`${this.API}/signup`, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { username, password }).pipe(
      tap(res => {
        if (res.token) {
          this.storeAuth(res);
        }
      })
    );
  }

  verifyEmailOtp(email: string, otp: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/verify-email`, { email, otp }).pipe(
      tap(res => this.storeAuth(res))
    );
  }

  resendOtp(email: string): Observable<any> {
    return this.http.post(`${this.API}/resend-otp`, { email });
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserId(): string | null {
    return this._currentUser()?.userId ?? null;
  }

  private storeAuth(res: AuthResponse): void {
    if (res.token) {
      localStorage.setItem(this.TOKEN_KEY, res.token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(res));
      this._currentUser.set(res);
    }
  }

  private loadUser(): AuthResponse | null {
    const data = localStorage.getItem(this.USER_KEY);
    if (data) {
      try { return JSON.parse(data); } catch { return null; }
    }
    return null;
  }
}
