import { Component, signal, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiCardComponent } from '../../shared/components/kpi-card/kpi-card.component';
import { ExportButtonComponent } from '../../shared/components/export-button/export-button.component';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent, ExportButtonComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Users</h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage all registered users and KYC status</p>
        </div>
        <app-export-button [data]="users" filename="users" title="Users Report" [columns]="exportCols" />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Users" [value]="fN(kpis.totalUsers || 0)" delta="+4.2%" icon="U" iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" sparklineColor="bg-blue-400" />
        <app-kpi-card label="KYC Approved" [value]="fN(kpis.approved || 0)" delta="+8%" icon="A" iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="KYC Pending" [value]="fN(kpis.pending || 0)" icon="P" iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" sparklineColor="bg-amber-400" />
        <app-kpi-card label="KYC Rejected" [value]="fN(kpis.rejected || 0)" delta="-2%" icon="R" iconBgClass="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" sparklineColor="bg-red-400" />
      </div>

      <div class="card p-3">
        <div class="flex items-center gap-3">
          <div class="relative flex-1 max-w-xs">
            <svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            <input [(ngModel)]="search" (ngModelChange)="onFilterChange()"
                   class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-500 transition-all duration-200"
                   placeholder="Search by name, email, mobile..." />
          </div>
          <select [(ngModel)]="kycFilter" (ngModelChange)="onFilterChange()" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[130px]">
            <option value="">All KYC</option><option value="approved">Approved</option><option value="pending">Pending</option><option value="rejected">Rejected</option>
          </select>
          <select [(ngModel)]="stateFilter" (ngModelChange)="onFilterChange()" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[130px]">
            <option value="">All States</option>
            <option *ngFor="let s of states" [value]="s">{{ s }}</option>
          </select>
          <select [(ngModel)]="sortBy" (ngModelChange)="onFilterChange()" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[140px]">
            <option value="latest">Latest First</option><option value="name">Name A-Z</option><option value="state">By State</option>
          </select>
          <div class="text-xs text-slate-400 font-medium whitespace-nowrap">{{ totalCount }} users</div>
        </div>
      </div>

      @if (loading()) {
        <div class="card py-12 text-center text-sm text-slate-400">Loading users...</div>
      }

      <div class="space-y-2">
        @for (u of users; track u.id; let i = $index) {
          <div class="card hover-glow-gold p-0 overflow-hidden animate-fade-in-up" [style.animation-delay.ms]="i * 30">
            <div class="flex items-center gap-0 p-4 cursor-pointer" (click)="toggle(u.id)">
              <div class="w-[240px] flex items-center gap-3 flex-shrink-0 min-w-0">
                <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0 transition-transform duration-300" [class.scale-110]="expanded().has(u.id)">
                  {{ u.userName ? u.userName[0].toUpperCase() : 'U' }}
                </div>
                <div class="min-w-0">
                  <div class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{ u.userName }}</div>
                  <div class="text-[11px] text-slate-400 mt-0.5 truncate">{{ u.mobileNumber }}</div>
                </div>
              </div>
              <div class="w-[200px] flex-shrink-0 min-w-0 hidden md:block">
                <div class="text-[12px] text-slate-500 dark:text-slate-400 truncate">{{ u.userEmail || '-' }}</div>
              </div>
              <div class="w-[100px] text-center flex-shrink-0 hidden lg:block">
                <div class="text-[12px] text-slate-500">{{ u.userState || '-' }}</div>
              </div>
              <div class="w-[90px] text-center flex-shrink-0">
                <span class="badge text-[10px]" [ngClass]="u.kycStatus === 'approved' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : u.kycStatus === 'pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'">{{ u.kycStatus }}</span>
              </div>
              <div class="flex-1 px-4 hidden lg:block">
                <div class="text-[12px] font-mono text-slate-500">{{ u.pannumber || 'No PAN' }}</div>
              </div>
              <div class="w-[90px] text-center flex-shrink-0 hidden lg:block">
                <div class="text-[11px] text-slate-500">{{ fD(u.createdAt) }}</div>
              </div>
              <div class="w-[32px] flex justify-center flex-shrink-0">
                <button class="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-transform duration-300" [class.rotate-180]="expanded().has(u.id)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
              </div>
            </div>
            @if (expanded().has(u.id)) {
              <div class="border-t border-slate-100 dark:border-slate-700/40 bg-slate-50/50 dark:bg-slate-800/30 px-4 py-4 animate-fade-in-down">
                <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">UID</div><div class="text-sm font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{{ u.uid }}</div></div>
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mobile</div><div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ u.mobileNumber }}</div></div>
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</div><div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5 truncate">{{ u.userEmail || '-' }}</div></div>
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DOB</div><div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ u.dateOfBirth }}</div></div>
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gender</div><div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ u.gender || '-' }}</div></div>
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PAN</div><div class="text-sm font-mono text-slate-600 dark:text-slate-300 mt-0.5">{{ u.pannumber || '-' }}</div></div>
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">State</div><div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ u.userState || '-' }}</div></div>
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City</div><div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ u.userCity || '-' }}</div></div>
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pincode</div><div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ u.userPincode || '-' }}</div></div>
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nominee</div><div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ u.nomineeName || 'Not set' }}</div></div>
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Relation</div><div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ u.nomineeRelation || '-' }}</div></div>
                  <div><div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joined</div><div class="text-sm text-slate-600 dark:text-slate-300 mt-0.5">{{ fD(u.createdAt) }}</div></div>
                </div>
              </div>
            }
          </div>
        }
      </div>

      @if (totalCount > pageSize) {
        <div class="flex items-center justify-between text-sm">
          <span class="text-xs text-slate-400 font-medium">{{ (page-1)*pageSize+1 }}-{{ min(page*pageSize, totalCount) }} of {{ totalCount }}</span>
          <div class="flex gap-1">
            <button (click)="changePage(-1)" [disabled]="page===1" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button>
            <button (click)="changePage(1)" [disabled]="page>=totalPages" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button>
          </div>
        </div>
      }
    </div>
  `
})
export class UsersComponent implements OnInit {
  private api = inject(ApiService);

  loading = signal(false);
  users: any[] = [];
  kpis: any = {};
  states: string[] = [];
  totalCount = 0;

  search = ''; kycFilter = ''; stateFilter = ''; sortBy = 'latest';
  page = 1; pageSize = 15;
  expanded = signal(new Set<number>());
  private filterTimer: any;

  exportCols = [
    { key: 'userName', label: 'Name' }, { key: 'mobileNumber', label: 'Mobile' }, { key: 'userEmail', label: 'Email' },
    { key: 'kycStatus', label: 'KYC' }, { key: 'userState', label: 'State' }, { key: 'pannumber', label: 'PAN' }, { key: 'createdAt', label: 'Joined' }
  ];

  get totalPages() { return Math.ceil(this.totalCount / this.pageSize); }

  ngOnInit(): void {
    this.api.usersKpis().subscribe(k => this.kpis = k);
    this.api.usersStates().subscribe(s => this.states = (s || []).map((x: any) => x.userState || x).filter(Boolean));
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.api.usersList({
      search: this.search || undefined,
      kycStatus: this.kycFilter || undefined,
      state: this.stateFilter || undefined,
      sortBy: this.sortBy,
      pageNumber: this.page,
      pageSize: this.pageSize
    }).subscribe({
      next: (res) => {
        this.users = res || [];
        this.totalCount = this.users[0]?.totalCount || this.users.length;
        this.loading.set(false);
      },
      error: () => { this.users = []; this.loading.set(false); }
    });
  }

  onFilterChange(): void {
    clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => { this.page = 1; this.loadUsers(); }, 300);
  }

  changePage(delta: number): void {
    const newPage = this.page + delta;
    if (newPage >= 1 && newPage <= this.totalPages) { this.page = newPage; this.loadUsers(); }
  }

  toggle(id: number) { const s = new Set(this.expanded()); if (s.has(id)) s.delete(id); else s.add(id); this.expanded.set(s); }
  min(a: number, b: number) { return Math.min(a, b); }
  fN(n: number) { return new Intl.NumberFormat('en-IN').format(n); }
  fD(d: string) { try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }); } catch { return d; } }
}
