import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      <!-- Decoración de estrellas y bandera de fondo -->
      <div
        class="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-900 opacity-10 blur-2xl"
      ></div>
      <div
        class="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-red-600 opacity-10 blur-2xl"
      ></div>

      <div class="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
        <!-- Espacio para el logo -->
        <img
          src="/logo.png"
          alt="Prestige English Institute Logo"
          class="h-40 w-auto mb-4 drop-shadow-md"
          onerror="this.onerror=null; this.style.display='none'"
        />

        <h2 class="mt-2 text-center text-3xl font-extrabold text-[#0a3161]">Sign in to Prestige</h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <!-- Contenedor principal con borde superior rojo (estilo bandera) -->
        <div
          class="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-xl sm:px-10 border-t-4 border-[#b31942]"
        >
          <div class="flex rounded-lg bg-slate-100 p-1 mb-6">
            <button
              type="button"
              (click)="setMode('login')"
              [class]="mode === 'login' ? activeTabClass : inactiveTabClass"
              class="flex-1 rounded-md px-3 py-2 text-sm font-semibold transition"
            >
              Sign in
            </button>
            <button
              type="button"
              (click)="setMode('register')"
              [class]="mode === 'register' ? activeTabClass : inactiveTabClass"
              class="flex-1 rounded-md px-3 py-2 text-sm font-semibold transition"
            >
              Create account
            </button>
          </div>

          <form class="space-y-6" (ngSubmit)="mode === 'login' ? onSubmit() : onRegister()">
            <div *ngIf="errorMessage" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
              <div class="flex">
                <div class="flex-shrink-0">
                  <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd"
                    />
                  </svg>
                </div>
                <div class="ml-3 text-sm text-red-700">
                  <p>{{ errorMessage }}</p>
                </div>
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-slate-700"
                >Email address</label
              >
              <div class="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autocomplete="email"
                  required
                  [(ngModel)]="email"
                  class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-medium text-slate-700"
                >Password</label
              >
              <div class="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autocomplete="current-password"
                  required
                  [(ngModel)]="password"
                  class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div *ngIf="mode === 'register'">
              <label for="role" class="block text-sm font-medium text-slate-700">Role</label>
              <div class="mt-1">
                <select
                  id="role"
                  name="role"
                  [(ngModel)]="role"
                  class="appearance-none block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              <p class="mt-2 text-xs text-slate-500">
                Admin accounts are assigned by a current admin from Firebase/Firestore.
              </p>
            </div>

            <div>
              <button
                type="submit"
                [disabled]="isLoading"
                class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-md text-sm font-bold text-white bg-[#0a3161] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b31942] transition-colors disabled:opacity-50"
              >
                {{
                  isLoading
                    ? mode === 'login'
                      ? 'Signing in...'
                      : 'Creating account...'
                    : mode === 'login'
                      ? 'Sign in'
                      : 'Create account'
                }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  mode: 'login' | 'register' = 'login';
  email = '';
  password = '';
  role: 'student' | 'teacher' = 'student';
  errorMessage = '';
  isLoading = false;
  activeTabClass = 'bg-white text-[#0a3161] shadow-sm border border-slate-200';
  inactiveTabClass = 'text-slate-600 hover:text-slate-900';

  setMode(mode: 'login' | 'register') {
    this.mode = mode;
    this.errorMessage = '';
  }

  async onSubmit() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Login failed. Please verify your credentials.';
    } finally {
      this.isLoading = false;
    }
  }

  async onRegister() {
    if (!this.email || !this.password) return;

    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.register(this.email, this.password, this.role);
      this.router.navigate(['/dashboard']);
    } catch (error: any) {
      this.errorMessage = error.message || 'Account creation failed.';
    } finally {
      this.isLoading = false;
    }
  }
}
