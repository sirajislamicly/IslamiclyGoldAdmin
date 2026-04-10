import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from './user.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-white">Users</h1>
        <button class="btn-primary">Export CSV</button>
      </div>

      <div class="card">
        <div class="flex flex-col md:flex-row gap-3 mb-4">
          <input [(ngModel)]="search" class="input md:max-w-xs" placeholder="Search by name or email…" />
          <select [(ngModel)]="kycFilter" class="input md:max-w-xs">
            <option value="">All KYC statuses</option>
            <option value="verified">Verified</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="text-left text-slate-500 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th class="py-3 px-2">Name</th>
                <th class="py-3 px-2">Email</th>
                <th class="py-3 px-2">User ID</th>
                <th class="py-3 px-2">KYC</th>
                <th class="py-3 px-2">Status</th>
                <th class="py-3 px-2"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of filtered()" class="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40">
                <td class="py-3 px-2 font-medium text-slate-700 dark:text-slate-200">{{ u.name }}</td>
                <td class="py-3 px-2 text-slate-600 dark:text-slate-400">{{ u.email }}</td>
                <td class="py-3 px-2 text-slate-400">{{ u.id }}</td>
                <td class="py-3 px-2">
                  <span [class]="kycClass(u.kycStatus)">{{ u.kycStatus }}</span>
                </td>
                <td class="py-3 px-2">
                  <span [class]="statusClass(u.status)">{{ u.status }}</span>
                </td>
                <td class="py-3 px-2">
                  <button (click)="selected.set(u)" class="text-gold-600 hover:underline">View</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex items-center justify-between mt-4 text-sm text-slate-500">
          <span>Showing {{ filtered().length }} of {{ users().length }}</span>
          <div class="flex gap-2">
            <button class="px-3 py-1 rounded border border-slate-300">Prev</button>
            <button class="px-3 py-1 rounded border border-slate-300">Next</button>
          </div>
        </div>
      </div>

      <div *ngIf="selected()" class="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center p-4 z-50" (click)="selected.set(null)">
        <div class="card w-full max-w-md" (click)="$event.stopPropagation()">
          <h2 class="text-lg font-semibold mb-2">{{ selected()!.name }}</h2>
          <dl class="text-sm space-y-1">
            <div><dt class="inline text-slate-500">Email:</dt> {{ selected()!.email }}</div>
            <div><dt class="inline text-slate-500">ID:</dt> {{ selected()!.id }}</div>
            <div><dt class="inline text-slate-500">KYC:</dt> {{ selected()!.kycStatus }}</div>
            <div><dt class="inline text-slate-500">Status:</dt> {{ selected()!.status }}</div>
          </dl>
          <button class="btn-primary mt-4 w-full" (click)="selected.set(null)">Close</button>
        </div>
      </div>
    </div>
  `
})
export class UsersComponent {
  search = '';
  kycFilter = '';
  selected = signal<User | null>(null);

  users = signal<User[]>([
    { id: 'U-1001', name: 'Ayesha Khan',   email: 'ayesha@example.com', kycStatus: 'verified', status: 'active' },
    { id: 'U-1002', name: 'Omar Rashid',   email: 'omar@example.com',   kycStatus: 'pending',  status: 'active' },
    { id: 'U-1003', name: 'Fatima Siddiq', email: 'fatima@example.com', kycStatus: 'verified', status: 'active' },
    { id: 'U-1004', name: 'Yusuf Ali',     email: 'yusuf@example.com',  kycStatus: 'rejected', status: 'suspended' },
    { id: 'U-1005', name: 'Zainab Noor',   email: 'zainab@example.com', kycStatus: 'verified', status: 'active' }
  ]);

  filtered = computed(() => {
    const q = this.search.toLowerCase();
    return this.users().filter(u =>
      (!q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
      (!this.kycFilter || u.kycStatus === this.kycFilter)
    );
  });

  kycClass(k: string) {
    const map: Record<string,string> = {
      verified: 'px-2 py-0.5 rounded text-xs bg-green-100 text-green-700',
      pending:  'px-2 py-0.5 rounded text-xs bg-yellow-100 text-yellow-700',
      rejected: 'px-2 py-0.5 rounded text-xs bg-red-100 text-red-700'
    };
    return map[k];
  }

  statusClass(s: string) {
    return s === 'active'
      ? 'px-2 py-0.5 rounded text-xs bg-blue-100 text-blue-700'
      : 'px-2 py-0.5 rounded text-xs bg-slate-200 text-slate-700';
  }
}
