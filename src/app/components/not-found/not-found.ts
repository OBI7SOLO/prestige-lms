import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex items-center justify-center min-vh-100 h-screen bg-gray-50">
      <div class="text-center p-8 bg-white rounded-xl shadow-lg max-w-sm w-full">
        <h1 class="text-6xl font-bold text-slate-800 mb-4">404</h1>
        <p class="text-xl pl-2 pr-2 text-gray-600 mb-8 border-l-4 border-indigo-500">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <a
          routerLink="/dashboard"
          class="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-md transition"
        >
          Return Home
        </a>
      </div>
    </div>
  `,
  styles: ``,
})
export class NotFoundComponent {}
