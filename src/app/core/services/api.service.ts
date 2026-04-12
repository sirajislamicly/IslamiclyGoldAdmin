import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

/**
 * Converts PascalCase / UPPER_CASE keys to camelCase recursively.
 * Backend returns PascalCase (TotalUsers) so we normalize to camelCase (totalUsers).
 */
function toCamel(key: string): string {
  if (!key) return key;
  // UID, SIPID, TotalUsers -> uid, sipid, totalUsers
  if (key === key.toUpperCase()) return key.toLowerCase();
  return key.charAt(0).toLowerCase() + key.slice(1);
}

function normalize(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(normalize);
  if (typeof obj === 'object' && obj.constructor === Object) {
    const out: any = {};
    for (const k of Object.keys(obj)) {
      out[toCamel(k)] = normalize(obj[k]);
    }
    return out;
  }
  return obj;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private params(obj: Record<string, any>): HttpParams {
    let p = new HttpParams();
    Object.keys(obj).forEach(k => {
      const v = obj[k];
      if (v !== null && v !== undefined && v !== '') p = p.set(k, String(v));
    });
    return p;
  }

  private get<T = any>(url: string, options?: { params?: HttpParams }): Observable<T> {
    return this.http.get<any>(url, options).pipe(map(r => normalize(r) as T));
  }

  // ============ AUTH ============
  login(password: string): Observable<{ message: string; token: string }> {
    return this.http.post<{ message: string; token: string }>(`${this.base}/Home/login?password=${password}`, null);
  }

  // ============ DASHBOARD ============
  dashboardKpis(fromDate?: string, toDate?: string): Observable<any> {
    return this.get<any>(`${this.base}/dashboard/kpis`, { params: this.params({ fromDate, toDate }) });
  }
  dashboardLiveRates(): Observable<any> {
    return this.get<any>(`${this.base}/dashboard/live-rates`);
  }
  dashboardTransactionTrend(year?: number): Observable<any[]> {
    return this.get<any[]>(`${this.base}/dashboard/transaction-trend`, { params: this.params({ year }) });
  }
  dashboardRecentActivity(top = 10): Observable<any[]> {
    return this.get<any[]>(`${this.base}/dashboard/recent-activity`, { params: this.params({ top }) });
  }

  // ============ USERS ============
  usersKpis(): Observable<any> {
    return this.get<any>(`${this.base}/users/kpis`);
  }
  usersList(params: { search?: string; kycStatus?: string; state?: string; sortBy?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/users/list`, { params: this.params(params) });
  }
  usersStates(): Observable<any[]> {
    return this.get<any[]>(`${this.base}/users/states`);
  }

  // ============ TRANSACTIONS ============
  transactionsBuy(params: { search?: string; metalType?: string; fromDate?: string; toDate?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/transactions/buy`, { params: this.params(params) });
  }
  transactionsSell(params: { search?: string; metalType?: string; fromDate?: string; toDate?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/transactions/sell`, { params: this.params(params) });
  }
  transactionsKpis(fromDate?: string, toDate?: string): Observable<any> {
    return this.get<any>(`${this.base}/transactions/kpis`, { params: this.params({ fromDate, toDate }) });
  }

  // ============ GOALS ============
  goalsList(params: { search?: string; metalType?: string; status?: string; sortBy?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/goals/list`, { params: this.params(params) });
  }
  goalsKpis(): Observable<any> {
    return this.get<any>(`${this.base}/goals/kpis`);
  }
  goalsTypeBreakdown(): Observable<any[]> {
    return this.get<any[]>(`${this.base}/goals/type-breakdown`);
  }

  // ============ VAULT ============
  vaultCustomerHoldings(params: { search?: string; metalFilter?: string; balanceFilter?: string; sortBy?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/vault/customer-holdings`, { params: this.params(params) });
  }
  vaultSummary(): Observable<any> {
    return this.get<any>(`${this.base}/vault/summary`);
  }

  // ============ SIP ============
  sipKpis(): Observable<any> {
    return this.get<any>(`${this.base}/sip/kpis`);
  }
  sipPlans(params: { search?: string; frequency?: string; metalType?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/sip/plans`, { params: this.params(params) });
  }
  sipPaymentSchedules(params: { sipId?: number; paymentStatus?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/sip/payment-schedules`, { params: this.params(params) });
  }
  sipFrequencyBreakdown(): Observable<any[]> {
    return this.get<any[]>(`${this.base}/sip/frequency-breakdown`);
  }

  // ============ NOMINATIONS ============
  nominationsKpis(): Observable<any> {
    return this.get<any>(`${this.base}/nominations/kpis`);
  }
  nominationsList(params: { search?: string; relation?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/nominations/list`, { params: this.params(params) });
  }
  nominationsRelationBreakdown(): Observable<any[]> {
    return this.get<any[]>(`${this.base}/nominations/relation-breakdown`);
  }

  // ============ PAYMENT GATEWAY ============
  paymentGatewayKpis(fromDate?: string, toDate?: string): Observable<any> {
    return this.get<any>(`${this.base}/payment-gateway/kpis`, { params: this.params({ fromDate, toDate }) });
  }
  paymentGatewayList(params: { search?: string; paymentStatus?: string; fromDate?: string; toDate?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/payment-gateway/list`, { params: this.params(params) });
  }

  // ============ ORDERS ============
  ordersKpis(): Observable<any> {
    return this.get<any>(`${this.base}/orders/kpis`);
  }
  ordersList(params: { search?: string; orderStatus?: string; metalType?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/orders/list`, { params: this.params(params) });
  }
  ordersStatusFunnel(): Observable<any[]> {
    return this.get<any[]>(`${this.base}/orders/status-funnel`);
  }

  // ============ GIFTS ============
  giftsKpis(): Observable<any> {
    return this.get<any>(`${this.base}/gifts/kpis`);
  }
  giftsList(params: { search?: string; isClaimed?: number; metalType?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/gifts/list`, { params: this.params(params) });
  }

  // ============ RATE ALERTS ============
  rateAlertsList(params: { metalType?: string; notificationFilter?: string; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/rate-alerts/list`, { params: this.params(params) });
  }
  rateAlertsKpis(): Observable<any> {
    return this.get<any>(`${this.base}/rate-alerts/kpis`);
  }

  // ============ REVENUE ============
  revenueSummary(fromDate?: string, toDate?: string): Observable<any> {
    return this.get<any>(`${this.base}/revenue/summary`, { params: this.params({ fromDate, toDate }) });
  }
  revenueMonthlyTrend(year?: number): Observable<any[]> {
    return this.get<any[]>(`${this.base}/revenue/monthly-trend`, { params: this.params({ year }) });
  }

  // ============ BANK ACCOUNTS ============
  bankAccountsKpis(): Observable<any> {
    return this.get<any>(`${this.base}/bank-accounts/kpis`);
  }
  bankAccountsList(params: { search?: string; type?: number; pageNumber?: number; pageSize?: number } = {}): Observable<any[]> {
    return this.get<any[]>(`${this.base}/bank-accounts/list`, { params: this.params(params) });
  }
  bankAccountsTopBanks(top = 10): Observable<any[]> {
    return this.get<any[]>(`${this.base}/bank-accounts/top-banks`, { params: this.params({ top }) });
  }

  // ============ GEOGRAPHY ============
  geographyStateWise(): Observable<any[]> {
    return this.get<any[]>(`${this.base}/geography/state-wise`);
  }

  // ============ SECURITY ============
  securityOtpKpis(): Observable<any[]> {
    return this.get<any[]>(`${this.base}/security/otp-kpis`);
  }
  securityActiveSessions(top = 20): Observable<any[]> {
    return this.get<any[]>(`${this.base}/security/active-sessions`, { params: this.params({ top }) });
  }

  // ============ WEB vs MOBILE ============
  webMobilePlatformSplit(fromDate?: string, toDate?: string): Observable<any[]> {
    return this.get<any[]>(`${this.base}/web-mobile/platform-split`, { params: this.params({ fromDate, toDate }) });
  }

  // ============ ANALYTICS ============
  analyticsUserGrowth(year?: number): Observable<any[]> {
    return this.get<any[]>(`${this.base}/analytics/user-growth`, { params: this.params({ year }) });
  }
  analyticsMetalTrend(year?: number): Observable<any[]> {
    return this.get<any[]>(`${this.base}/analytics/metal-trend`, { params: this.params({ year }) });
  }
}
