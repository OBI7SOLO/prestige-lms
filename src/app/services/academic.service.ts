import { Injectable, inject } from '@angular/core';
import { Firestore, collection, addDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export type AcademicSkill = 'Speaking' | 'Listening' | 'Writing' | 'Grammar' | 'Reading';

export interface SkillGrade {
  id?: string;
  studentId: string;
  skill: AcademicSkill;
  grade: number;
  observations: string;
  timestamp: Date;
}

export interface SkillPerformance {
  skill: AcademicSkill;
  average: number;
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class AcademicService {
  private firestore = inject(Firestore);

  async saveSkillGrade(
    studentId: string,
    skill: AcademicSkill,
    grade: number,
    observations: string,
  ): Promise<string> {
    const gradesRef = collection(this.firestore, 'grades');
    const docRef = await addDoc(gradesRef, {
      studentId,
      skill,
      grade,
      observations,
      timestamp: new Date(),
    });
    return docRef.id;
  }

  getStudentPerformance(studentId: string): Observable<SkillPerformance[]> {
    const gradesRef = collection(this.firestore, 'grades');
    const q = query(gradesRef, where('studentId', '==', studentId));

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        const grades = snapshot.docs.map((doc) => doc.data() as SkillGrade);
        const performanceMap = new Map<AcademicSkill, { total: number; count: number }>();

        grades.forEach((g) => {
          const current = performanceMap.get(g.skill) || { total: 0, count: 0 };
          performanceMap.set(g.skill, {
            total: current.total + g.grade,
            count: current.count + 1,
          });
        });

        const skills: AcademicSkill[] = ['Speaking', 'Listening', 'Writing', 'Grammar', 'Reading'];
        return skills.map((skill) => {
          const data = performanceMap.get(skill);
          return {
            skill,
            average: data && data.count > 0 ? Math.round((data.total / data.count) * 10) / 10 : 0,
            count: data?.count || 0,
          };
        });
      }),
    );
  }
}
