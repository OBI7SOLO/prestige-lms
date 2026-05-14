import { Component, inject, OnInit, signal } from '@angular/core';
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
    <div class="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      <!-- Top Navbar (USA Theme) -->
      <header class="flex items-stretch h-14 md:h-16 w-full shadow-md z-20 shrink-0">
        <!-- Left Section: Branding (Light Blue) -->
        <div
          class="flex items-center px-4 md:px-6 bg-blue-50 border-r border-blue-100 w-auto shrink-0"
        >
          <img
            src="/logo.png"
            alt="Prestige Logo"
            class="h-8 md:h-10 w-auto mr-3 hidden sm:block"
            onerror="this.onerror=null; this.style.display='none';"
          />
          <span class="text-xl font-bold tracking-wider text-blue-900">Prestige</span>
        </div>

        <!-- Middle Section: Navigation (Red) with scroll on mobile -->
        <nav
          class="flex-1 flex items-center justify-start sm:justify-center p-2 space-x-1 sm:space-x-3 bg-[#b31942] overflow-visible whitespace-nowrap scrollbar-hide shadow-inner"
        >
          <a
            routerLink="/dashboard"
            routerLinkActive="text-[#b31942] border-white border-2"
            [routerLinkActiveOptions]="{ exact: true }"
            class="px-2.5 py-1 rounded transition text-red-50 border border-transparent hover:border-red-200 font-bold text-sm tracking-wide"
            >Home</a
          >
          <a
            routerLink="/dashboard/attendance"
            routerLinkActive="text-[#b31942] border-white border-2"
            class="px-2.5 py-1 rounded transition text-red-50 border border-transparent hover:border-red-200 font-bold text-sm tracking-wide"
            >Attendance</a
          >
          <a
            routerLink="/dashboard/grades"
            routerLinkActive="text-[#b31942] border-white border-2"
            class="px-2.5 py-1 rounded transition text-red-50 border border-transparent hover:border-red-200 font-bold text-sm tracking-wide"
            >Grades</a
          >
          <a
            routerLink="/dashboard/tasks"
            routerLinkActive="text-[#b31942] border-white border-2"
            class="px-2.5 py-1 rounded transition text-red-50 border border-transparent hover:border-red-200 font-bold text-sm tracking-wide"
            >Tasks</a
          >
          <a
            routerLink="/dashboard/payments"
            routerLinkActive="text-[#b31942] border-white border-2"
            class="px-2.5 py-1 rounded transition text-red-50 border border-transparent hover:border-red-200 font-bold text-sm tracking-wide"
            >Finances</a
          >
          <div class="border-l border-red-300 h-6 mx-1"></div>
          @if (user$ | async; as user) {
            @if (canManage(user.role)) {
              <div class="relative">
                <button
                  type="button"
                  (click)="toggleManageMenu($event)"
                  aria-haspopup="menu"
                  [attr.aria-expanded]="manageMenuOpen()"
                  class="px-2.5 py-1 rounded transition text-red-50 border border-transparent hover:border-red-200 font-bold text-sm tracking-wide"
                >
                  ⚙ Manage
                </button>
                @if (manageMenuOpen()) {
                  <div
                    class="fixed inset-0 z-40"
                    aria-hidden="true"
                    (click)="closeManageMenu()"
                  ></div>
                  <div
                    class="absolute top-full left-0 mt-1 bg-white text-[#0a3161] rounded-lg shadow-2xl border-2 border-slate-300 z-50 min-w-max py-1"
                    role="menu"
                    (click)="$event.stopPropagation()"
                  >
                    <a
                      routerLink="/dashboard/manage/students"
                      (click)="closeManageMenu()"
                      class="block px-4 py-2 text-sm hover:bg-slate-100 border-b border-slate-100 font-medium"
                    >
                      Students
                    </a>
                    <a
                      routerLink="/dashboard/manage/tasks"
                      (click)="closeManageMenu()"
                      class="block px-4 py-2 text-sm hover:bg-slate-100 border-b border-slate-100 font-medium"
                    >
                      Tasks
                    </a>
                    <a
                      routerLink="/dashboard/manage/grades"
                      (click)="closeManageMenu()"
                      class="block px-4 py-2 text-sm hover:bg-slate-100 border-b border-slate-100 font-medium"
                    >
                      Grades
                    </a>
                    <a
                      routerLink="/dashboard/manage/attendance"
                      (click)="closeManageMenu()"
                      class="block px-4 py-2 text-sm hover:bg-slate-100 font-medium"
                    >
                      Attendance
                    </a>
                  </div>
                }
              </div>
            }
          }
        </nav>

        <!-- Right Section: Profile & Logout (Dark Blue with Stars) -->
        <div
          class="flex items-center px-4 bg-[#0a3161] space-x-4 relative overflow-hidden shrink-0"
        >
          <!-- Stars background pattern -->
          <div
            class="absolute inset-0 opacity-20 pointer-events-none"
            style="background-image: radial-gradient(white 1.5px, transparent 1.5px); background-size: 16px 16px;"
          ></div>

          <div class="relative z-10 flex items-center space-x-3">
            <div
              *ngIf="user$ | async as user"
              class="flex flex-col items-end text-right px-2 py-1 rounded-md border border-blue-300/40 bg-white/10"
            >
              <span class="text-white font-bold text-xs sm:text-sm leading-tight">
                {{ (user.email?.split('@') ?? ['User'])[0] }}
              </span>
              <span class="text-blue-100 text-[11px] sm:text-xs leading-tight font-semibold">
                {{ user.role | titlecase }}
              </span>
            </div>

            <div
              class="w-9 h-9 rounded-full bg-white border-[3px] border-[#b31942] flex items-center justify-center cursor-pointer shadow-sm hover:scale-105 transition-transform"
              (click)="logout()"
              title="Logout"
            >
              <svg
                class="w-4 h-4 text-[#0a3161] ml-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2.5"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                ></path>
              </svg>
            </div>

            <!-- Logo to the far right -->
            <img
              src="/logo.png"
              alt="Institute"
              class="h-9 w-auto ml-1 hidden lg:block drop-shadow-md rounded-full bg-white p-0.5"
              onerror="this.style.display='none'"
            />
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <div class="flex-1 overflow-y-auto w-full">
        <main class="p-6 md:p-8 max-w-7xl mx-auto w-full">
          <!-- Only show dashboard header if on Home route -->
          <div *ngIf="isHomeRoute()">
            <div
              class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 md:mb-8 space-y-4 sm:space-y-0"
            >
              <h1 class="text-2xl md:text-3xl font-bold text-[#0a3161]">Dashboard</h1>
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

            <!-- Top Widgets -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              <!-- Academic Performance -->
              <div
                class="bg-white border text-card-foreground shadow-sm rounded-xl p-6 relative overflow-hidden"
              >
                <div class="absolute top-0 left-0 w-1.5 h-full bg-[#b31942]"></div>
                <h3 class="font-bold leading-none tracking-tight text-lg mb-4 text-[#0a3161]">
                  Performance Overview
                </h3>

                <div *ngIf="performance$ | async as skills; else loadingSkills">
                  <div *ngIf="skills.length > 0; else noSkills" class="space-y-4">
                    <div
                      *ngFor="let skill of skills"
                      class="bg-slate-50 p-4 rounded-lg border border-slate-100 relative overflow-hidden"
                    >
                      <div class="flex justify-between items-center mb-2">
                        <span class="font-medium text-slate-800">{{ skill.skill }}</span>
                        <span
                          class="text-xs font-bold px-2 py-1 rounded-full"
                          [ngClass]="{
                            'bg-green-100 text-green-800': skill.average >= 4.0,
                            'bg-yellow-100 text-yellow-800':
                              skill.average >= 3.0 && skill.average < 4.0,
                            'bg-red-100 text-red-800': skill.average < 3.0,
                          }"
                        >
                          {{ skill.average | number: '1.1-1' }}
                        </span>
                      </div>
                      <!-- Progress Bar -->
                      <div class="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-500 ease-out"
                          [style.width.%]="(skill.average / 5) * 100"
                          [ngClass]="{
                            'bg-green-500': skill.average >= 4.0,
                            'bg-yellow-500': skill.average >= 3.0 && skill.average < 4.0,
                            'bg-red-500': skill.average < 3.0,
                          }"
                        ></div>
                      </div>
                    </div>
                  </div>
                  <ng-template #noSkills>
                    <p class="text-sm text-slate-500 italic">No academic data available yet.</p>
                  </ng-template>
                </div>
                <ng-template #loadingSkills>
                  <div class="animate-pulse flex flex-col space-y-4">
                    <div class="h-16 bg-slate-100 rounded-lg w-full"></div>
                    <div class="h-16 bg-slate-100 rounded-lg w-full"></div>
                  </div>
                </ng-template>
              </div>

              <!-- Recent Tasks -->
              <div
                class="bg-white border text-card-foreground shadow-sm rounded-xl p-6 flex flex-col relative overflow-hidden"
              >
                <div class="absolute top-0 left-0 w-1.5 h-full bg-[#0a3161]"></div>
                <h3 class="font-bold leading-none tracking-tight text-lg mb-4 text-[#0a3161]">
                  Recent Tasks
                </h3>
                <div *ngIf="tasks$ | async as tasks; else loadingTasks" class="flex-1">
                  <div *ngIf="tasks.length > 0; else noTasks" class="space-y-3">
                    <div
                      *ngFor="let task of tasks.slice(0, 4)"
                      class="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition"
                    >
                      <div class="flex justify-between items-start">
                        <div>
                          <p class="font-medium text-slate-800">{{ task.title }}</p>
                          <p class="text-xs text-slate-500 mt-1">Due: {{ task.dueDate | date }}</p>
                        </div>
                        <span
                          class="text-xs px-2 py-1 rounded font-medium"
                          [ngClass]="{
                            'bg-green-100 text-green-700': task.status === 'completed',
                            'bg-yellow-100 text-yellow-700':
                              task.status === 'pending' && !isLate(task.dueDate),
                            'bg-red-100 text-red-700':
                              task.status === 'pending' && isLate(task.dueDate),
                          }"
                        >
                          {{ task.status | titlecase }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ng-template #noTasks>
                    <p class="text-sm text-slate-500 italic">No tasks assigned yet.</p>
                  </ng-template>
                </div>
                <ng-template #loadingTasks>
                  <div class="animate-pulse flex flex-col justify-center">
                    <div class="h-12 bg-slate-100 rounded-lg w-full mb-2"></div>
                    <div class="h-12 bg-slate-100 rounded-lg w-full mb-2"></div>
                    <div class="h-12 bg-slate-100 rounded-lg w-full"></div>
                  </div>
                </ng-template>
                <a
                  routerLink="/dashboard/tasks"
                  class="mt-auto pt-4 text-[#b31942] text-sm font-bold hover:underline inline-block w-fit"
                  >View all tasks &rarr;</a
                >
              </div>
            </div>
          </div>

          <!-- Nested Routes Mount Point -->
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `,
  ],
})
export class Dashboard implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private academicService = inject(AcademicService);
  private paymentService = inject(PaymentService);

  manageMenuOpen = signal(false);
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

  toggleManageMenu(event: MouseEvent) {
    event.stopPropagation();
    this.manageMenuOpen.update((open) => !open);
  }

  closeManageMenu() {
    this.manageMenuOpen.set(false);
  }

  canManage(role: 'admin' | 'teacher' | 'student'): boolean {
    return role === 'admin' || role === 'teacher';
  }

  logout() {
    this.authService.logout().then(() => this.router.navigate(['/login']));
  }
}
