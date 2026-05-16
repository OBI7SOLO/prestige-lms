import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
} from '@angular/fire/firestore';
import { query, where } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';

export type AcademicSkill = 'Speaking' | 'Listening' | 'Writing' | 'Grammar' | 'Reading';

export interface SkillPerformance {
  skill: string;
  score?: number;
  average: number;
  status?: string;
}

export interface SkillGrade {
  id?: string;
  studentId: string;
  skill: string;
  grade: number;
  observations?: string;
  timestamp?: any;
}

export interface Student {
  id?: string;
  name: string;
  level: string;
  grades?: Grade[];
}

export interface Grade {
  skill: string;
  score: number | null;
  observation: string;
}

@Injectable({
  providedIn: 'root',
})
export class AcademicService {
  private firestore = inject(Firestore);

  getLevels(): string[] {
    return ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  }

  getStudentsByLevel(level: string): Observable<Student[]> {
    const studentsRef = collection(this.firestore, 'students');
    const q = query(studentsRef, where('level', '==', level));

    return collectionData(q, { idField: 'id' }) as Observable<Student[]>;
  }

  async saveGrades(studentId: string, grades: Grade[]): Promise<void> {
    const studentDocRef = doc(this.firestore, `students/${studentId}`);
    await updateDoc(studentDocRef, { grades });
  }

  async deleteGrade(id: string): Promise<void> {
    const gradeRef = doc(this.firestore, `grades/${id}`);
    await deleteDoc(gradeRef);
  }

  getStudentPerformance(studentId: string): Observable<SkillPerformance[]> {
    return of([]);
  }

  getAllGrades(): Observable<any[]> {
    const gradesRef = collection(this.firestore, 'grades');
    return collectionData(gradesRef, { idField: 'id' });
  }

  async updateGrade(id: string, gradeData: any): Promise<void> {
    const gradeRef = doc(this.firestore, `grades/${id}`);
    await updateDoc(gradeRef, gradeData);
  }

  async saveSkillGrade(gradeData: any): Promise<void> {
    const gradesRef = collection(this.firestore, 'grades');
    await addDoc(gradesRef, gradeData);
  }
}
