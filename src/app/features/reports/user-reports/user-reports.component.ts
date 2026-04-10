import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { DateRangeFilterComponent } from '../../../shared/components/date-range-filter/date-range-filter.component';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { AugUser } from '../../../models/user.model';

@Component({
  selector: 'app-user-reports',
  standalone: true,
  imports: [CommonModule, DataTableComponent, ExportButtonComponent, DateRangeFilterComponent, KpiCardComponent],
  template: `
    <div class="space-y-6">
      <!-- KPI Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Users" [value]="formatNum(totalUsers)" delta="+4.2%" icon="U" iconBgClass="bg-blue-50 text-blue-600" />
        <app-kpi-card label="KYC Approved" [value]="formatNum(approvedUsers)" delta="+8.1%" icon="A" iconBgClass="bg-green-50 text-green-600" />
        <app-kpi-card label="KYC Pending" [value]="formatNum(pendingUsers)" delta="-2.3%" icon="P" iconBgClass="bg-yellow-50 text-yellow-600" />
        <app-kpi-card label="New This Month" [value]="formatNum(newUsersThisMonth)" delta="+15%" icon="N" iconBgClass="bg-purple-50 text-purple-600" />
      </div>

      <!-- User Growth Chart -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-800 dark:text-white">New Users Over Time</h3>
          <app-date-range-filter (rangeChange)="onDateChange($event)" />
        </div>
        <div class="h-48 flex items-end gap-1">
          @for (val of userGrowth; track $index) {
            <div class="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t hover:opacity-80 transition-opacity relative group"
                 [style.height.%]="val.pct">
              <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
                {{ val.count }}
              </div>
            </div>
          }
        </div>
        <div class="flex justify-between mt-2 text-xs text-slate-500">
          @for (val of userGrowth; track $index) {
            <span>{{ val.label }}</span>
          }
        </div>
      </div>

      <!-- Data Table -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-semibold text-slate-800 dark:text-white">All Users</h3>
          <app-export-button [data]="tableData" filename="user-report" title="User Report" [columns]="exportColumns" />
        </div>
        <app-data-table [columns]="columns" [data]="tableData" searchPlaceholder="Search by name, email, phone..." />
      </div>
    </div>
  `
})
export class UserReportsComponent implements OnInit {
  private mockData = inject(MockDataService);

  users: AugUser[] = [];
  tableData: Record<string, any>[] = [];
  totalUsers = 0;
  approvedUsers = 0;
  pendingUsers = 0;
  newUsersThisMonth = 0;
  userGrowth: { label: string; count: number; pct: number }[] = [];

  columns: TableColumn[] = [
    { key: 'userName', label: 'Name' },
    { key: 'mobileNumber', label: 'Mobile' },
    { key: 'userEmail', label: 'Email' },
    { key: 'kycStatus', label: 'KYC', type: 'badge', badgeMap: { approved: 'bg-green-100 text-green-700', pending: 'bg-yellow-100 text-yellow-700', rejected: 'bg-red-100 text-red-700' } },
    { key: 'userState', label: 'State' },
    { key: 'userCity', label: 'City' },
    { key: 'panNumber', label: 'PAN' },
    { key: 'createdAt', label: 'Joined', type: 'date' }
  ];

  exportColumns = this.columns.map(c => ({ key: c.key, label: c.label }));

  ngOnInit(): void {
    this.users = this.mockData.getUsers(200);
    this.totalUsers = this.users.length;
    this.approvedUsers = this.users.filter(u => u.kycStatus === 'approved').length;
    this.pendingUsers = this.users.filter(u => u.kycStatus === 'pending').length;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    this.newUsersThisMonth = this.users.filter(u => {
      const d = new Date(u.createdAt);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    }).length;

    // Build growth chart data (last 12 months)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const counts = months.map((_, i) => {
      return this.users.filter(u => new Date(u.createdAt).getMonth() === i).length;
    });
    const maxCount = Math.max(...counts, 1);
    this.userGrowth = months.map((label, i) => ({
      label,
      count: counts[i],
      pct: (counts[i] / maxCount) * 100
    }));

    this.tableData = this.users.map(u => ({ ...u }));
  }

  onDateChange(range: { from: string; to: string }): void {
    // Filter data by date range
  }

  formatNum(n: number): string {
    return new Intl.NumberFormat('en-IN').format(n);
  }
}
