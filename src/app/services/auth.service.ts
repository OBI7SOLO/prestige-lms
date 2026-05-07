import { Injectable, inject } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, authState, User } from '@angular/fire/auth';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';

export interface UserProfile {
  uid: string;
  email: string | null;
  role: 'admin' | 'teacher' | 'student';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  // Observable for the current authenticated Firebase user
  currentUser$: Observable<User | null> = authState(this.auth);

  // Observable for the user's custom profile from Firestore
  user$: Observable<UserProfile | null> = this.currentUser$.pipe(
    switchMap((user) => {
      if (!user) {
        return of(null);
      }
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      return docData(userDocRef, { idField: 'uid' }) as Observable<UserProfile>;
    }),
  );

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
