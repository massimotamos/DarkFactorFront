import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts"
           class="toast"
           [class.error]="toast.type === 'error'"
           [class.info]="toast.type === 'info'"
           [class.success]="toast.type === 'success'">
        <span>{{ toast.message }}</span>
        <button (click)="toastService.dismiss(toast.id)" aria-label="Dismiss">✕</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container { position: fixed; bottom: 1rem; right: 1rem; z-index: 9999; display: flex; flex-direction: column; gap: 0.5rem; }
    .toast { display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem; border-radius: 4px; min-width: 300px; max-width: 500px; }
    .toast.error { background: #d32f2f; color: white; }
    .toast.info { background: #1976d2; color: white; }
    .toast.success { background: #388e3c; color: white; }
    button { background: none; border: none; color: inherit; cursor: pointer; font-size: 1rem; }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
