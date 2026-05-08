import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TaskService, Task } from '../../services/task.service';
import { AcademicService, SkillPerformance } from '../../services/academic.service';
import { PaymentService } from '../../services/payment.service';
import { Observable, filter, switchMap } from 'rxjs';

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
            routerLink="/dashboard/tasks"
            routerLinkActive="bg-slate-800 text-white"
            class="block px-4 py-2.5 rounded transition hover:bg-slate-800 text-slate-300 hover:text-white"
            >Tasks</a
          >
          <a
            routerLink="/dashboard/payments"
            routerLinkActive="bg-slate-800 text-white"
            class="block px-4 py-2.5 rounded transition hover:bg-slate-800 text-slate-300 hover:text-white"
            >Finances</a
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
            <span class="text-gray-700 font-medium text-sm" *ngIf="user$ | async as user"
              >{{ user.email }} ({{ user.role }})</span
            >
            <div
              class="w-10 h-10 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden"
              (click)="logout()"
              title="Logout"
            >
              <svg
                class="w-5 h-5 text-slate-600 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
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
                  routerLink="/dashboard/payments"
                  class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition"
                >
                  Make Payment
                </button>
                <button
                  routerLink="/dashboard/attendance"
                  class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition"
                >
                  Mark Attendance
                </button>
              </div>
            </div>

            <!-- Only show default home cards when exactly at /dashboard -->
            <div *ngIf="isHomeRoute()">
              <!-- Admin Global Financial Widget -->
              <div *ngIf="(user$ | async)?.role === 'admin'" class="mb-8">
                <div class="bg-indigo-900 rounded-xl shadow-md overflow-hidden text-white p-6">
                  <h2 class="text-xl font-bold mb-4 flex items-center">
                    <svg
                      class="w-6 h-6 mr-2 opacity-80"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    Executive Summary
                  </h2>
                  <div
                    class="grid grid-cols-1 md:grid-cols-2 gap-6"
                    *ngIf="adminStats$ | async as stats"
                  >
                    <div class="bg-indigo-800/50 p-4 rounded-lg border border-indigo-700/50">
                      <p class="text-indigo-200 text-sm font-medium mb-1">Total Revenue</p>
                      <p class="text-3xl font-bold">{{ stats.totalRevenue | currency }}</p>
                    </div>
                    <div class="bg-indigo-800/50 p-4 rounded-lg border border-indigo-700/50">
                      <p class="text-indigo-200 text-sm font-medium mb-1">Pending Payments</p>
                      <p class="text-3xl font-bold">{{ stats.pendingPayments }} Students</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Performance Overview -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                  <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                    Performance Overview
                  </h3>
                  <div
                    class="space-y-4 mt-2"
                    *ngIf="performance$ | async as performanceList; else noPerf"
                  >
                    <div *ngFor="let item of performanceList">
                      <div class="flex justify-between text-sm font-medium text-slate-700 mb-1">
                        <span>{{ item.skill }}</span>
                        <span>{{ item.average }}%</span>
                      </div>
                      <div class="w-full bg-slate-200 rounded-full h-2.5">
                        <div
                          class="bg-blue-600 h-2.5 rounded-full"
                          [style.width.%]="item.average"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <ng-template #noPerf>
                    <p class="text-gray-500 text-sm py-2">Loading performance data...</p>
                  </ng-template>
                </div>

                <!-- Pending Tasks -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col">
                  <h3 class="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                    Recent Tasks
                  </h3>
                  <div class="space-y-4" *ngIf="tasks$ | async as tasks; else noTasks">
                    <div *ngIf="tasks.length === 0" class="text-gray-500 text-sm">
                      No tasks found.
                    </div>
                    <div
                      *ngFor="let task of tasks | slice: 0 : 4"
                      class="flex justify-between items-center p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition cursor-pointer"
                      routerLink="/dashboard/tasks"
                    >
                      <div>
                        <p class="font-medium text-slate-800 text-sm">{{ task.title }}</p>
                        <p class="text-xs text-slate-500 mt-0.5">
                          Due: {{ task.dueDate | date: 'shortDate' }}
                        </p>
                      </div>
                      <span
                        class="px-2.5 py-1 text-xs font-semibold rounded-full"
                        [ngClass]="
                          isLate(task.dueDate)
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        "
                      >
                        {{ isLate(task.dueDate) ? 'Late' : 'Pending' }}
                      </span>
                    </div>
                  </div>
                  <ng-template #noTasks>
                    <p class="text-gray-500 text-sm py-2">Loading tasks...</p>
                  </ng-template>
                  <a
                    routerLink="/dashboard/tasks"
                    class="mt-auto pt-4 text-blue-600 text-sm font-medium hover:underline"
                    >View all tasks &rarr;</a
                  >
                </div>
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
export class Dashboard implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private academicService = inject(AcademicService);
  private paymentService = inject(PaymentService);

  user$ = this.authService.user$;
  tasks$: Observable<Task[]> | undefined;
  performance$: Observable<SkillPerformance[]> | undefined;
  adminStats$: Observable<{ totalRevenue: number; pendingPayments: number }> | undefined;

  ngOnInit() {
    this.tasks$ = this.taskService.getTasks();

    this.performance$ = this.user$.pipe(
      filter((user) => !!user),
      switchMap((user) => this.academicService.getStudentPerformance(user!.uid)),
    );

    this.adminStats$ = this.paymentService.getAdminGlobalStats();
  }

  isHomeRoute(): boolean {
    return this.router.url === '/dashboard';
  }

  isLate(dueDate: string): boolean {
    return new Date() > new Date(dueDate);
  }

  logout() {
    this.authService.logout().then(() => this.router.navigate(['/login']));
  }
}
