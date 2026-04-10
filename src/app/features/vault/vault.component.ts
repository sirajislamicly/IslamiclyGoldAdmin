import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ExportButtonComponent } from '../../shared/components/export-button/export-button.component';

interface VaultCustomer {
  id: number;
  userName: string;
  mobileNumber: string;
  uniqueId: string;
  goldBalance: number;
  silverBalance: number;
  goldValue: number;
  silverValue: number;
  totalValue: number;
  totalBuyTxns: number;
  totalSellTxns: number;
  lastTxnDate: string;
  kycStatus: 'approved' | 'pending' | 'rejected';
  state: string;
}

@Component({
  selector: 'app-vault',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent, ExportButtonComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Vault</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Customer-wise gold & silver holdings overview</p>
        </div>
        <app-export-button [data]="exportData()" filename="vault-report" title="Vault Holdings Report" [columns]="exportCols" />
      </div>

      <!-- KPI Summary -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <app-kpi-card label="Total Gold Holdings" [value]="formatWeight(totalGold) + ' g'" icon="Au"
                      iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      sparklineColor="bg-amber-400" delta="+2.1%" />
        <app-kpi-card label="Total Silver Holdings" [value]="formatWeight(totalSilver) + ' g'" icon="Ag"
                      iconBgClass="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      sparklineColor="bg-slate-400" delta="+5.4%" />
        <app-kpi-card label="Gold Value" [value]="formatCurrency(totalGoldValue)" icon="V"
                      iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      sparklineColor="bg-amber-400" />
        <app-kpi-card label="Silver Value" [value]="formatCurrency(totalSilverValue)" icon="V"
                      iconBgClass="bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      sparklineColor="bg-slate-400" />
        <app-kpi-card label="Total Vault Value" [value]="formatCurrency(totalVaultValue)" icon="T"
                      iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      sparklineColor="bg-emerald-400" delta="+8.3%" />
      </div>

      <!-- Filters -->
      <div class="card p-3">
        <div class="flex items-center gap-3">
          <div class="relative flex-1 max-w-xs">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input [(ngModel)]="search" (ngModelChange)="resetPage()"
                   class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200"
                   placeholder="Search by name, mobile, ID..." />
          </div>
          <select [(ngModel)]="metalFilter" (ngModelChange)="resetPage()"
                  class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200 min-w-[140px]">
            <option value="">All Holdings</option>
            <option value="gold-only">Gold Only</option>
            <option value="silver-only">Silver Only</option>
            <option value="both">Both Metals</option>
          </select>
          <select [(ngModel)]="balanceFilter" (ngModelChange)="resetPage()"
                  class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200 min-w-[150px]">
            <option value="">All Balances</option>
            <option value="high">High Value (>50k)</option>
            <option value="medium">Medium (10k-50k)</option>
            <option value="low">Low Value (<10k)</option>
            <option value="zero">Zero Balance</option>
          </select>
          <select [(ngModel)]="sortBy" (ngModelChange)="resetPage()"
                  class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200 min-w-[170px]">
            <option value="value-high">Value: High to Low</option>
            <option value="value-low">Value: Low to High</option>
            <option value="gold-high">Gold: High to Low</option>
            <option value="silver-high">Silver: High to Low</option>
            <option value="recent">Recent Activity</option>
            <option value="name">Name A-Z</option>
          </select>
          <div class="text-xs text-slate-400 font-medium whitespace-nowrap">{{ filtered().length }} customers</div>
        </div>
      </div>

      <!-- Customer Rows -->
      <div class="space-y-2">
        @for (c of paginated(); track c.id; let i = $index) {
          <div class="card hover-glow-gold p-0 overflow-hidden animate-fade-in-up"
               [style.animation-delay.ms]="i * 30">
            <div class="flex items-center gap-0 p-4 cursor-pointer" (click)="toggle(c.id)">

              <!-- Avatar + User Info -->
              <div class="w-[240px] flex items-center gap-3 flex-shrink-0 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 transition-transform duration-300"
                     [class.scale-110]="expanded().has(c.id)">
                  {{ c.userName[0] }}
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{ c.userName }}</div>
                  <div class="text-[11px] text-slate-400 mt-0.5 truncate">{{ c.mobileNumber }}</div>
                </div>
              </div>

              <!-- Gold Balance -->
              <div class="w-[120px] text-center flex-shrink-0">
                <div class="text-sm font-bold text-amber-600 counter-value">{{ formatWeight(c.goldBalance) }} g</div>
                <div class="text-[10px] text-slate-400">{{ formatCurrency(c.goldValue) }}</div>
              </div>

              <!-- Silver Balance -->
              <div class="w-[120px] text-center flex-shrink-0">
                <div class="text-sm font-bold text-slate-600 dark:text-slate-300 counter-value">{{ formatWeight(c.silverBalance) }} g</div>
                <div class="text-[10px] text-slate-400">{{ formatCurrency(c.silverValue) }}</div>
              </div>

              <!-- Total Value (fills remaining) -->
              <div class="flex-1 px-4 min-w-[140px]">
                <div class="flex items-center justify-between text-[11px] mb-1">
                  <span class="text-slate-500 font-medium">Total Value</span>
                  <span class="font-bold text-slate-800 dark:text-white text-sm">{{ formatCurrency(c.totalValue) }}</span>
                </div>
                <div class="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full rounded-full flex overflow-hidden">
                    <div class="bg-gradient-to-r from-amber-400 to-amber-500 h-full chart-bar-animated"
                         [style.width.%]="c.totalValue > 0 ? (c.goldValue / c.totalValue) * 100 : 0"></div>
                    <div class="bg-gradient-to-r from-slate-400 to-slate-500 h-full chart-bar-animated"
                         [style.width.%]="c.totalValue > 0 ? (c.silverValue / c.totalValue) * 100 : 0"></div>
                  </div>
                </div>
                <div class="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>Gold {{ c.totalValue > 0 ? ((c.goldValue / c.totalValue) * 100).toFixed(0) : 0 }}%</span>
                  <span>Silver {{ c.totalValue > 0 ? ((c.silverValue / c.totalValue) * 100).toFixed(0) : 0 }}%</span>
                </div>
              </div>

              <!-- Txn Count -->
              <div class="w-[70px] text-center flex-shrink-0 hidden lg:block">
                <div class="text-sm font-semibold text-slate-700 dark:text-slate-200">{{ c.totalBuyTxns + c.totalSellTxns }}</div>
                <div class="text-[10px] text-slate-400">Txns</div>
              </div>

              <!-- Last Active -->
              <div class="w-[90px] text-center flex-shrink-0 hidden lg:block">
                <div class="text-[11px] font-medium" [ngClass]="isRecent(c.lastTxnDate) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'">
                  {{ formatDateShort(c.lastTxnDate) }}
                </div>
                <div class="text-[10px] text-slate-400">Last Txn</div>
              </div>

              <!-- Expand -->
              <div class="w-[32px] flex justify-center flex-shrink-0">
                <button class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-transform duration-300"
                        [class.rotate-180]="expanded().has(c.id)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- Expanded Details -->
            @if (expanded().has(c.id)) {
              <div class="border-t border-slate-100 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-4 animate-fade-in-down">
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer ID</div>
                    <div class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">#{{ c.id }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unique ID</div>
                    <div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5 truncate font-mono text-[11px]">{{ c.uniqueId }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">KYC Status</div>
                    <div class="mt-0.5">
                      <span class="badge text-[10px]"
                            [ngClass]="c.kycStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                       c.kycStatus === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                                       'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'">{{ c.kycStatus }}</span>
                    </div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</div>
                    <div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ c.state }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Buy Transactions</div>
                    <div class="text-sm font-semibold text-emerald-600 mt-0.5">{{ c.totalBuyTxns }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sell Transactions</div>
                    <div class="text-sm font-semibold text-red-600 mt-0.5">{{ c.totalSellTxns }}</div>
                  </div>
                </div>

                <!-- Holdings Breakdown -->
                <div class="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/40 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span class="text-sm font-semibold text-amber-700 dark:text-amber-400">Gold Holdings</span>
                      </div>
                      <span class="text-lg font-bold text-amber-700 dark:text-amber-300">{{ formatWeight(c.goldBalance) }} g</span>
                    </div>
                    <div class="text-[12px] text-amber-600/70 mt-1">Value: {{ formatCurrency(c.goldValue) }} &#64; ₹15,654.60/g</div>
                  </div>
                  <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-600/40">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-slate-400"></div>
                        <span class="text-sm font-semibold text-slate-600 dark:text-slate-300">Silver Holdings</span>
                      </div>
                      <span class="text-lg font-bold text-slate-700 dark:text-slate-200">{{ formatWeight(c.silverBalance) }} g</span>
                    </div>
                    <div class="text-[12px] text-slate-500 mt-1">Value: {{ formatCurrency(c.silverValue) }} &#64; ₹245.71/g</div>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      <!-- Pagination -->
      @if (filtered().length > pageSize) {
        <div class="flex items-center justify-between text-sm">
          <span class="text-xs text-slate-400 font-medium">{{ pageStart }}-{{ pageEnd }} of {{ filtered().length }}</span>
          <div class="flex items-center gap-1">
            <button (click)="prevPage()" [disabled]="page === 1"
                    class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button (click)="nextPage()" [disabled]="page >= totalPages"
                    class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      }

      <!-- Empty -->
      @if (filtered().length === 0) {
        <div class="card py-16 text-center">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg class="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375"/></svg>
          </div>
          <p class="text-sm font-medium text-slate-500">No customers found</p>
          <p class="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
        </div>
      }
    </div>
  `
})
export class VaultComponent implements OnInit {
  search = '';
  metalFilter = '';
  balanceFilter = '';
  sortBy = 'value-high';
  page = 1;
  pageSize = 15;
  expanded = signal(new Set<number>());

  totalGold = 0;
  totalSilver = 0;
  totalGoldValue = 0;
  totalSilverValue = 0;
  totalVaultValue = 0;

  customers = signal<VaultCustomer[]>([]);

  exportCols = [
    { key: 'id', label: 'ID' }, { key: 'userName', label: 'Name' }, { key: 'mobileNumber', label: 'Mobile' },
    { key: 'goldBalance', label: 'Gold (g)' }, { key: 'silverBalance', label: 'Silver (g)' },
    { key: 'goldValue', label: 'Gold Value' }, { key: 'silverValue', label: 'Silver Value' },
    { key: 'totalValue', label: 'Total Value' }, { key: 'totalBuyTxns', label: 'Buy Txns' },
    { key: 'totalSellTxns', label: 'Sell Txns' }, { key: 'lastTxnDate', label: 'Last Txn' },
    { key: 'kycStatus', label: 'KYC' }, { key: 'state', label: 'State' }
  ];

  ngOnInit(): void {
    const data = this.generateCustomers();
    this.customers.set(data);
    this.totalGold = data.reduce((s, c) => s + c.goldBalance, 0);
    this.totalSilver = data.reduce((s, c) => s + c.silverBalance, 0);
    this.totalGoldValue = data.reduce((s, c) => s + c.goldValue, 0);
    this.totalSilverValue = data.reduce((s, c) => s + c.silverValue, 0);
    this.totalVaultValue = this.totalGoldValue + this.totalSilverValue;
  }

  filtered = computed(() => {
    let data = this.customers();
    const q = this.search.toLowerCase();

    if (q) {
      data = data.filter(c =>
        c.userName.toLowerCase().includes(q) || c.mobileNumber.includes(q) || c.uniqueId.toLowerCase().includes(q)
      );
    }

    if (this.metalFilter === 'gold-only') data = data.filter(c => c.goldBalance > 0 && c.silverBalance === 0);
    else if (this.metalFilter === 'silver-only') data = data.filter(c => c.silverBalance > 0 && c.goldBalance === 0);
    else if (this.metalFilter === 'both') data = data.filter(c => c.goldBalance > 0 && c.silverBalance > 0);

    if (this.balanceFilter === 'high') data = data.filter(c => c.totalValue > 50000);
    else if (this.balanceFilter === 'medium') data = data.filter(c => c.totalValue >= 10000 && c.totalValue <= 50000);
    else if (this.balanceFilter === 'low') data = data.filter(c => c.totalValue > 0 && c.totalValue < 10000);
    else if (this.balanceFilter === 'zero') data = data.filter(c => c.totalValue === 0);

    switch (this.sortBy) {
      case 'value-low': data = [...data].sort((a, b) => a.totalValue - b.totalValue); break;
      case 'gold-high': data = [...data].sort((a, b) => b.goldBalance - a.goldBalance); break;
      case 'silver-high': data = [...data].sort((a, b) => b.silverBalance - a.silverBalance); break;
      case 'recent': data = [...data].sort((a, b) => new Date(b.lastTxnDate).getTime() - new Date(a.lastTxnDate).getTime()); break;
      case 'name': data = [...data].sort((a, b) => a.userName.localeCompare(b.userName)); break;
      default: data = [...data].sort((a, b) => b.totalValue - a.totalValue);
    }
    return data;
  });

  exportData = computed(() => this.filtered().map(c => ({ ...c })) as Record<string, unknown>[]);

  paginated = computed(() => {
    const start = (this.page - 1) * this.pageSize;
    return this.filtered().slice(start, start + this.pageSize);
  });

  get totalPages(): number { return Math.ceil(this.filtered().length / this.pageSize); }
  get pageStart(): number { return this.filtered().length ? (this.page - 1) * this.pageSize + 1 : 0; }
  get pageEnd(): number { return Math.min(this.page * this.pageSize, this.filtered().length); }

  toggle(id: number): void {
    const set = new Set(this.expanded());
    if (set.has(id)) set.delete(id); else set.add(id);
    this.expanded.set(set);
  }

  resetPage(): void { this.page = 1; }
  prevPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages) this.page++; }

  formatCurrency(n: number): string { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
  formatWeight(n: number): string { return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 }).format(n); }
  formatDateShort(d: string): string {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }); }
    catch { return d; }
  }
  isRecent(d: string): boolean {
    try { return Date.now() - new Date(d).getTime() < 7 * 24 * 60 * 60 * 1000; }
    catch { return false; }
  }

  private generateCustomers(): VaultCustomer[] {
    const firstNames = ['Ayesha', 'Omar', 'Fatima', 'Yusuf', 'Zainab', 'Swaroop', 'Jagdish', 'Mohd', 'Sandeep', 'Priya',
      'Rahul', 'Neha', 'Vikram', 'Pooja', 'Arjun', 'Sakina', 'Irfan', 'Deepak', 'Meera', 'Noor',
      'Ravi', 'Sunita', 'Amir', 'Kavita', 'Rajesh', 'Sanjay', 'Amina', 'Kiran', 'Tariq', 'Farhan',
      'Shreya', 'Imran', 'Divya', 'Hassan', 'Rekha', 'Bilal', 'Swati', 'Zaheer', 'Anita', 'Ali'];
    const lastNames = ['Khan', 'Rashid', 'Siddiq', 'Ali', 'Noor', 'Kumar', 'Prasad', 'Singh', 'Sharma', 'Patel',
      'Gupta', 'Verma', 'Joshi', 'Reddy', 'Shah', 'Malik', 'Das', 'Rao', 'Mishra', 'Chauhan'];
    const states = ['Gujarat', 'Maharashtra', 'Karnataka', 'Bihar', 'Tamil Nadu', 'Delhi', 'UP', 'Rajasthan', 'Kerala', 'Telangana'];
    const kycStatuses: VaultCustomer['kycStatus'][] = ['approved', 'pending', 'rejected'];

    const goldRate = 15654.60;
    const silverRate = 245.71;

    return Array.from({ length: 120 }, (_, i) => {
      const first = firstNames[Math.floor(Math.random() * firstNames.length)];
      const last = lastNames[Math.floor(Math.random() * lastNames.length)];
      const goldBal = +(Math.random() * 25).toFixed(4);
      const silverBal = +(Math.random() * 150).toFixed(4);
      const goldVal = Math.round(goldBal * goldRate);
      const silverVal = Math.round(silverBal * silverRate);

      return {
        id: 163000 + i,
        userName: `${first} ${last}`,
        mobileNumber: '9' + Math.floor(100000000 + Math.random() * 900000000),
        uniqueId: Array.from({ length: 20 }, () => 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 62)]).join(''),
        goldBalance: goldBal,
        silverBalance: silverBal,
        goldValue: goldVal,
        silverValue: silverVal,
        totalValue: goldVal + silverVal,
        totalBuyTxns: Math.floor(Math.random() * 30),
        totalSellTxns: Math.floor(Math.random() * 10),
        lastTxnDate: new Date(2025, 6 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 28) + 1).toISOString(),
        kycStatus: kycStatuses[Math.floor(Math.random() * (i < 80 ? 1.3 : 3))],
        state: states[Math.floor(Math.random() * states.length)]
      };
    });
  }
}
