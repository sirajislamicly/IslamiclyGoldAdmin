import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { ReportHeaderComponent } from '../../../shared/components/report-header/report-header.component';
import { ApiService } from '../../../core/services/api.service';

interface PGTransaction {
  id: number; orderId: string; txId: string | null; paymentStatus: string;
  paymentStatusTs: string; goldBuyStatus: string; amount: number;
  gateway: string; userName: string; mobileNumber: string; metalType: string;
  isManual: boolean; notifiedCount: number;
}

@Component({
  selector: 'app-payment-gateway',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent, ExportButtonComponent, ReportHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-report-header title="Payment Gateway" description="Payment success, failure, and gateway-wise analytics" iconText="P" iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <app-kpi-card label="Total Payments" [value]="formatNum(allData.length)" delta="+12%" icon="P"
                      iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" sparklineColor="bg-blue-400" />
        <app-kpi-card label="Captured" [value]="formatNum(captured)" delta="+15%" icon="C"
                      iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Failed" [value]="formatNum(failed)" delta="-3%" icon="F"
                      iconBgClass="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" sparklineColor="bg-red-400" />
        <app-kpi-card label="Pending" [value]="formatNum(pending)" icon="W"
                      iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" sparklineColor="bg-amber-400" />
        <app-kpi-card label="Success Rate" [value]="successRate + '%'" icon="%"
                      iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" sparklineColor="bg-violet-400" />
      </div>

      <!-- Status Breakdown Bar -->
      <div class="card">
        <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Payment Status Distribution</h3>
        <div class="flex items-center gap-1 h-8 rounded-full overflow-hidden">
          <div class="h-full bg-emerald-500 flex items-center justify-center text-[10px] text-white font-bold transition-all duration-700" [style.width.%]="successRate">{{ successRate }}%</div>
          <div class="h-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold transition-all duration-700" [style.width.%]="failRate">{{ failRate }}%</div>
          <div class="h-full bg-amber-500 flex items-center justify-center text-[10px] text-white font-bold transition-all duration-700" [style.width.%]="pendingRate">{{ pendingRate }}%</div>
        </div>
        <div class="flex gap-6 mt-2 text-xs">
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Captured</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-red-500 rounded-full"></span> Failed</span>
          <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> Pending</span>
        </div>
      </div>

      <!-- Filters + Table -->
      <div class="card p-3">
        <div class="flex items-center gap-3">
          <div class="relative flex-1 max-w-xs">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input [(ngModel)]="search" (ngModelChange)="page=1"
                   class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200"
                   placeholder="Search order ID, user..." />
          </div>
          <select [(ngModel)]="statusFilter" (ngModelChange)="page=1" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[130px]">
            <option value="">All Status</option>
            <option value="captured">Captured</option>
            <option value="failed">Failed</option>
            <option value="pending">Pending</option>
          </select>
          <select [(ngModel)]="gatewayFilter" (ngModelChange)="page=1" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[130px]">
            <option value="">All Gateways</option>
            <option value="cashfree">Cashfree</option>
            <option value="razorpay">Razorpay</option>
          </select>
          <app-export-button [data]="exportD()" filename="payment-gateway" title="Payment Gateway Report" [columns]="exportCols" />
        </div>
      </div>

      <!-- Rows -->
      <div class="space-y-2">
        @for (t of paginated(); track t.id; let i = $index) {
          <div class="card p-4 animate-fade-in-up" [style.animation-delay.ms]="i * 25">
            <div class="flex items-center gap-0">
              <div class="w-[200px] flex-shrink-0 min-w-0">
                <div class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{ t.userName }}</div>
                <div class="text-[11px] text-slate-400 truncate">{{ t.orderId }}</div>
              </div>
              <div class="w-[80px] text-center flex-shrink-0">
                <span class="badge text-[10px]" [ngClass]="t.metalType === 'gold' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">{{ t.metalType }}</span>
              </div>
              <div class="w-[100px] text-right flex-shrink-0">
                <div class="text-sm font-bold text-slate-800 dark:text-white">{{ formatCurrency(t.amount) }}</div>
              </div>
              <div class="w-[90px] text-center flex-shrink-0">
                <span class="text-[11px] font-medium px-2 py-0.5 rounded-full" [ngClass]="t.gateway === 'cashfree' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'">{{ t.gateway }}</span>
              </div>
              <div class="flex-1 px-4 text-center">
                <div class="text-[11px] text-slate-500">{{ formatDate(t.paymentStatusTs) }}</div>
              </div>
              <div class="w-[90px] text-center flex-shrink-0">
                <span class="badge text-[10px]" [ngClass]="t.paymentStatus === 'captured' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : t.paymentStatus === 'failed' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'">{{ t.paymentStatus }}</span>
              </div>
              <div class="w-[60px] text-center flex-shrink-0">
                <span *ngIf="t.isManual" class="text-[10px] font-bold text-violet-600 bg-violet-50 px-1.5 py-0.5 rounded">Manual</span>
              </div>
            </div>
          </div>
        }
      </div>

      @if (filtered().length > pageSize) {
        <div class="flex items-center justify-between text-sm">
          <span class="text-xs text-slate-400">{{ (page-1)*pageSize+1 }}-{{ min(page*pageSize, filtered().length) }} of {{ filtered().length }}</span>
          <div class="flex gap-1">
            <button (click)="page=page-1" [disabled]="page===1" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
            <button (click)="page=page+1" [disabled]="page>=Math.ceil(filtered().length/pageSize)" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>
          </div>
        </div>
      }
    </div>
  `
})
export class PaymentGatewayComponent implements OnInit {
  private api = inject(ApiService);
  allData: PGTransaction[] = [];
  search = ''; statusFilter = ''; gatewayFilter = ''; page = 1; pageSize = 20;
  captured = 0; failed = 0; pending = 0; successRate = 0; failRate = 0; pendingRate = 0;
  Math = Math;

  exportCols = [
    { key: 'orderId', label: 'Order ID' }, { key: 'userName', label: 'User' }, { key: 'amount', label: 'Amount' },
    { key: 'gateway', label: 'Gateway' }, { key: 'paymentStatus', label: 'Status' }, { key: 'paymentStatusTs', label: 'Date' },
    { key: 'metalType', label: 'Metal' }, { key: 'isManual', label: 'Manual' }
  ];

  ngOnInit(): void {
    forkJoin({
      kpis: this.api.paymentGatewayKpis(),
      list: this.api.paymentGatewayList({ pageSize: 300 })
    }).subscribe({
      next: (res) => {
        const list = res.list || [];
        this.allData = list.map((t: any) => ({
          id: t.id,
          orderId: t.orderID,
          txId: t.txID,
          paymentStatus: t.paymentStatus,
          paymentStatusTs: t.paymentStatusTs,
          goldBuyStatus: t.goldBuyStatus,
          amount: 0,
          gateway: 'cashfree',
          userName: 'User',
          mobileNumber: '',
          metalType: 'gold',
          isManual: false,
          notifiedCount: t.isNotifiedCount || 0
        }));
        this.captured = this.allData.filter(t => t.paymentStatus === 'captured').length;
        this.failed = this.allData.filter(t => t.paymentStatus === 'failed').length;
        this.pending = this.allData.filter(t => t.paymentStatus === 'pending').length;
        const total = this.allData.length || 1;
        this.successRate = Math.round((this.captured / total) * 100);
        this.failRate = Math.round((this.failed / total) * 100);
        this.pendingRate = 100 - this.successRate - this.failRate;
      },
      error: () => {
        this.allData = [];
      }
    });
  }

  filtered = computed(() => {
    let d = this.allData;
    const q = this.search.toLowerCase();
    if (q) d = d.filter(t => t.userName.toLowerCase().includes(q) || t.orderId.toLowerCase().includes(q));
    if (this.statusFilter) d = d.filter(t => t.paymentStatus === this.statusFilter);
    if (this.gatewayFilter) d = d.filter(t => t.gateway === this.gatewayFilter);
    return d;
  });
  paginated = computed(() => this.filtered().slice((this.page - 1) * this.pageSize, this.page * this.pageSize));
  exportD = computed(() => this.filtered().map(t => ({ ...t })) as Record<string, unknown>[]);

  min(a: number, b: number) { return Math.min(a, b); }
  formatNum(n: number) { return new Intl.NumberFormat('en-IN').format(n); }
  formatCurrency(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
  formatDate(d: string) { try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return d; } }

  private generate(): PGTransaction[] {
    const names = ['Ayesha Khan', 'Omar Rashid', 'Fatima Siddiq', 'Yusuf Ali', 'Priya Patel', 'Rahul Kumar', 'Neha Sharma', 'Vikram Joshi', 'Sakina Noor', 'Deepak Verma', 'Meera Rao', 'Irfan Malik', 'Pooja Gupta', 'Arjun Singh', 'Kavita Shah', 'Ravi Das', 'Amina Khan', 'Sanjay Reddy', 'Tariq Bhat', 'Shreya Mishra'];
    const statuses = ['captured', 'captured', 'captured', 'captured', 'failed', 'pending'];
    const gateways = ['cashfree', 'cashfree', 'cashfree', 'razorpay'];
    return Array.from({ length: 300 }, (_, i) => ({
      id: 3900 + i, orderId: `ord_${Date.now() - i * 100000}${Math.floor(Math.random() * 1000)}`,
      txId: Math.random() > 0.3 ? `txn_${Math.floor(Math.random() * 9999999)}` : null,
      paymentStatus: statuses[Math.floor(Math.random() * statuses.length)],
      paymentStatusTs: new Date(2025, 6 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60)).toISOString(),
      goldBuyStatus: Math.random() > 0.5 ? 'completed' : 'pending', amount: [100, 200, 500, 1000, 2000, 5000, 10000][Math.floor(Math.random() * 7)],
      gateway: gateways[Math.floor(Math.random() * gateways.length)],
      userName: names[Math.floor(Math.random() * names.length)], mobileNumber: '9' + Math.floor(100000000 + Math.random() * 900000000),
      metalType: Math.random() > 0.4 ? 'gold' : 'silver', isManual: Math.random() > 0.92, notifiedCount: Math.floor(Math.random() * 3)
    }));
  }
}
