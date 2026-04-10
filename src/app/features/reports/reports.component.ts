import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="space-y-6">
      <router-outlet />
    </div>
  `
})
export class ReportsComponent {}
