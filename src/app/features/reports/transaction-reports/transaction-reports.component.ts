import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { DateRangeFilterComponent } from '../../../shared/components/date-range-filter/date-range-filter.component';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-transaction-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent, ExportButtonComponent, DateRangeFilterComponent, KpiCardComponent],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Buy Txns" [value]="formatNum(buyCount)" delta="+8.4%" icon="B" iconBgClass="bg-green-50 text-green-600" />
        <app-kpi-card label="Total Sell Txns" [value]="formatNum(sellCount)" delta="+3.1%" icon="S" iconBgClass="bg-red-50 text-red-600" />
        <app-kpi-card label="Buy Volume" [value]="formatCurrency(buyVolume)" icon="V" iconBgClass="bg-emerald-50 text-emerald-600" />
        <app-kpi-card label="Sell Volume" [value]="formatCurrency(sellVolume)" icon="V" iconBgClass="bg-orange-50 text-orange-600" />
      </div>

      <!-- Tab Switcher -->
      <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5 w-fit">
        @for (t of ['Buy', 'Sell', 'Orders', 'Gifts']; track t) {
          <button (click)="activeTab = t"
                  [class]="activeTab === t
                    ? 'px-4 py-1.5 text-sm font-medium bg-white dark:bg-slate-600 text-gold-600 rounded-md shadow-sm'
                    : 'px-4 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 rounded-md'">
            {{ t }}
          </button>
        }
      </div>

      <div class="flex items-center gap-3 flex-wrap">
        <app-date-range-filter (rangeChange)="onDateChange($event)" />
        <select [(ngModel)]="metalFilter" (ngModelChange)="applyFilters()" class="input w-auto text-sm py-1.5">
          <option value="">All Metals</option>
          <option value="gold">Gold</option>
          <option value="silver">Silver</option>
        </select>
      </div>

      <!-- Buy Table -->
      @if (activeTab === 'Buy') {
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-800 dark:text-white">Buy Transactions</h3>
            <app-export-button [data]="filteredBuys" filename="buy-transactions" title="Buy Transactions" [columns]="buyExportCols" />
          </div>
          <app-data-table [columns]="buyColumns" [data]="filteredBuys" searchPlaceholder="Search by name, txn ID..." />
        </div>
      }

      @if (activeTab === 'Sell') {
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-800 dark:text-white">Sell Transactions</h3>
            <app-export-button [data]="filteredSells" filename="sell-transactions" title="Sell Transactions" [columns]="sellExportCols" />
          </div>
          <app-data-table [columns]="sellColumns" [data]="filteredSells" searchPlaceholder="Search by name, txn ID..." />
        </div>
      }

      @if (activeTab === 'Orders') {
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-800 dark:text-white">Redeem Orders</h3>
            <app-export-button [data]="orders" filename="orders" title="Redeem Orders" [columns]="orderExportCols" />
          </div>
          <app-data-table [columns]="orderColumns" [data]="orders" searchPlaceholder="Search orders..." />
        </div>
      }

      @if (activeTab === 'Gifts') {
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-semibold text-slate-800 dark:text-white">Gift Transactions</h3>
            <app-export-button [data]="gifts" filename="gifts" title="Gift Transactions" [columns]="giftExportCols" />
          </div>
          <app-data-table [columns]="giftColumns" [data]="gifts" searchPlaceholder="Search gifts..." />
        </div>
      }
    </div>
  `
})
export class TransactionReportsComponent implements OnInit {
  private mockData = inject(MockDataService);

  activeTab = 'Buy';
  metalFilter = '';
  buyCount = 0; sellCount = 0; buyVolume = 0; sellVolume = 0;

  allBuys: Record<string, any>[] = [];
  allSells: Record<string, any>[] = [];
  filteredBuys: Record<string, any>[] = [];
  filteredSells: Record<string, any>[] = [];
  orders: Record<string, any>[] = [];
  gifts: Record<string, any>[] = [];

  buyColumns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'userName', label: 'User' },
    { key: 'metalType', label: 'Metal', type: 'badge', badgeMap: { gold: 'bg-amber-100 text-amber-700', silver: 'bg-slate-100 text-slate-700' } },
    { key: 'quantity', label: 'Qty (g)', type: 'number' },
    { key: 'rate', label: 'Rate', type: 'currency' },
    { key: 'totalAmount', label: 'Total', type: 'currency' },
    { key: 'mobileNumber', label: 'Mobile' },
    { key: 'transactionId', label: 'Txn ID', width: '120px' },
    { key: 'ts', label: 'Date', type: 'date' }
  ];

  sellColumns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'userName', label: 'User' },
    { key: 'metalType', label: 'Metal', type: 'badge', badgeMap: { gold: 'bg-amber-100 text-amber-700', silver: 'bg-slate-100 text-slate-700' } },
    { key: 'quantity', label: 'Qty (g)', type: 'number' },
    { key: 'rate', label: 'Rate', type: 'currency' },
    { key: 'totalAmount', label: 'Total', type: 'currency' },
    { key: 'mobileNumber', label: 'Mobile' },
    { key: 'createdAt', label: 'Date', type: 'date' }
  ];

  orderColumns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'orderId', label: 'Order ID' },
    { key: 'metalType', label: 'Metal', type: 'badge', badgeMap: { gold: 'bg-amber-100 text-amber-700', silver: 'bg-slate-100 text-slate-700' } },
    { key: 'rate', label: 'Rate', type: 'currency' },
    { key: 'shippingCharges', label: 'Shipping', type: 'currency' },
    { key: 'orderStatus', label: 'Status', type: 'badge', badgeMap: { generated: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-blue-100 text-blue-700', shipped: 'bg-purple-100 text-purple-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' } },
    { key: 'createdAt', label: 'Date', type: 'date' }
  ];

  giftColumns: TableColumn[] = [
    { key: 'id', label: 'ID' },
    { key: 'senderUID', label: 'Sender UID' },
    { key: 'receiverUID', label: 'Receiver UID' },
    { key: 'amount', label: 'Amount', type: 'currency' },
    { key: 'metalType', label: 'Metal', type: 'badge', badgeMap: { gold: 'bg-amber-100 text-amber-700', silver: 'bg-slate-100 text-slate-700' } },
    { key: 'giftMessage', label: 'Message' },
    { key: 'isClaimed', label: 'Claimed', type: 'badge', badgeMap: { '1': 'bg-green-100 text-green-700', '0': 'bg-yellow-100 text-yellow-700' } },
    { key: 'ts', label: 'Date', type: 'date' }
  ];

  buyExportCols = this.buyColumns.map(c => ({ key: c.key, label: c.label }));
  sellExportCols = this.sellColumns.map(c => ({ key: c.key, label: c.label }));
  orderExportCols = this.orderColumns.map(c => ({ key: c.key, label: c.label }));
  giftExportCols = this.giftColumns.map(c => ({ key: c.key, label: c.label }));

  ngOnInit(): void {
    this.allBuys = this.mockData.getBuyTransactions(500).map(b => ({ ...b }));
    this.allSells = this.mockData.getSellTransactions(200).map(s => ({ ...s }));
    this.orders = this.mockData.getOrders(100).map(o => ({ ...o }));
    this.gifts = this.mockData.getGifts(50).map(g => ({ ...g }));

    this.buyCount = this.allBuys.length;
    this.sellCount = this.allSells.length;
    this.buyVolume = this.allBuys.reduce((s, b) => s + (b['totalAmount'] as number), 0);
    this.sellVolume = this.allSells.reduce((s, b) => s + (b['totalAmount'] as number), 0);

    this.filteredBuys = this.allBuys;
    this.filteredSells = this.allSells;
  }

  applyFilters(): void {
    this.filteredBuys = this.metalFilter ? this.allBuys.filter(b => b['metalType'] === this.metalFilter) : this.allBuys;
    this.filteredSells = this.metalFilter ? this.allSells.filter(s => s['metalType'] === this.metalFilter) : this.allSells;
  }

  onDateChange(range: { from: string; to: string }): void {
    // Filter by date range in production
  }

  formatNum(n: number): string { return new Intl.NumberFormat('en-IN').format(n); }
  formatCurrency(n: number): string { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); }
}
