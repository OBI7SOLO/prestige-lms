import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentService, Student } from '../../services/student.service';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';

const SALONS = ['Salon A', 'Salon B', 'Salon C', 'Salon D'] as const;
const ENGLISH_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1'] as const;
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
              <div *ngIf="submitted && !formData.email" class="text-red-600 text-sm mt-1">
                Email is required
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">English Level</label>
              <select
                [(ngModel)]="formData.englishLevel"
                name="englishLevel"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              >
                <option value="" disabled>Select a level</option>
                <option *ngFor="let level of englishLevels" [value]="level">{{ level }}</option>
              </select>
              <div *ngIf="submitted && !formData.englishLevel" class="text-red-600 text-sm mt-1">
                Level is required
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Shift</label>
              <select
                [(ngModel)]="formData.shift"
                name="shift"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              >
                <option value="" disabled>Select a shift</option>
                <option *ngFor="let shift of shifts" [value]="shift">{{ shift }}</option>
              </select>
              <div *ngIf="submitted && !formData.shift" class="text-red-600 text-sm mt-1">
                Shift is required
              </div>
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
          <div *ngIf="!editingId" class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="createAccount"
              [(ngModel)]="createAccount"
              name="createAccount"
            />
            <label for="createAccount" class="text-sm text-slate-700"
              >Create platform account for this student</label
            >
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
                  <p class="text-sm text-slate-600">{{ student.email }}</p>
                  <div class="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    <span
                      class="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100"
                      >Level: {{ student.englishLevel || 'Unassigned' }}</span
                    >
                    <span
                      class="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"
                      >Shift: {{ student.shift || 'Unassigned' }}</span
                    >
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
  private authService = inject(AuthService);

  salons = SALONS;
  englishLevels = ENGLISH_LEVELS;
  shifts = SHIFTS;
  students$: Observable<Student[]> | undefined;
  showForm = false;
  editingId: string | null = null;
  formData: Partial<Student> = {};
  submitted = false;
  createAccount = false;

  ngOnInit() {
    console.log('[DEBUG] StudentManagement ngOnInit');
    // assign observable for template
    this.students$ = this.studentService.getStudents();
    // also subscribe explicitly to capture and log any errors from Firestore
    this.studentService.getStudents().subscribe({
      next: (d) => {
        console.log('[DEBUG] students received', d);
      },
      error: (err) => console.error('[DEBUG] error fetching students', err),
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  resetForm() {
    console.log('[DEBUG] resetForm called');
    this.formData = {};
    this.editingId = null;
  }

  editStudent(student: Student) {
    this.formData = { ...student };
    this.editingId = student.id!;
    this.showForm = true;
  }

  private generatePassword(len = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let out = '';
    for (let i = 0; i < len; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return out;
  }

  async saveStudent() {
    this.submitted = true;
    if (
      !this.formData.firstName ||
      !this.formData.lastName ||
      !this.formData.email ||
      !this.formData.englishLevel ||
      !this.formData.shift
    ) {
      // Validation messages are shown inline
      return;
    }

    try {
      if (this.editingId) {
        await this.studentService.updateStudent(this.editingId, this.formData);
        alert('Student updated successfully');
      } else {
        // Create account and link by uid if requested
        if (this.createAccount) {
          const password = this.generatePassword(10);
          // Create Firebase Auth user and users/{uid} doc with profile
          const profile = {
            firstName: this.formData.firstName,
            lastName: this.formData.lastName,
            englishLevel: this.formData.englishLevel,
            shift: this.formData.shift,
          };
          const uid = await this.authService.register(
            this.formData.email!,
            password,
            'student',
            profile,
          );
          // Create students/{uid}
          await this.studentService.addStudentWithUid(uid, { ...this.formData, id: uid });
          alert(`Student and account created. Password: ${password}`);
        } else {
          const newId = await this.studentService.addStudent(this.formData);
          console.log('[DEBUG] addStudent returned id', newId);
          alert('Student added successfully');
        }
      }

      this.resetForm();
      this.submitted = false;
      this.showForm = false;
      // refresh list
      this.students$ = this.studentService.getStudents();
      console.log('[DEBUG] refreshed students$ observable');
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
