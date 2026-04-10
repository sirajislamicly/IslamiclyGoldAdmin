import { Component, computed, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Transaction } from './transaction.service';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, CurrencyPipe],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Transactions</h1>

      <div class="card">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input type="date" [(ngModel)]="from" class="input" />
          <input type="date" [(ngModel)]="to" class="input" />
          <select [(ngModel)]="metal" class="input">
            <option value="">All metals</option>
            <option value="gold">Gold</option>
            <option value="silver">Silver</option>
          </select>
          <select [(ngModel)]="type" class="input">
            <option value="">All types</option>
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="py-3 px-2">ID</th>
                <th class="py-3 px-2">Type</th>
                <th class="py-3 px-2">Metal</th>
                <th class="py-3 px-2">Quantity</th>
                <th class="py-3 px-2">Amount</th>
                <th class="py-3 px-2">Date</th>
                <th class="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let t of filtered()" class="border-b border-slate-100 dark:border-slate-700">
                <td class="py-3 px-2 text-slate-400">{{ t.id }}</td>
                <td class="py-3 px-2">
                  <span [class]="t.type === 'buy' ? 'text-green-600' : 'text-red-600'">{{ t.type }}</span>
                </td>
                <td class="py-3 px-2 capitalize">{{ t.metal }}</td>
                <td class="py-3 px-2">{{ t.quantity }} g</td>
                <td class="py-3 px-2">{{ t.amount | currency:'USD' }}</td>
                <td class="py-3 px-2">{{ t.date | date:'medium' }}</td>
                <td class="py-3 px-2">
                  <span [class]="statusClass(t.status)">{{ t.status }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class TransactionsComponent {
  from = ''; to = ''; metal = ''; type = '';

  txs = signal<Transaction[]>([
    { id: 'TX-9001', type: 'buy',  metal: 'gold',   quantity: 5,  amount: 340,  date: '2026-04-08T10:20:00Z', status: 'completed', user: 'U-1001' },
    { id: 'TX-9002', type: 'sell', metal: 'silver', quantity: 20, amount: 180,  date: '2026-04-09T14:05:00Z', status: 'completed', user: 'U-1003' },
    { id: 'TX-9003', type: 'buy',  metal: 'gold',   quantity: 2,  amount: 136,  date: '2026-04-09T17:45:00Z', status: 'pending',   user: 'U-1002' },
    { id: 'TX-9004', type: 'sell', metal: 'gold',   quantity: 10, amount: 680,  date: '2026-04-10T09:12:00Z', status: 'failed',    user: 'U-1004' }
  ]);

  filtered = computed(() => this.txs().filter(t =>
    (!this.metal || t.metal === this.metal) &&
    (!this.type  || t.type  === this.type)
  ));

  statusClass(s: string) {
    const map: Record<string,string> = {
      completed: 'px-2 py-0.5 rounded text-xs bg-green-100 text-green-700',
      pending:   'px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700',
      failed:    'px-2 py-0.5 rounded text-xs bg-red-100 text-red-700'
    };
    return map[s];
  }
}
