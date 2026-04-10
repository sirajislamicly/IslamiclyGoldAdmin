import { Component, Input, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExportService } from '../../../core/services/export.service';

@Component({
  selector: 'app-export-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative">
      <button (click)="open.set(!open())"
              class="btn-ghost px-3 py-1.5 text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/>
        </svg>
        Export
      </button>
      @if (open()) {
        <div class="absolute right-0 mt-1.5 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-20 py-1.5 animate-scale-in">
          <button (click)="exportCSV()" class="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 transition-colors">
            <span class="w-6 h-6 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md flex items-center justify-center text-[10px] font-black">CSV</span>
            <span class="text-slate-700 dark:text-slate-300 font-medium">Download CSV</span>
          </button>
          <button (click)="exportExcel()" class="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 transition-colors">
            <span class="w-6 h-6 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md flex items-center justify-center text-[10px] font-black">XLS</span>
            <span class="text-slate-700 dark:text-slate-300 font-medium">Download Excel</span>
          </button>
          <button (click)="exportPDF()" class="w-full px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 transition-colors">
            <span class="w-6 h-6 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md flex items-center justify-center text-[10px] font-black">PDF</span>
            <span class="text-slate-700 dark:text-slate-300 font-medium">Print / PDF</span>
          </button>
        </div>
      }
    </div>
  `
})
export class ExportButtonComponent {
  @Input() data: Record<string, unknown>[] = [];
  @Input() filename = 'export';
  @Input() title = 'Report';
  @Input() columns?: { key: string; label: string }[];

  private exportService = inject(ExportService);
  open = signal(false);

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('app-export-button')) this.open.set(false);
  }

  exportCSV(): void { this.exportService.exportToCSV(this.data, this.filename, this.columns); this.open.set(false); }
  exportExcel(): void { this.exportService.exportToExcel(this.data, this.filename, this.columns); this.open.set(false); }
  exportPDF(): void { this.exportService.exportToPDF(this.data, this.filename, this.title, this.columns); this.open.set(false); }
}
