import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttendanceService, Attendance } from '../../services/attendance.service';
import { StudentService, Student } from '../../services/student.service';
import { Observable, combineLatest, map } from 'rxjs';

interface AttendanceWithStudent extends Attendance {
  studentName?: string;
}

@Component({
  selector: 'app-attendance-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-[#0a3161]">Attendance Management</h2>
          <p class="text-slate-500">Record and track student attendance.</p>
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
          {{ showForm ? 'Cancel' : 'Record Attendance' }}
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div *ngIf="showForm" class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-bold text-[#0a3161] mb-4">
          {{ editingId ? 'Edit Attendance' : 'Record Attendance' }}
        </h3>
        <form (ngSubmit)="saveAttendance()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-700">Student</label>
              <select
                [(ngModel)]="formData.studentId"
                name="studentId"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              >
                <option value="">Select a student</option>
                <option *ngFor="let student of students$ | async" [value]="student.id">
                  {{ student.firstName }} {{ student.lastName }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Date</label>
              <input
                [(ngModel)]="formData.date"
                name="date"
                type="date"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Status</label>
              <select
                [(ngModel)]="formData.status"
                name="status"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              >
                <option value="">Select status</option>
                <option value="present">Present</option>
                <option value="absent">Absent</option>
                <option value="late">Late</option>
                <option value="excused">Excused</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Group</label>
              <input
                [(ngModel)]="formData.groupId"
                name="groupId"
                type="text"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              [(ngModel)]="formData.notes"
              name="notes"
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

      <!-- Attendance List -->
      <div *ngIf="attendanceWithStudents$ | async as attendanceWithStudents" class="space-y-3">
        <div *ngIf="attendanceWithStudents.length > 0; else emptyState">
          <div class="grid gap-3">
            <div
              *ngFor="let record of attendanceWithStudents"
              class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <h4 class="font-bold text-lg text-[#0a3161]">{{ record.studentName }}</h4>
                  <div class="flex space-x-4 mt-2 text-sm">
                    <span class="text-slate-600">Date: {{ record.date }}</span>
                    <span [ngClass]="getStatusColorClass(record.status)">
                      <span class="font-bold uppercase">{{ record.status }}</span>
                    </span>
                    <span class="text-slate-600"
                      >Group: <span class="font-medium">{{ record.groupId }}</span></span
                    >
                  </div>
                  <p *ngIf="record.notes" class="text-sm text-slate-500 mt-2">{{ record.notes }}</p>
                </div>
                <div class="flex space-x-2">
                  <button
                    (click)="editAttendance(record)"
                    class="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    (click)="deleteAttendance(record.id!)"
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
              No attendance records yet. Record one to get started!
            </p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class AttendanceManagementComponent implements OnInit {
  private attendanceService = inject(AttendanceService);
  private studentService = inject(StudentService);

  attendanceWithStudents$: Observable<AttendanceWithStudent[]> | undefined;
  students$: Observable<Student[]> | undefined;
  showForm = false;
  editingId: string | null = null;
  formData: Partial<Attendance> = {};

  ngOnInit() {
    this.students$ = this.studentService.getStudents();
    this.loadAttendance();
  }

  loadAttendance() {
    this.attendanceWithStudents$ = combineLatest([
      this.attendanceService.getAttendance(),
      this.studentService.getStudents(),
    ]).pipe(
      map(([attendanceRecords, students]) => {
        return attendanceRecords.map((record) => {
          const student = students.find((s) => s.id === record.studentId);
          return {
            ...record,
            studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
          };
        });
      }),
    );
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) this.resetForm();
  }

  resetForm() {
    this.formData = {};
    this.editingId = null;
  }

  editAttendance(record: AttendanceWithStudent) {
    this.formData = { ...record };
    this.editingId = record.id!;
    this.showForm = true;
  }

  async saveAttendance() {
    if (
      !this.formData.studentId ||
      !this.formData.date ||
      !this.formData.status ||
      !this.formData.groupId
    ) {
      alert('Please fill all required fields');
      return;
    }

    try {
      if (this.editingId) {
        await this.attendanceService.updateAttendance(this.editingId, this.formData);
        alert('Attendance updated successfully');
      } else {
        await this.attendanceService.addAttendance(this.formData);
        alert('Attendance recorded successfully');
      }
      this.resetForm();
      this.showForm = false;
      this.loadAttendance();
    } catch (error) {
      alert('Error saving attendance: ' + error);
    }
  }

  async deleteAttendance(id: string) {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;
    try {
      await this.attendanceService.deleteAttendance(id);
      alert('Attendance record deleted successfully');
      this.loadAttendance();
    } catch (error) {
      alert('Error deleting attendance: ' + error);
    }
  }

  getStatusColorClass(status: string): string {
    switch (status) {
      case 'present':
        return 'text-green-600 font-medium';
      case 'absent':
        return 'text-red-600 font-medium';
      case 'late':
        return 'text-yellow-600 font-medium';
      case 'excused':
        return 'text-blue-600 font-medium';
      default:
        return 'text-slate-600 font-medium';
    }
  }
}
