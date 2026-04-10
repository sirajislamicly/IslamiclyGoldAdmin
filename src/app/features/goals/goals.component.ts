import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Goal } from './goal.service';
import { ExportButtonComponent } from '../../shared/components/export-button/export-button.component';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule, ExportButtonComponent, KpiCardComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Goals</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">User-wise goal tracking with SIP details</p>
        </div>
        <app-export-button [data]="exportData()" filename="goals-report" title="Goals Report" [columns]="exportCols" />
      </div>

      <!-- KPIs -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Goals" [value]="formatNum(goals().length)" delta="+12%" icon="G"
                      iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400"
                      sparklineColor="bg-violet-400" />
        <app-kpi-card label="Active Goals" [value]="formatNum(activeCount)" delta="+8%" icon="A"
                      iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Gold Goals" [value]="formatNum(goldCount)" icon="Au"
                      iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                      sparklineColor="bg-amber-400" />
        <app-kpi-card label="Total Target Value" [value]="formatCurrency(totalTarget)" delta="+22%" icon="V"
                      iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      sparklineColor="bg-blue-400" />
      </div>

      <!-- Filters - Single Row -->
      <div class="card p-3">
        <div class="flex items-center gap-3">
          <div class="relative flex-1 max-w-xs">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input [(ngModel)]="search" (ngModelChange)="resetPage()"
                   class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200"
                   placeholder="Search by user, goal name..." />
          </div>
          <select [(ngModel)]="statusFilter" (ngModelChange)="resetPage()"
                  class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200 min-w-[130px]">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
          <select [(ngModel)]="metalFilter" (ngModelChange)="resetPage()"
                  class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200 min-w-[120px]">
            <option value="">All Metals</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </select>
          <select [(ngModel)]="sortBy" (ngModelChange)="resetPage()"
                  class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200 min-w-[170px]">
            <option value="latest">Latest First</option>
            <option value="progress-high">Progress: High to Low</option>
            <option value="progress-low">Progress: Low to High</option>
            <option value="amount-high">Amount: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
          <div class="text-xs text-slate-400 font-medium whitespace-nowrap">{{ filtered().length }} goals</div>
        </div>
      </div>

      <!-- Goal Rows -->
      <div class="space-y-2">
        @for (g of paginated(); track g.id; let i = $index) {
          <div class="card hover-glow-gold p-0 overflow-hidden animate-fade-in-up"
               [style.animation-delay.ms]="i * 40">

            <!-- Main Row -->
            <div class="flex items-center gap-0 p-4 cursor-pointer" (click)="toggle(g.id)">

              <!-- User Avatar + Info (fixed width) -->
              <div class="w-[280px] flex items-center gap-3 flex-shrink-0 min-w-0">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 transition-transform duration-300"
                     [ngClass]="g.metalType === 'gold'
                       ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white'
                       : 'bg-gradient-to-br from-slate-400 to-slate-600 text-white'"
                     [class.scale-110]="expanded().has(g.id)">
                  {{ g.userName[0] }}
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{ g.userName }}</div>
                  <div class="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2 truncate">
                    <span>{{ g.goalName }}</span>
                    <span class="text-slate-300 dark:text-slate-600">|</span>
                    <span>{{ g.userMobile }}</span>
                  </div>
                </div>
              </div>

              <!-- Metal Badge (fixed width, centered) -->
              <div class="w-[80px] flex justify-center flex-shrink-0">
                <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                     [ngClass]="g.metalType === 'gold' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">
                  <span class="w-2 h-2 rounded-full" [ngClass]="g.metalType === 'gold' ? 'bg-amber-500' : 'bg-slate-400'"></span>
                  {{ g.metalType | titlecase }}
                </div>
              </div>

              <!-- SIP Info (fixed width, right-aligned) -->
              <div class="w-[100px] text-right flex-shrink-0">
                <div class="text-sm font-bold text-slate-800 dark:text-white counter-value">{{ formatCurrency(g.sipAmount) }}</div>
                <div class="text-[11px] text-slate-400">{{ g.sipFrequency }}</div>
              </div>

              <!-- Progress (fixed width) -->
              <div class="w-[180px] px-4 flex-shrink-0">
                <div class="flex items-center justify-between text-[11px] mb-1">
                  <span class="text-slate-500 font-medium">{{ progress(g) }}%</span>
                  <span class="text-slate-400">{{ formatCurrency(g.currentAmount) }}</span>
                </div>
                <div class="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all duration-700 chart-bar-animated"
                       [ngClass]="progress(g) >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                                  progress(g) >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                                  'bg-gradient-to-r from-red-400 to-orange-500'"
                       [style.width.%]="progress(g)"></div>
                </div>
              </div>

              <!-- Start Date -->
              <div class="w-[90px] text-center flex-shrink-0 hidden xl:block">
                <div class="text-[11px] text-slate-500 dark:text-slate-400">{{ formatDateShort(g.startDate) }}</div>
              </div>

              <!-- End Date -->
              <div class="w-[90px] text-center flex-shrink-0 hidden xl:block">
                <div class="text-[11px] text-slate-500 dark:text-slate-400">{{ formatDateShort(g.endDate) }}</div>
              </div>

              <!-- Last SIP Date -->
              <div class="w-[90px] text-center flex-shrink-0 hidden xl:block">
                <div class="text-[11px] font-medium" [ngClass]="isRecent(g.lastSipDate) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'">{{ formatDateShort(g.lastSipDate) }}</div>
              </div>

              <!-- Status (fixed width, centered) -->
              <div class="w-[80px] flex justify-center flex-shrink-0">
                <span class="badge text-[10px]"
                      [ngClass]="g.status === 'active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                 g.status === 'completed' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' :
                                 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'">
                  {{ g.status }}
                </span>
              </div>

              <!-- Expand Arrow -->
              <div class="w-[32px] flex justify-center flex-shrink-0">
                <button class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-transform duration-300"
                        [class.rotate-180]="expanded().has(g.id)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>

            <!-- Expanded Details -->
            @if (expanded().has(g.id)) {
              <div class="border-t border-slate-100 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-4 animate-fade-in-down">
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal ID</div>
                    <div class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">#{{ g.id }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SIP ID</div>
                    <div class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">#{{ g.sipId }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Amount</div>
                    <div class="text-sm font-bold text-slate-800 dark:text-white mt-0.5">{{ formatCurrency(g.targetAmount) }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Saved So Far</div>
                    <div class="text-sm font-bold text-emerald-600 mt-0.5">{{ formatCurrency(g.currentAmount) }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining</div>
                    <div class="text-sm font-bold text-amber-600 mt-0.5">{{ formatCurrency(g.targetAmount - g.currentAmount) }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Installments</div>
                    <div class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{{ g.installmentsPaid }} / {{ g.totalInstallments }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</div>
                    <div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5 truncate">{{ g.userEmail }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</div>
                    <div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ g.userState }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</div>
                    <div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ formatDate(g.startDate) }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date</div>
                    <div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ formatDate(g.endDate) }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Created</div>
                    <div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ formatDate(g.createdAt) }}</div>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">SIP Schedule</div>
                    <div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ formatCurrency(g.sipAmount) }} / {{ g.sipFrequency }}</div>
                  </div>
                </div>

                <!-- Full-width progress bar in expanded view -->
                <div class="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/40">
                  <div class="flex items-center justify-between text-xs mb-1.5">
                    <span class="font-semibold text-slate-600 dark:text-slate-300">Progress</span>
                    <span class="font-bold" [ngClass]="progress(g) >= 80 ? 'text-emerald-600' : progress(g) >= 40 ? 'text-amber-600' : 'text-red-500'">
                      {{ progress(g) }}% complete
                    </span>
                  </div>
                  <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-1000"
                         [ngClass]="progress(g) >= 80 ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' :
                                    progress(g) >= 40 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                                    'bg-gradient-to-r from-red-400 to-orange-500'"
                         [style.width.%]="progress(g)"></div>
                  </div>
                  <div class="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>{{ formatCurrency(g.currentAmount) }} saved</span>
                    <span>{{ formatCurrency(g.targetAmount) }} target</span>
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

      <!-- Empty State -->
      @if (filtered().length === 0) {
        <div class="card py-16 text-center">
          <div class="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-3">
            <svg class="w-7 h-7 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58"/></svg>
          </div>
          <p class="text-sm font-medium text-slate-500">No goals found</p>
          <p class="text-xs text-slate-400 mt-1">Try adjusting your filters</p>
        </div>
      }
    </div>
  `
})
export class GoalsComponent {
  search = '';
  statusFilter = '';
  metalFilter = '';
  sortBy = 'latest';
  page = 1;
  pageSize = 15;
  expanded = signal(new Set<number>());

  // Computed stats
  activeCount = 0;
  goldCount = 0;
  totalTarget = 0;

  private firstNames = ['Ayesha', 'Omar', 'Fatima', 'Yusuf', 'Zainab', 'Swaroop', 'Jagdish', 'Mohd', 'Sandeep', 'Priya',
    'Rahul', 'Neha', 'Vikram', 'Pooja', 'Arjun', 'Sakina', 'Irfan', 'Deepak', 'Meera', 'Noor',
    'Ravi', 'Sunita', 'Amir', 'Kavita', 'Rajesh', 'Sanjay', 'Amina', 'Kiran', 'Tariq', 'Farhan'];
  private lastNames = ['Khan', 'Rashid', 'Siddiq', 'Ali', 'Noor', 'Kumar', 'Prasad', 'Singh', 'Sharma', 'Patel',
    'Gupta', 'Verma', 'Joshi', 'Reddy', 'Shah', 'Malik', 'Das', 'Rao', 'Mishra', 'Chauhan'];
  private goalNames = ['Marriage', 'Hajj', 'Education', 'Emergency Fund', 'Retirement', 'Home', 'Business', 'Travel'];
  private states = ['Gujarat', 'Maharashtra', 'Karnataka', 'Bihar', 'Tamil Nadu', 'Delhi', 'Uttar Pradesh', 'Rajasthan', 'Kerala', 'Telangana'];

  goals = signal<Goal[]>(this.generateGoals());

  exportCols = [
    { key: 'id', label: 'ID' }, { key: 'userName', label: 'User' }, { key: 'userMobile', label: 'Mobile' },
    { key: 'goalName', label: 'Goal' }, { key: 'metalType', label: 'Metal' }, { key: 'targetAmount', label: 'Target' },
    { key: 'currentAmount', label: 'Saved' }, { key: 'sipAmount', label: 'SIP Amount' }, { key: 'sipFrequency', label: 'Frequency' },
    { key: 'startDate', label: 'Start Date' }, { key: 'endDate', label: 'End Date' },
    { key: 'lastSipDate', label: 'Last SIP Date' }, { key: 'status', label: 'Status' }, { key: 'createdAt', label: 'Created' }
  ];

  filtered = computed(() => {
    let data = this.goals();
    const q = this.search.toLowerCase();
    if (q) {
      data = data.filter(g =>
        g.userName.toLowerCase().includes(q) || g.goalName.toLowerCase().includes(q) ||
        g.userMobile.includes(q) || g.userEmail.toLowerCase().includes(q)
      );
    }
    if (this.statusFilter) data = data.filter(g => g.status === this.statusFilter);
    if (this.metalFilter) data = data.filter(g => g.metalType === this.metalFilter);

    switch (this.sortBy) {
      case 'progress-high': data = [...data].sort((a, b) => this.progress(b) - this.progress(a)); break;
      case 'progress-low': data = [...data].sort((a, b) => this.progress(a) - this.progress(b)); break;
      case 'amount-high': data = [...data].sort((a, b) => b.targetAmount - a.targetAmount); break;
      case 'name': data = [...data].sort((a, b) => a.userName.localeCompare(b.userName)); break;
      default: data = [...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return data;
  });

  exportData = computed(() => this.filtered().map(g => ({ ...g })) as Record<string, unknown>[]);

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

  progress(g: Goal): number {
    return Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100));
  }

  formatNum(n: number): string { return new Intl.NumberFormat('en-IN').format(n); }
  formatCurrency(n: number): string { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
  formatDate(d: string): string {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  }

  formatDateShort(d: string): string {
    try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }); }
    catch { return d; }
  }

  isRecent(d: string): boolean {
    try {
      const diff = Date.now() - new Date(d).getTime();
      return diff < 7 * 24 * 60 * 60 * 1000; // within 7 days
    } catch { return false; }
  }

  private generateGoals(): Goal[] {
    const goals: Goal[] = [];
    const statuses: Goal['status'][] = ['active', 'completed', 'paused'];
    const frequencies: Goal['sipFrequency'][] = ['Daily', 'Weekly', 'Monthly'];
    const kycStatuses: Goal['kycStatus'][] = ['approved', 'pending', 'rejected'];

    for (let i = 0; i < 80; i++) {
      const first = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
      const last = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
      const goalName = this.goalNames[Math.floor(Math.random() * this.goalNames.length)];
      const target = [5000, 10000, 15000, 25000, 50000, 100000][Math.floor(Math.random() * 6)];
      const current = Math.floor(Math.random() * target * 0.95);
      const sipAmount = [100, 200, 481, 500, 1000, 2000, 2500, 5000][Math.floor(Math.random() * 8)];
      const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
      const totalInst = freq === 'Daily' ? 365 : freq === 'Weekly' ? 52 : 12;
      const status = statuses[Math.floor(Math.random() * (i < 50 ? 1.5 : 3))];
      const startDate = new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);

      goals.push({
        id: 200 + i,
        goalName,
        metalType: Math.random() > 0.4 ? 'gold' : 'silver',
        sipId: 800 + Math.floor(Math.random() * 150),
        targetAmount: target,
        currentAmount: current,
        sipAmount,
        sipFrequency: freq,
        userName: `${first} ${last}`,
        userMobile: '9' + Math.floor(100000000 + Math.random() * 900000000),
        userEmail: `${first.toLowerCase()}${Math.floor(Math.random() * 100)}@example.com`,
        kycStatus: kycStatuses[Math.floor(Math.random() * (i < 60 ? 1.3 : 3))],
        userState: this.states[Math.floor(Math.random() * this.states.length)],
        startDate: startDate.toISOString(),
        endDate: new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        installmentsPaid: Math.floor(Math.random() * totalInst),
        totalInstallments: totalInst,
        status,
        lastSipDate: new Date(startDate.getTime() + Math.floor(Math.random() * 300) * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: startDate.toISOString()
      });
    }

    this.activeCount = goals.filter(g => g.status === 'active').length;
    this.goldCount = goals.filter(g => g.metalType === 'gold').length;
    this.totalTarget = goals.reduce((s, g) => s + g.targetAmount, 0);

    return goals;
  }
}
