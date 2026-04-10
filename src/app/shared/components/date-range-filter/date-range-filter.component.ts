import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-range-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex items-center gap-0.5 bg-slate-100/80 dark:bg-slate-800/60 rounded-xl p-0.5">
        @for (preset of presets; track preset.label) {
          <button (click)="selectPreset(preset)"
                  [class]="activePreset === preset.label
                    ? 'px-3 py-1.5 text-xs font-semibold bg-white dark:bg-slate-700 text-gold-600 dark:text-gold-400 rounded-lg shadow-sm transition-all duration-200'
                    : 'px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-all duration-200'">
            {{ preset.label }}
          </button>
        }
      </div>
      <div class="flex items-center gap-1.5">
        <input type="date" [(ngModel)]="from" (ngModelChange)="emitRange()" class="input text-xs py-1.5 w-32" />
        <svg class="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/></svg>
        <input type="date" [(ngModel)]="to" (ngModelChange)="emitRange()" class="input text-xs py-1.5 w-32" />
      </div>
    </div>
  `
})
export class DateRangeFilterComponent implements OnInit {
  @Input() initialFrom = '';
  @Input() initialTo = '';
  @Output() rangeChange = new EventEmitter<{ from: string; to: string }>();

  from = '';
  to = '';
  activePreset = 'Month';

  presets = [
    { label: 'Today', days: 0 },
    { label: '7D', days: 7 },
    { label: 'Month', days: 30 },
    { label: '3M', days: 90 },
    { label: 'Year', days: 365 },
  ];

  ngOnInit(): void {
    if (this.initialFrom) {
      this.from = this.initialFrom;
      this.to = this.initialTo || this.fmt(new Date());
      this.activePreset = '';
    } else {
      this.selectPreset(this.presets[2]);
    }
  }

  selectPreset(preset: { label: string; days: number }): void {
    this.activePreset = preset.label;
    const now = new Date();
    this.to = this.fmt(now);
    if (preset.days === 0) { this.from = this.to; }
    else { const d = new Date(now); d.setDate(d.getDate() - preset.days); this.from = this.fmt(d); }
    this.emitRange();
  }

  emitRange(): void {
    this.activePreset = '';
    this.rangeChange.emit({ from: this.from, to: this.to });
  }

  private fmt(d: Date): string { return d.toISOString().split('T')[0]; }
}
