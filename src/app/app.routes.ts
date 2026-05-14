import { inject } from '@angular/core';
import { CanActivateFn, Router, Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Login } from './components/login/login';
import { authGuard } from './guards/auth.guard';
import { Attendance } from './components/attendance/attendance';
import { TasksComponent } from './components/tasks/tasks';
import { PaymentsComponent } from './components/payments/payments';
import { NotFoundComponent } from './components/not-found/not-found';
import { GradesComponent } from './components/grades/grades';
import { StudentManagementComponent } from './components/student-management/student-management';
import { TaskManagementComponent } from './components/task-management/task-management';
import { GradesManagementComponent } from './components/grades-management/grades-management';
import { AttendanceManagementComponent } from './components/attendance-management/attendance-management';
import { AuthService } from './services/auth.service';
import { map, take } from 'rxjs/operators';

const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      if (user?.role === 'admin') {
        return true;
      }

      return router.createUrlTree(['/dashboard']);
    }),
  );
};

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: 'attendance', component: Attendance },
      { path: 'grades', component: GradesComponent },
      { path: 'tasks', component: TasksComponent },
      { path: 'payments', component: PaymentsComponent },
      {
        path: 'manage/students',
        component: StudentManagementComponent,
        canActivate: [adminGuard],
      },
      { path: 'manage/tasks', component: TaskManagementComponent, canActivate: [adminGuard] },
      {
        path: 'manage/grades',
        component: GradesManagementComponent,
        canActivate: [adminGuard],
      },
      {
        path: 'manage/attendance',
        component: AttendanceManagementComponent,
        canActivate: [adminGuard],
      },
    ],
  },
  { path: '**', component: NotFoundComponent },
];
