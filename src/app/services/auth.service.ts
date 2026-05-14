import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  authState,
  User,
} from '@angular/fire/auth';
import {
  Firestore,
  doc,
  docData,
  doc as firestoreDoc,
  setDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable, of, switchMap, map, catchError } from 'rxjs';

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
      return docData(userDocRef, { idField: 'uid' }).pipe(
        map((profile) => {
          if (profile) {
            return profile as UserProfile;
          }

          // Fallback profile avoids blocking UI if Firestore profile is missing.
          return {
            uid: user.uid,
            email: user.email,
            role: 'student' as const,
          };
        }),
        catchError(() =>
          of({
            uid: user.uid,
            email: user.email,
            role: 'student' as const,
          }),
        ),
      );
    }),
  );

  async login(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, password);
  }

  async register(
    email: string,
    password: string,
    role: UserProfile['role'] = 'student',
  ): Promise<void> {
    const credential = await createUserWithEmailAndPassword(this.auth, email, password);
    const profileRef = firestoreDoc(this.firestore, `users/${credential.user.uid}`);

    await setDoc(profileRef, {
      uid: credential.user.uid,
      email: credential.user.email,
      role,
      createdAt: serverTimestamp(),
    });
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
  }
}
