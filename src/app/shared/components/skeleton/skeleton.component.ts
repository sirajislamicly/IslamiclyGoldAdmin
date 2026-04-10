import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    @switch (variant) {
      @case ('card') {
        <div class="card animate-pulse space-y-4">
          <div class="flex items-center justify-between">
            <div class="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div class="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
          </div>
          <div class="space-y-2">
            <div class="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div class="w-32 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div class="flex gap-[2px] h-6 items-end">
            @for (i of sparkBars; track i) {
              <div class="flex-1 bg-slate-200 dark:bg-slate-700 rounded-sm" [style.height.%]="20 + i * 6"></div>
            }
          </div>
        </div>
      }
      @case ('table') {
        <div class="space-y-3 animate-pulse">
          <div class="flex gap-3">
            <div class="w-48 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
            <div class="w-24 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
          </div>
          <div class="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div class="h-10 bg-slate-100 dark:bg-slate-800"></div>
            @for (i of tableRows; track i) {
              <div class="flex items-center gap-4 px-4 py-3 border-t border-slate-100 dark:border-slate-700/40">
                <div class="w-12 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="w-28 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="w-20 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div class="w-16 h-5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                <div class="flex-1"></div>
                <div class="w-24 h-3 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            }
          </div>
        </div>
      }
      @case ('chart') {
        <div class="card animate-pulse">
          <div class="flex justify-between mb-4">
            <div class="w-36 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div class="w-24 h-5 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div class="flex items-end gap-1.5 h-48">
            @for (i of chartBars; track i) {
              <div class="flex-1 bg-slate-200 dark:bg-slate-700 rounded-t" [style.height.%]="20 + (i * 7) % 60"></div>
            }
          </div>
        </div>
      }
      @default {
        <div class="animate-pulse">
          <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" [style.width]="width"></div>
        </div>
      }
    }
  `
})
export class SkeletonComponent {
  @Input() variant: 'card' | 'table' | 'chart' | 'text' = 'text';
  @Input() width = '100%';

  sparkBars = Array.from({ length: 12 }, (_, i) => i);
  tableRows = Array.from({ length: 6 }, (_, i) => i);
  chartBars = Array.from({ length: 12 }, (_, i) => i);
}
