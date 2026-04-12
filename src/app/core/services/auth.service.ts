import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of, tap, delay, catchError, throwError, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  token: string;
  user: AdminUser;
}

const TOKEN_KEY = 'gold_admin_token';
const USER_KEY = 'gold_admin_user';
const OTP_SENT_KEY = 'gold_admin_otp_sent';
const EMAIL_KEY = 'gold_admin_email';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  readonly currentUser = signal<AdminUser | null>(this.loadUser());
  readonly otpSent = signal(false);
  readonly otpEmail = signal('');
  readonly loading = signal(false);
  readonly error = signal('');

  sendOtp(email: string): Observable<OtpResponse> {
    this.loading.set(true);
    this.error.set('');

    // Mock OTP sending - real OTP flow to be implemented later
    return of({
      success: true,
      message: 'OTP sent successfully to ' + email,
      expiresIn: 300
    }).pipe(
      delay(600),
      tap(res => {
        this.loading.set(false);
        if (res.success) {
          this.otpSent.set(true);
          this.otpEmail.set(email);
          localStorage.setItem(OTP_SENT_KEY, Date.now().toString());
          localStorage.setItem(EMAIL_KEY, email);
        }
      })
    );
  }

  verifyOtp(email: string, otp: string): Observable<VerifyOtpResponse> {
    this.loading.set(true);
    this.error.set('');

    // Currently the backend uses a simple password-based login ("123")
    // Once email+OTP is implemented on the backend we'll switch.
    // For now, any 6-digit OTP triggers the login API with password=123.
    const isValid = otp.length === 6 && /^\d{6}$/.test(otp);

    if (!isValid) {
      this.loading.set(false);
      this.error.set('Invalid OTP. Please enter a 6-digit code.');
      return of({ success: false, token: '', user: {} as AdminUser });
    }

    return this.http.post<{ message: string; token: string }>(
      `${environment.apiUrl}/Home/login?password=123`,
      null
    ).pipe(
      map(res => {
        const user: AdminUser = { id: '1', name: 'Gold Admin', email, role: 'administrator' };
        const result: VerifyOtpResponse = { success: true, token: res.token, user };
        return result;
      }),
      tap(res => {
        this.loading.set(false);
        if (res.success) {
          localStorage.setItem(TOKEN_KEY, res.token);
          localStorage.setItem(USER_KEY, JSON.stringify(res.user));
          this.currentUser.set(res.user);
          this.otpSent.set(false);
          localStorage.removeItem(OTP_SENT_KEY);
        }
      }),
      catchError(err => {
        this.loading.set(false);
        this.error.set('Login failed. Please try again.');
        return throwError(() => err);
      })
    );
  }

  resendOtp(): Observable<OtpResponse> {
    return this.sendOtp(this.otpEmail());
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(OTP_SENT_KEY);
    localStorage.removeItem(EMAIL_KEY);
    this.currentUser.set(null);
    this.otpSent.set(false);
    this.otpEmail.set('');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  canResendOtp(): boolean {
    const sentAt = localStorage.getItem(OTP_SENT_KEY);
    if (!sentAt) return true;
    return Date.now() - parseInt(sentAt, 10) > 30000;
  }

  private loadUser(): AdminUser | null {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
