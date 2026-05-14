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
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  group: string;
  salon: string;
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
    const studentsCollection = collection(this.firestore, 'students');
    const studentsQuery = query(studentsCollection);
    return collectionData(studentsQuery, { idField: 'id' }) as Observable<Student[]>;
  }

  // Register a new student
  async addStudent(studentData: Partial<Student>): Promise<string> {
    const studentsCollection = collection(this.firestore, 'students');
    const docRef = await addDoc(studentsCollection, studentData);
    return docRef.id;
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
