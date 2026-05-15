import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService, AcademicSkill, SkillGrade } from '../../services/academic.service';
import { StudentService, Student } from '../../services/student.service';
import { Observable, combineLatest, map } from 'rxjs';

export interface GradeWithStudent extends SkillGrade {
  studentName?: string;
}

@Component({
  selector: 'app-grades-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-[#0a3161]">Grades Management</h2>
          <p class="text-slate-500">Record and manage student grades by skill.</p>
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
          {{ showForm ? 'Cancel' : 'Add Grade' }}
        </button>
      </div>

      <!-- Add/Edit Form -->
      <div *ngIf="showForm" class="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
        <h3 class="text-lg font-bold text-[#0a3161] mb-4">
          {{ editingId ? 'Edit Grade' : 'Record New Grade' }}
        </h3>
        <form (ngSubmit)="saveGrade()" class="space-y-4">
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
              <label class="block text-sm font-medium text-slate-700">Skill</label>
              <select
                [(ngModel)]="formData.skill"
                name="skill"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              >
                <option value="">Select a skill</option>
                <option *ngFor="let skill of skills" [value]="skill">{{ skill }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Grade (0-5)</label>
              <input
                [(ngModel)]="formData.grade"
                name="grade"
                type="number"
                min="0"
                max="5"
                step="0.1"
                class="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#b31942]"
                required
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Observations</label>
            <textarea
              [(ngModel)]="formData.observations"
              name="observations"
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

      <!-- Grades List -->
      <div *ngIf="gradesWithStudents$ | async as gradesWithStudents" class="space-y-3">
        <div *ngIf="gradesWithStudents.length > 0; else emptyState">
          <div class="grid gap-3">
            <div
              *ngFor="let grade of gradesWithStudents"
              class="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div class="flex justify-between items-start mb-3">
                <div class="flex-1">
                  <h4 class="font-bold text-lg text-[#0a3161]">{{ grade.studentName }}</h4>
                  <div class="flex space-x-4 mt-2 text-sm">
                    <span class="text-slate-600"
                      >Skill: <span class="font-medium">{{ grade.skill }}</span></span
                    >
                    <span [ngClass]="getGradeColorClass(grade.grade)">
                      Grade: <span class="font-bold">{{ grade.grade }}/5</span>
                    </span>
                  </div>
                  <p *ngIf="grade.observations" class="text-sm text-slate-500 mt-2">
                    {{ grade.observations }}
                  </p>
                </div>
                <div class="flex space-x-2">
                  <button
                    (click)="editGrade(grade)"
                    class="px-3 py-1 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>
                  <button
                    (click)="deleteGrade(grade.id!)"
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
              No grades recorded yet. Record one to get started!
            </p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
})
export class GradesManagementComponent implements OnInit {
  private academicService = inject(AcademicService);
  private studentService = inject(StudentService);

  gradesWithStudents$: Observable<GradeWithStudent[]> | undefined;
  students$: Observable<Student[]> | undefined;
  showForm = false;
  editingId: string | null = null;
  skills: AcademicSkill[] = ['Speaking', 'Listening', 'Writing', 'Grammar', 'Reading'];
  formData: Partial<SkillGrade> = {};

  ngOnInit() {
    this.students$ = this.studentService.getStudents();
    this.loadGrades();
  }

  loadGrades() {
    this.gradesWithStudents$ = combineLatest([
      this.academicService.getAllGrades(),
      this.studentService.getStudents(),
    ]).pipe(
      map(([grades, students]) => {
        return grades.map((grade) => {
          const student = students.find((s) => s.id === grade.studentId);
          return {
            ...grade,
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

  editGrade(grade: GradeWithStudent) {
    this.formData = { ...grade };
    this.editingId = grade.id!;
    this.showForm = true;
  }

  async saveGrade() {
    if (!this.formData.studentId || !this.formData.skill || this.formData.grade === undefined) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const gradeData: Partial<SkillGrade> = {
        ...this.formData,
        timestamp: new Date(),
      };

      if (this.editingId) {
        await this.academicService.updateGrade(this.editingId, gradeData);
        alert('Grade updated successfully');
      } else {
        await this.academicService.saveSkillGrade(gradeData);
        alert('Grade saved successfully');
      }
      this.resetForm();
      this.showForm = false;
      this.loadGrades();
    } catch (error) {
      alert('Error saving grade: ' + error);
    }
  }

  async deleteGrade(id: string) {
    if (!confirm('Are you sure you want to delete this grade?')) return;
    try {
      await this.academicService.deleteGrade(id);
      alert('Grade deleted successfully');
      this.loadGrades();
    } catch (error) {
      alert('Error deleting grade: ' + error);
    }
  }

  getGradeColorClass(grade: number): string {
    if (grade >= 4.0) return 'text-green-600 font-medium';
    if (grade >= 3.0) return 'text-yellow-600 font-medium';
    return 'text-red-600 font-medium';
  }
}
