import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VaultSummary {
  totalGoldGrams: number;
  totalSilverGrams: number;
  totalValueUsd: number;
}

@Injectable({ providedIn: 'root' })
export class VaultService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/vault`;

  summary(): Observable<VaultSummary> { return this.http.get<VaultSummary>(`${this.base}/summary`); }
}
