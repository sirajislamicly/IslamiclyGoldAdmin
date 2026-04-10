import { Component, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'text' | 'number' | 'date' | 'currency' | 'badge';
  badgeMap?: Record<string, string>;
  visible?: boolean;
  width?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-3 animate-fade-in">
      <!-- Top controls -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1">
          <div class="relative flex-1 md:max-w-xs">
            <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input [(ngModel)]="searchTerm"
                   (ngModelChange)="onSearch()"
                   class="input pl-9 py-2 text-sm"
                   [placeholder]="searchPlaceholder" />
          </div>
          <div class="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-500">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7h16M4 12h16M4 17h7"/></svg>
            {{ filteredData().length }} rows
          </div>
        </div>
        <div class="flex items-center gap-2">
          <!-- Column selector -->
          <div class="relative" *ngIf="showColumnSelector">
            <button (click)="colSelectorOpen = !colSelectorOpen"
                    class="btn-ghost px-2.5 py-1.5 text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 rounded-xl">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h18M3 8h18M3 12h18M3 16h12M3 20h6"/></svg>
              Columns
            </button>
            <div *ngIf="colSelectorOpen"
                 class="absolute right-0 mt-1 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 p-2 max-h-64 overflow-y-auto animate-scale-in">
              <label *ngFor="let col of allColumns"
                     class="flex items-center gap-2 px-2.5 py-1.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer transition-colors">
                <input type="checkbox" [checked]="col.visible !== false" (change)="toggleColumn(col)"
                       class="rounded border-slate-300 text-gold-500 focus:ring-gold-500/30" />
                {{ col.label }}
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-700/60 bg-white dark:bg-slate-800/50">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200/80 dark:border-slate-700/60">
              <th *ngFor="let col of visibleColumns()"
                  class="py-3 px-3.5 text-left text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/80 sticky top-0 cursor-pointer select-none transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                  [style.width]="col.width"
                  (click)="col.sortable !== false && sort(col.key)">
                <div class="flex items-center gap-1">
                  {{ col.label }}
                  @if (sortKey === col.key) {
                    <svg class="w-3 h-3 text-gold-500" fill="currentColor" viewBox="0 0 20 20">
                      @if (sortDir === 'asc') {
                        <path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clip-rule="evenodd"/>
                      } @else {
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
                      }
                    </svg>
                  }
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-700/40">
            <tr *ngFor="let row of paginatedData(); let i = index"
                class="hover:bg-gold-50/30 dark:hover:bg-slate-700/30 transition-colors duration-150 cursor-pointer"
                (click)="rowClick.emit(row)">
                <td *ngFor="let col of visibleColumns()" class="py-2.5 px-3.5">
                  <ng-container [ngSwitch]="col.type">
                    <span *ngSwitchCase="'badge'">
                      <span [class]="getBadgeClass(row[col.key], col.badgeMap)" class="badge">
                        {{ row[col.key] ?? '-' }}
                      </span>
                    </span>
                    <span *ngSwitchCase="'currency'" class="font-semibold text-slate-700 dark:text-slate-300 counter-value text-[13px]">
                      {{ formatCurrency(row[col.key]) }}
                    </span>
                    <span *ngSwitchCase="'date'" class="text-slate-500 dark:text-slate-400 text-[13px]">
                      {{ formatDate(row[col.key]) }}
                    </span>
                    <span *ngSwitchCase="'number'" class="font-mono text-slate-600 dark:text-slate-300 text-[13px]">
                      {{ formatNumber(row[col.key]) }}
                    </span>
                    <span *ngSwitchDefault class="text-slate-700 dark:text-slate-300 text-[13px]">
                      {{ row[col.key] ?? '-' }}
                    </span>
                  </ng-container>
                </td>
              </tr>
            <tr *ngIf="paginatedData().length === 0">
              <td [colSpan]="visibleColumns().length" class="py-16 text-center">
                <div class="flex flex-col items-center gap-3">
                  <div class="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                    <svg class="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-slate-500">No results found</p>
                    <p class="text-xs text-slate-400 mt-0.5">Try adjusting your search or filters</p>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center gap-2 text-slate-500">
          <span class="text-xs">Rows per page</span>
          <select [(ngModel)]="pageSize" (ngModelChange)="onPageSizeChange()"
                  class="border border-slate-200 dark:border-slate-700 dark:bg-slate-800 rounded-lg px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-gold-500/40 focus:outline-none">
            <option [value]="10">10</option>
            <option [value]="25">25</option>
            <option [value]="50">50</option>
            <option [value]="100">100</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-slate-400 font-medium">{{ pageStart() }}-{{ pageEnd() }} of {{ filteredData().length }}</span>
          <div class="flex items-center gap-1">
            <button (click)="prevPage()" [disabled]="page === 1"
                    class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button (click)="nextPage()" [disabled]="page >= totalPages()"
                    class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DataTableComponent {
  @Input() set columns(val: TableColumn[]) {
    this.allColumns = val.map(c => ({ ...c, visible: c.visible !== false }));
  }
  @Input() set data(val: Record<string, any>[]) { this._data.set(val); }
  @Input() searchPlaceholder = 'Search...';
  @Input() showColumnSelector = true;
  @Output() rowClick = new EventEmitter<Record<string, any>>();

  allColumns: TableColumn[] = [];
  _data = signal<Record<string, any>[]>([]);
  searchTerm = '';
  sortKey = '';
  sortDir: 'asc' | 'desc' = 'asc';
  page = 1;
  pageSize = 25;
  colSelectorOpen = false;

  visibleColumns = computed(() => this.allColumns.filter(c => c.visible !== false));

  filteredData = computed(() => {
    let result = [...this._data()];
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      result = result.filter(row =>
        this.visibleColumns().some(col => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }
    if (this.sortKey) {
      result.sort((a, b) => {
        const av = a[this.sortKey]; const bv = b[this.sortKey];
        if (av == null) return 1; if (bv == null) return -1;
        const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
        return this.sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return result;
  });

  paginatedData = computed(() => {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredData().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this.filteredData().length / this.pageSize));
  pageStart = computed(() => this.filteredData().length ? (this.page - 1) * this.pageSize + 1 : 0);
  pageEnd = computed(() => Math.min(this.page * this.pageSize, this.filteredData().length));

  sort(key: string): void {
    if (this.sortKey === key) { this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc'; }
    else { this.sortKey = key; this.sortDir = 'asc'; }
    this._data.set([...this._data()]);
  }

  onSearch(): void { this.page = 1; this._data.set([...this._data()]); }
  onPageSizeChange(): void { this.page = 1; }
  prevPage(): void { if (this.page > 1) this.page--; }
  nextPage(): void { if (this.page < this.totalPages()) this.page++; }

  toggleColumn(col: TableColumn): void {
    col.visible = col.visible === false;
    this.allColumns = [...this.allColumns];
  }

  getBadgeClass(value: any, badgeMap?: Record<string, string>): string {
    if (!badgeMap || !value) return 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
    return badgeMap[String(value).toLowerCase()] || 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
  }

  formatCurrency(val: any): string {
    if (val == null) return '-';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(val));
  }

  formatDate(val: any): string {
    if (!val) return '-';
    try { return new Date(val).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return String(val); }
  }

  formatNumber(val: any): string {
    if (val == null) return '-';
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 4 }).format(Number(val));
  }
}
