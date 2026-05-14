import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcademicService, SkillPerformance } from '../../services/academic.service';
import { AuthService } from '../../services/auth.service';
import { Observable, switchMap, filter } from 'rxjs';
import { EmptyStateComponent } from '../empty-state/empty-state';

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, EmptyStateComponent],
  template: `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-[#0a3161]">My Grades</h2>
          <p class="text-slate-500">View your academic performance across all skills.</p>
        </div>
      </div>

      <!-- Content State -->
      <div *ngIf="performance$ | async as performanceList; else loading">
        <div
          *ngIf="performanceList.length > 0; else emptyState"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <!-- Skill Card -->
          <div
            *ngFor="let skill of performanceList"
            class="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <div class="h-2 w-full" [ngClass]="getScoreColorClass(skill.average, true)"></div>
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <h3 class="font-bold text-lg text-slate-800">{{ skill.skill }}</h3>
                <span class="text-xl font-black" [ngClass]="getScoreColorClass(skill.average)">
                  {{ skill.average | number: '1.1-1' }}
                </span>
              </div>

              <div class="space-y-2">
                <div class="flex justify-between text-sm">
                  <span class="text-slate-500">Progress</span>
                  <span class="font-medium">{{ (skill.average / 5) * 100 }}%</span>
                </div>
                <div class="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full"
                    [ngClass]="getScoreColorClass(skill.average, true)"
                    [style.width.%]="(skill.average / 5) * 100"
                  ></div>
                </div>
              </div>

              <!-- Badges/Feedback -->
              <div class="mt-5 pt-4 border-t border-slate-100 flex items-center">
                <span
                  *ngIf="skill.average >= 4.0"
                  class="inline-flex items-center space-x-1 text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-md"
                >
                  <span>Excellent</span>
                </span>
                <span
                  *ngIf="skill.average >= 3.0 && skill.average < 4.0"
                  class="inline-flex items-center space-x-1 text-xs font-semibold text-yellow-700 bg-yellow-50 px-2.5 py-1 rounded-md"
                >
                  <span>Good</span>
                </span>
                <span
                  *ngIf="skill.average < 3.0"
                  class="inline-flex items-center space-x-1 text-xs font-semibold text-red-700 bg-red-50 px-2.5 py-1 rounded-md"
                >
                  <span>Needs Improvement</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <ng-template #emptyState>
          <app-empty-state
            title="No Grades Available"
            message="You don't have any grades registered yet. Your performance will appear here once teachers evaluate your tasks."
          >
          </app-empty-state>
        </ng-template>
      </div>

      <ng-template #loading>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          <div class="h-48 bg-slate-200 rounded-xl" *ngFor="let i of [1, 2, 3]"></div>
        </div>
      </ng-template>
    </div>
  `,
})
export class GradesComponent implements OnInit {
  private auth = inject(AuthService);
  private academicService = inject(AcademicService);

  performance$: Observable<SkillPerformance[]> | undefined;

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
