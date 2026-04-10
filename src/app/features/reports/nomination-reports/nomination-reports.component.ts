import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-nomination-reports',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ExportButtonComponent, KpiCardComponent],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="animate-fade-in">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Nomination Reports</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Nominee data, relationship breakdown, and trends</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Nominations" [value]="formatNum(totalNominations)" delta="+6.8%" icon="N" iconBgClass="bg-cyan-50 text-cyan-600" />
        <app-kpi-card label="Unique Users" [value]="formatNum(uniqueUsers)" icon="U" iconBgClass="bg-blue-50 text-blue-600" />
        <app-kpi-card label="Most Common Relation" [value]="topRelation" icon="R" iconBgClass="bg-purple-50 text-purple-600" />
        <app-kpi-card label="This Month" [value]="formatNum(thisMonth)" delta="+12%" icon="M" iconBgClass="bg-green-50 text-green-600" />
      </div>

      <!-- Relation Breakdown -->
      <div class="card">
        <h3 class="font-semibold text-slate-800 dark:text-white mb-4">Nominee Relationship Breakdown</h3>
        <div class="space-y-3">
          @for (rel of relationBreakdown; track rel.name) {
            <div class="flex items-center gap-3">
              <div class="w-24 text-sm text-slate-600 dark:text-slate-400">{{ rel.name }}</div>
              <div class="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-end pr-2 text-xs text-white font-medium"
                     [style.width.%]="rel.pct">
                  {{ rel.count }}
                </div>
              </div>
              <div class="w-12 text-right text-sm text-slate-500">{{ rel.pct.toFixed(0) }}%</div>
            </div>
          }
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-800 dark:text-white">All Nominations</h3>
          <app-export-button [data]="tableData" filename="nominations" title="Nomination Report" [columns]="exportColumns" />
        </div>
        <app-data-table [columns]="columns" [data]="tableData" searchPlaceholder="Search nominees..." />
      </div>
    </div>
  `
})
export class NominationReportsComponent implements OnInit {
  private mockData = inject(MockDataService);

  totalNominations = 0;
  uniqueUsers = 0;
  topRelation = '';
  thisMonth = 0;
  relationBreakdown: { name: string; count: number; pct: number }[] = [];
  tableData: Record<string, any>[] = [];

  columns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'uniqueId', label: 'User ID', width: '120px' },
    { key: 'nomineeName', label: 'Nominee Name' },
    { key: 'nomineeRelation', label: 'Relation', type: 'badge', badgeMap: { father: 'bg-blue-100 text-blue-700', mother: 'bg-pink-100 text-pink-700', spouse: 'bg-purple-100 text-purple-700', son: 'bg-green-100 text-green-700', daughter: 'bg-yellow-100 text-yellow-700', brother: 'bg-cyan-100 text-cyan-700', sister: 'bg-indigo-100 text-indigo-700' } },
    { key: 'nomineeMobile', label: 'Mobile' },
    { key: 'nomineeEmail', label: 'Email' },
    { key: 'ts', label: 'Created', type: 'date' }
  ];

  exportColumns = this.columns.map(c => ({ key: c.key, label: c.label }));

  ngOnInit(): void {
    const nominees = this.mockData.getNominees(80);
    this.totalNominations = nominees.length;
    this.uniqueUsers = new Set(nominees.map(n => n.uniqueId)).size;

    const now = new Date();
    this.thisMonth = nominees.filter(n => {
      const d = new Date(n.ts);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    // Relation breakdown
    const relMap = new Map<string, number>();
    nominees.forEach(n => relMap.set(n.nomineeRelation, (relMap.get(n.nomineeRelation) || 0) + 1));
    const sorted = Array.from(relMap.entries()).sort((a, b) => b[1] - a[1]);
    this.topRelation = sorted[0]?.[0] || '-';
    this.relationBreakdown = sorted.map(([name, count]) => ({
      name,
      count,
      pct: (count / this.totalNominations) * 100
    }));

    this.tableData = nominees.map(n => ({ ...n }));
  }

  formatNum(n: number): string { return new Intl.NumberFormat('en-IN').format(n); }
}
