import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators'; 
import { UserDTO } from './events/events.component';
import { log } from 'node:console';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}
export interface EmailDTO {
  email: string;
}

export interface VerifyDTO {
  email: string;
  code: string;
}

export interface ResetPasswordDTO {
  email: string;
  code: string;
  newPassword: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;  
  lastName: string;   
  role: string;
}

export interface AuthResponse {
  token: string;
  user?: {
    id: number;
    email: string;
    fullName: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  getCurrentUser() {
    throw new Error('Method not implemented.');
  }
  private baseUrl = 'https://localhost:7177/api/Auth';

  private api = 'https://localhost:7177/api/Auth/verify-email'

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, data);
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data);
  }

verifyEmail(verificationData: { email: string; code: string }): Observable<any> {
  return this.http.post(`${this.api}`, verificationData); 
}

resendVerificationCode(email: string): Observable<any> {
  return this.http.post(`${this.baseUrl}/resend-code`, { email });
}

forgotPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

getAllUsers(): Observable<UserDTO[]> {
  return this.http.get<UserDTO[]>(`${this.baseUrl}/get-all-users`);
}

  verifyResetCode(email: string, code: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/verify-reset-code`, { email, code });
  }

  resetPassword(email: string, code: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { 
      email, 
      code, 
      newPassword 
    });
  }
logout(): void {
 
    localStorage.removeItem('token');
  
  
}

getRole(): string | null {
  return localStorage.getItem('guard');
}

  isAuthenticated(): boolean {
  if (typeof window !== 'undefined' && localStorage) {
    return !!localStorage.getItem('token');
  }
  return false;
}

getUserRole(): string | null {
  return localStorage.getItem('userRole'); 
}

  getToken(): string | null {
  if (typeof window !== 'undefined' && localStorage) {
    return localStorage.getItem('token');
  }
  return null;
}
}