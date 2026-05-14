import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  updateDoc,
  doc,
  deleteDoc,
  collectionData,
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';

export type AcademicSkill = 'Speaking' | 'Listening' | 'Writing' | 'Grammar' | 'Reading';
export const ACADEMIC_SKILLS: AcademicSkill[] = [
  'Speaking',
  'Listening',
  'Writing',
  'Grammar',
  'Reading',
];

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

    return collectionData(q, { idField: 'id' }).pipe(
      map((grades = []) => {
        const performanceMap = new Map<AcademicSkill, { total: number; count: number }>();

        (grades as SkillGrade[]).forEach((grade) => {
          const current = performanceMap.get(grade.skill) || { total: 0, count: 0 };
          performanceMap.set(grade.skill, {
            total: current.total + grade.grade,
            count: current.count + 1,
          });
        });

        return ACADEMIC_SKILLS.map((skill) => {
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

  getStudentGrades(studentId: string): Observable<SkillGrade[]> {
    const gradesRef = collection(this.firestore, 'grades');
    const q = query(gradesRef, where('studentId', '==', studentId));
    return collectionData(q, { idField: 'id' }) as Observable<SkillGrade[]>;
  }

  // Get all grades
  getAllGrades(): Observable<SkillGrade[]> {
    const gradesRef = collection(this.firestore, 'grades');
    const q = query(gradesRef);
    return collectionData(q, { idField: 'id' }) as Observable<SkillGrade[]>;
  }

  // Update grade
  async updateGrade(id: string, data: Partial<SkillGrade>): Promise<void> {
    const gradeDocRef = doc(this.firestore, `grades/${id}`);
    await updateDoc(gradeDocRef, data);
  }

  // Delete grade
  async deleteGrade(id: string): Promise<void> {
    const gradeDocRef = doc(this.firestore, `grades/${id}`);
    await deleteDoc(gradeDocRef);
  }
}
