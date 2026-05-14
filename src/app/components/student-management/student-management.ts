import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService, Student } from '../../services/student.service';
import { Observable } from 'rxjs';

const SALONS = ['Salon A', 'Salon B', 'Salon C', 'Salon D'] as const;
const ENGLISH_LEVELS = ['Starter', 'A1', 'A2', 'B1', 'B2', 'C1'] as const;
const SHIFTS = ['Morning', 'Afternoon', 'Evening'] as const;

@Component({
  selector: 'app-student-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-[#0a3161]">Student Management</h2>
          <p class="text-slate-500">Add, edit, or remove students from the system.</p>
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
          {{ showForm ? 'Cancel' : 'Add New Student' }}
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div *ngIf="showForm" class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-bold text-[#0a3161] mb-4">
          {{ editingId ? 'Edit Student' : 'Add New Student' }}
        </h3>
        <form (ngSubmit)="saveStudent()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700">First Name</label>
              <input
                [(ngModel)]="formData.firstName"
                name="firstName"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Last Name</label>
              <input
                [(ngModel)]="formData.lastName"
                name="lastName"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Email</label>
              <input
                [(ngModel)]="formData.email"
                name="email"
                type="email"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Group</label>
              <input
                [(ngModel)]="formData.group"
                name="group"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Salon</label>
              <select
                [(ngModel)]="formData.salon"
                name="salon"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              >
                <option value="">Select a salon</option>
                <option *ngFor="let salon of salons" [value]="salon">{{ salon }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">English Level</label>
              <select
                [(ngModel)]="formData.englishLevel"
                name="englishLevel"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              >
                <option value="">Select a level</option>
                <option *ngFor="let level of englishLevels" [value]="level">{{ level }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Shift</label>
              <select
                [(ngModel)]="formData.shift"
                name="shift"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              >
                <option value="">Select a shift</option>
                <option *ngFor="let shift of shifts" [value]="shift">{{ shift }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Characterization (Notes)</label>
            <textarea
              [(ngModel)]="formData.characterization"
              name="characterization"
              class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
              rows="3"
            ></textarea>
          </div>
          <div class="flex space-x-3">
            <button
              type="submit"
              class="px-4 py-2 bg-[#0a3161] text-white rounded-md font-medium hover:bg-blue-900 transition"
            >
              {{ editingId ? 'Update' : 'Save' }}
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

      <!-- Students List -->
      <div *ngIf="students$ | async as students" class="space-y-3">
        <div *ngIf="students.length > 0; else emptyState">
          <div class="grid gap-3">
            <div
              *ngFor="let student of students"
              class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <h4 class="font-bold text-lg text-[#0a3161]">
                    {{ student.firstName }} {{ student.lastName }}
                  </h4>
                  <p class="text-sm text-slate-600">
                    {{ student.email }} • Group:
                    <span class="font-medium">{{ student.group }}</span>
                  </p>
                  <div class="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    <span
                      class="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100"
                    >
                      Salon: {{ student.salon || 'Unassigned' }}
                    </span>
                    <span
                      class="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100"
                    >
                      Level: {{ student.englishLevel || 'Unassigned' }}
                    </span>
                    <span
                      class="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
                    >
                      Shift: {{ student.shift || 'Unassigned' }}
                    </span>
                  </div>
                  <p *ngIf="student.characterization" class="text-sm text-slate-500 mt-2">
                    {{ student.characterization }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    (click)="editStudent(student)"
                    class="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    (click)="deleteStudent(student.id!)"
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
              No students registered yet. Add one to get started!
            </p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class StudentManagementComponent implements OnInit {
  private studentService = inject(StudentService);

  salons = SALONS;
  englishLevels = ENGLISH_LEVELS;
  shifts = SHIFTS;
  students$: Observable<Student[]> | undefined;
  showForm = false;
  editingId: string | null = null;
  formData: Partial<Student> = {};

  ngOnInit() {
    this.students$ = this.studentService.getStudents();
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  resetForm() {
    this.formData = {};
    this.editingId = null;
  }

  editStudent(student: Student) {
    this.formData = { ...student };
    this.editingId = student.id!;
    this.showForm = true;
  }

  async saveStudent() {
    if (
      !this.formData.firstName ||
      !this.formData.lastName ||
      !this.formData.email ||
      !this.formData.group ||
      !this.formData.salon ||
      !this.formData.englishLevel ||
      !this.formData.shift
    ) {
      alert('Please fill all required classification fields');
      return;
    }

    try {
      if (this.editingId) {
        await this.studentService.updateStudent(this.editingId, this.formData);
        alert('Student updated successfully');
      } else {
        await this.studentService.addStudent(this.formData);
        alert('Student added successfully');
      }
      this.resetForm();
      this.showForm = false;
      this.students$ = this.studentService.getStudents();
    } catch (error) {
      alert('Error saving student: ' + error);
    }
  }

  async deleteStudent(id: string) {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.'))
      return;
    try {
      await this.studentService.deleteStudent(id);
      alert('Student deleted successfully');
      this.students$ = this.studentService.getStudents();
    } catch (error) {
      alert('Error deleting student: ' + error);
    }
  }
}
