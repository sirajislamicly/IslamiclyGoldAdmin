import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';

interface BankEntry { id:number; uid:number; userName:string; bankAccount:string; ifscCode:string; bankName:string; isActive:number; type:number; upiDetails:string|null; accountName:string; ts:string; }

@Component({
  selector: 'app-bank-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent, ExportButtonComponent],
  template: `
    <div class="space-y-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-kpi-card label="Total Accounts" [value]="fN(allData.length)" delta="+6%" icon="B" iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" sparklineColor="bg-blue-400" />
        <app-kpi-card label="Active" [value]="fN(active)" icon="A" iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Bank Transfer" [value]="fN(bankType)" icon="T" iconBgClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" sparklineColor="bg-indigo-400" />
        <app-kpi-card label="UPI Linked" [value]="fN(upiType)" icon="U" iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" sparklineColor="bg-violet-400" />
      </div>
      <!-- Top Banks -->
      <div class="card"><h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Top Banks</h3>
        <div class="space-y-2">@for(b of topBanks; track b.name){<div class="flex items-center gap-3"><div class="w-32 text-xs font-medium text-slate-500 text-right truncate">{{ b.name }}</div><div class="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-end pr-2 text-[10px] text-white font-bold" [style.width.%]="b.pct">{{ b.count }}</div></div><div class="w-10 text-right text-xs text-slate-400">{{ b.pct }}%</div></div>}</div></div>
      <!-- Filters + Rows -->
      <div class="card p-3"><div class="flex items-center gap-3">
        <div class="relative flex-1 max-w-xs"><svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input [(ngModel)]="search" (ngModelChange)="page=1" class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40" placeholder="Search name, bank, IFSC..." /></div>
        <select [(ngModel)]="typeFilter" (ngModelChange)="page=1" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[120px]"><option value="">All Types</option><option value="1">Bank</option><option value="2">UPI</option></select>
        <app-export-button [data]="expD()" filename="bank-accounts" title="Bank Accounts Report" />
      </div></div>
      <div class="space-y-2">@for(b of pag(); track b.id; let i=$index){
        <div class="card p-4 animate-fade-in-up" [style.animation-delay.ms]="i*25"><div class="flex items-center gap-0">
          <div class="w-[180px] flex-shrink-0 min-w-0"><div class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{ b.accountName }}</div><div class="text-[11px] text-slate-400">UID: {{ b.uid }}</div></div>
          <div class="w-[150px] flex-shrink-0"><div class="text-[12px] font-medium text-slate-700 dark:text-slate-200">{{ b.bankName }}</div><div class="text-[10px] text-slate-400 font-mono">{{ b.ifscCode }}</div></div>
          <div class="w-[140px] flex-shrink-0 font-mono text-[12px] text-slate-600 dark:text-slate-300">****{{ b.bankAccount.slice(-4) }}</div>
          <div class="flex-1 px-4"><span class="badge text-[10px]" [ngClass]="b.type===1?'bg-blue-50 text-blue-600':'bg-violet-50 text-violet-600'">{{ b.type===1?'Bank':'UPI' }}</span></div>
          <div class="w-[70px] text-center flex-shrink-0"><span class="badge text-[10px]" [ngClass]="b.isActive?'bg-emerald-50 text-emerald-600':'bg-slate-100 text-slate-500'">{{ b.isActive?'Active':'Inactive' }}</span></div>
          <div class="w-[90px] text-center flex-shrink-0 text-[11px] text-slate-500">{{ fD(b.ts) }}</div>
        </div></div>
      }</div>
      @if(fil().length>pageSize){<div class="flex items-center justify-between text-sm"><span class="text-xs text-slate-400">{{ (page-1)*pageSize+1 }}-{{ min(page*pageSize,fil().length) }} of {{ fil().length }}</span><div class="flex gap-1"><button (click)="page=page-1" [disabled]="page===1" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button><button (click)="page=page+1" [disabled]="page>=Math.ceil(fil().length/pageSize)" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button></div></div>}
    </div>
  `
})
export class BankAccountsComponent implements OnInit {
  allData: BankEntry[] = []; search=''; typeFilter=''; page=1; pageSize=20; Math=Math;
  active=0; bankType=0; upiType=0; topBanks:{name:string;count:number;pct:number}[]=[];
  ngOnInit() {
    this.allData = this.gen(); this.active = this.allData.filter(b => b.isActive).length;
    this.bankType = this.allData.filter(b => b.type === 1).length; this.upiType = this.allData.filter(b => b.type === 2).length;
    const bankMap = new Map<string,number>(); this.allData.forEach(b => bankMap.set(b.bankName, (bankMap.get(b.bankName)||0)+1));
    const sorted = Array.from(bankMap.entries()).sort((a,b) => b[1]-a[1]).slice(0,8);
    this.topBanks = sorted.map(([name,count]) => ({name, count, pct: Math.round((count/this.allData.length)*100)}));
  }
  fil = computed(() => { let d = this.allData; const q = this.search.toLowerCase();
    if (q) d = d.filter(b => b.accountName.toLowerCase().includes(q) || b.bankName.toLowerCase().includes(q) || b.ifscCode.toLowerCase().includes(q));
    if (this.typeFilter) d = d.filter(b => String(b.type) === this.typeFilter); return d; });
  pag = computed(() => this.fil().slice((this.page-1)*this.pageSize, this.page*this.pageSize));
  expD = computed(() => this.fil().map(b => ({...b})) as Record<string,unknown>[]);
  min(a:number,b:number){return Math.min(a,b);}
  fN(n:number){return new Intl.NumberFormat('en-IN').format(n);}
  fD(d:string){try{return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'});}catch{return d;}}
  private gen(): BankEntry[] {
    const banks = ['State Bank of India','HDFC Bank','ICICI Bank','Central Bank of India','Axis Bank','Punjab National Bank','Bank of Baroda','Kotak Mahindra','Yes Bank','IndusInd Bank'];
    const names = ['Sandeep Kumar','Ayesha Khan','Rahul Sharma','Priya Patel','Mohd Irfan','Neha Gupta','Vikram Singh','Fatima Noor','Deepak Verma','Kavita Shah','Omar Rashid','Meera Rao','Yusuf Ali','Pooja Joshi','Arjun Das'];
    return Array.from({length:150},(_,i)=>({id:200+i,uid:163000+Math.floor(Math.random()*200),userName:names[Math.floor(Math.random()*names.length)],bankAccount:String(Math.floor(1000000000+Math.random()*9000000000)),ifscCode:`${['SBIN','HDFC','ICIC','CBIN','UTIB','PUNB','BARB','KKBK','YESB','INDB'][Math.floor(Math.random()*10)]}0${String(Math.floor(100000+Math.random()*900000))}`,bankName:banks[Math.floor(Math.random()*banks.length)],isActive:Math.random()>0.15?1:0,type:Math.random()>0.3?1:2,upiDetails:Math.random()>0.7?`${names[Math.floor(Math.random()*names.length)].split(' ')[0].toLowerCase()}@upi`:null,accountName:names[Math.floor(Math.random()*names.length)],ts:new Date(2025,6+Math.floor(Math.random()*10),Math.floor(Math.random()*28)+1).toISOString()}));
  }
}
