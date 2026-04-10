import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card group hover:shadow-card-hover cursor-default animate-fade-in-up"
         [class]="borderAccent ? 'border-l-[3px] ' + borderAccent : ''">
      <div class="flex items-start justify-between mb-3">
        <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-transform duration-300 group-hover:scale-110"
             [ngClass]="iconBgClass">
          <ng-content select="[icon]"></ng-content>
          <span *ngIf="icon" class="text-sm">{{ icon }}</span>
        </div>
        <span *ngIf="delta"
              class="text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5"
              [ngClass]="deltaUp ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                         deltaDown ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                         'bg-slate-50 text-slate-500 dark:bg-slate-700 dark:text-slate-400'">
          <svg *ngIf="deltaUp" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clip-rule="evenodd"/></svg>
          <svg *ngIf="deltaDown" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clip-rule="evenodd"/></svg>
          {{ delta }}
        </span>
      </div>
      <div>
        <div class="text-[13px] text-slate-500 dark:text-slate-400 font-medium">{{ label }}</div>
        <div class="text-[22px] font-bold text-slate-800 dark:text-white mt-0.5 counter-value tracking-tight">
          {{ loading ? '---' : value }}
        </div>
        <div *ngIf="subtitle" class="text-[11px] text-slate-400 dark:text-slate-500 mt-1">{{ subtitle }}</div>
      </div>

      <!-- Mini Sparkline -->
      <div *ngIf="sparkline.length" class="mt-3 flex items-end gap-[2px] h-6">
        <div *ngFor="let v of sparkline; let i = index"
             class="flex-1 rounded-sm transition-all duration-200 group-hover:opacity-100"
             [class]="sparklineColor"
             [style.height.%]="(v / sparklineMax) * 100"
             [style.opacity]="0.4 + (i / sparkline.length) * 0.6">
        </div>
      </div>
    </div>
  `
})
export class KpiCardComponent implements OnInit {
  @Input() label = '';
  @Input() value: string | number = '';
  @Input() delta = '';
  @Input() icon = '';
  @Input() subtitle = '';
  @Input() loading = false;
  @Input() iconBgClass = 'bg-gold-50 text-gold-600';
  @Input() borderAccent = '';
  @Input() sparkline: number[] = [];
  @Input() sparklineColor = 'bg-gold-400';

  deltaUp = false;
  deltaDown = false;
  sparklineMax = 1;

  ngOnInit(): void {
    this.deltaUp = this.delta.startsWith('+') || this.delta.toLowerCase().startsWith('up');
    this.deltaDown = this.delta.startsWith('-') || this.delta.toLowerCase().startsWith('down');
    if (this.sparkline.length) {
      this.sparklineMax = Math.max(...this.sparkline, 1);
    }
    if (!this.sparkline.length && !this.loading) {
      this.sparkline = Array.from({ length: 12 }, () => Math.floor(20 + Math.random() * 80));
      this.sparklineMax = Math.max(...this.sparkline, 1);
    }
  }
}
