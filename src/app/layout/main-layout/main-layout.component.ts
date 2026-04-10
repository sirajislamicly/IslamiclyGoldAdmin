import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NavbarComponent],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-50/50 dark:bg-slate-950">
      <app-sidebar />
      <div class="flex-1 flex flex-col overflow-hidden min-w-0">
        <app-navbar />
        <main class="flex-1 overflow-y-auto">
          <div class="p-6 max-w-[1600px] mx-auto">
            <router-outlet />
          </div>
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {}
