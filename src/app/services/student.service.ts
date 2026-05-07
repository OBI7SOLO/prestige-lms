import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  updateDoc,
  doc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Student {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  group: string;
  characterization?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private firestore = inject(Firestore);
  private studentsCollection = collection(this.firestore, 'students');

  // Fetch all students
  getStudents(): Observable<Student[]> {
    return collectionData(this.studentsCollection, { idField: 'id' }) as Observable<Student[]>;
  }

  // Register a new student
  async addStudent(studentData: Partial<Student>): Promise<string> {
    const docRef = await addDoc(this.studentsCollection, studentData);
    return docRef.id;
  }

  // Edit student profile
  async updateStudent(id: string, data: Partial<Student>): Promise<void> {
    const studentDocRef = doc(this.firestore, `students/${id}`);
    await updateDoc(studentDocRef, data);
  }
}
