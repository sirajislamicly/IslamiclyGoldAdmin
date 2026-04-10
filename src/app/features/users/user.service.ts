import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface User {
  id: string;
  name: string;
  email: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  status: 'active' | 'suspended';
}

export interface Paginated<T> { data: T[]; total: number; page: number; pageSize: number; }

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  list(params: { search?: string; page?: number; pageSize?: number; kyc?: string } = {}): Observable<Paginated<User>> {
    return this.http.get<Paginated<User>>(this.base, { params: params as any });
  }

  get(id: string): Observable<User> {
    return this.http.get<User>(`${this.base}/${id}`);
  }
}
