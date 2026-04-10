import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NLSearchService, SearchResult } from '../../../core/services/nl-search.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="relative w-full">
      <div class="relative">
        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input type="text"
               [(ngModel)]="query"
               (ngModelChange)="onSearch()"
               (focus)="focused.set(true)"
               class="w-full pl-9 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800/60 border border-transparent
                      hover:border-slate-200 dark:hover:border-slate-700
                      focus:bg-white dark:focus:bg-slate-800 focus:border-slate-300 dark:focus:border-slate-600
                      focus:shadow-lg focus:shadow-slate-200/30 dark:focus:shadow-slate-900/30
                      rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20
                      placeholder:text-slate-400 dark:placeholder:text-slate-500
                      transition-all duration-200"
               placeholder="Search anything... try &quot;sip failures last 7 days&quot;" />
        @if (query) {
          <button (click)="clear()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        }
      </div>

      @if (focused() && results().length > 0) {
        <div class="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 z-50 max-h-[360px] overflow-y-auto animate-fade-in-down">
          <div class="p-2">
            @for (result of results(); track result.title; let i = $index) {
              <button (click)="select(result)"
                      class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors text-left group">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
                     [ngClass]="result.type === 'navigation' ? 'bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400' :
                                result.type === 'metric' ? 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                'bg-gold-50 text-gold-500 dark:bg-gold-900/30 dark:text-gold-400'">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path *ngIf="result.type === 'navigation'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                    <path *ngIf="result.type !== 'navigation'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{{ result.title }}</div>
                  <div class="text-[11px] text-slate-400 dark:text-slate-500 truncate">{{ result.description }}</div>
                </div>
                <svg class="w-4 h-4 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </button>
            }
          </div>
          <div class="px-4 py-2 border-t border-slate-100 dark:border-slate-700/60">
            <p class="text-[10px] text-slate-400 flex items-center gap-2">
              <kbd class="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono">Enter</kbd> to select
              <kbd class="px-1 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-mono">Esc</kbd> to close
            </p>
          </div>
        </div>
      }
    </div>
  `
})
export class SearchBarComponent {
  private nlSearch = inject(NLSearchService);

  query = '';
  focused = signal(false);
  results = signal<SearchResult[]>([]);

  onSearch(): void {
    if (this.query.length >= 2) {
      this.results.set(this.nlSearch.search(this.query));
    } else {
      this.results.set([]);
    }
  }

  select(result: SearchResult): void {
    this.nlSearch.navigateToResult(result);
    this.clear();
  }

  clear(): void {
    this.query = '';
    this.results.set([]);
    this.focused.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-search-bar')) {
      this.focused.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.focused.set(false);
  }
}
