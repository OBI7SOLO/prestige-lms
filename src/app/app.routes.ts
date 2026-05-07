import { Routes } from '@angular/router';
import { Dashboard } from './components/dashboard/dashboard';
import { Login } from './components/login/login';
import { authGuard } from './guards/auth.guard';
import { Attendance } from './components/attendance/attendance';
import { TasksComponent } from './components/tasks/tasks';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard],
    children: [
      { path: 'attendance', component: Attendance },
      { path: 'tasks', component: TasksComponent },
    ],
  },
];
