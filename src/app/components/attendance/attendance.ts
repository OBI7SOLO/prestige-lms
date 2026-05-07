import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { StudentService, Student } from '../../services/student.service';
import { AuthService } from '../../services/auth.service';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 class="text-2xl font-semibold text-gray-800 mb-6">Mark Attendance</h2>

      <div *ngIf="isLoading" class="flex justify-center items-center py-12">
        <svg
          class="animate-spin h-8 w-8 text-blue-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </div>

      <div *ngIf="!isLoading && students.length === 0" class="text-center py-8 text-gray-500">
        <p>No students found.</p>
      </div>

      <form
        *ngIf="!isLoading && students.length > 0"
        [formGroup]="attendanceForm"
        (ngSubmit)="saveAttendance()"
      >
        <div class="mb-4 flex flex-col md:flex-row md:items-center gap-4">
          <div class="flex-1">
            <label class="block text-sm font-medium text-slate-700">Date</label>
            <input
              type="date"
              formControlName="date"
              class="mt-1 block w-full md:w-48 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>
        </div>

        <div class="overflow-x-auto mb-6 rounded-lg border border-gray-200">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-slate-50">
              <tr>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Student Name
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell"
                >
                  Group
                </th>
                <th
                  scope="col"
                  class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200" formArrayName="records">
              <tr
                *ngFor="let record of records.controls; let i = index"
                [formGroupName]="i"
                class="hover:bg-slate-50 transition"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ record.value.studentName }}
                  <div class="sm:hidden text-xs text-gray-500 mt-1">{{ record.value.group }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                  {{ record.value.group }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-sm flex justify-center space-x-2 md:space-x-4"
                >
                  <label class="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      formControlName="status"
                      value="Present"
                      class="form-radio text-green-600 focus:ring-green-500 h-4 w-4"
                    />
                    <span class="ml-1 md:ml-2 text-gray-700 hidden md:inline">Present</span>
                    <span class="md:hidden ml-1 text-green-600 font-bold" title="Present">P</span>
                  </label>
                  <label class="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      formControlName="status"
                      value="Late"
                      class="form-radio text-yellow-500 focus:ring-yellow-400 h-4 w-4"
                    />
                    <span class="ml-1 md:ml-2 text-gray-700 hidden md:inline">Late</span>
                    <span class="md:hidden ml-1 text-yellow-500 font-bold" title="Late">L</span>
                  </label>
                  <label class="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      formControlName="status"
                      value="Absent"
                      class="form-radio text-red-600 focus:ring-red-500 h-4 w-4"
                    />
                    <span class="ml-1 md:ml-2 text-gray-700 hidden md:inline">Absent</span>
                    <span class="md:hidden ml-1 text-red-600 font-bold" title="Absent">A</span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            [disabled]="isSaving || attendanceForm.invalid"
            class="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ isSaving ? 'Saving...' : 'Save Attendance' }}
          </button>
        </div>

        <div
          *ngIf="successMessage"
          class="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-sm text-center"
        >
          {{ successMessage }}
        </div>
      </form>
    </div>
  `,
  styles: ``,
})
export class Attendance implements OnInit {
  private fb = inject(FormBuilder);
  private studentService = inject(StudentService);
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  attendanceForm!: FormGroup;
  students: Student[] = [];
  isLoading = true;
  isSaving = false;
  successMessage = '';

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];

    this.attendanceForm = this.fb.group({
      date: [today, Validators.required],
      records: this.fb.array([]),
    });

    this.fetchStudents();
  }

  get records() {
    return this.attendanceForm.get('records') as FormArray;
  }

  fetchStudents() {
    this.studentService.getStudents().subscribe({
      next: (data) => {
        this.students = data;
        const recordsCtrl = this.records;
        recordsCtrl.clear();

        this.students.forEach((student) => {
          recordsCtrl.push(
            this.fb.group({
              studentId: [student.id],
              studentName: [`${student.firstName} ${student.lastName}`],
              group: [student.group],
              status: ['Present', Validators.required],
            }),
          );
        });

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching students:', err);
        this.isLoading = false;
      },
    });
  }

  async saveAttendance() {
    if (this.attendanceForm.invalid) return;

    this.isSaving = true;
    this.successMessage = '';

    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      console.error('No teacher logged in.');
      this.isSaving = false;
      return;
    }

    const attendanceData = this.attendanceForm.value;
    const records = attendanceData.records;
    const date = attendanceData.date;

    try {
      const attendanceColl = collection(this.firestore, 'attendance');
      const promises = records.map((record: any) => {
        return addDoc(attendanceColl, {
          date: date,
          studentId: record.studentId,
          status: record.status,
          teacherId: currentUser.uid,
          timestamp: new Date(),
        });
      });

      await Promise.all(promises);

      this.successMessage = 'Attendance saved successfully!';
      setTimeout(() => (this.successMessage = ''), 3000);
    } catch (error) {
      console.error('Error saving attendance:', error);
    } finally {
      this.isSaving = false;
    }
  }
}
