import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  doc,
  query,
  deleteDoc,
  setDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  salon?: string;
  englishLevel: 'Starter' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  shift: 'Morning' | 'Afternoon' | 'Evening';
  characterization?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private firestore = inject(Firestore);

  // Fetch all students
  getStudents(): Observable<Student[]> {
    console.log('[DEBUG] StudentService.getStudents called');
    const studentsCollection = collection(this.firestore, 'students');
    const q = query(studentsCollection);
    console.log('[DEBUG] Query type:', q.type || 'query');
    return collectionData(q, { idField: 'id' }) as Observable<Student[]>;
  }

  // Register a new student
  async addStudent(studentData: Partial<Student>): Promise<string> {
    const studentsCollection = collection(this.firestore, 'students');
    const docRef = await addDoc(studentsCollection, studentData);
    console.log('[DEBUG] StudentService.addStudent created id', docRef.id);
    return docRef.id;
  }

  // Create or overwrite a student document using a specific uid (e.g., when a Firebase Auth user is created)
  async addStudentWithUid(uid: string, studentData: Partial<Student>): Promise<void> {
    const studentDocRef = doc(this.firestore, `students/${uid}`);
    await setDoc(studentDocRef, { ...studentData, id: uid });
  }

  // Edit student profile
  async updateStudent(id: string, data: Partial<Student>): Promise<void> {
    const studentDocRef = doc(this.firestore, `students/${id}`);
    await updateDoc(studentDocRef, data);
  }

  // Delete student
  async deleteStudent(id: string): Promise<void> {
    const studentDocRef = doc(this.firestore, `students/${id}`);
    await deleteDoc(studentDocRef);
  }
}
