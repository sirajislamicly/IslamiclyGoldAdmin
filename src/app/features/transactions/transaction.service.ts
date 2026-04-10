import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Transaction {
  id: string;
  type: 'buy' | 'sell';
  metal: 'gold' | 'silver';
  amount: number;
  quantity: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  user: string;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/transactions`;

  list(params: { from?: string; to?: string; metal?: string; type?: string } = {}): Observable<Transaction[]> {
    return this.http.get<Transaction[]>(this.base, { params: params as any });
  }
}
