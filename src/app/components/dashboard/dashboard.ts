import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { inject } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex h-screen bg-gray-100 font-sans">
      <!-- Sidebar -->
      <aside class="hidden md:flex flex-col w-64 bg-slate-900 text-white">
        <div class="p-6 text-2xl font-bold tracking-wider border-b border-slate-800">Prestige</div>
        <nav class="flex-1 px-4 py-6 space-y-2">
          <a
            routerLink="/dashboard"
            routerLinkActive="bg-slate-800 text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="block px-4 py-2.5 rounded transition text-slate-300 hover:bg-slate-800 hover:text-white font-medium"
            >Home</a
          >
          <a
            routerLink="/dashboard/attendance"
            routerLinkActive="bg-slate-800 text-white"
            class="block px-4 py-2.5 rounded transition text-slate-300 hover:bg-slate-800 hover:text-white"
            >Attendance</a
          >
          <a
            href="#"
            class="block px-4 py-2.5 rounded transition hover:bg-slate-800 text-slate-300 hover:text-white"
            >Grades</a
          >
          <a
            href="#"
            class="block px-4 py-2.5 rounded transition hover:bg-slate-800 text-slate-300 hover:text-white"
            >Tasks</a
          >
        </nav>
      </aside>

      <!-- Main Layout -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <!-- Topbar -->
        <header
          class="flex items-center justify-between md:justify-end p-4 bg-white shadow-sm z-10"
        >
          <div class="text-xl font-bold md:hidden text-slate-900">Prestige</div>

          <div
            class="flex items-center space-x-3 cursor-pointer p-1 rounded-full hover:bg-gray-50 transition"
          >
            <span class="text-gray-700 font-medium text-sm">Anderson Losada</span>
            <div
              class="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden"
            >
              <svg class="w-6 h-6 text-slate-400 mt-2" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </header>

        <!-- Main Content -->
        <main class="flex-1 p-6 md:p-8 overflow-y-auto">
          <div class="max-w-6xl mx-auto">
            <div class="flex justify-between items-center mb-6 md:mb-8">
              <h1 class="text-2xl md:text-3xl font-semibold text-gray-800">Dashboard</h1>

              <!-- Quick Actions -->
              <div class="flex space-x-3">
                <button
                  routerLink="/dashboard/attendance"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition"
                >
                  Mark Attendance
                </button>
                <button
                  class="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition"
                >
                  Add Student
                </button>
              </div>
            </div>

            <!-- Only show default home cards when exactly at /dashboard -->
            <div
              *ngIf="isHomeRoute()"
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              <!-- Summary Card 1 -->
              <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Average Attendance
                </h3>
                <p class="text-3xl font-bold text-slate-800 mt-auto">92%</p>
              </div>

              <!-- Summary Card 2 -->
              <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Pending Tasks
                </h3>
                <p class="text-3xl font-bold text-slate-800 mt-auto">4</p>
              </div>

              <!-- Summary Card 3 -->
              <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                <h3 class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Next Payment
                </h3>
                <p class="text-3xl font-bold text-slate-800 mt-auto">$120.00</p>
              </div>
            </div>

            <!-- Nested Routes Mount Point -->
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: ``,
})
export class Dashboard {
  private router = inject(Router);

  isHomeRoute(): boolean {
    return this.router.url === '/dashboard';
  }
}
