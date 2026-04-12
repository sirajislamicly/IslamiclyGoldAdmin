import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { DateRangeFilterComponent } from '../../../shared/components/date-range-filter/date-range-filter.component';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ReportHeaderComponent } from '../../../shared/components/report-header/report-header.component';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-sip-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ExportButtonComponent, DateRangeFilterComponent, KpiCardComponent, ReportHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-report-header title="SIP Reports" description="SIP plans, payment schedules, and success rate analytics" iconText="S" iconBgClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <app-kpi-card label="Total SIPs Created" [value]="formatNum(totalSIPs)" delta="+18%" icon="S" iconBgClass="bg-indigo-50 text-indigo-600" />
        <app-kpi-card label="Active SIPs" [value]="formatNum(activeSIPs)" icon="A" iconBgClass="bg-green-50 text-green-600" />
        <app-kpi-card label="Payment Success" [value]="formatNum(successPayments)" delta="+15%" icon="+" iconBgClass="bg-emerald-50 text-emerald-600" />
        <app-kpi-card label="Payment Failed" [value]="formatNum(failedPayments)" delta="-5%" icon="!" iconBgClass="bg-red-50 text-red-600" />
        <app-kpi-card label="Success Rate" [value]="successRate + '%'" icon="%" iconBgClass="bg-blue-50 text-blue-600" />
      </div>

      <!-- SIP Frequency Breakdown -->
      <div class="card">
        <h3 class="font-semibold text-slate-800 dark:text-white mb-4">SIP by Frequency</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          @for (freq of freqBreakdown; track freq.name) {
            <div class="p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <div class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ freq.name }}</div>
                <div class="text-2xl font-bold text-slate-800 dark:text-white">{{ freq.count }}</div>
              </div>
              <div class="w-16 h-16 rounded-full border-4 flex items-center justify-center text-sm font-bold"
                   [ngClass]="freq.name === 'Monthly' ? 'border-blue-500 text-blue-600' : freq.name === 'Weekly' ? 'border-green-500 text-green-600' : 'border-purple-500 text-purple-600'">
                {{ freq.pct }}%
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Failure Analysis -->
      <div class="card">
        <h3 class="font-semibold text-slate-800 dark:text-white mb-4">Payment Status Breakdown</h3>
        <div class="flex items-center gap-2 h-8 rounded-full overflow-hidden">
          <div class="h-full bg-green-500 flex items-center justify-center text-xs text-white font-medium" [style.width.%]="successRate">
            {{ successRate }}% Success
          </div>
          <div class="h-full bg-red-500 flex items-center justify-center text-xs text-white font-medium" [style.width.%]="failedRate">
            {{ failedRate }}% Failed
          </div>
          <div class="h-full bg-yellow-500 flex items-center justify-center text-xs text-white font-medium" [style.width.%]="pendingRate">
            {{ pendingRate }}% Pending
          </div>
        </div>
      </div>

      <!-- Tab Switcher -->
      <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 w-fit">
        @for (t of ['SIP Plans', 'Payment Schedule']; track t) {
          <button (click)="activeTab = t"
                  [class]="activeTab === t
                    ? 'px-4 py-1.5 text-sm font-medium bg-white dark:bg-slate-600 text-gold-600 rounded-md shadow-sm'
                    : 'px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 rounded-md'">
            {{ t }}
          </button>
        }
      </div>

      @if (activeTab === 'SIP Plans') {
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-800 dark:text-white">All SIP Plans</h3>
            <app-export-button [data]="sipData" filename="sip-plans" title="SIP Plans Report" [columns]="sipExportCols" />
          </div>
          <app-data-table [columns]="sipColumns" [data]="sipData" searchPlaceholder="Search SIPs..." />
        </div>
      }

      @if (activeTab === 'Payment Schedule') {
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <h3 class="font-semibold text-slate-800 dark:text-white">Payment Schedules</h3>
              <select [(ngModel)]="statusFilter" (ngModelChange)="filterSchedules()" class="input w-auto text-sm py-1">
                <option value="">All Statuses</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <app-export-button [data]="filteredSchedules" filename="sip-schedules" title="SIP Payment Schedules" [columns]="scheduleExportCols" />
          </div>
          <app-data-table [columns]="scheduleColumns" [data]="filteredSchedules" searchPlaceholder="Search schedules..." />
        </div>
      }
    </div>
  `
})
export class SipReportsComponent implements OnInit {
  private api = inject(ApiService);

  activeTab = 'SIP Plans';
  statusFilter = '';

  totalSIPs = 0; activeSIPs = 0;
  successPayments = 0; failedPayments = 0; pendingPayments = 0;
  successRate = 0; failedRate = 0; pendingRate = 0;
  freqBreakdown: { name: string; count: number; pct: number }[] = [];

  sipData: Record<string, any>[] = [];
  allSchedules: Record<string, any>[] = [];
  filteredSchedules: Record<string, any>[] = [];

  sipColumns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'sipName', label: 'Name' },
    { key: 'sipAmount', label: 'Amount', type: 'currency' },
    { key: 'sipFrequency', label: 'Frequency', type: 'badge', badgeMap: { daily: 'bg-purple-100 text-purple-700', weekly: 'bg-blue-100 text-blue-700', monthly: 'bg-green-100 text-green-700' } },
    { key: 'metalType', label: 'Metal', type: 'badge', badgeMap: { gold: 'bg-amber-100 text-amber-700', silver: 'bg-slate-100 text-slate-700' } },
    { key: 'paymentMode', label: 'Payment Mode' },
    { key: 'startDate', label: 'Start', type: 'date' },
    { key: 'endDate', label: 'End', type: 'date' },
    { key: 'duration', label: 'Duration' }
  ];

  scheduleColumns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'sipId', label: 'SIP ID' },
    { key: 'installmentNumber', label: 'Installment #' },
    { key: 'amount', label: 'Amount', type: 'currency' },
    { key: 'scheduleDate', label: 'Scheduled', type: 'date' },
    { key: 'paymentStatus', label: 'Status', type: 'badge', badgeMap: { success: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-700', pending: 'bg-yellow-100 text-yellow-700' } },
    { key: 'ts', label: 'Created', type: 'date' }
  ];

  sipExportCols = this.sipColumns.map(c => ({ key: c.key, label: c.label }));
  scheduleExportCols = this.scheduleColumns.map(c => ({ key: c.key, label: c.label }));

  ngOnInit(): void {
    forkJoin({
      kpis: this.api.sipKpis(),
      plans: this.api.sipPlans({ pageSize: 200 }),
      schedules: this.api.sipPaymentSchedules({ pageSize: 500 }),
      freq: this.api.sipFrequencyBreakdown()
    }).subscribe({
      next: (res) => {
        const kpis = res.kpis || {};
        this.totalSIPs = kpis.totalSIPs || 0;
        this.activeSIPs = kpis.activeSIPs || 0;
        this.successPayments = kpis.successPayments || 0;
        this.failedPayments = kpis.failedPayments || 0;
        this.pendingPayments = kpis.pendingPayments || 0;

        const totalWithStatus = this.successPayments + this.failedPayments + this.pendingPayments || 1;
        this.successRate = Math.round((this.successPayments / totalWithStatus) * 100);
        this.failedRate = Math.round((this.failedPayments / totalWithStatus) * 100);
        this.pendingRate = 100 - this.successRate - this.failedRate;

        this.freqBreakdown = (res.freq || []).map((f: any) => ({
          name: f.frequency,
          count: f.sipCount,
          pct: Math.round(f.percentage)
        }));

        this.sipData = (res.plans || []).map((p: any) => ({
          ...p,
          sipName: p.siP_Name,
          sipAmount: p.siP_Amount,
          sipFrequency: p.siP_Frequency
        }));
        this.allSchedules = (res.schedules || []).map((s: any) => ({ ...s }));
        this.filteredSchedules = this.allSchedules;
      },
      error: () => {
        this.sipData = [];
        this.allSchedules = [];
        this.filteredSchedules = [];
        this.freqBreakdown = [];
      }
    });
  }

  filterSchedules(): void {
    this.filteredSchedules = this.statusFilter
      ? this.allSchedules.filter(s => s['paymentStatus'] === this.statusFilter)
      : this.allSchedules;
  }

  formatNum(n: number): string { return new Intl.NumberFormat('en-IN').format(n); }
}
