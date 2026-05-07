import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService, UserProfile } from '../../services/auth.service';
import { TaskService, Task } from '../../services/task.service';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Task Management</h2>

      <!-- Toasts -->
      <div
        *ngIf="toastMessage"
        class="fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg"
        [ngClass]="
          toastType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        "
      >
        {{ toastMessage }}
      </div>

      <ng-container *ngIf="user$ | async as user; else loading">
        <!-- TEACHER VIEW: Create Assignment Form -->
        <div *ngIf="user.role === 'teacher' || user.role === 'admin'" class="mb-10">
          <h3 class="text-lg font-medium text-slate-700 mb-4 border-b pb-2">Create New Task</h3>
          <form [formGroup]="taskForm" (ngSubmit)="createTask()" class="space-y-4 max-w-2xl">
            <div>
              <label class="block text-sm font-medium text-slate-700">Title</label>
              <input
                type="text"
                formControlName="title"
                class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Description</label>
              <textarea
                formControlName="description"
                rows="3"
                class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              ></textarea>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-700">Due Date</label>
                <input
                  type="date"
                  formControlName="dueDate"
                  class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-700">Attachment (Link)</label>
                <input
                  type="url"
                  formControlName="link"
                  placeholder="https://"
                  class="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div class="flex justify-end pt-2">
              <button
                type="submit"
                [disabled]="taskForm.invalid || isSubmitting"
                class="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {{ isSubmitting ? 'Creating...' : 'Create Task' }}
              </button>
            </div>
          </form>
        </div>

        <!-- STUDENT / GENERAL VIEW: Task List -->
        <div>
          <h3 class="text-lg font-medium text-slate-700 mb-4 border-b pb-2">
            {{ user.role === 'student' ? 'My Tasks' : 'All Assigned Tasks' }}
          </h3>

          <div *ngIf="tasks.length === 0" class="text-gray-500 text-sm py-4">No tasks found.</div>

          <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div
              *ngFor="let task of tasks"
              class="border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition bg-slate-50"
            >
              <div class="flex justify-between items-start mb-2">
                <h4 class="font-semibold text-slate-800">{{ task.title }}</h4>
                <span
                  class="px-2 py-1 text-xs font-semibold rounded-full"
                  [ngClass]="getTaskStatusClass(task.dueDate)"
                >
                  {{ getTaskStatus(task.dueDate) }}
                </span>
              </div>
              <p class="text-sm text-slate-600 mb-4">{{ task.description }}</p>

              <div class="flex items-center justify-between mt-auto">
                <div class="text-xs text-slate-500">
                  Due: <span class="font-medium">{{ task.dueDate | date }}</span>
                </div>

                <div *ngIf="user.role === 'student'">
                  <button
                    (click)="markAsDone(task, user.uid)"
                    class="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded transition"
                  >
                    Mark as Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <ng-template #loading>
        <div class="flex justify-center p-8 text-blue-600">Loading...</div>
      </ng-template>
    </div>
  `,
  styles: ``,
})
export class TasksComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private taskService = inject(TaskService);

  user$ = this.authService.user$;
  taskForm!: FormGroup;
  tasks: Task[] = [];

  isSubmitting = false;
  toastMessage = '';
  toastType: 'success' | 'error' = 'success';

  ngOnInit() {
    this.taskForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      dueDate: ['', Validators.required],
      link: [''],
      groupId: ['General'], // Simplified for MVP
    });

    this.loadTasks();
  }

  loadTasks() {
    this.taskService.getTasks().subscribe((data) => {
      this.tasks = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }

  getTaskStatus(dueDate: string): string {
    const isLate = new Date() > new Date(dueDate);
    return isLate ? 'Late' : 'Pending';
  }

  getTaskStatusClass(dueDate: string): string {
    const status = this.getTaskStatus(dueDate);
    if (status === 'Late') return 'bg-red-100 text-red-800';
    return 'bg-yellow-100 text-yellow-800';
  }

  async createTask() {
    if (this.taskForm.invalid) return;
    this.isSubmitting = true;

    try {
      const formValue = this.taskForm.value;

      // We resolve the user synchronously just for the assignment
      // (in a real app we'd take it from active state/signals directly)
      const user = await new Promise<UserProfile | null>((resolve) => {
        this.user$.subscribe((u) => resolve(u));
      });

      const newTask: Task = {
        ...formValue,
        teacherId: user?.uid || 'unknown',
        createdAt: new Date().toISOString(),
      };

      await this.taskService.createTask(newTask);
      this.showToast('Task created successfully!', 'success');
      this.taskForm.reset({ groupId: 'General' });
    } catch (err) {
      this.showToast('Failed to create task', 'error');
    } finally {
      this.isSubmitting = false;
    }
  }

  async markAsDone(task: Task, studentId: string) {
    try {
      const status = this.getTaskStatus(task.dueDate); // Can be 'Late' or 'Pending' (which maps to Submitted)
      await this.taskService.submitTask({
        taskId: task.id!,
        studentId,
        status: status === 'Late' ? 'Late' : 'Submitted',
        submittedAt: new Date().toISOString(),
      });
      this.showToast('Task submitted successfully!', 'success');
    } catch (err) {
      this.showToast('Failed to submit task', 'error');
    }
  }

  showToast(msg: string, type: 'success' | 'error') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => (this.toastMessage = ''), 3000);
  }
}
