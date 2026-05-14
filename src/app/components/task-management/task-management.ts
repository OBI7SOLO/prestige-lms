import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService, Task } from '../../services/task.service';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-[#0a3161]">Task Management</h2>
          <p class="text-slate-500">Create, edit, or delete tasks for your students.</p>
        </div>
        <button
          (click)="toggleForm()"
          [class]="
            'px-4 py-2 rounded-md font-medium transition ' +
            (showForm
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white')
          "
        >
          {{ showForm ? 'Cancel' : 'Create Task' }}
        </button>
      </div>

      <!-- Create/Edit Form -->
      <div *ngIf="showForm" class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-bold text-[#0a3161] mb-4">
          {{ editingId ? 'Edit Task' : 'Create New Task' }}
        </h3>
        <form (ngSubmit)="saveTask()" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700">Title</label>
            <input
              [(ngModel)]="formData.title"
              name="title"
              type="text"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
              required
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              [(ngModel)]="formData.description"
              name="description"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
              rows="3"
              required
            ></textarea>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700">Due Date</label>
              <input
                [(ngModel)]="formData.dueDate"
                name="dueDate"
                type="date"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Group ID</label>
              <input
                [(ngModel)]="formData.groupId"
                name="groupId"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Link (Optional)</label>
              <input
                [(ngModel)]="formData.link"
                name="link"
                type="url"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
              />
            </div>
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="px-4 py-2 bg-[#0a3161] text-white rounded-md font-medium hover:bg-blue-900 transition"
            >
              {{ editingId ? 'Update' : 'Create' }}
            </button>
            <button
              type="button"
              (click)="resetForm()"
              class="px-4 py-2 bg-slate-300 text-slate-700 rounded-md font-medium hover:bg-slate-400 transition"
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <!-- Tasks List -->
      <div *ngIf="tasks$ | async as tasks" class="space-y-3">
        <div *ngIf="tasks.length > 0; else emptyState">
          <div class="grid gap-3">
            <div
              *ngFor="let task of tasks"
              class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <h4 class="font-bold text-lg text-[#0a3161]">{{ task.title }}</h4>
                  <p class="text-sm text-slate-600 mt-1">{{ task.description }}</p>
                  <div class="flex space-x-4 mt-2 text-sm text-slate-500">
                    <span>Due: {{ task.dueDate | date }}</span>
                    <span
                      >Group: <span class="font-medium">{{ task.groupId }}</span></span
                    >
                    <span *ngIf="task.link">
                      <a [href]="task.link" target="_blank" class="text-blue-600 hover:underline"
                        >Link</a
                      >
                    </span>
                  </div>
                </div>
                <div class="flex space-x-2">
                  <button
                    (click)="editTask(task)"
                    class="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    (click)="deleteTask(task.id!)"
                    class="px-3 py-1 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <ng-template #emptyState>
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center">
            <p class="text-slate-600 font-medium">
              No tasks created yet. Create one to get started!
            </p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class TaskManagementComponent implements OnInit {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);

  tasks$: Observable<Task[]> | undefined;
  showForm = false;
  editingId: string | null = null;
  formData: Partial<Task> = {};
  currentUser: any;

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      this.currentUser = user;
    });
    this.tasks$ = this.taskService.getTasks();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  resetForm() {
    this.formData = {};
    this.editingId = null;
  }

  editTask(task: Task) {
    this.formData = { ...task };
    this.editingId = task.id!;
    this.showForm = true;
  }

  async saveTask() {
    if (
      !this.formData.title ||
      !this.formData.description ||
      !this.formData.dueDate ||
      !this.formData.groupId
    ) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const taskData: Partial<Task> = {
        ...this.formData,
        teacherId: this.currentUser?.uid || 'unknown',
        createdAt: new Date().toISOString(),
      };

      if (this.editingId) {
        await this.taskService.updateTask(this.editingId, taskData);
        alert('Task updated successfully');
      } else {
        await this.taskService.createTask(taskData as Task);
        alert('Task created successfully');
      }
      this.resetForm();
      this.showForm = false;
      this.tasks$ = this.taskService.getTasks();
    } catch (error) {
      alert('Error saving task: ' + error);
    }
  }

  async deleteTask(id: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await this.taskService.deleteTask(id);
      alert('Task deleted successfully');
      this.tasks$ = this.taskService.getTasks();
    } catch (error) {
      alert('Error deleting task: ' + error);
    }
  }
}
