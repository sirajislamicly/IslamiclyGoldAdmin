import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Goal {
  id: number;
  goalName: string;
  metalType: 'gold' | 'silver';
  sipId: number;
  targetAmount: number;
  currentAmount: number;
  sipAmount: number;
  sipFrequency: 'Daily' | 'Weekly' | 'Monthly';
  userName: string;
  userMobile: string;
  userEmail: string;
  kycStatus: 'approved' | 'pending' | 'rejected';
  userState: string;
  startDate: string;
  endDate: string;
  installmentsPaid: number;
  totalInstallments: number;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class GoalService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/goals`;

  list(): Observable<Goal[]> { return this.http.get<Goal[]>(this.base); }
}
