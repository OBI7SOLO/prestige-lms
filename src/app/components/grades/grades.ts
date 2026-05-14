import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { combineLatest, map, of, switchMap } from 'rxjs';
import {
  ACADEMIC_SKILLS,
  AcademicService,
  AcademicSkill,
  SkillGrade,
  SkillPerformance,
} from '../../services/academic.service';
import { AuthService, UserProfile } from '../../services/auth.service';
import { Student, StudentService } from '../../services/student.service';
import { EmptyStateComponent } from '../empty-state/empty-state';

interface SkillDraft {
  grade: number | null;
  observations: string;
}

interface TeacherViewModel {
  performance: SkillPerformance[];
  latestNotes: Partial<Record<AcademicSkill, SkillGrade>>;
}

const createEmptyDrafts = (): Record<AcademicSkill, SkillDraft> =>
  ACADEMIC_SKILLS.reduce(
    (drafts, skill) => ({
      ...drafts,
      [skill]: { grade: null, observations: '' },
    }),
    {} as Record<AcademicSkill, SkillDraft>,
  );

@Component({
  selector: 'app-grades',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 class="text-2xl font-bold text-[#0a3161]">
            {{ isTeacher() ? 'Teacher Grades' : 'My Grades' }}
          </h2>
          <p class="text-slate-500">
            {{
              isTeacher()
                ? 'Pick an English level, select a student, and add notes by skill.'
                : 'View your academic performance across all skills.'
            }}
          </p>
        </div>
        @if (isTeacher()) {
          <span
            class="inline-flex w-fit rounded-full bg-[#0a3161] px-3 py-1 text-xs font-semibold text-white"
          >
            Teacher mode
          </span>
        }
      </div>

      @if (isTeacher()) {
        <section class="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">English level</label>
              <select
                class="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-[#b31942] focus:outline-none focus:ring-2 focus:ring-[#b31942]/20"
                [value]="selectedLevel()"
                (change)="onLevelChange($event)"
              >
                <option value="">Select a level</option>
                @for (level of englishLevels; track level) {
                  <option [value]="level">{{ level }}</option>
                }
              </select>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-slate-700">Student</label>
              <select
                class="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-[#b31942] focus:outline-none focus:ring-2 focus:ring-[#b31942]/20 disabled:bg-slate-100"
                [disabled]="!selectedLevel()"
                [value]="selectedStudentId()"
                (change)="onStudentChange($event)"
              >
                <option value="">
                  {{ selectedLevel() ? 'Select a student' : 'Choose a level first' }}
                </option>
                @for (student of filteredStudents(); track student.id) {
                  <option [value]="student.id">
                    {{ student.firstName }} {{ student.lastName }}
                  </option>
                }
              </select>
            </div>
          </div>

          @if (!selectedLevel()) {
            <p class="text-sm text-slate-500">
              Start with the level, then the student list will appear.
            </p>
          }
        </section>

        @if (selectedStudent(); as student) {
          @if (teacherView$ | async; as teacherView) {
            @if (teacherView.performance.length > 0) {
              <div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
                @for (skill of skills; track skill) {
                  <article
                    class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                  >
                    <div
                      class="h-2 w-full"
                      [class]="
                        getScoreColorClass(getSkillAverage(teacherView.performance, skill), true)
                      "
                    ></div>
                    <div class="space-y-4 p-6">
                      <div class="flex items-start justify-between gap-3">
                        <div>
                          <h3 class="text-lg font-bold text-slate-800">{{ skill }}</h3>
                          <p class="text-sm text-slate-500">
                            {{ student.firstName }} {{ student.lastName }} ·
                            {{ student.englishLevel }}
                          </p>
                        </div>
                        <span
                          class="text-xl font-black"
                          [class]="
                            getScoreColorClass(getSkillAverage(teacherView.performance, skill))
                          "
                        >
                          {{ getSkillAverage(teacherView.performance, skill) | number: '1.1-1' }}
                        </span>
                      </div>

                      <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                          <span class="text-slate-500">Progress</span>
                          <span class="font-medium"
                            >{{
                              scoreToPercent(getSkillAverage(teacherView.performance, skill))
                            }}%</span
                          >
                        </div>
                        <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            class="h-full rounded-full"
                            [class]="
                              getScoreColorClass(
                                getSkillAverage(teacherView.performance, skill),
                                true
                              )
                            "
                            [style.width.%]="
                              scoreToPercent(getSkillAverage(teacherView.performance, skill))
                            "
                          ></div>
                        </div>
                        <p class="text-sm text-slate-500">
                          {{ getLatestNoteText(teacherView.latestNotes, skill) }}
                        </p>
                      </div>

                      <div class="space-y-3 border-t border-slate-100 pt-4">
                        <div class="grid gap-3 md:grid-cols-2">
                          <label class="space-y-1">
                            <span class="block text-sm font-medium text-slate-700">New grade</span>
                            <input
                              type="number"
                              min="0"
                              max="5"
                              step="0.1"
                              class="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-[#b31942] focus:outline-none focus:ring-2 focus:ring-[#b31942]/20"
                              [value]="draft(skill).grade ?? ''"
                              (input)="onDraftGradeInput(skill, $event)"
                            />
                          </label>
                          <label class="space-y-1">
                            <span class="block text-sm font-medium text-slate-700">Note</span>
                            <textarea
                              rows="3"
                              class="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-[#b31942] focus:outline-none focus:ring-2 focus:ring-[#b31942]/20"
                              [value]="draft(skill).observations"
                              (input)="onDraftObservationInput(skill, $event)"
                            ></textarea>
                          </label>
                        </div>
                        <div class="flex justify-end">
                          <button
                            type="button"
                            class="rounded-md bg-[#0a3161] px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-900"
                            (click)="saveSkillNote(skill)"
                          >
                            Save note
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                }
              </div>
            } @else {
              <app-empty-state
                title="No grades for this student"
                message="Add the first note for any English skill to start tracking progress."
              ></app-empty-state>
            }
          }
        } @else {
          <app-empty-state
            title="Choose a student"
            message="Select an English level and then a student to review and add grades."
          ></app-empty-state>
        }
      } @else {
        @if (performance$ | async; as performanceList) {
          @if (performanceList.length > 0) {
            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              @for (skill of performanceList; track skill.skill) {
                <article
                  class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div class="h-2 w-full" [class]="getScoreColorClass(skill.average, true)"></div>
                  <div class="space-y-4 p-6">
                    <div class="flex items-start justify-between gap-3">
                      <h3 class="text-lg font-bold text-slate-800">{{ skill.skill }}</h3>
                      <span class="text-xl font-black" [class]="getScoreColorClass(skill.average)">
                        {{ skill.average | number: '1.1-1' }}
                      </span>
                    </div>
                    <div class="space-y-2">
                      <div class="flex justify-between text-sm">
                        <span class="text-slate-500">Progress</span>
                        <span class="font-medium">{{ scoreToPercent(skill.average) }}%</span>
                      </div>
                      <div class="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          class="h-full rounded-full"
                          [class]="getScoreColorClass(skill.average, true)"
                          [style.width.%]="scoreToPercent(skill.average)"
                        ></div>
                      </div>
                    </div>
                    <div class="flex items-center">
                      @if (skill.average >= 4) {
                        <span
                          class="rounded-md bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700"
                          >Excellent</span
                        >
                      } @else if (skill.average >= 3) {
                        <span
                          class="rounded-md bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700"
                          >Good</span
                        >
                      } @else {
                        <span
                          class="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700"
                          >Needs Improvement</span
                        >
                      }
                    </div>
                  </div>
                </article>
              }
            </div>
          } @else {
            <app-empty-state
              title="No Grades Available"
              message="You don't have any grades registered yet. Your performance will appear here once teachers evaluate your tasks."
            ></app-empty-state>
          }
        } @else {
          <div class="grid grid-cols-1 gap-6 animate-pulse md:grid-cols-3">
            @for (item of loadingSlots; track item) {
              <div class="h-48 rounded-xl bg-slate-200"></div>
            }
          </div>
        }
      }
    </div>
  `,
})
export class GradesComponent {
  private auth = inject(AuthService);
  private academicService = inject(AcademicService);
  private studentService = inject(StudentService);

  readonly skills = ACADEMIC_SKILLS;
  readonly englishLevels: Student['englishLevel'][] = ['Starter', 'A1', 'A2', 'B1', 'B2', 'C1'];
  readonly loadingSlots = [1, 2, 3];

  readonly currentUser = toSignal(this.auth.user$, { initialValue: null as UserProfile | null });
  readonly students = toSignal(this.studentService.getStudents(), {
    initialValue: [] as Student[],
  });

  readonly selectedLevel = signal<Student['englishLevel'] | ''>('');
  readonly selectedStudentId = signal('');
  readonly drafts = signal(createEmptyDrafts());

  readonly isTeacher = computed(() => this.currentUser()?.role === 'teacher');
  readonly filteredStudents = computed(() => {
    const level = this.selectedLevel();
    if (!level) {
      return [] as Student[];
    }

    return this.students().filter((student) => student.englishLevel === level);
  });
  readonly selectedStudent = computed(
    () => this.students().find((student) => student.id === this.selectedStudentId()) ?? null,
  );

  readonly performance$ = toObservable(this.currentUser).pipe(
    switchMap((user) =>
      user?.role === 'student' ? this.academicService.getStudentPerformance(user.uid) : of([]),
    ),
  );

  readonly teacherView$ = toObservable(this.selectedStudentId).pipe(
    switchMap((studentId) => {
      if (!studentId) {
        return of({ performance: [], latestNotes: {} } as TeacherViewModel);
      }

      return combineLatest([
        this.academicService.getStudentPerformance(studentId),
        this.academicService.getStudentGrades(studentId),
      ]).pipe(
        map(([performance, grades]) => ({
          performance,
          latestNotes: this.buildLatestNotes(grades),
        })),
      );
    }),
  );

  onLevelChange(event: Event) {
    const level = (event.target as HTMLSelectElement).value as Student['englishLevel'] | '';
    this.selectedLevel.set(level);
    this.resetSelection();
  }

  onStudentChange(event: Event) {
    this.selectedStudentId.set((event.target as HTMLSelectElement).value);
    this.drafts.set(createEmptyDrafts());
  }

  draft(skill: AcademicSkill): SkillDraft {
    return this.drafts()[skill];
  }

  onDraftGradeInput(skill: AcademicSkill, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.updateDraft(skill, { grade: value === '' ? null : Number(value) });
  }

  onDraftObservationInput(skill: AcademicSkill, event: Event) {
    this.updateDraft(skill, { observations: (event.target as HTMLTextAreaElement).value });
  }

  async saveSkillNote(skill: AcademicSkill) {
    const studentId = this.selectedStudentId();
    const draft = this.draft(skill);

    if (!studentId || draft.grade === null || Number.isNaN(draft.grade)) {
      alert('Please choose a student and enter a valid grade.');
      return;
    }

    await this.academicService.saveSkillGrade(
      studentId,
      skill,
      draft.grade,
      draft.observations.trim(),
    );
    this.updateDraft(skill, { grade: null, observations: '' });
  }

  getSkillAverage(performance: SkillPerformance[], skill: AcademicSkill): number {
    return performance.find((item) => item.skill === skill)?.average || 0;
  }

  scoreToPercent(score: number): number {
    return Math.round((score / 5) * 100);
  }

  getScoreColorClass(score: number, isBackground = false): string {
    if (score >= 4) return isBackground ? 'bg-green-500' : 'text-green-600';
    if (score >= 3) return isBackground ? 'bg-yellow-500' : 'text-yellow-600';
    return isBackground ? 'bg-red-500' : 'text-red-600';
  }

  getLatestNoteText(
    latestNotes: Partial<Record<AcademicSkill, SkillGrade>>,
    skill: AcademicSkill,
  ): string {
    const latestNote = latestNotes[skill];
    return latestNote?.observations
      ? `Latest note: ${latestNote.observations}`
      : 'No notes yet for this skill.';
  }

  private resetSelection() {
    this.selectedStudentId.set('');
    this.drafts.set(createEmptyDrafts());
  }

  private updateDraft(skill: AcademicSkill, patch: Partial<SkillDraft>) {
    this.drafts.update((drafts) => ({
      ...drafts,
      [skill]: { ...drafts[skill], ...patch },
    }));
  }

  private buildLatestNotes(grades: SkillGrade[]): Partial<Record<AcademicSkill, SkillGrade>> {
    return grades.reduce(
      (latestNotes, grade) => {
        const current = latestNotes[grade.skill];
        if (
          !current ||
          this.getTimestamp(grade.timestamp) >= this.getTimestamp(current.timestamp)
        ) {
          latestNotes[grade.skill] = grade;
        }

        return latestNotes;
      },
      {} as Partial<Record<AcademicSkill, SkillGrade>>,
    );
  }

  private getTimestamp(value: SkillGrade['timestamp']): number {
    if (value instanceof Date) {
      return value.getTime();
    }

    if (value && typeof value === 'object' && 'toDate' in value) {
      return value.toDate().getTime();
    }

    return new Date(value as unknown as string | number).getTime();
  }

  ngOnInit() {
    this.performance$ = this.auth.user$.pipe(
      filter((user) => !!user),
      switchMap((user) => this.academicService.getStudentPerformance(user!.uid)),
    );
  }

  getScoreColorClass(score: number, isBackground: boolean = false): string {
    if (score >= 4.0) return isBackground ? 'bg-green-500' : 'text-green-600';
    if (score >= 3.0) return isBackground ? 'bg-yellow-500' : 'text-yellow-600';
    return isBackground ? 'bg-red-500' : 'text-red-600';
  }
}
