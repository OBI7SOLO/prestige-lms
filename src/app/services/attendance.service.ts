import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Attendance {
  id?: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
  groupId: string;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private firestore = inject(Firestore);

  // Get all attendance records
  getAttendance(): Observable<Attendance[]> {
    const attendanceCollection = collection(this.firestore, 'attendance');
    const attendanceQuery = query(attendanceCollection);
    return collectionData(attendanceQuery, { idField: 'id' }) as Observable<Attendance[]>;
  }

  // Get attendance for specific student
  getStudentAttendance(studentId: string): Observable<Attendance[]> {
    const attendanceCollection = collection(this.firestore, 'attendance');
    const attendanceQuery = query(attendanceCollection, where('studentId', '==', studentId));
    return collectionData(attendanceQuery, { idField: 'id' }) as Observable<Attendance[]>;
  }

  // Add attendance record
  async addAttendance(attendance: Partial<Attendance>): Promise<string> {
    const attendanceCollection = collection(this.firestore, 'attendance');
    const docRef = await addDoc(attendanceCollection, attendance);
    return docRef.id;
  }

  // Update attendance record
  async updateAttendance(id: string, data: Partial<Attendance>): Promise<void> {
    const attendanceDocRef = doc(this.firestore, `attendance/${id}`);
    await updateDoc(attendanceDocRef, data);
  }

  // Delete attendance record
  async deleteAttendance(id: string): Promise<void> {
    const attendanceDocRef = doc(this.firestore, `attendance/${id}`);
    await deleteDoc(attendanceDocRef);
  }
}
