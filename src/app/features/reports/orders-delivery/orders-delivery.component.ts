import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { KpiCardComponent } from '../../../shared/components/kpi-card/kpi-card.component';
import { ExportButtonComponent } from '../../../shared/components/export-button/export-button.component';
import { ReportHeaderComponent } from '../../../shared/components/report-header/report-header.component';

interface Order { id: number; orderId: string; userName: string; mobile: string; productName: string; sku: string; weight: number; metalType: string; rate: number; shipping: number; status: string; createdAt: string; }

@Component({
  selector: 'app-orders-delivery',
  standalone: true,
  imports: [CommonModule, FormsModule, KpiCardComponent, ExportButtonComponent, ReportHeaderComponent],
  template: `
    <div class="space-y-6">
      <app-report-header title="Orders &amp; Delivery" description="Order status funnel, product-wise breakdown, and shipping" iconText="O" iconBgClass="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <app-kpi-card label="Total Orders" [value]="fN(allData.length)" delta="+9%" icon="O" iconBgClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" sparklineColor="bg-blue-400" />
        <app-kpi-card label="Delivered" [value]="fN(delivered)" delta="+14%" icon="D" iconBgClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" sparklineColor="bg-emerald-400" />
        <app-kpi-card label="Shipped" [value]="fN(shipped)" icon="S" iconBgClass="bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400" sparklineColor="bg-violet-400" />
        <app-kpi-card label="Cancelled" [value]="fN(cancelled)" delta="-5%" icon="X" iconBgClass="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" sparklineColor="bg-red-400" />
        <app-kpi-card label="Shipping Collected" [value]="fC(totalShipping)" icon="₹" iconBgClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" sparklineColor="bg-amber-400" />
      </div>
      <!-- Funnel -->
      <div class="card"><h3 class="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Order Status Funnel</h3>
        <div class="space-y-2">
          @for (s of funnel; track s.label) {
            <div class="flex items-center gap-3"><div class="w-24 text-xs font-medium text-slate-500 text-right">{{ s.label }}</div>
              <div class="flex-1 h-7 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden"><div class="h-full rounded-full flex items-center pl-3 text-[10px] text-white font-bold transition-all duration-700" [ngClass]="s.color" [style.width.%]="s.pct">{{ s.count }}</div></div>
              <div class="w-12 text-right text-xs text-slate-400">{{ s.pct }}%</div></div>
          }
        </div>
      </div>
      <!-- Filters + Rows -->
      <div class="card p-3"><div class="flex items-center gap-3">
        <div class="relative flex-1 max-w-xs"><svg class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input [(ngModel)]="search" (ngModelChange)="page=1" class="w-full border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl pl-10 pr-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-gold-500/40" placeholder="Search order, user..." /></div>
        <select [(ngModel)]="statusFilter" (ngModelChange)="page=1" class="border border-slate-200 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 min-w-[130px]">
          <option value="">All Status</option><option value="Generated">Generated</option><option value="Confirmed">Confirmed</option><option value="Shipped">Shipped</option><option value="Delivered">Delivered</option><option value="Cancelled">Cancelled</option></select>
        <app-export-button [data]="expD()" filename="orders" title="Orders Report" [columns]="eCols" />
      </div></div>
      <div class="space-y-2">
        @for (o of pag(); track o.id; let i = $index) {
          <div class="card p-4 animate-fade-in-up" [style.animation-delay.ms]="i*25"><div class="flex items-center gap-0">
            <div class="w-[200px] flex-shrink-0 min-w-0"><div class="text-sm font-semibold text-slate-800 dark:text-white truncate">{{ o.userName }}</div><div class="text-[11px] text-slate-400 truncate">{{ o.orderId }}</div></div>
            <div class="w-[180px] flex-shrink-0 min-w-0"><div class="text-[12px] font-medium text-slate-700 dark:text-slate-200 truncate">{{ o.productName }}</div><div class="text-[10px] text-slate-400">{{ o.sku }} &middot; {{ o.weight }}g</div></div>
            <div class="w-[80px] text-center flex-shrink-0"><span class="badge text-[10px]" [ngClass]="o.metalType==='gold'?'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400':'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'">{{ o.metalType }}</span></div>
            <div class="w-[90px] text-right flex-shrink-0"><div class="text-sm font-bold text-slate-800 dark:text-white">{{ fC(o.rate) }}</div><div class="text-[10px] text-slate-400">Ship: {{ fC(o.shipping) }}</div></div>
            <div class="flex-1 px-4 text-center"><div class="text-[11px] text-slate-500">{{ fD(o.createdAt) }}</div></div>
            <div class="w-[90px] text-center flex-shrink-0"><span class="badge text-[10px]" [ngClass]="statusClass(o.status)">{{ o.status }}</span></div>
          </div></div>
        }
      </div>
      @if (fil().length>pageSize){<div class="flex items-center justify-between text-sm"><span class="text-xs text-slate-400">{{ (page-1)*pageSize+1 }}-{{ min(page*pageSize,fil().length) }} of {{ fil().length }}</span><div class="flex gap-1"><button (click)="page=page-1" [disabled]="page===1" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg></button><button (click)="page=page+1" [disabled]="page>=Math.ceil(fil().length/pageSize)" class="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50"><svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></button></div></div>}
    </div>
  `
})
export class OrdersDeliveryComponent implements OnInit {
  allData: Order[] = []; search=''; statusFilter=''; page=1; pageSize=20; Math=Math;
  delivered=0;shipped=0;cancelled=0;totalShipping=0;
  funnel:{label:string;count:number;pct:number;color:string}[]=[];
  eCols=[{key:'orderId',label:'Order ID'},{key:'userName',label:'User'},{key:'productName',label:'Product'},{key:'weight',label:'Weight(g)'},{key:'metalType',label:'Metal'},{key:'rate',label:'Rate'},{key:'shipping',label:'Shipping'},{key:'status',label:'Status'},{key:'createdAt',label:'Date'}];

  ngOnInit(){
    this.allData=this.gen(); const t=this.allData.length||1;
    this.delivered=this.allData.filter(o=>o.status==='Delivered').length;
    this.shipped=this.allData.filter(o=>o.status==='Shipped').length;
    this.cancelled=this.allData.filter(o=>o.status==='Cancelled').length;
    this.totalShipping=this.allData.reduce((s,o)=>s+o.shipping,0);
    const sts=['Generated','Confirmed','Shipped','Delivered','Cancelled'];
    const colors=['bg-slate-500','bg-blue-500','bg-violet-500','bg-emerald-500','bg-red-500'];
    this.funnel=sts.map((s,i)=>{const c=this.allData.filter(o=>o.status===s).length;return{label:s,count:c,pct:Math.round((c/t)*100),color:colors[i]};});
  }

  fil=computed(()=>{let d=this.allData;const q=this.search.toLowerCase();if(q)d=d.filter(o=>o.userName.toLowerCase().includes(q)||o.orderId.toLowerCase().includes(q)||o.productName.toLowerCase().includes(q));if(this.statusFilter)d=d.filter(o=>o.status===this.statusFilter);return d;});
  pag=computed(()=>this.fil().slice((this.page-1)*this.pageSize,this.page*this.pageSize));
  expD=computed(()=>this.fil().map(o=>({...o}))as Record<string,unknown>[]);
  min(a:number,b:number){return Math.min(a,b);}
  fN(n:number){return new Intl.NumberFormat('en-IN').format(n);}
  fC(n:number){return new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(n);}
  fD(d:string){try{return new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'2-digit'});}catch{return d;}}
  statusClass(s:string){const m:Record<string,string>={Generated:'bg-slate-100 text-slate-600',Confirmed:'bg-blue-50 text-blue-600',Shipped:'bg-violet-50 text-violet-600',Delivered:'bg-emerald-50 text-emerald-600',Cancelled:'bg-red-50 text-red-600'};return m[s]||'bg-slate-100 text-slate-600';}

  private gen():Order[]{
    const prods=[{n:'0.1g Gold Coin',s:'AU999GC001R',w:0.1,m:'gold'},{n:'1g Gold Coin',s:'AU999GC1G',w:1,m:'gold'},{n:'5g Gold Coin',s:'AU999GC5G',w:5,m:'gold'},{n:'10g Gold Coin',s:'AU999GC10G',w:10,m:'gold'},{n:'10g Silver Coin',s:'AU999SC10G',w:10,m:'silver'},{n:'50g Silver Bar',s:'AU999SB50G',w:50,m:'silver'}];
    const names=['Ayesha Khan','Omar Rashid','Fatima Siddiq','Yusuf Ali','Priya Patel','Rahul Kumar','Neha Sharma','Vikram Joshi','Sakina Noor','Deepak Verma','Meera Rao','Pooja Gupta','Arjun Singh','Kavita Shah'];
    const sts=['Generated','Generated','Confirmed','Confirmed','Shipped','Shipped','Delivered','Delivered','Delivered','Delivered','Cancelled'];
    return Array.from({length:200},(_,i)=>{const p=prods[Math.floor(Math.random()*prods.length)];return{id:100+i,orderId:`OD${Math.floor(Math.random()*99999)}${Date.now()-i*50000}`,userName:names[Math.floor(Math.random()*names.length)],mobile:'9'+Math.floor(100000000+Math.random()*900000000),productName:'Augmont '+p.n,sku:p.s,weight:p.w,metalType:p.m,rate:p.m==='gold'?Math.round(p.w*15654):Math.round(p.w*245),shipping:[0,100,200,300][Math.floor(Math.random()*4)],status:sts[Math.floor(Math.random()*sts.length)],createdAt:new Date(2025,6+Math.floor(Math.random()*10),Math.floor(Math.random()*28)+1).toISOString()};});
  }
}
