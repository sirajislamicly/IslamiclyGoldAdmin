import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Goal {
  id: string;
  name: string;
  user: string;
  targetAmount: number;
  currentAmount: number;
}

@Injectable({ providedIn: 'root' })
export class GoalService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/goals`;

  list(): Observable<Goal[]> { return this.http.get<Goal[]>(this.base); }
}
