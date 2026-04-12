import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ReportHeaderComponent } from '../../../shared/components/report-header/report-header.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-goal-reports',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ExportButtonComponent, KpiCardComponent, ReportHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-report-header title="Goal Reports" description="Goal analytics, type breakdown, and progress tracking" iconText="G" iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Goals" [value]="formatNum(totalGoals)" delta="+12%" icon="G" iconBgClass="bg-purple-50 text-purple-600" />
        <app-kpi-card label="Gold Goals" [value]="formatNum(goldGoals)" icon="Au" iconBgClass="bg-amber-50 text-amber-600" />
        <app-kpi-card label="Silver Goals" [value]="formatNum(silverGoals)" icon="Ag" iconBgClass="bg-slate-100 text-slate-600" />
        <app-kpi-card label="Total Goal Value" [value]="formatCurrency(totalValue)" delta="+22%" icon="V" iconBgClass="bg-green-50 text-green-600" />
      </div>

      <!-- Goal Type Breakdown -->
      <div class="card">
        <h3 class="font-semibold text-slate-800 dark:text-white mb-4">Goal Type Breakdown</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          @for (gt of goalTypeStats; track gt.name) {
            <div class="p-3 rounded-lg border border-slate-200 dark:border-slate-700">
              <div class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ gt.name }}</div>
              <div class="text-xl font-bold text-slate-800 dark:text-white mt-1">{{ gt.count }}</div>
              <div class="mt-2 w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                <div class="h-full bg-gold-500 rounded-full" [style.width.%]="gt.pct"></div>
              </div>
              <div class="text-xs text-slate-500 mt-1">{{ gt.pct.toFixed(1) }}% of total</div>
            </div>
          }
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-800 dark:text-white">All Goals</h3>
          <app-export-button [data]="tableData" filename="goal-report" title="Goal Report" [columns]="exportColumns" />
        </div>
        <app-data-table [columns]="columns" [data]="tableData" searchPlaceholder="Search goals..." />
      </div>
    </div>
  `
})
export class GoalReportsComponent implements OnInit {
  private api = inject(ApiService);

  totalGoals = 0;
  goldGoals = 0;
  silverGoals = 0;
  totalValue = 0;
  goalTypeStats: { name: string; count: number; pct: number }[] = [];
  tableData: Record<string, any>[] = [];

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'goalName', label: 'Goal Name' },
    { key: 'metalType', label: 'Metal', type: 'badge', badgeMap: { gold: 'bg-amber-100 text-amber-700', silver: 'bg-slate-100 text-slate-700' } },
    { key: 'sipId', label: 'SIP ID' },
    { key: 'amount', label: 'Target Amount', type: 'currency' },
    { key: 'type', label: 'Type' },
    { key: 'ts', label: 'Created', type: 'date' }
  ];

  exportColumns = this.columns.map(c => ({ key: c.key, label: c.label }));

  ngOnInit(): void {
    forkJoin({
      kpis: this.api.goalsKpis(),
      list: this.api.goalsList({ pageSize: 200 }),
      breakdown: this.api.goalsTypeBreakdown()
    }).subscribe({
      next: (res) => {
        const kpis = res.kpis || {};
        this.totalGoals = kpis.totalGoals || 0;
        this.goldGoals = kpis.goldGoals || 0;
        this.silverGoals = kpis.silverGoals || 0;
        this.totalValue = kpis.totalTargetValue || 0;
        this.goalTypeStats = (res.breakdown || []).map((b: any) => ({
          name: b.goalName,
          count: b.goalCount,
          pct: b.percentage
        }));
        this.tableData = (res.list || []).map((g: any) => ({ ...g }));
      },
      error: () => {
        this.tableData = [];
        this.goalTypeStats = [];
      }
    });
  }

  formatNum(n: number): string { return new Intl.NumberFormat('en-IN').format(n); }
  formatCurrency(n: number): string { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
}
