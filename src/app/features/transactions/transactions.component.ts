import { Component, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ExportButtonComponent } from '../../shared/components/export-button/export-button.component';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent, ExportButtonComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Transactions</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">All buy and sell transactions overview</p>
        </div>
        <app-export-button [data]="expD()" filename="transactions" title="Transactions" [columns]="expCols" />
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Buy Transactions" [value]="fN(buyCount)" delta="+8.4%" icon="B" iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Sell Transactions" [value]="fN(sellCount)" delta="+3.1%" icon="S" iconBgClass="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" sparklineColor="bg-red-400" />
        <app-kpi-card label="Buy Volume" [value]="fC(buyVol)" icon="V" iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Sell Volume" [value]="fC(sellVol)" icon="V" iconBgClass="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" sparklineColor="bg-orange-400" />
      </div>

      <!-- Tab + Filters -->
      <div class="card p-3">
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl p-0.5">
            <button (click)="tab='buy'; page=1" [class]="tab==='buy' ? 'px-4 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 text-emerald-600 rounded-lg shadow-sm' : 'px-4 py-1.5 text-xs font-medium text-slate-500 rounded-lg'">Buy</button>
            <button (click)="tab='sell'; page=1" [class]="tab==='sell' ? 'px-4 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 text-red-600 rounded-lg shadow-sm' : 'px-4 py-1.5 text-xs font-medium text-slate-500 rounded-lg'">Sell</button>
          </div>
          <div class="relative flex-1 max-w-xs">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input [(ngModel)]="search" (ngModelChange)="page=1" class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40" placeholder="Search user, txn ID..." />
          </div>
          <select [(ngModel)]="metalFilter" (ngModelChange)="page=1" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[120px]">
            <option value="">All Metals</option><option value="gold">Gold</option><option value="silver">Silver</option>
          </select>
          <div class="text-xs text-slate-400 font-medium whitespace-nowrap">{{ filtered().length }} txns</div>
        </div>
      </div>

      <!-- Rows -->
      <div class="space-y-2">
        @for (t of pag(); track t.id; let i = $index) {
          <div class="card p-4 animate-fade-in-up" [style.animation-delay.ms]="i * 25">
            <div class="flex items-center gap-0">
              <div class="w-[200px] flex items-center gap-3 flex-shrink-0 min-w-0">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0"
                     [ngClass]="tab === 'buy' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'">
                  {{ t.userName[0] }}
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{ t.userName }}</div>
                  <div class="text-[10px] text-slate-400 truncate">{{ t.mobileNumber }}</div>
                </div>
              </div>
              <div class="w-[80px] text-center flex-shrink-0">
                <span class="badge text-[10px]" [ngClass]="t.metalType === 'gold' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">{{ t.metalType }}</span>
              </div>
              <div class="w-[90px] text-right flex-shrink-0">
                <div class="text-sm font-bold counter-value text-slate-800 dark:text-white">{{ fW(t.quantity) }} g</div>
              </div>
              <div class="w-[100px] text-right flex-shrink-0">
                <div class="text-[12px] text-slate-500">{{ fC(t.rate) }}/g</div>
              </div>
              <div class="w-[110px] text-right flex-shrink-0">
                <div class="text-sm font-bold" [ngClass]="tab === 'buy' ? 'text-emerald-600' : 'text-red-600'">{{ fC(t.totalAmount) }}</div>
              </div>
              <div class="flex-1 px-4 text-center hidden md:block">
                <div class="text-[11px] text-slate-500">{{ fDt(tab === 'buy' ? t.ts : t.createdAt) }}</div>
              </div>
              <div class="w-[100px] flex-shrink-0 hidden lg:block">
                <div class="text-[10px] font-mono text-slate-400 truncate">{{ t.transactionId | slice:0:14 }}...</div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Pagination -->
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
export class TransactionsComponent implements OnInit {
  private mockData = inject(MockDataService);
  allBuys: any[] = []; allSells: any[] = [];
  tab = 'buy'; search = ''; metalFilter = ''; page = 1; pageSize = 20; Math = Math;
  buyCount = 0; sellCount = 0; buyVol = 0; sellVol = 0;
  expCols = [{ key: 'userName', label: 'User' }, { key: 'metalType', label: 'Metal' }, { key: 'quantity', label: 'Qty (g)' }, { key: 'rate', label: 'Rate' }, { key: 'totalAmount', label: 'Total' }, { key: 'transactionId', label: 'Txn ID' }];

  ngOnInit(): void {
    this.allBuys = this.mockData.getBuyTransactions(500).map(b => ({ ...b }));
    this.allSells = this.mockData.getSellTransactions(200).map(s => ({ ...s }));
    this.buyCount = this.allBuys.length; this.sellCount = this.allSells.length;
    this.buyVol = this.allBuys.reduce((s: number, b: any) => s + b.totalAmount, 0);
    this.sellVol = this.allSells.reduce((s: number, b: any) => s + b.totalAmount, 0);
  }

  filtered = computed(() => {
    let d = this.tab === 'buy' ? this.allBuys : this.allSells;
    const q = this.search.toLowerCase();
    if (q) d = d.filter((t: any) => t.userName.toLowerCase().includes(q) || t.transactionId?.toLowerCase().includes(q) || t.mobileNumber?.includes(q));
    if (this.metalFilter) d = d.filter((t: any) => t.metalType === this.metalFilter);
    return d;
  });
  pag = computed(() => this.filtered().slice((this.page - 1) * this.pageSize, this.page * this.pageSize));
  expD = computed(() => this.filtered().map((t: any) => ({ ...t })) as Record<string, unknown>[]);
  min(a: number, b: number) { return Math.min(a, b); }
  fN(n: number) { return new Intl.NumberFormat('en-IN').format(n); }
  fC(n: number) { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
  fW(n: number) { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 }).format(n); }
  fDt(d: string) { try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }); } catch { return d; } }
}
