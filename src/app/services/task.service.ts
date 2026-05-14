import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  collectionData,
  updateDoc,
  doc,
  deleteDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Task {
  id?: string;
  title: string;
  description: string;
  dueDate: string;
  link?: string;
  teacherId: string;
  groupId: string;
  createdAt: string;
  status?: 'completed' | 'pending' | 'in-progress' | 'cancelled';
}

export interface TaskSubmission {
  id?: string;
  taskId: string;
  studentId: string;
  link?: string;
  status: 'Pending' | 'Submitted' | 'Late';
  submittedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private firestore = inject(Firestore);

  createTask(task: Task): Promise<any> {
    const tasksRef = collection(this.firestore, 'tasks');
    return addDoc(tasksRef, task);
  }

  getTasks(): Observable<Task[]> {
    const tasksRef = collection(this.firestore, 'tasks');
    return collectionData(tasksRef, { idField: 'id' }) as Observable<Task[]>;
  }

  submitTask(submission: Partial<TaskSubmission>): Promise<any> {
    const subRef = collection(this.firestore, 'submissions');
    return addDoc(subRef, submission);
  }

  updateTask(id: string, data: Partial<Task>): Promise<void> {
    const taskDocRef = doc(this.firestore, `tasks/${id}`);
    return updateDoc(taskDocRef, data);
  }

  deleteTask(id: string): Promise<void> {
    const taskDocRef = doc(this.firestore, `tasks/${id}`);
    return deleteDoc(taskDocRef);
  }
}
